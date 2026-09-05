/* =========================================================
   PARADOX143 — ACTO III V2
   RENACER DEL CAMPO

   Este módulo NO reemplaza la historia de act3.js.
   Cambia su presentación para volver a usar el campo del Acto I.
========================================================= */

(() => {
  'use strict';

  const KEY='paradox143_act3_v1';
  const HISTORY_KEY='paradox143_act3_endings_v2';

  const IS_DEV=
    new URLSearchParams(
      location.search
    ).has('dev');

  let observer=null;
  let retryBusy=false;

  function readState(){
    try{
      return window.ParadoxAct3
        ?.state?.() ||
        JSON.parse(
          localStorage.getItem(KEY) ||
          '{}'
        );
    }catch(_){
      return {};
    }
  }

  function readHistory(){
    try{
      const v=JSON.parse(
        localStorage.getItem(
          HISTORY_KEY
        ) || '[]'
      );

      return Array.isArray(v)
        ? v
        : [];
    }catch(_){
      return [];
    }
  }

  function saveEnding(route){
    if(!route) return;

    const history=
      new Set(
        readHistory()
      );

    history.add(route);

    try{
      localStorage.setItem(
        HISTORY_KEY,
        JSON.stringify(
          [...history]
        )
      );
    }catch(_){}
  }

  function routeTheme(){
    const st=readState();

    if(
      st.route==='remember'
    ){
      return 'act3-remember';
    }

    if(
      st.route==='release'
    ){
      return 'act3-release';
    }

    if(
      st.route==='grow'
    ){
      return 'act3-grow';
    }

    if(
      st.route==='no-change'
    ){
      return 'act3-no-change';
    }

    return 'act3-dawn';
  }

  function applyFieldTheme(){
    if(
      !document.body.classList.contains(
        'act3-active'
      )
    ) return;

    window.ParadoxFieldTheme
      ?.set?.(
        routeTheme()
      );
  }

  function skipBlankOpeningFrame(){
    const cine=
      document.getElementById(
        'act3Cine'
      );

    if(
      !cine ||
      !cine.classList.contains('show') ||
      cine.dataset.theme!=='dawn' ||
      cine.dataset.memory!=='dark'
    ) return;

    const text=
      document.getElementById(
        'act3CineText'
      );

    const sub=
      document.getElementById(
        'act3CineSub'
      );

    if(
      (text?.textContent||'').trim() ||
      (sub?.textContent||'').trim() ||
      cine.dataset.v2BlankSkipped==='1'
    ) return;

    cine.dataset.v2BlankSkipped='1';

    setTimeout(
      ()=>{
        if(
          cine.isConnected &&
          cine.classList.contains('show') &&
          cine.dataset.theme==='dawn' &&
          cine.dataset.memory==='dark' &&
          !(text?.textContent||'').trim()
        ){
          cine.dispatchEvent(
            new MouseEvent(
              'click',
              {
                bubbles:true,
                cancelable:true
              }
            )
          );
        }
      },
      620
    );
  }

  function addWorldLayer(){
    const root=
      document.getElementById(
        'act3Root'
      );

    if(
      !root ||
      root.querySelector(
        '#act3V2Layer'
      )
    ) return;

    const layer=
      document.createElement(
        'div'
      );

    layer.id='act3V2Layer';

    layer.innerHTML=`
      <div class="act3V2Identity" aria-hidden="true">
        <small>ACTO III</small>
        <strong>PRIMER AMANECER</strong>
      </div>

      <div class="act3V2Haze"></div>

      <div class="act3V2Path">
        <i></i>
      </div>

      <div class="act3V2Scar scar-a"></div>
      <div class="act3V2Scar scar-b"></div>

      <div class="act3V2Bloom bloom-a">
        <i></i><i></i><i></i>
      </div>

      <div class="act3V2Bloom bloom-b">
        <i></i><i></i>
      </div>

      <div class="act3V2Fireflies">
        <i></i><i></i><i></i><i></i><i></i>
      </div>

      <div class="act3V2DistantMark">
        <span>·</span>
        <small>algo nuevo</small>
      </div>
    `;

    root.prepend(layer);
  }

  function decorateNodes(){
    const root=
      document.getElementById(
        'act3Root'
      );

    if(!root) return;

    const titles={
      flower:'NUEVA FLOR',
      place:'NUEVO RINCÓN',
      cats:'NUEVA COSTUMBRE',
      sky:'NUEVO CIELO'
    };

    root.querySelectorAll(
      '.act3Node'
    ).forEach(
      node=>{
        if(
          node.dataset.v2Decorated
        ) return;

        node.dataset.v2Decorated='1';

        const small=
          node.querySelector('small');

        const label=
          titles[node.dataset.node]||'';

        node.dataset.v2Label=label;

        if(small){
          const original=
            small.textContent.trim();

          node.setAttribute(
            'aria-label',
            `${label}: ${original}`
          );

          small.innerHTML=`<em>${original}</em>`;
        }
      }
    );
  }

  function updateRouteClass(){
    const root=
      document.getElementById(
        'act3Root'
      );

    if(!root) return;

    const st=readState();

    [
      'remember',
      'release',
      'grow',
      'no-change'
    ].forEach(
      r=>{
        root.classList.toggle(
          `act3v2-${r}`,
          st.route===r
        );
      }
    );

    applyFieldTheme();
  }

  function injectRetry(){
    const root=
      document.getElementById(
        'act3Root'
      );

    const post=
      root?.querySelector(
        '#act3PostWorld.show'
      );

    if(!post) return;

    const st=readState();

    if(!st.route) return;

    saveEnding(
      st.route
    );

    if(
      post.querySelector(
        '#act3RetryEnding'
      )
    ) return;

    const card=
      post.querySelector(
        '.act3PostCard'
      );

    if(!card) return;

    const history=
      readHistory();

    const names={
      remember:'Recordar',
      release:'Dejar ir',
      grow:'Seguir creciendo',
      'no-change':'NO CAMBIES'
    };

    const block=
      document.createElement(
        'div'
      );

    block.className=
      'act3V2Retry';

    block.innerHTML=`
      <div class="act3V2FinalName">
        <small>FINAL</small>
        <strong>${names[st.route]||st.route}</strong>
      </div>

      <button
        id="act3RetryEnding"
        type="button"
      >
        Intentar otro final ♡
      </button>

      <small class="act3V2RetryHint">
        Solo reinicia el Acto III. Tus recuerdos anteriores siguen ahí.
      </small>

      ${
        history.length>1
          ? `<div class="act3V2History">${
              history
                .map(
                  r=>`<i title="${names[r]||r}">♡</i>`
                )
                .join('')
            }</div>`
          : ''
      }
    `;

    card.appendChild(
      block
    );

    block.querySelector(
      '#act3RetryEnding'
    ).addEventListener(
      'click',
      retryEnding
    );
  }

  function retryEnding(){
    if(retryBusy) return;
    retryBusy=true;

    const root=
      document.getElementById(
        'act3Root'
      );

    const st=readState();

    saveEnding(
      st.route
    );

    const veil=
      document.createElement(
        'div'
      );

    veil.className=
      'act3V2RetryVeil';

    veil.innerHTML=`
      <span>♡</span>
      <strong>Volvamos al amanecer.</strong>
      <small>Nada de lo que viviste antes se borra.</small>
    `;

    root?.appendChild(
      veil
    );

    setTimeout(
      ()=>{
        /*
          ParadoxAct3.reset() SOLO elimina paradox143_act3_v1.
          No toca:
          - cartas;
          - gatos;
          - Acto I;
          - Acto II;
          - fragmentos;
          - Canasta.
        */
        window.ParadoxFieldTheme
          ?.set?.(
            'act3-dawn'
          );

        window.ParadoxAct3
          ?.reset?.();
      },
      1150
    );

    setTimeout(
      ()=>{
        retryBusy=false;
      },
      2200
    );
  }

  function hideLegacyUI(){
    document.body.classList.toggle(
      'act3-v2-field',
      document.body.classList.contains(
        'act3-active'
      )
    );
  }

  function sync(){
    hideLegacyUI();

    const root=
      document.getElementById(
        'act3Root'
      );

    if(
      !root ||
      !root.classList.contains(
        'active'
      )
    ) return;

    addWorldLayer();
    decorateNodes();
    updateRouteClass();
    skipBlankOpeningFrame();
    injectRetry();
  }

  function boot(){
    observer=
      new MutationObserver(
        ()=>{
          sync();
        }
      );

    observer.observe(
      document.documentElement,
      {
        subtree:true,
        childList:true,
        attributes:true,
        attributeFilter:[
          'class'
        ]
      }
    );

    setInterval(
      sync,
      850
    );

    sync();
  }

  if(
    document.readyState==='loading'
  ){
    document.addEventListener(
      'DOMContentLoaded',
      boot,
      {once:true}
    );
  }else{
    boot();
  }

  window.ParadoxAct3V2={
    sync,
    retryEnding,
    endings:readHistory,
    theme:routeTheme
  };
})();
