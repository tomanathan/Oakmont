// Moves one skill to the front of a study-plan order, keeping the rest in
// place: the skill a student's /start questions picked out leads week 1.
export function leadWith(order: string[], firstId: string | null | undefined): string[] {
  if (!firstId || !order.includes(firstId) || order[0] === firstId) return order;
  return [firstId, ...order.filter((id) => id !== firstId)];
}
