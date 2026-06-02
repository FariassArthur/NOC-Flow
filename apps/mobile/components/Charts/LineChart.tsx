import { View, Text } from 'react-native';
import Svg, { Polyline, Circle, Line, G, Text as SvgText, Polygon } from 'react-native-svg';

interface Point {
  label: string;
  value: number;
}

interface Props {
  data: Point[];
  color?: string;
  height?: number;
  width?: number;
}

export default function LineChart({ data, color = '#f97316', height = 180, width = 320 }: Props) {
  if (data.length === 0) {
    return (
      <View style={{ height, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#64748b', fontSize: 12 }}>Sem dados</Text>
      </View>
    );
  }

  const max = Math.max(...data.map((d) => d.value), 1);
  const chartH = height - 40;
  const chartW = width - 50;
  const step = data.length > 1 ? chartW / (data.length - 1) : 0;
  const padX = 10;

  const points = data.map((d, i) => {
    const x = 40 + (data.length > 1 ? i * step : chartW / 2);
    const y = 10 + chartH - (d.value / max) * chartH;
    return { x, y, ...d };
  });

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ');

  const fillPoints = [
    `${points[0]?.x || 40},${10 + chartH}`,
    ...points.map((p) => `${p.x},${p.y}`),
    `${points[points.length - 1]?.x || 40},${10 + chartH}`,
  ].join(' ');

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
        <Polygon points={fillPoints} fill={color + '15'} stroke="none" />
        <Polyline points={polylinePoints} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => (
          <G key={i}>
            <Circle cx={p.x} cy={p.y} r={4} fill={color} />
            <SvgText x={p.x} y={height - 6} fill="#94a3b8" fontSize={9} textAnchor="middle">
              {p.label}
            </SvgText>
          </G>
        ))}
      </Svg>
    </View>
  );
}
