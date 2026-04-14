// Lightweight client-side navigation — no react-router needed.
// Pushes to history and fires a popstate event so the Router re-renders.

export function navigate(to: string) {
  window.history.pushState(null, '', to);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export function replace(to: string) {
  window.history.replaceState(null, '', to);
  window.dispatchEvent(new PopStateEvent('popstate'));
}
