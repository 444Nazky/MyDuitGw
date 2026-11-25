import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { Plus } from 'lucide-react-native';
import { useFinance } from '@/context/FinanceContext';
import { formatMoney } from '@/lib/format';

// Matches the bento radius every other card on Home uses.
const CARD_RADIUS = 24;
const CARD_MIN_HEIGHT = 215;
const CARD_MAX_HEIGHT = 225;

const CORNERS = {
  borderTopLeftRadius: CARD_RADIUS,
  borderTopRightRadius: CARD_RADIUS,
  borderBottomLeftRadius: CARD_RADIUS,
  borderBottomRightRadius: CARD_RADIUS,
} as const;

/**
 * Balance card shaped like a physical bank card.
 *
 * The gradient lives in its own clipping layer with all four corners set to 24.
 * On Android a rounded `Pressable` that also carries a shadow/elevation can skip
 * clipping its children, which left the gradient square in the corners, so the
 * visible card is an inner view and the outer view only holds the shadow.
 */
export function BalanceCard({ onAdd }: { onAdd: () => void }) {
  const { profile, currency, totalBalance } = useFinance();

  return (
    <View
      style={{
        width: '100%',
        flexShrink: 0,
        borderRadius: CARD_RADIUS,
        shadowColor: '#000000',
        shadowOpacity: 0.65,
        shadowRadius: 22,
        shadowOffset: { width: 0, height: 18 },
        elevation: 12,
      }}
    >
      <Pressable
        accessibilityLabel="Add transaction"
        onPress={onAdd}
        style={({ pressed }) => ({
          width: '100%',
          aspectRatio: 1.586,
          minHeight: CARD_MIN_HEIGHT,
          maxHeight: CARD_MAX_HEIGHT,
          flexShrink: 0,
          borderRadius: CARD_RADIUS,
          ...CORNERS,
          opacity: pressed ? 0.94 : 1,
        })}
      >
        <View
          style={{
            flex: 1,
            borderRadius: CARD_RADIUS,
            ...CORNERS,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.08)',
          }}
        >
          <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" pointerEvents="none">
            <Defs>
              {/* 125deg: bottom-left to top-right. */}
              <LinearGradient id="balanceCard" x1="0" y1="1" x2="0.85" y2="0.15">
                <Stop offset="0" stopColor="#161616" />
                <Stop offset="0.5" stopColor="#1F1F1F" />
                <Stop offset="1" stopColor="#303030" />
              </LinearGradient>
            </Defs>
            <Rect
              width="100%"
              height="100%"
              rx={CARD_RADIUS}
              ry={CARD_RADIUS}
              fill="url(#balanceCard)"
            />
          </Svg>

          <View
            style={{
              flex: 1,
              height: '100%',
              justifyContent: 'space-between',
              paddingHorizontal: 24,
              paddingVertical: 22,
            }}
          >
            {/* Top block: label + owner on the left, add button on the right. */}
            <View className="flex-row items-start justify-between">
              <View className="flex-1 pr-3">
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '600',
                    letterSpacing: -0.2,
                    color: '#F3F4F6',
                  }}
                >
                  Total Balance
                </Text>
                <Text
                  numberOfLines={1}
                  style={{
                    marginTop: 4,
                    fontSize: 18,
                    fontWeight: '600',
                    letterSpacing: -0.3,
                    color: '#777777',
                  }}
                >
                  {profile.name || 'Your account'}
                </Text>
              </View>

              <Plus size={20} color="#FFFFFF" strokeWidth={1.8} />
            </View>

            {/* Empty card middle, the breathing room a physical card has. */}
            <View style={{ flex: 1, minHeight: 45 }} />

            {/* Bottom block: amount + card mark, then the meta row. */}
            <View>
              <View className="flex-row items-center justify-between">
                <Text
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  style={{
                    flex: 1,
                    fontSize: 29,
                    fontWeight: '700',
                    letterSpacing: -0.9,
                    color: '#FFFFFF',
                  }}
                >
                  {totalBalance < 0 ? '-' : ''}
                  {formatMoney(totalBalance, currency)}
                </Text>

                <View
                  accessibilityLabel="Mastercard"
                  className="flex-row items-center"
                  style={{ marginLeft: 12 }}
                >
                  <View
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 11,
                      backgroundColor: '#EB001B',
                    }}
                  />
                  <View
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 11,
                      marginLeft: -8,
                      backgroundColor: '#F79E1B',
                      opacity: 0.92,
                    }}
                  />
                </View>
              </View>

              <View className="flex-row items-center justify-between" style={{ marginTop: 10 }}>
                <Text style={{ fontSize: 12.5, fontWeight: '500', color: '#777777' }}>
                  Personal account
                </Text>
                <Text style={{ fontSize: 12.5, fontWeight: '500', color: '#777777' }}>
                  **** 3264
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Pressable>
    </View>
  );
}
