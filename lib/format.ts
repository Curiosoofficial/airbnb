export function formatPrice(amount: number) {
  return `$${amount.toLocaleString("en-US")}`;
}

// plural(1, "guest") -> "1 guest", plural(3, "guest") -> "3 guests"
export function plural(count: number, word: string) {
  return `${count} ${count === 1 ? word : `${word}s`}`;
}

// 4.866 -> "4.87", 4.9 -> "4.9", 5 -> "5.0" (wie bei Airbnb)
export function formatRating(value: number) {
  const fixed = value.toFixed(2);
  return fixed.endsWith("0") ? fixed.slice(0, -1) : fixed;
}
