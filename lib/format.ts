export function formatPrice(amount: number) {
  return `$${amount.toLocaleString("en-US")}`;
}

// plural(1, "guest") -> "1 guest", plural(3, "guest") -> "3 guests"
export function plural(count: number, word: string) {
  return `${count} ${count === 1 ? word : `${word}s`}`;
}
