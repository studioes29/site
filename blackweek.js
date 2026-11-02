/* Offre Black Week de Studio ES.
   S'affiche seule du lundi 23 novembre 2026, 0 h, au lundi 1er décembre 2026, 0 h (heure de Paris), puis disparaît.
   Aperçu avant la date : ajouter ?blackweek à l'adresse de la page.
   L'option offerte s'applique au devis : aucune automatisation côté paiement. */
(() => {
  const DEBUT = Date.parse('2026-11-23T00:00:00+01:00');
  const FIN = Date.parse('2026-12-01T00:00:00+01:00');
  const apercu = /[?&]blackweek\b/.test(location.search);
  const now = Date.now();
  if (!apercu && (now < DEBUT || now >= FIN)) return;
  let ferme = false;
  try { ferme = sessionStorage.getItem('studioes.bw') === '1'; } catch (_) {}
  if (ferme && !apercu) return;

  /* chrome : dégradé métallique (argent pour Studio ES) */
  const CH = 'linear-gradient(176deg,#FFFFFF 0%,#E4E4E8 20%,#B4B4BC 40%,#8A8A94 48%,#FAFAFC 54%,#C8C8CF 68%,#7D7D86 84%,#EDEDF0 100%)';
  const CHB = 'linear-gradient(160deg,#FFFFFF 0%,#DCDCE2 22%,#8E8E98 46%,#F7F7FA 56%,#BDBDC6 74%,#6E6E78 100%)';
  const css = `
.bw{position:fixed;z-index:60;right:24px;bottom:24px;width:min(400px,calc(100vw - 32px));background:#0B0B0D;color:#F4F2F7;border-radius:28px;padding:26px 26px 22px;box-shadow:0 24px 60px rgba(0,0,0,.38);border:1px solid rgba(255,255,255,.08);overflow:hidden;font-family:var(--f,"Inter Tight",Arial,sans-serif);transform:translateY(16px);opacity:0;transition:transform .5s cubic-bezier(.16,1,.3,1),opacity .4s}
.bw.on{transform:none;opacity:1}
.bw::before{content:"Soir";position:absolute;right:-6px;bottom:-40px;font:800 170px/1 var(--d,"Bricolage Grotesque",sans-serif);letter-spacing:-.06em;background:${CH};-webkit-background-clip:text;background-clip:text;color:transparent;opacity:.16;pointer-events:none}
.bw>*{position:relative}
.bw-h{display:flex;align-items:center;gap:12px;margin:0 0 12px}
.bw-pa{flex:none;width:58px;height:58px;border-radius:50%;background:${CHB};box-shadow:inset 0 0 0 2px rgba(255,255,255,.55),inset 0 -6px 12px rgba(0,0,0,.35),0 6px 14px rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;transform:rotate(-12deg);font:700 15px/1 var(--sf,"Urbanist",sans-serif);font-style:italic;color:#1C1C20}
.bw-k{font:500 16px/1.25 var(--sf,"Urbanist",sans-serif);font-style:italic;color:rgba(244,242,247,.75);margin:0}
.bw-t{font:800 27px/1.02 var(--d,"Bricolage Grotesque",sans-serif);letter-spacing:-.03em;margin:0 0 10px;padding-right:20px;background:${CH};-webkit-background-clip:text;background-clip:text;color:transparent}
.bw-p{font-size:15px;line-height:1.45;margin:0 0 16px;color:rgba(244,242,247,.78)}
.bw-a{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.bw-b{display:inline-flex;align-items:center;min-height:44px;padding:0 18px;border-radius:999px;background:${CHB};box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.5);color:#1C1C20;font-weight:700;font-size:15px;text-decoration:none}
.bw-l{display:inline-flex;align-items:center;min-height:44px;padding:0 6px;color:#F4F2F7;font-weight:600;font-size:15px;text-decoration:underline;text-underline-offset:3px}
.bw-n{font-size:12px;line-height:1.4;color:rgba(244,242,247,.55);margin:14px 0 0}
.bw-x{position:absolute;top:14px;right:14px;width:36px;height:36px;border:0;border-radius:50%;background:rgba(255,255,255,.1);color:#F4F2F7;font-size:20px;line-height:1;cursor:pointer}
@media (width<=600px){.bw{right:16px;bottom:16px;padding:22px 20px 18px}.bw-t{font-size:23px}.bw::before{font-size:130px}}
@media (prefers-reduced-motion:reduce){.bw{transition:none}}`;
  const st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  const el = document.createElement('aside');
  el.className = 'bw';
  el.setAttribute('aria-label', 'Offre Black Week');
  el.innerHTML = `
<button class="bw-x" type="button" aria-label="Fermer l’offre">×</button>
<div class="bw-h"><span class="bw-pa" aria-hidden="true">offerte</span><p class="bw-k">Black Week, jusqu’au 30 novembre</p></div>
<p class="bw-t">La sélection du soir offerte</p>
<p class="bw-p">Pour toute réservation photo confirmée cette semaine, une première sélection retouchée est livrée le soir même de l’événement, sans supplément. Valable sur un événement de 2026 ou de 2027, mariages compris.</p>
<div class="bw-a"><a class="bw-b" href="https://cal.com/studioes/30min" target="_blank" rel="noopener">Réserver un échange</a><a class="bw-l" href="/metiers/photographie/">Voir les formules</a></div>
<p class="bw-n">Réservations confirmées (acompte versé) du 23 au 30 novembre 2026. Option habituellement facturée 150 €.</p>`;
  el.querySelector('.bw-x').addEventListener('click', () => {
    el.classList.remove('on');
    try { sessionStorage.setItem('studioes.bw', '1'); } catch (_) {}
    setTimeout(() => el.remove(), 500);
  });
  const go = () => { document.body.appendChild(el); requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('on'))); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(go, 1200));
  else setTimeout(go, 1200);
})();
