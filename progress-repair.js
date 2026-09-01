/* =========================================================
   PARADOX143 — REPARADOR DE PROGRESO

   Lee el progreso REAL ya cumplido en los módulos y corrige
   únicamente cartas que deberían estar guardadas.

   NO regala actividades no realizadas.
   NO borra progreso.
========================================================= */

(() => {
  'use strict';

  const LETTER_KEY='paradox143_letters_v1';
  const LIFE_KEY='paradox143_act1_life_v1';
  const ADV_KEY='paradox143_act1_adventures_v1';
  const GROWTH_KEY='paradox143_act1_growth_v1';

  const LIFE_MAP=[
    ['ballDone','act1-tuluz-ball'],
    ['marieTrailDone','act1-marie-trail'],
    ['firefliesDone','act1-fireflies'],
    ['afterRainDone','act1-after-rain'],
    ['saveToyDone','act1-save-toy'],
    ['fallenStarDone','act1-fallen-star'],
    ['fieldLoopDone','act1-field-loop'],
    ['plantedTulipDone','act1-our-tulip'],
    ['choiceDone','act1-choice-place'],
    ['threeSleepDone','act1-three-sleep'],
    ['littleWorldDone','act1-little-world']
  ];

  const ADV_MAP=[
    ['treasureDone','act1-tuluz-treasure'],
    ['marieGuideDone','act1-marie-guide'],
    ['mewoAwakeDone','act1-mewo-awake'],
    ['starHomeDone','act1-star-home'],
    ['yarnDone','act1-yarn-trail'],
    ['rainRescueDone','act1-rain-rescue'],
    ['tallTulipsDone','act1-tall-tulips'],
    ['midnightFlowerDone','act1-midnight-flower'],
    ['twoPathsDone','act1-two-paths'],
    ['picnicDone','act1-cat-picnic'],
    ['charmDone','act1-our-charm'],
    ['finaleDone','act1-little-adventures']
  ];

  const GROWTH_MAP=[
    ['nook','act1-new-nook'],
    ['pillow2','act1-second-pillow'],
    ['toyBox','act1-toy-box'],
    ['water','act1-water-bowl'],
    ['mariePlace','act1-marie-place'],
    ['tuluzPlace','act1-tuluz-place'],
    ['mewoPlace','act1-mewo-place'],
    ['flowers','act1-flowers-grew'],
    ['lantern','act1-home-light'],
    ['night','act1-night-home'],
    ['look','act1-look-grown'],
    ['finale','act1-here-we-live']
  ];

  const MOMENT_CORE=[
    'act1-five-minutes',
    'act1-tuluz-ball',
    'act1-marie-trail',
    'act1-fireflies',
    'act1-after-rain',
    'act1-save-toy',
    'act1-fallen-star',
    'act1-field-loop',
    'act1-our-tulip',
    'act1-choice-place',
    'act1-three-sleep'
  ];

  const ADV_CORE=[
    'act1-tuluz-treasure',
    'act1-marie-guide',
    'act1-mewo-awake',
    'act1-star-home',
    'act1-yarn-trail',
    'act1-rain-rescue',
    'act1-tall-tulips',
    'act1-midnight-flower',
    'act1-two-paths',
    'act1-cat-picnic',
    'act1-our-charm'
  ];

  const GROWTH_CORE=[
    'act1-new-nook',
    'act1-second-pillow',
    'act1-toy-box',
    'act1-water-bowl',
    'act1-marie-place',
    'act1-tuluz-place',
    'act1-mewo-place',
    'act1-flowers-grew',
    'act1-home-light',
    'act1-night-home',
    'act1-look-grown'
  ];

  function read(key){
    try{
      const raw=localStorage.getItem(key);
      return raw
        ? JSON.parse(raw)
        : {};
    }catch(_){
      return {};
    }
  }

  function letters(){
    try{
      const raw=localStorage.getItem(LETTER_KEY);
      const parsed=raw?JSON.parse(raw):[];
      return new Set(
        Array.isArray(parsed)
          ? parsed
          : []
      );
    }catch(_){
      return new Set();
    }
  }

  function writeLetters(set){
    try{
      localStorage.setItem(
        LETTER_KEY,
        JSON.stringify(
          [...set]
        )
      );
    }catch(_){}
  }

  function addFromMap(
    state,
    map,
    set,
    added
  ){
    map.forEach(
      ([flag,id])=>{
        if(
          state?.[flag] &&
          !set.has(id)
        ){
          set.add(id);
          added.push(id);
        }
      }
    );
  }

  function repair(){
    const life=read(LIFE_KEY);
    const adv=read(ADV_KEY);
    const growth=read(GROWTH_KEY);

    const set=letters();
    const added=[];

    /*
      Carta 44: la condición real es el tiempo acumulado.
    */
    if(
      Number(life.gardenMs||0)>=300000 &&
      !set.has(
        'act1-five-minutes'
      )
    ){
      set.add(
        'act1-five-minutes'
      );

      added.push(
        'act1-five-minutes'
      );
    }

    addFromMap(
      life,
      LIFE_MAP,
      set,
      added
    );

    addFromMap(
      adv,
      ADV_MAP,
      set,
      added
    );

    addFromMap(
      growth,
      GROWTH_MAP,
      set,
      added
    );

    if(added.length){
      writeLetters(set);

      /*
        Limpiamos del listado "earned" únicamente lo que
        YA quedó correctamente guardado.
      */
      try{
        const earned=
          Array.isArray(life.earned)
            ? life.earned
            : [];

        life.earned=
          earned.filter(
            id=>!set.has(id)
          );

        localStorage.setItem(
          LIFE_KEY,
          JSON.stringify(life)
        );
      }catch(_){}

      try{
        window
          .ParadoxLetters
          ?.refresh
          ?.();

        window
          .ParadoxBasket2
          ?.refresh
          ?.();
      }catch(_){}

      /*
        Avisamos después de escribir todo, para que los
        cierres 55/67/79 puedan reevaluarse.
      */
      added.forEach(
        id=>{
          try{
            window.dispatchEvent(
              new CustomEvent(
                'paradox-letter-collected',
                {
                  detail:{
                    id,
                    wasNew:true,
                    repaired:true
                  }
                }
              )
            );
          }catch(_){}
        }
      );
    }

    return added;
  }

  function count(ids){
    const set=letters();

    return ids.filter(
      id=>set.has(id)
    ).length;
  }

  function canRun(){
    return !(
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
      document.getElementById(
        'letterReader'
      )?.classList.contains(
        'show'
      )
    );
  }

  /*
    Reintenta cierres que ya deberían estar disponibles.
    No los guarda automáticamente: reproduce su propia
    cinematográfica y la persona sigue pulsando guardar.
  */
  function recoverFinales(){
    if(!canRun()){
      setTimeout(
        recoverFinales,
        2500
      );
      return;
    }

    const set=letters();

    if(
      !set.has(
        'act1-little-world'
      ) &&
      count(MOMENT_CORE)>=8
    ){
      const ok=
        window
          .ParadoxAct1Life
          ?.play
          ?.('montage');

      if(ok){
        return;
      }
    }

    if(
      !set.has(
        'act1-little-adventures'
      ) &&
      count(ADV_CORE)>=8
    ){
      const ok=
        window
          .ParadoxAct1Adventures
          ?.play
          ?.('finale');

      if(ok){
        return;
      }
    }

    if(
      !set.has(
        'act1-here-we-live'
      ) &&
      count(GROWTH_CORE)>=8
    ){
      const ok=
        window
          .ParadoxAct1Growth
          ?.play
          ?.('finale');

      if(ok){
        return;
      }
    }
  }

  function boot(){
    const added=repair();

    /*
      Segundo barrido porque algunos módulos escriben estado
      poco después de cargar.
    */
    setTimeout(
      ()=>{
        repair();
        recoverFinales();
      },
      2400
    );

    setTimeout(
      recoverFinales,
      6200
    );

    return added;
  }

  const wait=setInterval(
    ()=>{
      if(
        window.ParadoxLetters &&
        window.ParadoxAct1Life &&
        window.ParadoxAct1Adventures &&
        window.ParadoxAct1Growth
      ){
        clearInterval(wait);
        boot();
      }
    },
    350
  );

  window.ParadoxProgressRepair={
    run:repair,
    recoverFinales
  };

})();
