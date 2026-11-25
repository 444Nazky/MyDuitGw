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

/**
 * Flat, edge-to-edge tab bar pinned to the bottom of the screen: a 1px
 * hairline on #0A0A0A, 68px tall above the safe-area inset.
 */
export function FloatingTabBar({ state, navigateToTab }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      pointerEvents="box-none"
      style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}
    >
      <View
        style={{
          backgroundColor: '#0A0A0A',
          borderTopWidth: 1,
          borderTopColor: '#161616',
          paddingTop: 8,
          paddingBottom: Math.max(insets.bottom, 8),
        }}
      >
        <View className="flex-row items-center" style={{ height: 52 }}>
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
                className="flex-1 items-center justify-center"
                style={{ gap: 4 }}
              >
                <Icon
                  size={20}
                  color={focused ? '#FFFFFF' : '#666666'}
                  strokeWidth={focused ? 2 : 1.9}
                />
                <Text
                  className={`text-[11px] ${
                    focused ? 'font-medium text-white' : 'font-medium text-[#666666]'
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
