const db = require("better-sqlite3")("../db/croisieres.db");
const row = db.prepare("SELECT lien_seg FROM mes_croisieres WHERE navire='Norwegian Jade' LIMIT 1").get();
console.log(row);
