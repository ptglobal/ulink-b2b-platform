/**
 * Vietnam Map component — uses province-level SVG (34 provinces)
 * converted from palamago's Vietnam TopoJSON dataset.
 * Cluster markers positioned by lat/lon coordinates using the same projection.
 *
 * Connector lines use elbow routing (horizontal → vertical → horizontal)
 * for a clean tech/schematic aesthetic.
 *
 * SVG file: /images/illustrations/vietnam-provinces.svg
 * Projection: equirectangular onto viewBox 0 0 380 580
 */

export type ClusterMarker = {
  id: string;
  lat: number;
  lon: number;
};

/** Fallback clusters if none are provided via props */
const DEFAULT_CLUSTERS: ClusterMarker[] = [
  { id: '01', lat: 21.12, lon: 106.07 },  // Bắc Ninh
  { id: '02', lat: 20.65, lon: 106.05 },  // Hưng Yên
  { id: '03', lat: 20.86, lon: 106.68 },  // Hải Phòng
  { id: '04', lat: 10.95, lon: 106.83 },  // Đồng Nai
];

// Must match the projection used to generate the SVG
const PAD = 15;
const VIEW_W = 380;
const VIEW_H = 580;

const LON_MIN = 102.0;
const LON_MAX = 110.0;
const LAT_MIN = 7.2;
const LAT_MAX = 23.5;

function geoToSvg(lat: number, lon: number): { x: number; y: number } {
  const x = PAD + ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * (VIEW_W - 2 * PAD);
  const y = PAD + ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * (VIEW_H - 2 * PAD);
  return { x, y };
}

/**
 * Compute evenly-spaced Y target positions for N items within a container.
 * Container: 540px with py-8 (32px top + 32px bottom), justify-between.
 * Mapped into SVG viewBox (0 0 380 580) coordinate space.
 */
function computeListTargets(count: number): number[] {
  if (count <= 0) return [];
  if (count === 1) return [VIEW_H / 2];

  const containerHeight = 640;
  const paddingY = 70; // larger padding = tighter vertical spread
  const usable = containerHeight - 2 * paddingY;
  const step = usable / (count - 1);
  const scale = VIEW_H / containerHeight;

  return Array.from({ length: count }, (_, i) =>
    Math.round((paddingY + i * step) * scale)
  );
}

/**
 * Compute staggered bend X positions so connector lines don't overlap.
 */
function computeBendXPositions(count: number): number[] {
  const baseX = 270;
  const stepX = 25;
  return Array.from({ length: count }, (_, i) =>
    Math.min(baseX + i * stepX, VIEW_W - 10)
  );
}

interface VietnamMapProps {
  className?: string;
  /** Dynamic cluster markers — falls back to default hardcoded clusters */
  clusters?: ClusterMarker[];
}

export function VietnamMap({ className, clusters }: VietnamMapProps) {
  const activeMarkers = clusters && clusters.length > 0 ? clusters : DEFAULT_CLUSTERS;
  const listTargets = computeListTargets(activeMarkers.length);
  const bendXPositions = computeBendXPositions(activeMarkers.length);

  return (
    <div className={`relative ${className ?? ''}`}>
      {/* Province-level SVG map as base layer */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/illustrations/vietnam-provinces.svg"
        alt="Bản đồ Việt Nam với ranh giới tỉnh"
        className="h-full w-full"
        style={{ filter: 'brightness(0) invert(1)', opacity: 0.9 }}
        draggable={false}
      />

      {/* Overlay SVG for cluster markers + connector lines */}
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 h-full w-full overflow-visible"
        aria-label="Các cụm công nghiệp"
      >
        {/* Connector lines: from node to hub card on the right */}
        {activeMarkers.map((cluster, i) => {
          const { x, y } = geoToSvg(cluster.lat, cluster.lon);
          const targetY = listTargets[i];
          // Extend far enough to reach the left edge of hub cards
          const targetX = VIEW_W + 160;
          // Smooth cubic Bezier curve
          const d = `M ${x} ${y} C ${(x + targetX) / 2} ${y}, ${(x + targetX) / 2} ${targetY}, ${targetX} ${targetY}`;
          return (
            <path
              key={`connector-${cluster.id}`}
              d={d}
              fill="none"
              stroke="#00e5ff"
              strokeWidth="1.2"
              strokeDasharray="4 3"
              opacity="0.6"
            />
          );
        })}

        {/* Cluster markers — glowing cyan dot with pulsating ripple ring */}
        {activeMarkers.map((cluster) => {
          const { x, y } = geoToSvg(cluster.lat, cluster.lon);
          return (
            <g key={cluster.id}>
              {/* Pulsating ripple ring */}
              <circle
                cx={x}
                cy={y}
                r="8"
                fill="#00e5ff"
                opacity="0.3"
                className="animate-ping"
                style={{ transformOrigin: `${x}px ${y}px` }}
              />
              {/* Glow border ring */}
              <circle
                cx={x}
                cy={y}
                r="7"
                fill="none"
                stroke="#00e5ff"
                strokeWidth="1"
                opacity="0.6"
              />
              {/* Solid cyan center */}
              <circle
                cx={x}
                cy={y}
                r="3.5"
                fill="#00e5ff"
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
