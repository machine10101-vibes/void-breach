export const TOUCH_UI_QUERY = "(pointer: coarse), (max-width: 819px), (max-height: 540px)";

export function isTouchUi() {
  if (typeof window === "undefined") return false;
  return window.matchMedia(TOUCH_UI_QUERY).matches;
}
