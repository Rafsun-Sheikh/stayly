// Wishlist (saved in localStorage, so it survives reloads)
const KEY = 'stayly:wishlist';
const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
const write = ids => { try { localStorage.setItem(KEY, JSON.stringify(ids)); } catch {} };

function syncWishlistUI() {
  const ids = read();
  document.querySelectorAll('.heart').forEach(b => {
    const on = ids.includes(Number(b.dataset.id));
    b.classList.toggle('on', on);
    b.setAttribute('aria-pressed', on);
  });
  const badge = document.getElementById('wishCount');
  badge.textContent = ids.length;
  badge.hidden = ids.length === 0;
  const grid = document.getElementById('wishGrid');
  if (grid) { // wishlist page: show only saved cards
    let shown = 0;
    grid.querySelectorAll('.card').forEach(c => {
      const keep = ids.includes(Number(c.dataset.id));
      c.hidden = !keep;
      if (keep) shown++;
    });
    document.getElementById('wishEmpty').hidden = shown > 0;
  }
}

document.addEventListener('click', e => {
  const btn = e.target.closest('.heart');
  if (!btn) return;
  const id = Number(btn.dataset.id);
  const ids = read();
  write(ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]);
  syncWishlistUI();
});
syncWishlistUI();

// Header shadow on scroll
const header = document.getElementById('siteHeader');
addEventListener('scroll', () => header.classList.toggle('scrolled', scrollY > 8), { passive: true });

// Live price breakdown on the listing page
const form = document.getElementById('reserveForm');
if (form) {
  const price = Number(form.dataset.price);
  const ci = form.checkin, co = form.checkout;
  ci.min = co.min = new Date().toISOString().split('T')[0];
  const update = () => {
    if (ci.value) co.min = ci.value;
    const nights = Math.round((new Date(co.value) - new Date(ci.value)) / 86400000);
    const box = document.getElementById('totals');
    if (!(nights > 0)) { box.hidden = true; return; }
    const sub = nights * price, fee = Math.round(sub * 0.1);
    document.getElementById('nightsLabel').textContent = `$${price} × ${nights} night${nights > 1 ? 's' : ''}`;
    document.getElementById('sub').textContent = `$${sub}`;
    document.getElementById('fee').textContent = `$${fee}`;
    document.getElementById('total').textContent = `$${sub + fee}`;
    box.hidden = false;
  };
  ci.addEventListener('change', update);
  co.addEventListener('change', update);
}
