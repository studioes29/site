/* Génère conditions/index.html à partir de conditions/cgv.js (source unique).
   Usage, depuis la racine du dépôt : node conditions/build.js */
const fs = require("fs"), path = require("path"), vm = require("vm");
const D = __dirname, ctx = {window: {}};
vm.runInNewContext(fs.readFileSync(path.join(D, "cgv.js"), "utf8"), ctx);
const W = ctx.window, tpl = fs.readFileSync(path.join(D, "page.tpl.html"), "utf8");
const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const dt = v => { const [a, m, j] = v.split("-"); return +j + " " + ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"][+m - 1] + " " + a; };
const ancre = t => t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/^\d+\.\s*/, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const sommaire = W.STUDIO_CGV.map(a => `<li><a href="#${ancre(a[0])}">${esc(a[0].replace(/^\d+\.\s*/, ""))}</a></li>`).join("");
const articles = W.STUDIO_CGV.map(a => `<section class="art" id="${ancre(a[0])}"><h2>${esc(a[0])}</h2>${a[1].map(p => `<p>${esc(p)}</p>`).join("")}</section>`).join("\n");
const out = tpl.replace("{{VERSION}}", dt(W.STUDIO_CGV_VERSION)).replace("{{INTRO}}", esc(W.STUDIO_CGV_INTRO)).replace("{{SOMMAIRE}}", sommaire).replace("{{ARTICLES}}", articles);
if (/[–—]/.test(out)) { console.error("Tiret long ou demi-cadratin trouvé : corrige cgv.js"); process.exit(1); }
fs.writeFileSync(path.join(D, "index.html"), out);
console.log("conditions/index.html généré, version " + W.STUDIO_CGV_VERSION);
/* sécurité : CSP par empreintes et politique de référent */
require("child_process").execFileSync("python3", [path.join(D, "..", "_src", "securite.py"), path.join(D, "index.html")], {stdio: "inherit"});
