const SUPABASE_URL = (process.env.SUPABASE_URL || '').trim();
const SUPABASE_KEY = (process.env.SUPABASE_KEY || '').trim();
const NTFY_TOPIC = (process.env.NTFY_TOPIC || '').trim();

const DEFAULT_SHOPS = [
  { id: 'cigarworld', name: 'Cigarworld / Casa Benden', url: 'https://www.cigarworld.de/zigarren/kuba', interval_min: 3 },
  { id: 'brinkmann', name: 'Brinkmann finest', url: 'https://www.brinkmannfinest.de/zigarren/kuba/', interval_min: 5 },
  { id: 'zigarrentraum', name: 'Zigarrentraum', url: 'https://www.zigarrentraum.de/produkt-kategorie/zigarren-aus-kuba/', interval_min: 3 },
  { id: 'dalay', name: 'Dalay Zigarren', url: 'https://www.dalayzigarren.de/zigarren/kuba/', interval_min: 5 },
  { id: 'tabacstore', name: 'Tabacstore', url: 'https://www.tabacstore.de/zigarren/kuba/', interval_min: 5 },
  { id: 'ccigars', name: 'C-Cigars', url: 'https://c-cigars.de/collections/kubanische-zigarren/products.json?limit=250', interval_min: 2 },
  { id: 'wolsdorff', name: 'Wolsdorff', url: 'https://www.wolsdorff.shop/zigarren/kuba/', interval_min: 5 },
  { id: 'starkezigarren', name: 'StarkeZigarren', url: 'https://www.starkezigarren.de/Kubanische-Zigarren', interval_min: 10 },
  { id: 'pipehouse', name: 'Pipe House', url: 'https://www.pipehouse.de/zigarren/kuba/', interval_min: 10 },
  { id: 'noblego', name: 'Noblego', url: 'https://www.noblego.de/zigarren-aus-kuba/', interval_min: 5 },
  { id: 'nobbis', name: 'Nobbis Tabakwelt', url: 'https://www.nobbis-tabakwelt.de/zigarren/kuba/', interval_min: 5 },
  { id: 'zigarrede', name: 'Zigarre.de', url: 'https://www.zigarre.de/zigarren/kuba/', interval_min: 5 },
  { id: 'paulbugge', name: 'Paul Bugge', url: 'https://www.paul-bugge.com/zigarren/kuba/', interval_min: 5 },
  { id: 'cigarrenversand24', name: 'Cigarrenversand24', url: 'https://www.cigarrenversand24.de/Zigarren/Kuba/', interval_min: 10 },
  { id: 'tabakkontor', name: 'Tabak Kontor Leipzig', url: 'https://www.tabak-kontor.de/zigarren/kuba/', interval_min: 5 },
  { id: 'herzog', name: 'Zigarren Herzog', url: 'https://zigarren-herzog.de/zigarren/kuba/', interval_min: 5 },
  { id: 'zigarrenschachtel', name: 'Zigarrenschachtel', url: 'https://www.zigarrenschachtel.de/zigarren/kuba/', interval_min: 5 },
  { id: 'herzogberlin', name: 'Zigarren Herzog Berlin', url: 'https://zigarren-herzog.de/la-casa-del-habano/', interval_min: 5 }
];

const BRANDS = [
  'Cohiba', 'Montecristo', 'Partagás', 'Partagas', 'Romeo y Julieta', 'Hoyo de Monterrey',
  'H. Upmann', 'Trinidad', 'Bolívar', 'Bolivar', 'Punch', 'Ramón Allones', 'Ramon Allones',
  'Quai d\'Orsay', 'Quai d Orsay', 'Vegas Robaina', 'Cuaba', 'San Cristóbal', 'San Cristobal',
  'Fonseca', 'Juan López', 'Juan Lopez', 'Por Larrañaga', 'Por Larranaga', 'Rafael González',
  'Saint Luis Rey', 'Sancho Panza', 'Vegueros', 'Diplomáticos', 'Diplomaticos', 'El Rey del Mundo',
  'La Gloria Cubana', 'Quintero', 'José L. Piedra', 'Jose L. Piedra', 'Belinda', 'Troya', 'Cabañas', 'Guantanamera'
];

async function sbFetch(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_KEY,
    'Authorization': SUPABASE_KEY.startsWith('eyJ') ? `Bearer ${SUPABASE_KEY}` : SUPABASE_KEY,
    ...(options.headers || {})
  };
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { ...options, headers });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Supabase Fehler (${res.status}): ${txt}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : [];
}

function detectBrand(title) {
  const lower = title.toLowerCase();
  for (const b of BRANDS) {
    if (lower.includes(b.toLowerCase())) {
      if (b === 'Partagas') return 'Partagás';
      if (b === 'Bolivar') return 'Bolívar';
      if (b === 'Ramon Allones') return 'Ramón Allones';
      if (b === 'San Cristobal') return 'San Cristóbal';
      if (b === 'Juan Lopez') return 'Juan López';
      if (b === 'Por Larranaga') return 'Por Larrañaga';
      if (b === 'Diplomaticos') return 'Diplomáticos';
      if (b === 'Jose L. Piedra') return 'José L. Piedra';
      return b;
    }
  }
  return null;
}

function detectEdition(title) {
  const t = title.toLowerCase();
  if (t.includes('limitada') || /\bel\s*20\d\d\b/.test(t)) return 'Edición Limitada';
  if (t.includes('exclusivo') || t.includes('regional') || /\ber\s*20\d\d\b/.test(t)) return 'Exclusivo Regional';
  if (t.includes('aniversario') || t.includes('jubiläum') || t.includes('jar') || t.includes('humidor')) return 'Aniversario';
  if (t.includes('gran reserva') || t.includes('reserva')) return 'Reserva / Gran Reserva';
  if (t.includes('casa del habano') || t.includes('lcdh')) return 'LCDH Edition';
  return 'Standard';
}

async function sendPush(item, isRestock) {
  if (!NTFY_TOPIC) return;
  const tag = isRestock ? 'RESTOCK' : (item.edition_type !== 'Standard' ? item.edition_type.toUpperCase() : 'NEU');
  const title = `[${tag}] ${item.brand}: ${item.title}`;
  const msg = `${item.shop_name} • ${item.price} (${item.format})\nDirektlink: ${item.url}`;
  try {
    await fetch(`https://ntfy.sh/${encodeURIComponent(NTFY_TOPIC)}`, {
      method: 'POST',
      headers: { 'Title': title, 'Priority': 'high', 'Click': item.url },
      body: msg
    });
  } catch (e) {
    console.error('Push-Fehler:', e.message);
  }
}

async function scrapeShop(shop) {
  const items = [];
  const res = await fetch(shop.url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36' }
  });
  if (!res.ok) return items;

  if (shop.url.includes('products.json')) {
    const data = await res.json();
    for (const p of (data.products || [])) {
      const brand = detectBrand(p.title);
      if (!brand) continue;
      for (const v of (p.variants || [])) {
        if (v.available) {
          const fullTitle = v.title && v.title !== 'Default Title' ? `${p.title} - ${v.title}` : p.title;
          items.push({
            id: `${shop.id}-${v.id}`,
            shop_id: shop.id,
            shop_name: shop.name,
            title: fullTitle.slice(0, 140),
            brand,
            price: `${parseFloat(v.price).toFixed(2).replace('.', ',')} €`,
            format: /kiste|box|25|10|50|cabinet/i.test(fullTitle) ? 'Kiste / Box' : 'Verfügbar',
            edition_type: detectEdition(fullTitle),
            in_stock: true,
            url: `https://c-cigars.de/products/${p.handle}`
          });
        }
      }
    }
    return items;
  }

  const html = await res.text();
  const baseOrigin = new URL(shop.url).origin;
  const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  const seen = new Set();
  let match;

  while ((match = linkRegex.exec(html)) !== null) {
    const rawHref = match[1];
    const cleanText = match[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (cleanText.length < 6 || cleanText.length > 150) continue;

    const brand = detectBrand(cleanText);
    if (!brand) continue;

    const fullUrl = rawHref.startsWith('http') ? rawHref : `${baseOrigin}${rawHref.startsWith('/') ? '' : '/'}${rawHref}`;
    if (seen.has(fullUrl)) continue;

    const idx = match.index;
    const context = html.slice(Math.max(0, idx - 350), Math.min(html.length, idx + 950));
    const soldOut = /ausverkauft|nicht\s+lieferbar|nicht\s+auf\s+lager|vergriffen|sold\s*out|derzeit\s+nicht\s+verf/i.test(context);
    if (soldOut) continue;

    const priceMatch = context.match(/(\d{1,4}[.,]\d{2})\s*(?:€|&euro;|EUR)/i);
    const price = priceMatch ? `${priceMatch[1].replace('.', ',')} €` : 'Auf Lager';

    seen.add(fullUrl);
    items.push({
      id: `${shop.id}-${Buffer.from(fullUrl).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(-28)}`,
      shop_id: shop.id,
      shop_name: shop.name,
      title: cleanText,
      brand,
      price,
      format: /kiste|box|25er|10er|50er|cabinet/i.test(cleanText + ' ' + context) ? 'Kiste / Box' : 'Einzel / Verfügbar',
      edition_type: detectEdition(cleanText),
      in_stock: true,
      url: fullUrl
    });
  }
  return items;
}

async function run() {
  console.log('Starte Habanos Scout 24/7 Scan...');
  let shops = await sbFetch('shops?select=*');
  if (!shops || shops.length === 0) {
    console.log('Initialisiere alle 18 Zigarren-Shops in Supabase...');
    await sbFetch('shops', { method: 'POST', body: JSON.stringify(DEFAULT_SHOPS) });
    shops = DEFAULT_SHOPS;
  }

  const existing = await sbFetch('releases?select=id,in_stock');
  const existingMap = new Map((existing || []).map(r => [r.id, r]));
  const isFirstInit = existingMap.size === 0;
  const now = new Date();
  const weekday = (now.getDay() + 6) % 7;
  const hour = now.getHours();

  for (const shop of shops) {
    if (shop.active === false) continue;
    if (shop.last_checked) {
      const diffMin = (now - new Date(shop.last_checked)) / 60000;
      if (diffMin < (shop.interval_min || 5) - 0.5) continue;
    }

    try {
      console.log(`Prüfe ${shop.name}...`);
      const foundItems = await scrapeShop(shop);
      for (const item of foundItems) {
        const prev = existingMap.get(item.id);
        if (!prev) {
          const dropType = item.edition_type !== 'Standard' ? 'NEUERSCHEINUNG' : 'NEU GELISTET';
          const payload = { ...item, drop_type: dropType, weekday, hour, found_at: now.toISOString() };
          await sbFetch('releases', { method: 'POST', headers: { 'Prefer': 'resolution=merge-duplicates' }, body: JSON.stringify(payload) });
          existingMap.set(item.id, payload);
          if (!isFirstInit) await sendPush(payload, false);
        } else if (prev.in_stock === false) {
          const payload = { ...item, drop_type: 'RESTOCK', in_stock: true, weekday, hour, found_at: now.toISOString() };
          await sbFetch(`releases?id=eq.${encodeURIComponent(item.id)}`, { method: 'PATCH', body: JSON.stringify(payload) });
          await sendPush(payload, true);
        }
      }
      await sbFetch(`shops?id=eq.${shop.id}`, { method: 'PATCH', body: JSON.stringify({ last_checked: now.toISOString() }) });
    } catch (err) {
      console.error(`Fehler bei ${shop.name}:`, err.message);
    }
  }
  console.log('Scan erfolgreich abgeschlossen.');
}

run();
