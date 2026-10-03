import { JSX } from 'preact';

export const SuperheroCape = () => (
  <g className="minifig-accessory cape" aria-hidden="true">
    <path
      d="M 34 42 L 18 90 L 82 90 L 66 42 Z"
      fill="#DC2626"
      stroke="#991B1B"
      strokeWidth="0.8"
    />
    <path d="M 28 50 L 26 88 L 32 88 L 34 50 Z" fill="#B91C1C" opacity="0.6" />
    <path d="M 66 50 L 68 88 L 74 88 L 72 50 Z" fill="#B91C1C" opacity="0.6" />
  </g>
);

export const DragonWings = () => (
  <g className="minifig-accessory wings" aria-hidden="true">
    <path
      d="M 36 44 L 10 32 L 16 54 L 26 50 L 34 50 Z"
      fill="#B91C1C"
      stroke="#7F1D1D"
      strokeWidth="0.8"
    />
    <path
      d="M 64 44 L 90 32 L 84 54 L 74 50 L 66 50 Z"
      fill="#B91C1C"
      stroke="#7F1D1D"
      strokeWidth="0.8"
    />
    <path d="M 10 32 L 20 48" stroke="#F59E0B" strokeWidth="0.8" />
    <path d="M 90 32 L 80 48" stroke="#F59E0B" strokeWidth="0.8" />
  </g>
);

export const DinoScalesDecal = () => (
  <g className="torso-decal" aria-hidden="true">
    <ellipse cx="50" cy="53" rx="10" ry="10" fill="#86EFAC" opacity="0.85" />
    <circle cx="50" cy="48" r="1.5" fill="#15803D" />
    <circle cx="46" cy="54" r="1.5" fill="#15803D" />
    <circle cx="54" cy="54" r="1.5" fill="#15803D" />
    <circle cx="50" cy="58" r="1.2" fill="#15803D" />
  </g>
);

export const NinjaTunicDecal = () => (
  <g className="torso-decal" aria-hidden="true">
    <path
      d="M 40 41 L 52 56 L 60 41"
      stroke="#DC2626"
      strokeWidth="1.8"
      fill="none"
    />
    <path
      d="M 60 41 L 48 56 L 40 41"
      stroke="#DC2626"
      strokeWidth="1.8"
      fill="none"
    />
    <line x1="42" y1="58" x2="58" y2="58" stroke="#F59E0B" strokeWidth="2" />
    <circle cx="50" cy="58" r="1.8" fill="#DC2626" />
    <path
      d="M 46 47 L 54 53 M 54 47 L 46 53"
      stroke="#CBD5E1"
      strokeWidth="1"
    />
  </g>
);

export const KingErmineDecal = () => (
  <g className="torso-decal" aria-hidden="true">
    <path
      d="M 38 41 L 44 48 L 50 43 L 56 48 L 62 41 Z"
      fill="#F8FAFC"
      stroke="#E2E8F0"
      strokeWidth="0.5"
    />
    <circle cx="43" cy="45" r="0.8" fill="#0F172A" />
    <circle cx="50" cy="45" r="0.8" fill="#0F172A" />
    <circle cx="57" cy="45" r="0.8" fill="#0F172A" />
    <path
      d="M 44 50 Q 50 56 56 50"
      stroke="#F59E0B"
      strokeWidth="1.5"
      fill="none"
    />
    <circle cx="50" cy="56" r="2.2" fill="#F59E0B" />
    <circle cx="50" cy="56" r="1.2" fill="#EF4444" />
  </g>
);

export const JesterDiamondsDecal = () => (
  <g className="torso-decal" aria-hidden="true">
    <polygon points="46,45 50,42 54,45 50,48" fill="#F59E0B" />
    <polygon points="42,51 46,48 50,51 46,54" fill="#7C3AED" />
    <polygon points="50,51 54,48 58,51 54,54" fill="#F59E0B" />
    <polygon points="46,57 50,54 54,57 50,60" fill="#7C3AED" />
    <path
      d="M 37 41 Q 50 44 63 41"
      stroke="#F8FAFC"
      strokeWidth="1.5"
      fill="none"
    />
  </g>
);

export const SamuraiArmorDecal = () => (
  <g className="torso-decal" aria-hidden="true">
    <line x1="40" y1="46" x2="60" y2="46" stroke="#F59E0B" strokeWidth="1.6" />
    <line x1="38" y1="51" x2="62" y2="51" stroke="#DC2626" strokeWidth="1.6" />
    <line x1="36" y1="56" x2="64" y2="56" stroke="#F59E0B" strokeWidth="1.6" />
    <circle cx="50" cy="51" r="3" fill="#F59E0B" />
    <circle cx="50" cy="51" r="1.5" fill="#0F172A" />
  </g>
);

export const ClassicSpaceDecal = () => (
  <g className="torso-decal" aria-hidden="true">
    <ellipse
      cx="50"
      cy="53"
      rx="7"
      ry="4"
      stroke="#F59E0B"
      strokeWidth="1"
      fill="none"
      transform="rotate(-20 50 53)"
    />
    <polygon points="47,56 50,47 53,56 50,53" fill="#DC2626" />
    <circle cx="52" cy="51" r="1.8" fill="#F59E0B" />
  </g>
);

export const WizardStarsDecal = () => (
  <g className="torso-decal" aria-hidden="true">
    <path d="M 45 46 Q 48 46 49 43 Q 49 48 45 48 Z" fill="#FBBF24" />
    <polygon
      points="55,47 56,49 58,49 56.5,50 57,52 55,51 53,52 53.5,50 52,49 54,49"
      fill="#FBBF24"
      transform="scale(0.8) translate(14, 8)"
    />
    <path
      d="M 40 58 Q 50 62 60 58"
      stroke="#F59E0B"
      strokeWidth="1.8"
      fill="none"
    />
  </g>
);

export const RobotCircuitsDecal = () => (
  <g className="torso-decal" aria-hidden="true">
    <rect
      x="42"
      y="46"
      width="16"
      height="14"
      rx="2"
      fill="#1E293B"
      stroke="#06B6D4"
      strokeWidth="0.8"
    />
    <circle cx="50" cy="53" r="3.2" fill="#06B6D4" />
    <circle cx="50" cy="53" r="1.6" fill="#F8FAFC" />
    <line x1="45" y1="49" x2="48" y2="49" stroke="#22C55E" strokeWidth="1" />
    <line x1="52" y1="49" x2="55" y2="49" stroke="#EAB308" strokeWidth="1" />
  </g>
);

export const KnightShieldDecal = () => (
  <g className="torso-decal" aria-hidden="true">
    <path
      d="M 44 45 L 56 45 L 56 53 Q 50 60 44 53 Z"
      fill="#1D4ED8"
      stroke="#F59E0B"
      strokeWidth="1"
    />
    <line x1="50" y1="45" x2="50" y2="57" stroke="#F59E0B" strokeWidth="1.2" />
    <line x1="44" y1="50" x2="56" y2="50" stroke="#F59E0B" strokeWidth="1.2" />
  </g>
);

export const PirateStripesDecal = () => (
  <g className="torso-decal" aria-hidden="true">
    <line x1="38" y1="45" x2="62" y2="45" stroke="#F8FAFC" strokeWidth="2" />
    <line x1="36" y1="51" x2="64" y2="51" stroke="#F8FAFC" strokeWidth="2" />
    <line x1="34" y1="57" x2="66" y2="57" stroke="#F8FAFC" strokeWidth="2" />
    <path d="M 40 42 L 58 63" stroke="#78350F" strokeWidth="2.5" />
    <circle cx="49" cy="52" r="2.5" fill="#F59E0B" />
  </g>
);

export const SuperheroCrestDecal = () => (
  <g className="torso-decal" aria-hidden="true">
    <polygon
      points="50,44 58,49 55,57 45,57 42,49"
      fill="#DC2626"
      stroke="#F59E0B"
      strokeWidth="1.2"
    />
    <polygon points="51,46 47,51 51,51 49,56 53,50 49,50" fill="#F59E0B" />
  </g>
);

export const TrenchcoatTieDecal = () => (
  <g className="torso-decal" aria-hidden="true">
    <polygon points="45,41 50,47 55,41 53,41 50,45 47,41" fill="#F8FAFC" />
    <polygon points="49,46 51,46 52,58 50,60 48,58" fill="#1E293B" />
    <circle cx="44" cy="51" r="1" fill="#78350F" />
    <circle cx="44" cy="56" r="1" fill="#78350F" />
  </g>
);

export const ChefButtonsDecal = () => (
  <g className="torso-decal" aria-hidden="true">
    <path
      d="M 47 41 L 50 44 L 53 41"
      stroke="#DC2626"
      strokeWidth="2"
      fill="none"
    />
    <circle cx="46" cy="47" r="1" fill="#0F172A" />
    <circle cx="54" cy="47" r="1" fill="#0F172A" />
    <circle cx="46" cy="52" r="1" fill="#0F172A" />
    <circle cx="54" cy="52" r="1" fill="#0F172A" />
    <circle cx="46" cy="57" r="1" fill="#0F172A" />
    <circle cx="54" cy="57" r="1" fill="#0F172A" />
  </g>
);

export const FirefighterStripesDecal = () => (
  <g className="torso-decal" aria-hidden="true">
    <line x1="37" y1="48" x2="63" y2="48" stroke="#EAB308" strokeWidth="2" />
    <line x1="37" y1="50" x2="63" y2="50" stroke="#CBD5E1" strokeWidth="1.2" />
    <line x1="35" y1="58" x2="65" y2="58" stroke="#EAB308" strokeWidth="2" />
    <rect x="47" y="43" width="6" height="4" rx="1" fill="#CBD5E1" />
  </g>
);

export const DiverGaugeDecal = () => (
  <g className="torso-decal" aria-hidden="true">
    <circle
      cx="50"
      cy="53"
      r="5"
      fill="#D97706"
      stroke="#78350F"
      strokeWidth="0.8"
    />
    <circle cx="50" cy="53" r="3.5" fill="#F8FAFC" />
    <line x1="50" y1="53" x2="52" y2="51" stroke="#DC2626" strokeWidth="0.8" />
    <path
      d="M 42 41 Q 44 48 45 53"
      stroke="#0F172A"
      strokeWidth="1.2"
      fill="none"
    />
    <path
      d="M 58 41 Q 56 48 55 53"
      stroke="#0F172A"
      strokeWidth="1.2"
      fill="none"
    />
  </g>
);

export const LabCoatDecal = () => (
  <g className="torso-decal" aria-hidden="true">
    <polygon points="46,41 50,48 54,41" fill="#0284C7" />
    <line x1="50" y1="48" x2="50" y2="65" stroke="#CBD5E1" strokeWidth="1" />
    <rect
      x="43"
      y="52"
      width="5"
      height="6"
      rx="0.5"
      fill="#FFFFFF"
      stroke="#CBD5E1"
      strokeWidth="0.6"
    />
    <line
      x1="44.5"
      y1="51"
      x2="44.5"
      y2="54"
      stroke="#DC2626"
      strokeWidth="0.8"
    />
    <line x1="46" y1="51" x2="46" y2="54" stroke="#2563EB" strokeWidth="0.8" />
  </g>
);

export const PilotWingsDecal = () => (
  <g className="torso-decal" aria-hidden="true">
    <polygon points="46,41 50,46 54,41" fill="#F8FAFC" />
    <polygon points="49.5,45 50.5,45 51,57 50,58 49,57" fill="#F59E0B" />
    <path
      d="M 42 48 L 47 48 L 49 50 L 51 50 L 53 48 L 58 48 Q 50 51 42 48 Z"
      fill="#F59E0B"
    />
  </g>
);

export const ArtistSplattersDecal = () => (
  <g className="torso-decal" aria-hidden="true">
    <line x1="38" y1="45" x2="62" y2="45" stroke="#1E3A8A" strokeWidth="1.2" />
    <line x1="36" y1="50" x2="64" y2="50" stroke="#1E3A8A" strokeWidth="1.2" />
    <line x1="34" y1="55" x2="66" y2="55" stroke="#1E3A8A" strokeWidth="1.2" />
    <circle cx="44" cy="48" r="1.8" fill="#DC2626" />
    <circle cx="56" cy="47" r="1.6" fill="#F59E0B" />
    <circle cx="48" cy="53" r="2" fill="#2563EB" />
  </g>
);

export const VikingHarnessDecal = () => (
  <g className="torso-decal" aria-hidden="true">
    <line x1="38" y1="43" x2="64" y2="62" stroke="#451A03" strokeWidth="2.5" />
    <line x1="62" y1="43" x2="36" y2="62" stroke="#451A03" strokeWidth="2.5" />
    <circle
      cx="50"
      cy="52"
      r="2.8"
      fill="#D4D4D8"
      stroke="#451A03"
      strokeWidth="0.8"
    />
  </g>
);

export const DragonBellyDecal = () => (
  <g className="torso-decal" aria-hidden="true">
    <path d="M 43 44 Q 50 42 57 44 L 59 62 Q 50 64 41 62 Z" fill="#F59E0B" />
    <line x1="43" y1="48" x2="57" y2="48" stroke="#B45309" strokeWidth="1" />
    <line x1="42" y1="53" x2="58" y2="53" stroke="#B45309" strokeWidth="1" />
    <line x1="41" y1="58" x2="59" y2="58" stroke="#B45309" strokeWidth="1" />
  </g>
);

export const FarmerOverallsDecal = () => (
  <g className="torso-decal" aria-hidden="true">
    <rect x="42" y="48" width="16" height="17" fill="#2563EB" />
    <line x1="43" y1="41" x2="43" y2="48" stroke="#1D4ED8" strokeWidth="2" />
    <line x1="57" y1="41" x2="57" y2="48" stroke="#1D4ED8" strokeWidth="2" />
    <circle cx="43" cy="48" r="1" fill="#F59E0B" />
    <circle cx="57" cy="48" r="1" fill="#F59E0B" />
    <rect x="46" y="52" width="8" height="6" rx="0.5" fill="#1D4ED8" />
  </g>
);

export const AlienGalaxyDecal = () => (
  <g className="torso-decal" aria-hidden="true">
    <ellipse
      cx="50"
      cy="52"
      rx="7"
      ry="2.5"
      fill="#38BDF8"
      transform="rotate(-15 50 52)"
    />
    <circle cx="50" cy="52" r="3.2" fill="#22C55E" />
    <circle cx="50" cy="52" r="1.5" fill="#F8FAFC" />
  </g>
);

export const MinerHarnessDecal = () => (
  <g className="torso-decal" aria-hidden="true">
    <line x1="42" y1="41" x2="42" y2="65" stroke="#CBD5E1" strokeWidth="1.8" />
    <line x1="58" y1="41" x2="58" y2="65" stroke="#CBD5E1" strokeWidth="1.8" />
    <line x1="36" y1="55" x2="64" y2="55" stroke="#CBD5E1" strokeWidth="1.8" />
    <path
      d="M 46 47 L 54 55 M 54 47 L 46 55"
      stroke="#0F172A"
      strokeWidth="1.2"
    />
  </g>
);

export const PrincessBodiceDecal = () => (
  <g className="torso-decal" aria-hidden="true">
    <path
      d="M 43 43 Q 50 49 57 43"
      stroke="#F8FAFC"
      strokeWidth="1.5"
      fill="none"
    />
    <circle cx="50" cy="47" r="1.5" fill="#F59E0B" />
    <path d="M 45 49 Q 50 54 55 49 L 53 62 Q 50 63 47 62 Z" fill="#F472B6" />
    <path
      d="M 47 52 Q 50 55 53 52"
      stroke="#FFFFFF"
      strokeWidth="0.8"
      fill="none"
    />
  </g>
);

export const ClassicSmilePrint = () => (
  <g className="torso-decal" aria-hidden="true">
    <circle cx="50" cy="53" r="5" fill="#F59E0B" opacity="0.3" />
  </g>
);

const TORSO_DECAL_REGISTRY: Readonly<Record<string, () => JSX.Element>> = {
  'dino-scales': DinoScalesDecal,
  'ninja-tunic': NinjaTunicDecal,
  'king-ermine': KingErmineDecal,
  'jester-diamonds': JesterDiamondsDecal,
  'samurai-armor': SamuraiArmorDecal,
  'classic-space': ClassicSpaceDecal,
  'wizard-stars': WizardStarsDecal,
  'robot-circuits': RobotCircuitsDecal,
  'knight-shield': KnightShieldDecal,
  'pirate-stripes': PirateStripesDecal,
  'superhero-crest': SuperheroCrestDecal,
  'trenchcoat-tie': TrenchcoatTieDecal,
  'chef-buttons': ChefButtonsDecal,
  'firefighter-stripes': FirefighterStripesDecal,
  'diver-gauge': DiverGaugeDecal,
  'lab-coat': LabCoatDecal,
  'pilot-wings': PilotWingsDecal,
  'artist-splatters': ArtistSplattersDecal,
  'viking-harness': VikingHarnessDecal,
  'dragon-belly': DragonBellyDecal,
  'farmer-overalls': FarmerOverallsDecal,
  'alien-galaxy': AlienGalaxyDecal,
  'miner-harness': MinerHarnessDecal,
  'princess-bodice': PrincessBodiceDecal,
  'classic-smile-print': ClassicSmilePrint
};

export const MinifigureTorsoDecal = ({ type }: { readonly type: string }) => {
  const DecalComponent = TORSO_DECAL_REGISTRY[type];
  if (!DecalComponent) return null;
  return <DecalComponent />;
};

const ACCESSORY_REGISTRY: Readonly<Record<string, () => JSX.Element>> = {
  'superhero-cape': SuperheroCape,
  'dragon-wings': DragonWings
};

export const MinifigureBackdropAccessory = ({
  type
}: {
  readonly type?: string;
}) => {
  if (!type) return null;
  const AccessoryComponent = ACCESSORY_REGISTRY[type];
  if (!AccessoryComponent) return null;
  return <AccessoryComponent />;
};
