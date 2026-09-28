import { AMBER, CORAL, GREY, INK, MUTE, Svg, TEAL, W_THIN, d } from "./tokens";

const SWATCHES = [CORAL, AMBER, INK, TEAL];

/** A logo being constructed on guides, then a palette, then real logos we drew. */
const LogoVisual = () => (
  <Svg>
    <g transform="translate(0 -34)">
      <circle className="a-draw" pathLength="1" style={d(0)} cx="320" cy="190" r="124" fill="none" stroke={GREY} strokeWidth={W_THIN} />
      <circle className="a-draw" pathLength="1" style={d(0.3)} cx="320" cy="190" r="80" fill="none" stroke={GREY} strokeWidth={W_THIN} />
      <path className="a-draw" pathLength="1" style={d(0.5)} d="M180 190 H460 M320 50 V330" fill="none" stroke={GREY} strokeWidth={W_THIN} />
      <path className="a-draw" pathLength="1" style={d(0.6)} d="M232 102 L408 278 M408 102 L232 278" fill="none" stroke={GREY} strokeWidth={W_THIN} />

      <g className="fx a-pop" style={d(0.9)}>
        <rect x="266" y="136" width="108" height="108" rx="28" fill={CORAL} transform="rotate(45 320 190)" />
      </g>
      <g className="fx a-pop" style={d(1.15)}>
        <circle cx="320" cy="190" r="26" fill="#fff" />
      </g>
      <g className="fx a-pop" style={d(1.35)}>
        <path d="M320 190 L320 164 A26 26 0 0 1 346 190 Z" fill={AMBER} />
      </g>
      <g className="fx a-pop" style={d(1.5)}>
        <text x="320" y="352" textAnchor="middle" fontSize="30" fontWeight="800" letterSpacing="-0.5" fill={INK} fontFamily="inherit">
          Your Brand
        </text>
      </g>
    </g>

    {SWATCHES.map((c, i) => (
      <circle key={c} className="fx a-pop" style={d(1.7 + i * 0.12)} cx={496 + i * 36} cy="62" r="15" fill={c} />
    ))}

    <g className="fx a-pop" style={d(2)}>
      <text x="320" y="384" textAnchor="middle" fontSize="12" fill={MUTE} fontFamily="inherit">Logos we have designed</text>
      <image href="/client-logos/kolkart_mining-clean.png" x="130" y="398" width="100" height="100" preserveAspectRatio="xMidYMid meet" />
      <image href="/client-logos/excogitate_logo-clean.png" x="300" y="410" width="176" height="94" preserveAspectRatio="xMidYMid meet" />
    </g>
  </Svg>
);

export default LogoVisual;
