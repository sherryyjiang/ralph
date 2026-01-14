// Chipotle test transaction - isolated test data
export const chipotleTestTransaction = {
  id: "chipotle_test_001",
  merchant: "Chipotle",
  amount: 12.42,
  category: "food" as const,
  date: new Date(),
  isFirstTime: false,
};

export function getChipotleTestTransaction() {
  return chipotleTestTransaction;
}
