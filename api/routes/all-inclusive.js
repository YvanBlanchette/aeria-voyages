const express = require('express');
const axios   = require('axios');
const cheerio = require('cheerio');

// ─── Données statiques ───────────────────────────────────────────────────────

const DESTINATIONS = [
  { value: 'tout-le-sud',            label: 'Tout le Sud',            parent: null },
  { value: 'antigua',                label: 'Antigua',                parent: null },
  { value: 'aruba',                  label: 'Aruba',                  parent: null },
  { value: 'bahamas',                label: 'Bahamas',                parent: null },
  { value: 'freeport',               label: 'Freeport',               parent: 'bahamas' },
  { value: 'nassau',                 label: 'Nassau',                 parent: 'bahamas' },
  { value: 'barbade',                label: 'Barbade',                parent: null },
  { value: 'colombie',               label: 'Colombie',               parent: null },
  { value: 'carthagene',             label: 'Carthagène',             parent: 'colombie' },
  { value: 'san-andres',             label: 'San Andres',             parent: 'colombie' },
  { value: 'costa-rica',             label: 'Costa Rica',             parent: null },
  { value: 'puntarenas',             label: 'Puntarenas',             parent: 'costa-rica' },
  { value: 'guanacaste',             label: 'Guanacaste',             parent: 'costa-rica' },
  { value: 'san-jose',               label: 'San José',               parent: 'costa-rica' },
  { value: 'cuba',                   label: 'Cuba',                   parent: null },
  { value: 'cayo-coco',              label: 'Cayo Coco',              parent: 'cuba' },
  { value: 'cayo-cruz',              label: 'Cayo Cruz',              parent: 'cuba' },
  { value: 'cayo-largo',             label: 'Cayo Largo',             parent: 'cuba' },
  { value: 'cayo-santa-maria',       label: 'Cayo Santa Maria',       parent: 'cuba' },
  { value: 'cienfuegos',             label: 'Cienfuegos',             parent: 'cuba' },
  { value: 'holguin',                label: 'Holguin',                parent: 'cuba' },
  { value: 'la-havane',              label: 'La Havane',              parent: 'cuba' },
  { value: 'trinidad',               label: 'Trinidad',               parent: 'cuba' },
  { value: 'varadero',               label: 'Varadero',               parent: 'cuba' },
  { value: 'curacao',                label: 'Curaçao',                parent: null },
  { value: 'guadeloupe',             label: 'Guadeloupe',             parent: null },
  { value: 'jamaique',               label: 'Jamaïque',               parent: null },
  { value: 'montego-bay',            label: 'Montego Bay',            parent: 'jamaique' },
  { value: 'negril',                 label: 'Negril',                 parent: 'jamaique' },
  { value: 'ocho-rios',              label: 'Ocho Rios',              parent: 'jamaique' },
  { value: 'runaway-bay',            label: 'Runaway Bay',            parent: 'jamaique' },
  { value: 'whitehouse',             label: 'Whitehouse',             parent: 'jamaique' },
  { value: 'martinique',             label: 'Martinique',             parent: null },
  { value: 'mexique',                label: 'Mexique',                parent: null },
  { value: 'cancun',                 label: 'Cancun',                 parent: 'mexique' },
  { value: 'cozumel',                label: 'Cozumel',                parent: 'mexique' },
  { value: 'ixtapa',                 label: 'Ixtapa',                 parent: 'mexique' },
  { value: 'los-cabos',              label: 'Los Cabos',              parent: 'mexique' },
  { value: 'mazatlan',               label: 'Mazatlan',               parent: 'mexique' },
  { value: 'puerto-vallarta',        label: 'Puerto Vallarta',        parent: 'mexique' },
  { value: 'riviera-maya',           label: 'Riviera Maya',           parent: 'mexique' },
  { value: 'panama',                 label: 'Panama',                 parent: null },
  { value: 'puerto-rico',            label: 'Puerto Rico',            parent: null },
  { value: 'republique-dominicaine', label: 'République Dominicaine', parent: null },
  { value: 'puerto-plata',           label: 'Puerto Plata',           parent: 'republique-dominicaine' },
  { value: 'la-romana',              label: 'La Romana',              parent: 'republique-dominicaine' },
  { value: 'punta-cana',             label: 'Punta Cana',             parent: 'republique-dominicaine' },
  { value: 'samana',                 label: 'Samaná',                 parent: 'republique-dominicaine' },
  { value: 'santo-domingo',          label: 'Santo Domingo',          parent: 'republique-dominicaine' },
  { value: 'st_martin',              label: 'St Martin',              parent: null },
  { value: 'turks-et-caicos',        label: 'Turks et Caicos',        parent: null },
];

const ORIGINES = [
  { value: 'bagotville', label: 'Bagotville' },
  { value: 'calgary',    label: 'Calgary' },
  { value: 'edmonton',   label: 'Edmonton' },
  { value: 'halifax',    label: 'Halifax' },
  { value: 'montreal',   label: 'Montréal' },
  { value: 'ottawa',     label: 'Ottawa' },
  { value: 'quebec',     label: 'Québec' },
  { value: 'saskatoon',  label: 'Saskatoon' },
  { value: 'toronto',    label: 'Toronto' },
  { value: 'vancouver',  label: 'Vancouver' },
  { value: 'winnipeg',   label: 'Winnipeg' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const PROVIDER_BASE   = 'https://www.voyagesconstellation.com';
const CACHE_TTL_HOURS = 2;

const HTTP_HEADERS = {
  'User-Agent':      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Accept':          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'fr-CA,fr;q=0.9,en;q=0.8',
  'Cache-Control':   'no-cache',
};

async function fetchHtml(url) {
  const response = await axios.get(url, { timeout: 20000, headers: HTTP_HEADERS });
  return response.data;
}

function encodeToken(str)  { return Buffer.from(str).toString('base64'); }
function decodeToken(token){ return Buffer.from(token, 'base64').toString('utf8'); }
function proxyImg(absoluteUrl) {
  return `/api/all-inclusive/img?token=${encodeToken(absoluteUrl)}`;
}

function parseEtoiles(starsStr) {
  if (!starsStr) return null;
  if (starsStr.includes('<img') || starsStr.includes('grandluxe')) return 'grandluxe';
  const full = (starsStr.match(/★/g) || []).length;
  const half = starsStr.includes('½') ? 0.5 : 0;
  return full + half;
}

// ─── Parsers ─────────────────────────────────────────────────────────────────

function parseListePage(html) {
  const $ = cheerio.load(html);
  const packages = [];

  $('a.hotel').each((_, el) => {
    const $el = $(el);
    const idAttr = $el.attr('id') || '';
    const id     = parseInt(idAttr.replace('hot_', ''), 10);
    const href   = $el.attr('href') || '';

    const style    = $el.attr('style') || '';
    const imgMatch = style.match(/url\('([^']+)'\)/);
    const image    = imgMatch ? proxyImg(`${PROVIDER_BASE}${imgMatch[1]}`) : null;

    const numero  = parseInt($el.find('.number').text().trim(), 10);
    const etoiles = parseEtoiles($el.find('.stars').html() || $el.find('.stars').text());

    const $name  = $el.find('.name');
    const region = $name.find('span').text().trim();
    $name.find('span').remove();
    const nom = $name.text().trim();

    const prixStr = $el.find('.prix').text().trim();
    const prix    = parseInt(prixStr.replace(/[^0-9]/g, ''), 10) || null;

    const destMatch   = href.match(/^\/([^/?]+)\//);
    const destination = destMatch ? destMatch[1] : null;

    if (nom && prix) {
      packages.push({ id, numero, nom, region, destination, etoiles, prix, image, token: encodeToken(href) });
    }
  });

  return packages;
}

function parseDetailPage(html) {
  const $ = cheerio.load(html);

  const nom     = $('.name').first().clone().children().remove().end().text().trim();
  const region  = $('.name span').first().text().trim();
  const etoiles = parseEtoiles($('.stars').first().html() || '');

  const bannerStyle = $('.banner').attr('style') || '';
  const bannerMatch = bannerStyle.match(/url\(([^)]+)\)/);
  const image = bannerMatch
    ? proxyImg(`${PROVIDER_BASE}${bannerMatch[1].replace(/['"]/g, '')}`)
    : null;

  const images = [];
  $('img.thumbnail, img.largeimage').each((_, el) => {
    const src = $(el).attr('src');
    if (src) {
      const proxied = proxyImg(`${PROVIDER_BASE}${src}`);
      if (!images.includes(proxied)) images.push(proxied);
    }
  });

  const infos = {};
  $('.block').each((_, el) => {
    const titre = $(el).find('h3').text().trim();
    const items = [];
    $(el).find('li').each((_, li) => items.push($(li).text().trim()));
    if (titre && items.length) infos[titre] = items;
  });

  const typesChambres = [];

  $('h3.type').each((_, h3) => {
    const $h3          = $(h3);
    const titreComplet = $h3.find('a').text().trim();
    const nomChambre   = titreComplet.replace(/\d+\s*options.*/, '').trim();
    const qtyMatch     = titreComplet.match(/(\d+)\s*options/);
    const prixMatch    = titreComplet.match(/(\d+[\d.,]*)\$/);
    const nbOptions    = qtyMatch  ? parseInt(qtyMatch[1])                     : null;
    const prixDepart   = prixMatch ? parseFloat(prixMatch[1].replace(',', '.')) : null;

    const options = [];
    $h3.next('.groupe.accordeons').find('.vol.groupe').each((_, volEl) => {
      const $vol     = $(volEl);
      const optionId = $vol.attr('id')?.replace('option_', '') || null;
      const prix     = parseFloat($vol.find('input[id^="price_"]').val()) || null;
      const jourDep  = $vol.find('.title').text().trim().split(/\s*-\s*/)[0].trim();
      const typeIncl = $vol.find('.title').text().includes('Tout Inclus') ? 'Tout Inclus' : null;
      const lienDetails = $vol.find('a.information').attr('url') || null;

      const vols = [];
      $vol.find('table.date tr').not(':first').each((_, tr) => {
        const cells = $(tr).find('td').map((_, td) => $(td).text().trim()).get();
        if (cells.length >= 6) {
          vols.push({ date: cells[0], vol: cells[1], origine: cells[2], depart: cells[3], destination: cells[4], arrivee: cells[5] });
        }
      });

      let compagnie = null;
      if (vols.length > 0) {
        if      (vols[0].vol.includes('WestJet'))    compagnie = 'WestJet';
        else if (vols[0].vol.includes('Transat'))    compagnie = 'Air Transat';
        else if (vols[0].vol.includes('Sunwing'))    compagnie = 'Sunwing';
        else if (vols[0].vol.includes('Air Canada')) compagnie = 'Air Canada';
        else compagnie = vols[0].vol.split('-')[0].trim();
      }

      if (optionId && vols.length === 2) {
        options.push({ id: optionId, jour_depart: jourDep, compagnie, type_inclus: typeIncl, prix, lien_details: lienDetails, vol_aller: vols[0], vol_retour: vols[1] });
      }
    });

    options.sort((a, b) => (a.prix || 0) - (b.prix || 0));
    typesChambres.push({ nom: nomChambre, nb_options: nbOptions, prix_depart: prixDepart, options });
  });

  return {
    nom, region, etoiles, image, images, infos,
    types_chambres: typesChambres,
    prix_min: typesChambres.length
      ? Math.min(...typesChambres.flatMap(t => t.options.map(o => o.prix)).filter(Boolean))
      : null,
  };
}

// ─── Factory — reçoit db pour le cache ───────────────────────────────────────

module.exports = function createRouter(db) {

  // ── Initialiser la table cache ──
  db.exec(`
    CREATE TABLE IF NOT EXISTS ai_search_cache (
      cache_key  TEXT PRIMARY KEY,
      data       TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  const stmtGet = db.prepare(
    `SELECT data FROM ai_search_cache
     WHERE cache_key = ?
       AND created_at > datetime('now', '-${CACHE_TTL_HOURS} hours')`
  );

  const stmtSet = db.prepare(
    `INSERT OR REPLACE INTO ai_search_cache (cache_key, data, created_at)
     VALUES (?, ?, datetime('now'))`
  );

  const stmtClean = db.prepare(
    `DELETE FROM ai_search_cache WHERE created_at < datetime('now', '-24 hours')`
  );

  // Nettoyage au démarrage
  stmtClean.run();

  // ─── Router ────────────────────────────────────────────────────────────────

  const router = express.Router();

  router.get('/destinations', (req, res) => res.json(DESTINATIONS));
  router.get('/origines',     (req, res) => res.json(ORIGINES));

  // ── Proxy images ──
  router.get('/img', async (req, res) => {
    const { token } = req.query;
    if (!token) return res.status(400).end();
    let imgUrl;
    try { imgUrl = decodeToken(token); } catch { return res.status(400).end(); }
    if (!imgUrl.startsWith(PROVIDER_BASE)) return res.status(403).end();
    try {
      const response = await axios.get(imgUrl, { headers: HTTP_HEADERS, responseType: 'stream', timeout: 15000 });
      res.setHeader('Content-Type', response.headers['content-type'] || 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      response.data.pipe(res);
    } catch { res.status(404).end(); }
  });

  // ── Recherche (avec cache) ──
  router.get('/search', async (req, res) => {
    const {
      orig       = 'montreal',
      dest       = 'tout-le-sud',
      dep,
      flex       = '3',
      n          = '7',
      toutinclus = '1',
    } = req.query;

    const depParam = dep || (() => {
      const d = new Date();
      d.setDate(d.getDate() + 30);
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      return `${d.getDate()}${months[d.getMonth()]}${d.getFullYear()}`;
    })();

    // Clé = paramètres de fetch uniquement (les filtres client ne font pas partie de la clé)
    const cacheKey = `${orig}|${dest}|${depParam}|${flex}|${n}`;

    // ── Vérifier le cache ──
    try {
      const cached = stmtGet.get(cacheKey);
      if (cached) {
        console.log(`[all-inclusive] cache HIT : ${cacheKey}`);
        return res.json({ success: true, cached: true, ...JSON.parse(cached.data) });
      }
    } catch (err) {
      console.warn('[all-inclusive] cache read error:', err.message);
    }

    // ── Fetch Constellation ──
    const qs = new URLSearchParams({ orig, dep: depParam, flex, n });
    if (toutinclus === '1') qs.append('toutinclus', '');
    const fetchUrl = `${PROVIDER_BASE}/${dest}/tous-les-hotels?${qs.toString()}`;

    try {
      console.log(`[all-inclusive] cache MISS : ${cacheKey} — fetch Constellation`);
      const packages = parseListePage(await fetchHtml(fetchUrl));

      const payload = {
        total:  packages.length,
        params: { orig, dest, dep: depParam, flex, n, toutinclus },
        data:   packages,
      };

      // ── Sauvegarder dans le cache ──
      try {
        stmtSet.run(cacheKey, JSON.stringify(payload));
        if (Math.random() < 0.05) stmtClean.run(); // nettoyage opportuniste 5%
      } catch (err) {
        console.warn('[all-inclusive] cache write error:', err.message);
      }

      res.json({ success: true, cached: false, ...payload });

    } catch (err) {
      console.error('[all-inclusive] search error:', err.message);
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // ── Détail hôtel ──
  router.get('/detail', async (req, res) => {
    const { token } = req.query;
    if (!token) return res.status(400).json({ success: false, message: 'Token manquant.' });
    let fetchUrl;
    try {
      const href = decodeToken(token);
      fetchUrl   = `${PROVIDER_BASE}${href}`;
    } catch {
      return res.status(400).json({ success: false, message: 'Token invalide.' });
    }
    if (!fetchUrl.startsWith(PROVIDER_BASE))
      return res.status(400).json({ success: false, message: 'Accès non autorisé.' });
    try {
      const detail = parseDetailPage(await fetchHtml(fetchUrl));
      res.json({ success: true, data: detail });
    } catch (err) {
      console.error('[all-inclusive] detail error:', err.message);
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // ── Vider le cache manuellement ──
  router.delete('/cache', (req, res) => {
    try {
      const { changes } = db.prepare('DELETE FROM ai_search_cache').run();
      res.json({ success: true, deleted: changes });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  return router;
};