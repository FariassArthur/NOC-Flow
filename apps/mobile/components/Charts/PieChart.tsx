import { View, Text } from 'react-native';
import Svg, { Path, G, Text as SvgText } from 'react-native-svg';

interface Slice {
  label: string;
  value: number;
  color: string;
}

interface Props {
  data: Slice[];
  size?: number;
  innerRadius?: number;
}

export default function PieChart({ data, size = 160, innerRadius = 40 }: Props) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) {
    return (
      <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#64748b', fontSize: 12 }}>Sem dados</Text>
      </View>
    );
  }

  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 4;
  const innerR = innerRadius;

  const polarToCart = (angle: number, r: number) => ({
    x: cx + r * Math.sin(angle),
    y: cy - r * Math.cos(angle),
  });

  let currentAngle = -Math.PI / 2;
  const paths: { d: string; fill: string; percent: number; label: string }[] = [];

  for (const slice of data) {
    if (slice.value === 0) continue;
    const sliceAngle = (slice.value / total) * 2 * Math.PI;
    const start = currentAngle;
    const end = currentAngle + sliceAngle;
    const largeArc = sliceAngle > Math.PI ? 1 : 0;

    const p1 = polarToCart(start, outerR);
    const p2 = polarToCart(end, outerR);
    const p3 = polarToCart(end, innerR);
    const p4 = polarToCart(start, innerR);

    const d = [
      `M ${p1.x} ${p1.y}`,
      `A ${outerR} ${outerR} 0 ${largeArc} 1 ${p2.x} ${p2.y}`,
      `L ${p3.x} ${p3.y}`,
      `A ${innerR} ${innerR} 0 ${largeArc} 0 ${p4.x} ${p4.y}`,
      'Z',
    ].join(' ');

    const midAngle = start + sliceAngle / 2;
    const labelR = outerR + 16;
    const lp = polarToCart(midAngle, labelR);

    paths.push({ d, fill: slice.color, percent: slice.value / total, label: slice.label });
    paths.push({ d: '', fill: '', percent: 0, label: '' });

    paths.push({
      d,
      fill: slice.color,
      percent: slice.value / total,
      label: '',
    });

    currentAngle = end;
  }

  const deduped: typeof paths = [];
  for (let i = 0; i < paths.length; i++) {
    if (paths[i].d && (!deduped.length || deduped[deduped.length - 1].fill !== paths[i].fill)) {
      deduped.push(paths[i]);
    }
  }

  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={size + 40} height={size + 40} viewBox={`0 0 ${size + 40} ${size + 40}`}>
        <G transform={`translate(20, 20)`}>
          {data.map((slice, i) => {
            if (slice.value === 0) return null;
            const sliceAngle = (slice.value / total) * 2 * Math.PI;
            const startA = data.slice(0, i).reduce((a, s) => a + (s.value / total) * 2 * Math.PI, -Math.PI / 2);
            const endA = startA + sliceAngle;
            const large = sliceAngle > Math.PI ? 1 : 0;
            const p1 = polarToCart(startA, outerR);
            const p2 = polarToCart(endA, outerR);
            const p3 = polarToCart(endA, innerR);
            const p4 = polarToCart(startA, innerR);
            const d = [
              `M ${p1.x} ${p1.y}`,
              `A ${outerR} ${outerR} 0 ${large} 1 ${p2.x} ${p2.y}`,
              `L ${p3.x} ${p3.y}`,
              `A ${innerR} ${innerR} 0 ${large} 0 ${p4.x} ${p4.y}`,
              'Z',
            ].join(' ');
            const midA = startA + sliceAngle / 2;
            const lp = polarToCart(midA, outerR + 20);
            return (
              <G key={slice.label}>
                <Path d={d} fill={slice.color} opacity={0.9} />
              </G>
            );
          })}
        </G>
      </Svg>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8, justifyContent: 'center' }}>
        {data.map((s) => (
          <View key={s.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: s.color }} />
            <Text style={{ color: '#94a3b8', fontSize: 11 }}>
              {s.label} ({Math.round((s.value / total) * 100)}%)
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
