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

type ClusterMarker = {
  id: string;
  lat: number;
  lon: number;
};

const CLUSTERS: ClusterMarker[] = [
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

// Target Y positions for list items — measured from actual flex layout
// Container: 540px with py-8 (32px), justify-between, 4 items
// Badge centers mapped to SVG viewBox (0 0 380 580) coordinate space
const LIST_TARGETS = [59, 213, 367, 521];

// Staggered bend X per line — prevents overlapping when multiple markers
// are at similar Y positions (northern clusters are close together)
const BEND_X_PER_LINE = [270, 295, 320, 350];

export function VietnamMap({ className }: { className?: string }) {
  return (
    <div className={`relative ${className ?? ''}`}>
      {/* Province-level SVG map as base layer */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/illustrations/vietnam-provinces.svg"
        alt="Bản đồ Việt Nam với ranh giới tỉnh"
        className="h-full w-full"
        draggable={false}
      />

      {/* Overlay SVG for cluster markers + connector lines */}
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 h-full w-full"
        aria-label="Các cụm công nghiệp"
      >
        {/* Elbow connector lines: point → horizontal → vertical → horizontal to edge */}
        {CLUSTERS.map((cluster, i) => {
          const { x, y } = geoToSvg(cluster.lat, cluster.lon);
          const targetY = LIST_TARGETS[i];
          const bendX = BEND_X_PER_LINE[i];
          // Path: from marker → right to bend column → up/down to target Y → right to edge
          const d = `M ${x + 6} ${y} H ${bendX} V ${targetY} H ${VIEW_W}`;
          return (
            <path
              key={`connector-${cluster.id}`}
              d={d}
              fill="none"
              stroke="#1A2D49"
              strokeWidth="1.4"
              strokeDasharray="5 3"
              opacity="0.55"
            />
          );
        })}

        {/* Cluster markers — subtle solid dot with thin pulse ring */}
        {CLUSTERS.map((cluster) => {
          const { x, y } = geoToSvg(cluster.lat, cluster.lon);
          return (
            <g key={cluster.id}>
              {/* Subtle outer pulse — thin ring */}
              <circle cx={x} cy={y} r="10" fill="none" stroke="#1A2D49" strokeWidth="0.8" opacity="0.2" />
              {/* Main dot */}
              <circle cx={x} cy={y} r="4.5" fill="#1A2D49" opacity="0.9" />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
