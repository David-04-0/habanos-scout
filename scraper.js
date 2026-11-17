const SUPABASE_URL = (process.env.SUPABASE_URL || '').trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
const SUPABASE_KEY = (process.env.SUPABASE_KEY || '').trim();
const NTFY_TOPIC = (process.env.NTFY_TOPIC || '').trim();

// Verifizierte Original-URLs + Zusatz-Quellen (Marken/Aktionen)
const DEFAULT_SHOPS = [
  {
    id: 'wolsdorff',
    name: 'Wolsdorff',
    url: 'https://wolsdorff.shop/zigarren/entdecken/kubanische-zigarren/',
    extra_urls: [
      'https://wolsdorff.shop/kuba-freitag',
      'https://wolsdorff.shop/zigarren/entdecken/kubanische-zigarren/?p=2',
      'https://wolsdorff.shop/zigarren/entdecken/kubanische-zigarren/?p=3',
      'https://wolsdorff.shop/zigarren/entdecken/kubanische-zigarren/?p=4',
      'https://wolsdorff.shop/zigarren/entdecken/kubanische-zigarren/?p=5',
      'https://wolsdorff.shop/zigarren/entdecken/kubanische-zigarren/?p=6',
      'https://wolsdorff.shop/zigarren/entdecken/kubanische-zigarren/?p=7',
      'https://wolsdorff.shop/zigarren/entdecken/kubanische-zigarren/?p=8'
    ],
    interval_min: 5
  },
  {
    id: 'cigarworld',
    name: 'Cigarworld / Casa Benden',
    url: 'https://www.cigarworld.de/zigarren/kuba',
    crawl_subpages: true,
    subpage_pattern: /\/zigarren\/kuba\/(regulares|limitadas|exclusivos|anos-chinos|reserva|coleccion|vintage)\//i,
    interval_min: 5
  },
  {
    id: 'ccigars',
    name: 'C-Cigars',
    url: 'https://c-cigars.de/collections/kubanische-zigarren/products.json?limit=250',
    interval_min: 3
  },
  {
    id: 'herzog',
    name: 'Zigarren Herzog & LCDH Berlin',
    url: 'https://zigarren-herzog.com/collections/kuba/products.json?limit=250',
    interval_min: 5
  },
  {
    id: 'dalay',
    name: 'Dalay Zigarren',
    url: 'https://www.dalayzigarren.de/kubanische-zigarren',
    extra_urls: [
      'https://www.dalayzigarren.de/kubanische-zigarren?p=2',
      'https://www.dalayzigarren.de/kubanische-zigarren?p=3',
      'https://www.dalayzigarren.de/kubanische-zigarren?p=4',
      'https://www.dalayzigarren.de/kubanische-zigarren?p=5',
      'https://www.dalayzigarren.de/kubanische-zigarren?p=6'
    ],
    interval_min: 5
  },
  {
    id: 'noblego',
    name: 'Noblego',
    url: 'https://www.noblego.de/kubanische-zigarren/',
    extra_urls: [
      'https://www.noblego.de/cohiba-zigarren/',
      'https://www.noblego.de/montecristo-zigarren/',
      'https://www.noblego.de/partagas-zigarren/',
      'https://www.noblego.de/romeo-y-julieta-zigarren/',
      'https://www.noblego.de/hoyo-de-monterrey-zigarren/',
      'https://www.noblego.de/h-upmann-zigarren/',
      'https://www.noblego.de/trinidad-zigarren/',
      'https://www.noblego.de/bolivar-zigarren/',
      'https://www.noblego.de/ramon-allones-zigarren/',
      'https://www.noblego.de/punch-zigarren/',
      'https://www.noblego.de/quai-d-orsay-zigarren/'
    ],
    interval_min: 5
  },
  {
    id: 'paulbugge',
    name: 'Paul Bugge',
    url: 'https://www.paul-bugge.com/kubanische-zigarren',
    extra_urls: [
      'https://www.paul-bugge.com/cohiba-zigarren',
      'https://www.paul-bugge.com/montecristo-zigarren',
      'https://www.paul-bugge.com/partagas-zigarren',
      'https://www.paul-bugge.com/romeo-y-julieta-zigarren',
      'https://www.paul-bugge.com/hoyo-de-monterrey-zigarren',
      'https://www.paul-bugge.com/h-upmann-zigarren',
      'https://www.paul-bugge.com/trinidad-zigarren',
      'https://www.paul-bugge.com/bolivar-zigarren'
    ],
    interval_min: 5
  },
  {
    id: 'zigarrede',
    name: 'Zigarre.de',
    url: 'https://www.zigarre.de/kubanische-zigarren.html',
    extra_urls: [
      'https://www.zigarre.de/cohiba.html',
      'https://www.zigarre.de/montecristo.html',
      'https://www.zigarre.de/partagas.html',
      'https://www.zigarre.de/romeo-y-julieta.html',
      'https://www.zigarre.de/hoyo-de-monterrey.html',
      'https://www.zigarre.de/h-upmann.html',
      'https://www.zigarre.de/trinidad.html',
      'https://www.zigarre.de/bolivar.html'
    ],
    interval_min: 5
  },
  {
    id: 'tabacstore',
    name: 'Tabacstore',
    url: 'https://www.tabacstore.de/kubanische-zigarren/',
    crawl_subpages: true,
    subpage_pattern: /\/kubanische-zigarren\/[a-z0-9._-]+\/?$/i,
    interval_min: 5
  },
  {
    id: 'brinkmann',
    name: 'Brinkmann finest',
    url: 'https://brinkmannfinest.de/zigarren/herkunft/kuba/',
    extra_urls: [
      'https://brinkmannfinest.de/zigarren/herkunft/kuba/?p=2',
      'https://brinkmannfinest.de/zigarren/herkunft/kuba/?p=3',
      'https://brinkmannfinest.de/zigarren/herkunft/kuba/?p=4'
    ],
    interval_min: 5
  },
  {
    id: 'zigarrentraum',
    name: 'Zigarrentraum',
    url: 'https://www.zigarrentraum.de/sortiment/zigarren/kubanische-zigarren/',
    crawl_subpages: true,
    subpage_pattern: /\/sortiment\/zigarren\/kubanische-zigarren\//i,
    interval_min: 5
  },
  {
    id: 'zigarrenschachtel',
    name: 'Zigarrenschachtel',
    url: 'https://www.zigarrenschachtel.de/kubanische-zigarren',
    extra_urls: [
      'https://www.zigarrenschachtel.de/kubanische-zigarren_s2',
      'https://www.zigarrenschachtel.de/kubanische-zigarren_s3',
      'https://www.zigarrenschachtel.de/kubanische-zigarren_s4',
      'https://www.zigarrenschachtel.de/kubanische-zigarren_s5',
      'https://www.zigarrenschachtel.de/kubanische-zigarren_s6'
    ],
    interval_min: 5
  },
  {
    id: 'pipehouse',
    name: 'Pipe House',
    url: 'https://pipehouse.de/herkunft/cuba/',
    extra_urls: [
      'https://pipehouse.de/herkunft/cuba/page/2/',
      'https://pipehouse.de/herkunft/cuba/page/3/',
      'https://pipehouse.de/herkunft/cuba/page/4/'
    ],
    interval_min: 10
  },
  {
    id: 'nobbis',
    name: 'Nobbis Tabakwelt',
    url: 'https://www.nobbis-tabakwelt.de/herkunft/kuba/',
    extra_urls: [
      'https://www.nobbis-tabakwelt.de/herkunft/kuba/page/2/',
      'https://www.nobbis-tabakwelt.de/herkunft/kuba/page/3/',
      'https://www.nobbis-tabakwelt.de/zigarren/kubanische-zigarren/'
    ],
    interval_min: 5
  },
  {
    id: 'starkezigarren',
    name: 'StarkeZigarren',
    url: 'https://www.starkezigarren.de/zigarren/kuba/',
    interval_min: 10
  },
  {
    id: 'cigarrenversand24',
    name: 'Cigarrenversand24',
    url: 'https://www.cigarrenversand24.de/Cigarren/Kuba/',
    interval_min: 10
  },
  {
    id: 'tabakkontor',
    name: 'Tabak Kontor Leipzig',
    url: 'https://www.tabak-kontor.de/',
    interval_min: 10
  }
];

const BRANDS = [
  'Cohiba', 'Montecristo', 'Partagás', 'Partagas', 'Romeo y Julieta', 'Hoyo de Monterrey',
  'H. Upmann', 'H.Upmann', 'Upmann', 'Trinidad', 'Bolívar', 'Bolivar', 'Punch',
  'Ramón Allones', 'Ramon Allones', 'Quai d\'Orsay', 'Quai d Orsay', 'Vegas Robaina',
  'Cuaba', 'San Cristóbal', 'San Cristobal', 'Fonseca', 'Juan López', 'Juan Lopez',
  'Por Larrañaga', 'Por Larranaga', 'Rafael González', 'Rafael Gonzalez', 'Saint Luis Rey',
  'Sancho Panza', 'Vegueros', 'Diplomáticos', 'Diplomaticos', 'El Rey del Mundo',
  'La Gloria Cubana', 'Quintero', 'José L. Piedra', 'Jose L. Piedra', 'J. L. Piedra',
  'La Flor de Cano', 'Flor de Cano', 'Guantanamera'
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
  })(), 10000, 'Supabase');
}

function detectBrand(title) {
  const lower = title.toLowerCase();
  for (const b of BRANDS) {
    if (lower.includes(b.toLowerCase())) {
      const map = {
        'Partagas': 'Partagás', 'Bolivar': 'Bolívar', 'Ramon Allones': 'Ramón Allones',
        'San Cristobal': 'San Cristóbal', 'Juan Lopez': 'Juan López', 'Por Larranaga': 'Por Larrañaga',
        'Diplomaticos': 'Diplomáticos', 'Jose L. Piedra': 'José L. Piedra', 'J. L. Piedra': 'José L. Piedra',
        'H.Upmann': 'H. Upmann', 'Upmann': 'H. Upmann', 'Rafael Gonzalez': 'Rafael González',
        'Quai d Orsay': 'Quai d\'Orsay', 'Flor de Cano': 'La Flor de Cano'
      };
      return map[b] || b;
    }
  }
  return null;
}

function detectEdition(title) {
  const t = title.toLowerCase();
  if (t.includes('limitada') || t.includes('el 20') || /\bel\s*20\d\d\b/.test(t) || /\ble\s*20\d\d\b/.test(t)) return 'Edición Limitada';
  if (t.includes('exclusivo') || t.includes('regional') || t.includes('er 20') || /\ber\s*20\d\d\b/.test(t)) return 'Exclusivo Regional';
  if (t.includes('aniversario') || t.includes('jubiläum') || t.includes('jar') || t.includes('humidor') || t.includes('colección') || t.includes('year of the') || t.includes('linea maestra') || t.includes('línea maestra') || t.includes('linea de oro') || t.includes('línea de oro') || t.includes('behike')) return 'Rarität / Sonderedition';
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

async function fetchHtml(url) {
  const res = await withHardTimeout(fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'de-DE,de;q=0.9,en;q=0.8'
    }
  }), 10000, url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.text();
}

// Parst eine einzelne HTML-Seite in isolierten Produkt-Kacheln
function parseProductsFromHtml(html, shop, baseOrigin, seenUrls) {
  const found = [];

  // Entferne Header, Navigation, Footer, damit keine Menü-Links als Produkte gezählt werden
  const cleanHtml = html
    .replace(/<(nav|header|footer|aside|script|style)[^>]*>[\s\S]*?<\/\1>/gi, ' ');

  // Zerlege die Seite anhand typischer Shop-Produktcontainer (Shopware, WooCommerce, JTL, Cigarworld-Tabellen)
  let cards = cleanHtml.split(/(?=<(?:article|li|div|tr)[^>]*class=["'][^"']*(?:product|item|card|box|artbox|listing|result|type-product)[^"']*["'])/i);
  if (cards.length < 4) {
    cards = cleanHtml.split(/(?=<a\s[^>]*href=)/i);
  }

  for (const card of cards) {
    if (card.length < 30 || card.length > 15000) continue;

    // Finde Produktlink und optionales title-Attribut
    const linkMatch = card.match(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/i);
    if (!linkMatch) continue;

    const rawHref = linkMatch[1].trim();
    if (rawHref.length < 5 || rawHref.startsWith('#') || rawHref.startsWith('javascript:')) continue;
    if (/\.(css|js|png|jpg|jpeg|gif|svg|pdf|webp)$/i.test(rawHref)) continue;
    if (/warenkorb|cart|checkout|login|account|merk|wishlist|impressum|datenschutz|agb|kontakt|versand|blog|lexikon|wiki/i.test(rawHref)) continue;

    const fullUrl = rawHref.startsWith('http') ? rawHref : `${baseOrigin}${rawHref.startsWith('/') ? '' : '/'}${rawHref}`;
    if (seenUrls.has(fullUrl)) continue;

    // Anti-New-World-Filter auf URL-Ebene
    if (/dominikan|nicaragua|honduras|brasil|mexiko|costa-rica|panama|cameroon|zubehoer|feuerzeug|aschenbecher|humidor|cutter|bohrer/i.test(fullUrl)) continue;

    const text = card.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
    if (text.length < 10) continue;

    // Anti-New-World-Filter auf Text-Ebene
    if (/dominikanische\s+republik|herkunft:\s*(?:nicaragua|honduras|dominikan)|aus\s+nicaragua|aus\s+honduras/i.test(text)) continue;

    const brand = detectBrand(text);
    if (!brand) continue;

    // Muss ein echtes Produkt mit Preisangabe sein (verhindert reine Kategorie-Überschriften)
    const priceMatch = text.match(/(\d{1,4}(?:[.,]\d{3})*[.,]\d{2})\s*\*?\s*(?:€|&euro;|EUR)/i) || text.match(/(?:€|EUR)\s*(\d{1,4}[.,]\d{2})/i);
    if (!priceMatch) continue;

    // Präzise Verfügbarkeitsprüfung innerhalb dieser isolierten Produktkarte
    const soldOutRegex = /momentan\s+nicht\s+verf|nicht\s+verf[üu]gbar|nicht\s+lieferbar|nicht\s+auf\s+lager|ausverkauft|vergriffen|sold\s*out|out\s*of\s*stock|liefertermin\s+unbekannt|derzeit\s+nicht|aktuell\s+nicht|wird\s+nachbestellt/i;
    const inStockRegex = /auf\s+lager|sofort\s+verf|sofort\s+lieferbar|versandfertig|in\s+den\s+warenkorb|alleslieferbar|einige\s+variationen\s+verf/i;

    let inStock = true;
    if (soldOutRegex.test(text) && !inStockRegex.test(text)) {
      inStock = false;
    } else if (soldOutRegex.test(text) && inStockRegex.test(text)) {
      // Wenn ein Produkt mehrere Varianten (z.B. Einzel = Auf Lager, 25er Kiste = Ausverkauft) hat:
      inStock = true;
    }

    // Sauberen Titel extrahieren
    let linkTitle = linkMatch[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const titleAttr = card.match(/title=["']([^"']{6,120})["']/i);
    let cleanTitle = (detectBrand(linkTitle) ? linkTitle : (titleAttr && detectBrand(titleAttr[1]) ? titleAttr[1] : '')).trim();

    if (!cleanTitle) {
      const bIdx = text.toLowerCase().indexOf(brand.toLowerCase());
      cleanTitle = text.substring(bIdx, bIdx + 95).split(/€|EUR|inkl\.|Preis|Details|Inhalt:|Artikelnummer|Herkunftsland|Momentan|Auf Lager|Nicht /i)[0].trim();
    }
    if (cleanTitle.length < 5) continue;

    seenUrls.add(fullUrl);
    found.push({
      id: `${shop.id}-${Buffer.from(fullUrl).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(-32)}`,
      shop_id: shop.id,
      shop_name: shop.name,
      title: cleanTitle.slice(0, 130),
      brand,
      price: `${priceMatch[1].replace('.', ',')} €`,
      format: /kiste|box|25er|20er|10er|50er|cabinet|dress\s*box|slb|sbn/i.test(text) ? 'Kiste / Box' : 'Einzel / Verfügbar',
      edition_type: detectEdition(cleanTitle + ' ' + text),
      in_stock: inStock,
      url: fullUrl
    });
  }

  return found;
}

async function scrapeShop(shopConfig) {
  const items = [];
  const baseOrigin = new URL(shopConfig.url).origin;

  // 1. Shopify JSON-API (C-Cigars & Zigarren Herzog)
  if (shopConfig.url.includes('products.json')) {
    const res = await withHardTimeout(fetch(shopConfig.url, {
      headers: { 'User-Agent': 'Mozilla/5.0 Chrome/126.0.0.0 Safari/537.36' }
    }), 10000, shopConfig.name);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    for (const p of (data.products || [])) {
      const brand = detectBrand(p.title + ' ' + (p.vendor || ''));
      if (!brand) continue;
      for (const v of (p.variants || [])) {
        const fullTitle = v.title && v.title !== 'Default Title' ? `${p.title} - ${v.title}` : p.title;
        items.push({
          id: `${shopConfig.id}-${v.id}`,
          shop_id: shopConfig.id,
          shop_name: shopConfig.name,
          title: fullTitle.slice(0, 130),
          brand,
          price: `${parseFloat(v.price).toFixed(2).replace('.', ',')} €`,
          format: /kiste|box|25|20|10|50|cabinet/i.test(fullTitle) ? 'Kiste / Box' : 'Einzel / Verfügbar',
          edition_type: detectEdition(fullTitle),
          in_stock: Boolean(v.available),
          url: `${baseOrigin}/products/${p.handle}`
        });
      }
    }
    return { items, pagesScanned: 1 };
  }

  // 2. HTML-Hauptseite abrufen
  const seenUrls = new Set();
  const mainHtml = await fetchHtml(shopConfig.url);
  items.push(...parseProductsFromHtml(mainHtml, shopConfig, baseOrigin, seenUrls));

  // 3. Alle Marken-Unterseiten & Paginierungs-Seiten sammeln
  const subUrls = new Set(shopConfig.extra_urls || []);

  if (shopConfig.crawl_subpages && shopConfig.subpage_pattern) {
    const hrefRegex = /href=["']([^"']+)["']/gi;
    let m;
    while ((m = hrefRegex.exec(mainHtml)) !== null) {
      const u = m[1].startsWith('http') ? m[1] : `${baseOrigin}${m[1].startsWith('/') ? '' : '/'}${m[1]}`;
      if (shopConfig.subpage_pattern.test(u) && u !== shopConfig.url) {
        subUrls.add(u);
      }
    }
  }

  // Parallel in 4er-Gruppen alle Marken- & Unterseiten abrufen
  const urlList = Array.from(subUrls).slice(0, 35);
  let pagesScanned = 1;

  for (let i = 0; i < urlList.length; i += 4) {
    const batch = urlList.slice(i, i + 4);
    const results = await Promise.allSettled(batch.map(u => fetchHtml(u)));
    for (const r of results) {
      if (r.status === 'fulfilled') {
        pagesScanned++;
        items.push(...parseProductsFromHtml(r.value, shopConfig, baseOrigin, seenUrls));
      }
    }
  }

  return { items, pagesScanned };
}

async function run() {
  const startTime = Date.now();
  console.log('=== Starte Habanos Scout Multi-Page & Marken-Scanner ===');

  // Synchronisiere immer die verifizierten Shop-URLs in Supabase
  const dbShopsPayload = DEFAULT_SHOPS.map(s => ({
    id: s.id, name: s.name, url: s.url, interval_min: s.interval_min, active: true
  }));
  await sbFetch('shops', {
    method: 'POST',
    headers: { 'Prefer': 'resolution=merge-duplicates' },
    body: JSON.stringify(dbShopsPayload)
  });

  const existing = await sbFetch('releases?select=id,in_stock,price');
  const existingMap = new Map((existing || []).map(r => [r.id, r]));
  const isFirstInit = existingMap.size === 0;
  const now = new Date();
  const weekday = (now.getDay() + 6) % 7;
  const hour = now.getHours();

  for (const shopConfig of DEFAULT_SHOPS) {
    try {
      const { items: foundItems, pagesScanned } = await scrapeShop(shopConfig);
      const toUpsert = [];
      let pushCount = 0;
      let availableCount = 0;

      for (const item of foundItems) {
        if (item.in_stock) availableCount++;
        const prev = existingMap.get(item.id);

        if (!prev) {
          // Nur auf Lager befindliche oder als Gedächtnis relevante Artikel neu anlegen
          const dropType = item.in_stock
            ? (item.edition_type !== 'Standard' ? 'NEUERSCHEINUNG' : 'NEU GELISTET')
            : 'AUSVERKAUFT';
          const payload = { ...item, drop_type: dropType, weekday, hour, found_at: now.toISOString() };
          toUpsert.push(payload);
          existingMap.set(item.id, payload);

          if (!isFirstInit && item.in_stock && pushCount < 4) {
            await sendPush(payload, false);
            pushCount++;
          }
        } else if (prev.in_stock === false && item.in_stock === true) {
          // ECHTER RESTOCK: War vorher in der DB auf ausverkauft (false) und ist jetzt wieder lieferbar (true)!
          const payload = { ...item, drop_type: 'RESTOCK', in_stock: true, weekday, hour, found_at: now.toISOString() };
          toUpsert.push(payload);
          existingMap.set(item.id, payload);

          if (pushCount < 5) {
            await sendPush(payload, true);
            pushCount++;
          }
        } else if (prev.in_stock === true && item.in_stock === false) {
          // Artikel ist jetzt ausverkauft -> Status in DB auf false setzen, damit künftige Restocks erkannt werden!
          const payload = { ...item, drop_type: 'AUSVERKAUFT', in_stock: false, weekday, hour, found_at: now.toISOString() };
          toUpsert.push(payload);
          existingMap.set(item.id, payload);
        }
      }

      if (toUpsert.length > 0) {
        // In 100er-Paketen in Supabase speichern
        for (let i = 0; i < toUpsert.length; i += 100) {
          await sbFetch('releases', {
            method: 'POST',
            headers: { 'Prefer': 'resolution=merge-duplicates' },
            body: JSON.stringify(toUpsert.slice(i, i + 100))
          });
        }
      }

      await sbFetch(`shops?id=eq.${shopConfig.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ last_checked: now.toISOString() })
      });

      console.log(`✓ ${shopConfig.name} (${pagesScanned} Seiten): ${availableCount} verfügbar / ${foundItems.length} gesamt (${toUpsert.length} Updates)`);
    } catch (err) {
      console.log(`✗ ${shopConfig.name}: ${err.message}`);
    }
  }

  console.log(`=== Komplett-Scan fertig in ${((Date.now() - startTime) / 1000).toFixed(1)} Sek. ===`);
  process.exit(0);
}

run();
