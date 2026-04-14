type FlashcardControlsProps = {
  starredOnly: boolean;
  onStarredOnlyChange: (next: boolean) => void;
  starPressed: boolean;
  onStarToggle: () => void;
  starDisabled: boolean;
};

export const FlashcardControls = ({
  starredOnly,
  onStarredOnlyChange,
  starPressed,
  onStarToggle,
  starDisabled
}: FlashcardControlsProps) => (
  <div className="toolbar">
    <button
      type="button"
      className="star"
      onClick={onStarToggle}
      aria-pressed={starPressed}
      disabled={starDisabled}
      aria-label={starPressed ? 'Remove star from this word' : 'Star this word'}
    >
      {starPressed ? '★' : '☆'}
    </button>
    <label className="starred-only">
      <input
        type="checkbox"
        checked={starredOnly}
        onChange={(e) => onStarredOnlyChange(e.currentTarget.checked)}
      />{' '}
      Practice starred only
    </label>
    <p className="kbd-hint">Space or Enter: next card</p>
  </div>
);
