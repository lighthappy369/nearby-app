export const TRACKABLE_EVENTS = new Set([
  'page_view',
  'checkout_click',
  'paid',
  'test_completed'
]);

export function validateEventName(name) {
  return TRACKABLE_EVENTS.has(name);
}
