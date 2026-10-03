import { ShopItem } from '../types';
import { COMPANION_MINIFIG_SIZE, MinifigureSvg } from './minifigure-svg';

interface TabNavigationProps {
  readonly activeTab: 'practice' | 'inventory' | 'shop';
  readonly points: number;
  readonly unopenedBoxesCount: number;
  readonly equippedItem: ShopItem | null;
  readonly onTabChange: (tab: 'practice' | 'inventory' | 'shop') => void;
}

const CompanionBadge = ({ item }: { readonly item: ShopItem | null }) => {
  if (!item) return null;
  return (
    <span className="companion-badge" aria-label="Equipped Companion">
      <MinifigureSvg
        id={item.id}
        size={COMPANION_MINIFIG_SIZE}
        className="companion-badge-icon"
      />
      <span className="companion-badge-name">Companion: {item.name}</span>
    </span>
  );
};

interface TabButtonProps {
  readonly isActive: boolean;
  readonly label: string;
  readonly onClick: () => void;
}

const TabButton = ({ isActive, label, onClick }: TabButtonProps) => (
  <button
    type="button"
    className={`tab-btn ${isActive ? 'active' : ''}`}
    onClick={onClick}
  >
    {label}
  </button>
);

export const TabNavigation = ({
  activeTab,
  points,
  unopenedBoxesCount,
  equippedItem,
  onTabChange
}: TabNavigationProps) => {
  const inventoryLabel =
    unopenedBoxesCount > 0 ? `Inventory (${unopenedBoxesCount})` : 'Inventory';

  return (
    <nav className="tab-nav" aria-label="Game navigation">
      <div className="tab-buttons">
        <TabButton
          isActive={activeTab === 'practice'}
          label="Practice"
          onClick={() => onTabChange('practice')}
        />
        <TabButton
          isActive={activeTab === 'inventory'}
          label={inventoryLabel}
          onClick={() => onTabChange('inventory')}
        />
        <TabButton
          isActive={activeTab === 'shop'}
          label="Minifig Shop"
          onClick={() => onTabChange('shop')}
        />
      </div>

      <div className="header-stats">
        <CompanionBadge item={equippedItem} />
        <span className="points-pill" aria-label={`Points balance: ${points}`}>
          🪙 {points} pts
        </span>
      </div>
    </nav>
  );
};
