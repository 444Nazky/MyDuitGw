import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from 'expo-router/build/layouts/Tabs';
import { Bookmark, Clock, House, Sun } from 'lucide-react-native';

const ICONS = {
  index: House,
  history: Clock,
  debt: Bookmark,
  setting: Sun,
} as const;

const LABELS: Record<string, string> = {
  index: 'Home',
  history: 'History',
  debt: 'Debt',
  setting: 'Setting',
};

export function FloatingTabBar({ state, navigateToTab }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      pointerEvents="box-none"
      style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}
    >
      <View className="mx-6" style={{ paddingBottom: Math.max(insets.bottom, 16), paddingTop: 8 }}>
        <View className="flex-row items-center rounded-[26px] border border-white/[0.09] bg-[#141416] px-2 py-2.5">
          {state.routes.map((route, index) => {
            const focused = state.index === index;
            const Icon = ICONS[route.name as keyof typeof ICONS] ?? House;
            const label = LABELS[route.name] ?? route.name;

            return (
              <Pressable
                key={route.key}
                accessibilityRole="button"
                accessibilityState={focused ? { selected: true } : {}}
                accessibilityLabel={label}
                onPress={() => {
                  if (!focused) navigateToTab(route.key);
                }}
                className="flex-1 items-center justify-center gap-1.5 py-1"
              >
                <Icon
                  size={22}
                  color={focused ? '#FAFAFA' : '#77777F'}
                  strokeWidth={focused ? 2.1 : 1.7}
                />
                <Text
                  className={`text-[11.5px] ${
                    focused ? 'font-semibold text-ink' : 'font-medium text-muted'
                  }`}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}
