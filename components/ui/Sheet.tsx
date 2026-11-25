import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';

interface SheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function Sheet({ visible, onClose, title, children, footer }: SheetProps) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [mounted, setMounted] = useState(visible);
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.timing(progress, {
        toValue: 1,
        duration: 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
      return;
    }

    Animated.timing(progress, {
      toValue: 0,
      duration: 200,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) setMounted(false);
    });
  }, [visible, progress]);

  if (!mounted) return null;

  const backdropOpacity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [height * 0.7, 0],
  });

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end">
        <Animated.View
          style={{ opacity: backdropOpacity }}
          className="absolute inset-0 bg-black/75"
        >
          <Pressable className="flex-1" onPress={onClose} />
        </Animated.View>

        <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={0}>
          <Animated.View
            style={{ transform: [{ translateY }], maxHeight: height * 0.92 }}
            className="rounded-t-[28px] border-t border-white/[0.1] bg-[#141416]/85"
          >
            <View className="items-center pt-3">
              <View className="h-1.5 w-11 rounded-full bg-white/15" />
            </View>

            <View className="flex-row items-center justify-between px-6 pb-4 pt-3">
              <Text className="text-[24px] font-bold tracking-tight text-ink">{title}</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close"
                hitSlop={10}
                onPress={onClose}
                className="h-9 w-9 items-center justify-center"
              >
                <X size={24} color="#9A9AA2" strokeWidth={2} />
              </Pressable>
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              showsVerticalScrollIndicator={false}
              style={{ flexShrink: 1 }}
              contentContainerStyle={{
                paddingHorizontal: 24,
                paddingBottom: footer ? 16 : Math.max(insets.bottom, 24) + 8,
              }}
            >
              {children}
            </ScrollView>

            {footer ? (
              <View
                style={{
                  paddingHorizontal: 24,
                  paddingTop: 12,
                  paddingBottom: Math.max(insets.bottom, 20),
                  borderTopWidth: 1,
                  borderTopColor: 'rgba(255,255,255,0.08)',
                }}
              >
                {footer}
              </View>
            ) : null}
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
