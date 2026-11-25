import Constants from 'expo-constants';
import * as Application from 'expo-application';
import * as FileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';
import { Platform } from 'react-native';
import { sha256 } from 'js-sha256';
import { supabase } from '@/lib/supabase';

export type UpdateStatus =
  | 'idle'
  | 'checking'
  | 'downloading'
  | 'ready'
  | 'installing'
  | 'up-to-date'
  | 'error';

export type UpdateErrorCode =
  | 'network'
  | 'hash'
  | 'storage'
  | 'installer'
  | 'unsupported'
  | 'unknown';

export interface ReleaseInfo {
  version: string;
  versionCode: number;
  apkFilename: string;
  apkSize: number;
  apkHash: string;
  releaseNotes: string;
  isForceUpdate: boolean;
  minVersion: string | null;
  publishedAt: string;
  downloadUrl: string;
}

export interface InstalledVersion {
  version: string;
  versionCode: number;
}

export class UpdateError extends Error {
  code: UpdateErrorCode;

  constructor(code: UpdateErrorCode, message: string) {
    super(message);
    this.code = code;
    this.name = 'UpdateError';
  }
}

const CHUNK_SIZE = 512 * 1024;
const MAX_ATTEMPTS = 3;
const UPDATES_FOLDER = `${FileSystem.documentDirectory}updates/`;

// Application.nativeApplicationVersion is the version baked into the installed APK.
export function getInstalledVersion(): InstalledVersion {
  const version =
    Application.nativeApplicationVersion ?? Constants.expoConfig?.version ?? '0.0.0';
  const versionCode = Number(Application.nativeBuildVersion ?? 0);
  return { version, versionCode: Number.isFinite(versionCode) ? versionCode : 0 };
}

function semverParts(version: string): number[] {
  return version
    .split(/[.+-]/)
    .slice(0, 3)
    .map((part) => Number(part) || 0);
}

export function compareVersions(a: string, b: string): number {
  const left = semverParts(a);
  const right = semverParts(b);
  for (let index = 0; index < 3; index += 1) {
    if ((left[index] ?? 0) !== (right[index] ?? 0)) {
      return (left[index] ?? 0) > (right[index] ?? 0) ? 1 : -1;
    }
  }
  return 0;
}

export async function fetchLatestRelease(): Promise<ReleaseInfo | null> {
  const { data, error } = await supabase
    .from('app_releases')
    .select(
      'version, version_code, apk_filename, apk_size, apk_hash, release_notes, is_force_update, min_version, published_at',
    )
    .order('version_code', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new UpdateError('network', error.message);
  if (!data) return null;

  const { data: publicUrl } = supabase.storage.from('apk').getPublicUrl(data.apk_filename);

  return {
    version: data.version,
    versionCode: data.version_code,
    apkFilename: data.apk_filename,
    apkSize: Number(data.apk_size),
    apkHash: data.apk_hash,
    releaseNotes: data.release_notes ?? '',
    isForceUpdate: Boolean(data.is_force_update),
    minVersion: data.min_version ?? null,
    publishedAt: data.published_at,
    downloadUrl: publicUrl.publicUrl,
  };
}

export function isUpdateAvailable(release: ReleaseInfo, installed: InstalledVersion): boolean {
  if (installed.versionCode > 0) return release.versionCode > installed.versionCode;
  return compareVersions(release.version, installed.version) > 0;
}

function decodeBase64(input: string): Uint8Array {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const clean = input.replace(/[^A-Za-z0-9+/]/g, '');
  const length = Math.floor((clean.length * 3) / 4);
  const bytes = new Uint8Array(length);
  let byteIndex = 0;

  for (let index = 0; index < clean.length; index += 4) {
    const a = alphabet.indexOf(clean[index]);
    const b = alphabet.indexOf(clean[index + 1] ?? '');
    const c = alphabet.indexOf(clean[index + 2] ?? '');
    const d = alphabet.indexOf(clean[index + 3] ?? '');

    if (byteIndex < length) bytes[byteIndex++] = (a << 2) | (b >> 4);
    if (c >= 0 && byteIndex < length) bytes[byteIndex++] = ((b & 15) << 4) | (c >> 2);
    if (d >= 0 && byteIndex < length) bytes[byteIndex++] = ((c & 3) << 6) | d;
  }

  return bytes;
}

/**
 * Hashes the APK in 512 KB slices so a ~100 MB file never has to be held in memory
 * as a single base64 string.
 */
export async function sha256OfFile(fileUri: string): Promise<string> {
  const hasher = sha256.create();
  const info = await FileSystem.getInfoAsync(fileUri);
  const size = info.exists ? ((info as { size?: number }).size ?? 0) : 0;

  if (Platform.OS !== 'android' || size <= 0) {
    const base64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    hasher.update(decodeBase64(base64));
    return hasher.hex();
  }

  for (let position = 0; position < size; position += CHUNK_SIZE) {
    const length = Math.min(CHUNK_SIZE, size - position);
    const chunk = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
      position,
      length,
    });
    hasher.update(decodeBase64(chunk));
  }

  return hasher.hex();
}

async function downloadOnce(
  url: string,
  fileUri: string,
  onProgress?: (fraction: number) => void,
): Promise<void> {
  const resumable = FileSystem.createDownloadResumable(url, fileUri, {}, (progress) => {
    const total = progress.totalBytesExpectedToWrite || 0;
    if (total > 0) onProgress?.(Math.min(progress.totalBytesWritten / total, 1));
  });

  const result = await resumable.downloadAsync();
  if (!result?.uri) throw new UpdateError('network', 'The download stopped before finishing.');
}

async function downloadWithRetry(
  url: string,
  fileUri: string,
  onProgress?: (fraction: number) => void,
): Promise<void> {
  let lastError: unknown = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      await downloadOnce(url, fileUri, onProgress);
      return;
    } catch (error) {
      lastError = error;
      await FileSystem.deleteAsync(fileUri, { idempotent: true }).catch(() => undefined);
      if (attempt < MAX_ATTEMPTS) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 1200));
      }
    }
  }

  const message = lastError instanceof Error ? lastError.message : 'Unknown download error.';
  throw new UpdateError(
    'network',
    `Download failed after ${MAX_ATTEMPTS} attempts (${message}). Check your connection and try again.`,
  );
}

export async function downloadAndVerify(
  release: ReleaseInfo,
  onProgress?: (fraction: number) => void,
): Promise<string> {
  if (Platform.OS !== 'android') {
    throw new UpdateError('unsupported', 'In-app updates are only available on Android.');
  }

  await FileSystem.makeDirectoryAsync(UPDATES_FOLDER, { intermediates: true }).catch(
    () => undefined,
  );

  const free = await FileSystem.getFreeDiskStorageAsync().catch(() => Number.POSITIVE_INFINITY);
  if (Number.isFinite(free) && free < release.apkSize * 1.2) {
    throw new UpdateError(
      'storage',
      'Not enough free storage for this update. Free up space and try again.',
    );
  }

  const fileUri = `${UPDATES_FOLDER}${release.apkFilename}`;
  const existing = await FileSystem.getInfoAsync(fileUri);

  if (!existing.exists) {
    try {
      await downloadWithRetry(release.downloadUrl, fileUri, onProgress);
    } catch (error) {
      if (error instanceof UpdateError) throw error;
      throw new UpdateError('storage', 'The APK could not be saved on this device.');
    }
  }

  let hash: string;
  try {
    hash = await sha256OfFile(fileUri);
  } catch (error) {
    await FileSystem.deleteAsync(fileUri, { idempotent: true }).catch(() => undefined);
    const message = error instanceof Error ? error.message : 'hash read failed';
    throw new UpdateError('hash', `The downloaded file could not be verified (${message}).`);
  }

  if (hash !== release.apkHash.toLowerCase()) {
    await FileSystem.deleteAsync(fileUri, { idempotent: true }).catch(() => undefined);
    throw new UpdateError(
      'hash',
      'The downloaded APK does not match the published SHA-256 hash. The file was deleted.',
    );
  }

  return fileUri;
}

export async function installUpdate(fileUri: string): Promise<void> {
  if (Platform.OS !== 'android') {
    throw new UpdateError('unsupported', 'In-app updates are only available on Android.');
  }

  try {
    const contentUri = await FileSystem.getContentUriAsync(fileUri);
    await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
      data: contentUri,
      // FLAG_GRANT_READ_URI_PERMISSION
      flags: 1,
      type: 'application/vnd.android.package-archive',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'installer failed';
    throw new UpdateError(
      'installer',
      `Android could not open the installer (${message}). Allow "Install unknown apps" for My Duit Gw and try again.`,
    );
  }
}

export function messageForError(error: unknown): string {
  if (error instanceof UpdateError) return error.message;
  if (error instanceof Error) return error.message;
  return 'Something went wrong while checking for updates.';
}
