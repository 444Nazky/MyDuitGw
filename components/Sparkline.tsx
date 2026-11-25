import { useMemo } from 'react';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

interface SparklineProps {
  values: number[];
}

const WIDTH = 118;
const HEIGHT = 62;
const COLOR = '#8B5CF6';

export function Sparkline({ values }: SparklineProps) {
  const { line, area } = useMemo(() => {
    const series = values.length >= 2 ? values : [0, 0];
    const min = Math.min(...series);
    const max = Math.max(...series);
    const range = max - min || 1;
    const step = WIDTH / (series.length - 1);
    const padding = 5;

    const points = series.map((value, index) => {
      const x = index * step;
      const y = HEIGHT - padding - ((value - min) / range) * (HEIGHT - padding * 2);
      return [x, y] as const;
    });

    const line = points
      .map(([x, y], index) => `${index === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`)
      .join(' ');

    const lastX = points[points.length - 1][0].toFixed(2);
    const area = `${line} L${lastX},${HEIGHT} L0,${HEIGHT} Z`;

    return { line, area };
  }, [values]);

  return (
    <Svg width={WIDTH} height={HEIGHT}>
      <Defs>
        <LinearGradient id="cashflowFill" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={COLOR} stopOpacity={0.28} />
          <Stop offset="1" stopColor={COLOR} stopOpacity={0} />
        </LinearGradient>
      </Defs>
      <Path d={area} fill="url(#cashflowFill)" />
      <Path
        d={line}
        stroke={COLOR}
        strokeWidth={2.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}
