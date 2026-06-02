import { View, Text } from 'react-native';
import Svg, { Rect, G, Line, Text as SvgText } from 'react-native-svg';

interface Bar {
  label: string;
  value: number;
  color: string;
}

interface Props {
  data: Bar[];
  height?: number;
  width?: number;
  barWidth?: number;
}

export default function BarChart({ data, height = 180, width = 320, barWidth = 28 }: Props) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const chartH = height - 40;
  const chartW = width - 50;
  const step = chartW / data.length;

  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={width} height={height}>
        {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
          const y = 10 + chartH * (1 - frac);
          return (
            <G key={frac}>
              <Line x1={40} y1={y} x2={width - 10} y2={y} stroke="#1e293b" strokeWidth={1} />
              <SvgText x={36} y={y + 4} fill="#64748b" fontSize={10} textAnchor="end">
                {Math.round(max * frac)}
              </SvgText>
            </G>
          );
        })}
        {data.map((d, i) => {
          const barH = (d.value / max) * chartH;
          const x = 40 + i * step + (step - barWidth) / 2;
          const y = 10 + chartH - barH;
          const labelY = height - 6;
          return (
            <G key={d.label}>
              <Rect x={x} y={y} width={barWidth} height={barH || 1} rx={4} fill={d.color} opacity={0.85} />
              <SvgText x={x + barWidth / 2} y={labelY} fill="#94a3b8" fontSize={10} textAnchor="middle">
                {d.label}
              </SvgText>
            </G>
          );
        })}
      </Svg>
    </View>
  );
}
