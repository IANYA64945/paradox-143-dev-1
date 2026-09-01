/* =========================================================
   PARADOX143 — ACTO I · ETAPA 5
   "TODO LO QUE GUARDAMOS"

   Cartas 90–99.

   Reglas:
   - solo cinematográficas
   - sin azar
   - sin minijuegos nuevos
   - sin glitches, errores ni señales oscuras
   - una señal visible persiste hasta tocarla
========================================================= */

(() => {
  'use strict';

  const LETTER_KEY='paradox143_letters_v1';
  const LIFE_KEY='paradox143_act1_life_v1';
  const HABITS_KEY='paradox143_world_habits_v1';
  const FAMILY_KEY='paradox143_refuge_family_v1';

  const STAY_IDS=[
    'act1-place-return',
    'act1-same-moon',
    'act1-nothing-happens',
    'act1-things-stayed',
    'act1-return-tulip',
    'act1-rain-stay',
    'act1-still-knowing-cats',
    'act1-your-choices',
    'act1-one-more-while',
    'act1-meaning-stay'
  ];

  const WARM_IDS=[
    'act1-again-from-start',
    'act1-what-changed',
    'act1-what-remains',
    'act1-whole-night',
    'act1-sky-we-made',
    'act1-where-began',
    'act1-they-grew-too',
    'act1-this-little-world',
    'act1-tomorrow-too',
    'act1-everything-kept'
  ];

  const FIRST_NINE=WARM_IDS.slice(0,9);

  const META={
    'act1-again-from-start':{
      zone:'garden',
      icon:'↺',
      label:'¿cómo se veía todo al principio?'
    },

    'act1-what-changed':{
      zone:'field',
      icon:'✦',
      label:'el campo se siente distinto ahora'
    },

    'act1-what-remains':{
      zone:'box',
      icon:'⌂',
      label:'hay muchas cositas que todavía siguen aquí'
    },

    'act1-whole-night':{
      zone:'garden',
      icon:'☾',
      label:'esta noche se siente completa'
    },

    'act1-sky-we-made':{
      zone:'sky',
      icon:'✦',
      label:'mira otra vez el cielo'
    },

    'act1-where-began':{
      zone:'field',
      icon:'✿',
      label:'todo empezó con algo muy pequeño'
    },

    'act1-they-grew-too':{
      zone:'cats',
      icon:'🐾',
      label:'ellos también cambiaron'
    },

    'act1-this-little-world':{
      zone:'garden',
      icon:'◇',
      label:'mira todo como una sola cosa'
    },

    'act1-tomorrow-too':{
      zone:'field',
      icon:'☀',
      label:'todavía queda mañana'
    },

    'act1-everything-kept':{
      zone:'final',
      icon:'♡',
      label:'todo está aquí'
    }
  };

  let cue=null;
  let currentCue='';
  let garden=null;
  let openedAt=Date.now();

  function json(key,fallback={}){
    try{
      const raw=localStorage.getItem(key);
      if(!raw) return fallback;

      const parsed=JSON.parse(raw);

      return (
        parsed &&
        typeof parsed==='object'
      )
        ? parsed
        : fallback;
    }catch(_){
      return fallback;
    }
  }

  function have(){
    try{
      const raw=
        localStorage.getItem(
          LETTER_KEY
        );

      const arr=
        raw
          ? JSON.parse(raw)
          : [];

      return new Set(
        Array.isArray(arr)
          ? arr
          : []
      );
    }catch(_){
      return new Set();
    }
  }

  function count(ids){
    const h=have();

    return ids.filter(
      id=>h.has(id)
    ).length;
  }

  function missing(id){
    return !have().has(id);
  }

  function unlocked(){
    return Boolean(
      count(STAY_IDS)>=6 ||
      have().has(
        'act1-meaning-stay'
      )
    );
  }

  function isGardenOpen(){
    garden=
      garden ||
      document.getElementById(
        'catGarden'
      );

    return Boolean(
      garden &&
      garden.classList.contains(
        'show'
      )
    );
  }

  function familyReady(){
    const f={
      grayArrived:false,
      orangeArrived:false,
      ...json(FAMILY_KEY,{})
    };

    return Boolean(
      f.grayArrived &&
      f.orangeArrived
    );
  }

  function busy(){
    return Boolean(
      document.body.classList.contains(
        'intro-active'
      ) ||
      document.body.classList.contains(
        'basket2-open'
      ) ||
      document.body.classList.contains(
        'refuge-arrival-event-open'
      ) ||
      document.body.classList.contains(
        'act1-adventure-open'
      ) ||
      document.body.classList.contains(
        'act1-growth-open'
      ) ||
      document.body.classList.contains(
        'act1-cinematic-open'
      ) ||
      document.body.classList.contains(
        'act1-constellation-open'
      ) ||
      document.getElementById(
        'letterReader'
      )?.classList.contains(
        'show'
      ) ||
      document.getElementById(
        'basket2Reader'
      )?.classList.contains(
        'show'
      ) ||
      document.getElementById(
        'gameOverlay'
      )?.classList.contains(
        'show'
      )
    );
  }

  function ensureCue(){
    if(cue) return;

    cue=
      document.createElement(
        'button'
      );

    cue.id=
      'act1LastWarmCue';

    cue.type='button';

    cue.innerHTML=`
      <span
        id="act1LastWarmIcon"
      >
        ♡
      </span>

      <small
        id="act1LastWarmText"
      ></small>
    `;

    document.body.appendChild(
      cue
    );

    cue.addEventListener(
      'click',
      ()=>{
        if(!currentCue) return;

        const id=currentCue;

        hideCue();

        openedAt=Date.now();

        window
          .ParadoxAct1Cinematics
          ?.play
          ?.(id);
      }
    );
  }

  function showCue(id){
    ensureCue();

    const meta=
      META[id];

    if(!meta) return;

    currentCue=id;

    cue.dataset.zone=
      meta.zone;

    document
      .getElementById(
        'act1LastWarmIcon'
      )
      .textContent=
        meta.icon;

    document
      .getElementById(
        'act1LastWarmText'
      )
      .textContent=
        meta.label;

    cue.classList.add(
      'show'
    );
  }

  function hideCue(){
    ensureCue();

    cue.classList.remove(
      'show'
    );

    currentCue='';
  }

  function next(){
    if(
      !unlocked() ||
      busy()
    ){
      return '';
    }

    const h=have();
    const life=json(LIFE_KEY,{});
    const habits=json(HABITS_KEY,{});
    const warmCount=count(FIRST_NINE);

    /*
      90 — empieza al volver al Claro.
    */
    if(
      missing(
        'act1-again-from-start'
      ) &&
      isGardenOpen()
    ){
      return 'act1-again-from-start';
    }

    if(
      !h.has(
        'act1-again-from-start'
      )
    ){
      return '';
    }

    /*
      91 — volver a caminar por el campo.
    */
    if(
      missing(
        'act1-what-changed'
      ) &&
      !isGardenOpen()
    ){
      return 'act1-what-changed';
    }

    /*
      92 — mirar lo que quedó en casa.
      No exige abrir la caja otra vez para no bloquear.
    */
    if(
      missing(
        'act1-what-remains'
      ) &&
      isGardenOpen() &&
      warmCount>=1
    ){
      return 'act1-what-remains';
    }

    /*
      93 — una noche completa.
      Unos segundos tranquilos bastan; no hay misión.
    */
    if(
      missing(
        'act1-whole-night'
      ) &&
      isGardenOpen() &&
      warmCount>=2 &&
      Date.now()-openedAt>=12000
    ){
      return 'act1-whole-night';
    }

    /*
      94 — cielo.
      Si hizo constelación, la escena cobra más significado,
      pero NO se exige para desbloquearla.
    */
    if(
      missing(
        'act1-sky-we-made'
      ) &&
      !isGardenOpen() &&
      warmCount>=3
    ){
      return 'act1-sky-we-made';
    }

    /*
      95 — volver al inicio.
      El tulipán especial mejora el contexto, pero tampoco
      se vuelve requisito duro.
    */
    if(
      missing(
        'act1-where-began'
      ) &&
      !isGardenOpen() &&
      warmCount>=3
    ){
      return 'act1-where-began';
    }

    /*
      96 — ellos también crecieron.
    */
    if(
      missing(
        'act1-they-grew-too'
      ) &&
      isGardenOpen() &&
      familyReady() &&
      warmCount>=4
    ){
      return 'act1-they-grew-too';
    }

    /*
      97 — mirar el mundo como uno solo.
    */
    if(
      missing(
        'act1-this-little-world'
      ) &&
      isGardenOpen() &&
      warmCount>=5
    ){
      return 'act1-this-little-world';
    }

    /*
      98 — mañana también.
    */
    if(
      missing(
        'act1-tomorrow-too'
      ) &&
      !isGardenOpen() &&
      warmCount>=6
    ){
      return 'act1-tomorrow-too';
    }

    /*
      99 — final cálido del Acto I.
      Solo necesita 7 de 90–98.
      Nada de clima o azar puede bloquearlo.
    */
    if(
      missing(
        'act1-everything-kept'
      ) &&
      isGardenOpen() &&
      warmCount>=7
    ){
      return 'act1-everything-kept';
    }

    return '';
  }

  function tick(){
    if(
      !unlocked() ||
      busy()
    ){
      hideCue();
      return;
    }

    const id=next();

    if(id){
      showCue(id);
    }else{
      hideCue();
    }
  }

  function resetClock(){
    openedAt=Date.now();
  }

  function init(){
    ensureCue();

    garden=
      document.getElementById(
        'catGarden'
      );

    window.addEventListener(
      'paradox-cat-garden-open',
      ()=>{
        resetClock();

        setTimeout(
          tick,
          1100
        );
      }
    );

    window.addEventListener(
      'paradox-cat-garden-close',
      ()=>{
        resetClock();

        setTimeout(
          tick,
          750
        );
      }
    );

    window.addEventListener(
      'paradox-letter-collected',
      event=>{
        resetClock();

        if(
          event?.detail?.id===
          'act1-everything-kept'
        ){
          document.body.classList.add(
            'act1-warm-complete'
          );

          setTimeout(
            ()=>{
              document.body.classList.remove(
                'act1-warm-complete'
              );
            },
            7000
          );
        }

        setTimeout(
          tick,
          850
        );
      }
    );

    setInterval(
      tick,
      1600
    );

    setTimeout(
      tick,
      1800
    );
  }

  const boot=setInterval(
    ()=>{
      if(
        window
          .ParadoxAct1Cinematics &&
        document.getElementById(
          'catGarden'
        )
      ){
        clearInterval(
          boot
        );

        init();
      }
    },
    350
  );

  window.ParadoxAct1LastWarm={
    cards:[
      ...WARM_IDS
    ],
    next,
    refresh:tick
  };

})();
