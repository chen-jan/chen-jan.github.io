(() => {
  if (new URLSearchParams(location.search).has('embed')) document.documentElement.classList.add('embed');
  const triggers = [...document.querySelectorAll('[data-panel]')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const animations = new Map();
  const desired = new Map();
  function setPanel(id, open, { animate = true, source = null, scroll = false } = {}) {
    const panel = document.getElementById(id);
    if (!panel) return;
    // Capture the current frame before cancellation so reversals stay continuous.
    const style = getComputedStyle(panel);
    const current = panel.hidden
      ? { height:'0px', marginTop:'0px', marginBottom:'0px', opacity:0 }
      : { height:panel.getBoundingClientRect().height+'px', marginTop:style.marginTop, marginBottom:style.marginBottom, opacity:style.opacity };
    const previous = animations.get(id);
    if (previous) previous.cancel();
    desired.set(id, open);
    triggers.filter(t => t.dataset.panel === id).forEach(t => t.setAttribute('aria-expanded', String(open)));
    if (!open && panel.contains(document.activeElement)) {
      (source || triggers.find(t => t.dataset.panel === id)).focus({preventScroll:true});
    }
    panel.inert = !open;
    const finish = () => {
      panel.hidden = !open;
      panel.style.overflow = '';
      animations.delete(id);
      if (open && scroll) panel.scrollIntoView({block:'nearest', behavior:reducedMotion.matches ? 'instant' : 'smooth'});
    };
    if (!animate || reducedMotion.matches || !panel.animate) {
      finish();
      return;
    }
    panel.hidden = false;
    const natural = getComputedStyle(panel);
    const expanded = { height:panel.getBoundingClientRect().height+'px', marginTop:natural.marginTop, marginBottom:natural.marginBottom, opacity:1 };
    const collapsed = { height:'0px', marginTop:'0px', marginBottom:'0px', opacity:0 };
    panel.style.overflow = 'hidden';
    const animation = panel.animate([current, open ? expanded : collapsed], { duration:open ? 260 : 190, easing:'cubic-bezier(.2,.65,.3,1)' });
    animations.set(id, animation);
    animation.finished.then(() => {
      if (animations.get(id) !== animation) return;
      finish();
    }).catch(() => {});
  }
  triggers.forEach(trigger => trigger.addEventListener('click', () => {
    const panel = document.getElementById(trigger.dataset.panel);
    const opening = trigger.getAttribute('aria-expanded') !== 'true';
    setPanel(panel.id, opening, {source:trigger, scroll:opening && !!trigger.closest('.index')});
  }));
  function openHash() {
    const id = location.hash.slice(1);
    if (triggers.some(t => t.dataset.panel === id)) setPanel(id, true, {animate:false});
  }
  openHash();
  window.addEventListener('hashchange', openHash);
  reducedMotion.addEventListener('change', event => {
    if (event.matches) [...animations.keys()].forEach(id => setPanel(id, desired.get(id), {animate:false}));
  });
  const toggle = document.getElementById('theme-toggle');
  let dotAnimation;
  const preference = window.matchMedia('(prefers-color-scheme: dark)');
  let theme = preference.matches ? 'dark' : 'light';
  let manual = false;
  try { const stored = localStorage.getItem('jan-minimal-theme'); if (stored === 'dark' || stored === 'light') { theme = stored; manual = true; } } catch {}
  function renderTheme() {
    document.documentElement.style.colorScheme = theme;
    toggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    toggle.setAttribute('aria-pressed', String(theme === 'dark'));
  }
  toggle.addEventListener('click', () => {
    theme = theme === 'dark' ? 'light' : 'dark';
    manual = true;
    renderTheme();
    if (!reducedMotion.matches && toggle.animate) {
      if (dotAnimation) dotAnimation.cancel();
      dotAnimation = toggle.querySelector('span').animate([{transform:'scale(1)'},{transform:'scale(.72)',offset:.35},{transform:'scale(1)'}], {duration:220,easing:'cubic-bezier(.2,.65,.3,1)'});
    }
    try { localStorage.setItem('jan-minimal-theme', theme); } catch {}
  });
  preference.addEventListener('change', event => { if (!manual) { theme = event.matches ? 'dark' : 'light'; renderTheme(); } });
  renderTheme();
})();
