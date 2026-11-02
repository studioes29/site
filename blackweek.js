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

  const css = `
.bw{position:fixed;z-index:60;right:24px;bottom:24px;width:min(400px,calc(100vw - 32px));background:#0B0B0D;color:#F4F2F7;border-radius:28px;padding:26px 26px 22px;box-shadow:0 24px 60px rgba(0,0,0,.38);border:1px solid rgba(255,255,255,.08);overflow:hidden;font-family:var(--f,"Inter Tight",Arial,sans-serif);transform:translateY(16px);opacity:0;transition:transform .5s cubic-bezier(.16,1,.3,1),opacity .4s}
.bw.on{transform:none;opacity:1}
.bw>*{position:relative}
.bw-h{display:flex;align-items:center;gap:14px;margin:0 0 14px}
.bw-pa{flex:none;width:64px;height:64px;transform:rotate(-10deg);filter:drop-shadow(0 10px 16px rgba(0,0,0,.55))}
.bw-pa svg{display:block}
.bw-k{font:500 16px/1.25 var(--sf,"Urbanist",sans-serif);font-style:italic;color:rgba(244,242,247,.75);margin:0}
.bw-t{font:800 27px/1.02 var(--d,"Bricolage Grotesque",sans-serif);letter-spacing:-.03em;margin:0 0 10px;padding-right:20px;color:#F4F2F7}
.bw-p{font-size:15px;line-height:1.45;margin:0 0 16px;color:rgba(244,242,247,.78)}
.bw-a{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.bw-b{display:inline-flex;align-items:center;min-height:44px;padding:0 18px;border-radius:999px;background:#F4F2F7;color:#0B0B0D;font-weight:700;font-size:15px;text-decoration:none}
.bw-l{display:inline-flex;align-items:center;min-height:44px;padding:0 6px;color:#F4F2F7;font-weight:600;font-size:15px;text-decoration:underline;text-underline-offset:3px}
.bw-n{font-size:12px;line-height:1.4;color:rgba(244,242,247,.55);margin:14px 0 0}
.bw-x{position:absolute;top:14px;right:14px;width:36px;height:36px;border:0;border-radius:50%;background:rgba(255,255,255,.1);color:#F4F2F7;font-size:20px;line-height:1;cursor:pointer}
@media (width<=600px){.bw{right:16px;bottom:16px;padding:22px 20px 18px}.bw-t{font-size:23px}}
@media (prefers-reduced-motion:reduce){.bw{transition:none}}`;
  const st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  const el = document.createElement('aside');
  el.className = 'bw';
  el.setAttribute('aria-label', 'Offre Black Week');
  el.innerHTML = `
<button class="bw-x" type="button" aria-label="Fermer l’offre">×</button>
<div class="bw-h"><span class="bw-pa"><svg viewBox="0 0 300 300" width="64" height="64" aria-hidden="true"><defs><linearGradient id="bw-bl0" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FBFBFD"/><stop offset=".35" stop-color="#B9BAC4"/><stop offset=".55" stop-color="#5D5E68"/><stop offset=".8" stop-color="#E6E7EC"/><stop offset="1" stop-color="#8C8D97"/></linearGradient><linearGradient id="bw-bl1" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D9DAE0"/><stop offset=".4" stop-color="#FFFFFF"/><stop offset=".62" stop-color="#7C7D88"/><stop offset="1" stop-color="#C4C5CD"/></linearGradient><linearGradient id="bw-bl2" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#6F7079"/><stop offset=".3" stop-color="#E9EAEF"/><stop offset=".55" stop-color="#FFFFFF"/><stop offset=".78" stop-color="#9A9BA5"/><stop offset="1" stop-color="#55565F"/></linearGradient><linearGradient id="bw-rim" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".25" stop-color="#9FA0AA"/><stop offset=".5" stop-color="#F4F4F7"/><stop offset=".72" stop-color="#4C4D56"/><stop offset="1" stop-color="#D8D9DF"/></linearGradient><linearGradient id="bw-rim2" x1="1" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".3" stop-color="#8E8F99"/><stop offset=".55" stop-color="#EDEDF1"/><stop offset=".8" stop-color="#5A5B64"/><stop offset="1" stop-color="#CFD0D6"/></linearGradient><radialGradient id="bw-hole" cx=".45" cy=".4" r=".7"><stop offset="0" stop-color="#2B2B33"/><stop offset=".7" stop-color="#0C0C10"/><stop offset="1" stop-color="#000"/></radialGradient><clipPath id="bw-cl"><circle cx="150" cy="150" r="98"/></clipPath><clipPath id="bw-cl"><circle cx="150" cy="150" r="98"/></clipPath></defs><circle cx="150" cy="150" r="149" fill="url(#bw-rim)"/><circle cx="150" cy="150" r="128" fill="url(#bw-rim2)"/><circle cx="150" cy="150" r="101" fill="#1A1A20"/><g clip-path="url(#bw-cl)"><circle cx="150" cy="150" r="98" fill="url(#bw-hole)"/><path d="M184.9,145.1 L175.6,174.3 L139.3,262.2 L231.1,228.3 Z" fill="url(#bw-bl0)" stroke="#2A2A30" stroke-width="1.2" stroke-linejoin="round"/><path d="M184.9,145.1 L231.1,228.3" stroke="rgba(255,255,255,.75)" stroke-width="1.4"/><path d="M175.6,174.3 L147.0,185.2 L55.6,211.6 L139.3,262.2 Z" fill="url(#bw-bl1)" stroke="#2A2A30" stroke-width="1.2" stroke-linejoin="round"/><path d="M175.6,174.3 L139.3,262.2" stroke="rgba(255,255,255,.75)" stroke-width="1.4"/><path d="M147.0,185.2 L120.7,169.6 L43.0,114.6 L55.6,211.6 Z" fill="url(#bw-bl2)" stroke="#2A2A30" stroke-width="1.2" stroke-linejoin="round"/><path d="M147.0,185.2 L55.6,211.6" stroke="rgba(255,255,255,.75)" stroke-width="1.4"/><path d="M120.7,169.6 L116.4,139.3 L110.9,44.3 L43.0,114.6 Z" fill="url(#bw-bl0)" stroke="#2A2A30" stroke-width="1.2" stroke-linejoin="round"/><path d="M120.7,169.6 L43.0,114.6" stroke="rgba(255,255,255,.75)" stroke-width="1.4"/><path d="M116.4,139.3 L137.4,117.0 L208.3,53.5 L110.9,44.3 Z" fill="url(#bw-bl1)" stroke="#2A2A30" stroke-width="1.2" stroke-linejoin="round"/><path d="M116.4,139.3 L110.9,44.3" stroke="rgba(255,255,255,.75)" stroke-width="1.4"/><path d="M137.4,117.0 L167.9,119.6 L261.8,135.4 L208.3,53.5 Z" fill="url(#bw-bl2)" stroke="#2A2A30" stroke-width="1.2" stroke-linejoin="round"/><path d="M137.4,117.0 L208.3,53.5" stroke="rgba(255,255,255,.75)" stroke-width="1.4"/><path d="M167.9,119.6 L184.9,145.1 L231.1,228.3 L261.8,135.4 Z" fill="url(#bw-bl0)" stroke="#2A2A30" stroke-width="1.2" stroke-linejoin="round"/><path d="M167.9,119.6 L261.8,135.4" stroke="rgba(255,255,255,.75)" stroke-width="1.4"/></g><circle cx="150" cy="150" r="99" fill="none" stroke="#2A2A30" stroke-width="3"/><mask id="bw-mm"><rect width="300" height="300" fill="#fff"/><circle cx="163" cy="139" r="24" fill="#000"/></mask><circle cx="150" cy="150" r="29" fill="#F4F2F7" mask="url(#bw-mm)"/></svg></span><p class="bw-k">Black Week, jusqu’au 30 novembre</p></div>
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
