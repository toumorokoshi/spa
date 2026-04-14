/** Whether this key event should advance the card (Space / Enter, not in text fields). */
export const isNextCardShortcut = (e: KeyboardEvent): boolean => {
  if (e.key !== ' ' && e.key !== 'Enter') {
    return false;
  }
  const t = e.target;
  if (t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement) {
    return false;
  }
  return true;
};
