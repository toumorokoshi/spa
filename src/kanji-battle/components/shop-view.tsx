import { PlayerProfile, ShopItem } from '../types';

interface ShopViewProps {
  readonly items: readonly ShopItem[];
  readonly profile: PlayerProfile;
  readonly onPurchase: (item: ShopItem) => void;
  readonly onEquip: (itemId: string) => void;
}

interface ItemButtonProps {
  readonly isEquipped: boolean;
  readonly isOwned: boolean;
  readonly canAfford: boolean;
  readonly price: number;
  readonly shortage: number;
  readonly onPurchase: () => void;
  readonly onEquip: () => void;
}

const ItemActionButton = ({
  isEquipped,
  isOwned,
  canAfford,
  price,
  shortage,
  onPurchase,
  onEquip
}: ItemButtonProps) => {
  if (isEquipped) {
    return <span className="badge-equipped">Equipped</span>;
  }
  if (isOwned) {
    return (
      <button
        type="button"
        className="btn btn-secondary btn-sm"
        onClick={onEquip}
      >
        Equip
      </button>
    );
  }
  if (canAfford) {
    return (
      <button
        type="button"
        className="btn btn-primary btn-sm"
        onClick={onPurchase}
      >
        Buy for {price} pts
      </button>
    );
  }
  return (
    <button type="button" className="btn btn-secondary btn-sm" disabled>
      Need {shortage} more pts
    </button>
  );
};

export const ShopView = ({
  items,
  profile,
  onPurchase,
  onEquip
}: ShopViewProps) => (
  <section className="shop-section" aria-label="Minifigure Shop">
    <div className="shop-header">
      <h2>Lego Minifigure Shop</h2>
      <p className="shop-sub">
        Spend points earned from completing Japanese sentences to collect brick
        companions!
      </p>
    </div>

    <div className="shop-grid">
      {items.map((item) => {
        const isOwned = profile.purchasedItemIds.includes(item.id);
        const isEquipped = profile.equippedItemId === item.id;
        const canAfford = profile.points >= item.price;
        const shortage = item.price - profile.points;

        return (
          <div
            key={item.id}
            className={`shop-card ${isEquipped ? 'equipped' : ''}`}
          >
            <div className="shop-card-icon" aria-hidden="true">
              {item.icon}
            </div>
            <div className="shop-card-info">
              <h3>{item.name}</h3>
              <p className="shop-card-desc">{item.description}</p>
              <p className="shop-card-price">🪙 {item.price} pts</p>
            </div>
            <div className="shop-card-actions">
              <ItemActionButton
                isEquipped={isEquipped}
                isOwned={isOwned}
                canAfford={canAfford}
                price={item.price}
                shortage={shortage}
                onPurchase={() => onPurchase(item)}
                onEquip={() => onEquip(item.id)}
              />
            </div>
          </div>
        );
      })}
    </div>
  </section>
);
