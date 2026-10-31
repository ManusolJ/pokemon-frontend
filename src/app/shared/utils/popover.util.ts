const GAP_PX = 6;
const VIEWPORT_MARGIN_PX = 8;

export function placeUnder(trigger: HTMLElement, popover: HTMLElement): void {
  const anchor = trigger.getBoundingClientRect();
  const width = popover.offsetWidth || 224;

  const right = Math.min(anchor.right, window.innerWidth - VIEWPORT_MARGIN_PX);
  const left = Math.max(VIEWPORT_MARGIN_PX, right - width);

  popover.style.top = `${anchor.bottom + GAP_PX}px`;
  popover.style.left = `${left}px`;
}
