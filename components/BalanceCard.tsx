import { Pressable, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { Plus } from 'lucide-react-native';
import { useFinance } from '@/context/FinanceContext';
import { formatMoney } from '@/lib/format';

/**
 * Card-ratio balance card.
 *
 * The proportions come from a real credit card (85.6 × 53.98 mm ≈ 1.586:1),
 * so the block keeps its shape on every phone width instead of a fixed height.
 * The gradient runs 125deg, bottom-left to top-right, and the overlapping
 * circles sit bottom-right mirroring the card mark.
 */
export function BalanceCard({ onAdd }: { onAdd: () => void }) {
  const { profile, currency, totalBalance } = useFinance();

  return (
    <View
      style={{
        borderRadius: 22,
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
          borderRadius: 22,
          overflow: 'hidden',
          opacity: pressed ? 0.94 : 1,
        })}
      >
        <Svg
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          width="100%"
          height="100%"
          pointerEvents="none"
        >
          <Defs>
            <LinearGradient id="balanceCard" x1="0" y1="1" x2="0.82" y2="0.18">
              <Stop offset="0" stopColor="#161616" />
              <Stop offset="0.48" stopColor="#1D1D1D" />
              <Stop offset="1" stopColor="#2E2E2E" />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#balanceCard)" />
        </Svg>

        {/* Top inner highlight, the way a printed card catches the light. */}
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 1,
            backgroundColor: 'rgba(255,255,255,0.09)',
          }}
        />

        <View
          style={{
            flex: 1,
            justifyContent: 'space-between',
            paddingHorizontal: 22,
            paddingVertical: 20,
          }}
        >
          <View className="flex-row items-start justify-between">
            <View className="flex-1 pr-3">
              <Text
                style={{
                  fontSize: 14.5,
                  fontWeight: '600',
                  letterSpacing: -0.2,
                  color: '#F2F2F2',
                }}
              >
                Total Balance
              </Text>
              <Text
                numberOfLines={1}
                style={{
                  marginTop: 6,
                  fontSize: 19,
                  fontWeight: '600',
                  letterSpacing: -0.3,
                  color: '#777777',
                }}
              >
                {profile.name || 'Your account'}
              </Text>
            </View>

            <Plus size={21} color="#FFFFFF" strokeWidth={1.8} />
          </View>

          <View>
            <View className="flex-row items-center justify-between">
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                style={{
                  flex: 1,
                  fontSize: 31,
                  fontWeight: '700',
                  letterSpacing: -0.8,
                  color: '#FFFFFF',
                }}
              >
                {totalBalance < 0 ? '-' : ''}
                {formatMoney(totalBalance, currency)}
              </Text>

              <View
                accessibilityLabel="Card mark"
                className="flex-row items-center"
                style={{ marginLeft: 12 }}
              >
                <View
                  style={{
                    width: 21,
                    height: 21,
                    borderRadius: 11,
                    backgroundColor: 'rgba(255,255,255,0.62)',
                  }}
                />
                <View
                  style={{
                    width: 21,
                    height: 21,
                    borderRadius: 11,
                    marginLeft: -8,
                    backgroundColor: 'rgba(255,255,255,0.24)',
                  }}
                />
              </View>
            </View>

            <View className="mt-2.5 flex-row items-center justify-between">
              <Text style={{ fontSize: 13, fontWeight: '500', color: '#777777' }}>
                Personal account
              </Text>
              <Text style={{ fontSize: 13, fontWeight: '500', color: '#777777' }}>
                My Duit Gw
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    </View>
  );
}
