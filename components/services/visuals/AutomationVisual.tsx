import { SiWhatsapp } from "react-icons/si";

import { AMBER_DK, GREEN, GREY, GREY_DK, INK, MUTE, PURPLE, Svg, W, W_THIN, WHATSAPP, d, dx, dy } from "./tokens";

const Step = ({
  x,
  y,
  title,
  sub,
  delay,
  children,
}: {
  x: number;
  y: number;
  title: string;
  sub: string;
  delay: number;
  children: React.ReactNode;
}) => (
  <g className="fx a-pop" style={d(delay)}>
    <g transform={`translate(${x} ${y})`}>{children}</g>
    <text x={x} y={y + 66} textAnchor="middle" fontSize="17" fontWeight="700" fill={INK} fontFamily="inherit">
      {title}
    </text>
    <text x={x} y={y + 86} textAnchor="middle" fontSize="13" fill={MUTE} fontFamily="inherit">
      {sub}
    </text>
  </g>
);

const arrow = { fill: "none", stroke: GREY_DK, strokeWidth: W_THIN, strokeLinecap: "round", strokeLinejoin: "round" } as const;

/** A message comes in, AI reads it, an invoice is made, the customer is answered. */
const AutomationVisual = () => (
  <Svg>
    {/* the route: right along the top, down, left along the bottom */}
    <path className="a-draw" pathLength="1" style={d(0.2)} d="M192 110 H448" fill="none" stroke={GREY} strokeWidth={W_THIN} strokeLinecap="round" />
    <path className="a-draw" pathLength="1" style={d(0.5)} d="M500 214 V264" fill="none" stroke={GREY} strokeWidth={W_THIN} strokeLinecap="round" />
    <path className="a-draw" pathLength="1" style={d(0.8)} d="M448 300 H192" fill="none" stroke={GREY} strokeWidth={W_THIN} strokeLinecap="round" />
    <path d="M441 104 L448 110 L441 116" {...arrow} />
    <path d="M494 257 L500 264 L506 257" {...arrow} />
    <path d="M199 294 L192 300 L199 306" {...arrow} />

    {/* one message travelling the route */}
    <circle className="a-hopx" style={dx(256, 0)} cx="192" cy="110" r="5" fill={PURPLE} />
    <circle className="a-hopy" style={dy(50, 1.8)} cx="500" cy="214" r="5" fill={PURPLE} />
    <circle className="a-hopx" style={dx(-256, 3.6)} cx="448" cy="300" r="5" fill={PURPLE} />

    <Step x={140} y={110} title="New message" sub="A customer asks" delay={0}>
      <SiWhatsapp x={-28} y={-28} size={56} color={WHATSAPP} />
    </Step>

    <Step x={500} y={110} title="AI reads it" sub="Understands the request" delay={0.3}>
      <path
        d="M0 -28 C3 -12 12 -3 28 0 C12 3 3 12 0 28 C-3 12 -12 3 -28 0 C-12 -3 -3 -12 0 -28 Z"
        fill={PURPLE}
      />
      <path
        transform="translate(23 -23) scale(0.34)"
        d="M0 -28 C3 -12 12 -3 28 0 C12 3 3 12 0 28 C-3 12 -12 3 -28 0 C-12 -3 -3 -12 0 -28 Z"
        fill="#B79CF5"
      />
    </Step>

    <Step x={500} y={300} title="Invoice made" sub="Filled in for you" delay={0.6}>
      <path d="M-18 -26 H8 L20 -14 V26 H-18 Z" fill="#fff" stroke={INK} strokeWidth={W} strokeLinejoin="round" />
      <path d="M8 -26 V-14 H20" fill="none" stroke={INK} strokeWidth={W} strokeLinejoin="round" />
      <path d="M-10 -2 H12 M-10 8 H12 M-10 18 H2" fill="none" stroke={AMBER_DK} strokeWidth="2.5" strokeLinecap="round" />
    </Step>

    <Step x={140} y={300} title="Reply sent" sub="The customer gets an answer" delay={0.9}>
      <path
        d="M-26 -18 a10 10 0 0 1 10 -10 H16 a10 10 0 0 1 10 10 V6 a10 10 0 0 1 -10 10 H-4 L-16 26 V16 a10 10 0 0 1 -10 -10 Z"
        fill={GREEN}
        fillOpacity="0.12"
        stroke={GREEN}
        strokeWidth={W}
        strokeLinejoin="round"
      />
      <path d="M-9 -4 L-2 3 L11 -11" fill="none" stroke={GREEN} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </Step>

    <g className="fx a-pop" style={d(1.3)}>
      <rect x="100" y="430" width="440" height="44" rx="22" fill="#fff" stroke={GREY} strokeWidth={W_THIN} />
      <circle cx="132" cy="452" r="10" fill={GREEN} />
      <path d="M127 452 l3.6 3.6 6.6 -7.4" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <text x="154" y="457" fontSize="15" fontWeight="600" fill={INK} fontFamily="inherit">
        A person checks anything that involves money
      </text>
    </g>
  </Svg>
);

export default AutomationVisual;
