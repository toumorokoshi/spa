import { ShopItem } from '../types';

interface TabNavigationProps {
  readonly activeTab: 'practice' | 'shop';
  readonly points: number;
  readonly equippedItem: ShopItem | null;
  readonly onTabChange: (tab: 'practice' | 'shop') => void;
}

const CompanionBadge = ({ item }: { readonly item: ShopItem | null }) => {
  if (!item) return null;
  return (
    <span className="companion-badge" aria-label="Equipped Companion">
      {item.icon} {item.name}
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
  equippedItem,
  onTabChange
}: TabNavigationProps) => (
  <nav className="tab-nav" aria-label="Game navigation">
    <div className="tab-buttons">
      <TabButton
        isActive={activeTab === 'practice'}
        label="Practice"
        onClick={() => onTabChange('practice')}
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
