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

  /* pastille holographique, bord festonné (12 lobes) */
  const HOLO = 'linear-gradient(118deg,#DDE1E8 0%,#C9EEE8 14%,#E6DBFF 28%,#FFF6DE 42%,#D6E8FF 56%,#F5DCEA 70%,#D3D7DF 84%,#DDE1E8 100%)';
  const css = `
.bw{position:fixed;z-index:60;right:24px;bottom:24px;width:min(400px,calc(100vw - 32px));background:#0B0B0D;color:#F4F2F7;border-radius:28px;padding:26px 26px 22px;box-shadow:0 24px 60px rgba(0,0,0,.38);border:1px solid rgba(255,255,255,.08);overflow:hidden;font-family:var(--f,"Inter Tight",Arial,sans-serif);transform:translateY(16px);opacity:0;transition:transform .5s cubic-bezier(.16,1,.3,1),opacity .4s}
.bw.on{transform:none;opacity:1}
.bw>*{position:relative}
.bw-h{display:flex;align-items:center;gap:14px;margin:0 0 14px}
.bw-pa{flex:none;position:relative;width:64px;height:64px;clip-path:path("M63.2 32.0 L63.0 33.1 L62.5 34.1 L61.8 35.1 L60.9 36.1 L60.1 36.9 L59.3 37.8 L58.8 38.7 L58.6 39.6 L58.6 40.6 L58.8 41.7 L59.1 42.9 L59.4 44.2 L59.5 45.4 L59.4 46.6 L59.0 47.6 L58.3 48.5 L57.4 49.1 L56.2 49.6 L55.0 50.0 L53.8 50.3 L52.8 50.7 L51.9 51.2 L51.2 51.9 L50.7 52.8 L50.3 53.8 L50.0 55.0 L49.6 56.2 L49.1 57.4 L48.5 58.3 L47.6 59.0 L46.6 59.4 L45.4 59.5 L44.2 59.4 L42.9 59.1 L41.7 58.8 L40.6 58.6 L39.6 58.6 L38.7 58.8 L37.8 59.3 L36.9 60.1 L36.1 60.9 L35.1 61.8 L34.1 62.5 L33.1 63.0 L32.0 63.2 L30.9 63.0 L29.9 62.5 L28.9 61.8 L27.9 60.9 L27.1 60.1 L26.2 59.3 L25.3 58.8 L24.4 58.6 L23.4 58.6 L22.3 58.8 L21.1 59.1 L19.8 59.4 L18.6 59.5 L17.4 59.4 L16.4 59.0 L15.5 58.3 L14.9 57.4 L14.4 56.2 L14.0 55.0 L13.7 53.8 L13.3 52.8 L12.8 51.9 L12.1 51.2 L11.2 50.7 L10.2 50.3 L9.0 50.0 L7.8 49.6 L6.6 49.1 L5.7 48.5 L5.0 47.6 L4.6 46.6 L4.5 45.4 L4.6 44.2 L4.9 42.9 L5.2 41.7 L5.4 40.6 L5.4 39.6 L5.2 38.7 L4.7 37.8 L3.9 36.9 L3.1 36.1 L2.2 35.1 L1.5 34.1 L1.0 33.1 L0.8 32.0 L1.0 30.9 L1.5 29.9 L2.2 28.9 L3.1 27.9 L3.9 27.1 L4.7 26.2 L5.2 25.3 L5.4 24.4 L5.4 23.4 L5.2 22.3 L4.9 21.1 L4.6 19.8 L4.5 18.6 L4.6 17.4 L5.0 16.4 L5.7 15.5 L6.6 14.9 L7.8 14.4 L9.0 14.0 L10.2 13.7 L11.2 13.3 L12.1 12.8 L12.8 12.1 L13.3 11.2 L13.7 10.2 L14.0 9.0 L14.4 7.8 L14.9 6.6 L15.5 5.7 L16.4 5.0 L17.4 4.6 L18.6 4.5 L19.8 4.6 L21.1 4.9 L22.3 5.2 L23.4 5.4 L24.4 5.4 L25.3 5.2 L26.2 4.7 L27.1 3.9 L27.9 3.1 L28.9 2.2 L29.9 1.5 L30.9 1.0 L32.0 0.8 L33.1 1.0 L34.1 1.5 L35.1 2.2 L36.1 3.1 L36.9 3.9 L37.8 4.7 L38.7 5.2 L39.6 5.4 L40.6 5.4 L41.7 5.2 L42.9 4.9 L44.2 4.6 L45.4 4.5 L46.6 4.6 L47.6 5.0 L48.5 5.7 L49.1 6.6 L49.6 7.8 L50.0 9.0 L50.3 10.2 L50.7 11.2 L51.2 12.1 L51.9 12.8 L52.8 13.3 L53.8 13.7 L55.0 14.0 L56.2 14.4 L57.4 14.9 L58.3 15.5 L59.0 16.4 L59.4 17.4 L59.5 18.6 L59.4 19.8 L59.1 21.1 L58.8 22.3 L58.6 23.4 L58.6 24.4 L58.8 25.3 L59.3 26.2 L60.1 27.1 L60.9 27.9 L61.8 28.9 L62.5 29.9 L63.0 30.9Z");background:${HOLO};background-size:260% 260%;animation:bw-holo 6s ease-in-out infinite alternate;transform:rotate(-12deg);display:flex;align-items:center;justify-content:center;color:#1A1A1A;font:800 17px/1 var(--d,"Bricolage Grotesque",sans-serif);letter-spacing:-.03em}
.bw-pa::after{content:"";position:absolute;inset:0;background:linear-gradient(118deg,transparent 30%,rgba(255,255,255,.65) 44%,transparent 56%);background-size:260% 100%;animation:bw-brille 6s ease-in-out infinite alternate}
.bw-pa>*{position:relative;z-index:1}
@keyframes bw-holo{from{background-position:0% 30%}to{background-position:100% 70%}}
@keyframes bw-brille{from{background-position:100% 0}to{background-position:0% 0}}
.bw-k{font:500 16px/1.25 var(--sf,"Urbanist",sans-serif);font-style:italic;color:rgba(244,242,247,.75);margin:0}
.bw-t{font:800 27px/1.02 var(--d,"Bricolage Grotesque",sans-serif);letter-spacing:-.03em;margin:0 0 10px;padding-right:20px;color:#F4F2F7}
.bw-p{font-size:15px;line-height:1.45;margin:0 0 16px;color:rgba(244,242,247,.78)}
.bw-a{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.bw-b{display:inline-flex;align-items:center;min-height:44px;padding:0 18px;border-radius:999px;background:#F4F2F7;color:#0B0B0D;font-weight:700;font-size:15px;text-decoration:none}
.bw-l{display:inline-flex;align-items:center;min-height:44px;padding:0 6px;color:#F4F2F7;font-weight:600;font-size:15px;text-decoration:underline;text-underline-offset:3px}
.bw-n{font-size:12px;line-height:1.4;color:rgba(244,242,247,.55);margin:14px 0 0}
.bw-x{position:absolute;top:14px;right:14px;width:36px;height:36px;border:0;border-radius:50%;background:rgba(255,255,255,.1);color:#F4F2F7;font-size:20px;line-height:1;cursor:pointer}
@media (width<=600px){.bw{right:16px;bottom:16px;padding:22px 20px 18px}.bw-t{font-size:23px}}
@media (prefers-reduced-motion:reduce){.bw{transition:none}.bw-pa,.bw-pa::after{animation:none}}`;
  const st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  const el = document.createElement('aside');
  el.className = 'bw';
  el.setAttribute('aria-label', 'Offre Black Week');
  el.innerHTML = `
<button class="bw-x" type="button" aria-label="Fermer l’offre">×</button>
<div class="bw-h"><span class="bw-pa" aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" stroke-width="2" stroke-linejoin="round"><path d="M14.5 4.2a8 8 0 1 0 5.3 11.9A6.6 6.6 0 0 1 14.5 4.2z"/></svg></span><p class="bw-k">Black Week, jusqu’au 30 novembre</p></div>
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
