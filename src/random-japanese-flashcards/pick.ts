export const initialIndex = (length: number, rng: () => number): number => {
  if (length <= 0) {
    return 0;
  }
  return Math.floor(rng() * length);
};

/** Uniform random index in `[0, length)` excluding `current` when `length > 1`. */
export const nextIndex = (
  length: number,
  current: number,
  rng: () => number
): number => {
  if (length <= 1) {
    return 0;
  }
  const pick = Math.floor(rng() * (length - 1));
  return pick < current ? pick : pick + 1;
};
