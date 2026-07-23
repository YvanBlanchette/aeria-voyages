export const ACV_BASE = "https://vacations.aircanada.com";

export const ACV_HEADERS = {
	"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
	Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
	"Accept-Language": "fr-CA,fr;q=0.9,en;q=0.8",
	"Accept-Encoding": "identity",
};

export const ACV_DESTINATIONS = {
	AMS: "Amsterdam", BCN: "Barcelone", BRU: "Bruxelles",
	CDG: "Paris",     DUB: "Dublin",    FCO: "Rome",
	FRA: "Francfort", GVA: "Genève",    LHR: "Londres",
	LIS: "Lisbonne",  LYS: "Lyon",      MAD: "Madrid",
	MUC: "Munich",    MXP: "Milan",     TLS: "Toulouse",
	VIE: "Vienne",    ZRH: "Zurich",
};

export const ACV_VILLES = {
	YUL: "Montréal",
	YQB: "Québec",
	YOW: "Ottawa",
};

const MIME_MAP = {
	css: "text/css", js: "application/javascript", svg: "image/svg+xml",
	png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg",
	webp: "image/webp", gif: "image/gif", ico: "image/x-icon",
	woff: "font/woff", woff2: "font/woff2", ttf: "font/ttf",
};

export function mimeFromPath(chemin) {
	const ext = chemin.split("?")[0].split(".").pop().toLowerCase();
	return MIME_MAP[ext] ?? null;
}

export function rewriteUrl(val) {
	if (!val || val.startsWith("data:") || val.startsWith("#") || val.startsWith("mailto:") || val.startsWith("javascript:")) return val;
	if (val.startsWith(ACV_BASE)) return "/api/acv-proxy?url=" + encodeURIComponent(val);
	if (val.startsWith("http://") || val.startsWith("https://")) return val;
	if (val.startsWith("//")) return "/api/acv-proxy?url=" + encodeURIComponent("https:" + val);
	if (val.startsWith("/")) return "/api/acv-proxy?url=" + encodeURIComponent(ACV_BASE + val);
	return val;
}

export const AERIA_CSS = `<style id="aeria-overrides">
	header, footer, .header, .footer, nav, .nav, .navbar,
	.breadcrumb, .return-btn-top, .return-previous-btn,
	[class*="return-btn"], .back-link, .page-header-wrapper,
	.site-header, .site-footer, .ac-header, .ac-footer { display: none !important; }
	body { padding: 20px !important; margin: 0 !important; background: #fff !important; }
	.btn-primary, .ac-btn-primary, a.btn-red, .btn-red,
	.day-selector li.active a { background-color: #B8935C !important; border-color: #B8935C !important; color: white !important; }
</style>`;
