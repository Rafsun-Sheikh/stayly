const express = require('express');
const path = require('path');
const listings = require('./data/listings');

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const categories = [...new Set(listings.map(l => l.category))];

// Filter by category, destination text, guests and max price (all from the query string)
function filterListings(q) {
  let r = listings;
  if (q.category && q.category !== 'All') r = r.filter(l => l.category === q.category);
  if (q.where) r = r.filter(l => (l.location + ' ' + l.title).toLowerCase().includes(q.where.trim().toLowerCase()));
  if (q.guests) r = r.filter(l => l.guests >= Number(q.guests));
  if (q.max) r = r.filter(l => l.price <= Number(q.max));
  return r;
}

app.get('/', (req, res) => {
  res.render('index', { listings: filterListings(req.query), categories, q: req.query });
});

app.get('/api/listings', (req, res) => res.json(filterListings(req.query)));

app.get('/listings/:id', (req, res, next) => {
  const l = listings.find(x => x.id === Number(req.params.id));
  if (!l) return next();
  res.render('listing', { l, q: {}, error: null });
});

app.post('/listings/:id/reserve', (req, res, next) => {
  const l = listings.find(x => x.id === Number(req.params.id));
  if (!l) return next();
  const { checkin, checkout, guests } = req.body;
  const nights = Math.round((new Date(checkout) - new Date(checkin)) / 86400000);
  if (!checkin || !checkout || !(nights > 0) || Number(guests) > l.guests) {
    return res.status(400).render('listing', { l, q: {}, error: 'Pick valid dates and a guest count within the limit.' });
  }
  const subtotal = nights * l.price;
  const fee = Math.round(subtotal * 0.1);
  res.render('confirm', { l, q: {}, booking: { checkin, checkout, guests, nights, subtotal, fee, total: subtotal + fee } });
});

app.get('/wishlist', (req, res) => res.render('wishlist', { listings, q: {} }));

app.use((req, res) => res.status(404).render('404', { q: {} }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Stayly running at http://localhost:${PORT}`));
