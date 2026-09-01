/* =========================================================
   PARADOX143 — ACTO I · ETAPA 1
   "PEQUEÑOS DÍAS"

   No convierte el juego en una lista de misiones.
   Las cartas aparecen como consecuencia de haber vivido cosas:
   - buscar
   - explorar
   - cuidar
   - elegir
   - esperar
   - encontrar
   - plantar
   - simplemente quedarse

   Cartas nuevas: 44–55
========================================================= */

(() => {
  'use strict';

  const KEY='paradox143_act1_life_v1';
  const LETTER_KEY='paradox143_letters_v1';
  const FAMILY_KEY='paradox143_refuge_family_v1';

  const NEW_IDS=[
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

  const FIRST_ELEVEN=NEW_IDS.slice(0,11);

  const DEFAULT={
    installedAt:Date.now(),

    earned:[],
    offered:{},

    gardenMs:0,
    gardenVisits:0,

    fieldTravel:0,
    lastWorldX:null,

    ballDone:false,
    marieTrailDone:false,
    firefliesDone:false,
    afterRainDone:false,
    saveToyDone:false,
    fallenStarDone:false,
    fieldLoopDone:false,
    plantedTulipDone:false,
    choiceDone:false,
    threeSleepDone:false,
    littleWorldDone:false,

    napMoments:0,

    specialTulip:null,
    choicePlace:null,

    ambientMoments:0,

    /*
      Corrección de ritmo:
      evita que el Claro entregue solo un Momento por visita.
    */
    lastGardenMomentAt:0
  };

  let garden=null;
  let layer=null;
  let memoryDrop=null;
  let activeActivity=null;

  let gardenVisitTimer=0;
  let activityTimer=0;
  let ambientTimer=0;
  let fieldTimer=0;
  let weatherTimer=0;
  let napObserver=null;
  let fiveMinuteTimer=0;
  let momentHeartbeatTimer=0;
  let directLetterTimer=0;

  let previousWeather='';
  let weatherHold=0;
  let lastTick=Date.now();

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
    refreshMemoryDrop();
    refreshSpecialTulip();
    return next;
  }

  function collected(){
    try{
      const raw=localStorage.getItem(LETTER_KEY);
      const arr=raw?JSON.parse(raw):[];
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
      ...readJSON(FAMILY_KEY,{})
    };
  }

  function catsReady(){
    const st=family();
    return Boolean(
      st.grayArrived &&
      st.orangeArrived
    );
  }

  function mewoHere(){
    return Boolean(
      document.getElementById(
        'catGardenMewoSpot'
      )?.classList.contains('show')
    );
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
      document.getElementById('catGarden');

    return Boolean(
      garden &&
      garden.classList.contains('show')
    );
  }

  function overlayBusy(){
    return Boolean(
      document.body.classList.contains('intro-active') ||
      document.body.classList.contains('basket2-open') ||
      document.body.classList.contains('refuge-arrival-event-open') ||
      document.body.classList.contains('act1-adventure-open') ||
      document.body.classList.contains('act1-growth-open') ||
      document.body.classList.contains('act1-cinematic-open') ||
      document.getElementById('gameOverlay')?.classList.contains('show') ||
      document.getElementById('letterReader')?.classList.contains('show') ||
      document.getElementById('basket2Reader')?.classList.contains('show') ||
      document.getElementById('catCraftOverlay')?.classList.contains('show') ||
      document.getElementById('act1Montage')?.classList.contains('show') ||
      document.getElementById('act1ChoiceScene')?.classList.contains('show')
    );
  }

  function safeGarden(){
    return Boolean(
      isGardenOpen() &&
      catsReady() &&
      !overlayBusy() &&
      !window.ParadoxRefugeArrivalEvents?.isRunning?.()
    );
  }

  function safeField(){
    return Boolean(
      !isGardenOpen() &&
      !overlayBusy() &&
      !document.body.classList.contains('intro-active')
    );
  }

  function showWhisper(text,duration=2600){
    ensureDOM();

    const el=
      document.getElementById('act1Whisper');

    if(!el) return;

    el.textContent=text;
    el.classList.remove('show');
    void el.offsetWidth;
    el.classList.add('show');

    clearTimeout(
      Number(el.dataset.timer||0)
    );

    const timer=setTimeout(
      ()=>el.classList.remove('show'),
      duration
    );

    el.dataset.timer=String(timer);
  }

  function earn(id,{quiet=false}={}){
    if(!id || typeof id!=='string') return false;

    const st=state();

    /*
      Si ya está realmente guardada, no hacemos nada.
    */
    if(collected().has(id)){
      return false;
    }

    /*
      CORRECCIÓN:
      antes, si una actividad quedaba marcada como "earned"
      pero la carta no alcanzaba a guardarse, esta función
      salía para siempre y ya no volvía a mostrar ni carta
      ni cinematográfica.

      Ahora "earned" NO bloquea el reintento.
    */
    if(!st.earned.includes(id)){
      const earned=[
        ...st.earned,
        id
      ];

      save({earned});
    }

    /*
      Avisamos SIEMPRE al sistema cinematográfico.
      Si no existe cinematográfica para este id, el lector
      directo se encargará después.
    */
    try{
      window.dispatchEvent(
        new CustomEvent(
          'paradox-act1-earned',
          {detail:{id}}
        )
      );
    }catch(_){}

    if(!quiet){
      showWhisper(
        'algo de este momento quiso quedarse contigo ♡',
        2200
      );
    }

    scheduleDirectLetter(
      650
    );

    return true;
  }

  function pendingEarned(){
    const have=collected();

    return state().earned.filter(
      id=>!have.has(id)
    );
  }

  function refreshMemoryDrop(){
    ensureDOM();

    /* El antiguo sobre flotante queda desactivado. */
    if(memoryDrop){
      memoryDrop.classList.remove('show');
      memoryDrop.style.display='none';
    }

    scheduleDirectLetter(
      700
    );
  }

  function scheduleDirectLetter(
    delay=700
  ){
    clearTimeout(
      directLetterTimer
    );

    directLetterTimer=setTimeout(
      presentNextMemory,
      delay
    );
  }

  function presentNextMemory(){
    const pending=
      pendingEarned();

    if(!pending.length){
      return false;
    }

    /*
      Nunca interrumpe una aventura, crecimiento, llegada,
      cinematográfica ni otra carta. Espera y vuelve a intentar.
    */
    if(
      activeActivity ||
      overlayBusy()
    ){
      scheduleDirectLetter(
        900
      );

      return false;
    }

    const st=state();
    const now=Date.now();

    /*
      Si la persona cerró una carta sin guardarla, no vuelve a
      saltar inmediatamente. Se le da un pequeño descanso.
    */
    const id=pending.find(
      cardId=>
        now-
        Number(
          st.offered?.[cardId]||0
        )>=28000
    );

    if(!id){
      scheduleDirectLetter(
        4500
      );

      return false;
    }

    const offered={
      ...(st.offered||{}),
      [id]:now
    };

    /*
      Escribimos sin pasar por save() para no generar otra
      programación recursiva del lector.
    */
    writeJSON(
      KEY,
      {
        ...st,
        offered
      }
    );

    /*
      Si esta carta tiene cinematográfica, no abrimos el
      lector encima de ella. Reintentamos la cinematográfica
      y esperamos a que esa escena la guarde.
    */
    const cineScenes=
      new Set(
        window
          .ParadoxAct1Cinematics
          ?.scenes ||
        []
      );

    if(cineScenes.has(id)){
      window
        .ParadoxAct1Cinematics
        ?.play
        ?.(id);

      scheduleDirectLetter(
        2200
      );

      return true;
    }

    window.ParadoxLetters
      ?.open
      ?.(id,true);

    return true;
  }

  function offerNextMemory(){
    return presentNextMemory();
  }

  function ensureDOM(){
    if(layer) return true;

    layer=document.createElement('div');
    layer.id='act1LifeLayer';
    layer.setAttribute('aria-hidden','false');

    layer.innerHTML=`
      <div id="act1Whisper" aria-live="polite"></div>

      <button
        id="act1MemoryDrop"
        type="button"
        aria-label="Abrir un pequeño recuerdo"
      >
        <span class="act1MemoryEnvelope">💌</span>
        <span class="act1MemorySpark">✦</span>
        <span class="act1MemoryCount"></span>
      </button>

      <div
        id="act1GardenActivityLayer"
        aria-hidden="false"
      ></div>

      <div
        id="act1FieldActivityLayer"
        aria-hidden="false"
      ></div>

      <div
        id="act1PlantPrompt"
        aria-hidden="true"
      >
        <div>
          <span>✿</span>
          <p>este rinconcito se siente bonito...</p>
          <button type="button">plantar algo aquí ♡</button>
        </div>
      </div>

      <div
        id="act1ChoiceScene"
        aria-hidden="true"
      >
        <section>
          <span class="act1ChoiceMark">♡</span>
          <p>¿dónde nos quedamos un ratito?</p>
          <div>
            <button type="button" data-place="tree">debajo del árbol</button>
            <button type="button" data-place="flowers">junto a las flores</button>
            <button type="button" data-place="cats">cerquita de ellos</button>
          </div>
        </section>
      </div>

      <div
        id="act1Montage"
        aria-hidden="true"
      >
        <div class="act1MontageSky">
          <span>✦</span>
          <span>☾</span>
          <span>✿</span>
          <span>♡</span>
        </div>

        <div class="act1MontageCenter">
          <div class="act1MontageTulip"></div>
          <div class="act1MontagePaws">
            <span>🐾</span>
            <span>🐾</span>
            <span>🐾</span>
          </div>
          <p id="act1MontageText"></p>
        </div>

        <button
          id="act1MontageClose"
          type="button"
        >
          volver ♡
        </button>
      </div>
    `;

    document.body.appendChild(layer);

    memoryDrop=
      document.getElementById(
        'act1MemoryDrop'
      );

    memoryDrop.addEventListener(
      'click',
      event=>{
        event.preventDefault();
        event.stopPropagation();
        offerNextMemory();
      }
    );

    document
      .querySelector(
        '#act1PlantPrompt button'
      )
      ?.addEventListener(
        'click',
        startPlanting
      );

    document
      .querySelectorAll(
        '#act1ChoiceScene [data-place]'
      )
      .forEach(
        button=>{
          button.addEventListener(
            'click',
            ()=>finishChoice(
              button.dataset.place
            )
          );
        }
      );

    document
      .getElementById(
        'act1MontageClose'
      )
      ?.addEventListener(
        'click',
        closeMontage
      );

    return true;
  }

  /* =====================================================
     ACTIVIDAD 44 — QUEDARSE CINCO MINUTOS EN EL CLARO
  ===================================================== */

  function tickGardenTime(){
    const now=Date.now();
    const dt=Math.min(
      1600,
      Math.max(
        0,
        now-lastTick
      )
    );

    lastTick=now;

    if(
      isGardenOpen() &&
      !overlayBusy()
    ){
      const st=state();
      const next=
        Number(st.gardenMs||0)+dt;

      save({
        gardenMs:next
      });

      if(
        next>=300000 &&
        !collected().has(
          'act1-five-minutes'
        )
      ){
        earn(
          'act1-five-minutes',
          {quiet:true}
        );

        showWhisper(
          'cinco minutitos se volvieron un ratito bastante largo ♡',
          3400
        );
      }
    }
  }

  /* =====================================================
     ACTIVIDAD 45 — TULUZ PERDIÓ SU PELOTITA
  ===================================================== */

  const BALL_SPOTS=[
    {left:16,top:58},
    {left:70,top:45},
    {left:48,top:68},
    {left:78,top:63},
    {left:29,top:42}
  ];

  function startBallQuest(){
    if(
      activeActivity ||
      state().ballDone ||
      !safeGarden()
    ){
      return false;
    }

    activeActivity='ball';

    const holder=
      document.getElementById(
        'act1GardenActivityLayer'
      );

    const ball=
      document.createElement('button');

    ball.id='act1LostBall';
    ball.type='button';
    ball.setAttribute(
      'aria-label',
      'Pelotita perdida de Tuluz'
    );

    ball.innerHTML=`
      <img src="toy_ball.png" alt="">
      <span>?</span>
    `;

    holder.appendChild(ball);

    let step=0;

    const move=()=>{
      const spot=
        BALL_SPOTS[
          (step*2+1)%BALL_SPOTS.length
        ];

      ball.style.left=
        `${spot.left}%`;

      ball.style.top=
        `${spot.top}%`;

      ball.classList.remove('hop');
      void ball.offsetWidth;
      ball.classList.add('hop');
    };

    move();

    showWhisper(
      'Tuluz estaba jugando con algo... ¿dónde lo dejó? >w<',
      3400
    );

    ball.addEventListener(
      'click',
      ()=>{
        step++;

        if(step<3){
          move();

          showWhisper(
            step===1
              ? '¡se volvió a escapar!'
              : 'casi... una vez más >w<',
            1900
          );

          return;
        }

        ball.classList.add('found');

        save({
          ballDone:true
        });

        setTimeout(
          ()=>ball.remove(),
          800
        );

        activeActivity=null;

        earn(
          'act1-tuluz-ball'
        );
      }
    );

    activityTimer=setTimeout(
      ()=>{
        if(
          activeActivity==='ball'
        ){
          ball.remove();
          activeActivity=null;
        }
      },
      45000
    );

    return true;
  }

  /* =====================================================
     ACTIVIDAD 46 — SEGUIR LAS HUELLITAS DE MARIE
  ===================================================== */

  const PAW_SPOTS=[
    {left:22,top:61},
    {left:34,top:52},
    {left:47,top:58},
    {left:39,top:41},
    {left:27,top:35}
  ];

  function startMarieTrail(){
    if(
      activeActivity ||
      state().marieTrailDone ||
      !safeGarden()
    ){
      return false;
    }

    activeActivity='marieTrail';

    const holder=
      document.getElementById(
        'act1GardenActivityLayer'
      );

    let index=0;
    let paw=null;

    showWhisper(
      'Marie dejó unas huellitas por aquí...',
      3100
    );

    const next=()=>{
      paw?.remove();

      if(index>=PAW_SPOTS.length){
        document
          .getElementById(
            'refugeGrayCat'
          )
          ?.classList.add(
            'act1-marie-found'
          );

        setTimeout(
          ()=>{
            document
              .getElementById(
                'refugeGrayCat'
              )
              ?.classList.remove(
                'act1-marie-found'
              );
          },
          4200
        );

        save({
          marieTrailDone:true
        });

        activeActivity=null;

        earn(
          'act1-marie-trail'
        );

        return;
      }

      const spot=PAW_SPOTS[index];

      paw=document.createElement('button');
      paw.type='button';
      paw.className='act1PawStep';
      paw.setAttribute(
        'aria-label',
        'Seguir huella de Marie'
      );
      paw.textContent='🐾';

      paw.style.left=
        `${spot.left}%`;

      paw.style.top=
        `${spot.top}%`;

      holder.appendChild(paw);

      paw.addEventListener(
        'click',
        ()=>{
          index++;
          next();
        },
        {once:true}
      );
    };

    next();

    activityTimer=setTimeout(
      ()=>{
        if(
          activeActivity==='marieTrail'
        ){
          paw?.remove();
          activeActivity=null;
        }
      },
      50000
    );

    return true;
  }

  /* =====================================================
     ACTIVIDAD 47 — LUCIÉRNAGAS
  ===================================================== */

  function startFireflies(){
    if(
      activeActivity ||
      state().firefliesDone ||
      !safeGarden()
    ){
      return false;
    }

    activeActivity='fireflies';

    const holder=
      document.getElementById(
        'act1GardenActivityLayer'
      );

    const wrap=
      document.createElement('div');

    wrap.id='act1FireflyGame';

    holder.appendChild(wrap);

    let caught=0;
    const needed=5;

    showWhisper(
      'unas lucecitas bajaron al Claro... ✦',
      3000
    );

    for(let i=0;i<8;i++){
      const firefly=
        document.createElement('button');

      firefly.type='button';
      firefly.className='act1Firefly';
      firefly.setAttribute(
        'aria-label',
        'Atrapar luciérnaga'
      );

      firefly.style.left=
        `${12+Math.random()*76}%`;

      firefly.style.top=
        `${20+Math.random()*54}%`;

      firefly.style.setProperty(
        '--delay',
        `${Math.random()*1.6}s`
      );

      firefly.style.setProperty(
        '--drift',
        `${-14+Math.random()*28}px`
      );

      wrap.appendChild(firefly);

      firefly.addEventListener(
        'click',
        ()=>{
          if(
            firefly.classList.contains(
              'caught'
            )
          ){
            return;
          }

          firefly.classList.add('caught');
          caught++;

          if(caught>=needed){
            save({
              firefliesDone:true
            });

            wrap.classList.add('complete');

            setTimeout(
              ()=>wrap.remove(),
              1200
            );

            activeActivity=null;

            earn(
              'act1-fireflies'
            );
          }
        }
      );
    }

    activityTimer=setTimeout(
      ()=>{
        if(
          activeActivity==='fireflies'
        ){
          wrap.remove();
          activeActivity=null;
          showWhisper(
            'las lucecitas volvieron a esconderse...',
            2100
          );
        }
      },
      24000
    );

    return true;
  }

  /* =====================================================
     ACTIVIDAD 48 — DESPUÉS DE LA LLUVIA
  ===================================================== */

  function startAfterRain(){
    if(
      activeActivity ||
      state().afterRainDone ||
      !safeGarden()
    ){
      return false;
    }

    activeActivity='afterRain';

    const holder=
      document.getElementById(
        'act1GardenActivityLayer'
      );

    const wrap=
      document.createElement('div');

    wrap.id='act1Puddles';
    holder.appendChild(wrap);

    const spots=[
      [27,69],
      [53,73],
      [72,67]
    ];

    let touched=0;

    showWhisper(
      'la lluvia paró... mira cómo quedó brillando todo ◇',
      3400
    );

    spots.forEach(
      ([left,top],index)=>{
        const puddle=
          document.createElement('button');

        puddle.type='button';
        puddle.className='act1Puddle';
        puddle.setAttribute(
          'aria-label',
          'Reflejo de lluvia'
        );

        puddle.style.left=
          `${left}%`;
        puddle.style.top=
          `${top}%`;

        puddle.innerHTML=`
          <span>✦</span>
        `;

        wrap.appendChild(puddle);

        puddle.addEventListener(
          'click',
          ()=>{
            if(
              puddle.classList.contains(
                'seen'
              )
            ){
              return;
            }

            puddle.classList.add('seen');
            touched++;

            if(touched>=3){
              save({
                afterRainDone:true
              });

              setTimeout(
                ()=>wrap.remove(),
                900
              );

              activeActivity=null;

              earn(
                'act1-after-rain'
              );
            }
          }
        );
      }
    );

    activityTimer=setTimeout(
      ()=>{
        if(
          activeActivity==='afterRain'
        ){
          wrap.remove();
          activeActivity=null;
        }
      },
      36000
    );

    return true;
  }

  /* =====================================================
     ACTIVIDAD 49 — GUARDAR UN JUGUETE DEL MAL CLIMA
  ===================================================== */

  function startSaveToy(){
    if(
      activeActivity ||
      state().saveToyDone ||
      !safeGarden()
    ){
      return false;
    }

    const weather=
      window.MAGIC_AMBIENT_ACTIVE||'';

    if(
      !['rain','storm'].includes(weather)
    ){
      return false;
    }

    activeActivity='saveToy';

    const holder=
      document.getElementById(
        'act1GardenActivityLayer'
      );

    const toy=
      document.createElement('button');

    toy.id='act1OutsideToy';
    toy.type='button';
    toy.setAttribute(
      'aria-label',
      'Guardar juguete'
    );

    toy.innerHTML=`
      <img src="toy_fish.png" alt="">
      <span>!</span>
    `;

    holder.appendChild(toy);

    showWhisper(
      '¡quedó un juguetito afuera!',
      3000
    );

    toy.addEventListener(
      'click',
      ()=>{
        toy.classList.add('rescued');

        save({
          saveToyDone:true
        });

        setTimeout(
          ()=>toy.remove(),
          1100
        );

        activeActivity=null;

        earn(
          'act1-save-toy'
        );
      },
      {once:true}
    );

    activityTimer=setTimeout(
      ()=>{
        if(
          activeActivity==='saveToy'
        ){
          toy.remove();
          activeActivity=null;
        }
      },
      30000
    );

    return true;
  }

  /* =====================================================
     ACTIVIDAD 50 — UNA ESTRELLITA EN EL CAMPO
  ===================================================== */

  function startFallenStar(){
    if(
      activeActivity ||
      state().fallenStarDone ||
      !safeField()
    ){
      return false;
    }

    activeActivity='fallenStar';

    const holder=
      document.getElementById(
        'act1FieldActivityLayer'
      );

    const star=
      document.createElement('button');

    star.id='act1FallenStar';
    star.type='button';
    star.setAttribute(
      'aria-label',
      'Estrellita caída'
    );
    star.textContent='✦';

    star.style.left=
      `${18+Math.random()*58}%`;

    star.style.top=
      `${25+Math.random()*18}%`;

    holder.appendChild(star);

    showWhisper(
      '¿eso estaba ahí hace un segundo...?',
      2800
    );

    let taps=0;

    star.addEventListener(
      'click',
      ()=>{
        taps++;

        star.classList.remove('tap');
        void star.offsetWidth;
        star.classList.add('tap');

        if(taps<3) return;

        star.classList.add('found');

        save({
          fallenStarDone:true
        });

        setTimeout(
          ()=>star.remove(),
          1000
        );

        activeActivity=null;

        earn(
          'act1-fallen-star'
        );

        maybeOfferPlanting();
      }
    );

    activityTimer=setTimeout(
      ()=>{
        if(
          activeActivity==='fallenStar'
        ){
          star.remove();
          activeActivity=null;
        }
      },
      35000
    );

    return true;
  }

  /* =====================================================
     ACTIVIDAD 51 — RECORRER EL CAMPO
  ===================================================== */

  function startFieldLoopMarker(){
    if(
      activeActivity ||
      state().fieldLoopDone ||
      !safeField()
    ){
      return false;
    }

    activeActivity='fieldLoop';

    const holder=
      document.getElementById(
        'act1FieldActivityLayer'
      );

    const marker=
      document.createElement('button');

    marker.id='act1FieldLoopMarker';
    marker.type='button';
    marker.setAttribute(
      'aria-label',
      'Pétalo conocido'
    );

    marker.innerHTML=`
      <span>♡</span>
      <small>...</small>
    `;

    holder.appendChild(marker);

    showWhisper(
      'después de caminar tanto... este rinconcito se siente conocido',
      3400
    );

    marker.addEventListener(
      'click',
      ()=>{
        marker.classList.add('found');

        save({
          fieldLoopDone:true
        });

        setTimeout(
          ()=>marker.remove(),
          900
        );

        activeActivity=null;

        earn(
          'act1-field-loop'
        );

        maybeOfferPlanting();
      },
      {once:true}
    );

    activityTimer=setTimeout(
      ()=>{
        if(
          activeActivity==='fieldLoop'
        ){
          marker.remove();
          activeActivity=null;
        }
      },
      40000
    );

    return true;
  }

  /* =====================================================
     ACTIVIDAD 52 — PLANTAR UN TULIPÁN PROPIO
  ===================================================== */

  function maybeOfferPlanting(){
    const st=state();

    if(
      st.plantedTulipDone ||
      !st.fallenStarDone ||
      !st.fieldLoopDone ||
      !safeField()
    ){
      hidePlantPrompt();
      return;
    }

    const prompt=
      document.getElementById(
        'act1PlantPrompt'
      );

    prompt?.classList.add('show');
    prompt?.setAttribute(
      'aria-hidden',
      'false'
    );
  }

  function hidePlantPrompt(){
    const prompt=
      document.getElementById(
        'act1PlantPrompt'
      );

    prompt?.classList.remove('show');
    prompt?.setAttribute(
      'aria-hidden',
      'true'
    );
  }

  function startPlanting(){
    if(
      !safeField() ||
      state().plantedTulipDone
    ){
      return;
    }

    hidePlantPrompt();

    document.body.classList.add(
      'act1-planting'
    );

    showWhisper(
      'toca un lugar entre los tulipanes ♡',
      3800
    );

    const appEl=
      document.getElementById('app');

    if(!appEl) return;

    const onPlant=event=>{
      event.preventDefault();
      event.stopPropagation();

      const rect=
        appEl.getBoundingClientRect();

      const x=Math.max(
        rect.left+48,
        Math.min(
          rect.right-48,
          event.clientX
        )
      );

      const y=Math.max(
        rect.top+rect.height*.48,
        Math.min(
          rect.top+rect.height*.82,
          event.clientY
        )
      );

      const wx=readWorldX();

      save({
        plantedTulipDone:true,
        specialTulip:{
          anchorX:
            (x-rect.left)-wx,
          yRatio:
            (y-rect.top)/rect.height,
          plantedAt:
            Date.now()
        }
      });

      document.body.classList.remove(
        'act1-planting'
      );

      refreshSpecialTulip();

      earn(
        'act1-our-tulip'
      );

      showWhisper(
        'ahí se queda ♡',
        3000
      );
    };

    appEl.addEventListener(
      'pointerup',
      onPlant,
      {
        once:true,
        capture:true
      }
    );
  }

  function refreshSpecialTulip(){
    ensureDOM();

    const fieldLayer=
      document.getElementById(
        'act1FieldActivityLayer'
      );

    if(!fieldLayer) return;

    let tulip=
      document.getElementById(
        'act1SpecialTulip'
      );

    const data=
      state().specialTulip;

    if(!data){
      tulip?.remove();
      return;
    }

    if(!tulip){
      tulip=
        document.createElement('button');

      tulip.id='act1SpecialTulip';
      tulip.type='button';
      tulip.setAttribute(
        'aria-label',
        'Nuestro tulipán'
      );

      tulip.innerHTML=`
        <span></span>
        <i>♡</i>
      `;

      tulip.addEventListener(
        'click',
        ()=>{
          showWhisper(
            'sigue aquí ♡',
            2300
          );
        }
      );

      fieldLayer.appendChild(tulip);
    }

    const appEl=
      document.getElementById('app');

    if(!appEl) return;

    const rect=
      appEl.getBoundingClientRect();

    const x=
      Number(data.anchorX||0)+
      readWorldX();

    const y=
      Math.max(
        rect.height*.48,
        Math.min(
          rect.height*.82,
          Number(data.yRatio||.68)*
          rect.height
        )
      );

    tulip.style.left=
      `${x}px`;

    tulip.style.top=
      `${y}px`;

    const visible=
      safeField() &&
      x>-90 &&
      x<rect.width+90;

    tulip.classList.toggle(
      'show',
      visible
    );
  }

  /* =====================================================
     ACTIVIDAD 53 — ELEGIR DÓNDE QUEDARSE
  ===================================================== */

  function startChoice(){
    if(
      activeActivity ||
      state().choiceDone ||
      !safeGarden()
    ){
      return false;
    }

    activeActivity='choice';

    const overlay=
      document.getElementById(
        'act1ChoiceScene'
      );

    overlay?.classList.add('show');
    overlay?.setAttribute(
      'aria-hidden',
      'false'
    );

    return true;
  }

  function finishChoice(place){
    if(activeActivity!=='choice') return;

    const overlay=
      document.getElementById(
        'act1ChoiceScene'
      );

    overlay?.classList.remove('show');
    overlay?.setAttribute(
      'aria-hidden',
      'true'
    );

    garden?.classList.remove(
      'act1-place-tree',
      'act1-place-flowers',
      'act1-place-cats'
    );

    garden?.classList.add(
      `act1-place-${place}`
    );

    const phrase={
      tree:'un ratito debajo del árbol ♡',
      flowers:'junto a las florecitas ♡',
      cats:'cerquita de los tres ♡'
    }[place]||'aquí está bien ♡';

    showWhisper(
      phrase,
      3400
    );

    save({
      choiceDone:true,
      choicePlace:place
    });

    setTimeout(
      ()=>{
        garden?.classList.remove(
          'act1-place-tree',
          'act1-place-flowers',
          'act1-place-cats'
        );
      },
      7600
    );

    activeActivity=null;

    earn(
      'act1-choice-place'
    );

    return true;
  }

  /* =====================================================
     ACTIVIDAD 54 — LOS TRES MIMIENDO
     Nace de una escena espontánea del Jardín 2.0.
  ===================================================== */

  function watchGardenNap(){
    if(!garden) return;

    napObserver?.disconnect();

    napObserver=
      new MutationObserver(
        ()=>{
          if(
            !garden.classList.contains(
              'garden2-nap'
            ) ||
            state().threeSleepDone ||
            !mewoHere()
          ){
            return;
          }

          const st=state();

          const napMoments=
            Number(st.napMoments||0)+1;

          save({napMoments});

          if(napMoments<2) return;

          save({
            threeSleepDone:true
          });

          setTimeout(
            ()=>{
              if(isGardenOpen()){
                showWhisper(
                  'shhh... esta vez se mimieron los tres ♡',
                  3600
                );
              }

              earn(
                'act1-three-sleep',
                {quiet:true}
              );
            },
            2800
          );
        }
      );

    napObserver.observe(
      garden,
      {
        attributes:true,
        attributeFilter:['class']
      }
    );
  }

  /* =====================================================
     ACTIVIDAD 55 — PEQUEÑO MONTAJE DEL ACTO I
     Aparece tras haber reunido 8 de los 11 momentos anteriores.
  ===================================================== */

  function newCardsCollectedCount(){
    const have=collected();

    return FIRST_ELEVEN.filter(
      id=>have.has(id)
    ).length;
  }

  function maybeStartMontage(){
    const st=state();

    if(
      st.littleWorldDone ||
      activeActivity ||
      overlayBusy() ||
      newCardsCollectedCount()<8
    ){
      return false;
    }

    activeActivity='montage';

    const overlay=
      document.getElementById(
        'act1Montage'
      );

    const text=
      document.getElementById(
        'act1MontageText'
      );

    if(!overlay || !text){
      activeActivity=null;
      return false;
    }

    overlay.classList.add('show');
    overlay.setAttribute(
      'aria-hidden',
      'false'
    );

    const phrases=[
      'primero solo habia tulipanes...',
      'despues llegaron pequeñas cosas que quisimos cuidar ♡',
      'una lunita, lluvias, juguetes, huellitas...',
      'y sin darnos cuenta este lugar empezó a sentirse vivido.',
      'mira todo lo que nuestro pequeño mundo ya tiene ♡'
    ];

    let i=0;

    const showPhrase=()=>{
      text.classList.remove('visible');
      void text.offsetWidth;
      text.textContent=phrases[i];
      text.classList.add('visible');
      i++;
    };

    showPhrase();

    const phraseTimer=setInterval(
      ()=>{
        if(i>=phrases.length){
          clearInterval(phraseTimer);

          document
            .getElementById(
              'act1MontageClose'
            )
            ?.classList.add(
              'ready'
            );

          return;
        }

        showPhrase();
      },
      2900
    );

    save({
      littleWorldDone:true
    });

    earn(
      'act1-little-world',
      {quiet:true}
    );

    return true;
  }

  function closeMontage(){
    const overlay=
      document.getElementById(
        'act1Montage'
      );

    overlay?.classList.remove('show');
    overlay?.setAttribute(
      'aria-hidden',
      'true'
    );

    document
      .getElementById(
        'act1MontageClose'
      )
      ?.classList.remove(
        'ready'
      );

    activeActivity=null;

    showWhisper(
      'y todavía queda mucho por vivir aquí ♡',
      3300
    );

    refreshMemoryDrop();
  }

  /* =====================================================
     ELECCIÓN NATURAL DE ACTIVIDADES DEL CLARO

     CORRECCIÓN DE RITMO:
     antes solo podía aparecer UN Momento por visita.
     Eso hacía posible quedarse muchísimo tiempo sin ver
     nada nuevo. Ahora el Claro puede volver a ofrecer otro
     Momento, pero deja bastante espacio entre uno y otro.
  ===================================================== */

  function chooseGardenActivity(){
    clearTimeout(activityTimer);

    if(
      !safeGarden() ||
      activeActivity
    ){
      return false;
    }

    const st=state();

    const options=[];

    if(!st.ballDone){
      options.push(
        startBallQuest
      );
    }

    if(!st.marieTrailDone){
      options.push(
        startMarieTrail
      );
    }

    if(!st.firefliesDone){
      options.push(
        startFireflies
      );
    }

    if(
      !st.choiceDone &&
      st.gardenVisits>=2
    ){
      options.push(
        startChoice
      );
    }

    if(!options.length){
      return false;
    }

    /*
      El orden cambia para que nunca parezca
      una lista de tareas.
    */
    const action=
      options[
        Math.floor(
          Math.random()*
          options.length
        )
      ];

    const started=
      Boolean(
        action?.()
      );

    if(started){
      save({
        lastGardenMomentAt:
          Date.now()
      });
    }

    return started;
  }

  function scheduleGardenActivity(){
    clearTimeout(gardenVisitTimer);

    /*
      Al entrar al Claro, un Momento pendiente puede
      aparecer relativamente pronto.
    */
    gardenVisitTimer=setTimeout(
      ()=>{
        chooseGardenActivity();
      },
      5600+
      Math.random()*4400
    );
  }


  /*
    Anti-estancamiento suave.

    No fuerza cartas ni completa nada automáticamente.
    Solo permite que, si el jugador sigue en el Claro y
    todavía quedan Momentos 45/46/47/53 pendientes,
    aparezca otra oportunidad después de un descanso.

    Así no hace falta salir y volver al Claro una y otra vez.
  */
  function momentHeartbeat(){

    if(
      !safeGarden() ||
      activeActivity
    ){
      return;
    }

    const st=state();

    const pending=
      !st.ballDone ||
      !st.marieTrailDone ||
      !st.firefliesDone ||
      (
        !st.choiceDone &&
        st.gardenVisits>=2
      );

    if(!pending){
      return;
    }

    const elapsed=
      Date.now()-
      Number(
        st.lastGardenMomentAt||0
      );

    /*
      Aproximadamente 30 s entre oportunidades.
      Mantiene el Claro tranquilo, pero elimina esperas
      absurdas de 20–30 minutos.
    */
    if(elapsed>=30000){
      chooseGardenActivity();
    }
  }

  /* =====================================================
     MOMENTOS QUE NO DAN CARTA
     Existen solo para que el mundo respire.
  ===================================================== */

  const AMBIENT_LINES=[
    'Tuluz dejo algo donde claramente no iba >w<',
    'Marie se acomodó cerquita y decidió que ese era su lugar.',
    'por un momento no paso absolutamente nada... y estuvo bonito ♡',
    'Mewo miro alrededor como si estuviera revisando que todos siguieran aquí.',
    'una lucecita cruzó el Claro y desapareció entre las hojas.',
    'Tuluz encontró otro motivo para correr de un lado al otro.',
    'Marie parpadeó despacito y volvió a acomodarse.'
  ];

  function ambientMoment(){
    clearTimeout(ambientTimer);

    if(
      safeGarden() &&
      !activeActivity &&
      Math.random()<.36
    ){
      const text=
        AMBIENT_LINES[
          Math.floor(
            Math.random()*
            AMBIENT_LINES.length
          )
        ];

      showWhisper(
        text,
        2800
      );

      save({
        ambientMoments:
          Number(
            state().ambientMoments||0
          )+1
      });
    }

    ambientTimer=setTimeout(
      ambientMoment,
      42000+
      Math.random()*28000
    );
  }

  /* =====================================================
     CLIMA INTERACTIVO
  ===================================================== */

  function watchWeather(){
    const weather=
      window.MAGIC_AMBIENT_ACTIVE||'';

    if(
      isGardenOpen() &&
      ['rain','storm'].includes(weather)
    ){
      weatherHold++;
    }else{
      weatherHold=0;
    }

    /*
      Si acaba la lluvia mientras estamos en el Claro,
      aparecen los reflejos.
    */
    if(
      previousWeather==='rain' &&
      weather!=='rain' &&
      safeGarden() &&
      !state().afterRainDone &&
      !activeActivity
    ){
      setTimeout(
        startAfterRain,
        900
      );
    }

    /*
      Si la lluvia/tormenta lleva un rato,
      un juguete puede quedar en el borde.
    */
    if(
      weatherHold>=8 &&
      !state().saveToyDone &&
      !activeActivity &&
      safeGarden()
    ){
      weatherHold=-999;

      setTimeout(
        startSaveToy,
        700
      );
    }

    previousWeather=weather;
  }

  /* =====================================================
     EXPLORACIÓN DEL CAMPO
  ===================================================== */

  function tickField(){
    const st=state();
    const wx=readWorldX();

    if(safeField()){
      let travel=
        Number(st.fieldTravel||0);

      if(
        st.lastWorldX!==null &&
        Number.isFinite(
          Number(st.lastWorldX)
        )
      ){
        travel+=Math.min(
          220,
          Math.abs(
            wx-Number(
              st.lastWorldX
            )
          )
        );
      }

      const patch={
        fieldTravel:travel,
        lastWorldX:wx
      };

      save(patch);

      if(
        !st.fallenStarDone &&
        travel>=1700 &&
        Math.abs(wx)>=900 &&
        !activeActivity
      ){
        startFallenStar();
        return;
      }

      if(
        !st.fieldLoopDone &&
        travel>=6500 &&
        st.fallenStarDone &&
        !activeActivity
      ){
        startFieldLoopMarker();
        return;
      }

      maybeOfferPlanting();
      refreshSpecialTulip();
      maybeStartMontage();
    }else{
      save({
        lastWorldX:wx
      });

      hidePlantPrompt();
    }
  }

  /* =====================================================
     ENTRADAS Y SALIDAS DEL CLARO
  ===================================================== */

  function onGardenOpen(){
    ensureDOM();

    const st=state();

    save({
      gardenVisits:
        Number(
          st.gardenVisits||0
        )+1
    });

    refreshMemoryDrop();

    if(catsReady()){
      scheduleGardenActivity();
    }

    setTimeout(
      maybeStartMontage,
      2500
    );
  }

  function onGardenClose(){
    clearTimeout(gardenVisitTimer);

    if(
      [
        'ball',
        'marieTrail',
        'fireflies',
        'afterRain',
        'saveToy',
        'choice'
      ].includes(activeActivity)
    ){
      cleanupActivity();
    }

    refreshSpecialTulip();
  }

  function cleanupActivity(){
    document
      .getElementById(
        'act1GardenActivityLayer'
      )
      ?.replaceChildren();

    document
      .getElementById(
        'act1ChoiceScene'
      )
      ?.classList.remove('show');

    activeActivity=null;
  }

  /* =====================================================
     INICIALIZACIÓN
  ===================================================== */

  function init(){
    ensureDOM();

    garden=
      document.getElementById(
        'catGarden'
      );

    refreshMemoryDrop();
    refreshSpecialTulip();

    if(garden){
      watchGardenNap();
    }

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
            refreshMemoryDrop();
            maybeStartMontage();
          },
          450
        );
      }
    );

    window.addEventListener(
      'paradox-act1-cinematic-finished',
      ()=>{
        scheduleDirectLetter(
          450
        );
      }
    );

    /*
      Tiempo en el Claro.
    */
    fiveMinuteTimer=setInterval(
      tickGardenTime,
      1000
    );

    /*
      El campo y el tulipán persistente.
    */
    fieldTimer=setInterval(
      tickField,
      420
    );

    /*
      Reacciones posteriores al clima.
    */
    weatherTimer=setInterval(
      watchWeather,
      1000
    );

    /*
      Cosas pequeñas sin recompensa.
    */
    ambientTimer=setTimeout(
      ambientMoment,
      26000+
      Math.random()*18000
    );

    /*
      Revisión suave de progreso de MOMENTOS.
      No entrega cartas: solo vuelve a permitir que
      aparezca una actividad pendiente dentro de la
      misma visita al Claro.
    */
    momentHeartbeatTimer=setInterval(
      momentHeartbeat,
      5000
    );

    /*
      Si el jugador actualizó mientras ya estaba en el Claro.
    */
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
        document.getElementById('app')
      ){
        clearInterval(boot);
        init();
      }
    },
    350
  );

  /* =====================================================
     API DE PRUEBA
     No muestra botones de debug en el juego.
  ===================================================== */

  window.ParadoxAct1Life={
    getState:state,

    reset(){
      localStorage.removeItem(KEY);

      const have=collected();

      NEW_IDS.forEach(
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
    },

    play(name){
      const map={
        ball:startBallQuest,
        marie:startMarieTrail,
        fireflies:startFireflies,
        rain:startAfterRain,
        saveToy:startSaveToy,
        star:startFallenStar,
        loop:startFieldLoopMarker,
        choice:startChoice,
        montage:maybeStartMontage
      };

      return map[name]?.();
    },

    earn,

    plant:maybeOfferPlanting,

    cards:[...NEW_IDS]
  };

})();
