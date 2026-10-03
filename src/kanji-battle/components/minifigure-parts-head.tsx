import { JSX } from 'preact';

interface HeadgearProps {
  readonly color: string;
  readonly accent?: string;
}

export const ClassicSmileFace = () => (
  <g className="minifig-face" aria-hidden="true">
    <circle cx="44" cy="24" r="1.8" fill="#111827" />
    <circle cx="56" cy="24" r="1.8" fill="#111827" />
    <circle cx="44.5" cy="23.5" r="0.6" fill="#F8FAFC" />
    <circle cx="56.5" cy="23.5" r="0.6" fill="#F8FAFC" />
    <path
      d="M 45 29 Q 50 33 55 29"
      stroke="#111827"
      strokeWidth="1.5"
      fill="none"
      strokeLinecap="round"
    />
  </g>
);

export const NinjaFocusFace = () => (
  <g className="minifig-face" aria-hidden="true">
    <path
      d="M 41 23 L 46 25"
      stroke="#111827"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    <path
      d="M 59 23 L 54 25"
      stroke="#111827"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    <circle cx="44" cy="25" r="1.5" fill="#111827" />
    <circle cx="56" cy="25" r="1.5" fill="#111827" />
    <line
      x1="47"
      y1="30"
      x2="53"
      y2="30"
      stroke="#111827"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
  </g>
);

export const KingBeardFace = () => (
  <g className="minifig-face" aria-hidden="true">
    <circle cx="44" cy="23" r="1.8" fill="#111827" />
    <circle cx="56" cy="23" r="1.8" fill="#111827" />
    <path
      d="M 42 27 Q 50 31 58 27 Q 54 36 50 37 Q 46 36 42 27 Z"
      fill="#78350F"
    />
    <path
      d="M 46 29 Q 50 32 54 29"
      stroke="#111827"
      strokeWidth="1.2"
      fill="none"
    />
  </g>
);

export const JesterGrinFace = () => (
  <g className="minifig-face" aria-hidden="true">
    <circle cx="43.5" cy="23" r="1.8" fill="#111827" />
    <circle cx="56.5" cy="23" r="1.8" fill="#111827" />
    <circle cx="41" cy="26" r="1" fill="#EF4444" opacity="0.6" />
    <circle cx="59" cy="26" r="1" fill="#EF4444" opacity="0.6" />
    <path
      d="M 44 28 Q 50 35 56 28"
      stroke="#111827"
      strokeWidth="1.8"
      fill="#F8FAFC"
      strokeLinecap="round"
    />
  </g>
);

export const SamuraiMustacheFace = () => (
  <g className="minifig-face" aria-hidden="true">
    <circle cx="44" cy="23" r="1.8" fill="#111827" />
    <circle cx="56" cy="23" r="1.8" fill="#111827" />
    <path
      d="M 42 28 Q 46 27 50 29 Q 54 27 58 28 Q 55 31 50 30 Q 45 31 42 28 Z"
      fill="#0F172A"
    />
    <circle cx="50" cy="33" r="1.2" fill="#0F172A" />
  </g>
);

export const RobotVisorFace = () => (
  <g className="minifig-face" aria-hidden="true">
    <rect
      x="41"
      y="21"
      width="18"
      height="6"
      rx="1.5"
      fill="#06B6D4"
      stroke="#0891B2"
      strokeWidth="0.6"
    />
    <circle cx="45" cy="24" r="1.2" fill="#F8FAFC" />
    <circle cx="55" cy="24" r="1.2" fill="#F8FAFC" />
    <line
      x1="44"
      y1="31"
      x2="56"
      y2="31"
      stroke="#334155"
      strokeWidth="1"
      strokeDasharray="1.5,1"
    />
  </g>
);

export const WizardBeardFace = () => (
  <g className="minifig-face" aria-hidden="true">
    <circle cx="44" cy="23" r="1.8" fill="#111827" />
    <circle cx="56" cy="23" r="1.8" fill="#111827" />
    <path
      d="M 40 27 Q 44 26 50 28 Q 56 26 60 27 L 58 38 Q 50 48 42 38 Z"
      fill="#F8FAFC"
      stroke="#E2E8F0"
      strokeWidth="0.8"
    />
  </g>
);

export const PiratePatchFace = () => (
  <g className="minifig-face" aria-hidden="true">
    <circle cx="44" cy="24" r="2.8" fill="#18181B" />
    <line x1="39" y1="20" x2="49" y2="28" stroke="#18181B" strokeWidth="0.9" />
    <circle cx="56" cy="24" r="1.8" fill="#111827" />
    <path
      d="M 48 29 Q 52 32 56 29"
      stroke="#111827"
      strokeWidth="1.5"
      fill="none"
      strokeLinecap="round"
    />
  </g>
);

export const AlienEyesFace = () => (
  <g className="minifig-face" aria-hidden="true">
    <ellipse
      cx="43"
      cy="23"
      rx="3"
      ry="4.5"
      fill="#052E16"
      transform="rotate(-15 43 23)"
    />
    <ellipse
      cx="57"
      cy="23"
      rx="3"
      ry="4.5"
      fill="#052E16"
      transform="rotate(15 57 23)"
    />
    <circle cx="43" cy="22" r="1" fill="#34D399" />
    <circle cx="57" cy="22" r="1" fill="#34D399" />
    <path
      d="M 48 31 Q 50 33 52 31"
      stroke="#052E16"
      strokeWidth="1.2"
      fill="none"
    />
  </g>
);

export const PilotAviatorsFace = () => (
  <g className="minifig-face" aria-hidden="true">
    <path
      d="M 41 21 L 48 21 L 47 27 Q 44 28 42 26 Z"
      fill="#0F172A"
      stroke="#F59E0B"
      strokeWidth="0.8"
    />
    <path
      d="M 52 21 L 59 21 L 58 26 Q 56 28 53 27 Z"
      fill="#0F172A"
      stroke="#F59E0B"
      strokeWidth="0.8"
    />
    <line x1="48" y1="22" x2="52" y2="22" stroke="#F59E0B" strokeWidth="1" />
    <path
      d="M 46 30 Q 50 33 54 30"
      stroke="#111827"
      strokeWidth="1.4"
      fill="none"
    />
  </g>
);

export const FrecklesFace = () => (
  <g className="minifig-face" aria-hidden="true">
    <circle cx="44" cy="24" r="1.8" fill="#111827" />
    <circle cx="56" cy="24" r="1.8" fill="#111827" />
    <circle cx="41" cy="27" r="0.6" fill="#B45309" />
    <circle cx="43" cy="28" r="0.6" fill="#B45309" />
    <circle cx="57" cy="28" r="0.6" fill="#B45309" />
    <circle cx="59" cy="27" r="0.6" fill="#B45309" />
    <path
      d="M 46 30 Q 50 33 54 30"
      stroke="#111827"
      strokeWidth="1.4"
      fill="none"
      strokeLinecap="round"
    />
  </g>
);

export const SootSmudgeFace = () => (
  <g className="minifig-face" aria-hidden="true">
    <circle cx="44" cy="24" r="1.8" fill="#111827" />
    <circle cx="56" cy="24" r="1.8" fill="#111827" />
    <ellipse cx="58" cy="27" rx="3" ry="1.8" fill="#475569" opacity="0.6" />
    <path
      d="M 46 29 Q 50 33 54 29"
      stroke="#111827"
      strokeWidth="1.5"
      fill="none"
      strokeLinecap="round"
    />
  </g>
);

export const PrincessLashesFace = () => (
  <g className="minifig-face" aria-hidden="true">
    <circle cx="44" cy="24" r="1.8" fill="#111827" />
    <circle cx="56" cy="24" r="1.8" fill="#111827" />
    <path
      d="M 42 22 L 40 21"
      stroke="#111827"
      strokeWidth="1"
      strokeLinecap="round"
    />
    <path
      d="M 58 22 L 60 21"
      stroke="#111827"
      strokeWidth="1"
      strokeLinecap="round"
    />
    <path
      d="M 46 30 Q 50 34 54 30"
      stroke="#DB2777"
      strokeWidth="1.5"
      fill="none"
      strokeLinecap="round"
    />
  </g>
);

const FACE_REGISTRY: Readonly<Record<string, () => JSX.Element>> = {
  'classic-smile': ClassicSmileFace,
  'ninja-focus': NinjaFocusFace,
  'king-beard': KingBeardFace,
  'jester-grin': JesterGrinFace,
  'samurai-mustache': SamuraiMustacheFace,
  'robot-visor': RobotVisorFace,
  'wizard-beard': WizardBeardFace,
  'pirate-patch': PiratePatchFace,
  'alien-eyes': AlienEyesFace,
  'pilot-aviators': PilotAviatorsFace,
  freckles: FrecklesFace,
  'soot-smudge': SootSmudgeFace,
  'princess-lashes': PrincessLashesFace
};

export const MinifigureFace = ({ type }: { readonly type: string }) => {
  const FaceComponent = FACE_REGISTRY[type] ?? ClassicSmileFace;
  return <FaceComponent />;
};

export const CrownHeadgear = ({ color, accent }: HeadgearProps) => (
  <g className="minifig-headgear" aria-hidden="true">
    <polygon
      points="36,18 36,8 43,14 50,7 57,14 64,8 64,18"
      fill={color}
      stroke="#B45309"
      strokeWidth="0.8"
    />
    <rect x="36" y="16" width="28" height="3" fill="#D97706" />
    <circle cx="50" cy="13" r="1.5" fill={accent ?? '#EF4444'} />
    <circle cx="43" cy="15" r="1" fill="#3B82F6" />
    <circle cx="57" cy="15" r="1" fill="#10B981" />
  </g>
);

export const NinjaCowlHeadgear = ({ color, accent }: HeadgearProps) => (
  <g className="minifig-headgear" aria-hidden="true">
    <path d="M 37 14 Q 50 11 63 14 L 63 20 L 37 20 Z" fill={color} />
    <path d="M 37 30 L 63 30 L 63 37 Q 50 39 37 37 Z" fill={color} />
    <rect x="36" y="16" width="28" height="4" fill={accent ?? '#DC2626'} />
    <circle cx="50" cy="18" r="1.5" fill="#F59E0B" />
  </g>
);

export const DinoCowlHeadgear = ({ color, accent }: HeadgearProps) => (
  <g className="minifig-headgear" aria-hidden="true">
    <path
      d="M 36 14 Q 50 7 64 14 L 64 21 Q 50 16 36 21 Z"
      fill={color}
      stroke="#15803D"
      strokeWidth="0.8"
    />
    <polygon
      points="40,21 42,18 44,21 46,18 48,21 50,18 52,21 54,18 56,21 58,18 60,21"
      fill="#F8FAFC"
    />
    <polygon points="48,7 50,2 52,7" fill={accent ?? '#86EFAC'} />
    <polygon points="54,10 56,5 58,10" fill={accent ?? '#86EFAC'} />
  </g>
);

export const JesterHatHeadgear = ({ color, accent }: HeadgearProps) => (
  <g className="minifig-headgear" aria-hidden="true">
    <path d="M 37 17 Q 26 12 28 4 Q 35 10 44 14 Z" fill={color} />
    <path d="M 63 17 Q 74 12 72 4 Q 65 10 56 14 Z" fill={accent ?? '#F59E0B'} />
    <circle cx="28" cy="4" r="2" fill="#E2E8F0" />
    <circle cx="72" cy="4" r="2" fill="#E2E8F0" />
    <path d="M 36 15 Q 50 13 64 15 L 64 19 Q 50 17 36 19 Z" fill="#F8FAFC" />
  </g>
);

export const SamuraiKabutoHeadgear = ({ color, accent }: HeadgearProps) => (
  <g className="minifig-headgear" aria-hidden="true">
    <path
      d="M 34 16 Q 50 9 66 16 L 68 22 L 64 22 L 63 17 Q 50 13 37 17 L 36 22 L 32 22 Z"
      fill={color}
    />
    <path
      d="M 50 2 Q 55 9 58 12 Q 50 10 42 12 Q 45 9 50 2 Z"
      fill={accent ?? '#F59E0B'}
    />
    <circle cx="50" cy="11" r="2" fill="#991B1B" />
  </g>
);

export const AstronautHelmetHeadgear = ({ color }: HeadgearProps) => (
  <g className="minifig-headgear" aria-hidden="true">
    <path
      d="M 35 15 Q 50 8 65 15 L 65 34 Q 50 39 35 34 Z"
      fill="none"
      stroke={color}
      strokeWidth="4"
    />
    <ellipse
      cx="50"
      cy="25"
      rx="11"
      ry="8"
      fill="none"
      stroke={color}
      strokeWidth="2.5"
    />
    <rect x="36" y="34" width="28" height="4" rx="2" fill={color} />
  </g>
);

export const WizardHatHeadgear = ({ color, accent }: HeadgearProps) => (
  <g className="minifig-headgear" aria-hidden="true">
    <polygon
      points="32,18 50,0 68,18"
      fill={color}
      stroke="#4C1D95"
      strokeWidth="0.8"
    />
    <ellipse
      cx="50"
      cy="18"
      rx="19"
      ry="4"
      fill={color}
      stroke="#4C1D95"
      strokeWidth="0.8"
    />
    <polygon
      points="50,7 52,11 56,11 53,13 54,17 50,14 46,17 47,13 44,11 48,11"
      fill={accent ?? '#FBBF24'}
      transform="scale(0.7) translate(21, 2)"
    />
  </g>
);

export const RobotCapHeadgear = ({ color, accent }: HeadgearProps) => (
  <g className="minifig-headgear" aria-hidden="true">
    <rect
      x="38"
      y="10"
      width="24"
      height="7"
      rx="1.5"
      fill={color}
      stroke="#334155"
      strokeWidth="0.8"
    />
    <line x1="50" y1="10" x2="50" y2="3" stroke="#64748B" strokeWidth="1.5" />
    <circle cx="50" cy="3" r="2" fill={accent ?? '#06B6D4'} />
    <rect x="35" y="21" width="3" height="6" rx="1" fill="#475569" />
    <rect x="62" y="21" width="3" height="6" rx="1" fill="#475569" />
  </g>
);

export const KnightHelmetHeadgear = ({ color, accent }: HeadgearProps) => (
  <g className="minifig-headgear" aria-hidden="true">
    <path
      d="M 35 15 Q 50 8 65 15 L 65 24 L 35 24 Z"
      fill={color}
      stroke="#64748B"
      strokeWidth="0.8"
    />
    <rect x="38" y="21" width="24" height="3" rx="1" fill="#1E293B" />
    <line
      x1="42"
      y1="22.5"
      x2="48"
      y2="22.5"
      stroke="#CBD5E1"
      strokeWidth="0.8"
    />
    <line
      x1="52"
      y1="22.5"
      x2="58"
      y2="22.5"
      stroke="#CBD5E1"
      strokeWidth="0.8"
    />
    <path d="M 50 8 Q 54 2 60 4 Q 54 6 50 8" fill={accent ?? '#DC2626'} />
  </g>
);

export const PirateTricornHeadgear = ({ color }: HeadgearProps) => (
  <g className="minifig-headgear" aria-hidden="true">
    <path
      d="M 28 17 Q 50 8 72 17 Q 62 7 50 9 Q 38 7 28 17 Z"
      fill={color}
      stroke="#27272A"
      strokeWidth="0.8"
    />
    <circle cx="50" cy="13" r="1.5" fill="#F8FAFC" />
    <line x1="47" y1="15" x2="53" y2="15" stroke="#F8FAFC" strokeWidth="0.8" />
  </g>
);

export const SuperheroMaskHeadgear = ({ color }: HeadgearProps) => (
  <g className="minifig-headgear" aria-hidden="true">
    <path d="M 37 13 Q 50 10 63 13 L 64 17 Q 50 15 36 17 Z" fill={color} />
  </g>
);

export const DeerstalkerHeadgear = ({ color, accent }: HeadgearProps) => (
  <g className="minifig-headgear" aria-hidden="true">
    <ellipse cx="50" cy="15" rx="16" ry="6" fill={color} />
    <path d="M 33 17 L 31 19 L 69 19 L 67 17 Z" fill={accent ?? '#78350F'} />
    <ellipse cx="50" cy="10" rx="3" ry="1.5" fill={accent ?? '#78350F'} />
  </g>
);

export const ChefToqueHeadgear = ({ color }: HeadgearProps) => (
  <g className="minifig-headgear" aria-hidden="true">
    <path
      d="M 39 16 L 38 7 Q 44 2 50 4 Q 56 2 62 7 L 61 16 Z"
      fill={color}
      stroke="#E2E8F0"
      strokeWidth="0.8"
    />
    <rect
      x="38"
      y="14"
      width="24"
      height="4"
      fill={color}
      stroke="#CBD5E1"
      strokeWidth="0.6"
    />
  </g>
);

export const FireHelmetHeadgear = ({ color, accent }: HeadgearProps) => (
  <g className="minifig-headgear" aria-hidden="true">
    <ellipse cx="50" cy="14" rx="16" ry="6" fill={color} />
    <path d="M 46 8 L 54 8 L 53 14 L 47 14 Z" fill={accent ?? '#DC2626'} />
    <path d="M 34 16 L 32 23 L 68 23 L 66 16 Z" fill={color} opacity="0.6" />
  </g>
);

export const DivingHelmetHeadgear = ({ color, accent }: HeadgearProps) => (
  <g className="minifig-headgear" aria-hidden="true">
    <path
      d="M 34 16 Q 50 7 66 16 L 66 36 L 34 36 Z"
      fill={color}
      stroke="#78350F"
      strokeWidth="0.8"
    />
    <circle
      cx="50"
      cy="24"
      r="8"
      fill="none"
      stroke="#78350F"
      strokeWidth="2"
    />
    <circle cx="50" cy="24" r="6" fill={accent ?? '#38BDF8'} opacity="0.3" />
    <rect x="47" y="5" width="6" height="3" rx="1" fill="#78350F" />
  </g>
);

export const ScientistHairHeadgear = ({ color }: HeadgearProps) => (
  <g className="minifig-headgear" aria-hidden="true">
    <path
      d="M 35 15 Q 32 8 39 10 Q 43 4 50 7 Q 57 4 61 10 Q 68 8 65 15 Z"
      fill={color}
    />
    <rect
      x="42"
      y="13"
      width="16"
      height="4"
      rx="2"
      fill="#0EA5E9"
      opacity="0.8"
    />
  </g>
);

export const PilotCapHeadgear = ({ color, accent }: HeadgearProps) => (
  <g className="minifig-headgear" aria-hidden="true">
    <path d="M 36 15 Q 50 10 64 15 L 63 19 L 37 19 Z" fill={color} />
    <path
      d="M 36 18 Q 50 21 64 18"
      stroke="#0F172A"
      strokeWidth="2"
      fill="none"
    />
    <circle cx="50" cy="14" r="1.5" fill={accent ?? '#F59E0B'} />
  </g>
);

export const ArtistBeretHeadgear = ({ color }: HeadgearProps) => (
  <g className="minifig-headgear" aria-hidden="true">
    <ellipse
      cx="52"
      cy="13"
      rx="16"
      ry="6"
      fill={color}
      transform="rotate(-8 52 13)"
    />
    <line x1="52" y1="7" x2="52" y2="4" stroke={color} strokeWidth="1.5" />
  </g>
);

export const VikingHornsHeadgear = ({ color, accent }: HeadgearProps) => (
  <g className="minifig-headgear" aria-hidden="true">
    <ellipse
      cx="50"
      cy="14"
      rx="14"
      ry="5"
      fill={color}
      stroke="#3F3F46"
      strokeWidth="0.8"
    />
    <path
      d="M 37 13 Q 30 11 28 3 Q 33 6 38 12"
      fill={accent ?? '#F8FAFC'}
      stroke="#E2E8F0"
      strokeWidth="0.5"
    />
    <path
      d="M 63 13 Q 70 11 72 3 Q 67 6 62 12"
      fill={accent ?? '#F8FAFC'}
      stroke="#E2E8F0"
      strokeWidth="0.5"
    />
  </g>
);

export const DragonHoodHeadgear = ({ color, accent }: HeadgearProps) => (
  <g className="minifig-headgear" aria-hidden="true">
    <path
      d="M 35 14 Q 50 6 65 14 L 64 21 Q 50 16 36 21 Z"
      fill={color}
      stroke="#7F1D1D"
      strokeWidth="0.8"
    />
    <path d="M 38 10 Q 34 4 33 0 Q 38 3 41 8" fill={accent ?? '#F59E0B'} />
    <path d="M 62 10 Q 66 4 67 0 Q 62 3 59 8" fill={accent ?? '#F59E0B'} />
  </g>
);

export const StrawHatHeadgear = ({ color, accent }: HeadgearProps) => (
  <g className="minifig-headgear" aria-hidden="true">
    <ellipse
      cx="50"
      cy="16"
      rx="20"
      ry="5"
      fill={color}
      stroke="#CA8A04"
      strokeWidth="0.8"
    />
    <ellipse
      cx="50"
      cy="13"
      rx="10"
      ry="4"
      fill={color}
      stroke="#CA8A04"
      strokeWidth="0.8"
    />
    <ellipse
      cx="50"
      cy="14"
      rx="10"
      ry="2"
      fill="none"
      stroke={accent ?? '#B45309'}
      strokeWidth="1.2"
    />
  </g>
);

export const AlienCraniumHeadgear = ({ color, accent }: HeadgearProps) => (
  <g className="minifig-headgear" aria-hidden="true">
    <ellipse cx="50" cy="12" rx="14" ry="7" fill={color} />
    <line
      x1="43"
      y1="7"
      x2="38"
      y2="1"
      stroke={accent ?? '#15803D'}
      strokeWidth="1.2"
    />
    <circle cx="37" cy="1" r="1.8" fill={color} />
    <line
      x1="57"
      y1="7"
      x2="62"
      y2="1"
      stroke={accent ?? '#15803D'}
      strokeWidth="1.2"
    />
    <circle cx="63" cy="1" r="1.8" fill={color} />
  </g>
);

export const MinerHardHatHeadgear = ({ color, accent }: HeadgearProps) => (
  <g className="minifig-headgear" aria-hidden="true">
    <path
      d="M 36 15 Q 50 8 64 15 L 63 18 L 37 18 Z"
      fill={color}
      stroke="#B45309"
      strokeWidth="0.8"
    />
    <circle
      cx="50"
      cy="14"
      r="2.5"
      fill="#E2E8F0"
      stroke="#475569"
      strokeWidth="0.6"
    />
    <circle cx="50" cy="14" r="1.5" fill={accent ?? '#38BDF8'} />
    <polygon points="48,15 40,28 60,28 52,15" fill="#38BDF8" opacity="0.15" />
  </g>
);

export const PrincessTiaraHeadgear = ({ color, accent }: HeadgearProps) => (
  <g className="minifig-headgear" aria-hidden="true">
    <path d="M 37 16 Q 33 24 34 36 Q 36 28 38 18" fill={accent ?? '#FDE047'} />
    <path d="M 63 16 Q 67 24 66 36 Q 64 28 62 18" fill={accent ?? '#FDE047'} />
    <polygon
      points="43,15 46,11 50,14 54,11 57,15"
      fill={color}
      stroke="#B45309"
      strokeWidth="0.6"
    />
    <circle cx="50" cy="12" r="1" fill="#EC4899" />
  </g>
);

export const ClassicHairHeadgear = ({ color }: HeadgearProps) => (
  <g className="minifig-headgear" aria-hidden="true">
    <path
      d="M 36 15 Q 50 9 64 15 L 64 17 Q 56 14 50 16 Q 44 14 36 17 Z"
      fill={color}
    />
  </g>
);

const HEADGEAR_REGISTRY: Readonly<
  Record<string, (props: HeadgearProps) => JSX.Element>
> = {
  crown: CrownHeadgear,
  'ninja-cowl': NinjaCowlHeadgear,
  'dino-cowl': DinoCowlHeadgear,
  'jester-hat': JesterHatHeadgear,
  'samurai-kabuto': SamuraiKabutoHeadgear,
  'astronaut-helmet': AstronautHelmetHeadgear,
  'wizard-hat': WizardHatHeadgear,
  'robot-cap': RobotCapHeadgear,
  'knight-helmet': KnightHelmetHeadgear,
  'pirate-tricorn': PirateTricornHeadgear,
  'superhero-mask': SuperheroMaskHeadgear,
  deerstalker: DeerstalkerHeadgear,
  'chef-toque': ChefToqueHeadgear,
  'fire-helmet': FireHelmetHeadgear,
  'diving-helmet': DivingHelmetHeadgear,
  'scientist-hair': ScientistHairHeadgear,
  'pilot-cap': PilotCapHeadgear,
  'artist-beret': ArtistBeretHeadgear,
  'viking-horns': VikingHornsHeadgear,
  'dragon-hood': DragonHoodHeadgear,
  'straw-hat': StrawHatHeadgear,
  'alien-cranium': AlienCraniumHeadgear,
  'miner-hard-hat': MinerHardHatHeadgear,
  'princess-tiara': PrincessTiaraHeadgear,
  'classic-hair': ClassicHairHeadgear
};

export const MinifigureHeadgear = ({
  type,
  color,
  accent
}: {
  readonly type: string;
  readonly color: string;
  readonly accent?: string;
}) => {
  const HeadgearComponent = HEADGEAR_REGISTRY[type] ?? ClassicHairHeadgear;
  return <HeadgearComponent color={color} accent={accent} />;
};
