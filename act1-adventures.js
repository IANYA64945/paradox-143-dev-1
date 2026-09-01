/* =========================================================
   PARADOX143 — ACTO I · ETAPA 2
   "PEQUEÑAS AVENTURAS"

   Cartas 56–67.

   Las cartas son consecuencia de aventuras cortas:
   buscar, seguir, cuidar, elegir, encontrar y construir.
========================================================= */

(() => {
  'use strict';

  const KEY='paradox143_act1_adventures_v1';
  const LETTER_KEY='paradox143_letters_v1';
  const FAMILY_KEY='paradox143_refuge_family_v1';

  const STAGE1_IDS=[
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
    'act1-three-sleep',
    'act1-little-world'
  ];

  const IDS=[
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
    'act1-our-charm',
    'act1-little-adventures'
  ];

  const FIRST_ELEVEN=IDS.slice(0,11);

  const DEFAULT={
    installedAt:Date.now(),

    treasureDone:false,
    marieGuideDone:false,
    mewoAwakeDone:false,
    starHomeDone:false,
    yarnDone:false,
    rainRescueDone:false,
    tallTulipsDone:false,
    midnightFlowerDone:false,
    twoPathsDone:false,
    picnicDone:false,
    charmDone:false,
    finaleDone:false,

    charm:null,
    route:null,

    gardenVisits:0,
    fieldTravel:0,
    lastWorldX:null,
    starsHold:0,

    lastAdventureAt:0,
    ambientCount:0
  };

  let layer=null;
  let garden=null;
  let active=null;

  let scheduler=0;
  let fieldTimer=0;
  let weatherTimer=0;
  let ambientTimer=0;
  let lastWeather='';
  let starSeconds=0;

  function readJSON(key,fallback){
    try{
      const raw=localStorage.getItem(key);
      if(!raw) return fallback;

      const parsed=JSON.parse(raw);

      return parsed && typeof parsed==='object'
        ? parsed
        : fallback;

    }catch(_){
      return fallback;
    }
  }

  function writeJSON(key,value){
    try{
      localStorage.setItem(
        key,
        JSON.stringify(value)
      );
    }catch(_){}
  }

  function state(){
    return {
      ...DEFAULT,
      ...readJSON(KEY,{})
    };
  }

  function save(patch={}){
    const next={
      ...state(),
      ...patch
    };

    writeJSON(KEY,next);

    refreshCharm();

    return next;
  }

  function collected(){
    try{
      const raw=localStorage.getItem(
        LETTER_KEY
      );

      const arr=raw
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

  function family(){
    return {
      grayArrived:false,
      orangeArrived:false,
      ...readJSON(
        FAMILY_KEY,
        {}
      )
    };
  }

  function catsReady(){
    const f=family();

    return Boolean(
      f.grayArrived &&
      f.orangeArrived
    );
  }

  function stage1Count(){
    const have=collected();

    return STAGE1_IDS.filter(
      id=>have.has(id)
    ).length;
  }

  function unlocked(){
    /*
      No obliga a terminar las 12 cartas anteriores.
      Con 5 momentos ya empiezan a aparecer aventuras.
    */
    return stage1Count()>=5;
  }

  function readWorldX(){
    try{
      return Number(worldX)||0;
    }catch(_){
      return 0;
    }
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

  function busy(){
    return Boolean(
      active ||
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
        'act1-planting'
      ) ||
      document.body.classList.contains(
        'act1-cinematic-open'
      ) ||
      document.body.classList.contains(
        'act1-growth-open'
      ) ||
      document.getElementById(
        'gameOverlay'
      )?.classList.contains(
        'show'
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
        'catCraftOverlay'
      )?.classList.contains(
        'show'
      ) ||
      document.getElementById(
        'act1Montage'
      )?.classList.contains(
        'show'
      ) ||
      document.getElementById(
        'act1ChoiceScene'
      )?.classList.contains(
        'show'
      )
    );
  }

  function safeGarden(){
    return Boolean(
      unlocked() &&
      isGardenOpen() &&
      catsReady() &&
      !busy() &&
      !window
        .ParadoxRefugeArrivalEvents
        ?.isRunning?.()
    );
  }

  function safeField(){
    return Boolean(
      unlocked() &&
      !isGardenOpen() &&
      !busy()
    );
  }

  function earn(id,{quiet=false}={}){
    if(
      !IDS.includes(id)
    ){
      return;
    }

    if(
      collected().has(id)
    ){
      return;
    }

    if(
      window.ParadoxAct1Life?.earn
    ){
      window.ParadoxAct1Life.earn(
        id,
        {quiet}
      );

      return;
    }

    /*
      Fallback únicamente si la etapa 1 no cargó.
    */
    try{
      const have=[...collected()];

      if(!have.includes(id)){
        have.push(id);
      }

      localStorage.setItem(
        LETTER_KEY,
        JSON.stringify(have)
      );

      window.dispatchEvent(
        new CustomEvent(
          'paradox-letter-collected',
          {
            detail:{id}
          }
        )
      );
    }catch(_){}
  }

  function whisper(text,duration=2900){
    const el=
      document.getElementById(
        'act1AdventureWhisper'
      );

    if(!el) return;

    el.textContent=text;

    el.classList.remove('show');
    void el.offsetWidth;
    el.classList.add('show');

    clearTimeout(
      Number(
        el.dataset.timer||0
      )
    );

    const timer=setTimeout(
      ()=>{
        el.classList.remove(
          'show'
        );
      },
      duration
    );

    el.dataset.timer=
      String(timer);
  }

  function begin(name){
    if(
      active ||
      busy()
    ){
      return false;
    }

    active=name;

    document.body.classList.add(
      'act1-adventure-open'
    );

    save({
      lastAdventureAt:
        Date.now()
    });

    return true;
  }

  function end(){
    active=null;

    document.body.classList.remove(
      'act1-adventure-open'
    );

    document
      .querySelectorAll(
        '.act1AdventureTemporary'
      )
      .forEach(
        el=>el.remove()
      );

    garden?.classList.remove(
      'act1Adv-guide',
      'act1Adv-mewo',
      'act1Adv-picnic',
      'act1Adv-route-marie',
      'act1Adv-route-tuluz'
    );

    scheduleNext();
  }

  function ensureDOM(){
    if(layer) return;

    layer=
      document.createElement(
        'div'
      );

    layer.id=
      'act1AdventureLayer';

    layer.innerHTML=`
      <div
        id="act1AdventureWhisper"
        aria-live="polite"
      ></div>

      <div
        id="act1AdventureGarden"
      ></div>

      <div
        id="act1AdventureField"
      ></div>

      <div
        id="act1AdventureChoice"
        aria-hidden="true"
      ></div>

      <div
        id="act1AdventureCinema"
        aria-hidden="true"
      >
        <div class="act1AdvCinemaStars">
          <span>✦</span>
          <span>♡</span>
          <span>✿</span>
          <span>☾</span>
        </div>

        <div class="act1AdvCinemaCard">
          <span id="act1AdvCinemaIcon">✦</span>
          <p id="act1AdvCinemaText"></p>
        </div>

        <button
          id="act1AdvCinemaClose"
          type="button"
        >
          volver al campo ♡
        </button>
      </div>
    `;

    document.body.appendChild(
      layer
    );

    document
      .getElementById(
        'act1AdvCinemaClose'
      )
      ?.addEventListener(
        'click',
        ()=>{
          document
            .getElementById(
              'act1AdventureCinema'
            )
            ?.classList.remove(
              'show'
            );

          end();
        }
      );

    refreshCharm();
  }

  /* =====================================================
     56 — TESORITO DE TULUZ
  ===================================================== */

  const TREASURE_SPOTS=[
    [71,58],
    [55,43],
    [31,59],
    [24,37],
    [64,65]
  ];

  function treasure(){
    const st=state();

    if(
      st.treasureDone ||
      !safeGarden() ||
      !begin('treasure')
    ){
      return false;
    }

    const holder=
      document.getElementById(
        'act1AdventureGarden'
      );

    const node=
      document.createElement(
        'button'
      );

    node.type='button';
    node.className=
      'act1AdvTreasure act1AdventureTemporary';

    node.innerHTML=`
      <img
        src="toy_yarn.png"
        alt=""
      >
      <span>✦</span>
    `;

    holder.appendChild(
      node
    );

    let step=0;

    const place=()=>{
      const spot=
        TREASURE_SPOTS[
          step%
          TREASURE_SPOTS.length
        ];

      node.style.left=
        `${spot[0]}%`;

      node.style.top=
        `${spot[1]}%`;

      node.classList.remove(
        'move'
      );

      void node.offsetWidth;

      node.classList.add(
        'move'
      );
    };

    place();

    whisper(
      'Tuluz parece buscar algo que escondió por aquí...',
      3400
    );

    node.addEventListener(
      'click',
      ()=>{
        step++;

        if(step<4){
          place();

          whisper(
            step===1
              ? 'no... aquí tampoco >w<'
              : step===2
                ? 'una pista más...'
                : 'creo que ya casi lo encontramos',
            1900
          );

          return;
        }

        node.classList.add(
          'found'
        );

        save({
          treasureDone:true
        });

        earn(
          'act1-tuluz-treasure'
        );

        whisper(
          '¡era esto! Tuluz parece bastante orgulloso >w<',
          3200
        );

        setTimeout(
          end,
          1100
        );
      }
    );

    return true;
  }

  /* =====================================================
     57 — MARIE SABÍA EL CAMINO
  ===================================================== */

  const MARIE_ROUTE=[
    [29,59],
    [39,47],
    [31,34],
    [22,31],
    [27,43]
  ];

  function marieGuide(){
    const st=state();

    if(
      st.marieGuideDone ||
      !safeGarden() ||
      !begin('marieGuide')
    ){
      return false;
    }

    const marie=
      document.getElementById(
        'refugeGrayCat'
      );

    if(!marie){
      end();
      return false;
    }

    garden.classList.add(
      'act1Adv-guide'
    );

    let step=0;

    whisper(
      'Marie quiere enseñarte algo... tócala para seguirla ♡',
      3600
    );

    const move=()=>{
      const spot=
        MARIE_ROUTE[
          step%
          MARIE_ROUTE.length
        ];

      marie.style.left=
        `${spot[0]}%`;

      marie.style.bottom=
        `${100-spot[1]}%`;

      marie.classList.remove(
        'act1Adv-MarieStep'
      );

      void marie.offsetWidth;

      marie.classList.add(
        'act1Adv-MarieStep'
      );
    };

    const click=()=>{
      step++;

      if(step<MARIE_ROUTE.length){
        move();

        whisper(
          step===2
            ? 'sigue caminando despacito...'
            : 'por aquí ♡',
          1800
        );

        return;
      }

      marie.removeEventListener(
        'click',
        click,
        true
      );

      marie.style.left='';
      marie.style.bottom='';

      const corner=
        document.createElement(
          'div'
        );

      corner.className=
        'act1AdvHiddenCorner act1AdventureTemporary';

      corner.innerHTML=`
        <span>✦</span>
        <small>
          un rinconcito que Marie ya conocía
        </small>
      `;

      document
        .getElementById(
          'act1AdventureGarden'
        )
        ?.appendChild(
          corner
        );

      save({
        marieGuideDone:true
      });

      earn(
        'act1-marie-guide'
      );

      setTimeout(
        end,
        3600
      );
    };

    marie.addEventListener(
      'click',
      click,
      true
    );

    move();

    setTimeout(
      ()=>{
        if(active==='marieGuide'){
          marie.removeEventListener(
            'click',
            click,
            true
          );

          marie.style.left='';
          marie.style.bottom='';

          end();
        }
      },
      50000
    );

    return true;
  }

  /* =====================================================
     58 — MEWO NO QUIERE MIMIR
  ===================================================== */

  function mewoAwake(){
    const st=state();

    if(
      st.mewoAwakeDone ||
      !safeGarden() ||
      !begin('mewoAwake')
    ){
      return false;
    }

    const mewo=
      document.getElementById(
        'catGardenMewoSpot'
      );

    if(
      !mewo ||
      !mewo.classList.contains(
        'show'
      )
    ){
      end();
      return false;
    }

    garden.classList.add(
      'act1Adv-mewo'
    );

    const holder=
      document.getElementById(
        'act1AdventureGarden'
      );

    const panel=
      document.createElement(
        'div'
      );

    panel.className=
      'act1AdvMewoPanel act1AdventureTemporary';

    panel.innerHTML=`
      <p>
        Mewo no parece querer mimir...
      </p>

      <div>
        <button
          type="button"
          data-action="pet"
        >
          ♡ mimitos
        </button>

        <button
          type="button"
          data-action="food"
        >
          ◇ comidita
        </button>

        <button
          type="button"
          data-action="stay"
        >
          ☾ quedarnos
        </button>
      </div>
    `;

    holder.appendChild(
      panel
    );

    let actions=0;
    const used=new Set();

    const symbol=
      document.createElement(
        'span'
      );

    symbol.className=
      'act1AdvMewoSymbol act1AdventureTemporary';

    holder.appendChild(
      symbol
    );

    panel
      .querySelectorAll(
        'button'
      )
      .forEach(
        button=>{
          button.addEventListener(
            'click',
            ()=>{
              const action=
                button.dataset.action;

              actions++;
              used.add(action);

              symbol.textContent=
                action==='pet'
                  ? '♡'
                  : action==='food'
                    ? '◇'
                    : '☾';

              symbol.classList.remove(
                'show'
              );

              void symbol.offsetWidth;

              symbol.classList.add(
                'show'
              );

              whisper(
                action==='pet'
                  ? 'un poquito de mimitos ♡'
                  : action==='food'
                    ? 'solo una comidita más...'
                    : 'entonces nos quedamos despiertos contigo ☾',
                1900
              );

              if(
                actions<3 ||
                used.size<2
              ){
                return;
              }

              panel.classList.add(
                'done'
              );

              symbol.textContent='zZ';

              save({
                mewoAwakeDone:true
              });

              earn(
                'act1-mewo-awake'
              );

              whisper(
                'ahora sí... parece que por fin va a mimir ♡',
                3100
              );

              setTimeout(
                end,
                2600
              );
            }
          );
        }
      );

    return true;
  }

  /* =====================================================
     59 — DEVOLVER UNA ESTRELLA AL CIELO
  ===================================================== */

  const STAR_PATH=[
    [18,67],
    [31,55],
    [45,61],
    [59,49],
    [72,40]
  ];

  function starHome(){
    const st=state();

    if(
      st.starHomeDone ||
      !safeField() ||
      !begin('starHome')
    ){
      return false;
    }

    const holder=
      document.getElementById(
        'act1AdventureField'
      );

    let index=0;
    let spark=null;

    whisper(
      'una estrellita parece buscar el camino de regreso...',
      3400
    );

    const next=()=>{
      spark?.remove();

      if(index>=STAR_PATH.length){
        const star=
          document.createElement(
            'button'
          );

        star.type='button';

        star.className=
          'act1AdvReturnStar act1AdventureTemporary';

        star.textContent='✦';

        holder.appendChild(
          star
        );

        whisper(
          'un empujoncito más ✦',
          2300
        );

        star.addEventListener(
          'click',
          ()=>{
            star.classList.add(
              'home'
            );

            save({
              starHomeDone:true
            });

            earn(
              'act1-star-home'
            );

            setTimeout(
              end,
              1600
            );
          },
          {once:true}
        );

        return;
      }

      const spot=
        STAR_PATH[index];

      spark=
        document.createElement(
          'button'
        );

      spark.type='button';

      spark.className=
        'act1AdvStarStep act1AdventureTemporary';

      spark.textContent='✦';

      spark.style.left=
        `${spot[0]}%`;

      spark.style.top=
        `${spot[1]}%`;

      holder.appendChild(
        spark
      );

      spark.addEventListener(
        'click',
        ()=>{
          index++;
          next();
        },
        {once:true}
      );
    };

    next();

    return true;
  }

  /* =====================================================
     60 — EL OVILLO IMPOSIBLE
  ===================================================== */

  const YARN_POINTS=[
    [17,61],
    [31,51],
    [45,63],
    [58,45],
    [73,56],
    [62,69]
  ];

  function yarnTrail(){
    const st=state();

    if(
      st.yarnDone ||
      !safeGarden() ||
      !begin('yarnTrail')
    ){
      return false;
    }

    const holder=
      document.getElementById(
        'act1AdventureGarden'
      );

    const game=
      document.createElement(
        'div'
      );

    game.className=
      'act1AdvYarnGame act1AdventureTemporary';

    const svgNS=
      'http://www.w3.org/2000/svg';

    const svg=
      document.createElementNS(
        svgNS,
        'svg'
      );

    svg.setAttribute(
      'viewBox',
      '0 0 100 100'
    );

    const path=
      document.createElementNS(
        svgNS,
        'polyline'
      );

    path.setAttribute(
      'points',
      YARN_POINTS
        .map(
          point=>
            `${point[0]},${point[1]}`
        )
        .join(' ')
    );

    svg.appendChild(
      path
    );

    game.appendChild(
      svg
    );

    const yarn=
      document.createElement(
        'img'
      );

    yarn.src='toy_yarn.png';

    yarn.className=
      'act1AdvYarnBall';

    game.appendChild(
      yarn
    );

    holder.appendChild(
      game
    );

    let index=0;

    whisper(
      'Tuluz convirtió el ovillo en un camino entero >w<',
      3400
    );

    const makePoint=()=>{
      if(index>=YARN_POINTS.length){
        yarn.classList.add(
          'done'
        );

        save({
          yarnDone:true
        });

        earn(
          'act1-yarn-trail'
        );

        setTimeout(
          end,
          1800
        );

        return;
      }

      const point=
        YARN_POINTS[index];

      const button=
        document.createElement(
          'button'
        );

      button.type='button';

      button.className=
        'act1AdvYarnPoint';

      button.style.left=
        `${point[0]}%`;

      button.style.top=
        `${point[1]}%`;

      button.textContent=
        index===
        YARN_POINTS.length-1
          ? '♡'
          : '·';

      game.appendChild(
        button
      );

      button.addEventListener(
        'click',
        ()=>{
          button.classList.add(
            'done'
          );

          index++;

          setTimeout(
            makePoint,
            180
          );
        },
        {once:true}
      );
    };

    makePoint();

    return true;
  }

  /* =====================================================
     61 — RESCATE BAJO LA LLUVIA
  ===================================================== */

  function rainRescue(){
    const st=state();

    if(
      st.rainRescueDone ||
      !safeGarden() ||
      ![
        'rain',
        'storm'
      ].includes(
        window.MAGIC_AMBIENT_ACTIVE
      ) ||
      !begin('rainRescue')
    ){
      return false;
    }

    const holder=
      document.getElementById(
        'act1AdventureGarden'
      );

    const items=[
      [
        'toy_ball.png',
        11,
        65
      ],
      [
        'toy_fish.png',
        82,
        58
      ],
      [
        'toy_yarn.png',
        74,
        72
      ]
    ];

    let savedCount=0;
    let finished=false;

    whisper(
      '¡quedaron tres cositas afuera!',
      3200
    );

    items.forEach(
      ([src,left,top],i)=>{
        const item=
          document.createElement(
            'button'
          );

        item.type='button';

        item.className=
          'act1AdvRainItem act1AdventureTemporary';

        item.style.left=
          `${left}%`;

        item.style.top=
          `${top}%`;

        item.innerHTML=`
          <img
            src="${src}"
            alt=""
          >
        `;

        holder.appendChild(
          item
        );

        item.addEventListener(
          'click',
          ()=>{
            if(
              item.classList.contains(
                'saved'
              )
            ){
              return;
            }

            item.classList.add(
              'saved'
            );

            savedCount++;

            if(savedCount>=3){
              finish(
                true
              );
            }
          }
        );
      }
    );

    const finish=fast=>{
      if(finished) return;
      finished=true;

      document
        .querySelectorAll(
          '.act1AdvRainItem'
        )
        .forEach(
          item=>
            item.classList.add(
              'saved'
            )
        );

      save({
        rainRescueDone:true
      });

      earn(
        'act1-rain-rescue'
      );

      whisper(
        fast
          ? '¡todo adentro! justo a tiempo ♡'
          : 'nos mojamos un poquito... pero al final guardamos todo ♡',
        3400
      );

      setTimeout(
        end,
        1700
      );
    };

    /*
      No existe fracaso:
      si tarda, la escena termina diferente.
    */
    setTimeout(
      ()=>{
        if(
          active==='rainRescue'
        ){
          finish(false);
        }
      },
      18000
    );

    return true;
  }

  /* =====================================================
     62 — TULIPANES ALTOS
  ===================================================== */

  function tallTulips(){
    const st=state();

    if(
      st.tallTulipsDone ||
      !safeField() ||
      !begin('tallTulips')
    ){
      return false;
    }

    const holder=
      document.getElementById(
        'act1AdventureField'
      );

    const zone=
      document.createElement(
        'div'
      );

    zone.className=
      'act1AdvTallZone act1AdventureTemporary';

    let touched=0;

    for(let i=0;i<8;i++){
      const tulip=
        document.createElement(
          'button'
        );

      tulip.type='button';

      tulip.className=
        'act1AdvTallTulip';

      tulip.style.left=
        `${7+i*12}%`;

      tulip.style.setProperty(
        '--height',
        `${78+Math.random()*55}px`
      );

      tulip.style.setProperty(
        '--delay',
        `${Math.random()*1.8}s`
      );

      zone.appendChild(
        tulip
      );

      tulip.addEventListener(
        'click',
        ()=>{
          if(
            tulip.classList.contains(
              'awake'
            )
          ){
            return;
          }

          tulip.classList.add(
            'awake'
          );

          touched++;

          if(touched>=5){
            save({
              tallTulipsDone:true
            });

            earn(
              'act1-tall-tulips'
            );

            whisper(
              'parece que querian alcanzar el cielo ♡',
              3200
            );

            setTimeout(
              end,
              1800
            );
          }
        }
      );
    }

    holder.appendChild(
      zone
    );

    whisper(
      'aquí los tulipanes crecieron un poquito más altos...',
      3400
    );

    return true;
  }

  /* =====================================================
     63 — FLOR DE MEDIANOCHE
  ===================================================== */

  function midnightFlower(){
    const st=state();

    if(
      st.midnightFlowerDone ||
      !safeField() ||
      window.MAGIC_AMBIENT_ACTIVE!=='stars' ||
      !begin('midnightFlower')
    ){
      return false;
    }

    const holder=
      document.getElementById(
        'act1AdventureField'
      );

    const flower=
      document.createElement(
        'button'
      );

    flower.type='button';

    flower.className=
      'act1AdvMidnightFlower act1AdventureTemporary';

    flower.innerHTML=`
      <span></span>
      <span></span>
      <span></span>
      <i>✦</i>
    `;

    holder.appendChild(
      flower
    );

    let taps=0;

    whisper(
      'esa flor no estaba abierta antes...',
      3300
    );

    flower.addEventListener(
      'click',
      ()=>{
        taps++;

        flower.classList.add(
          `open-${Math.min(taps,3)}`
        );

        if(taps<3){
          return;
        }

        save({
          midnightFlowerDone:true
        });

        earn(
          'act1-midnight-flower'
        );

        whisper(
          'guardó un poquito de luz de las estrellas ✦',
          3300
        );

        setTimeout(
          end,
          2200
        );
      }
    );

    return true;
  }

  /* =====================================================
     64 — DOS CAMINOS
  ===================================================== */

  function twoPaths(){
    const st=state();

    if(
      st.twoPathsDone ||
      !safeGarden() ||
      !begin('twoPaths')
    ){
      return false;
    }

    const overlay=
      document.getElementById(
        'act1AdventureChoice'
      );

    overlay.innerHTML=`
      <section>
        <span>🐾</span>

        <p>
          Marie se fue por un lado
          y Tuluz por el otro...
        </p>

        <div>
          <button
            type="button"
            data-route="marie"
          >
            seguir a Marie ♡
          </button>

          <button
            type="button"
            data-route="tuluz"
          >
            seguir a Tuluz ✦
          </button>
        </div>
      </section>
    `;

    overlay.classList.add(
      'show'
    );

    overlay.setAttribute(
      'aria-hidden',
      'false'
    );

    overlay
      .querySelectorAll(
        '[data-route]'
      )
      .forEach(
        button=>{
          button.addEventListener(
            'click',
            ()=>{
              const route=
                button.dataset.route;

              overlay.classList.remove(
                'show'
              );

              garden.classList.add(
                route==='marie'
                  ? 'act1Adv-route-marie'
                  : 'act1Adv-route-tuluz'
              );

              save({
                twoPathsDone:true,
                route
              });

              whisper(
                route==='marie'
                  ? 'Marie encontró un lugar tranquilo bajo las hojas ♡'
                  : 'Tuluz encontró otra excusa para correr detrás de una luz >w<',
                3600
              );

              earn(
                'act1-two-paths'
              );

              setTimeout(
                end,
                4300
              );
            }
          );
        }
      );

    return true;
  }

  /* =====================================================
     65 — PICNIC PARA TRES
  ===================================================== */

  function picnic(){
    const st=state();

    if(
      st.picnicDone ||
      !safeGarden() ||
      !begin('picnic')
    ){
      return false;
    }

    const holder=
      document.getElementById(
        'act1AdventureGarden'
      );

    const picnic=
      document.createElement(
        'div'
      );

    picnic.className=
      'act1AdvPicnic act1AdventureTemporary';

    picnic.innerHTML=`
      <div class="act1AdvPicnicBlanket">
        <div class="act1AdvPicnicSlots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      <div class="act1AdvPicnicTray">
        <button
          type="button"
          data-item="food"
        >
          <img
            src="food_bowl.png"
            alt=""
          >
        </button>

        <button
          type="button"
          data-item="ball"
        >
          <img
            src="toy_ball.png"
            alt=""
          >
        </button>

        <button
          type="button"
          data-item="fish"
        >
          <img
            src="toy_fish.png"
            alt=""
          >
        </button>
      </div>
    `;

    holder.appendChild(
      picnic
    );

    let placed=0;

    whisper(
      'podemos prepararles algo pequeño...',
      3000
    );

    picnic
      .querySelectorAll(
        '.act1AdvPicnicTray button'
      )
      .forEach(
        button=>{
          button.addEventListener(
            'click',
            ()=>{
              if(
                button.classList.contains(
                  'placed'
                )
              ){
                return;
              }

              button.classList.add(
                'placed'
              );

              const slot=
                picnic
                  .querySelectorAll(
                    '.act1AdvPicnicSlots span'
                  )[placed];

              const clone=
                button
                  .querySelector(
                    'img'
                  )
                  ?.cloneNode(
                    true
                  );

              if(clone){
                slot.appendChild(
                  clone
                );
              }

              placed++;

              if(placed<3){
                return;
              }

              garden.classList.add(
                'act1Adv-picnic'
              );

              picnic.classList.add(
                'ready'
              );

              save({
                picnicDone:true
              });

              earn(
                'act1-cat-picnic'
              );

              whisper(
                'creo que para ellos esto cuenta como una fiesta enorme ♡',
                3500
              );

              setTimeout(
                end,
                5200
              );
            }
          );
        }
      );

    return true;
  }

  /* =====================================================
     66 — DETALLE PERMANENTE DEL REFUGIO
  ===================================================== */

  function stage2DoneCount(){
    const st=state();

    return [
      st.treasureDone,
      st.marieGuideDone,
      st.mewoAwakeDone,
      st.starHomeDone,
      st.yarnDone,
      st.rainRescueDone,
      st.tallTulipsDone,
      st.midnightFlowerDone,
      st.twoPathsDone,
      st.picnicDone
    ].filter(Boolean).length;
  }

  function charm(){
    const st=state();

    if(
      st.charmDone ||
      stage2DoneCount()<6 ||
      !safeGarden() ||
      !begin('charm')
    ){
      return false;
    }

    const overlay=
      document.getElementById(
        'act1AdventureChoice'
      );

    overlay.innerHTML=`
      <section
        class="act1AdvCharmChoice"
      >
        <span>✧</span>

        <p>
          podemos dejar un detallito
          colgado en el refugio...
        </p>

        <div>
          <button
            type="button"
            data-charm="star"
          >
            <img
              src="aplique_estrella.png"
              alt=""
            >
            estrellita
          </button>

          <button
            type="button"
            data-charm="moon"
          >
            <img
              src="aplique_luna.png"
              alt=""
            >
            lunita
          </button>

          <button
            type="button"
            data-charm="paw"
          >
            <img
              src="aplique_huella.png"
              alt=""
            >
            huellita
          </button>
        </div>
      </section>
    `;

    overlay.classList.add(
      'show'
    );

    overlay.setAttribute(
      'aria-hidden',
      'false'
    );

    overlay
      .querySelectorAll(
        '[data-charm]'
      )
      .forEach(
        button=>{
          button.addEventListener(
            'click',
            ()=>{
              const selected=
                button.dataset.charm;

              overlay.classList.remove(
                'show'
              );

              save({
                charmDone:true,
                charm:selected
              });

              refreshCharm();

              earn(
                'act1-our-charm'
              );

              whisper(
                'ahí se queda ♡',
                3000
              );

              setTimeout(
                end,
                1700
              );
            }
          );
        }
      );

    return true;
  }

  function refreshCharm(){
    garden=
      garden ||
      document.getElementById(
        'catGarden'
      );

    if(!garden){
      return;
    }

    let deco=
      document.getElementById(
        'act1AdventureCharm'
      );

    const selected=
      state().charm;

    if(!selected){
      deco?.remove();
      return;
    }

    if(!deco){
      deco=
        document.createElement(
          'div'
        );

      deco.id=
        'act1AdventureCharm';

      garden.appendChild(
        deco
      );
    }

    const src={
      star:
        'aplique_estrella.png',
      moon:
        'aplique_luna.png',
      paw:
        'aplique_huella.png'
    }[selected];

    deco.innerHTML=`
      <span></span>
      <img
        src="${src}"
        alt=""
      >
    `;
  }

  /* =====================================================
     67 — PEQUEÑAS AVENTURAS · MINI CINEMÁTICA
  ===================================================== */

  function previousAdventureCards(){
    const have=collected();

    return FIRST_ELEVEN.filter(
      id=>have.has(id)
    ).length;
  }

  function finale(){
    const st=state();

    if(
      st.finaleDone ||
      previousAdventureCards()<8 ||
      busy() ||
      !begin('finale')
    ){
      return false;
    }

    const overlay=
      document.getElementById(
        'act1AdventureCinema'
      );

    const text=
      document.getElementById(
        'act1AdvCinemaText'
      );

    const icon=
      document.getElementById(
        'act1AdvCinemaIcon'
      );

    const close=
      document.getElementById(
        'act1AdvCinemaClose'
      );

    overlay.classList.add(
      'show'
    );

    overlay.setAttribute(
      'aria-hidden',
      'false'
    );

    close.classList.remove(
      'ready'
    );

    const frames=[
      [
        '🐾',
        'seguimos huellitas que no sabíamos a dónde llevaban...'
      ],
      [
        '✦',
        'devolvimos una estrellita al cielo y encontramos flores que solo despiertan de noche.'
      ],
      [
        '∞',
        'desenredamos pequeños desastres que Tuluz probablemente volverá a hacer >w<'
      ],
      [
        '♡',
        'y también aprendimos que una aventura no necesita ser enorme para convertirse en un recuerdo bonito.'
      ],
      [
        '✿',
        'mientras podamos seguir encontrando cositas nuevas juntos, este mundo todavía tiene mucho por enseñarnos ♡'
      ]
    ];

    let i=0;

    const show=()=>{
      const frame=
        frames[i];

      icon.textContent=
        frame[0];

      text.classList.remove(
        'visible'
      );

      void text.offsetWidth;

      text.textContent=
        frame[1];

      text.classList.add(
        'visible'
      );

      i++;

      if(i>=frames.length){
        setTimeout(
          ()=>{
            close.classList.add(
              'ready'
            );
          },
          2500
        );

        return;
      }

      setTimeout(
        show,
        3100
      );
    };

    save({
      finaleDone:true
    });

    earn(
      'act1-little-adventures',
      {quiet:true}
    );

    show();

    return true;
  }

  /* =====================================================
     AVENTURAS ESPONTÁNEAS
  ===================================================== */

  function chooseGardenAdventure(){
    if(
      !safeGarden()
    ){
      return false;
    }

    const st=state();

    /*
      El detalle permanente se ofrece cuando ya
      se vivieron varias aventuras.
    */
    if(
      !st.charmDone &&
      stage2DoneCount()>=6 &&
      Math.random()<.19
    ){
      return charm();
    }

    const options=[];

    if(!st.treasureDone){
      options.push(
        treasure
      );
    }

    if(!st.marieGuideDone){
      options.push(
        marieGuide
      );
    }

    if(
      !st.mewoAwakeDone &&
      document
        .getElementById(
          'catGardenMewoSpot'
        )
        ?.classList.contains(
          'show'
        )
    ){
      options.push(
        mewoAwake
      );
    }

    if(!st.yarnDone){
      options.push(
        yarnTrail
      );
    }

    if(!st.twoPathsDone){
      options.push(
        twoPaths
      );
    }

    if(!st.picnicDone){
      options.push(
        picnic
      );
    }

    const weather=
      window.MAGIC_AMBIENT_ACTIVE;

    if(
      !st.rainRescueDone &&
      [
        'rain',
        'storm'
      ].includes(weather)
    ){
      options.push(
        rainRescue,
        rainRescue
      );
    }

    if(!options.length){
      return false;
    }

    return options[
      Math.floor(
        Math.random()*
        options.length
      )
    ]?.();
  }

  function chooseFieldAdventure(){
    if(
      !safeField()
    ){
      return false;
    }

    const st=state();

    const options=[];

    if(
      !st.starHomeDone &&
      st.fieldTravel>=1600
    ){
      options.push(
        starHome
      );
    }

    if(
      !st.tallTulipsDone &&
      st.fieldTravel>=4200
    ){
      options.push(
        tallTulips
      );
    }

    if(
      !st.midnightFlowerDone &&
      window.MAGIC_AMBIENT_ACTIVE==='stars' &&
      starSeconds>=10
    ){
      options.push(
        midnightFlower,
        midnightFlower
      );
    }

    if(!options.length){
      return false;
    }

    return options[
      Math.floor(
        Math.random()*
        options.length
      )
    ]?.();
  }

  function scheduleNext(){
    clearTimeout(
      scheduler
    );

    scheduler=setTimeout(
      ()=>{
        if(
          !unlocked() ||
          busy()
        ){
          scheduleNext();
          return;
        }

        if(
          isGardenOpen()
        ){
          chooseGardenAdventure();
        }else{
          chooseFieldAdventure();
        }

        if(!active){
          scheduleNext();
        }
      },
      14000+
      Math.random()*10000
    );
  }

  /* =====================================================
     PROGRESO DE EXPLORACIÓN
  ===================================================== */

  function tickField(){
    const st=state();

    const wx=
      readWorldX();

    if(
      !isGardenOpen() &&
      unlocked()
    ){
      let travel=
        Number(
          st.fieldTravel||0
        );

      if(
        st.lastWorldX!==null &&
        Number.isFinite(
          Number(st.lastWorldX)
        )
      ){
        travel+=Math.min(
          230,
          Math.abs(
            wx-
            Number(
              st.lastWorldX
            )
          )
        );
      }

      save({
        fieldTravel:travel,
        lastWorldX:wx
      });

      if(
        !active &&
        !busy() &&
        Math.random()<.002
      ){
        chooseFieldAdventure();
      }

      if(
        !state().finaleDone &&
        previousAdventureCards()>=8
      ){
        setTimeout(
          finale,
          900
        );
      }

    }else{
      save({
        lastWorldX:wx
      });
    }
  }

  function tickWeather(){
    const weather=
      window.MAGIC_AMBIENT_ACTIVE||'';

    if(
      weather==='stars' &&
      !isGardenOpen() &&
      unlocked()
    ){
      starSeconds++;
    }else{
      starSeconds=0;
    }

    if(
      weather!==lastWeather
    ){
      lastWeather=weather;

      if(
        !active &&
        safeGarden() &&
        [
          'rain',
          'storm'
        ].includes(weather)
      ){
        setTimeout(
          ()=>{
            if(
              !active &&
              safeGarden() &&
              Math.random()<.29
            ){
              rainRescue();
            }
          },
          6500
        );
      }
    }
  }

  /* =====================================================
     MOMENTOS SIN CARTA
  ===================================================== */

  const AMBIENT=[
    'Tuluz encontró una hoja y decidió que era importantísima.',
    'Marie se quedó mirando una lucecita hasta que desapareció entre las flores.',
    'Mewo cambió de rincón y los otros dos fueron a revisar qué estaba haciendo.',
    'por un momento los tres estuvieron mirando cosas distintas y aun así parecían estar juntos.',
    'un pétalo pasó volando y Tuluz intentó atraparlo. no lo consiguió >w<',
    'Marie encontró un lugar tibio y decidió que ya no existía ninguna razón para moverse.'
  ];

  function ambient(){
    clearTimeout(
      ambientTimer
    );

    if(
      safeGarden() &&
      !active &&
      Math.random()<.34
    ){
      whisper(
        AMBIENT[
          Math.floor(
            Math.random()*
            AMBIENT.length
          )
        ],
        2800
      );

      save({
        ambientCount:
          Number(
            state().ambientCount||0
          )+1
      });
    }

    ambientTimer=setTimeout(
      ambient,
      44000+
      Math.random()*30000
    );
  }

  /* =====================================================
     ENTRADA / SALIDA DEL CLARO
  ===================================================== */

  function onGardenOpen(){
    const st=state();

    save({
      gardenVisits:
        Number(
          st.gardenVisits||0
        )+1
    });

    refreshCharm();

    if(
      unlocked()
    ){
      setTimeout(
        ()=>{
          if(
            !active &&
            safeGarden() &&
            Math.random()<.36
          ){
            chooseGardenAdventure();
          }
        },
        8000+
        Math.random()*6000
      );
    }

    if(
      !state().finaleDone &&
      previousAdventureCards()>=8
    ){
      setTimeout(
        finale,
        5000
      );
    }
  }

  function onGardenClose(){
    if(active){
      end();
    }

    refreshCharm();
  }

  /* =====================================================
     INICIO
  ===================================================== */

  function init(){
    ensureDOM();

    garden=
      document.getElementById(
        'catGarden'
      );

    refreshCharm();

    window.addEventListener(
      'paradox-cat-garden-open',
      onGardenOpen
    );

    window.addEventListener(
      'paradox-cat-garden-close',
      onGardenClose
    );

    window.addEventListener(
      'paradox-letter-collected',
      ()=>{
        setTimeout(
          ()=>{
            if(
              !state().finaleDone &&
              previousAdventureCards()>=8 &&
              !busy()
            ){
              finale();
            }
          },
          700
        );
      }
    );

    fieldTimer=setInterval(
      tickField,
      480
    );

    weatherTimer=setInterval(
      tickWeather,
      1000
    );

    ambientTimer=setTimeout(
      ambient,
      28000+
      Math.random()*18000
    );

    scheduleNext();

    if(isGardenOpen()){
      setTimeout(
        onGardenOpen,
        900
      );
    }
  }

  const boot=setInterval(
    ()=>{
      if(
        window.ParadoxLetters &&
        window.ParadoxAct1Life &&
        document.getElementById(
          'app'
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

  /* =====================================================
     API DE PRUEBA
  ===================================================== */

  window.ParadoxAct1Adventures={
    getState:state,

    cards:[
      ...IDS
    ],

    play(name){
      const map={
        treasure,
        marie:marieGuide,
        mewo:mewoAwake,
        star:starHome,
        yarn:yarnTrail,
        rain:rainRescue,
        tall:tallTulips,
        flower:midnightFlower,
        paths:twoPaths,
        picnic,
        charm,
        finale
      };

      return map[name]?.();
    },

    reset(){
      localStorage.removeItem(
        KEY
      );

      const have=
        collected();

      IDS.forEach(
        id=>have.delete(id)
      );

      try{
        localStorage.setItem(
          LETTER_KEY,
          JSON.stringify(
            [...have]
          )
        );
      }catch(_){}

      location.reload();
    }
  };

})();
