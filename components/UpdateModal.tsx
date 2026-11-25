import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { Download, ShieldCheck, TriangleAlert } from 'lucide-react-native';
import {
  compareVersions,
  downloadAndVerify,
  fetchLatestRelease,
  getInstalledVersion,
  installUpdate,
  isUpdateAvailable,
  messageForError,
  type ReleaseInfo,
  type UpdateStatus,
} from '@/lib/updates';

interface UpdateModalProps {
  visible: boolean;
  onClose: () => void;
}

function formatSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '—';
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function UpdateModal({ visible, onClose }: UpdateModalProps) {
  const [status, setStatus] = useState<UpdateStatus>('idle');
  const [release, setRelease] = useState<ReleaseInfo | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [localApk, setLocalApk] = useState<string | null>(null);
  const installed = getInstalledVersion();

  const check = useCallback(async () => {
    setStatus('checking');
    setError(null);
    setProgress(0);
    setLocalApk(null);

    try {
      const latest = await fetchLatestRelease();
      if (!latest) {
        setStatus('error');
        setError('No release has been published yet.');
        return;
      }
      setRelease(latest);
      setStatus(isUpdateAvailable(latest, installed) ? 'idle' : 'up-to-date');
    } catch (cause) {
      setStatus('error');
      setError(messageForError(cause));
    }
  }, [installed.version, installed.versionCode]);

  useEffect(() => {
    if (visible) void check();
  }, [visible, check]);

  // Coming back from the installer: if the version did not move, say so plainly.
  useEffect(() => {
    if (!visible || !release) return;
    if (status === 'installing' && compareVersions(release.version, installed.version) !== 0) {
      setStatus('ready');
    }
  }, [visible, release, status, installed.version]);

  const startDownload = async () => {
    if (!release) return;
    setStatus('downloading');
    setError(null);
    setProgress(0);
    try {
      const fileUri = await downloadAndVerify(release, setProgress);
      setLocalApk(fileUri);
      setStatus('ready');
    } catch (cause) {
      setStatus('error');
      setError(messageForError(cause));
    }
  };

  const startInstall = async () => {
    if (!localApk) return;
    setStatus('installing');
    setError(null);
    try {
      await installUpdate(localApk);
    } catch (cause) {
      setStatus('error');
      setError(messageForError(cause));
    }
  };

  const forced = Boolean(release?.isForceUpdate) && status !== 'up-to-date';
  const dismissable = !forced;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {
        if (dismissable) onClose();
      }}
    >
      <View className="flex-1 items-center justify-center bg-black/70 px-6">
        <View className="w-full max-w-[420px] overflow-hidden rounded-[26px] border border-white/[0.1] bg-[#141416]/80 p-6">
          <View className="flex-row items-center gap-2.5">
            <ShieldCheck size={19} color="#9B87FF" strokeWidth={1.8} />
            <Text className="text-[17px] font-semibold text-ink">App update</Text>
          </View>

          <Text className="mt-1.5 text-[12.5px] text-muted">
            Installed: v{installed.version}
            {installed.versionCode > 0 ? ` (build ${installed.versionCode})` : ''}
          </Text>

          {status === 'checking' ? (
            <View className="mt-6 flex-row items-center gap-3">
              <ActivityIndicator color="#7C5CFF" />
              <Text className="text-[14px] text-muted">Checking Supabase for a new build…</Text>
            </View>
          ) : null}

          {status === 'up-to-date' ? (
            <Text className="mt-6 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-[13.5px] text-[#B8F5C9]">
              You are on the latest version.
            </Text>
          ) : null}

          {release && status !== 'up-to-date' && status !== 'checking' ? (
            <View className="mt-5">
              <Text className="text-[22px] font-bold tracking-tight text-ink">
                v{release.version}
              </Text>
              <Text className="mt-1 text-[12.5px] text-faint">
                {formatSize(release.apkSize)}
                {release.isForceUpdate ? ' · required update' : ''}
              </Text>
              {release.releaseNotes ? (
                <ScrollView className="mt-3 max-h-[120px]">
                  <Text className="text-[13px] leading-[19px] text-muted">{release.releaseNotes}</Text>
                </ScrollView>
              ) : null}
            </View>
          ) : null}

          {status === 'downloading' ? (
            <View className="mt-5">
              <View className="h-2 overflow-hidden rounded-full bg-white/[0.08]">
                <View
                  className="h-full rounded-full bg-neon"
                  style={{ width: `${Math.round(progress * 100)}%` }}
                />
              </View>
              <Text className="mt-2 text-[12.5px] text-muted">
                Downloading… {Math.round(progress * 100)}%
              </Text>
            </View>
          ) : null}

          {status === 'installing' ? (
            <Text className="mt-5 text-[13px] text-muted">
              Opening the Android installer. If nothing happens, allow "Install unknown apps" for
              My Duit Gw.
            </Text>
          ) : null}

          {status === 'error' && error ? (
            <View className="mt-5 flex-row gap-2.5 rounded-xl border border-coral/25 bg-coral/[0.08] px-4 py-3">
              <TriangleAlert size={17} color="#FF8A8A" strokeWidth={1.9} />
              <Text className="flex-1 text-[13px] leading-[19px] text-[#FFB4B4]">{error}</Text>
            </View>
          ) : null}

          <View className="mt-6 gap-2.5">
            {status === 'ready' ? (
              <Pressable
                onPress={() => void startInstall()}
                className="h-[50px] items-center justify-center rounded-2xl bg-neon"
                style={({ pressed }) => (pressed ? { opacity: 0.85 } : null)}
              >
                <Text className="text-[15px] font-semibold text-white">Install update</Text>
              </Pressable>
            ) : null}

            {status === 'idle' || status === 'error' ? (
              <Pressable
                onPress={() => void startDownload()}
                className="h-[50px] flex-row items-center justify-center gap-2 rounded-2xl bg-neon"
                style={({ pressed }) => (pressed ? { opacity: 0.85 } : null)}
              >
                <Download size={17} color="#FFFFFF" strokeWidth={2} />
                <Text className="text-[15px] font-semibold text-white">
                  {status === 'error' ? 'Try again' : 'Download update'}
                </Text>
              </Pressable>
            ) : null}

            {status === 'checking' || status === 'downloading' ? (
              <View className="h-[50px] items-center justify-center rounded-2xl border border-white/[0.08]">
                <Text className="text-[14px] text-faint">Please wait…</Text>
              </View>
            ) : null}

            <Pressable
              disabled={!dismissable}
              onPress={onClose}
              className="h-[46px] items-center justify-center rounded-2xl border border-white/[0.07]"
              style={({ pressed }) => (pressed ? { opacity: 0.7 } : null)}
            >
              <Text className={`text-[13.5px] ${dismissable ? 'text-muted' : 'text-faint'}`}>
                {dismissable ? 'Close' : 'Update required to continue'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
