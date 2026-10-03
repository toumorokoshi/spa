import { useState } from 'preact/hooks';
import { getRandomMinifigure, SHOP_ITEMS } from '../shop-data';
import { ShopItem } from '../types';

export interface BlindBoxCardProps {
  readonly unopenedCount: number;
  readonly onOpenBox: (item: ShopItem) => void;
  readonly onEquip?: (itemId: string) => void;
  readonly equippedItemId?: string | null;
  readonly randomFn?: () => number;
}

interface RevealedViewProps {
  readonly item: ShopItem;
  readonly remainingBoxes: number;
  readonly isEquipped: boolean;
  readonly onEquip?: (id: string) => void;
  readonly onOpenAnother: () => void;
}

const RevealedMinifigure = ({
  item,
  remainingBoxes,
  isEquipped,
  onEquip,
  onOpenAnother
}: RevealedViewProps) => (
  <div className="blind-box-reveal">
    <div className="reveal-sparkle" aria-hidden="true">
      ✨
    </div>
    <div className="revealed-icon" aria-hidden="true">
      {item.icon}
    </div>
    <h3 className="revealed-title">{item.name}</h3>
    <p className="revealed-desc">{item.description}</p>
    <div className="revealed-banner">Added to your Minifigure Inventory!</div>
    <div className="reveal-actions">
      {isEquipped ? (
        <span className="badge-equipped">Equipped as Companion</span>
      ) : onEquip ? (
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => onEquip(item.id)}
        >
          Equip Companion
        </button>
      ) : null}
      {remainingBoxes > 0 ? (
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={onOpenAnother}
        >
          Open Another Box ({remainingBoxes} left)
        </button>
      ) : null}
    </div>
  </div>
);

interface UnopenedBoxProps {
  readonly count: number;
  readonly onOpen: () => void;
}

const UnopenedBlindBox = ({ count, onOpen }: UnopenedBoxProps) => (
  <div className="blind-box-unopened-view">
    <p className="blind-box-hint">
      You received a blind box! Click the box to reveal your minifigure.
    </p>
    <button
      type="button"
      className="blind-box-btn"
      onClick={onOpen}
      aria-label="Open Mystery Blind Box"
    >
      <div className="blind-box-icon" aria-hidden="true">
        🎁
      </div>
      <span className="blind-box-label">
        Click to Open! {count > 1 ? `(${count} available)` : ''}
      </span>
    </button>
  </div>
);

export const BlindBoxCard = ({
  unopenedCount,
  onOpenBox,
  onEquip,
  equippedItemId,
  randomFn
}: BlindBoxCardProps) => {
  const [revealedItem, setRevealedItem] = useState<ShopItem | null>(null);

  const handleOpenClick = () => {
    const chosen = getRandomMinifigure(SHOP_ITEMS, randomFn);
    onOpenBox(chosen);
    setRevealedItem(chosen);
  };

  if (revealedItem) {
    return (
      <RevealedMinifigure
        item={revealedItem}
        remainingBoxes={unopenedCount}
        isEquipped={equippedItemId === revealedItem.id}
        onEquip={onEquip}
        onOpenAnother={() => setRevealedItem(null)}
      />
    );
  }

  if (unopenedCount <= 0) {
    return null;
  }

  return (
    <div className="blind-box-container" aria-label="Mystery Blind Box">
      <UnopenedBlindBox count={unopenedCount} onOpen={handleOpenClick} />
    </div>
  );
};
