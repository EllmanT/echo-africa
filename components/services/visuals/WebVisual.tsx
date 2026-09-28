import { SiWhatsapp } from "react-icons/si";

import { AMBER, BLUE, GREEN, GREY, INK, MUTE, RED, Svg, W, W_THIN, WHATSAPP, YELLOW, d } from "./tokens";

/** A website drawing itself on a desktop, and the same site arriving on a phone. */
const WebVisual = () => (
  <Svg>
    <defs>
      <clipPath id="sv-web-photo">
        <rect x="416" y="262" width="136" height="98" rx="14" />
      </clipPath>
    </defs>

    {/* desktop window: outline draws on, then the page fills in */}
    <rect className="a-draw" pathLength="1" style={d(0)} x="40" y="70" width="440" height="320" rx="16" fill="#fff" stroke={INK} strokeWidth={W} />
    <path d="M40 106 H480" stroke={GREY} strokeWidth={W_THIN} />
    {[RED, YELLOW, GREEN].map((c, i) => (
      <circle key={c} cx={62 + i * 16} cy="88" r="4.5" fill={c} />
    ))}
    <rect x="150" y="76" width="200" height="24" rx="12" fill="#fff" stroke={GREY} strokeWidth={W_THIN} />
    <text x="250" y="92" textAnchor="middle" fontSize="12" fill={MUTE} fontFamily="inherit">yourbusiness.co.zw</text>

    <g className="fx a-pop" style={d(0.35)}>
      <text x="72" y="164" fontSize="24" fontWeight="800" fill={INK} fontFamily="inherit">Customers find you.</text>
      <text x="72" y="194" fontSize="24" fontWeight="800" fill={INK} fontFamily="inherit">
        Then they <tspan fill={BLUE}>message you.</tspan>
      </text>
      <text x="72" y="226" fontSize="14" fill={MUTE} fontFamily="inherit">Fast on any phone, built for enquiries.</text>
    </g>

    <g className="fx a-pop" style={d(0.7)}>
      <rect x="72" y="248" width="132" height="38" rx="19" fill={BLUE} />
      <text x="138" y="272" textAnchor="middle" fontSize="14" fontWeight="600" fill="#fff" fontFamily="inherit">Get a quote</text>
      <text x="224" y="272" fontSize="14" fontWeight="600" fill={INK} fontFamily="inherit">See our work</text>
    </g>

    {[
      ["Loads fast", BLUE],
      ["Easy to read", GREEN],
      ["Mobile ready", AMBER],
    ].map(([label, c], i) => {
      const ox = [0, 96, 206][i];
      return (
        <g key={label} className="fx a-pop" style={d(0.95 + i * 0.14)}>
          <circle cx={78 + ox} cy="346" r="7" fill="none" stroke={c} strokeWidth={W_THIN} />
          <path d={`M${74.5 + ox} 346 l2.6 2.8 4.6 -5.4`} fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <text x={92 + ox} y="350.5" fontSize="12.5" fill={INK} fontFamily="inherit">{label}</text>
        </g>
      );
    })}

    {/* phone */}
    <g className="fx a-pop" style={d(1.2)}>
      <rect x="396" y="140" width="176" height="344" rx="32" fill="#fff" stroke={INK} strokeWidth={W} />
      <rect x="462" y="154" width="44" height="6" rx="3" fill={GREY} />
      <text x="416" y="204" fontSize="18" fontWeight="800" fill={INK} fontFamily="inherit">Customers</text>
      <text x="416" y="226" fontSize="18" fontWeight="800" fill={BLUE} fontFamily="inherit">find you.</text>
      <text x="416" y="248" fontSize="12" fill={MUTE} fontFamily="inherit">Tap to chat with us.</text>

      <rect x="416" y="262" width="136" height="98" rx="14" fill={BLUE} fillOpacity="0.07" />
      <g clipPath="url(#sv-web-photo)">
        <circle cx="524" cy="288" r="11" fill={YELLOW} />
        <path d="M410 372 L452 314 L484 350 L508 326 L560 372 Z" fill={BLUE} fillOpacity="0.85" />
        <path d="M440 372 L478 336 L510 372 Z" fill={BLUE} fillOpacity="0.4" />
      </g>

      <rect x="416" y="378" width="136" height="40" rx="20" fill={WHATSAPP} />
      <SiWhatsapp x="430" y="388" size="20" color="#fff" />
      <text x="458" y="403" fontSize="13" fontWeight="600" fill="#fff" fontFamily="inherit">Chat now</text>

      <circle className="a-blink" cx="422" cy="446" r="4" fill={GREEN} />
      <text x="434" y="450" fontSize="12" fill={MUTE} fontFamily="inherit">Open today</text>
    </g>

    <g className="a-float" style={d(0.3)}>
      <rect x="52" y="26" width="86" height="32" rx="16" fill="#fff" stroke={GREY} strokeWidth={W_THIN} />
      <circle className="a-blink" cx="74" cy="42" r="4.5" fill={GREEN} />
      <text x="86" y="47" fontSize="14" fontWeight="600" fill={INK} fontFamily="inherit">Live</text>
    </g>
  </Svg>
);

export default WebVisual;
