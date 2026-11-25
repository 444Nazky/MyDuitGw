#!/usr/bin/env node
/**
 * Publish an APK to the Supabase release channel.
 *
 * Reads versionName/versionCode from the APK with aapt2 (never from the file name),
 * refuses to reuse a versionCode, hashes the file with SHA-256, uploads it to the
 * public `apk` bucket and records the release in `app_releases`.
 *
 * Usage:
 *   SUPABASE_SERVICE_ROLE_KEY=... node tools/publish-release.mjs \
 *     --apk MyDuitGw-v1.0.5.apk --notes "What changed" [--force] [--min-version 1.0.0]
 */
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function loadEnv(file) {
  if (!existsSync(file)) return {};
  const values = {};
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!match) continue;
    values[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
  }
  return values;
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if (next && !next.startsWith('--')) {
      args[key] = next;
      i += 1;
    } else {
      args[key] = true;
    }
  }
  return args;
}

function fail(message) {
  console.error(`✖ ${message}`);
  process.exit(1);
}

function findAapt2() {
  const roots = [
    process.env.ANDROID_HOME,
    process.env.ANDROID_SDK_ROOT,
    process.env.HOME ? join(process.env.HOME, 'android-sdk') : null,
    process.env.HOME ? join(process.env.HOME, 'Android', 'Sdk') : null,
  ].filter(Boolean);

  for (const root of roots) {
    const buildTools = join(root, 'build-tools');
    if (!existsSync(buildTools)) continue;
    const versions = readdirSync(buildTools).sort((a, b) =>
      b.localeCompare(a, undefined, { numeric: true }),
    );
    for (const version of versions) {
      const candidate = join(buildTools, version, 'aapt2');
      if (existsSync(candidate)) return candidate;
    }
  }
  return 'aapt2';
}

function readApkInfo(apkPath) {
  const aapt2 = findAapt2();
  let output;
  try {
    output = execFileSync(aapt2, ['dump', 'badging', apkPath], { encoding: 'utf8' });
  } catch {
    fail(`Could not read the APK with aapt2 (${aapt2}). Is Android build-tools installed?`);
  }
  const line = output.split('\n').find((entry) => entry.startsWith('package:'));
  if (!line) fail('aapt2 output has no package line; the file is not a valid APK.');

  const versionName = /versionName='([^']*)'/.exec(line)?.[1] ?? null;
  const versionCode = Number(/versionCode='(\d+)'/.exec(line)?.[1] ?? NaN);
  const packageName = /name='([^']*)'/.exec(line)?.[1] ?? null;

  if (!versionName || Number.isNaN(versionCode)) {
    fail('Could not read versionName/versionCode from the APK.');
  }
  return { versionName, versionCode, packageName };
}

const args = parseArgs(process.argv.slice(2));
const env = { ...loadEnv(join(ROOT, '.env')), ...loadEnv(join(ROOT, 'tools', '.env.publish')) };

const supabaseUrl = process.env.SUPABASE_URL || env.SUPABASE_URL || env.EXPO_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) fail('SUPABASE_URL is missing (env or tools/.env.publish).');
if (!serviceKey) fail('SUPABASE_SERVICE_ROLE_KEY is missing — publishing needs the service role key.');

const apkPath = resolve(ROOT, typeof args.apk === 'string' ? args.apk : 'MyDuitGw-v1.0.5.apk');
if (!existsSync(apkPath)) fail(`APK not found: ${apkPath}`);

const info = readApkInfo(apkPath);
if (args['expect-version'] && String(args['expect-version']) !== info.versionName) {
  fail(
    `versionName mismatch: the APK says ${info.versionName} but --expect-version says ${args['expect-version']}.`,
  );
}
if (!/^\d+\.\d+\.\d+([.-][0-9A-Za-z.-]+)?$/.test(info.versionName)) {
  fail(`versionName "${info.versionName}" is not valid semver.`);
}

const buffer = readFileSync(apkPath);
const apkHash = createHash('sha256').update(buffer).digest('hex');
const apkSize = buffer.length;
const apkFilename = `app-${info.versionName}.apk`;

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data: previous, error: previousError } = await supabase
  .from('app_releases')
  .select('version, version_code, apk_hash')
  .order('version_code', { ascending: false })
  .limit(1)
  .maybeSingle();

if (previousError) fail(`Could not read app_releases: ${previousError.message}`);

if (previous) {
  if (info.versionCode === previous.version_code) {
    fail(
      previous.apk_hash === apkHash
        ? `versionCode ${info.versionCode} (${info.versionName}) is already published with the same APK.`
        : `versionCode ${info.versionCode} is already published with a different APK. Bump versionCode.`,
    );
  }
  if (info.versionCode < previous.version_code) {
    fail(
      `versionCode ${info.versionCode} is lower than the latest published code ${previous.version_code}.`,
    );
  }
}

const { error: uploadError } = await supabase.storage
  .from('apk')
  .upload(apkFilename, buffer, {
    contentType: 'application/vnd.android.package-archive',
    cacheControl: '3600',
    upsert: false,
  });

if (uploadError) {
  fail(`Upload failed: ${uploadError.message} (if the object exists, that version was already uploaded).`);
}

const { error: insertError } = await supabase.from('app_releases').insert({
  version: info.versionName,
  version_code: info.versionCode,
  apk_filename: apkFilename,
  apk_size: apkSize,
  apk_hash: apkHash,
  release_notes: typeof args.notes === 'string' ? args.notes : '',
  is_force_update: Boolean(args.force),
  min_version: typeof args['min-version'] === 'string' ? args['min-version'] : null,
});

if (insertError) {
  fail(`Release row failed: ${insertError.message}`);
}

const { data: publicUrl } = supabase.storage.from('apk').getPublicUrl(apkFilename);

console.log(
  JSON.stringify(
    {
      published: true,
      package: info.packageName,
      version: info.versionName,
      versionCode: info.versionCode,
      apkSize,
      apkHash,
      isForceUpdate: Boolean(args.force),
      minVersion: typeof args['min-version'] === 'string' ? args['min-version'] : null,
      downloadUrl: publicUrl?.publicUrl ?? null,
    },
    null,
    2,
  ),
);
