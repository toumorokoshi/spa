import {
  MinifigureBackdropAccessory,
  MinifigureTorsoDecal
} from './minifigure-parts-body';
import { MinifigureFace, MinifigureHeadgear } from './minifigure-parts-head';
import { getMinifigureTheme, MinifigureTheme } from './minifigure-themes';

export const DEFAULT_SVG_SIZE = 64;
export const INVENTORY_MINIFIG_SIZE = 64;
export const SHOP_MINIFIG_SIZE = 64;
export const REVEAL_MINIFIG_SIZE = 96;
export const COMPANION_MINIFIG_SIZE = 24;

export interface MinifigureSvgProps {
  readonly id: string;
  readonly size?: number;
  readonly className?: string;
  readonly title?: string;
}

const MinifigureLegs = ({ theme }: { readonly theme: MinifigureTheme }) => {
  const footColor = theme.feetColor ?? theme.legsColor;

  return (
    <g className="minifig-legs" aria-hidden="true">
      <rect
        x="33"
        y="66"
        width="34"
        height="6"
        rx="0.5"
        fill={theme.hipsColor}
      />
      <path d="M 47 72 L 53 72 L 52 77 L 48 77 Z" fill={theme.hipsColor} />
      <rect x="33" y="72" width="15" height="23" fill={theme.legsColor} />
      <rect x="52" y="72" width="15" height="23" fill={theme.legsColor} />
      <rect x="32" y="93" width="16" height="7" rx="1" fill={footColor} />
      <rect x="52" y="93" width="16" height="7" rx="1" fill={footColor} />
      <rect
        x="35"
        y="96"
        width="10"
        height="2.5"
        rx="0.5"
        fill="#000000"
        opacity="0.3"
      />
      <rect
        x="55"
        y="96"
        width="10"
        height="2.5"
        rx="0.5"
        fill="#000000"
        opacity="0.3"
      />
    </g>
  );
};

const MinifigureTorso = ({ theme }: { readonly theme: MinifigureTheme }) => (
  <g className="minifig-torso" aria-hidden="true">
    <rect x="46" y="37" width="8" height="4" rx="0.5" fill="#CBD5E1" />
    <path
      d="M 36 41 L 64 41 L 68 66 L 32 66 Z"
      fill={theme.torsoColor}
      stroke="#000000"
      strokeWidth="0.5"
      strokeOpacity="0.2"
    />
    <MinifigureTorsoDecal type={theme.torsoDecalType} />
  </g>
);

const MinifigureArmsAndHands = ({
  theme
}: {
  readonly theme: MinifigureTheme;
}) => (
  <g className="minifig-arms" aria-hidden="true">
    <path
      d="M 36 41 C 28 43 23 50 25 58 C 27 62 29 64 33 63 C 33 60 30 56 31 50 C 32 46 34 43 37 41 Z"
      fill={theme.armColor}
      stroke="#000000"
      strokeWidth="0.4"
      strokeOpacity="0.2"
    />
    <path
      d="M 64 41 C 72 43 77 50 75 58 C 73 62 71 64 67 63 C 67 60 70 56 69 50 C 68 46 66 43 63 41 Z"
      fill={theme.armColor}
      stroke="#000000"
      strokeWidth="0.4"
      strokeOpacity="0.2"
    />
    <path
      d="M 32 64 C 27 63 24 69 27 73 C 30 75 33 73 32 70 C 31 71 29 72 28 71 C 26 69 27 66 31 66 Z"
      fill={theme.handColor}
      stroke="#000000"
      strokeWidth="0.4"
      strokeOpacity="0.3"
    />
    <path
      d="M 68 64 C 73 63 76 69 73 73 C 70 75 67 73 68 70 C 69 71 71 72 72 71 C 74 69 73 66 69 66 Z"
      fill={theme.handColor}
      stroke="#000000"
      strokeWidth="0.4"
      strokeOpacity="0.3"
    />
  </g>
);

const MinifigureHead = ({ theme }: { readonly theme: MinifigureTheme }) => (
  <g className="minifig-head" aria-hidden="true">
    <rect
      x="43"
      y="10"
      width="14"
      height="6"
      rx="2"
      fill={theme.skinColor}
      stroke="#000000"
      strokeWidth="0.4"
      strokeOpacity="0.15"
    />
    <ellipse cx="50" cy="11.5" rx="5" ry="1" fill="#FFFFFF" opacity="0.35" />
    <rect
      x="37"
      y="15"
      width="26"
      height="23"
      rx="4"
      fill={theme.skinColor}
      stroke="#000000"
      strokeWidth="0.4"
      strokeOpacity="0.15"
    />
    <MinifigureFace type={theme.faceType} />
    <MinifigureHeadgear
      type={theme.headgearType}
      color={theme.headgearColor}
      accent={theme.headgearAccentColor}
    />
  </g>
);

export const MinifigureSvg = ({
  id,
  size = DEFAULT_SVG_SIZE,
  className = '',
  title
}: MinifigureSvgProps) => {
  const theme = getMinifigureTheme(id);
  const displayTitle = title ?? theme.name;
  const classes = `minifigure-svg ${className}`.trim();

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 110"
      width={size}
      height={size}
      className={classes}
      role="img"
      aria-label={displayTitle}
    >
      <MinifigureBackdropAccessory type={theme.accessoryType} />
      <MinifigureLegs theme={theme} />
      <MinifigureTorso theme={theme} />
      <MinifigureArmsAndHands theme={theme} />
      <MinifigureHead theme={theme} />
    </svg>
  );
};
