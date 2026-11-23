import { useMemo } from 'react';
import Svg, { Path } from 'react-native-svg';

interface SparklineProps {
  values: number[];
}

const WIDTH = 118;
const HEIGHT = 54;
const COLOR = '#7C5CFF';

export function Sparkline({ values }: SparklineProps) {
  const path = useMemo(() => {
    const series = values.length >= 2 ? values : [0, 0];
    const min = Math.min(...series);
    const max = Math.max(...series);
    const range = max - min || 1;
    const step = WIDTH / (series.length - 1);
    const padding = 4;

    return series
      .map((value, index) => {
        const x = index * step;
        const y = HEIGHT - padding - ((value - min) / range) * (HEIGHT - padding * 2);
        return `${index === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(' ');
  }, [values]);

  return (
    <Svg width={WIDTH} height={HEIGHT}>
      <Path
        d={path}
        stroke={COLOR}
        strokeWidth={2.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}
