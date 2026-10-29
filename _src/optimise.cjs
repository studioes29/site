/* Allège s.css : retire les règles qu'aucune page ni aucun script n'utilise, puis minifie.
   Nécessite Node avec purgecss et lightningcss (npm i -g purgecss@6 lightningcss@1) ; sans eux, s.css reste complet.
   Lancé automatiquement par build.py. */
const fs = require('fs'), path = require('path');
const R = path.resolve(__dirname, '..');
let PurgeCSS, lc;
try { ({ PurgeCSS } = require('purgecss')); lc = require('lightningcss'); } catch (e) { console.log('optimise : purgecss ou lightningcss absent, s.css laissé complet'); process.exit(0); }
(async () => {
  const css = fs.readFileSync(path.join(R, 's.css'), 'utf8');
  const [r] = await new PurgeCSS().purge({
    content: [R + '/**/*.html', R + '/*.js', R + '/_src/*.html', R + '/_src/*.py'],
    css: [{ raw: css }],
    safelist: { standard: ['on', 'in', 'ok', 'vu', 'go', 'vol', 'pause', 'drag', 'empile', 'dk', 'haut', 'charge', 'tourne', 'ent', 'sx-js'],
                greedy: [/data-/, /aria-/, /^sx-/, /^nu-/, /^k-/, /^flb/, /^vis-/, /^gp/, /^lb/, /^sheet/, /^sh-/, /^est/, /^toast/] },
    keyframes: false, fontFace: false, variables: false
  });
  const out = lc.transform({ filename: 's.css', code: Buffer.from(r.css), minify: true }).code;
  fs.writeFileSync(path.join(R, 's.css'), out);
  console.log('optimise : s.css', css.length, '→', out.length, 'octets');
})();
