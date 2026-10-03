import { InventoryItem, PlayerProfile, ShopItem } from '../types';
import { BlindBoxCard } from './blind-box-card';
import { INVENTORY_MINIFIG_SIZE, MinifigureSvg } from './minifigure-svg';

export interface InventoryViewProps {
  readonly profile: PlayerProfile;
  readonly items: readonly ShopItem[];
  readonly onEquip: (itemId: string) => void;
  readonly onOpenBlindBox: (item: ShopItem) => void;
  readonly randomFn?: () => number;
}

interface ItemCardProps {
  readonly entry: InventoryItem;
  readonly itemDef: ShopItem | undefined;
  readonly isEquipped: boolean;
  readonly onEquip: (id: string) => void;
}

const resolveItemDetails = (entry: InventoryItem, itemDef?: ShopItem) => {
  if (!itemDef) {
    return {
      name: entry.id,
      desc: ''
    };
  }
  return {
    name: itemDef.name,
    desc: itemDef.description
  };
};

interface ActionProps {
  readonly isEquipped: boolean;
  readonly itemId: string;
  readonly onEquip: (id: string) => void;
}

const InventoryCardAction = ({ isEquipped, itemId, onEquip }: ActionProps) => {
  if (isEquipped) {
    return <span className="badge-equipped">Equipped</span>;
  }
  return (
    <button
      type="button"
      className="btn btn-secondary btn-sm"
      onClick={() => onEquip(itemId)}
    >
      Equip
    </button>
  );
};

const InventoryItemCard = ({
  entry,
  itemDef,
  isEquipped,
  onEquip
}: ItemCardProps) => {
  const { name, desc } = resolveItemDetails(entry, itemDef);

  return (
    <div className={`inventory-card ${isEquipped ? 'equipped' : ''}`}>
      <div className="inventory-card-top">
        <span className="inventory-card-icon" aria-hidden="true">
          <MinifigureSvg
            id={entry.id}
            title={name}
            size={INVENTORY_MINIFIG_SIZE}
          />
        </span>
        <span
          className="inventory-count-pill"
          aria-label={`Count: ${entry.count}`}
        >
          x{entry.count}
        </span>
      </div>
      <div className="inventory-card-body">
        <h3>{name}</h3>
        {desc && <p className="inventory-card-desc">{desc}</p>}
      </div>
      <div className="inventory-card-actions">
        <InventoryCardAction
          isEquipped={isEquipped}
          itemId={entry.id}
          onEquip={onEquip}
        />
      </div>
    </div>
  );
};

interface GridProps {
  readonly inventory: readonly InventoryItem[];
  readonly items: readonly ShopItem[];
  readonly equippedId: string | null;
  readonly onEquip: (id: string) => void;
}

const InventoryGrid = ({
  inventory,
  items,
  equippedId,
  onEquip
}: GridProps) => {
  if (inventory.length === 0) {
    return (
      <div className="inventory-empty">
        <p>Your inventory is empty.</p>
        <p className="inventory-empty-hint">
          Complete Japanese sentence rounds to receive Blind Boxes, or visit the
          Minifig Shop!
        </p>
      </div>
    );
  }

  return (
    <div className="inventory-grid" role="region" aria-label="Inventory Items">
      {inventory.map((entry) => (
        <InventoryItemCard
          key={entry.id}
          entry={entry}
          itemDef={items.find((it) => it.id === entry.id)}
          isEquipped={equippedId === entry.id}
          onEquip={onEquip}
        />
      ))}
    </div>
  );
};

export const InventoryView = ({
  profile,
  items,
  onEquip,
  onOpenBlindBox,
  randomFn
}: InventoryViewProps) => {
  const totalCount = profile.inventory.reduce(
    (sum, item) => sum + item.count,
    0
  );

  return (
    <section className="inventory-section" aria-label="Minifigure Inventory">
      <div className="inventory-header">
        <h2>Minifigure Inventory</h2>
        <p className="inventory-sub">
          All collected minifigures from blind boxes and shop purchases.
        </p>
        <div className="inventory-stats-bar">
          <span className="stat-pill">Total Figures: {totalCount}</span>
          <span className="stat-pill">
            Unique Collected: {profile.inventory.length} / {items.length}
          </span>
        </div>
      </div>

      {profile.unopenedBoxesCount > 0 ? (
        <div className="inventory-blind-box-banner">
          <h3>📦 Unopened Blind Boxes ({profile.unopenedBoxesCount})</h3>
          <BlindBoxCard
            unopenedCount={profile.unopenedBoxesCount}
            onOpenBox={onOpenBlindBox}
            onEquip={onEquip}
            equippedItemId={profile.equippedItemId}
            randomFn={randomFn}
          />
        </div>
      ) : null}

      <InventoryGrid
        inventory={profile.inventory}
        items={items}
        equippedId={profile.equippedItemId}
        onEquip={onEquip}
      />
    </section>
  );
};
