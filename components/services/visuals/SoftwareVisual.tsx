import { AMBER, AMBER_DK, BLUE, CORAL, FAINT, GREEN, GREY, INK, MUTE, Svg, W, W_THIN, d } from "./tokens";

const NAV: [string, string][] = [
  ["Orders", AMBER_DK],
  ["Stock", BLUE],
  ["Customers", GREEN],
  ["Reports", CORAL],
];

const BARS = [84, 134, 106, 180, 146, 218];
const DAYS = ["M", "T", "W", "T", "F", "S"];
const TASKS = ["Invoice 204 sent", "Stock counted", "Order 1187 packed", "Customer replied", "Report emailed"];

/** A custom business dashboard: orders growing, a task list ticking off, a new order arriving. */
const SoftwareVisual = () => (
  <Svg>
    <rect className="a-draw" pathLength="1" style={d(0)} x="40" y="70" width="560" height="380" rx="18" fill="#fff" stroke={INK} strokeWidth={W} />
    <path d="M176 70 V450" stroke={GREY} strokeWidth={W_THIN} />

    <text x="64" y="108" fontSize="13" fontWeight="700" fill={INK} fontFamily="inherit">Your business</text>
    <rect x="52" y="132" width="112" height="32" rx="16" fill={AMBER} fillOpacity="0.16" />
    {NAV.map(([label, c], i) => (
      <g key={label}>
        <circle cx="76" cy={148 + i * 44} r="5" fill={c} />
        <text x="92" y={153 + i * 44} fontSize="14" fontWeight={i === 0 ? 600 : 500} fill={i === 0 ? INK : MUTE} fontFamily="inherit">{label}</text>
      </g>
    ))}

    <text x="204" y="112" fontSize="16" fontWeight="700" fill={INK} fontFamily="inherit">This week</text>
    <text x="204" y="132" fontSize="12" fill={MUTE} fontFamily="inherit">Orders by day</text>

    {[60, 120, 180].map((h) => (
      <path key={h} d={`M204 ${400 - h} H392`} stroke={FAINT} strokeWidth="1" />
    ))}
    <path d="M204 400 H392" stroke={GREY} strokeWidth={W_THIN} strokeLinecap="round" />
    {BARS.map((h, i) => (
      <rect
        key={i}
        className="fx-b a-grow"
        style={d(0.3 + i * 0.1)}
        x={210 + i * 30}
        y={400 - h}
        width="20"
        height={h}
        rx="6"
        fill={AMBER}
        fillOpacity={i === BARS.length - 1 ? 1 : 0.42}
      />
    ))}
    {DAYS.map((day, i) => (
      <text key={i} x={220 + i * 30} y="420" textAnchor="middle" fontSize="11" fill={MUTE} fontFamily="inherit">{day}</text>
    ))}

    <text x="420" y="112" fontSize="16" fontWeight="700" fill={INK} fontFamily="inherit">To do</text>
    {TASKS.map((task, i) => (
      <g key={task}>
        <circle cx="430" cy={150 + i * 54} r="10" fill="#fff" stroke={GREEN} strokeWidth={W_THIN} />
        <path
          className="a-draw"
          pathLength="1"
          style={d(0.9 + i * 0.4)}
          d={`M425 ${150 + i * 54} l3.6 3.8 6.6 -7.6`}
          fill="none"
          stroke={GREEN}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <text x="450" y={155 + i * 54} fontSize="13" fill={INK} fontFamily="inherit">{task}</text>
      </g>
    ))}

    <g className="a-float">
      <rect x="380" y="34" width="196" height="44" rx="22" fill={INK} />
      <circle cx="404" cy="56" r="6" fill={AMBER} />
      <text x="420" y="61" fontSize="15" fontWeight="600" fill="#fff" fontFamily="inherit">New order in</text>
    </g>
  </Svg>
);

export default SoftwareVisual;
