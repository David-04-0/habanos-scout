const { execFileSync } = require('child_process');
const crypto = require('crypto');

const SUPABASE_URL = (process.env.SUPABASE_URL || '').trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
const SUPABASE_KEY = (process.env.SUPABASE_KEY || '').trim();
const NTFY_TOPIC = (process.env.NTFY_TOPIC || '').trim();

const DEFAULT_SHOPS = [
  {
    id: 'wolsdorff',
    name: 'Wolsdorff',
    url: 'https://wolsdorff.shop/zigarren/nach-herkunft/kuba/',
    verify_details: true,
    extra_urls: [
      'https://wolsdorff.shop/kuba-freitag',
      'https://wolsdorff.shop/zigarren/entdecken/kubanische-zigarren/',
      'https://wolsdorff.shop/zigarren/nach-herkunft/kuba/?p=2',
      'https://wolsdorff.shop/zigarren/nach-herkunft/kuba/?p=3',
      'https://wolsdorff.shop/zigarren/nach-herkunft/kuba/?p=4',
      'https://wolsdorff.shop/zigarren/nach-herkunft/kuba/?p=5',
      'https://wolsdorff.shop/zigarren/nach-herkunft/kuba/?p=6',
      'https://wolsdorff.shop/zigarren/nach-herkunft/kuba/?p=7',
      'https://wolsdorff.shop/zigarren/nach-herkunft/kuba/?p=8'
    ],
    interval_min: 5
  },
  {
    id: 'cigarworld',
    name: 'Cigarworld / Casa Benden',
    url: 'https://www.cigarworld.de/zigarren/kuba',
    verify_details: true,
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
      'https://www.dalayzigarren.de/kubanische-zigarren_s10'
    ],
    interval_min: 5
  },
  {
    id: 'noblego',
    name: 'Noblego',
    url: 'https://www.noblego.de/kubanische-zigarren/',
    require_buy_signal: true,
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
    verify_details: true,
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
    require_buy_signal: true,
    verify_details: true,
    crawl_subpages: true,
    crawl_brands: true,
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
    verify_details: true,
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
    crawl_subpages: true,
    crawl_brands: true,
    subpage_pattern: /\/sortiment\/zigarren\/kubanische-zigarren\/|produkt-kategorie\/zigarren-aus-kuba/i,
    interval_min: 5
  },
  {
    id: 'zigarrenschachtel',
    name: 'Zigarrenschachtel',
    url: 'https://www.zigarrenschachtel.de/kubanische-zigarren',
    extra_urls: [
      'https://www.zigarrenschachtel.de/cohiba-zigarren',
      'https://www.zigarrenschachtel.de/montecristo-zigarren',
      'https://www.zigarrenschachtel.de/partagas-zigarren',
      'https://www.zigarrenschachtel.de/romeo-y-julieta-zigarren',
      'https://www.zigarrenschachtel.de/h-upmann-zigarren',
      'https://www.zigarrenschachtel.de/hoyo-de-monterrey-zigarren',
      'https://www.zigarrenschachtel.de/bolivar-zigarren',
      'https://www.zigarrenschachtel.de/trinidad-zigarren',
      'https://www.zigarrenschachtel.de/kubanische-zigarren_s2',
      'https://www.zigarrenschachtel.de/kubanische-zigarren_s3'
    ],
    interval_min: 5
  },
  {
    id: 'pipehouse',
    name: 'Pipe House',
    url: 'https://pipehouse.de/cigarren/kubanische-zigarren/',
    allow_no_price: true,
    verify_details: true,
    crawl_subpages: true,
    crawl_brands: true,
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
    verify_details: true,
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
    url: 'https://www.starkezigarren.de/Kubanische-Zigarren',
    crawl_subpages: true,
    crawl_brands: true,
    extra_urls: [
      'https://www.starkezigarren.de/Zigarren-Kuba'
    ],
    interval_min: 10
  },
  {
    id: 'cigarrenversand24',
    name: 'Cigarrenversand24',
    url: 'https://www.cigarrenversand24.de/Cigarren-Welt/',
    allow_no_price: true,
    verify_details: true,
    crawl_subpages: true,
    crawl_brands: true,
    interval_min: 10
  },
  {
    id: 'tabakkontor',
    name: 'Tabak Kontor Leipzig',
    url: 'https://www.tabak-kontor.de/',
    interval_min: 15
  }
];

const BRANDS = [
  'Cohiba', 'Montecristo', 'Partagás', 'Partagas', 'Romeo y Julieta', 'Hoyo de Monterrey',
  'H. Upmann', 'H.Upmann', 'Upmann', 'Trinidad', 'Bolívar', 'Bolivar', 'Punch',
  'Ramón Allones', 'Ramon Allones', 'Quai d\'Orsay', 'Quai d Orsay', 'Quai d´Orsay', 'Quai dOrsay',
  'Vegas Robaina', 'Cuaba', 'San Cristóbal', 'San Cristobal', 'Fonseca',
  'Juan López', 'Juan Lopez', 'Por Larrañaga', 'Por Larranaga', 'Rafael González', 'Rafael Gonzalez',
  'Saint Luis Rey', 'Sancho Panza', 'Vegueros', 'Diplomáticos', 'Diplomaticos',
  'El Rey del Mundo', 'La Gloria Cubana', 'Quintero', 'José L. Piedra', 'Jose L. Piedra', 'J. L. Piedra',
  'La Flor de Cano', 'Flor de Cano', 'Guantanamera', 'Cabañas', 'Cabanas'
];

const BRAND_URL_SLUGS = /cohiba|montecristo|partagas|romeo-y-julieta|hoyo-de-monterrey|h_upmann|hoyo_de_monterrey|ramon_allones|sancho_panza|upmann|trinidad|bolivar|ramon-allones|punch|quai-d|vegas-robaina|cuaba|san-cristobal|fonseca|juan-lopez|por-larranaga|rafael-gonzalez|saint-luis-rey|sancho-panza|vegueros|diplomaticos|rey-del-mundo|gloria-cubana|quintero|piedra|flor-de-cano|kuba|cuba|habanos/i;

function makeItemId(shopId, url) {
  const clean = url.toLowerCase().replace(/^https?:\/\/(www\.)?/, '').replace(/\/+$/, '');
  const hash = crypto.createHash('md5').update(clean).digest('hex').slice(0, 24);
  return `${shopId}-${hash}`;
}

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
  })(), 12000, 'Supabase');
}

async function fetchAllExistingReleases() {
  const allRows = [];
  let offset = 0;
  const pageSize = 1000;
  while (true) {
    const chunk = await sbFetch(`releases?select=id,shop_id,in_stock,price&order=id.asc&limit=${pageSize}&offset=${offset}`);
    if (!Array.isArray(chunk) || chunk.length === 0) break;
    allRows.push(...chunk);
    if (chunk.length < pageSize) break;
    offset += pageSize;
  }
  return allRows;
}

function detectBrand(text) {
  if (!text) return null;
  const lower = text.toLowerCase();
  for (const b of BRANDS) {
    const bLow = b.toLowerCase();
    const idx = lower.indexOf(bLow);
    if (idx !== -1) {
      const before = idx === 0 ? ' ' : lower[idx - 1];
      if (/[a-zäöüß]/.test(before)) continue;
      if (bLow === 'punch' && /cutter|bohrer|rundschneider|feuerzeug|ständer|puncher/i.test(lower)) continue;

      const map = {
        'Partagas': 'Partagás', 'Bolivar': 'Bolívar', 'Ramon Allones': 'Ramón Allones',
        'San Cristobal': 'San Cristóbal', 'Juan Lopez': 'Juan López', 'Por Larranaga': 'Por Larrañaga',
        'Diplomaticos': 'Diplomáticos', 'Jose L. Piedra': 'José L. Piedra', 'J. L. Piedra': 'José L. Piedra',
        'H.Upmann': 'H. Upmann', 'Upmann': 'H. Upmann', 'Rafael Gonzalez': 'Rafael González',
        'Quai d Orsay': 'Quai d\'Orsay', 'Quai d´Orsay': 'Quai d\'Orsay', 'Quai dOrsay': 'Quai d\'Orsay',
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

function isValidShopHtml(txt) {
  return txt && txt.length > 500 && !/<title>403 Forbidden|<title>Access Denied|<title>Just a moment|Error 403/i.test(txt);
}

function buildGoogleTranslateProxyUrl(rawUrl) {
  const u = new URL(rawUrl);
  const transHost = u.hostname.replace(/\./g, '-') + '.translate.goog';
  const sep = u.search ? '&' : '?';
  return `https://${transHost}${u.pathname}${u.search}${sep}_x_tr_sl=es&_x_tr_tl=de&_x_tr_hl=de&_x_tr_pto=wapp`;
}

function normalizeShopUrl(rawHref, baseOrigin) {
  let full = rawHref.startsWith('http') ? rawHref : `${baseOrigin}${rawHref.startsWith('/') ? '' : '/'}${rawHref}`;
  const originHost = new URL(baseOrigin).hostname;
  const transHost = originHost.replace(/\./g, '-') + '.translate.goog';
  if (full.includes(transHost)) {
    full = full.replace(transHost, originHost);
  }
  full = full.replace(/[?&]_x_tr_[^&#]+/g, '').replace(/\?&/, '?').replace(/[?&]$/, '');
  return full.split('#')[0];
}

async function fetchHtml(url) {
  const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
  try {
    const res = await withHardTimeout(fetch(url, {
      headers: {
        'User-Agent': ua,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'de-DE,de;q=0.9,en;q=0.8'
      }
    }), 8000, url);

    if (res.ok) {
      const txt = await res.text();
      if (isValidShopHtml(txt)) return txt;
    }
    if (res.status === 404) throw new Error('HTTP 404');
  } catch (err) {
    if (err.message === 'HTTP 404') throw err;
  }

  try {
    const out = execFileSync('curl', [
      '-sL', '--http1.1', '--compressed', '--max-time', '8',
      '-A', ua,
      '-e', 'https://www.google.de/',
      '-H', 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      '-H', 'Accept-Language: de-DE,de;q=0.9',
      '-H', 'X-Forwarded-For: 80.187.108.42',
      url
    ], { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
    if (isValidShopHtml(out)) return out;
  } catch (e) {}

  try {
    const gUrl = buildGoogleTranslateProxyUrl(url);
    const gRes = await withHardTimeout(fetch(gUrl, {
      headers: { 'User-Agent': ua, 'Accept-Language': 'de-DE,de;q=0.9' }
    }), 9000, 'GoogleProxy');
    if (gRes.ok) {
      const gTxt = await gRes.text();
      if (isValidShopHtml(gTxt)) return gTxt;
    }
  } catch (e) {}

  try {
    const jRes = await withHardTimeout(fetch(`https://r.jina.ai/${url}`, {
      headers: { 'User-Agent': ua, 'X-Return-Format': 'html' }
    }), 9000, 'JinaRelay');
    if (jRes.ok) {
      const jTxt = await jRes.text();
      if (isValidShopHtml(jTxt)) return jTxt;
    }
  } catch (e) {}

  for (const proxyUrl of [
    `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
    `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`
  ]) {
    try {
      const pRes = await withHardTimeout(fetch(proxyUrl, { headers: { 'User-Agent': ua } }), 9000, 'Proxy');
      if (pRes.ok) {
        if (proxyUrl.includes('/get?url=')) {
          const data = await pRes.json();
          if (data && isValidShopHtml(data.contents)) return data.contents;
        } else {
          const txt = await pRes.text();
          if (isValidShopHtml(txt)) return txt;
        }
      }
    } catch (e) {}
  }

  throw new Error('HTTP 403 / Blockiert');
}

function htmlToVisibleAndMetaText(rawHtml) {
  if (!rawHtml) return '';
  return rawHtml
    .replace(/(\d)<\/span>\s*<span[^>]*>([.,]\d{2})/gi, '$1$2')
    .replace(/\b(?:alt|title|aria-label|data-original-title)=["']([^"']+)["']/gi, ' $1 ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&euro;/gi, '€')
    .replace(/&#8364;/g, '€')
    .replace(/\s+/g, ' ')
    .trim();
}

function stripNegatedStockPhrases(text) {
  if (!text) return '';
  return text
    .replace(/hkr\s+alles:\s*(?:True|False),\s*Teil:\s*(?:AllesLieferbar|True|F)\.?/gi, ' ')
    .replace(/(?:momentan|derzeit|zur\s*zeit|aktuell|leider|noch)?\s*(?:nicht|keine\s+variante)\s+(?:sofort\s+)?(?:lieferbar|verf[üu]gbar|auf\s+lager|vorr[äa]tig|bestellbar|erh[äa]ltlich|versandfertig)/gi, ' __SOLDOUT__ ')
    .replace(/liefertermin\s+unbekannt|wird\s+nachbestellt|bald\s+wieder\s+(?:lieferbar|verf[üu]gbar|auf\s+lager)|aktuell\s+ausverkauft|leider\s+ausverkauft|ausverkauft|vergriffen|sold\s*out|out\s*of\s*stock/gi, ' __SOLDOUT__ ');
}

function extractPrice(text) {
  if (!text) return null;
  const cleaned = text.replace(/(\d)\s+([.,]\d{2})\s*(?:€|EUR)/g, '$1$2 €');
  const mAfter = cleaned.match(/(\d{1,4}(?:[.,]\d{3})*[.,]\d{2})\s*\*?\s*(?:€|EUR\b)/i);
  if (mAfter) return `${mAfter[1].replace('.', ',')} €`;
  const mBefore = cleaned.match(/(?:€|EUR)\s*(\d{1,4}[.,]\d{2})/i);
  if (mBefore) return `${mBefore[1].replace('.', ',')} €`;
  return null;
}

async function verifyProductDetail(item) {
  try {
    const html = await fetchHtml(item.url);

    // WICHTIG: Schema.org-Check VOR dem Entfernen von <script>-Tags (da JSON-LD in <script> liegt!)
    const rawBeforeCrossSelling = html.split(/ähnliche\s+produkte|kunden\s+kauften\s+auch|dazu\s+passend|related\s+products|cross-selling|weitere\s+produkte/i)[0];
    const hasSchemaInStock = /schema\.org\/InStock|"availability"\s*:\s*"[^"]*InStock"/i.test(rawBeforeCrossSelling);
    const hasSchemaOutOfStock = /schema\.org\/OutOfStock|schema\.org\/SoldOut|schema\.org\/Discontinued|"availability"\s*:\s*"[^"]*(?:OutOfStock|SoldOut)"/i.test(rawBeforeCrossSelling);

    const mainPart = rawBeforeCrossSelling.replace(/<(nav|footer|script|style|noscript)[^>]*>[\s\S]*?<\/\1>/gi, ' ');
    const vis = htmlToVisibleAndMetaText(mainPart);
    const sanitizedVis = stripNegatedStockPhrases(vis);

    if (!item.price || item.price === 'Auf Lager' || item.price === 'Ausverkauft') {
      const p = extractPrice(vis);
      if (p) item.price = p;
    }

    if (hasSchemaOutOfStock && !hasSchemaInStock) return false;

    if (item.shop_id === 'cigarworld') {
      const hasActiveCartBtn = /in\s+den\s+warenkorb|warenkorb\s+legen/i.test(mainPart);
      const hasPositiveCwStock = /sofort\s+versandfertig|sofort\s+lieferbar|auf\s+lager/i.test(sanitizedVis);
      return Boolean(hasActiveCartBtn || hasPositiveCwStock || hasSchemaInStock);
    }

    if (hasSchemaInStock && !hasSchemaOutOfStock) return true;

    const hasBuyBtn = /in\s+den\s+warenkorb|warenkorb\s+legen|add-to-cart|btn-buy/i.test(mainPart) &&
                      !/btn-buy[^>]*disabled|add-to-cart[^>]*disabled/i.test(mainPart);
    const hasPositiveStock = /sofort\s+lieferbar|sofort\s+verf[üu]gbar|auf\s+lager|versandfertig|lieferbar\s+in\s+\d|einige\s+variationen\s+verf[üu]gbar/i.test(sanitizedVis) ||
                             /ampel[_-]?gruen|status[_-]?1|status[_-]?green/i.test(mainPart);
    const hasSoldOutMarker = sanitizedVis.includes('__SOLDOUT__') ||
                             /ampel[_-]?rot|status[_-]?0|status[_-]?red|out-of-stock|not-available/i.test(mainPart);

    if (hasSoldOutMarker && !hasPositiveStock && !hasBuyBtn) return false;
    if (hasPositiveStock || hasBuyBtn) return true;
    return false;
  } catch (e) {
    return false;
  }
}

function evaluateOverviewStock(rawBefore, rawAfter, beforeText, fullCardText, shop, isTabacstoreNoPrice) {
  if (isTabacstoreNoPrice) return false;

  const combinedRaw = `${rawBefore} ${rawAfter}`;
  const sanitizedCard = stripNegatedStockPhrases(fullCardText);
  const sanitizedRaw = stripNegatedStockPhrases(combinedRaw);

  const rawSoldOutSignal = /(?:class|id)=["'][^"']*\b(?:out-of-stock|not-available|is-out-of-stock|sold-out|soldout|nostock|no-stock|status-red|status-0|status_0|ampel-rot|ampel_rot|delivery-not-available|badge-soldout)\b|(?:ampel[_-]?rot|status[_-]?0|icon[_-]?red|out[_-]?of[_-]?stock)\.(?:gif|png|svg|jpg)/i.test(rawAfter);
  const rawBuySignal = /in\s+den\s+warenkorb|add-to-cart|btn-buy|in-stock|is-in-stock|status-green|status-1|status_1|ampel-gruen|ampel_gruen|sofort\s+lieferbar|sofort\s+verf[üu]gbar|auf\s+lager/i.test(sanitizedRaw);

  const cleanBefore = stripNegatedStockPhrases(beforeText);
  if (cleanBefore.includes('__SOLDOUT__') && !/auf\s+lager|variationen\s+verf[üu]gbar/i.test(cleanBefore)) {
    return false;
  }

  const inStockTextRegex = /auf\s+lager|einige\s+variationen\s+verf[üu]gbar|sofort\s+verf[üu]gbar|sofort\s+lieferbar|versandfertig|in\s+den\s+warenkorb|lieferbar\s+in\s+\d/i;

  if (rawSoldOutSignal && !inStockTextRegex.test(sanitizedCard)) return false;
  if (sanitizedCard.includes('__SOLDOUT__') && !inStockTextRegex.test(sanitizedCard)) return false;
  if (shop.require_buy_signal && !rawBuySignal && !inStockTextRegex.test(sanitizedCard)) return false;

  return true;
}

function parseProductsFromHtml(html, shop, baseOrigin, seenUrls, pageUrl = '') {
  const found = [];
  const cleanHtml = html.replace(/<(nav|footer|script|style|noscript|svg)[^>]*>[\s\S]*?<\/\1>/gi, ' ');

  const titleTagMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const h1TagMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const pageBrand = detectBrand(decodeURIComponent(pageUrl)) ||
                    detectBrand(titleTagMatch ? titleTagMatch[1] : '') ||
                    detectBrand(h1TagMatch ? h1TagMatch[1] : '');

  const linkRegex = /<a\b([^>]*?\bhref=["']([^"']+)["'][^>]*)>([\s\S]*?)<\/a>/gi;
  const groups = [];
  let match;

  while ((match = linkRegex.exec(cleanHtml)) !== null) {
    const attrs = match[1];
    const rawHref = match[2].trim();
    const innerHtml = match[3];

    if (rawHref.length < 4 || rawHref.startsWith('#') || rawHref.startsWith('javascript:') || rawHref.startsWith('mailto:')) continue;
    if (/\.(css|js|png|jpg|jpeg|gif|svg|pdf|webp)$/i.test(rawHref)) continue;
    if (/warenkorb|cart|checkout|login|account|merk|wishlist|impressum|datenschutz|agb|kontakt|versand|widerruf|blog|lexikon|zigarrenkunde|newsletter/i.test(rawHref)) continue;

    let fullUrl;
    try {
      fullUrl = normalizeShopUrl(rawHref, baseOrigin);
    } catch (e) { continue; }

    if (/[?&]p=\d+|_s\d+$|\/page\/\d+/i.test(fullUrl)) continue;
    if (shop.id === 'cigarworld' && !/_\d+$/.test(fullUrl)) continue;

    const innerText = htmlToVisibleAndMetaText(innerHtml);
    const titleAttrMatch = attrs.match(/title=["']([^"']+)["']/i);
    const candidateText = [innerText, titleAttrMatch ? titleAttrMatch[1] : ''].join(' ').trim();

    const prevGroup = groups[groups.length - 1];
    if (prevGroup && prevGroup.url === fullUrl && (match.index - prevGroup.endIndex) < 1500) {
      prevGroup.endIndex = match.index + match[0].length;
      if (innerText.length > prevGroup.bestText.length && !/^(details|mehr|ansehen|zum produkt|weiterlesen|optionen wählen)$/i.test(innerText)) {
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

  const productGroups = groups.filter(g => {
    const brand = detectBrand(g.combinedText) || detectBrand(decodeURIComponent(g.url)) || pageBrand;
    if (!brand) return false;
    const stripped = g.combinedText.replace(/zigarren|kubanische|kuba|details|jetzt kaufen|weiterlesen/gi, '').trim();
    return stripped.length >= 4;
  });

  for (let i = 0; i < productGroups.length; i++) {
    const curr = productGroups[i];
    const itemId = makeItemId(shop.id, curr.url);
    if (seenUrls.has(curr.url) || seenUrls.has(itemId)) continue;

    if (/dominikan|nicaragua|honduras|brasil|mexiko|costa-rica|panama|cameroon|zubehoer|feuerzeug|aschenbecher|cutter|bohrer|etui/i.test(curr.url)) continue;

    const prevEnd = i > 0 ? productGroups[i - 1].endIndex : Math.max(0, curr.startIndex - 600);
    const nextStart = i < productGroups.length - 1 ? productGroups[i + 1].startIndex : Math.min(cleanHtml.length, curr.endIndex + 1600);

    const rawAfter = cleanHtml.slice(curr.startIndex, Math.min(nextStart, curr.endIndex + 1500));
    const afterText = htmlToVisibleAndMetaText(rawAfter);

    const rawBefore = cleanHtml.slice(Math.max(prevEnd, curr.startIndex - 450), curr.startIndex);
    let beforeText = htmlToVisibleAndMetaText(rawBefore);
    const lastEuroIdx = Math.max(beforeText.lastIndexOf('€'), beforeText.lastIndexOf('EUR'));
    if (lastEuroIdx !== -1) {
      beforeText = beforeText.slice(lastEuroIdx + 3).trim();
    }

    const fullCardText = `${beforeText} ${curr.combinedText} ${afterText}`.trim();
    if (/dominikanische\s+republik|herkunft:\s*(?:nicaragua|honduras|dominikan)|feuerzeug|aschenbecher|zigarrenetui|lederetui|cutter/i.test(fullCardText)) continue;

    const brand = detectBrand(curr.combinedText) || detectBrand(decodeURIComponent(curr.url)) || detectBrand(fullCardText) || pageBrand;
    if (!brand) continue;

    const price = extractPrice(afterText) || extractPrice(curr.combinedText);
    const isTabacstoreNoPrice = (shop.id === 'tabacstore' && !price && /kuba/i.test(afterText));
    if (!price && !isTabacstoreNoPrice && !shop.allow_no_price) continue;

    const inStock = evaluateOverviewStock(rawBefore, rawAfter, beforeText, fullCardText, shop, isTabacstoreNoPrice);

    let cleanTitle = curr.bestText || curr.combinedText;
    if (!detectBrand(cleanTitle)) {
      const bIdx = curr.combinedText.toLowerCase().indexOf(brand.toLowerCase());
      cleanTitle = bIdx !== -1 ? curr.combinedText.slice(bIdx) : `${brand} ${cleanTitle}`;
    }
    cleanTitle = cleanTitle
      .replace(/€\s*\d+[.,]\d+/g, '')
      .split(/€|EUR|inkl\.|Preis|Details|Inhalt|Artikelnummer|Herkunftsland|Momentan|Auf Lager|Nicht |zur Zeit/i)[0]
      .replace(/\s+/g, ' ')
      .trim();

    if (cleanTitle.length < 5 || cleanTitle.toLowerCase() === brand.toLowerCase()) continue;

    seenUrls.add(curr.url);
    seenUrls.add(itemId);
    found.push({
      id: itemId,
      shop_id: shop.id,
      shop_name: shop.name,
      title: cleanTitle.slice(0, 130),
      brand,
      price: price || (inStock ? 'Auf Lager' : 'Ausverkauft'),
      format: /kiste|box|25er|20er|10er|50er|cabinet|slb|sbn|\b25\s*'/i.test(cleanTitle + ' ' + afterText) ? 'Kiste / Box' : 'Einzel / Sonstiges',
      edition_type: detectEdition(cleanTitle + ' ' + afterText),
      in_stock: inStock,
      url: curr.url
    });
  }

  return found;
}

async function scrapeShop(shopConfig, existingMap) {
  const items = [];
  const baseOrigin = new URL(shopConfig.url).origin;

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
              format: /kiste|box|25|20|10|50|cabinet/i.test(fullTitle) ? 'Kiste / Box' : 'Einzel / Sonstiges',
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

  const seenUrls = new Set();
  const mainHtml = await fetchHtml(shopConfig.url);
  items.push(...parseProductsFromHtml(mainHtml, shopConfig, baseOrigin, seenUrls, shopConfig.url));

  const subUrls = new Set(shopConfig.extra_urls || []);
  if (shopConfig.crawl_subpages) {
    const hrefRegex = /href=["']([^"']+)["']/gi;
    let m;
    while ((m = hrefRegex.exec(mainHtml)) !== null) {
      const raw = m[1].trim();
      if (raw.startsWith('#') || raw.startsWith('javascript:')) continue;
      let u;
      try {
        u = normalizeShopUrl(raw, baseOrigin);
      } catch (e) { continue; }

      if (!u.startsWith(baseOrigin) || u === shopConfig.url) continue;
      if (/warenkorb|login|account|kontakt|impressum|datenschutz|versand|nicaragua|dominikan|honduras|brasil/i.test(u)) continue;

      const matchesPattern = shopConfig.subpage_pattern && shopConfig.subpage_pattern.test(u);
      const matchesBrands = shopConfig.crawl_brands && BRAND_URL_SLUGS.test(u);

      if (matchesPattern || matchesBrands) {
        subUrls.add(u);
      }
    }
  }

  const urlList = Array.from(subUrls).slice(0, 35);
  let pagesScanned = 1;

  for (let i = 0; i < urlList.length; i += 4) {
    const batch = urlList.slice(i, i + 4);
    const results = await Promise.allSettled(batch.map(u => fetchHtml(u).then(html => ({ url: u, html }))));
    for (const r of results) {
      if (r.status === 'fulfilled') {
        pagesScanned++;
        items.push(...parseProductsFromHtml(r.value.html, shopConfig, baseOrigin, seenUrls, r.value.url));
      }
    }
  }

  // Dedupliziere items nach ID
  const uniqueItems = Array.from(new Map(items.map(x => [x.id, x])).values());

  if (shopConfig.verify_details) {
    const needCheck = uniqueItems.filter(it => {
      if (!it.in_stock) return false;
      const prev = existingMap.get(it.id);
      return !prev || prev.in_stock === false || prev.in_stock === true;
    });

    needCheck.sort((a, b) => a.id.localeCompare(b.id));
    const batchToVerify = needCheck.slice(0, 140);
    const verifiedIds = new Set(batchToVerify.map(x => x.id));

    for (let i = 0; i < batchToVerify.length; i += 6) {
      const batch = batchToVerify.slice(i, i + 6);
      await Promise.allSettled(batch.map(async (it) => {
        it.in_stock = await verifyProductDetail(it);
      }));
    }

    for (const it of uniqueItems) {
      if (it.in_stock && !verifiedIds.has(it.id)) {
        const prev = existingMap.get(it.id);
        it.in_stock = prev ? Boolean(prev.in_stock) : false;
      }
    }
  }

  return { items: uniqueItems, pagesScanned };
}

async function run() {
  const startTime = Date.now();
  console.log('=== Starte Habanos Scout (Engine v7 - Deduplicated & Schema-Fix) ===');

  const dbShopsPayload = DEFAULT_SHOPS.map(s => ({
    id: s.id, name: s.name, url: s.url, interval_min: s.interval_min, active: true
  }));
  await sbFetch('shops', {
    method: 'POST',
    headers: { 'Prefer': 'resolution=merge-duplicates' },
    body: JSON.stringify(dbShopsPayload)
  });

  const existing = await fetchAllExistingReleases();
  console.log(`Datenbank-Gedächtnis geladen: ${existing.length} bekannte Zigarren.`);
  const existingMap = new Map(existing.map(r => [r.id, r]));
  const initializedShops = new Set(existing.map(r => r.shop_id));

  const now = new Date();
  const weekday = (now.getDay() + 6) % 7;
  const hour = now.getHours();

  for (const shopConfig of DEFAULT_SHOPS) {
    try {
      const shopIsInitialized = initializedShops.has(shopConfig.id);
      const { items: foundItems, pagesScanned } = await scrapeShop(shopConfig, existingMap);
      const toUpsertMap = new Map();
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
          toUpsertMap.set(payload.id, payload);
          existingMap.set(item.id, payload);

          if (shopIsInitialized && item.in_stock && pushCount < 4) {
            const reallyAvailable = shopConfig.type === 'shopify' ? true : await verifyProductDetail(payload);
            if (reallyAvailable) {
              await sendPush(payload, false);
              pushCount++;
            } else {
              payload.in_stock = false;
              payload.drop_type = 'AUSVERKAUFT';
              availableCount = Math.max(0, availableCount - 1);
            }
          }
        } else if (prev.in_stock === false && item.in_stock === true) {
          const reallyAvailable = shopConfig.type === 'shopify' ? true : await verifyProductDetail(item);
          if (reallyAvailable) {
            const payload = { ...item, drop_type: 'RESTOCK', in_stock: true, weekday, hour, found_at: now.toISOString() };
            toUpsertMap.set(payload.id, payload);
            existingMap.set(item.id, payload);
            if (pushCount < 5) {
              await sendPush(payload, true);
              pushCount++;
            }
          } else {
            availableCount = Math.max(0, availableCount - 1);
          }
        } else if (prev.in_stock === true && item.in_stock === false) {
          const payload = { ...item, drop_type: 'AUSVERKAUFT', in_stock: false, weekday, hour, found_at: now.toISOString() };
          toUpsertMap.set(payload.id, payload);
          existingMap.set(item.id, payload);
        }
      }

      // 100 % dedupliziertes Array (verhindert Supabase 21000 Fehler garantiert!)
      const toUpsert = Array.from(toUpsertMap.values());
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
