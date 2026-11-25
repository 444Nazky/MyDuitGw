import { useMemo } from 'react';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

interface SparklineProps {
  values: number[];
}

const WIDTH = 115;
const HEIGHT = 58;
const PAD_X = 4;
const TOP = 12;
const BOTTOM = 46;
const COLOR = '#8B5CF6';

export function Sparkline({ values }: SparklineProps) {
  const { line, area } = useMemo(() => {
    const series = values.length >= 2 ? values : [0, 0];
    const min = Math.min(...series);
    const max = Math.max(...series);
    const flat = max === min;
    const range = max - min || 1;
    const step = (WIDTH - PAD_X * 2) / (series.length - 1);

    const points = series.map((value, index) => {
      const x = PAD_X + index * step;
      // A flat month sits on the middle line instead of hugging the floor.
      const y = flat
        ? (TOP + BOTTOM) / 2
        : BOTTOM - ((value - min) / range) * (BOTTOM - TOP);
      return [x, y] as const;
    });

    // Step chart: hold the level, then jump to the next one.
    let line = `M${points[0][0].toFixed(2)},${points[0][1].toFixed(2)}`;
    for (let index = 1; index < points.length; index += 1) {
      const previousY = points[index - 1][1];
      const [x, y] = points[index];
      line += ` L${x.toFixed(2)},${previousY.toFixed(2)} L${x.toFixed(2)},${y.toFixed(2)}`;
    }

    const firstX = points[0][0].toFixed(2);
    const lastX = points[points.length - 1][0].toFixed(2);
    const area = `${line} L${lastX},${HEIGHT} L${firstX},${HEIGHT} Z`;

    return { line, area };
  }, [values]);

  return (
    <Svg width={WIDTH} height={HEIGHT}>
      <Defs>
        <LinearGradient id="cashflowFill" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={COLOR} stopOpacity={0.35} />
          <Stop offset="1" stopColor={COLOR} stopOpacity={0} />
        </LinearGradient>
      </Defs>
      <Path d={area} fill="url(#cashflowFill)" />
      <Path
        d={line}
        stroke={COLOR}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}
