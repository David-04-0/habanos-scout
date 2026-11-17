const { execFileSync } = require('child_process');

const SUPABASE_URL = (process.env.SUPABASE_URL || '').trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
const SUPABASE_KEY = (process.env.SUPABASE_KEY || '').trim();
const NTFY_TOPIC = (process.env.NTFY_TOPIC || '').trim();

const DEFAULT_SHOPS = [
  {
    id: 'wolsdorff',
    name: 'Wolsdorff',
    url: 'https://wolsdorff.shop/zigarren/nach-herkunft/kuba/',
    extra_urls: [
      'https://wolsdorff.shop/kuba-freitag',
      'https://wolsdorff.shop/zigarren/entdecken/kubanische-zigarren/',
      'https://wolsdorff.shop/zigarren/nach-herkunft/kuba/?p=2',
      'https://wolsdorff.shop/zigarren/nach-herkunft/kuba/?p=3',
      'https://wolsdorff.shop/zigarren/nach-herkunft/kuba/?p=4',
      'https://wolsdorff.shop/zigarren/nach-herkunft/kuba/?p=5',
      'https://wolsdorff.shop/zigarren/nach-herkunft/kuba/?p=6',
      'https://wolsdorff.shop/zigarren/nach-herkunft/kuba/?p=7',
      'https://wolsdorff.shop/zigarren/nach-herkunft/kuba/?p=8',
      'https://wolsdorff.shop/zigarren/nach-herkunft/kuba/?p=9',
      'https://wolsdorff.shop/zigarren/nach-herkunft/kuba/?p=10'
    ],
    interval_min: 5
  },
  {
    id: 'cigarworld',
    name: 'Cigarworld / Casa Benden',
    url: 'https://www.cigarworld.de/zigarren/kuba',
    crawl_subpages: true,
    subpage_pattern: /\/zigarren\/kuba\/(regulares|limitadas|exclusivos|anos-chinos|reserva|gran-reservas|regionales|especiales|anejados)/i,
    interval_min: 5
  },
  {
    id: 'ccigars',
    name: 'C-Cigars',
    type: 'shopify',
    url: 'https://c-cigars.de/collections/kubanische-zigarren/products.json?limit=250',
    interval_min: 3
  },
  {
    id: 'herzog',
    name: 'Zigarren Herzog & LCDH Berlin',
    type: 'shopify',
    url: 'https://zigarren-herzog.com/collections/kuba/products.json?limit=250',
    extra_urls: [
      'https://zigarren-herzog.com/collections/kubanische-tabake/products.json?limit=250',
      'https://zigarren-herzog.com/collections/cohiba/products.json?limit=250',
      'https://zigarren-herzog.com/collections/montecristo/products.json?limit=250',
      'https://zigarren-herzog.com/collections/partagas/products.json?limit=250',
      'https://zigarren-herzog.com/collections/romeo-y-julieta/products.json?limit=250',
      'https://zigarren-herzog.com/collections/h-upmann/products.json?limit=250',
      'https://zigarren-herzog.com/collections/hoyo-de-monterrey/products.json?limit=250',
      'https://zigarren-herzog.com/collections/bolivar/products.json?limit=250',
      'https://zigarren-herzog.com/collections/trinidad/products.json?limit=250',
      'https://zigarren-herzog.com/collections/punch/products.json?limit=250',
      'https://zigarren-herzog.com/collections/ramon-allones/products.json?limit=250',
      'https://zigarren-herzog.com/collections/la-gloria-cubana/products.json?limit=250',
      'https://zigarren-herzog.com/collections/quai-dorsay/products.json?limit=250'
    ],
    interval_min: 5
  },
  {
    id: 'dalay',
    name: 'Dalay Zigarren',
    url: 'https://www.dalayzigarren.de/kubanische-zigarren',
    extra_urls: [
      'https://www.dalayzigarren.de/kubanische-zigarren_s2',
      'https://www.dalayzigarren.de/kubanische-zigarren_s3',
      'https://www.dalayzigarren.de/kubanische-zigarren_s4',
      'https://www.dalayzigarren.de/kubanische-zigarren_s5',
      'https://www.dalayzigarren.de/kubanische-zigarren_s6',
      'https://www.dalayzigarren.de/kubanische-zigarren_s7',
      'https://www.dalayzigarren.de/kubanische-zigarren_s8',
      'https://www.dalayzigarren.de/kubanische-zigarren_s9',
      'https://www.dalayzigarren.de/kubanische-zigarren_s10',
      'https://www.dalayzigarren.de/kubanische-zigarren_s11',
      'https://www.dalayzigarren.de/kubanische-zigarren_s12'
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
      'https://www.paul-bugge.com/bolivar-zigarren',
      'https://www.paul-bugge.com/ramon-allones-zigarren',
      'https://www.paul-bugge.com/punch-zigarren'
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
      'https://www.zigarre.de/bolivar.html',
      'https://www.zigarre.de/ramon-allones.html',
      'https://www.zigarre.de/punch.html'
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
      'https://brinkmannfinest.de/zigarren/herkunft/kuba/?p=4',
      'https://brinkmannfinest.de/cohiba/',
      'https://brinkmannfinest.de/montecristo/',
      'https://brinkmannfinest.de/partagas/',
      'https://brinkmannfinest.de/romeo-y-julieta/',
      'https://brinkmannfinest.de/trinidad/'
    ],
    interval_min: 5
  },
  {
    id: 'zigarrentraum',
    name: 'Zigarrentraum',
    url: 'https://www.zigarrentraum.de/sortiment/zigarren/kubanische-zigarren/',
    interval_min: 5
  },
  {
    id: 'zigarrenschachtel',
    name: 'Zigarrenschachtel',
    url: 'https://www.zigarrenschachtel.de/kubanische-zigarren',
    extra_urls: [
      'https://www.zigarrenschachtel.de/hersteller-habanos-sa',
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
    url: 'https://pipehouse.de/cigarren/kubanische-zigarren/',
    extra_urls: [
      'https://pipehouse.de/herkunft/cuba/',
      'https://pipehouse.de/herkunft/cuba/page/2/',
      'https://pipehouse.de/herkunft/cuba/page/3/'
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
    url: 'https://www.starkezigarren.de/Zigarren-Kuba',
    extra_urls: [
      'https://www.starkezigarren.de/Kubanische-Zigarren'
    ],
    interval_min: 10
  },
  {
    id: 'cigarrenversand24',
    name: 'Cigarrenversand24',
    url: 'https://www.cigarrenversand24.de/Cigarren-Welt/',
    interval_min: 10
  },
  {
    id: 'tabakkontor',
    name: 'Tabak Kontor Leipzig',
    url: 'https://www.tabak-kontor.de/shop.html',
    interval_min: 15
  }
];

const BRANDS = [
  'Cohiba', 'Montecristo', 'Partagás', 'Partagas', 'Romeo y Julieta', 'Hoyo de Monterrey',
  'H. Upmann', 'H.Upmann', 'Upmann', 'Trinidad', 'Bolívar', 'Bolivar', 'Punch',
  'Ramón Allones', 'Ramon Allones', 'Quai d\'Orsay', 'Quai d Orsay', 'Quai d´Orsay',
  'Vegas Robaina', 'Cuaba', 'San Cristóbal', 'San Cristobal', 'Fonseca',
  'Juan López', 'Juan Lopez', 'Por Larrañaga', 'Por Larranaga', 'Rafael González', 'Rafael Gonzalez',
  'Saint Luis Rey', 'Sancho Panza', 'Vegueros', 'Diplomáticos', 'Diplomaticos',
  'El Rey del Mundo', 'La Gloria Cubana', 'Quintero', 'José L. Piedra', 'Jose L. Piedra', 'J. L. Piedra',
  'La Flor de Cano', 'Flor de Cano', 'Guantanamera', 'Cabañas', 'Cabanas'
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

function detectBrand(text) {
  if (!text) return null;
  const lower = text.toLowerCase();
  for (const b of BRANDS) {
    const bLow = b.toLowerCase();
    const idx = lower.indexOf(bLow);
    if (idx !== -1) {
      // Wortgrenze prüfen, damit z.B. "Punch" nicht in "Cigar Punch" (Bohrer) matcht
      const before = idx === 0 ? ' ' : lower[idx - 1];
      if (/[a-zäöüß]/.test(before)) continue;
      if (bLow === 'punch' && /cutter|bohrer|rundschneider|feuerzeug|ständer/i.test(lower)) continue;

      const map = {
        'Partagas': 'Partagás', 'Bolivar': 'Bolívar', 'Ramon Allones': 'Ramón Allones',
        'San Cristobal': 'San Cristóbal', 'Juan Lopez': 'Juan López', 'Por Larranaga': 'Por Larrañaga',
        'Diplomaticos': 'Diplomáticos', 'Jose L. Piedra': 'José L. Piedra', 'J. L. Piedra': 'José L. Piedra',
        'H.Upmann': 'H. Upmann', 'Upmann': 'H. Upmann', 'Rafael Gonzalez': 'Rafael González',
        'Quai d Orsay': 'Quai d\'Orsay', 'Quai d´Orsay': 'Quai d\'Orsay',
        'Flor de Cano': 'La Flor de Cano', 'Cabanas': 'Cabañas'
      };
      return map[b] || b;
    }
  }
  return null;
}

function detectEdition(title) {
  const t = title.toLowerCase();
  if (t.includes('limitada') || /\bel\s*20\d\d\b/.test(t) || /\ble\s*20\d\d\b/.test(t)) return 'Edición Limitada';
  if (t.includes('exclusivo') || t.includes('regional') || /\ber\s*20\d\d\b/.test(t)) return 'Exclusivo Regional';
  if (t.includes('aniversario') || t.includes('jubiläum') || t.includes('jar') || t.includes('humidor') || t.includes('colección') || t.includes('year of the') || t.includes('linea maestra') || t.includes('línea maestra') || t.includes('linea de oro') || t.includes('línea de oro') || t.includes('behike')) return 'Rarität / Sonderedition';
  if (t.includes('gran reserva') || t.includes('reserva') || t.includes('cosecha')) return 'Reserva / Gran Reserva';
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

// Mehrstufiger HTML-Abruf (Direkt -> System-Curl -> Proxy-Fallback bei HTTP 403)
async function fetchHtml(url) {
  const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
  try {
    const res = await withHardTimeout(fetch(url, {
      headers: {
        'User-Agent': ua,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'de-DE,de;q=0.9,en;q=0.8'
      }
    }), 9000, url);

    if (res.ok) return await res.text();
    if (res.status === 404) throw new Error('HTTP 404');
  } catch (err) {
    if (err.message === 'HTTP 404') throw err;
  }

  // Stufe 2: System-Curl mit HTTP/2 & TLS-Stack (umgeht Node-undici 403-Sperren)
  try {
    const out = execFileSync('curl', [
      '-sL', '--compressed', '--max-time', '8',
      '-A', ua,
      '-H', 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      '-H', 'Accept-Language: de-DE,de;q=0.9',
      url
    ], { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
    if (out && out.length > 500 && !/<title>403 Forbidden|<title>Just a moment/i.test(out)) {
      return out;
    }
  } catch (e) {}

  // Stufe 3: Proxy-Relay für hart geblockte US-GitHub-IPs (403-Shops)
  for (const proxyUrl of [
    `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
  ]) {
    try {
      const pRes = await withHardTimeout(fetch(proxyUrl), 9000, 'Proxy');
      if (pRes.ok) {
        const txt = await pRes.text();
        if (txt && txt.length > 500 && !/<title>403 Forbidden/i.test(txt)) return txt;
      }
    } catch (e) {}
  }

  throw new Error('HTTP 403 / Blockiert');
}

function extractPrice(text) {
  if (!text) return null;
  // Erkennt sowohl "26,80 €*" als auch Cigarworld "€48.50" oder "ab €6.70"
  const mAfter = text.match(/(\d{1,4}(?:[.,]\d{3})*[.,]\d{2})\s*\*?\s*(?:€|&euro;|EUR\b)/i);
  if (mAfter) return `${mAfter[1].replace('.', ',')} €`;
  const mBefore = text.match(/(?:€|&euro;|EUR)\s*(\d{1,4}[.,]\d{2})/i);
  if (mBefore) return `${mBefore[1].replace('.', ',')} €`;
  return null;
}

// ANCHOR-BOUNDARY-PARSER: Zerschneidet keine Produktkarten mehr!
function parseProductsFromHtml(html, shop, baseOrigin, seenUrls) {
  const found = [];

  // Entferne Navigation, Header, Footer, Skripte & Styles
  const cleanHtml = html.replace(/<(nav|header|footer|aside|script|style|noscript)[^>]*>[\s\S]*?<\/\1>/gi, ' ');

  // Schritt 1: Finde alle Links auf der Seite mit ihren exakten Positionen
  const linkRegex = /<a\s+([^>]*href=["']([^"']+)["'][^>]*)>([\s\S]*?)<\/a>/gi;
  const groups = [];
  let match;

  while ((match = linkRegex.exec(cleanHtml)) !== null) {
    const attrs = match[1];
    const rawHref = match[2].trim();
    const innerHtml = match[3];

    if (rawHref.length < 4 || rawHref.startsWith('#') || rawHref.startsWith('javascript:') || rawHref.startsWith('mailto:')) continue;
    if (/\.(css|js|png|jpg|jpeg|gif|svg|pdf|webp)$/i.test(rawHref)) continue;
    if (/warenkorb|cart|checkout|login|account|merk|wishlist|impressum|datenschutz|agb|kontakt|versand|widerruf|blog|lexikon|zigarrenkunde/i.test(rawHref)) continue;

    let fullUrl;
    try {
      fullUrl = rawHref.startsWith('http') ? rawHref : `${baseOrigin}${rawHref.startsWith('/') ? '' : '/'}${rawHref}`;
      fullUrl = fullUrl.split('#')[0];
    } catch (e) { continue; }

    // Entferne reine Paginierungs-Links (?p=2, _s2, /page/2)
    if (/[?&]p=\d+|_s\d+$|\/page\/\d+/i.test(fullUrl)) continue;

    const innerText = innerHtml.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
    const titleAttrMatch = attrs.match(/title=["']([^"']+)["']/i);
    const altAttrMatch = innerHtml.match(/alt=["']([^"']+)["']/i);
    const candidateText = [innerText, titleAttrMatch ? titleAttrMatch[1] : '', altAttrMatch ? altAttrMatch[1] : ''].join(' ').trim();

    // Fasse direkt aufeinanderfolgende Links zur selben URL (z.B. Bild + Titel + "Details") zusammen
    const prevGroup = groups[groups.length - 1];
    if (prevGroup && prevGroup.url === fullUrl && (match.index - prevGroup.endIndex) < 1500) {
      prevGroup.endIndex = match.index + match[0].length;
      if (innerText.length > prevGroup.bestText.length && !/^(details|mehr|ansehen|zum produkt)$/i.test(innerText)) {
        prevGroup.bestText = innerText;
      }
      prevGroup.combinedText += ' ' + candidateText;
    } else {
      groups.push({
        url: fullUrl,
        startIndex: match.index,
        endIndex: match.index + match[0].length,
        bestText: innerText,
        combinedText: candidateText
      });
    }
  }

  // Schritt 2: Filtere echte kubanische Produkt-Anker heraus
  const productGroups = groups.filter(g => {
    const brand = detectBrand(g.combinedText) || detectBrand(decodeURIComponent(g.url));
    if (!brand) return false;
    // Reine Marken-Kategorieseiten ausschließen (Name muss länger als nur der Markenname sein)
    const stripped = g.combinedText.replace(/zigarren|kubanische|kuba|details|jetzt kaufen/gi, '').trim();
    return stripped.length > brand.length + 2;
  });

  // Schritt 3: Für jedes Produkt exakt den Bereich zwischen Vor-Produkt und Nach-Produkt auswerten
  for (let i = 0; i < productGroups.length; i++) {
    const curr = productGroups[i];
    if (seenUrls.has(curr.url)) continue;

    // Anti-New-World-Filter auf URL
    if (/dominikan|nicaragua|honduras|brasil|mexiko|costa-rica|panama|cameroon|zubehoer|feuerzeug|aschenbecher|cutter|bohrer|etui/i.test(curr.url)) continue;

    const prevEnd = i > 0 ? productGroups[i - 1].endIndex : Math.max(0, curr.startIndex - 600);
    const nextStart = i < productGroups.length - 1 ? productGroups[i + 1].startIndex : Math.min(cleanHtml.length, curr.endIndex + 1600);

    // 1. Text NACH dem Produktlink (bis maximal zum nächsten Produkt, max. 1500 Zeichen)
    const rawAfter = cleanHtml.slice(curr.startIndex, Math.min(nextStart, curr.endIndex + 1500));
    const afterText = rawAfter.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();

    // 2. Kurzer Banner-Text VOR dem Produktlink (für Dalay & Zigarrenschachtel), strikt NACH dem letzten "€" des Vorgängers!
    const rawBefore = cleanHtml.slice(Math.max(prevEnd, curr.startIndex - 450), curr.startIndex);
    let beforeText = rawBefore.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
    const lastEuroIdx = Math.max(beforeText.lastIndexOf('€'), beforeText.lastIndexOf('EUR'));
    if (lastEuroIdx !== -1) {
      beforeText = beforeText.slice(lastEuroIdx + 3).trim();
    }

    const fullCardText = `${beforeText} ${curr.combinedText} ${afterText}`.trim();

    // Anti-New-World-Filter im Kartentext
    if (/dominikanische\s+republik|herkunft:\s*(?:nicaragua|honduras|dominikan)|feuerzeug|aschenbecher|zigarrenetui|lederetui|cutter/i.test(fullCardText)) continue;

    const brand = detectBrand(curr.combinedText) || detectBrand(fullCardText);
    if (!brand) continue;

    // Preis bestimmen (bei Tabacstore haben restlos ausverkaufte Artikel keinen Preis -> werden als nicht verfügbar erkannt)
    const price = extractPrice(afterText) || extractPrice(curr.combinedText);
    const isTabacstoreNoPrice = (shop.id === 'tabacstore' && !price && /kuba/i.test(afterText));
    if (!price && !isTabacstoreNoPrice) continue;

    // Präzise Verfügbarkeits-Analyse (inkl. Dalay-, Noblego-, Zigarrentraum- & Zigarrenschachtel-Logik)
    const cleanForStock = fullCardText.replace(/hkr\s+alles:\s*(?:True|False),\s*Teil:\s*(?:AllesLieferbar|True|F)\.?/gi, ' ');
    const soldOutRegex = /nicht\s+lieferbar|nicht\s+verf[üu]gbar|nicht\s+auf\s+lager|momentan\s+ausverkauft|ausverkauft|vergriffen|sold\s*out|out\s*of\s*stock|demn[äa]chst\s+bei\s+uns|liefertermin\s+unbekannt|derzeit\s+nicht|aktuell\s+nicht|wird\s+nachbestellt/i;
    const inStockRegex = /auf\s+lager|einige\s+variationen\s+verf[üu]gbar|sofort\s+verf[üu]gbar|sofort\s+lieferbar|versandfertig|in\s+den\s+warenkorb/i;

    let inStock = true;
    if (isTabacstoreNoPrice) {
      inStock = false;
    } else if (/^(?:[^a-z]*)(?:nicht\s+lieferbar|nicht\s+verf[üu]gbar|demn[äa]chst\s+bei\s+uns)/i.test(beforeText.replace(/hkr\s+alles:[^.]*\./gi, '').trim())) {
      // Dalay & Zigarrenschachtel: Explizites "Nicht lieferbar" / "nicht verfügbar" im Vor-Banner
      inStock = false;
    } else if (soldOutRegex.test(cleanForStock) && !inStockRegex.test(cleanForStock)) {
      inStock = false;
    }

    // Sauberen Zigarrentitel bestimmen
    let cleanTitle = curr.bestText;
    if (!detectBrand(cleanTitle)) {
      const bIdx = curr.combinedText.toLowerCase().indexOf(brand.toLowerCase());
      cleanTitle = bIdx !== -1 ? curr.combinedText.slice(bIdx) : `${brand} ${cleanTitle}`;
    }
    cleanTitle = cleanTitle
      .replace(/€\s*\d+[.,]\d+/g, '')
      .split(/€|EUR|inkl\.|Preis|Details|Inhalt|Artikelnummer|Herkunftsland|Momentan|Auf Lager|Nicht /i)[0]
      .replace(/\s+/g, ' ')
      .trim();

    if (cleanTitle.length < 5) continue;

    seenUrls.add(curr.url);
    found.push({
      id: `${shop.id}-${Buffer.from(curr.url).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(-32)}`,
      shop_id: shop.id,
      shop_name: shop.name,
      title: cleanTitle.slice(0, 130),
      brand,
      price: price || 'Ausverkauft',
      format: /kiste|box|25er|20er|10er|50er|cabinet|slb|sbn|\b25\s*'/i.test(cleanTitle + ' ' + afterText) ? 'Kiste / Box' : 'Einzel / Verfügbar',
      edition_type: detectEdition(cleanTitle + ' ' + afterText),
      in_stock: inStock,
      url: curr.url
    });
  }

  return found;
}

async function scrapeShop(shopConfig) {
  const items = [];
  const baseOrigin = new URL(shopConfig.url).origin;

  // 1. Shopify JSON-API (C-Cigars & Zigarren Herzog mit allen Marken-Collections)
  if (shopConfig.type === 'shopify' || shopConfig.url.includes('products.json')) {
    const jsonUrls = [shopConfig.url, ...(shopConfig.extra_urls || [])];
    const seenIds = new Set();
    let pagesScanned = 0;

    for (let i = 0; i < jsonUrls.length; i += 4) {
      const batch = jsonUrls.slice(i, i + 4);
      const resList = await Promise.allSettled(batch.map(u =>
        withHardTimeout(fetch(u, { headers: { 'User-Agent': 'Mozilla/5.0 Chrome/126.0.0.0' } }), 9000, u)
          .then(r => r.ok ? r.json() : { products: [] })
      ));

      for (const r of resList) {
        if (r.status !== 'fulfilled') continue;
        pagesScanned++;
        for (const p of (r.value.products || [])) {
          if (/aschenbecher|feuerzeug|etui|cutter|humidor|bohrer/i.test(p.title + ' ' + (p.product_type || ''))) continue;
          const brand = detectBrand(p.title + ' ' + (p.vendor || ''));
          if (!brand) continue;

          // Bei Herzog steht die Marke oft nur in p.vendor -> voranstellen, falls sie im Titel fehlt
          const baseTitle = detectBrand(p.title) ? p.title : `${brand} ${p.title}`;

          for (const v of (p.variants || [])) {
            const itemId = `${shopConfig.id}-${v.id}`;
            if (seenIds.has(itemId)) continue;
            seenIds.add(itemId);

            const fullTitle = v.title && v.title !== 'Default Title' ? `${baseTitle} - ${v.title}` : baseTitle;
            items.push({
              id: itemId,
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
      }
    }
    return { items, pagesScanned };
  }

  // 2. HTML-Hauptseite + alle Marken-/Paginierungs-Seiten abrufen
  const seenUrls = new Set();
  const mainHtml = await fetchHtml(shopConfig.url);
  items.push(...parseProductsFromHtml(mainHtml, shopConfig, baseOrigin, seenUrls));

  const subUrls = new Set(shopConfig.extra_urls || []);
  if (shopConfig.crawl_subpages && shopConfig.subpage_pattern) {
    const hrefRegex = /href=["']([^"']+)["']/gi;
    let m;
    while ((m = hrefRegex.exec(mainHtml)) !== null) {
      const u = m[1].startsWith('http') ? m[1] : `${baseOrigin}${m[1].startsWith('/') ? '' : '/'}${m[1]}`;
      if (shopConfig.subpage_pattern.test(u) && u !== shopConfig.url) {
        subUrls.add(u.split('#')[0]);
      }
    }
  }

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
  console.log('=== Starte Habanos Scout (Anchor-Boundary Engine v3) ===');

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
          const payload = { ...item, drop_type: 'RESTOCK', in_stock: true, weekday, hour, found_at: now.toISOString() };
          toUpsert.push(payload);
          existingMap.set(item.id, payload);

          if (pushCount < 5) {
            await sendPush(payload, true);
            pushCount++;
          }
        } else if (prev.in_stock === true && item.in_stock === false) {
          const payload = { ...item, drop_type: 'AUSVERKAUFT', in_stock: false, weekday, hour, found_at: now.toISOString() };
          toUpsert.push(payload);
          existingMap.set(item.id, payload);
        }
      }

      if (toUpsert.length > 0) {
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
