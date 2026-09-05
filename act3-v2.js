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

    /*
      Antes del final, el campo ya empieza a responder a las
      decisiones tomadas durante Flor / Lugar / Gatos / Cielo.
      No fija una ruta todavía: es solo una inclinación visual.
    */
    const c=st.choices||{};
    const values={
      remember:Number(c.remember||0),
      release:Number(c.release||0),
      grow:Number(c.grow||0)
    };

    const max=Math.max(
      values.remember,
      values.release,
      values.grow
    );

    if(max>=2){
      const leaders=Object.keys(values)
        .filter(k=>values[k]===max);

      if(leaders.length===1){
        return `act3-${leaders[0]}`;
      }
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

  /* =========================================================
     V5 · RECORRIDO VIVO

     Flor / Lugar / Gatos / Cielo ya no aparecen juntos como
     cuatro opciones de interfaz. Se descubren uno a uno después
     de recorrer físicamente el mismo campo del Acto I.
  ========================================================= */

  const JOURNEY=[
    {
      id:'flower',
      travel:Math.max(170,Math.min(280,innerWidth*.20)),
      x:72,
      y:25,
      near:'algo distinto asoma entre los tulipanes.',
      after:'Un poco más adelante, el campo vuelve a abrirse.'
    },
    {
      id:'place',
      travel:Math.max(260,Math.min(390,innerWidth*.28)),
      x:31,
      y:34,
      near:'hay un rincón donde ningún recuerdo encaja.',
      after:'El camino continúa por un lugar que antes no existía.'
    },
    {
      id:'cats',
      travel:Math.max(300,Math.min(430,innerWidth*.31)),
      x:68,
      y:21,
      near:'tres huellas se separan en el pasto.',
      after:'Tuluz mira hacia arriba. Marie también.'
    },
    {
      id:'sky',
      travel:Math.max(320,Math.min(470,innerWidth*.34)),
      x:43,
      y:61,
      near:'una parte del cielo parece tener sitio para algo más.',
      after:'Más adelante queda un espacio que no pertenece a ningún recuerdo.'
    },
    {
      id:'final',
      travel:Math.max(260,Math.min(410,innerWidth*.29)),
      x:51,
      y:29,
      near:'el sendero termina en un espacio sin fuente.',
      after:''
    }
  ];

  let journeyKey='';
  let journeyTravel=0;
  let journeyLastX=null;
  let journeyRevealX=0;
  let journeyRevealed=false;
  let journeyAfterFor='';
  let journeyNearShown=false;

  function fieldX(){
    return Number(
      window.ParadoxFieldTheme
        ?.getWorldX?.() || 0
    );
  }

  function journeyLayer(){
    const root=document.getElementById('act3Root');
    if(!root) return null;

    let layer=root.querySelector('#act3JourneyLayer');
    if(layer) return layer;

    layer=document.createElement('div');
    layer.id='act3JourneyLayer';
    layer.innerHTML=`
      <div id="act3JourneyWhisper"></div>
      <div id="act3JourneyFootprints" aria-hidden="true">
        <i></i><i></i><i></i>
      </div>
    `;
    root.appendChild(layer);
    return layer;
  }

  function journeyWhisper(text,duration=2800){
    const layer=journeyLayer();
    const el=layer?.querySelector('#act3JourneyWhisper');
    if(!el || !text) return;

    el.textContent=text;
    el.classList.remove('show');
    void el.offsetWidth;
    el.classList.add('show');

    clearTimeout(Number(el.dataset.timer||0));
    const timer=setTimeout(
      ()=>el.classList.remove('show'),
      duration
    );
    el.dataset.timer=String(timer);
  }

  function journeyStage(st){
    const nodes=st.nodes||{};
    for(const step of JOURNEY.slice(0,4)){
      if(!nodes[step.id]) return step;
    }
    return JOURNEY[4];
  }

  function journeyMode(st){
    const root=document.getElementById('act3Root');

    return Boolean(
      root?.classList.contains('active') &&
      document.body.classList.contains('act3-active') &&
      st.dawnSeen &&
      !st.route &&
      !st.endingSeen
    );
  }

  function resetJourneyRuntime(step){
    journeyKey=step.id;
    journeyTravel=0;
    journeyLastX=fieldX();
    journeyRevealX=journeyLastX;
    journeyRevealed=false;
    journeyNearShown=false;

    const root=document.getElementById('act3Root');
    if(root){
      root.dataset.journeyStage=step.id;
      root.classList.remove(
        'act3JourneyStep-flower',
        'act3JourneyStep-place',
        'act3JourneyStep-cats',
        'act3JourneyStep-sky',
        'act3JourneyStep-final'
      );
      root.classList.add(`act3JourneyStep-${step.id}`);
    }

    document
      .querySelectorAll('.act3Node')
      .forEach(n=>{
        n.classList.remove(
          'act3JourneyTarget',
          'act3JourneyNear',
          'act3JourneyRevealed'
        );
        n.style.removeProperty('--journey-shift');
      });

    document.getElementById('act3FinalGap')
      ?.classList.remove(
        'act3JourneyTarget',
        'act3JourneyNear',
        'act3JourneyRevealed'
      );

    const previous=JOURNEY[
      Math.max(0,JOURNEY.findIndex(x=>x.id===step.id)-1)
    ];

    if(
      previous &&
      previous.id!==step.id &&
      journeyAfterFor!==previous.id
    ){
      journeyAfterFor=previous.id;
      setTimeout(
        ()=>journeyWhisper(previous.after,3000),
        700
      );
    }else if(step.id==='flower'){
      setTimeout(
        ()=>journeyWhisper(
          'No hay un objetivo marcado. Solo sigue recorriendo el campo.',
          3200
        ),
        900
      );
    }
  }

  function journeyTarget(step){
    if(step.id==='final'){
      return document.getElementById('act3FinalGap');
    }
    return document.querySelector(
      `.act3Node[data-node="${step.id}"]`
    );
  }

  function revealJourneyTarget(step){
    const target=journeyTarget(step);
    if(!target) return;

    journeyRevealed=true;
    journeyRevealX=fieldX();

    target.classList.add(
      'act3JourneyTarget',
      'act3JourneyRevealed'
    );

    target.style.setProperty('--journey-x',`${step.x}%`);
    target.style.setProperty('--journey-y',`${step.y}%`);

    journeyWhisper(step.near,3200);
  }

  function updateJourneyPosition(step){
    if(!journeyRevealed) return;
    const target=journeyTarget(step);
    if(!target) return;

    const shift=Math.max(
      -135,
      Math.min(
        135,
        (fieldX()-journeyRevealX)*.38
      )
    );

    target.style.setProperty(
      '--journey-shift',
      `${shift.toFixed(1)}px`
    );
  }

  function syncJourney(){
    const st=readState();
    const root=document.getElementById('act3Root');

    if(!journeyMode(st)){
      document.body.classList.remove('act3-journey-mode');
      root?.removeAttribute('data-journey-stage');
      journeyKey='';
      journeyLastX=null;
      return;
    }

    document.body.classList.add('act3-journey-mode');
    journeyLayer();

    const step=journeyStage(st);

    if(step.id!==journeyKey){
      resetJourneyRuntime(step);
    }

    const x=fieldX();
    const cineOpen=document.getElementById('act3Cine')
      ?.classList.contains('show');

    if(!cineOpen && journeyLastX!==null){
      journeyTravel+=Math.min(
        75,
        Math.abs(x-journeyLastX)
      );
    }
    journeyLastX=x;

    const target=journeyTarget(step);
    if(target){
      target.classList.add('act3JourneyTarget');
      target.style.setProperty('--journey-x',`${step.x}%`);
      target.style.setProperty('--journey-y',`${step.y}%`);
    }

    const ratio=Math.min(1,journeyTravel/step.travel);

    if(
      !journeyNearShown &&
      ratio>=.63
    ){
      journeyNearShown=true;
      target?.classList.add('act3JourneyNear');
    }

    if(
      !journeyRevealed &&
      ratio>=1
    ){
      revealJourneyTarget(step);
    }

    updateJourneyPosition(step);

    root?.style.setProperty(
      '--act3-journey-near',
      String(Math.max(0,(ratio-.48)/.52))
    );
  }

  setInterval(syncJourney,90);

  window.ParadoxAct3V2={
    sync,
    retryEnding,
    endings:readHistory,
    theme:routeTheme,
    journey:syncJourney
  };
})();
