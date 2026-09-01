/* =========================================================
   PARADOX143 — ACTO II V4 · RUPTURA TOTAL

   Capa narrativa adicional sobre el motor principal.

   Incluye:
   - zonas reales dentro del Acto II;
   - radio física permanente;
   - puzzles conectados entre capítulos;
   - Canasta vacía;
   - recuerdos falsos;
   - sucesos detrás del jugador;
   - falso regreso al Acto I;
   - puzzle casi solo sonoro;
   - Borde del Mundo;
   - persecución sin monstruo;
   - Mewo como ancla;
   - Marie como detectora de recuerdos falsos;
   - Tuluz atravesando lo que el Archivo llama inválido;
   - pausa donde la solución es no hacer nada;
   - último recorrido físico con los tres gatos;
   - "octavo fragmento" que no es fragmento.
========================================================= */

(() => {
  'use strict';

  const KEY='paradox143_act2_world_v4';

  const DEFAULT={
    version:4,

    radioFound:false,
    radioOpened:false,

    emptyBasketSeen:false,
    falseMemoriesDone:false,
    falseReturnDone:false,

    soundCorridorDone:false,
    edgeDone:false,
    relay143Done:false,

    stillRoomDone:false,
    finalWalkStarted:false,
    finalWalkDone:false,

    futureGlimpseSeen:false,

    behindSpawned:[],
    behindSeen:[],
    ambientSeen:[],
    zoneSeen:[],

    lastZone:'',
    lastX:0,
    lastChapter:0
  };

  let state=load();

  let root=null;
  let track=null;
  let world=null;
  let v4Objective=null;
  let v4ObjectiveType='';
  let v4Layer=null;
  let weatherLayer=null;
  let zoneLabel=null;
  let whisperBox=null;
  let radioButton=null;
  let radioOverlay=null;
  let eventOverlay=null;

  let running=false;
  let finalWalkStage=0;

  let radioAudio=null;
  let soundPuzzleAudio=null;

  function parse(key,fallback){
    try{
      const raw=localStorage.getItem(key);
      if(!raw) return fallback;
      const value=JSON.parse(raw);
      return value ?? fallback;
    }catch(_){
      return fallback;
    }
  }

  function load(){
    const raw=parse(KEY,{});
    return {
      ...DEFAULT,
      ...(raw && typeof raw==='object' ? raw : {})
    };
  }

  function save(patch={}){
    state={
      ...state,
      ...patch
    };

    try{
      localStorage.setItem(
        KEY,
        JSON.stringify(state)
      );
    }catch(_){}

    renderPermanentWorld();
    return state;
  }

  function core(){
    return window.ParadoxAct2;
  }

  function coreState(){
    return core()?.state?.() || {};
  }

  function fragments(){
    return window.ParadoxAct2Fragments?.found?.() || [];
  }

  function isActive(){
    return Boolean(
      core()?.isActive?.()
    );
  }

  function busy(){
    return Boolean(
      running ||
      core()?.isSceneOpen?.() ||
      core()?.isPuzzleOpen?.() ||
      window.ParadoxAct2Archive?.isOpen?.() ||
      document.body.classList.contains('basket2-open')
    );
  }

  function build(){
    if(root) return true;

    root=document.getElementById('act2Root');
    if(!root) return false;

    world=root.querySelector('#act2World');
    track=root.querySelector('#act2Track');

    if(!world || !track) return false;

    // World layer
    v4Layer=document.createElement('div');
    v4Layer.id='act2V4WorldLayer';
    track.appendChild(v4Layer);

    weatherLayer=document.createElement('div');
    weatherLayer.id='act2V4WeatherLayer';
    world.appendChild(weatherLayer);

    // Our own objective. No text: the world should invite rather than instruct.
    v4Objective=document.createElement('button');
    v4Objective.id='act2V4Objective';
    v4Objective.type='button';
    v4Objective.setAttribute('aria-label','Algo que necesita atención');
    v4Objective.innerHTML='<span>·</span><i></i>';
    world.appendChild(v4Objective);

    v4Objective.addEventListener('click',()=>{
      const type=v4ObjectiveType;
      clearObjective();
      runGate(type);
    });

    zoneLabel=document.createElement('div');
    zoneLabel.id='act2V4ZoneLabel';
    zoneLabel.innerHTML='<small></small><strong></strong>';
    root.appendChild(zoneLabel);

    whisperBox=document.createElement('div');
    whisperBox.id='act2V4Whisper';
    whisperBox.innerHTML='<span></span><small></small>';
    root.appendChild(whisperBox);

    // Permanent radio button
    radioButton=document.createElement('button');
    radioButton.id='act2V4RadioButton';
    radioButton.type='button';
    radioButton.setAttribute('aria-label','Radio encontrada');
    radioButton.innerHTML='<span>⌁</span><i></i>';
    root.appendChild(radioButton);
    radioButton.addEventListener('click',openRadio);

    buildRadioOverlay();
    buildEventOverlay();

    renderPermanentWorld();
    return true;
  }

  function buildRadioOverlay(){
    radioOverlay=document.createElement('section');
    radioOverlay.id='act2V4Radio';
    radioOverlay.setAttribute('aria-hidden','true');

    radioOverlay.innerHTML=`
      <div class="v4RadioCase">
        <header>
          <small>RECEPTOR</small>
          <strong id="v4RadioFreq">88.0</strong>
          <button id="v4RadioClose" type="button">×</button>
        </header>

        <div class="v4RadioSpeaker">
          <div></div><div></div><div></div><div></div>
        </div>

        <div id="v4RadioText">
          <span>sin portadora</span>
          <small></small>
        </div>

        <input
          id="v4RadioDial"
          type="range"
          min="880"
          max="1080"
          value="880"
          step="1"
          aria-label="Sintonizar radio"
        >

        <div class="v4RadioMarks">
          <span>88</span>
          <span>98</span>
          <span>108</span>
        </div>
      </div>
    `;

    root.appendChild(radioOverlay);

    const dial=radioOverlay.querySelector('#v4RadioDial');

    dial.addEventListener('input',()=>{
      tuneRadio(
        Number(dial.value)/10
      );
    });

    radioOverlay.querySelector('#v4RadioClose')
      .addEventListener('click',closeRadio);
  }

  function buildEventOverlay(){
    eventOverlay=document.createElement('section');
    eventOverlay.id='act2V4Event';
    eventOverlay.setAttribute('aria-hidden','true');
    root.appendChild(eventOverlay);
  }

  /* =======================================================
     ZONES
  ======================================================= */

  function zoneFor(x,ch){
    if(x<=-720 || x>=760){
      return {
        id:'edge',
        top:'ZONA SIN GENERAR',
        name:'BORDE DEL MUNDO'
      };
    }

    if(x<-430){
      return {
        id:'dead',
        top:'SIN RESPUESTA',
        name:'CAMPO MUERTO'
      };
    }

    if(x<-150){
      return ch>=3
        ? {
            id:'refuge',
            top:'MEMORIA PARCIAL',
            name:'CLARO INCOMPLETO'
          }
        : {
            id:'dead',
            top:'SEÑAL BAJA',
            name:'CAMPO MUERTO'
          };
    }

    if(x<150){
      return {
        id:'station',
        top:'FRECUENCIA DESCONOCIDA',
        name:'ESTACIÓN SIN SEÑAL'
      };
    }

    if(x<445){
      return {
        id:'paws',
        top:'MOVIMIENTO RECUPERADO',
        name:'SENDERO DE HUELLAS'
      };
    }

    if(x<720){
      return {
        id:'rain',
        top:'CLIMA SIN TIEMPO',
        name:'LLUVIA CONGELADA'
      };
    }

    return {
      id:'edge',
      top:'FIN DE DATOS',
      name:'BORDE DEL MUNDO'
    };
  }

  function updateZone(x,ch){
    if(!build()) return;

    const z=zoneFor(x,ch);

    root.dataset.v4Zone=z.id;

    zoneLabel.querySelector('small').textContent=z.top;
    zoneLabel.querySelector('strong').textContent=z.name;

    if(state.lastZone!==z.id){
      save({
        lastZone:z.id,
        zoneSeen:[
          ...new Set([
            ...(state.zoneSeen||[]),
            z.id
          ])
        ]
      });

      zoneLabel.classList.remove('show');
      void zoneLabel.offsetWidth;
      zoneLabel.classList.add('show');

      setTimeout(
        ()=>zoneLabel.classList.remove('show'),
        2300
      );

      dynamicZoneLine(z.id,ch);
    }

    weatherLayer.className='';
    weatherLayer.id='act2V4WeatherLayer';

    if(z.id==='rain'){
      weatherLayer.classList.add('frozen-rain');
    }

    if(z.id==='edge'){
      weatherLayer.classList.add('edge-noise');
    }
  }

  /* =======================================================
     DYNAMIC DIALOGUES
  ======================================================= */

  const DYNAMIC_LINES={
    '2:paws':['las huellas continúan.','Mewo mira antes de que tú lo hagas.'],
    '3:refuge':['hay una casa aquí.','todavía no recuerda todas sus paredes.'],
    '4:rain':['Marie mira la lluvia inmóvil.','no intenta corregirla.'],
    '5:station':['la radio busca algo que aún no tiene fecha.',''],
    '6:edge':['Tuluz sigue caminando.','la línea dice que después de aquí no hay nada.'],
    '7:dead':['Mewo espera cuando te alejas demasiado.',''],
    '7:rain':['ya no parece una zona rota.','solo una noche diferente.']
  };

  function dynamicZoneLine(zone,ch){
    const key=`${ch}:${zone}`;

    if(
      state.ambientSeen?.includes(key)
    ) return;

    const line=DYNAMIC_LINES[key];
    if(!line) return;

    save({
      ambientSeen:[
        ...(state.ambientSeen||[]),
        key
      ]
    });

    setTimeout(
      ()=>whisper(line[0],line[1]),
      450
    );
  }

  function whisper(main='',sub='',time=2500){
    if(!whisperBox) return;

    whisperBox.querySelector('span').textContent=main;
    whisperBox.querySelector('small').textContent=sub;

    whisperBox.classList.remove('show');
    void whisperBox.offsetWidth;
    whisperBox.classList.add('show');

    clearTimeout(whisper.timer);
    whisper.timer=setTimeout(
      ()=>whisperBox.classList.remove('show'),
      time
    );
  }

  /* =======================================================
     BEHIND-THE-PLAYER ANOMALIES
  ======================================================= */

  const BEHIND_EVENTS=[
    {
      id:'chair',
      ch:2,
      when:x=>x>430,
      x:120,
      mark:'□',
      line:'eso no estaba ahí.',
      sub:'cuando vuelves a mirar, parece haber estado siempre.'
    },
    {
      id:'fourth-paw',
      ch:3,
      when:x=>x<-320,
      x:230,
      mark:'🐾',
      line:'una huella más.',
      sub:'no pertenece a ninguno de los tres.'
    },
    {
      id:'duplicate-flower',
      ch:4,
      when:x=>x>520,
      x:30,
      mark:'✿',
      line:'la misma flor.',
      sub:'dos veces.'
    },
    {
      id:'letter-shadow',
      ch:5,
      when:x=>x<-420,
      x:310,
      mark:'♡',
      line:'parece una carta.',
      sub:'cuando la tocas no tiene frente ni reverso.'
    },
    {
      id:'moon-behind',
      ch:6,
      when:x=>x>640,
      x:85,
      mark:'☾',
      line:'la luna estaba delante.',
      sub:'por un instante también estuvo detrás.'
    }
  ];

  function updateBehind(x,ch){
    const spawned=new Set(state.behindSpawned||[]);
    const seen=new Set(state.behindSeen||[]);

    BEHIND_EVENTS.forEach(ev=>{
      if(
        ch>=ev.ch &&
        !spawned.has(ev.id) &&
        ev.when(x)
      ){
        spawned.add(ev.id);

        save({
          behindSpawned:[
            ...spawned
          ]
        });

        renderBehind();
      }
    });

    renderBehind();
  }

  function renderBehind(){
    if(!v4Layer) return;

    v4Layer
      .querySelectorAll('.v4BehindObject')
      .forEach(el=>el.remove());

    const seen=new Set(state.behindSeen||[]);

    BEHIND_EVENTS.forEach(ev=>{
      if(
        !state.behindSpawned?.includes(ev.id) ||
        seen.has(ev.id)
      ) return;

      const b=document.createElement('button');
      b.type='button';
      b.className='v4BehindObject';
      b.dataset.id=ev.id;
      b.style.left=`calc(50% + ${ev.x}px)`;
      b.innerHTML=`<span>${ev.mark}</span>`;

      b.addEventListener('click',()=>{
        const next=[
          ...(state.behindSeen||[]),
          ev.id
        ];

        save({
          behindSeen:[
            ...new Set(next)
          ]
        });

        b.classList.add('gone');

        whisper(
          ev.line,
          ev.sub,
          3300
        );

        setTimeout(
          renderBehind,
          500
        );
      });

      v4Layer.appendChild(b);
    });
  }

  /* =======================================================
     CAT BEHAVIOR AS NARRATIVE TOOLS
  ======================================================= */

  function updateCats(x,ch,st){
    const mewo=document.getElementById('act2MewoWorld');
    const marie=document.getElementById('act2MarieWorld');
    const tuluz=document.getElementById('act2TuluzWorld');

    // Track translates by -worldX, so adding x here makes a companion
    // remain near the camera/player.
    if(mewo && st.mewo){
      mewo.style.left=
        `calc(50% + ${x-105}px)`;

      mewo.classList.add(
        'v4-companion'
      );
    }

    if(marie && st.marie){
      const nearFalse=
        ch===4 ||
        root?.dataset?.v4Zone==='rain';

      marie.style.left=
        `calc(50% + ${x+(nearFalse?170:-245)}px)`;

      marie.classList.toggle(
        'v4-marie-alert',
        nearFalse
      );
    }

    if(tuluz && st.tuluz){
      tuluz.style.left=
        `calc(50% + ${x+130}px)`;

      tuluz.classList.toggle(
        'v4-invalid-walker',
        root?.dataset?.v4Zone==='edge'
      );
    }
  }

  /* =======================================================
     V4 OBJECTIVE/GATE
  ======================================================= */

  const GATES={
    radio:{x:-525,mark:'⌁'},
    basket:{x:-170,mark:'◇'},
    falseMemory:{x:315,mark:'?'},
    falseReturn:{x:15,mark:'♡'},
    sound:{x:-690,mark:'◖'},
    edge:{x:820,mark:'│'},
    relay:{x:-535,mark:'#'},
    still:{x:430,mark:'·'},
    finalWalk:{x:-760,mark:'🐾'}
  };

  function showObjective(type){
    if(!build()) return;

    const data=GATES[type];
    if(!data) return;

    const x=
      Number(
        core()?.worldX?.()||0
      );

    v4ObjectiveType=type;
    v4Objective.style.left=
      `calc(50% + ${data.x-x}px)`;
    v4Objective.querySelector('span').textContent=data.mark;
    v4Objective.classList.add('show');
  }

  function clearObjective(){
    v4ObjectiveType='';
    v4Objective?.classList.remove('show');
  }

  function gate(ch,st){
    if(!isActive() || !build()){
      return false;
    }

    renderPermanentWorld();

    if(running){
      clearObjective();
      return true;
    }

    // CHAPTER 2 — Radio becomes a physical permanent object.
    if(
      ch===2 &&
      !state.radioFound
    ){
      showObjective('radio');
      return true;
    }

    // CHAPTER 3 — The basket exists, but its meanings are gone.
    if(
      ch===3 &&
      !state.emptyBasketSeen
    ){
      showObjective('basket');
      return true;
    }

    // CHAPTER 4 — False reconstructed memories.
    if(
      ch===4 &&
      !state.falseMemoriesDone
    ){
      showObjective('falseMemory');
      return true;
    }

    // CHAPTER 5 — False return to Act I after Marie returns.
    if(
      ch===5 &&
      !state.falseReturnDone
    ){
      showObjective('falseReturn');
      return true;
    }

    // CHAPTER 6 — long chain before reconstruction.
    if(
      ch===6 &&
      !state.soundCorridorDone
    ){
      showObjective('sound');
      return true;
    }

    if(
      ch===6 &&
      !state.edgeDone
    ){
      showObjective('edge');
      return true;
    }

    if(
      ch===6 &&
      !state.relay143Done
    ){
      showObjective('relay');
      return true;
    }

    // CHAPTER 7 — learn to stop repairing, then physically cross the world.
    if(
      ch===7 &&
      !state.stillRoomDone
    ){
      showObjective('still');
      return true;
    }

    if(
      ch===7 &&
      !state.finalWalkDone
    ){
      if(!state.finalWalkStarted){
        showObjective('finalWalk');
      }else{
        clearObjective();
        updateFinalWalk(
          Number(core()?.worldX?.()||0)
        );
      }

      return true;
    }

    clearObjective();
    return false;
  }

  function runGate(type){
    if(running) return;

    switch(type){
      case 'radio':
        acquireRadio();
        break;

      case 'basket':
        emptyBasket();
        break;

      case 'falseMemory':
        falseMemoryRoom();
        break;

      case 'falseReturn':
        falseReturn();
        break;

      case 'sound':
        soundCorridor();
        break;

      case 'edge':
        edgeOfWorld();
        break;

      case 'relay':
        relay143();
        break;

      case 'still':
        stillRoom();
        break;

      case 'finalWalk':
        startFinalWalk();
        break;
    }
  }

  function beginEvent(theme=''){
    running=true;
    clearObjective();

    core()?.suppressObjectives?.(true);
    core()?.ambientMode?.('silence');

    eventOverlay.className='';
    eventOverlay.id='act2V4Event';
    eventOverlay.dataset.theme=theme;

    eventOverlay.innerHTML='';
    eventOverlay.style.pointerEvents='';
    eventOverlay.classList.add('show');
    eventOverlay.setAttribute('aria-hidden','false');

    document.body.classList.add('act2-v4-event-open');
  }

  function endEvent(){
    running=false;

    eventOverlay.classList.remove('show');
    eventOverlay.setAttribute('aria-hidden','true');
    eventOverlay.style.pointerEvents='';
    eventOverlay.innerHTML='';

    document.body.classList.remove('act2-v4-event-open');

    core()?.ambientMode?.('silence');
    core()?.suppressObjectives?.(false);

    setTimeout(
      ()=>core()?.setObjectiveForChapter?.(),
      450
    );
  }

  function playScene(scene,onDone){
    core()?.suppressObjectives?.(true);

    core()?.playScene?.(
      scene,
      {
        onDone:()=>{
          onDone?.();
          core()?.suppressObjectives?.(false);

          setTimeout(
            ()=>core()?.setObjectiveForChapter?.(),
            420
          );
        }
      }
    );
  }

  /* =======================================================
     PHYSICAL RADIO
  ======================================================= */

  function acquireRadio(){
    running=true;
    core()?.suppressObjectives?.(true);

    playScene(
      {
        theme:'v4-radio-find',
        mark:'⌁',
        frames:[
          {text:'Debajo de la estática hay algo sólido.',memory:'trace'},
          {text:'Un receptor pequeño está medio enterrado.',memory:'trace'},
          {text:'La pantalla todavía enciende.',memory:'glimmer'},
          {text:'No parece pertenecer al campo.',memory:'trace'},
          {text:'Tampoco parece haber llegado después.',memory:'trace'},
          {text:'Cuando lo levantas, la frecuencia cambia sola.',memory:'glimmer'},
          {text:'1...',memory:'trace'},
          {text:'4...',memory:'trace'},
          {text:'3...',memory:'trace'}
        ]
      },
      ()=>{
        running=false;

        save({
          radioFound:true
        });

        renderPermanentWorld();

        whisper(
          'la radio se queda contigo.',
          'no siempre tiene algo que decir.',
          3200
        );
      }
    );
  }

  function renderPermanentWorld(){
    if(!root) return;

    radioButton?.classList.toggle(
      'show',
      Boolean(
        state.radioFound &&
        isActive()
      )
    );

    renderBehind();
  }

  function ensureRadioAudio(){
    if(radioAudio) return radioAudio;

    const AudioCtx=
      window.AudioContext ||
      window.webkitAudioContext;

    if(!AudioCtx) return null;

    try{
      const ctx=new AudioCtx();

      const master=ctx.createGain();
      master.gain.value=.58;
      master.connect(ctx.destination);

      const buffer=ctx.createBuffer(
        1,
        ctx.sampleRate*1.4,
        ctx.sampleRate
      );

      const arr=buffer.getChannelData(0);

      for(let i=0;i<arr.length;i++){
        arr[i]=Math.random()*2-1;
      }

      const source=ctx.createBufferSource();
      source.buffer=buffer;
      source.loop=true;

      const filter=ctx.createBiquadFilter();
      filter.type='bandpass';
      filter.frequency.value=900;
      filter.Q.value=1.3;

      const gain=ctx.createGain();
      gain.gain.value=.075;

      source.connect(filter);
      filter.connect(gain);
      gain.connect(master);

      const tone=ctx.createOscillator();
      tone.type='sine';
      tone.frequency.value=73;

      const toneGain=ctx.createGain();
      toneGain.gain.value=.004;

      tone.connect(toneGain);
      toneGain.connect(master);

      source.start();
      tone.start();

      radioAudio={
        ctx,
        source,
        filter,
        gain,
        tone,
        toneGain,
        master
      };

      return radioAudio;
    }catch(_){
      return null;
    }
  }

  function openRadio(){
    if(!state.radioFound || busy()) return;

    save({
      radioOpened:true
    });

    core()?.suppressObjectives?.(true);
    core()?.ambientMode?.('silence');

    radioOverlay.classList.add('show');
    radioOverlay.setAttribute('aria-hidden','false');

    const audio=ensureRadioAudio();

    try{
      audio?.ctx?.resume?.();
    }catch(_){}

    const dial=radioOverlay.querySelector('#v4RadioDial');
    tuneRadio(
      Number(dial.value)/10
    );
  }

  function closeRadio(){
    radioOverlay.classList.remove('show');
    radioOverlay.setAttribute('aria-hidden','true');

    try{
      if(radioAudio){
        radioAudio.gain.gain.value=0;
        radioAudio.toneGain.gain.value=0;
      }
    }catch(_){}

    core()?.suppressObjectives?.(false);

    setTimeout(
      ()=>core()?.setObjectiveForChapter?.(),
      300
    );
  }

  const RADIO_STATIONS=[
    {
      f:89.4,
      test:()=>true,
      main:'¿sigues ah—',
      sub:'la portadora desaparece.'
    },
    {
      f:94.3,
      test:()=>Boolean(coreState().mewo),
      main:'me...',
      sub:'...wo'
    },
    {
      f:97.1,
      test:()=>Boolean(coreState().refuge),
      main:'hog...',
      sub:'la palabra se pierde antes de terminar.'
    },
    {
      f:101.4,
      test:()=>Boolean(coreState().marie),
      main:'te recordaba...',
      sub:'la señal cambia antes de la siguiente palabra.'
    },
    {
      f:104.6,
      test:()=>Boolean(coreState().tuluz),
      main:'SOURCE DATE:',
      sub:'AFTER BACKUP'
    },
    {
      f:107.9,
      test:()=>fragments().length>=7,
      main:'mañana...',
      sub:'NO SOURCE / todavía.'
    }
  ];

  function tuneRadio(freq){
    if(!radioOverlay) return;

    radioOverlay.querySelector('#v4RadioFreq')
      .textContent=freq.toFixed(1);

    const main=radioOverlay.querySelector('#v4RadioText span');
    const sub=radioOverlay.querySelector('#v4RadioText small');

    let chosen=null;
    let distance=999;

    RADIO_STATIONS.forEach(st=>{
      if(!st.test()) return;

      const d=Math.abs(st.f-freq);

      if(d<distance){
        distance=d;
        chosen=st;
      }
    });

    const audio=ensureRadioAudio();

    if(audio){
      const close=
        Math.max(
          0,
          1-(distance/.8)
        );

      try{
        audio.gain.gain.value=
          .085-(close*.067);

        audio.toneGain.gain.value=
          .003+(close*.020);

        audio.filter.frequency.value=
          400+
          (
            (freq-88)/
            20
          )*2600;
      }catch(_){}
    }

    if(chosen && distance<=.16){
      main.textContent=chosen.main;
      sub.textContent=chosen.sub;
      radioOverlay.classList.add('locked');
    }else{
      main.textContent=
        distance<.65
          ? '...'
          : 'sin portadora';

      sub.textContent='';
      radioOverlay.classList.remove('locked');
    }
  }

  /* =======================================================
     EMPTY BASKET — 99 places without text
  ======================================================= */

  function emptyBasket(){
    beginEvent('empty-basket');

    const special=
      new Set([
        0,14,43,63,78
      ]);

    eventOverlay.innerHTML=`
      <div class="v4BasketVoid">
        <header>
          <small>CANASTA</small>
          <strong>99 / 99</strong>
        </header>

        <div id="v4BlankCards"></div>

        <div id="v4BasketEcho">
          <span></span>
          <small></small>
        </div>

        <button id="v4BasketBack" type="button">
          cerrar
        </button>
      </div>
    `;

    const grid=
      eventOverlay.querySelector(
        '#v4BlankCards'
      );

    const echo=
      eventOverlay.querySelector(
        '#v4BasketEcho'
      );

    const back=
      eventOverlay.querySelector(
        '#v4BasketBack'
      );

    const heard=new Set();

    const echoes={
      0:['calor.','una frase que ya no llega.'],
      14:['rrr...','algo parecido a un ronroneo.'],
      43:['cinco minu—','la voz se corta.'],
      63:['una flor abre de noche.','no aparece ninguna imagen.'],
      78:['hogar.','la palabra sí permanece.']
    };

    for(let i=0;i<99;i++){
      const b=document.createElement('button');
      b.type='button';
      b.className='v4BlankCard';
      b.textContent='';

      if(special.has(i)){
        b.classList.add('echo');
      }

      b.addEventListener('click',()=>{
        if(!special.has(i)){
          echo.querySelector('span').textContent='...';
          echo.querySelector('small').textContent='sin texto.';
          return;
        }

        heard.add(i);
        b.classList.add('heard');

        const line=echoes[i];

        echo.querySelector('span').textContent=line[0];
        echo.querySelector('small').textContent=line[1];

        if(heard.size>=special.size){
          back.classList.add('show');
        }
      });

      grid.appendChild(b);
    }

    back.addEventListener('click',()=>{
      if(heard.size<special.size) return;

      save({
        emptyBasketSeen:true
      });

      endEvent();

      whisper(
        'las cartas siguen guardadas.',
        'lo que falta es la forma de leerlas desde aquí.',
        3900
      );
    });
  }

  /* =======================================================
     FALSE MEMORIES
  ======================================================= */

  function falseMemoryRoom(){
    beginEvent('false-memory');

    let resolving=false;

    const memories=[
      {
        id:'pillow',
        icon:'zZ',
        title:'ALMOHADA',
        line:'posición exacta: 31.2%',
        truth:'copy'
      },
      {
        id:'paw',
        icon:'🐾',
        title:'HUELLA',
        line:'cuarto individuo detectado',
        truth:'copy'
      },
      {
        id:'letter',
        icon:'♡',
        title:'CARTA 44',
        line:'dos copias idénticas',
        truth:'copy'
      },
      {
        id:'moon',
        icon:'☾',
        title:'LUNA',
        line:'fase bloqueada',
        truth:'copy'
      },
      {
        id:'warmth',
        icon:'·',
        title:'ALGUIEN CERCA',
        line:'sin posición recuperable',
        truth:'recognize'
      }
    ];

    eventOverlay.innerHTML=`
      <div class="v4FalseMemoryRoom">
        <header>
          <small>RECONSTRUCCIÓN AUTOMÁTICA</small>
          <strong>¿ESTO ES RECORDAR?</strong>
        </header>

        <div id="v4FalseMemoryGrid"></div>

        <div id="v4FalseMemoryQuestion">
          <span></span>
          <small></small>
        </div>

        <div id="v4FalseMemoryChoice">
          <button data-choice="copy">LA COPIA</button>
          <button data-choice="recognize">LO QUE RECONOCES</button>
        </div>
      </div>
    `;

    const grid=eventOverlay.querySelector('#v4FalseMemoryGrid');
    const q=eventOverlay.querySelector('#v4FalseMemoryQuestion');
    const choice=eventOverlay.querySelector('#v4FalseMemoryChoice');

    const inspected=new Set();

    memories.forEach(mem=>{
      const b=document.createElement('button');
      b.type='button';
      b.innerHTML=`
        <i>${mem.icon}</i>
        <strong>${mem.title}</strong>
        <small>${mem.line}</small>
      `;

      b.addEventListener('click',()=>{
        inspected.add(mem.id);
        b.classList.add('seen');

        q.querySelector('span').textContent=
          mem.truth==='copy'
            ? 'demasiado exacto.'
            : 'no tiene coordenadas.';

        q.querySelector('small').textContent=
          mem.truth==='copy'
            ? 'parece correcto porque no puede cambiar.'
            : 'y aun así sabes qué significa.';

        if(inspected.size>=memories.length){
          choice.classList.add('show');
        }
      });

      grid.appendChild(b);
    });

    choice.querySelectorAll('button')
      .forEach(b=>{
        b.addEventListener('click',()=>{
          if(resolving) return;

          if(b.dataset.choice==='recognize'){
            resolving=true;
            q.querySelector('span').textContent=
              'sí.';

            q.querySelector('small').textContent=
              'recordar no siempre devuelve una fotografía.';

            setTimeout(()=>{
              save({
                falseMemoriesDone:true
              });

              endEvent();

              whisper(
                'Marie mira la reconstrucción.',
                'ella también parece haber notado cuáles eran copias.',
                3800
              );
            },1000);
          }else{
            eventOverlay.classList.add('v4-wrong-memory');

            q.querySelector('span').textContent=
              'la copia no puede contradecirte.';

            q.querySelector('small').textContent=
              'tampoco puede sorprenderte.';

            setTimeout(
              ()=>{
                eventOverlay.classList.remove('v4-wrong-memory');
                resolving=false;
              },
              450
            );
          }
        });
      });
  }

  /* =======================================================
     FALSE RETURN TO ACT I
  ======================================================= */

  function falseReturn(){
    beginEvent('false-return');

    let loop=0;
    let inspected=new Set();

    eventOverlay.innerHTML=`
      <div class="v4FalseReturn">
        <div class="v4FalseSky">
          <button data-error="moon" class="v4FalseMoon">☾</button>
        </div>

        <div class="v4FalseGarden">
          <div class="v4FalseBg"></div>

          <button data-error="letter" class="v4FalseLetter">♡</button>
          <button data-error="clock" class="v4FalseClock">00:00</button>

          <button data-error="mewo" class="v4FalseCat mewo">
            <img src="mewo_idle.png" alt="">
          </button>

          <button data-error="marie" class="v4FalseCat marie">
            <img src="cat_gray_idle.png" alt="">
          </button>

          <button data-error="tuluz" class="v4FalseCat tuluz">
            <img src="cat_orange_idle.png" alt="">
          </button>

          <div id="v4FalseReturnLine">
            <span></span>
            <small></small>
          </div>

          <button id="v4FalseReturnExit" type="button">
            volver al campo
          </button>
        </div>
      </div>
    `;

    const line=eventOverlay.querySelector('#v4FalseReturnLine');
    const exit=eventOverlay.querySelector('#v4FalseReturnExit');

    const messages={
      moon:['la luna no se mueve.','ni siquiera cuando esperas.'],
      letter:['Carta 44.','Carta 44. Carta 44. Carta 44.'],
      clock:['00:00','el minuto no cambia.'],
      mewo:['Mewo repite exactamente el mismo movimiento.','cada vez con la misma duración.'],
      marie:['Marie parpadea al mismo tiempo que Mewo.','siempre.'],
      tuluz:['Tuluz no proyecta sombra.','el mundo no sabe de dónde copiarla.']
    };

    function startNormalMusic(){
      const audio=document.getElementById('bgMusic');
      if(!audio) return;

      try{
        audio.pause();
        audio.currentTime=0;
        audio.playbackRate=1;
        audio.volume=.30;
        audio.loop=true;

        const promise=audio.play();
        promise?.catch?.(()=>{});
      }catch(_){}
    }

    function stopNormalMusic(){
      const audio=document.getElementById('bgMusic');
      if(!audio) return;

      let n=0;

      const fade=setInterval(()=>{
        n++;

        try{
          audio.playbackRate=
            Math.max(.43,1-(n*.045));

          audio.volume=
            Math.max(0,.30-(n*.021));
        }catch(_){}

        if(n>=15){
          clearInterval(fade);

          try{
            audio.pause();
            audio.volume=0;
            audio.playbackRate=1;
          }catch(_){}
        }
      },95);
    }

    startNormalMusic();

    eventOverlay
      .querySelectorAll('[data-error]')
      .forEach(b=>{
        b.addEventListener('click',()=>{
          const id=b.dataset.error;
          inspected.add(id);

          b.classList.add('noticed');

          line.querySelector('span').textContent=messages[id][0];
          line.querySelector('small').textContent=messages[id][1];

          if(inspected.size>=6){
            exit.classList.add('show');
          }
        });
      });

    exit.addEventListener('click',()=>{
      if(inspected.size<6) return;

      if(loop===0){
        loop=1;
        inspected=new Set();

        eventOverlay.classList.add('v4-false-loop');

        line.querySelector('span').textContent='...';
        line.querySelector('small').textContent='';

        exit.classList.remove('show');

        setTimeout(()=>{
          eventOverlay
            .querySelectorAll('[data-error]')
            .forEach(b=>b.classList.remove('noticed'));

          eventOverlay.querySelector('.v4FalseClock').textContent='00:00';

          const audio=document.getElementById('bgMusic');

          try{
            if(audio){
              audio.pause();
              audio.currentTime=0;
              audio.playbackRate=1;
              audio.volume=.30;
              audio.play().catch(()=>{});
            }
          }catch(_){}

          line.querySelector('span').textContent='volviste.';
          line.querySelector('small').textContent='al mismo segundo.';

          eventOverlay.classList.remove('v4-false-loop');

          // The second loop doesn't require all objects again.
          setTimeout(
            ()=>exit.classList.add('show'),
            1450
          );
        },900);

        return;
      }

      stopNormalMusic();

      line.querySelector('span').textContent=
        'Esto no es volver.';

      line.querySelector('small').textContent=
        'es una reproducción que no puede continuar.';

      eventOverlay.classList.add('v4-false-collapse');

      setTimeout(()=>{
        save({
          falseReturnDone:true
        });

        endEvent();

        whisper(
          'el Acto I no regresó.',
          'solo aprendiste cómo se ve cuando alguien lo congela.',
          4300
        );
      },3100);
    });
  }

  /* =======================================================
     SOUND-ONLY CORRIDOR
  ======================================================= */

  function createSoundPuzzleAudio(){
    if(soundPuzzleAudio) return soundPuzzleAudio;

    const AudioCtx=
      window.AudioContext ||
      window.webkitAudioContext;

    if(!AudioCtx) return null;

    try{
      const ctx=new AudioCtx();
      const master=ctx.createGain();
      master.gain.value=.52;
      master.connect(ctx.destination);

      const buffer=ctx.createBuffer(
        1,
        ctx.sampleRate,
        ctx.sampleRate
      );

      const data=buffer.getChannelData(0);
      for(let i=0;i<data.length;i++){
        data[i]=Math.random()*2-1;
      }

      const noise=ctx.createBufferSource();
      noise.buffer=buffer;
      noise.loop=true;

      const noiseGain=ctx.createGain();
      noiseGain.gain.value=.035;

      noise.connect(noiseGain);
      noiseGain.connect(master);

      const tone=ctx.createOscillator();
      tone.type='sine';
      tone.frequency.value=206;

      const pan=
        ctx.createStereoPanner
          ? ctx.createStereoPanner()
          : null;

      const toneGain=ctx.createGain();
      toneGain.gain.value=.022;

      if(pan){
        tone.connect(pan);
        pan.connect(toneGain);
      }else{
        tone.connect(toneGain);
      }

      toneGain.connect(master);

      noise.start();
      tone.start();

      soundPuzzleAudio={
        ctx,
        master,
        noise,
        noiseGain,
        tone,
        toneGain,
        pan
      };

      return soundPuzzleAudio;
    }catch(_){
      return null;
    }
  }

  function soundCorridor(){
    beginEvent('sound-corridor');

    const pattern=['left','right','right','left','right'];
    let round=0;
    let wrong=0;

    eventOverlay.innerHTML=`
      <div class="v4SoundCorridor">
        <div id="v4SoundInstruction">
          <span>no mires.</span>
          <small>escucha dónde queda algo.</small>
        </div>

        <button data-side="left" type="button" aria-label="Elegir señal izquierda"></button>
        <button data-side="right" type="button" aria-label="Elegir señal derecha"></button>

        <div id="v4SoundPulse"></div>
      </div>
    `;

    const audio=createSoundPuzzleAudio();

    try{
      audio?.ctx?.resume?.();
    }catch(_){}

    function playRound(){
      const target=pattern[round];

      if(audio?.pan){
        try{
          audio.pan.pan.setTargetAtTime(
            target==='left' ? -.88 : .88,
            audio.ctx.currentTime,
            .06
          );

          audio.tone.frequency.setTargetAtTime(
            180+(round*23),
            audio.ctx.currentTime,
            .06
          );
        }catch(_){}
      }

      const pulse=eventOverlay.querySelector('#v4SoundPulse');
      pulse.className='';

      if(wrong>=3){
        pulse.classList.add(
          target==='left'
            ? 'hint-left'
            : 'hint-right'
        );
      }
    }

    setTimeout(()=>{
      eventOverlay.querySelector('#v4SoundInstruction')
        ?.classList.add('gone');
    },2600);

    eventOverlay.querySelectorAll('[data-side]')
      .forEach(b=>{
        b.addEventListener('click',()=>{
          const chosen=b.dataset.side;
          const target=pattern[round];

          if(chosen===target){
            round++;

            eventOverlay.classList.add('v4-sound-correct');

            setTimeout(
              ()=>eventOverlay.classList.remove('v4-sound-correct'),
              240
            );

            if(round>=pattern.length){
              try{
                if(audio){
                  audio.toneGain.gain.value=0;
                  audio.noiseGain.gain.value=0;
                }
              }catch(_){}

              const inst=
                eventOverlay.querySelector(
                  '#v4SoundInstruction'
                );

              inst.classList.remove('gone');
              inst.querySelector('span').textContent='ahí.';
              inst.querySelector('small').textContent='la señal estaba intentando ir hacia adelante.';

              setTimeout(()=>{
                save({
                  soundCorridorDone:true
                });

                endEvent();
              },1800);

              return;
            }

            setTimeout(
              playRound,
              420
            );
          }else{
            wrong++;

            try{
              if(audio){
                audio.noiseGain.gain.value=.16;

                setTimeout(
                  ()=>audio.noiseGain.gain.value=.035,
                  180
                );
              }
            }catch(_){}

            eventOverlay.classList.add('v4-sound-wrong');

            setTimeout(
              ()=>eventOverlay.classList.remove('v4-sound-wrong'),
              240
            );

            playRound();
          }
        });
      });

    playRound();
  }

  /* =======================================================
     EDGE OF WORLD + CHASE WITHOUT MONSTER
  ======================================================= */

  function edgeOfWorld(){
    beginEvent('edge');

    let marks=0;

    eventOverlay.innerHTML=`
      <div class="v4EdgeRoom">
        <div class="v4EdgeCoordinates">
          <span>X 0879</span>
          <span>Y ----</span>
          <span>FRAME ----</span>
        </div>

        <div class="v4EdgeLine"></div>

        <button data-mark="1" class="v4EdgePoint p1" type="button">+</button>
        <button data-mark="2" class="v4EdgePoint p2" type="button">+</button>
        <button data-mark="3" class="v4EdgePoint p3" type="button">+</button>
        <button data-mark="4" class="v4EdgePoint p4" type="button">+</button>

        <div id="v4EdgeText">
          <span></span>
          <small></small>
        </div>
      </div>
    `;

    const text=eventOverlay.querySelector('#v4EdgeText');

    eventOverlay.querySelectorAll('[data-mark]')
      .forEach(b=>{
        b.addEventListener('click',()=>{
          if(b.classList.contains('seen')) return;

          b.classList.add('seen');
          marks++;

          const lines=[
            ['aquí dejan de aparecer flores.',''],
            ['un poco después desaparece el pasto.',''],
            ['las estrellas ya no continúan.',''],
            ['la línea no es una pared.','es el lugar donde el mundo dejó de inventar lo siguiente.']
          ];

          const line=
            lines[
              Math.min(
                marks-1,
                lines.length-1
              )
            ];

          text.querySelector('span').textContent=line[0];
          text.querySelector('small').textContent=line[1];

          if(marks>=4){
            setTimeout(
              startChase,
              1100
            );
          }
        });
      });
  }

  function startChase(){
    let progress=0;
    let pressure=0;
    let done=false;

    eventOverlay.dataset.theme='chase';

    eventOverlay.innerHTML=`
      <div class="v4Chase">
        <div id="v4ChaseVoid"></div>
        <div id="v4ChaseWorld"></div>
        <div id="v4ChaseCoords">X 0880 →</div>
        <button id="v4ChaseForward" type="button">
          →
        </button>
        <div id="v4ChaseLine"></div>
      </div>
    `;

    const voidEl=eventOverlay.querySelector('#v4ChaseVoid');
    const line=eventOverlay.querySelector('#v4ChaseLine');

    const timer=setInterval(()=>{
      if(done) return;

      pressure+=1.35;

      voidEl.style.width=
        `${Math.min(92,pressure)}%`;

      if(pressure>=78){
        pressure=Math.max(
          28,
          pressure-35
        );

        progress=Math.max(
          0,
          progress-2
        );

        eventOverlay.classList.add('v4-chase-caught');

        line.textContent='...';

        setTimeout(
          ()=>eventOverlay.classList.remove('v4-chase-caught'),
          320
        );
      }
    },210);

    eventOverlay.querySelector('#v4ChaseForward')
      .addEventListener('click',()=>{
        if(done) return;

        progress++;
        pressure=Math.max(
          0,
          pressure-7.5
        );

        line.textContent=
          progress<4
            ? 'sigue.'
            : progress<8
              ? 'no mires atrás.'
              : 'lo que desaparece detrás no te está siguiendo.';

        if(progress>=12){
          done=true;
          clearInterval(timer);

          eventOverlay.classList.add('v4-chase-finish');

          line.textContent=
            'no había nada detrás de ti.';

          setTimeout(()=>{
            line.textContent=
              'solo dejó de existir lo que quedaba atrás.';
          },1000);

          setTimeout(()=>{
            save({
              edgeDone:true
            });

            endEvent();
          },2600);
        }
      });
  }

  /* =======================================================
     INTERCONNECTED 1-4-3 RELAY
  ======================================================= */

  function relay143(){
    beginEvent('relay');

    let entry='';
    let failures=0;

    eventOverlay.innerHTML=`
      <div class="v4Relay">
        <header>
          <small>STATION / LOCAL MEMORY</small>
          <strong>SIGNAL RELAY</strong>
        </header>

        <div id="v4RelayDisplay">
          <span>---</span>
          <small>ENTER MEMORY INDEX</small>
        </div>

        <div id="v4RelayKeys"></div>

        <div class="v4RelayActions">
          <button id="v4RelayErase" type="button">
            BORRAR
          </button>

          <button id="v4RelayEnter" type="button">
            ENTER
          </button>
        </div>
      </div>
    `;

    const display=eventOverlay.querySelector('#v4RelayDisplay span');
    const sub=eventOverlay.querySelector('#v4RelayDisplay small');
    const keys=eventOverlay.querySelector('#v4RelayKeys');

    for(let n=0;n<=9;n++){
      const b=document.createElement('button');
      b.type='button';
      b.textContent=String(n);

      b.addEventListener('click',()=>{
        if(entry.length>=3) return;

        entry+=String(n);
        display.textContent=
          entry.padEnd(3,'-');
      });

      keys.appendChild(b);
    }

    eventOverlay.querySelector('#v4RelayErase')
      ?.addEventListener('click',()=>{
        entry='';
        display.textContent='---';
        sub.textContent='ENTER MEMORY INDEX';
      });

    eventOverlay.querySelector('#v4RelayEnter')
      .addEventListener('click',()=>{
        if(entry==='143'){
          display.textContent='143';
          sub.textContent='CARRIER FOUND / LOCAL MEMORY';

          eventOverlay.classList.add('v4-relay-ok');

          setTimeout(()=>{
            sub.textContent=
              'the number was never a password. it was a place to listen.';
          },650);

          setTimeout(()=>{
            save({
              relay143Done:true
            });

            endEvent();

            whisper(
              '1 · 4 · 3',
              'la señal ya no vuelve a repetirse.',
              3200
            );
          },1900);

          return;
        }

        failures++;
        entry='';
        display.textContent='---';

        sub.textContent=
          failures>=3
            ? '1... 4... 3... / SIGNAL REPEATING'
            : 'NO CARRIER';

        eventOverlay.classList.add('v4-relay-wrong');

        setTimeout(
          ()=>eventOverlay.classList.remove('v4-relay-wrong'),
          280
        );
      });
  }

  /* =======================================================
     THE ABSENCE ROOM
  ======================================================= */

  function stillRoom(){
    beginEvent('still');

    let touched=0;
    let elapsed=0;
    let timer=null;
    let finished=false;

    eventOverlay.innerHTML=`
      <div class="v4StillRoom">
        <div class="v4StillDot">·</div>
        <div id="v4StillText"></div>
      </div>
    `;

    const text=
      eventOverlay.querySelector(
        '#v4StillText'
      );

    const reset=()=>{
      if(finished) return;

      elapsed=0;
      touched++;

      if(touched===1){
        text.textContent='...';
      }else if(touched===2){
        text.textContent='no.';
      }else if(touched>=3){
        text.textContent=
          'tal vez no tengas que hacer nada.';
      }

      eventOverlay.classList.add(
        'v4-still-disturbed'
      );

      setTimeout(
        ()=>eventOverlay.classList.remove(
          'v4-still-disturbed'
        ),
        260
      );
    };

    eventOverlay.addEventListener(
      'pointerdown',
      reset
    );

    const cleanup=()=>{
      eventOverlay.removeEventListener(
        'pointerdown',
        reset
      );

      if(timer){
        clearInterval(timer);
        timer=null;
      }

      eventOverlay.style.pointerEvents='';
    };

    timer=setInterval(()=>{
      elapsed+=1;

      if(
        elapsed===6 &&
        touched===0
      ){
        text.textContent='';
      }

      if(elapsed>=12){
        finished=true;
        cleanup();

        /*
          Evitamos que un toque accidental durante las frases
          finales reinicie el puzzle.
        */
        eventOverlay.style.pointerEvents='none';

        text.textContent=
          'el vacío permanece.';

        setTimeout(()=>{
          text.textContent=
            'y no necesita que lo arregles.';
        },900);

        setTimeout(()=>{
          save({
            stillRoomDone:true
          });

          eventOverlay.style.pointerEvents='';

          endEvent();
        },2300);
      }
    },1000);
  }

  /* =======================================================
     FINAL PHYSICAL WALK
  ======================================================= */

  function startFinalWalk(){
    save({
      finalWalkStarted:true
    });

    finalWalkStage=0;

    clearObjective();

    core()?.suppressObjectives?.(true);

    playScene(
      {
        theme:'v4-final-walk',
        mark:'🐾',
        frames:[
          {text:'No aparece ninguna nueva puerta.',memory:'world'},
          {text:'No queda otro archivo que abrir.',memory:'world'},
          {text:'Solo queda cruzar lo que volvió.',cats:['mewo_idle.png'],memory:'world'},
          {text:'Mewo empieza a caminar antes que tú.',cats:['mewo_idle.png'],memory:'world'}
        ]
      },
      ()=>{
        whisper(
          'cruza el campo.',
          '',
          2200
        );

        updateFinalWalk(
          Number(core()?.worldX?.()||0)
        );
      }
    );
  }

  function updateFinalWalk(x){
    if(
      !state.finalWalkStarted ||
      state.finalWalkDone
    ) return;

    const steps=[
      {
        x:-500,
        line:['Mewo no mira atrás.','solo espera si te quedas demasiado lejos.']
      },
      {
        x:-160,
        line:['Marie se une sin que el mundo tenga que reconstruirla otra vez.','']
      },
      {
        x:190,
        line:['Tuluz atraviesa una línea que todavía dice INVALID.','la línea deja de importar.']
      },
      {
        x:500,
        line:['la radio deja de producir estática.','por primera vez no parece haberse roto.']
      },
      {
        x:740,
        line:['el último espacio sigue vacío.','los tres se detienen contigo.']
      }
    ];

    while(
      finalWalkStage<steps.length &&
      x>=steps[finalWalkStage].x
    ){
      const step=steps[finalWalkStage];

      whisper(
        step.line[0],
        step.line[1],
        3400
      );

      finalWalkStage++;
    }

    if(
      finalWalkStage>=steps.length &&
      x>=760 &&
      !running
    ){
      running=true;

      playScene(
        {
          theme:'v4-final-walk-end',
          mark:'·',
          frames:[
            {text:'Mewo se sienta.',cats:['mewo_idle.png'],memory:'future-gap'},
            {text:'Marie encuentra un lugar a su lado.',cats:['cat_gray_idle.png','mewo_idle.png'],memory:'future-gap'},
            {text:'Tuluz tarda un poco más porque estaba mirando algo fuera del borde.',cats:['cat_gray_idle.png','mewo_idle.png','cat_orange_idle.png'],memory:'future-gap'},
            {text:'Ninguno intenta llenar el hueco.',cats:['cat_gray_idle.png','mewo_idle.png','cat_orange_idle.png'],memory:'future-gap'},
            {text:'Tú tampoco.',cats:['cat_gray_idle.png','mewo_happy.png','cat_orange_idle.png'],memory:'future-gap'}
          ]
        },
        ()=>{
          running=false;

          save({
            finalWalkDone:true
          });

          core()?.setWorldX?.(0);

          setTimeout(
            ()=>core()?.setObjectiveForChapter?.(),
            500
          );
        }
      );
    }
  }

  /* =======================================================
     A MEMORY THAT ISN'T A FRAGMENT
  ======================================================= */

  function maybeFutureGlimpse(x,ch){
    if(
      state.futureGlimpseSeen ||
      ch<7 ||
      x<735 ||
      fragments().length<7
    ) return;

    const fragState=parse(
      'paradox143_fragments_v1',
      {}
    );

    if(!fragState.starSeen) return;

    save({
      futureGlimpseSeen:true
    });

    setTimeout(()=>{
      core()?.suppressObjectives?.(true);

      core()?.playScene?.(
        {
          theme:'v4-not-fragment',
          mark:'',
          frames:[
            {text:'Algo aparece donde esperabas otro fragmento.',memory:'future-gap'},
            {text:'No tiene número.',memory:'future-gap'},
            {text:'No estaba escondido en el pasado.',memory:'future-gap'},
            {text:'Una flor que nunca viste intenta dibujarse.',memory:'new-flowers'},
            {text:'El mundo busca una versión anterior.',memory:'future-gap'},
            {text:'No existe.',memory:'future-gap'},
            {text:'Esta vez eso no parece un error.',memory:'new-flowers'},
            {text:'Esto no ocurrió.',memory:'new-flowers'},
            {text:'Todavía.',memory:'new-flowers'}
          ]
        },
        {
          onDone:()=>{
            core()?.suppressObjectives?.(false);

            setTimeout(
              ()=>core()?.setObjectiveForChapter?.(),
              450
            );
          }
        }
      );
    },800);
  }

  /* =======================================================
     WORLD POSITION
  ======================================================= */

  function onWorld(detail={}){
    if(!isActive() || !build()) return;

    const st=
      detail.state ||
      coreState();

    const x=
      Number(
        detail.x ??
        st.worldX ??
        0
      );

    const ch=
      Number(
        detail.chapter ??
        st.chapter ??
        0
      );

    state.lastX=x;
    state.lastChapter=ch;

    updateZone(x,ch);
    updateBehind(x,ch);
    updateCats(x,ch,st);
    maybeFutureGlimpse(x,ch);

    if(
      state.finalWalkStarted &&
      !state.finalWalkDone
    ){
      updateFinalWalk(x);
    }
  }

  /* =======================================================
     DEV
  ======================================================= */

  function debug(name){
    if(
      !new URLSearchParams(
        location.search
      ).has('dev')
    ) return;

    switch(name){
      case 'radio':
        acquireRadio();
        break;
      case 'basket':
        emptyBasket();
        break;
      case 'false':
        falseMemoryRoom();
        break;
      case 'return':
        falseReturn();
        break;
      case 'sound':
        soundCorridor();
        break;
      case 'edge':
        edgeOfWorld();
        break;
      case 'relay':
        relay143();
        break;
      case 'still':
        stillRoom();
        break;
      case 'walk':
        startFinalWalk();
        break;
    }
  }

  function resetV4(){
    try{
      localStorage.removeItem(KEY);
    }catch(_){}

    state=load();
    location.reload();
  }

  /* =======================================================
     BOOT
  ======================================================= */

  window.addEventListener(
    'paradox-act2-world-position',
    e=>onWorld(e.detail)
  );

  window.addEventListener(
    'paradox-act2-started',
    e=>{
      build();
      renderPermanentWorld();

      setTimeout(
        ()=>onWorld({
          state:
            e.detail?.state ||
            coreState()
        }),
        900
      );
    }
  );

  window.addEventListener(
    'paradox-act2-memory-restored',
    ()=>{
      setTimeout(()=>{
        renderPermanentWorld();
        onWorld({
          state:coreState()
        });
      },450);
    }
  );

  document.addEventListener(
    'DOMContentLoaded',
    ()=>{
      const boot=setInterval(()=>{
        if(
          window.ParadoxAct2 &&
          document.getElementById('act2Root')
        ){
          clearInterval(boot);
          build();
          renderPermanentWorld();
        }
      },300);
    }
  );

  window.ParadoxAct2WorldV4={
    gate,
    state:()=>({...state}),
    debug,
    reset:resetV4,
    openRadio,
    closeRadio
  };
})();
