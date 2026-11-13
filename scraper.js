const SUPABASE_URL = (process.env.SUPABASE_URL || '').trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
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

function withHardTimeout(promise, ms, label) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Timeout (${label})`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

async function sbFetch(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_KEY,
    'Authorization': SUPABASE_KEY.startsWith('eyJ') ? `Bearer ${SUPABASE_KEY}` : SUPABASE_KEY,
    ...(options.headers || {})
  };
  return withHardTimeout((async () => {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { ...options, headers });
    const text = await res.text();
    if (!res.ok) throw new Error(`Supabase (${res.status}): ${text}`);
    return text ? JSON.parse(text) : [];
  })(), 8000, 'Supabase');
}

function detectBrand(title) {
  const lower = title.toLowerCase();
  for (const b of BRANDS) {
    if (lower.includes(b.toLowerCase())) {
      const map = { 'Partagas': 'Partagás', 'Bolivar': 'Bolívar', 'Ramon Allones': 'Ramón Allones', 'San Cristobal': 'San Cristóbal', 'Juan Lopez': 'Juan López', 'Por Larranaga': 'Por Larrañaga', 'Diplomaticos': 'Diplomáticos', 'Jose L. Piedra': 'José L. Piedra' };
      return map[b] || b;
    }
  }
  return null;
}

function detectEdition(title) {
  const t = title.toLowerCase();
  if (t.includes('limitada') || t.includes('el 20') || /\bel\s*20\d\d\b/.test(t)) return 'Edición Limitada';
  if (t.includes('exclusivo') || t.includes('regional') || t.includes('er 20') || /\ber\s*20\d\d\b/.test(t)) return 'Exclusivo Regional';
  if (t.includes('aniversario') || t.includes('jubiläum') || t.includes('jar') || t.includes('humidor') || t.includes('collección')) return 'Aniversario';
  if (t.includes('gran reserva') || t.includes('reserva')) return 'Reserva / Gran Reserva';
  if (t.includes('casa del habano') || t.includes('lcdh')) return 'LCDH Edition';
  return 'Standard';
}

async function sendPush(item, isRestock) {
  if (!NTFY_TOPIC) return;
  const tag = isRestock ? 'RESTOCK' : (item.edition_type !== 'Standard' ? item.edition_type.toUpperCase() : 'NEU');
  const title = `[${tag}] ${item.brand}`;
  const msg = `${item.title}\n${item.shop_name} • ${item.price} (${item.format})\nDirektlink: ${item.url}`;
  try {
    await withHardTimeout(fetch(`https://ntfy.sh/${encodeURIComponent(NTFY_TOPIC)}`, {
      method: 'POST',
      headers: { 'Title': title, 'Priority': 'high', 'Click': item.url },
      body: msg
    }), 4000, 'ntfy');
  } catch (e) {}
}

async function scrapeShopRaw(shop) {
  const items = [];
  
  // ZURÜCK ZUR BASIS: Exakt die einfache Verbindung, die am Anfang fehlerfrei lief. 
  // Keine verdächtigen Custom-Cookies, kein Maskierungs-Schnickschnack, der Firewalls triggert.
  const res = await fetch(shop.url, {
    headers: { 
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125.0.0.0 Safari/537.36'
    }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  if (shop.url.includes('products.json')) {
    const data = await res.json();
    for (const p of (data.products || [])) {
      const brand = detectBrand(p.title);
      if (!brand) continue;
      for (const v of (p.variants || [])) {
        if (v.available) {
          const fullTitle = v.title && v.title !== 'Default Title' ? `${p.title} - ${v.title}` : p.title;
          items.push({
            id: `${shop.id}-${v.id}`, shop_id: shop.id, shop_name: shop.name,
            title: fullTitle.slice(0, 140), brand,
            price: `${parseFloat(v.price).toFixed(2).replace('.', ',')} €`,
            format: /kiste|box|25|10|50|cabinet/i.test(fullTitle) ? 'Kiste / Box' : 'Verfügbar',
            edition_type: detectEdition(fullTitle), in_stock: true,
            url: `https://c-cigars.de/products/${p.handle}`
          });
        }
      }
    }
    return items;
  }

  let html = await res.text();
  const baseOrigin = new URL(shop.url).origin;
  
  // Lösche Header, Footer und Navigationsmenüs komplett aus dem HTML,
  // damit keine falschen Zigarren aus den Dropdown-Menüs gelesen werden.
  html = html.replace(/<(nav|header|footer|aside)[^>]*>[\s\S]*?<\/\1>/gi, '');

  const linkRegex = /href=["']([^"']+)["']/gi;
  const seen = new Set();
  let match;

  while ((match = linkRegex.exec(html)) !== null) {
    const rawHref = match[1];
    
    // Ignoriere nutzlose System-Links
    if (rawHref.length < 5 || /\.(css|js|png|jpg|jpeg|gif|svg|woff|ttf|pdf)/i.test(rawHref) || /warenkorb|login|account|merkzettel|checkout|cart/i.test(rawHref)) continue;

    const fullUrl = rawHref.startsWith('http') ? rawHref : `${baseOrigin}${rawHref.startsWith('/') ? '' : '/'}${rawHref}`;
    if (seen.has(fullUrl)) continue;

    // Radius-Scanner: Nimm den Text 600 Zeichen vor und 800 Zeichen nach dem Link, 
    // entferne alle HTML-Klammern und lese es wie ein Mensch.
    const startIdx = Math.max(0, match.index - 600);
    const endIdx = Math.min(html.length, match.index + 800);
    const cleanContext = html.substring(startIdx, endIdx).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    
    // Harter Filter gegen Nicaragua/Dominikanische Zigarren
    if (/nicaragua|dominikan|honduras|brasil|non-cuba/i.test(fullUrl) || /nicaragua|dominikan|honduras/i.test(cleanContext)) continue;

    const brand = detectBrand(cleanContext);
    if (!brand) continue;

    // Harter Filter gegen Ausverkaufte Artikel
    const isSoldOut = /ausverkauft|nicht\s+lieferbar|nicht\s+auf\s+lager|vergriffen|sold\s*out|out\s*of\s*stock|derzeit\s+nicht|momentan\s+nicht|zurzeit\s+nicht|nicht\s+verfügbar|nicht\s+bestellbar/i.test(cleanContext);
    if (isSoldOut) continue;

    const bIdx = cleanContext.toLowerCase().indexOf(brand.toLowerCase());
    const title = cleanContext.substring(bIdx, bIdx + 100).split(/€|inkl\.|Preis|Details|Auf den|In den|Lieferzeit|Stück|Kiste/i)[0].trim();
    if (title.length < 5 || title.length > 140) continue;

    // Erkennt auch Preise mit Sternchen (z.B. 12,50 * € oder 12,50 € *)
    const priceMatch = cleanContext.match(/(\d{1,4}[.,]\d{2})\s*\*?\s*(?:€|&euro;|EUR)/i);
    
    seen.add(fullUrl);
    items.push({
      id: `${shop.id}-${Buffer.from(fullUrl).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(-28)}`,
      shop_id: shop.id, shop_name: shop.name, title: title, brand,
      price: priceMatch ? `${priceMatch[1].replace('.', ',')} €` : 'Auf Lager',
      format: /kiste|box|25er|10er|50er|cabinet/i.test(cleanContext) ? 'Kiste / Box' : 'Einzel / Verfügbar',
      edition_type: detectEdition(cleanContext), in_stock: true, url: fullUrl
    });
  }
  return items;
}

async function run() {
  const startTime = Date.now();
  console.log('Starte Habanos Scout Deep-Scan (Back to Basics Mode)...');
  let shops = await sbFetch('shops?select=*');
  if (!shops || shops.length === 0) shops = DEFAULT_SHOPS;

  const existing = await sbFetch('releases?select=id,in_stock');
  const existingMap = new Map((existing || []).map(r => [r.id, r]));
  const isFirstInit = existingMap.size === 0;
  const now = new Date();
  const weekday = (now.getDay() + 6) % 7;
  const hour = now.getHours();

  await Promise.allSettled(shops.filter(s => s.active !== false).map(async (shop) => {
    try {
      const foundItems = await withHardTimeout(scrapeShopRaw(shop), 8500, shop.name);
      const toUpsert = [];
      let pushCount = 0;

      for (const item of foundItems) {
        const prev = existingMap.get(item.id);
        if (!prev) {
          const dropType = item.edition_type !== 'Standard' ? 'NEUERSCHEINUNG' : 'NEU GELISTET';
          const payload = { ...item, drop_type: dropType, weekday, hour, found_at: now.toISOString() };
          toUpsert.push(payload);
          existingMap.set(item.id, payload);
          if (!isFirstInit && pushCount < 3) { await sendPush(payload, false); pushCount++; }
        } else if (prev.in_stock === false) {
          const payload = { ...item, drop_type: 'RESTOCK', in_stock: true, weekday, hour, found_at: now.toISOString() };
          toUpsert.push(payload);
          existingMap.set(item.id, payload);
          if (pushCount < 3) { await sendPush(payload, true); pushCount++; }
        }
      }

      if (toUpsert.length > 0) {
        await sbFetch('releases', { method: 'POST', headers: { 'Prefer': 'resolution=merge-duplicates' }, body: JSON.stringify(toUpsert) });
      }
      await sbFetch(`shops?id=eq.${shop.id}`, { method: 'PATCH', body: JSON.stringify({ last_checked: now.toISOString() }) });
      console.log(`✓ ${shop.name}: ${foundItems.length} gefunden (${toUpsert.length} neu)`);
    } catch (err) {
      console.log(`✗ ${shop.name}: ${err.message}`);
    }
  }));

  console.log(`Fertig in ${((Date.now() - startTime) / 1000).toFixed(1)} Sek.`);
  process.exit(0);
}

run();
