/* =========================================================
   PARADOX143 — ACTO II COMPLETO
   "LO QUE OLVIDAMOS"

   Motor narrativo principal.
   - No añade cartas a la Canasta.
   - Conserva intactas las 99 cartas reales.
   - Reanuda capítulos después de recargar.
   - No usa azar para la historia principal.
   - Los fragmentos y EL ARCHIVO viven en módulos separados.
========================================================= */

(() => {
  'use strict';

  const STORY_KEY='paradox143_story_v1';
  const LETTER_KEY='paradox143_letters_v1';
  const ACT2_KEY='paradox143_act2_v1';
  const FRAGMENT_KEY='paradox143_fragments_v1';

  const CHAPTERS=[
    'awakening',
    'first-memory',
    'mewo',
    'refuge',
    'marie',
    'tuluz',
    'reconstruct',
    'finale'
  ];

  const DEFAULT={
    version:1,
    chapter:0,
    chapterName:'awakening',
    started:false,
    finished:false,
    worldX:0,
    firstTulip:false,
    mewo:false,
    refuge:false,
    marie:false,
    tuluz:false,
    reconstructionStep:0,
    exactChoices:0,
    acceptChoices:0,
    archiveSeen:false,
    finaleSeen:false,
    act3Ready:false,

    /*
      Cada capítulo tiene pequeños rastros que deben tocarse
      antes de que aparezca el recuerdo principal.
      Se guarda para poder cerrar y volver sin perder avance.
    */
    touches:{},

    /*
      Puzzles obligatorios del Acto II.
      Se guardan por capítulo para poder cerrar la página
      y volver sin perder lo resuelto.
    */
    puzzles:{},

    lastSeenAt:0
  };

  let state=loadState();
  let root=null;
  let world=null;
  let track=null;
  let objective=null;
  let objectiveLabel=null;
  let cine=null;
  let cineText=null;
  let cineMark=null;
  let cineVisual=null;
  let cineChoices=null;
  let titleCard=null;
  let titleTop=null;
  let titleMain=null;
  let titleSub=null;
  let tinyStar=null;
  let touchLayer=null;
  let brokenLine=null;

  let puzzleOverlay=null;
  let puzzleBody=null;
  let puzzleTitle=null;
  let puzzleKicker=null;
  let puzzleStatus=null;
  let puzzleOpen=false;
  let puzzleCleanup=null;

  let activeScene=null;
  let sceneIndex=0;
  let sceneLock=false;
  let dragging=false;
  let pointerStart=0;
  let worldStart=0;
  let lastMoveAt=0;
  let objectiveId='';
  let booted=false;
  let suppressed=false;

  function parse(key,fallback){
    try{
      const raw=localStorage.getItem(key);
      if(!raw) return fallback;
      const v=JSON.parse(raw);
      return v ?? fallback;
    }catch(_){
      return fallback;
    }
  }

  function story(){
    const v=parse(STORY_KEY,{});
    return v && typeof v==='object' ? v : {};
  }

  function writeStory(patch={}){
    const current=story();
    const next={...current,...patch};
    try{ localStorage.setItem(STORY_KEY,JSON.stringify(next)); }catch(_){}
    return next;
  }

  function loadState(){
    const v=parse(ACT2_KEY,{});
    const safe=v && typeof v==='object' ? v : {};
    return {...DEFAULT,...safe};
  }

  function save(patch={}){
    state={...state,...patch,lastSeenAt:Date.now()};
    state.chapterName=CHAPTERS[state.chapter]||'awakening';
    try{ localStorage.setItem(ACT2_KEY,JSON.stringify(state)); }catch(_){}
    return state;
  }

  function fragmentState(){
    const v=parse(FRAGMENT_KEY,{found:[],starSeen:false});
    return {
      found:Array.isArray(v?.found)?v.found:[],
      starSeen:Boolean(v?.starSeen)
    };
  }

  function letterCount(){
    const v=parse(LETTER_KEY,[]);
    return new Set(Array.isArray(v)?v:[]).size;
  }

  function shouldStart(){
    const s=story();
    return Boolean(
      (s.card100Seen && Number(s.act)>=2) ||
      s.phase==='awaiting-act2' ||
      state.started
    );
  }

  function emit(name,detail={}){
    try{ window.dispatchEvent(new CustomEvent(name,{detail})); }catch(_){}
  }

  function configureAct2Music(){
    /*
      ACTO II · DESPERTAR
      Silencio total al entrar.
      La música del Acto I no continúa ni vuelve como eco.
      Más adelante podremos introducir música propia del
      Acto II cuando la historia lo necesite.
    */
    const audio=
      document.getElementById(
        'bgMusic'
      );

    if(!audio) return;

    try{
      audio.pause();
      audio.volume=0;
      audio.playbackRate=1;
      audio.currentTime=0;
    }catch(_){}
  }


  /* =======================================================
     PAISAJE SONORO DEL ACTO II

     No hay música al comienzo.
     El silencio se alterna con:
     - estática de radio;
     - zumbido eléctrico;
     - barridos de frecuencia;
     - pequeños cortes de señal.

     Todo se genera con WebAudio: no requiere subir archivos.
  ======================================================= */

  const ACT2_RADIO_LINES=[
    ['¿sigues ah—',''],
    ['señal...','perdida.'],
    ['yo iba a dec—',''],
    ['me...','...wo'],
    ['la caja...','no está.'],
    ['antes de que—',''],
    ['no cierres—',''],
    ['¿mañana...?',''],
    ['algo se quedó del otr—',''],
    ['esto no era as—',''],
    ['no puedo oírte.',''],
    ['143...','...sin portadora.']
  ];

  const sound={
    ctx:null,
    master:null,
    noiseSource:null,
    noiseFilter:null,
    noiseGain:null,
    hum:null,
    humGain:null,
    initialized:false,
    timer:null,
    cycle:0
  };

  function ensureAct2Soundscape(){
    if(sound.initialized) {
      try{
        if(sound.ctx?.state==='suspended') sound.ctx.resume();
      }catch(_){}
      return true;
    }

    const AudioCtx=
      window.AudioContext ||
      window.webkitAudioContext;

    if(!AudioCtx) return false;

    try{
      const ctx=new AudioCtx();

      const master=ctx.createGain();
      master.gain.value=.82;
      master.connect(ctx.destination);

      const noiseBuffer=ctx.createBuffer(
        1,
        ctx.sampleRate*2,
        ctx.sampleRate
      );

      const data=noiseBuffer.getChannelData(0);
      for(let i=0;i<data.length;i++){
        data[i]=(Math.random()*2-1)*.86;
      }

      const noise=ctx.createBufferSource();
      noise.buffer=noiseBuffer;
      noise.loop=true;

      const noiseFilter=ctx.createBiquadFilter();
      noiseFilter.type='bandpass';
      noiseFilter.frequency.value=900;
      noiseFilter.Q.value=.8;

      const noiseGain=ctx.createGain();
      noiseGain.gain.value=0;

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(master);

      const hum=ctx.createOscillator();
      hum.type='sine';
      hum.frequency.value=48;

      const humGain=ctx.createGain();
      humGain.gain.value=0;

      hum.connect(humGain);
      humGain.connect(master);

      noise.start();
      hum.start();

      sound.ctx=ctx;
      sound.master=master;
      sound.noiseSource=noise;
      sound.noiseFilter=noiseFilter;
      sound.noiseGain=noiseGain;
      sound.hum=hum;
      sound.humGain=humGain;
      sound.initialized=true;

      if(ctx.state==='suspended'){
        ctx.resume().catch(()=>{});
      }

      setAct2SoundMode('silence');
      scheduleAct2Ambience();

      return true;
    }catch(_){
      return false;
    }
  }

  function ramp(param,value,time=.12){
    if(!param || !sound.ctx) return;

    try{
      const now=sound.ctx.currentTime;
      param.cancelScheduledValues(now);
      param.setValueAtTime(param.value,now);
      param.linearRampToValueAtTime(value,now+time);
    }catch(_){}
  }

  function setAct2SoundMode(mode='silence'){
    if(!sound.initialized) return;

    const f=sound.noiseFilter;
    const ng=sound.noiseGain?.gain;
    const hg=sound.humGain?.gain;

    if(mode==='silence'){
      ramp(ng,0,.35);
      ramp(hg,0,.35);
      return;
    }

    if(mode==='hum'){
      ramp(ng,.010,.35);
      ramp(hg,.022,.45);
      try{
        f.frequency.setTargetAtTime(
          420,
          sound.ctx.currentTime,
          .22
        );
      }catch(_){}
      return;
    }

    if(mode==='static'){
      ramp(ng,.095,.12);
      ramp(hg,.006,.2);
      try{
        f.frequency.setTargetAtTime(
          1450,
          sound.ctx.currentTime,
          .12
        );
        f.Q.setTargetAtTime(
          1.2,
          sound.ctx.currentTime,
          .12
        );
      }catch(_){}
      return;
    }

    if(mode==='radio'){
      ramp(ng,.070,.15);
      ramp(hg,.012,.2);

      try{
        const now=sound.ctx.currentTime;

        f.frequency.cancelScheduledValues(now);
        f.frequency.setValueAtTime(330,now);
        f.frequency.exponentialRampToValueAtTime(
          3600,
          now+2.8
        );
      }catch(_){}
      return;
    }

    if(mode==='archive'){
      ramp(ng,.135,.12);
      ramp(hg,.012,.18);

      try{
        f.frequency.setTargetAtTime(
          2100,
          sound.ctx.currentTime,
          .08
        );
        f.Q.setTargetAtTime(
          2.8,
          sound.ctx.currentTime,
          .08
        );
      }catch(_){}
      return;
    }
  }

  function radioBurstLine(){
    if(
      !document.body.classList.contains('act2-active') ||
      puzzleOpen ||
      sceneLock ||
      window.ParadoxAct2Archive?.isOpen?.()
    ) return;

    if(Math.random()>.48) return;

    const line=
      ACT2_RADIO_LINES[
        Math.floor(
          Math.random()*
          ACT2_RADIO_LINES.length
        )
      ];

    showBrokenLine(
      line[0],
      line[1]
    );
  }

  function scheduleAct2Ambience(){
    clearTimeout(sound.timer);

    if(!sound.initialized) return;

    sound.timer=setTimeout(
      ()=>{
        if(
          !document.body.classList.contains('act2-active')
        ){
          setAct2SoundMode('silence');
          scheduleAct2Ambience();
          return;
        }

        if(
          puzzleOpen ||
          sceneLock ||
          window.ParadoxAct2Archive?.isOpen?.()
        ){
          scheduleAct2Ambience();
          return;
        }

        /*
          Secuencia ambiental, no progresión narrativa.
          El orden cambia para que el silencio siga teniendo peso.
        */
        const modes=[
          'silence',
          'static',
          'silence',
          'hum',
          'radio',
          'silence'
        ];

        const mode=
          modes[
            sound.cycle %
            modes.length
          ];

        sound.cycle++;

        setAct2SoundMode(mode);

        if(
          mode==='static' ||
          mode==='radio'
        ){
          radioBurstLine();

          setTimeout(
            ()=>setAct2SoundMode('silence'),
            mode==='radio'
              ? 3400
              : 2200
          );
        }

        scheduleAct2Ambience();
      },
      9000+
      Math.floor(
        Math.random()*9000
      )
    );
  }

  function setPuzzleRadioTune(value,targets=[]){
    ensureAct2Soundscape();

    if(!sound.initialized) return;

    const v=Math.max(
      0,
      Math.min(
        100,
        Number(value)||0
      )
    );

    const distances=
      targets.map(
        t=>Math.abs(t-v)
      );

    const nearest=
      distances.length
        ? Math.min(...distances)
        : 100;

    const closeness=
      Math.max(
        0,
        1-(nearest/18)
      );

    const staticGain=
      .12-(closeness*.095);

    const humGain=
      .004+(closeness*.030);

    ramp(
      sound.noiseGain?.gain,
      staticGain,
      .035
    );

    ramp(
      sound.humGain?.gain,
      humGain,
      .035
    );

    try{
      sound.noiseFilter.frequency.setTargetAtTime(
        280+(v*34),
        sound.ctx.currentTime,
        .025
      );

      sound.hum.frequency.setTargetAtTime(
        52+(v*1.4),
        sound.ctx.currentTime,
        .025
      );
    }catch(_){}
  }

  function build(){
    if(root) return;

    root=document.createElement('section');
    root.id='act2Root';
    root.setAttribute('aria-hidden','true');
    root.innerHTML=`
      <div id="act2World">
        <div id="act2Sky"></div>
        <div id="act2Moon" aria-hidden="true"><i></i></div>
        <div id="act2DistantStars"></div>
        <div id="act2Horizon"></div>
        <div id="act2Track">
          <div class="act2MemoryEcho e1"></div>
          <div class="act2MemoryEcho e2"></div>
          <div class="act2MemoryEcho e3"></div>
          <div id="act2TulipGhost" aria-hidden="true"></div>
          <div id="act2RefugeGhost" aria-hidden="true">
            <div class="act2RefugeBg"></div>
            <span class="act2RefugeLamp lamp1"></span>
            <span class="act2RefugeLamp lamp2"></span>
            <span class="act2RefugeLamp lamp3"></span>
            <div id="act2MemoryBox"></div>
          </div>
          <img id="act2MewoWorld" class="act2WorldCat" src="mewo_idle.png" alt="">
          <img id="act2MarieWorld" class="act2WorldCat" src="cat_gray_idle.png" alt="">
          <img id="act2TuluzWorld" class="act2WorldCat" src="cat_orange_idle.png" alt="">
          <div id="act2MemoryGap"></div>
          <div id="act2FutureGap"></div>
        </div>
        <div id="act2Ground"></div>
        <div id="act2Fog"></div>
        <button id="act2Objective" type="button" aria-label="Seguir el recuerdo">
          <span id="act2ObjectiveCore"></span>
          <small id="act2ObjectiveLabel"></small>
        </button>
        <button id="act2SecretStar" type="button" aria-label="Una estrella pequeña">✦</button>

        <div id="act2TouchLayer" aria-label="Rastros que el mundo todavía no entiende"></div>

        <div id="act2BrokenLine" aria-live="polite">
          <span></span>
          <small></small>
        </div>

        <div id="act2WalkHint">arrastra el campo</div>
      </div>

      <div id="act2TitleCard">
        <small id="act2TitleTop">ACTO II</small>
        <h1 id="act2TitleMain">LO QUE OLVIDAMOS</h1>
        <p id="act2TitleSub"></p>
      </div>

      <div id="act2Puzzle" aria-hidden="true">
        <div id="act2PuzzleStatic"></div>

        <section id="act2PuzzlePanel">
          <header>
            <div>
              <small id="act2PuzzleKicker">SEÑAL INCOMPLETA</small>
              <strong id="act2PuzzleTitle">...</strong>
            </div>

            <button id="act2PuzzleClose" type="button" aria-label="Volver al campo">×</button>
          </header>

          <div id="act2PuzzleBody"></div>

          <div id="act2PuzzleStatus">
            <span></span>
            <small></small>
          </div>
        </section>
      </div>

      <div id="act2Cine" aria-hidden="true">
        <div id="act2CineShade"></div>
        <div id="act2CineVisual">
          <div id="act2CineMark">·</div>
          <div id="act2CineMemory"></div>
          <img id="act2CineCatA" class="act2CineCat" alt="">
          <img id="act2CineCatB" class="act2CineCat" alt="">
          <img id="act2CineCatC" class="act2CineCat" alt="">
        </div>
        <div id="act2CineWords">
          <p id="act2CineText"></p>
          <small id="act2CineTap">toca para continuar</small>
        </div>
        <div id="act2CineChoices"></div>
      </div>

      <div id="act2ActEnd">
        <small>ACTO III</small>
        <h2>LO QUE TODAVÍA NOS FALTA VIVIR</h2>
        <p>El mundo ya no está intentando volver atrás.</p>
        <button id="act2ActEndBtn" type="button">continuar ♡</button>
      </div>
    `;

    document.body.appendChild(root);

    world=root.querySelector('#act2World');
    track=root.querySelector('#act2Track');
    objective=root.querySelector('#act2Objective');
    objectiveLabel=root.querySelector('#act2ObjectiveLabel');
    cine=root.querySelector('#act2Cine');
    cineText=root.querySelector('#act2CineText');
    cineMark=root.querySelector('#act2CineMark');
    cineVisual=root.querySelector('#act2CineVisual');
    cineChoices=root.querySelector('#act2CineChoices');
    titleCard=root.querySelector('#act2TitleCard');
    titleTop=root.querySelector('#act2TitleTop');
    titleMain=root.querySelector('#act2TitleMain');
    titleSub=root.querySelector('#act2TitleSub');
    tinyStar=root.querySelector('#act2SecretStar');
    touchLayer=root.querySelector('#act2TouchLayer');
    brokenLine=root.querySelector('#act2BrokenLine');

    puzzleOverlay=root.querySelector('#act2Puzzle');
    puzzleBody=root.querySelector('#act2PuzzleBody');
    puzzleTitle=root.querySelector('#act2PuzzleTitle');
    puzzleKicker=root.querySelector('#act2PuzzleKicker');
    puzzleStatus=root.querySelector('#act2PuzzleStatus');

    root.querySelector('#act2PuzzleClose')?.addEventListener('click',closePuzzle);

    objective.addEventListener('click',onObjective);
    tinyStar.addEventListener('click',onSecretStar);
    root.querySelector('#act2ActEndBtn').addEventListener('click',()=>{
      save({act3Ready:true});
      writeStory({act:3,phase:'awaiting-act3',act2Finished:true});
      emit('paradox-act2-finished',{act:3});
      if(window.ParadoxAct3?.activate){
        root.querySelector('#act2ActEnd').classList.remove('show');
        root.classList.add('act2-awaiting-act3');
        window.ParadoxAct3.activate();
      }else{
        const p=root.querySelector('#act2ActEnd p');
        const b=root.querySelector('#act2ActEndBtn');
        if(p) p.textContent='Acto II completo. El Acto III se conectará aquí en la siguiente construcción DEV.';
        if(b){ b.textContent='fin del Acto II ♡'; b.disabled=true; }
      }
    });

    bindWalking();
    bindCineAdvance();

    root.addEventListener(
      'pointerdown',
      ()=>{
        ensureAct2Soundscape();
      },
      {capture:true}
    );
  }

  function activate(){
    if(booted) return;
    booted=true;
    build();

    save({started:true});
    writeStory({act:2,phase:'act2',act2Started:true});

    document.body.classList.remove('intro-active');
    document.body.classList.add('act2-active');

    configureAct2Music();

    const intro=document.getElementById('intro');
    if(intro) intro.style.display='none';

    root.classList.add('show');
    root.setAttribute('aria-hidden','false');

    normalizeChapterFromFlags();
    renderWorld();

    if(state.chapter===0 && !state.awakeningShown){
      setTimeout(()=>showTitle('ACTO II','LO QUE OLVIDAMOS','Este no es un mundo que recuerda todo.'),550);
      setTimeout(()=>{
        save({awakeningShown:true});
        playScene(SCENES.awakening,{onDone:()=>setObjectiveForChapter()});
      },4300);
    }else{
      setTimeout(setObjectiveForChapter,600);
    }

    setTimeout(()=>{
      root.querySelector('#act2WalkHint')?.classList.add('show');
      setTimeout(()=>root.querySelector('#act2WalkHint')?.classList.remove('show'),4200);
    },5200);

    emit('paradox-act2-started',{state:{...state}});
  }

  function normalizeChapterFromFlags(){
    let ch=state.chapter;
    if(state.firstTulip) ch=Math.max(ch,2);
    if(state.mewo) ch=Math.max(ch,3);
    if(state.refuge) ch=Math.max(ch,4);
    if(state.marie) ch=Math.max(ch,5);
    if(state.tuluz) ch=Math.max(ch,6);
    if(state.reconstructionStep>=5 || state.archiveSeen) ch=Math.max(ch,7);
    if(state.finished) ch=7;
    if(ch!==state.chapter) save({chapter:ch});
  }

  function showTitle(top,main,sub=''){
    build();
    titleTop.textContent=top;
    titleMain.textContent=main;
    titleSub.textContent=sub;
    titleCard.classList.add('show');
    setTimeout(()=>titleCard.classList.remove('show'),3200);
  }


  /* =======================================================
     EXPLORACIÓN DEL ACTO II

     La historia principal no aparece inmediatamente.
     Primero hay que tocar todos los rastros de cada zona.
     No son coleccionables, no tienen contador y no usan azar.
  ======================================================= */

  const TOUCH_PHASES={
    0:[
      {id:'moon-piece',x:-610,y:28,mark:'◐',label:'algo de la luna',line:'lu...',sub:'no.'},
      {id:'basket-shadow',x:-390,y:62,mark:'◇',label:'una forma vacía',line:'había algo aquí.',sub:'¿qué guardaba?'},
      {id:'cold-pillow',x:-155,y:70,mark:'zZ',label:'algo blando',line:'alguien dormía...',sub:'...'},
      {id:'dead-light',x:95,y:42,mark:'·',label:'una luz apagada',line:'no enciende.',sub:'antes sí.'},
      {id:'paw-half',x:330,y:67,mark:'🐾',label:'media huella',line:'me...',sub:'no puedo terminarlo.'},
      {id:'rain-mark',x:545,y:75,mark:'◇',label:'una marca húmeda',line:'llovió.',sub:'¿cuándo?'},
      {id:'torn-promise',x:760,y:52,mark:'♡',label:'unas palabras incompletas',line:'te amaré un día m—',sub:'la frase se corta.'},
      {id:'silent-bell',x:-760,y:44,mark:'○',label:'algo que debería sonar',line:'...',sub:'no hace ningún sonido.'},
      {id:'lost-number',x:870,y:36,mark:'#',label:'un número incompleto',line:'1...4...3...',sub:'después solo hay estática.'}
    ],

    1:[
      {id:'pink',x:210,y:62,mark:'·',label:'un poco de color',line:'rosa.',sub:'eso sí.'},
      {id:'stem',x:325,y:70,mark:'│',label:'una línea verde',line:'debajo había...',sub:'algo que crecía.'},
      {id:'petal',x:445,y:55,mark:'✿',label:'un borde de pétalo',line:'faltan partes.',sub:'pero reconozco la forma.'},
      {id:'soil',x:555,y:76,mark:'·',label:'tierra removida',line:'aquí.',sub:'era aquí.'},
      {id:'dew',x:670,y:66,mark:'◇',label:'una gotita inmóvil',line:'todavía tiene agua.',sub:'no sabe de qué lluvia.'},
      {id:'warm-pink',x:90,y:49,mark:'♡',label:'un color que se niega a apagarse',line:'esto sí recuerda.',sub:'sin saber por qué.'}
    ],

    2:[
      {id:'paw1',x:330,y:68,mark:'🐾',label:'una huellita',line:'una.',sub:''},
      {id:'paw2',x:455,y:61,mark:'🐾',label:'otra huellita',line:'otra.',sub:'van hacia adelante.'},
      {id:'warmth',x:580,y:72,mark:'·',label:'un lugar tibio',line:'todavía está tibio.',sub:'pero no hay nadie.'},
      {id:'name',x:735,y:47,mark:'?',label:'algo que parece un nombre',line:'me...',sub:'...wo?'},
      {id:'toy-shadow',x:80,y:72,mark:'●',label:'la sombra de un juguete',line:'rodaba.',sub:'alguien lo perseguía.'},
      {id:'sleep-mark',x:870,y:58,mark:'zZ',label:'un lugar donde alguien dormía',line:'se quedaba aquí.',sub:'creo.'}
    ],

    3:[
      {id:'tree',x:-390,y:39,mark:'⌁',label:'una sombra alta',line:'esto era más alto.',sub:'mucho más.'},
      {id:'lamp',x:-255,y:49,mark:'✦',label:'una luz sin brillo',line:'una lucecita.',sub:'no recuerda cómo encender.'},
      {id:'pillow',x:-110,y:72,mark:'zZ',label:'una almohadita fuera de lugar',line:'demasiado lejos.',sub:'alguien la movía antes.'},
      {id:'box',x:35,y:68,mark:'□',label:'una cajita cerrada',line:'cerrada.',sub:'hay algo dentro.'},
      {id:'home',x:190,y:55,mark:'⌂',label:'la forma de un lugar',line:'hog...',sub:'la palabra no llega.'},
      {id:'water-shadow',x:330,y:70,mark:'◇',label:'un cuenco sin reflejo',line:'había agua.',sub:'para alguien.'},
      {id:'scratch-sound',x:470,y:42,mark:'///',label:'marcas en algo que ya no está',line:'ras...',sub:'...guños.'}
    ],

    4:[
      {id:'wrong-gray',x:-60,y:54,mark:'?',label:'una silueta gris',line:'gris.',sub:'no.'},
      {id:'wrong-eyes',x:70,y:61,mark:'?',label:'unos ojos incorrectos',line:'los ojos...',sub:'no eran así.'},
      {id:'quiet-voice',x:205,y:43,mark:'·',label:'una voz sin palabras',line:'...',sub:'casi escuché algo.'},
      {id:'chosen-place',x:340,y:68,mark:'☾',label:'un rincón conocido',line:'alguien elegía este rincón.',sub:'eso sí lo recuerda.'},
      {id:'soft-step',x:510,y:63,mark:'·',label:'un paso muy suave',line:'no corría.',sub:'se acercaba despacio.'},
      {id:'gray-thread',x:-210,y:70,mark:'≈',label:'un hilo gris',line:'esto pertenece a...',sub:'la frase se pierde.'}
    ],

    5:[
      {id:'search-rain',x:-540,y:53,mark:'◇',label:'buscar en la lluvia',line:'no.',sub:'aquí no.'},
      {id:'search-box',x:-300,y:69,mark:'□',label:'buscar en la caja',line:'no.',sub:'tampoco.'},
      {id:'search-cards',x:-30,y:46,mark:'♡',label:'buscar entre cartas',line:'no.',sub:'ninguna es anterior.'},
      {id:'search-field',x:270,y:72,mark:'✿',label:'buscar en el campo',line:'no.',sub:'sigue sin estar.'},
      {id:'search-backward',x:545,y:48,mark:'↺',label:'buscar todavía más atrás',line:'aquí tampoco.',sub:'quizá el error es mirar hacia atrás.'},
      {id:'search-moon',x:700,y:29,mark:'☾',label:'buscar en una noche anterior',line:'ninguna huella.',sub:'todavía no.'},
      {id:'search-name',x:835,y:61,mark:'?',label:'buscar un nombre antes de existir',line:'TUL...',sub:'SOURCE DATE: —'}
    ]
  };

  function touchedFor(ch=state.chapter){
    const all=
      state.touches &&
      typeof state.touches==='object'
        ? state.touches
        : {};

    const arr=all[String(ch)] ?? all[ch];

    return Array.isArray(arr)
      ? arr
      : [];
  }

  function touchPhaseDone(ch=state.chapter){
    const phase=TOUCH_PHASES[ch];

    if(!Array.isArray(phase) || !phase.length){
      return true;
    }

    const touched=new Set(touchedFor(ch));

    return phase.every(
      item=>touched.has(item.id)
    );
  }

  function saveTouch(ch,id){
    const all={
      ...(
        state.touches &&
        typeof state.touches==='object'
          ? state.touches
          : {}
      )
    };

    const key=String(ch);
    const current=
      Array.isArray(all[key])
        ? [...all[key]]
        : [];

    if(!current.includes(id)){
      current.push(id);
    }

    all[key]=current;
    save({touches:all});
  }

  function showBrokenLine(text='',sub=''){
    if(!brokenLine) return;

    const main=brokenLine.querySelector('span');
    const small=brokenLine.querySelector('small');

    if(main) main.textContent=text;
    if(small) small.textContent=sub;

    brokenLine.classList.remove('show');
    void brokenLine.offsetWidth;
    brokenLine.classList.add('show');

    clearTimeout(showBrokenLine.timer);

    showBrokenLine.timer=setTimeout(
      ()=>{
        brokenLine?.classList.remove('show');
      },
      1950
    );
  }

  function renderTouchPoints(){
    if(!touchLayer) return;

    touchLayer.innerHTML='';

    const phase=TOUCH_PHASES[state.chapter];

    if(
      !Array.isArray(phase) ||
      !phase.length ||
      touchPhaseDone(state.chapter) ||
      sceneLock ||
      suppressed ||
      puzzleOpen ||
      cine?.classList.contains('show') ||
      window.ParadoxAct2Archive?.isOpen?.()
    ){
      touchLayer.classList.remove('show');
      return;
    }

    const touched=new Set(
      touchedFor(state.chapter)
    );

    phase.forEach(item=>{
      if(touched.has(item.id)) return;

      const b=document.createElement('button');
      b.type='button';
      b.className='act2TouchPoint';
      b.dataset.id=item.id;
      b.setAttribute('aria-label',item.label||'Un rastro');
      b.style.left=
        `calc(50% + ${item.x-state.worldX}px)`;
      b.style.top=`${item.y}%`;

      b.innerHTML=`
        <span>${item.mark||'·'}</span>
        <i></i>
      `;

      b.addEventListener(
        'click',
        e=>{
          e.stopPropagation();

          if(
            sceneLock ||
            suppressed
          ) return;

          saveTouch(
            state.chapter,
            item.id
          );

          showBrokenLine(
            item.line||'...',
            item.sub||''
          );

          b.classList.add('touched');

          setTimeout(
            ()=>{
              renderTouchPoints();

              if(
                touchPhaseDone(
                  state.chapter
                )
              ){
                root?.classList.add(
                  'act2-touch-complete'
                );

                showBrokenLine(
                  '...',
                  'algo recuerda suficiente.'
                );

                setTimeout(
                  ()=>{
                    root?.classList.remove(
                      'act2-touch-complete'
                    );

                    setObjectiveForChapter();
                  },
                  1450
                );
              }
            },
            360
          );
        }
      );

      touchLayer.appendChild(b);
    });

    touchLayer.classList.add('show');
  }


  /* =======================================================
     PUZZLES OBLIGATORIOS DEL ACTO II

     Flujo de cada capítulo:
       explorar rastros
       → resolver puzzle
       → cinematográfica principal

     No hay contador de rastros ni de puzzles.
  ======================================================= */

  const PUZZLE_META={
    0:{
      kicker:'RECEPTOR SIN PORTADORA',
      title:'ENCUENTRA LAS VOCES QUE QUEDARON',
      x:20
    },

    1:{
      kicker:'MEMORIA VEGETAL / INCOMPLETA',
      title:'RECONSTRUYE LO PRIMERO QUE CRECIÓ',
      x:355
    },

    2:{
      kicker:'PATRÓN DE MOVIMIENTO',
      title:'SIGUE LAS HUELLAS',
      x:630
    },

    3:{
      kicker:'CIRCUITO DEL REFUGIO',
      title:'DEVUELVE LA SEÑAL A LAS LUCES',
      x:-95
    },

    4:{
      kicker:'MEMORIA INESTABLE',
      title:'DESCARTA LO QUE CAMBIA',
      x:165
    },

    5:{
      kicker:'LÍNEA TEMPORAL',
      title:'BUSCA DONDE EL ARCHIVO NO QUIERE MIRAR',
      x:600
    },

    6:{
      kicker:'RECONSTRUCCIÓN',
      title:'SEPARA RECUERDO DE COPIA',
      x:40
    },

    7:{
      kicker:'ESPACIO SIN FUENTE',
      title:'DECIDE QUÉ HACER CON LO QUE FALTA',
      x:0
    }
  };

  function puzzleDone(ch=state.chapter){
    const all=
      state.puzzles &&
      typeof state.puzzles==='object'
        ? state.puzzles
        : {};

    return Boolean(
      all[String(ch)] ??
      all[ch]
    );
  }

  function markPuzzleDone(ch){
    const all={
      ...(
        state.puzzles &&
        typeof state.puzzles==='object'
          ? state.puzzles
          : {}
      )
    };

    all[String(ch)]=true;

    save({
      puzzles:all
    });
  }

  function setPuzzleStatus(main='',sub=''){
    if(!puzzleStatus) return;

    const a=
      puzzleStatus.querySelector('span');

    const b=
      puzzleStatus.querySelector('small');

    if(a) a.textContent=main;
    if(b) b.textContent=sub;

    puzzleStatus.classList.remove('pulse');
    void puzzleStatus.offsetWidth;
    puzzleStatus.classList.add('pulse');
  }

  function closePuzzle(){
    if(!puzzleOpen) return;

    try{
      puzzleCleanup?.();
    }catch(_){}

    puzzleCleanup=null;
    puzzleOpen=false;

    puzzleOverlay?.classList.remove('show');
    puzzleOverlay?.setAttribute(
      'aria-hidden',
      'true'
    );

    document.body.classList.remove(
      'act2-puzzle-open'
    );

    if(puzzleBody){
      puzzleBody.innerHTML='';
    }

    setAct2SoundMode('silence');

    setTimeout(
      setObjectiveForChapter,
      350
    );
  }

  function completePuzzle(ch,line='algo encaja.',sub=''){
    if(!puzzleOpen) return;

    markPuzzleDone(ch);

    setPuzzleStatus(
      line,
      sub
    );

    puzzleOverlay?.classList.add(
      'solved'
    );

    setAct2SoundMode('silence');

    setTimeout(
      ()=>{
        puzzleOverlay?.classList.remove(
          'solved'
        );

        closePuzzle();

        showBrokenLine(
          line,
          sub
        );

        setTimeout(
          setObjectiveForChapter,
          900
        );
      },
      1050
    );
  }

  function openPuzzle(ch){
    if(
      puzzleOpen ||
      puzzleDone(ch)
    ) return;

    ensureAct2Soundscape();

    puzzleOpen=true;

    clearObjective();

    document.body.classList.add(
      'act2-puzzle-open'
    );

    puzzleOverlay?.classList.add(
      'show'
    );

    puzzleOverlay?.setAttribute(
      'aria-hidden',
      'false'
    );

    const meta=
      PUZZLE_META[ch] ||
      {
        kicker:'SEÑAL',
        title:'...'
      };

    if(puzzleKicker){
      puzzleKicker.textContent=
        meta.kicker;
    }

    if(puzzleTitle){
      puzzleTitle.textContent=
        meta.title;
    }

    if(puzzleBody){
      puzzleBody.innerHTML='';
    }

    setPuzzleStatus(
      '',
      ''
    );

    setAct2SoundMode(
      ch===0 || ch===5
        ? 'static'
        : 'hum'
    );

    switch(ch){
      case 0:
        buildRadioPuzzle(ch);
        break;

      case 1:
        buildTulipPuzzle(ch);
        break;

      case 2:
        buildEchoPuzzle(ch);
        break;

      case 3:
        buildRefugeCircuitPuzzle(ch);
        break;

      case 4:
        buildMarieMemoryPuzzle(ch);
        break;

      case 5:
        buildTuluzTimelinePuzzle(ch);
        break;

      case 6:
        buildMemoryWeavePuzzle(ch);
        break;

      case 7:
        buildEmptyGapPuzzle(ch);
        break;

      default:
        completePuzzle(
          ch,
          '...',
          ''
        );
    }
  }

  /* -------------------------------------------------------
     PUZZLE 0 — RADIO SIN SEÑAL
  ------------------------------------------------------- */

  function buildRadioPuzzle(ch){
    const targets=[18,51,84];
    const messages=[
      ['¿sigues ah—',''],
      ['me...','...wo'],
      ['te amaré un día m—','']
    ];

    const found=new Set();

    puzzleBody.innerHTML=`
      <div class="act2RadioPuzzle">
        <div class="act2RadioDisplay">
          <span id="act2RadioFreq">000.0</span>
          <small id="act2RadioCarrier">NO SIGNAL</small>
        </div>

        <div class="act2RadioSlots">
          <i></i><i></i><i></i>
        </div>

        <input
          id="act2RadioDial"
          type="range"
          min="0"
          max="100"
          value="2"
          step="1"
          aria-label="Sintonizar frecuencia"
        >

        <button
          id="act2RadioCapture"
          type="button"
        >
          CAPTURAR SEÑAL
        </button>

        <p>
          No busca una canción.<br>
          Busca algo que todavía esté intentando hablar.
        </p>
      </div>
    `;

    const dial=
      puzzleBody.querySelector(
        '#act2RadioDial'
      );

    const freq=
      puzzleBody.querySelector(
        '#act2RadioFreq'
      );

    const carrier=
      puzzleBody.querySelector(
        '#act2RadioCarrier'
      );

    const slots=[
      ...puzzleBody.querySelectorAll(
        '.act2RadioSlots i'
      )
    ];

    const capture=
      puzzleBody.querySelector(
        '#act2RadioCapture'
      );

    const update=()=>{
      const v=
        Number(dial.value);

      freq.textContent=
        String(
          (88+(v*.55)).toFixed(1)
        );

      setPuzzleRadioTune(
        v,
        targets.filter(
          (_,i)=>!found.has(i)
        )
      );

      const remaining=
        targets.filter(
          (_,i)=>!found.has(i)
        );

      const nearest=
        remaining.length
          ? Math.min(
              ...remaining.map(
                t=>Math.abs(t-v)
              )
            )
          : 999;

      carrier.textContent=
        found.size>=targets.length
          ? 'LOCKED'
          : nearest<=4
            ? 'CARRIER?'
            : nearest<=10
              ? '...'
              : 'NO SIGNAL';
    };

    const lockStation=()=>{
      const v=Number(dial.value);

      let best=-1;
      let distance=999;

      targets.forEach(
        (target,i)=>{
          if(found.has(i)) return;

          const d=
            Math.abs(
              target-v
            );

          if(d<distance){
            distance=d;
            best=i;
          }
        }
      );

      if(
        best>=0 &&
        distance<=4
      ){
        found.add(best);

        slots[best]?.classList.add(
          'found'
        );

        setPuzzleStatus(
          messages[best][0],
          messages[best][1]
        );

        setAct2SoundMode(
          'hum'
        );

        setTimeout(
          ()=>setAct2SoundMode('static'),
          620
        );

        if(found.size>=targets.length){
          capture.disabled=true;

          setTimeout(
            ()=>completePuzzle(
              ch,
              'tres voces.',
              'ninguna consigue terminar la frase.'
            ),
            850
          );
        }else{
          setTimeout(
            ()=>{
              carrier.textContent=
                'BUSCA OTRA';
              update();
            },
            520
          );
        }
      }else{
        setPuzzleStatus(
          '...',
          'solo estática.'
        );
      }
    };

    dial.addEventListener(
      'input',
      update
    );

    dial.addEventListener(
      'change',
      lockStation
    );

    capture?.addEventListener(
      'click',
      lockStation
    );

    update();

    puzzleCleanup=()=>{
      setAct2SoundMode('silence');
    };
  }

  /* -------------------------------------------------------
     PUZZLE 1 — TULIPÁN
  ------------------------------------------------------- */

  function buildTulipPuzzle(ch){
    const order=[
      'soil',
      'stem',
      'petal',
      'color'
    ];

    const labels={
      soil:['·','TIERRA'],
      stem:['│','TALLO'],
      petal:['✿','PÉTALO'],
      color:['♡','COLOR']
    };

    let step=0;
    let failures=0;
    let solved=false;

    puzzleBody.innerHTML=`
      <div class="act2TulipPuzzle">
        <div class="act2TulipGhostPuzzle">
          <span class="soil"></span>
          <span class="stem"></span>
          <span class="petal"></span>
          <span class="color"></span>
        </div>

        <div class="act2PuzzlePieces"></div>

        <p>
          El mundo recuerda las partes.<br>
          No recuerda qué apareció primero.
        </p>
      </div>
    `;

    const pieces=
      puzzleBody.querySelector(
        '.act2PuzzlePieces'
      );

    ['petal','soil','color','stem']
      .forEach(id=>{
        const b=
          document.createElement(
            'button'
          );

        b.type='button';
        b.dataset.part=id;
        b.setAttribute(
          'aria-label',
          `Parte: ${labels[id][1]}`
        );

        b.innerHTML=`
          <strong>${labels[id][0]}</strong>
          <small>${labels[id][1]}</small>
        `;

        b.addEventListener(
          'click',
          ()=>{
            if(solved) return;

            if(
              order[step]===id
            ){
              b.disabled=true;
              b.classList.add(
                'correct'
              );

              puzzleBody
                .querySelector(
                  `.act2TulipGhostPuzzle .${id}`
                )
                ?.classList.add(
                  'show'
                );

              step++;

              const lines=[
                ['debajo.','primero algo sostuvo lo demás.'],
                ['después subió.',''],
                ['luego tomó forma.',''],
                ['y al final...','volvió el rosa.']
              ];

              setPuzzleStatus(
                lines[step-1][0],
                lines[step-1][1]
              );

              if(step>=order.length){
                solved=true;

                puzzleBody
                  .querySelectorAll(
                    '.act2PuzzlePieces button'
                  )
                  .forEach(btn=>{
                    btn.disabled=true;
                  });

                setTimeout(
                  ()=>completePuzzle(
                    ch,
                    'ya sé cómo empezaba.',
                    ''
                  ),
                  700
                );
              }
            }else{
              failures++;

              setPuzzleStatus(
                'no.',
                failures>=2
                  ? 'estás intentando recordar el final antes del principio.'
                  : 'esa parte todavía no podía existir.'
              );

              puzzleBody.classList.add(
                'wrong'
              );

              setTimeout(
                ()=>puzzleBody.classList.remove(
                  'wrong'
                ),
                320
              );
            }
          }
        );

        pieces.appendChild(b);
      });

    puzzleCleanup=()=>{};
  }

  /* -------------------------------------------------------
     PUZZLE 2 — ECO DE HUELLAS
  ------------------------------------------------------- */

  function buildEchoPuzzle(ch){
    const rounds=[
      [0,2,1],
      [3,1,0,2],
      [1,3,0,2,1]
    ];

    let round=0;
    let input=[];
    let locked=true;
    let flashing=false;

    puzzleBody.innerHTML=`
      <div class="act2EchoPuzzle">
        <div class="act2PawGrid">
          <button data-pad="0" type="button" aria-label="Huella arriba izquierda">🐾</button>
          <button data-pad="1" type="button" aria-label="Huella arriba derecha">🐾</button>
          <button data-pad="2" type="button" aria-label="Huella abajo izquierda">🐾</button>
          <button data-pad="3" type="button" aria-label="Huella abajo derecha">🐾</button>
        </div>

        <button
          id="act2PawReplay"
          type="button"
          aria-label="Repetir patrón"
        >
          ↺ repetir patrón
        </button>

        <p>
          Las huellas no forman un camino.<br>
          Forman un ritmo.
        </p>
      </div>
    `;

    const wrapper=
      puzzleBody.querySelector(
        '.act2EchoPuzzle'
      );

    const pads=[
      ...puzzleBody.querySelectorAll(
        '[data-pad]'
      )
    ];

    const replayButton=
      puzzleBody.querySelector(
        '#act2PawReplay'
      );

    const setReady=ready=>{
      locked=!ready;

      wrapper?.classList.toggle(
        'ready',
        ready
      );

      wrapper?.classList.toggle(
        'listening',
        !ready
      );

      pads.forEach(
        b=>{
          b.setAttribute(
            'aria-disabled',
            String(!ready)
          );
        }
      );

      if(replayButton){
        replayButton.disabled=
          !ready;
      }
    };

    const flash=async(sequence)=>{
      if(flashing) return;

      flashing=true;
      input=[];

      setReady(false);

      setPuzzleStatus(
        'escucha.',
        'primero mira el patrón; después podrás tocar.'
      );

      await wait(650);

      for(const idx of sequence){
        const pad=pads[idx];

        pad?.classList.add(
          'echo'
        );

        setAct2SoundMode('hum');

        await wait(430);

        pad?.classList.remove(
          'echo'
        );

        setAct2SoundMode('silence');

        await wait(280);
      }

      flashing=false;
      setReady(true);

      setPuzzleStatus(
        'ahora tú.',
        'toca las huellas en el mismo orden.'
      );
    };

    const replay=()=>{
      if(flashing) return;

      flash(
        rounds[round]
      );
    };

    replayButton?.addEventListener(
      'click',
      ()=>{
        if(!locked){
          replay();
        }
      }
    );

    pads.forEach(
      (b,idx)=>{
        b.addEventListener(
          'pointerdown',
          ()=>{
            b.classList.add(
              'pressed'
            );
          }
        );

        b.addEventListener(
          'pointerup',
          ()=>{
            setTimeout(
              ()=>b.classList.remove(
                'pressed'
              ),
              120
            );
          }
        );

        b.addEventListener(
          'click',
          ()=>{
            /*
              Antes el click se ignoraba silenciosamente mientras
              decía "escucha.", y parecía que el puzzle estaba roto.
              Ahora responde claramente.
            */
            if(locked){
              setPuzzleStatus(
                'todavía no.',
                'espera a que termine el patrón y aparezca “ahora tú”.'
              );

              return;
            }

            b.classList.add(
              'chosen'
            );

            setTimeout(
              ()=>b.classList.remove(
                'chosen'
              ),
              220
            );

            input.push(idx);

            const expected=
              rounds[round][
                input.length-1
              ];

            if(idx!==expected){
              setReady(false);

              setPuzzleStatus(
                'la huella se corta.',
                'te lo mostraré otra vez.'
              );

              setAct2SoundMode(
                'static'
              );

              wrapper?.classList.add(
                'wrong'
              );

              setTimeout(
                ()=>{
                  wrapper?.classList.remove(
                    'wrong'
                  );

                  setAct2SoundMode(
                    'silence'
                  );

                  flashing=false;
                  replay();
                },
                900
              );

              return;
            }

            setPuzzleStatus(
              `${input.length}…`,
              'sigue.'
            );

            if(
              input.length>=
              rounds[round].length
            ){
              round++;

              if(
                round>=rounds.length
              ){
                setReady(false);

                setPuzzleStatus(
                  'ahí estás.',
                  'algo respondió desde adelante.'
                );

                setTimeout(
                  ()=>completePuzzle(
                    ch,
                    'las huellas ya no están solas.',
                    ''
                  ),
                  850
                );
              }else{
                setReady(false);

                setPuzzleStatus(
                  'bien.',
                  'escucha el siguiente patrón.'
                );

                setTimeout(
                  ()=>{
                    flashing=false;
                    replay();
                  },
                  1000
                );
              }
            }
          }
        );
      }
    );

    /*
      Marcamos explícitamente el estado inicial para que visualmente
      se entienda que primero es demostración y luego interacción.
    */
    setReady(false);
    replay();

    puzzleCleanup=()=>{
      locked=true;
      flashing=false;

      setAct2SoundMode(
        'silence'
      );
    };
  }

  /* -------------------------------------------------------
     PUZZLE 3 — CIRCUITO DEL REFUGIO
  ------------------------------------------------------- */

  function buildRefugeCircuitPuzzle(ch){
    const path=[
      0,1,4,7,8
    ];

    let index=0;
    let solved=false;

    puzzleBody.innerHTML=`
      <div class="act2CircuitPuzzle">
        <div class="act2CircuitGrid"></div>

        <div class="act2CircuitLegend">
          <span>FUENTE</span>
          <span>LUZ</span>
        </div>

        <button
          id="act2CircuitReset"
          type="button"
        >
          ↺ reiniciar corriente
        </button>

        <p>
          La energía todavía conoce una ruta.<br>
          Las demás parecen copias muertas.
        </p>
      </div>
    `;

    const grid=
      puzzleBody.querySelector(
        '.act2CircuitGrid'
      );

    for(let i=0;i<9;i++){
      const b=
        document.createElement(
          'button'
        );

      b.type='button';
      b.dataset.node=String(i);

      if(i===path[0]){
        b.classList.add(
          'source'
        );
      }

      if(i===path[path.length-1]){
        b.classList.add(
          'target'
        );
      }

      if(path.includes(i)){
        b.classList.add(
          'memory-node'
        );
      }

      b.addEventListener(
        'click',
        ()=>{
          const expected=
            path[index];

          if(i===expected){
            b.classList.add(
              'active'
            );

            index++;

            setPuzzleStatus(
              index===1
                ? 'hay corriente.'
                : 'sigue.',
              ''
            );

            setAct2SoundMode(
              'hum'
            );

            if(
              index>=path.length
            ){
              solved=true;

              puzzleBody.classList.add(
                'circuit-complete'
              );

              grid
                .querySelectorAll('button')
                .forEach(btn=>{
                  btn.disabled=true;
                });

              setTimeout(
                ()=>completePuzzle(
                  ch,
                  'una luz vuelve.',
                  'después otra.'
                ),
                850
              );
            }
          }else{
            setPuzzleStatus(
              'sin corriente.',
              'esa ruta no recuerda nada.'
            );

            puzzleBody.classList.add(
              'wrong'
            );

            setTimeout(
              ()=>puzzleBody.classList.remove(
                'wrong'
              ),
              320
            );
          }
        }
      );

      grid.appendChild(b);
    }

    puzzleBody
      .querySelector(
        '#act2CircuitReset'
      )
      ?.addEventListener(
        'click',
        ()=>{
          if(solved) return;

          index=0;

          grid
            .querySelectorAll('button')
            .forEach(btn=>{
              btn.classList.remove(
                'active'
              );
            });

          setPuzzleStatus(
            'otra vez.',
            'empieza desde FUENTE.'
          );

          setAct2SoundMode(
            'silence'
          );
        }
      );

    puzzleCleanup=()=>{};
  }

  /* -------------------------------------------------------
     PUZZLE 4 — MARIE
  ------------------------------------------------------- */

  function buildMarieMemoryPuzzle(ch){
    const rounds=[
      {
        q:'El lugar cambia. ¿Qué permanece?',
        answers:[
          ['distancia exacta del árbol',false],
          ['el rincón que eligió',true],
          ['la posición de cada flor',false]
        ]
      },
      {
        q:'La silueta falla. ¿Qué vuelve una y otra vez?',
        answers:[
          ['gris',true],
          ['naranja',false],
          ['rosa',false]
        ]
      },
      {
        q:'La voz llega cortada. ¿Qué sensación no cambia?',
        answers:[
          ['ruido',false],
          ['calma',true],
          ['prisa',false]
        ]
      }
    ];

    let round=0;
    let locked=false;

    puzzleBody.innerHTML=`
      <div class="act2MariePuzzle">
        <div id="act2MariePrompt"></div>

        <div class="act2MarieProgress">
          <i></i><i></i><i></i>
        </div>

        <div id="act2MarieAnswers"></div>
      </div>
    `;

    const prompt=
      puzzleBody.querySelector(
        '#act2MariePrompt'
      );

    const answers=
      puzzleBody.querySelector(
        '#act2MarieAnswers'
      );

    const progressDots=[
      ...puzzleBody.querySelectorAll(
        '.act2MarieProgress i'
      )
    ];

    const render=()=>{
      locked=false;

      const data=rounds[round];

      prompt.textContent=data.q;
      answers.innerHTML='';

      progressDots.forEach(
        (dot,i)=>{
          dot.classList.toggle(
            'done',
            i<round
          );

          dot.classList.toggle(
            'current',
            i===round
          );
        }
      );

      data.answers.forEach(
        ([label,correct])=>{
          const b=
            document.createElement(
              'button'
            );

          b.type='button';
          b.textContent=label;

          b.addEventListener(
            'click',
            ()=>{
              if(locked) return;

              if(correct){
                locked=true;
                b.classList.add(
                  'correct'
                );

                setPuzzleStatus(
                  'sí.',
                  'esa parte no cambia.'
                );

                round++;

                if(round>=rounds.length){
                  setTimeout(
                    ()=>completePuzzle(
                      ch,
                      'no recuerdas una copia.',
                      'recuerdas cómo se siente reconocerla.'
                    ),
                    850
                  );
                }else{
                  setTimeout(
                    render,
                    650
                  );
                }
              }else{
                locked=true;

                b.classList.add(
                  'wrong'
                );

                setPuzzleStatus(
                  'esa parte cambia.',
                  'prueba con algo menos exacto.'
                );

                setTimeout(
                  ()=>{
                    b.classList.remove(
                      'wrong'
                    );

                    locked=false;
                  },
                  420
                );
              }
            }
          );

          answers.appendChild(b);
        }
      );
    };

    render();

    puzzleCleanup=()=>{};
  }

  /* -------------------------------------------------------
     PUZZLE 5 — TULUZ / LÍNEA TEMPORAL
  ------------------------------------------------------- */

  function buildTuluzTimelinePuzzle(ch){
    let beforeAttempts=0;
    let futureUnlocked=false;

    puzzleBody.innerHTML=`
      <div class="act2TimelinePuzzle">
        <div class="act2TimelineScreen">
          <span id="act2TimelineDate">BACKUP -100</span>
          <small id="act2TimelineResult">NO SOURCE</small>
        </div>

        <input
          id="act2TimelineDial"
          type="range"
          min="-100"
          max="100"
          value="-88"
          step="1"
          aria-label="Buscar en la línea temporal"
        >

        <div class="act2TimelineLabels">
          <span>ANTES</span>
          <i></i>
          <span>DESPUÉS</span>
        </div>

        <button
          id="act2TimelineSearch"
          type="button"
        >
          BUSCAR AQUÍ
        </button>

        <p id="act2TimelineHint">
          El Archivo insiste en buscar antes.
        </p>
      </div>
    `;

    const dial=
      puzzleBody.querySelector(
        '#act2TimelineDial'
      );

    const date=
      puzzleBody.querySelector(
        '#act2TimelineDate'
      );

    const result=
      puzzleBody.querySelector(
        '#act2TimelineResult'
      );

    const hint=
      puzzleBody.querySelector(
        '#act2TimelineHint'
      );

    const searchButton=
      puzzleBody.querySelector(
        '#act2TimelineSearch'
      );

    const update=()=>{
      const v=
        Number(
          dial.value
        );

      date.textContent=
        v<0
          ? `BACKUP ${v}`
          : `AFTER +${v}`;

      setPuzzleRadioTune(
        ((v+100)/2),
        futureUnlocked
          ? [78]
          : [8,22]
      );

      if(v<=0){
        result.textContent=
          'NO SOURCE';
      }else if(!futureUnlocked){
        result.textContent=
          'OUTSIDE BACKUP';
      }else if(v>=55){
        result.textContent=
          'SOURCE?';
      }else{
        result.textContent=
          'SEARCHING...';
      }
    };

    const commit=()=>{
      const v=
        Number(
          dial.value
        );

      if(!futureUnlocked){
        if(v<=0){
          beforeAttempts++;

          const lines=[
            ['no.','lluvia: sin coincidencia.'],
            ['no.','cartas: sin coincidencia.'],
            ['otra vez no.','tal vez no estaba antes.']
          ];

          const line=
            lines[
              Math.min(
                beforeAttempts-1,
                lines.length-1
              )
            ];

          setPuzzleStatus(
            line[0],
            line[1]
          );

          setAct2SoundMode(
            'static'
          );

          setTimeout(
            ()=>setAct2SoundMode('silence'),
            620
          );

          if(beforeAttempts>=3){
            futureUnlocked=true;

            puzzleBody.classList.add(
              'future-unlocked'
            );

            hint.textContent=
              '¿Y si el error es buscar hacia atrás?';

            setPuzzleStatus(
              'SOURCE DATE: —',
              'la línea continúa hacia la derecha.'
            );
          }
        }else{
          setPuzzleStatus(
            'fuera del respaldo.',
            'el Archivo no quiere mirar allí.'
          );
        }

        update();
        return;
      }

      if(v>=55){
        result.textContent=
          'SOURCE DATE: AFTER BACKUP';

        setAct2SoundMode(
          'hum'
        );

        setPuzzleStatus(
          'ahí.',
          'no estaba perdido. todavía no había ocurrido.'
        );

        setTimeout(
          ()=>completePuzzle(
            ch,
            'dejamos de buscarlo en el pasado.',
            ''
          ),
          950
        );
      }else{
        setPuzzleStatus(
          'sigue.',
          'más adelante.'
        );
      }
    };

    dial.addEventListener(
      'input',
      update
    );

    dial.addEventListener(
      'change',
      ()=>{
        /*
          El cambio actualiza la pantalla, pero la búsqueda se
          confirma con el botón. Evita que algunos móviles
          "pierdan" el evento al soltar el control.
        */
        update();
      }
    );

    searchButton?.addEventListener(
      'click',
      commit
    );

    update();

    puzzleCleanup=()=>{
      setAct2SoundMode('silence');
    };
  }

  /* -------------------------------------------------------
     PUZZLE 6 — RECUERDO VS COPIA
  ------------------------------------------------------- */

  function buildMemoryWeavePuzzle(ch){
    const rows=[
      {
        label:'El primer tulipán',
        correct:'remember'
      },
      {
        label:'La voz de Mewo',
        correct:'remember'
      },
      {
        label:'La posición exacta de cada luz',
        correct:'change'
      },
      {
        label:'Un hueco que nunca tuvo recuerdo',
        correct:'change'
      },
      {
        label:'Tuluz antes de conocerlo',
        correct:'change'
      }
    ];

    let solved=0;

    puzzleBody.innerHTML=`
      <div class="act2WeavePuzzle">
        <div id="act2WeaveRows"></div>

        <div class="act2WeaveLegend">
          <span>RECUPERAR</span>
          <span>DEJAR CAMBIAR</span>
        </div>
      </div>
    `;

    const wrap=
      puzzleBody.querySelector(
        '#act2WeaveRows'
      );

    rows.forEach(
      row=>{
        const item=
          document.createElement(
            'div'
          );

        item.className=
          'act2WeaveRow';

        item.innerHTML=`
          <strong>${row.label}</strong>

          <div>
            <button data-value="remember">↺</button>
            <button data-value="change">→</button>
          </div>
        `;

        item
          .querySelectorAll(
            'button'
          )
          .forEach(
            b=>{
              b.setAttribute(
                'aria-label',
                b.dataset.value==='remember'
                  ? `Recuperar: ${row.label}`
                  : `Dejar cambiar: ${row.label}`
              );

              b.addEventListener(
                'click',
                ()=>{
                  if(
                    item.classList.contains(
                      'done'
                    )
                  ) return;

                  if(
                    b.dataset.value===
                    row.correct
                  ){
                    item.classList.add(
                      'done'
                    );

                    item
                      .querySelectorAll(
                        'button'
                      )
                      .forEach(btn=>{
                        btn.disabled=true;
                      });

                    b.classList.add(
                      'correct'
                    );

                    solved++;

                    setPuzzleStatus(
                      row.correct==='remember'
                        ? 'eso sí puede volver.'
                        : 'eso no necesita una copia.',
                      ''
                    );

                    if(solved>=rows.length){
                      setTimeout(
                        ()=>completePuzzle(
                          ch,
                          'recordar no es congelar.',
                          ''
                        ),
                        800
                      );
                    }
                  }else{
                    b.classList.add(
                      'wrong'
                    );

                    setPuzzleStatus(
                      'algo no encaja.',
                      'piensa si estás recordando... o copiando.'
                    );

                    setTimeout(
                      ()=>b.classList.remove(
                        'wrong'
                      ),
                      390
                    );
                  }
                }
              );
            }
          );

        wrap.appendChild(
          item
        );
      }
    );

    puzzleCleanup=()=>{};
  }

  /* -------------------------------------------------------
     PUZZLE 7 — DEJAR UN HUECO
  ------------------------------------------------------- */

  function buildEmptyGapPuzzle(ch){
    let resistantHits=0;
    let filled=0;
    let solved=false;

    puzzleBody.innerHTML=`
      <div class="act2GapPuzzle">
        <div class="act2GapSlots">
          <button data-gap="0">·</button>
          <button data-gap="1">·</button>
          <button data-gap="2">·</button>
          <button data-gap="3">·</button>
          <button data-gap="4" class="resistant">·</button>
        </div>

        <button
          id="act2LeaveEmpty"
          type="button"
        >
          DEJARLO VACÍO
        </button>

        <p>
          El mundo intenta completar la imagen.
        </p>
      </div>
    `;

    const leave=
      puzzleBody.querySelector(
        '#act2LeaveEmpty'
      );

    puzzleBody
      .querySelectorAll(
        '[data-gap]'
      )
      .forEach(
        b=>{
          b.addEventListener(
            'click',
            ()=>{
              if(solved) return;

              const idx=
                Number(
                  b.dataset.gap
                );

              if(idx<4){
                if(
                  b.classList.contains(
                    'filled'
                  )
                ) return;

                b.classList.add(
                  'filled'
                );

                b.textContent=
                  ['✿','🐾','☾','⌂'][idx];

                filled++;

                setPuzzleStatus(
                  'recuerdo encontrado.',
                  ''
                );

                return;
              }

              resistantHits++;

              setAct2SoundMode(
                'static'
              );

              setTimeout(
                ()=>setAct2SoundMode('silence'),
                500
              );

              const lines=[
                ['NO SOURCE',''],
                ['NO SOURCE','no hay nada detrás.'],
                ['NO SOURCE','tal vez no falta nada.']
              ];

              const line=
                lines[
                  Math.min(
                    resistantHits-1,
                    lines.length-1
                  )
                ];

              setPuzzleStatus(
                line[0],
                line[1]
              );

              b.classList.remove(
                'fail'
              );

              void b.offsetWidth;

              b.classList.add(
                'fail'
              );

              if(
                resistantHits>=3 &&
                filled>=4
              ){
                leave.classList.add(
                  'show'
                );
              }else if(
                resistantHits>=3 &&
                filled<4
              ){
                setPuzzleStatus(
                  'NO SOURCE',
                  'todavía hay recuerdos que sí puedes recuperar.'
                );
              }
            }
          );
        }
      );

    leave.addEventListener(
      'click',
      ()=>{
        if(solved) return;
        solved=true;
        leave.disabled=true;

        puzzleBody
          .querySelectorAll(
            '.act2GapSlots button'
          )
          .forEach(btn=>{
            btn.disabled=true;
          });

        setPuzzleStatus(
          '...',
          'por primera vez el mundo deja de intentar.'
        );

        setTimeout(
          ()=>completePuzzle(
            ch,
            'no todo espacio vacío está roto.',
            ''
          ),
          850
        );
      }
    );

    puzzleCleanup=()=>{};
  }

  function bindWalking(){
    if(!world) return;

    const start=(x)=>{
      if(sceneLock || cine?.classList.contains('show')) return;
      dragging=true;
      pointerStart=x;
      worldStart=state.worldX;
      lastMoveAt=Date.now();
      world.classList.add('dragging');
    };

    const move=(x)=>{
      if(!dragging) return;
      const dx=x-pointerStart;
      const next=Math.max(-880,Math.min(880,worldStart-dx*1.35));
      state.worldX=next;
      applyWorldX(false);
      checkHiddenOpportunities();
    };

    const end=()=>{
      if(!dragging) return;
      dragging=false;
      world.classList.remove('dragging');
      save({worldX:state.worldX});
      checkHiddenOpportunities();
      setObjectiveForChapter();
    };

    world.addEventListener('pointerdown',e=>{
      if(e.target.closest('button')) return;
      try{ world.setPointerCapture(e.pointerId); }catch(_){}
      start(e.clientX);
    });
    world.addEventListener('pointermove',e=>move(e.clientX));
    world.addEventListener('pointerup',end);
    world.addEventListener('pointercancel',end);

    world.addEventListener('wheel',e=>{
      if(sceneLock || cine?.classList.contains('show')) return;
      state.worldX=Math.max(-880,Math.min(880,state.worldX+e.deltaY*.55+e.deltaX*.55));
      applyWorldX(false);
      save({worldX:state.worldX});
      checkHiddenOpportunities();
      setObjectiveForChapter();
    },{passive:true});
  }

  function applyWorldX(animate=true){
    if(!track) return;
    track.style.transition=animate?'transform .55s cubic-bezier(.2,.7,.2,1)':'none';
    track.style.transform=`translate3d(${-state.worldX}px,0,0)`;

    const horizon=root?.querySelector('#act2Horizon');
    const stars=root?.querySelector('#act2DistantStars');
    if(horizon) horizon.style.transform=`translate3d(${-state.worldX*.12}px,0,0)`;
    if(stars) stars.style.transform=`translate3d(${-state.worldX*.05}px,0,0)`;

    renderTouchPoints();
  }

  function renderWorld(){
    build();
    applyWorldX(true);

    root.classList.toggle('has-first-tulip',Boolean(state.firstTulip));
    root.classList.toggle('has-mewo',Boolean(state.mewo));
    root.classList.toggle('has-refuge',Boolean(state.refuge));
    root.classList.toggle('has-marie',Boolean(state.marie));
    root.classList.toggle('has-tuluz',Boolean(state.tuluz));
    root.classList.toggle('reconstructing',state.chapter>=6);
    root.classList.toggle('act2-finished',Boolean(state.finished));

    const fragments=fragmentState();
    root.classList.toggle('all-fragments',fragments.found.length>=7);
    if(tinyStar){
      tinyStar.classList.toggle('show',fragments.found.length>=7);
      tinyStar.classList.toggle('seen',fragments.starSeen);
    }

    renderTouchPoints();
  }

  function setObjective(id,label,x){
    if(!objective) return;
    objectiveId=id;
    objective.dataset.id=id;
    objectiveLabel.textContent=label||'';
    objective.style.left=`calc(50% + ${x-state.worldX}px)`;
    objective.classList.add('show');
  }

  function clearObjective(){
    objectiveId='';
    objective?.classList.remove('show');
  }

  function setObjectiveForChapter(){
    if(!root || sceneLock || suppressed || cine?.classList.contains('show')) return;
    if(window.ParadoxAct2Archive?.isOpen?.()) return;

    clearObjective();

    /*
      ACTO II V4:
      algunas zonas y set-pieces narrativos viven en un módulo
      separado. Si el módulo necesita detener la progresión,
      toma temporalmente el control antes de rastros/puzzles.
    */
    if(
      window.ParadoxAct2WorldV4?.gate?.(
        state.chapter,
        {...state}
      )
    ){
      return;
    }

    /*
      El recuerdo principal solo aparece después de que el jugador
      haya examinado todos los rastros de ese capítulo.
    */
    if(!touchPhaseDone(state.chapter)){
      renderTouchPoints();
      return;
    }

    renderTouchPoints();

    /*
      Aunque ya haya tocado todos los rastros, el evento grande
      no aparece hasta resolver el puzzle de ese capítulo.
    */
    if(!puzzleDone(state.chapter)){
      const meta=
        PUZZLE_META[state.chapter];

      if(meta){
        setObjective(
          `chapter-puzzle-${state.chapter}`,
          '',
          Number(meta.x||0)
        );

        return;
      }
    }

    switch(state.chapter){
      case 0:
        setObjective('wake-glimmer','',240);
        break;
      case 1:
        setObjective('first-tulip','',340);
        break;
      case 2:
        setObjective('mewo-trail','',610);
        break;
      case 3:
        setObjective('refuge-echo','',-120);
        break;
      case 4:
        setObjective('marie-memory','',135);
        break;
      case 5:
        setObjective('tuluz-memory','',585);
        break;
      case 6:
        setReconstructionObjective();
        break;
      case 7:
        if(!state.finaleSeen){
          setObjective('act2-finale','',0);
        }
        break;
    }

    checkHiddenOpportunities();
  }

  function setReconstructionObjective(){
    const step=Number(state.reconstructionStep||0);
    const points=[-520,-180,120,390,650];
    setObjective(
      `reconstruct-${step+1}`,
      '',
      points[Math.min(step,4)]
    );
  }

  function onObjective(){
    const id=objectiveId;
    if(!id || sceneLock) return;
    clearObjective();

    if(id.startsWith('chapter-puzzle-')){
      const ch=
        Number(
          id.split('-').pop()
        );

      openPuzzle(ch);
      return;
    }

    if(id==='wake-glimmer'){
      playScene(SCENES.wakeGlimmer,{onDone:()=>{
        save({chapter:1,worldX:80});
        renderWorld();
        setObjectiveForChapter();
      }});
      return;
    }

    if(id==='first-tulip'){
      playScene(SCENES.firstTulip,{onFrame:(idx)=>{
        if(idx===2) root.classList.add('tulip-forming');
      },onDone:()=>{
        root.classList.remove('tulip-forming');
        save({firstTulip:true,chapter:2,worldX:170});
        renderWorld();
        emit('paradox-act2-memory-restored',{memory:'first-tulip'});
        setObjectiveForChapter();
      }});
      return;
    }

    if(id==='mewo-trail'){
      playScene(SCENES.mewo,{onFrame:(idx)=>{
        root.dataset.mewoFrame=String(idx);
      },onDone:()=>{
        delete root.dataset.mewoFrame;
        save({mewo:true,chapter:3,worldX:40});
        renderWorld();
        emit('paradox-act2-memory-restored',{memory:'mewo'});
        setObjectiveForChapter();
      }});
      return;
    }

    if(id==='refuge-echo'){
      playScene(SCENES.refuge,{onDone:()=>{
        save({refuge:true,chapter:4,worldX:0});
        renderWorld();
        emit('paradox-act2-memory-restored',{memory:'refuge'});
        setObjectiveForChapter();
      }});
      return;
    }

    if(id==='marie-memory'){
      playScene(SCENES.marie,{onFrame:(idx)=>root.dataset.marieFrame=String(idx),onDone:()=>{
        delete root.dataset.marieFrame;
        save({marie:true,chapter:5,worldX:160});
        renderWorld();
        emit('paradox-act2-memory-restored',{memory:'marie'});
        setObjectiveForChapter();
      }});
      return;
    }

    if(id==='tuluz-memory'){
      playScene(SCENES.tuluz,{onFrame:(idx)=>root.dataset.tuluzFrame=String(idx),onDone:()=>{
        delete root.dataset.tuluzFrame;
        save({tuluz:true,chapter:6,worldX:210});
        renderWorld();
        emit('paradox-act2-memory-restored',{memory:'tuluz'});
        setTimeout(()=>showTitle('','RECONSTRUIR','El mundo ya recuerda suficiente para intentar volver.'),700);
        setTimeout(setObjectiveForChapter,3900);
      }});
      return;
    }

    if(id.startsWith('reconstruct-')){
      runReconstructionChoice();
      return;
    }

    if(id==='act2-finale'){
      runFinale();
    }
  }

  function runReconstructionChoice(){
    const step=Number(state.reconstructionStep||0);
    const scenes=[
      SCENES.reconstruct1,
      SCENES.reconstruct2,
      SCENES.reconstruct3,
      SCENES.reconstruct4,
      SCENES.reconstruct5
    ];

    const scene=
      scenes[
        Math.min(step,4)
      ];

    playScene(scene,{
      choices:[
        {label:'Como antes',value:'exact'},
        {label:'Dejarlo cambiar',value:'accept'}
      ],
      onChoice:(value)=>{
        const patch={reconstructionStep:step+1};
        if(value==='exact') patch.exactChoices=Number(state.exactChoices||0)+1;
        else patch.acceptChoices=Number(state.acceptChoices||0)+1;
        save(patch);
        root.classList.add(`reconstruction-${step+1}`);
        renderWorld();

        if(state.reconstructionStep>=5){
          if(state.exactChoices>=4 && !state.archiveSeen){
            setTimeout(()=>{
              emit('paradox-act2-archive-requested',{reason:'no-cambies'});
              window.ParadoxAct2Archive?.open?.();
            },1000);
          }else{
            save({chapter:7});
            setTimeout(setObjectiveForChapter,900);
          }
        }else{
          setTimeout(setObjectiveForChapter,700);
        }
      }
    });
  }

  function continueAfterArchive(){
    save({archiveSeen:true,chapter:7,acceptChoices:Math.max(1,state.acceptChoices)});
    renderWorld();
    setTimeout(setObjectiveForChapter,800);
  }

  function runFinale(){
    playScene(SCENES.finale,{onFrame:(idx)=>root.dataset.finaleFrame=String(idx),onDone:()=>{
      delete root.dataset.finaleFrame;
      save({finaleSeen:true,finished:true,chapter:7});
      writeStory({act:3,phase:'awaiting-act3',act2Finished:true});
      renderWorld();
      setTimeout(()=>root.querySelector('#act2ActEnd')?.classList.add('show'),700);
      emit('paradox-act2-finished',{act:3});
    }});
  }

  function checkHiddenOpportunities(){
    if(!root || !state.started || sceneLock) return;
    emit('paradox-act2-world-position',{
      x:state.worldX,
      chapter:state.chapter,
      state:{...state}
    });
  }

  function bindCineAdvance(){
    cine?.addEventListener('click',e=>{
      if(e.target.closest('#act2CineChoices button')) return;
      if(!cine.classList.contains('show') || !activeScene) return;
      nextFrame();
    });
  }

  function playScene(scene,opts={}){
    if(!scene || sceneLock) return;
    build();
    sceneLock=true;
    activeScene={scene,opts};
    sceneIndex=0;
    cine.dataset.theme=scene.theme||'memory';
    cineMark.textContent=scene.mark||'·';
    cine.classList.add('show');
    cine.setAttribute('aria-hidden','false');
    cineChoices.innerHTML='';
    document.body.classList.add('act2-cinematic-open');

    setAct2SoundMode('silence');

    renderCineFrame();
  }

  function renderCineFrame(){
    if(!activeScene) return;
    const {scene,opts}=activeScene;
    const frame=scene.frames[sceneIndex];
    if(!frame){ finishScene(); return; }

    const data=typeof frame==='string'?{text:frame}:frame;
    cineText.textContent=data.text||'';
    cineMark.textContent=data.mark||scene.mark||'·';
    cineVisual.dataset.frame=String(sceneIndex);

    const memory=root.querySelector('#act2CineMemory');
    if(memory){
      memory.className='';
      memory.id='act2CineMemory';
      if(data.memory) memory.classList.add(data.memory);
    }

    const cats=[
      root.querySelector('#act2CineCatA'),
      root.querySelector('#act2CineCatB'),
      root.querySelector('#act2CineCatC')
    ];
    cats.forEach((el,i)=>{
      const src=(data.cats||scene.cats||[])[i];
      if(src){
        el.src=src;
        el.classList.add('show');
      }else{
        el.classList.remove('show');
        el.removeAttribute('src');
      }
    });

    opts.onFrame?.(sceneIndex,data);
  }

  function nextFrame(){
    if(!activeScene) return;
    const {scene,opts}=activeScene;
    if(sceneIndex < scene.frames.length-1){
      sceneIndex++;
      cine.classList.add('frame-change');
      setTimeout(()=>cine.classList.remove('frame-change'),260);
      renderCineFrame();
      return;
    }

    if(Array.isArray(opts.choices) && opts.choices.length){
      showChoices(opts.choices,opts.onChoice);
      return;
    }

    finishScene();
  }

  function showChoices(choices,onChoice){
    if(!activeScene) return;
    cineChoices.innerHTML='';
    choices.forEach(choice=>{
      const b=document.createElement('button');
      b.type='button';
      b.textContent=choice.label;
      b.addEventListener('click',e=>{
        e.stopPropagation();
        const value=choice.value;
        const cb=onChoice;
        closeCine();
        cb?.(value);
      });
      cineChoices.appendChild(b);
    });
    cineChoices.classList.add('show');
    root.querySelector('#act2CineTap').textContent='elige';
  }

  function finishScene(){
    const done=activeScene?.opts?.onDone;
    closeCine();
    done?.();
  }

  function closeCine(){
    cine?.classList.remove('show');
    cine?.setAttribute('aria-hidden','true');
    cineChoices?.classList.remove('show');
    if(cineChoices) cineChoices.innerHTML='';
    const tap=root?.querySelector('#act2CineTap');
    if(tap) tap.textContent='toca para continuar';
    document.body.classList.remove('act2-cinematic-open');
    activeScene=null;
    sceneIndex=0;
    sceneLock=false;

    setTimeout(
      renderTouchPoints,
      180
    );

    setTimeout(
      ()=>{
        if(
          !puzzleOpen &&
          !window.ParadoxAct2Archive?.isOpen?.()
        ){
          setAct2SoundMode('silence');
        }
      },
      280
    );
  }

  function playExternalScene(scene,opts={}){
    playScene(scene,opts);
  }

  function suppressObjectives(flag=true){
    suppressed=Boolean(flag);
    if(suppressed) clearObjective();
    else setTimeout(setObjectiveForChapter,350);
  }

  function onSecretStar(){
    emit('paradox-act2-secret-star-click');
  }

  function jumpChapter(ch){
    const n=Math.max(0,Math.min(7,Number(ch)||0));

    const devPuzzles={
      ...(
        state.puzzles &&
        typeof state.puzzles==='object'
          ? state.puzzles
          : {}
      )
    };

    /*
      Al saltar a un capítulo DEV:
      todos los puzzles anteriores se consideran resueltos,
      pero el puzzle del capítulo elegido queda disponible.
    */
    for(let i=0;i<n;i++){
      devPuzzles[String(i)]=true;
    }

    delete devPuzzles[String(n)];

    const patch={
      chapter:n,
      started:true,
      finished:false,
      finaleSeen:false,
      puzzles:devPuzzles
    };
    if(n>=2) patch.firstTulip=true;
    if(n>=3) patch.mewo=true;
    if(n>=4) patch.refuge=true;
    if(n>=5) patch.marie=true;
    if(n>=6) patch.tuluz=true;
    if(n>=7) patch.reconstructionStep=5;
    save(patch);
    document.body.classList.add('act2-active');
    if(!booted) activate();
    renderWorld();
    setObjectiveForChapter();
  }

  function resetAct2(){
    try{
      localStorage.removeItem(ACT2_KEY);
      localStorage.removeItem(FRAGMENT_KEY);
      localStorage.removeItem('paradox143_act2_world_v4');
    }catch(_){}
    const s=story();
    writeStory({...s,act:2,phase:'act2',act2Finished:false});
    location.reload();
  }

  const SCENES={
    awakening:{
      theme:'awakening',mark:'·',frames:[
        {text:'...',memory:'empty'},
        {text:'No hay música.',memory:'empty'},
        {text:'El viento sigue aquí.',memory:'wind'},
        {text:'La luna también.',memory:'moon'},
        {text:'Hay formas que parecen haber sido borradas sin desaparecer del todo.',memory:'trace'},
        {text:'Intentas recordar qué debería estar cerca.',memory:'empty'},
        {text:'La respuesta llega cortada.',memory:'trace'},
        {text:'algo...',memory:'trace'},
        {text:'...aquí.',memory:'trace'},
        {text:'Este no es un mundo que recuerda todo.',memory:'glimmer'},
        {text:'Es un mundo que intenta recordar.',memory:'glimmer'},
        {text:'Tal vez tengas que tocar lo poco que quedó.',memory:'empty'}
      ]
    },

    wakeGlimmer:{
      theme:'glimmer',mark:'✦',frames:[
        {text:'Después de tocarlo todo, algo responde.',memory:'glimmer'},
        {text:'La estática desaparece durante un segundo.',memory:'trace'},
        {text:'Algo intenta pronunciar una palabra.',memory:'trace'},
        {text:'No consigue terminarla.',memory:'trace'},
        {text:'No parece una carta.',memory:'trace'},
        {text:'Parece el lugar donde una carta alguna vez pudo existir.',memory:'trace'}
      ]
    },

    firstTulip:{
      theme:'first-tulip',mark:'✿',frames:[
        {text:'La tierra ya recordó qué debía sostener.',memory:'pink'},
        {text:'Primero vuelve un color.',memory:'pink'},
        {text:'Después una línea.',memory:'stem'},
        {text:'Luego una forma.',memory:'tulip'},
        {text:'Durante un instante tiene demasiados pétalos.',memory:'tulip'},
        {text:'El mundo se detiene.',memory:'tulip'},
        {text:'Quita uno.',memory:'tulip'},
        {text:'No queda exactamente igual.',memory:'tulip'},
        {text:'Pero cuando termina... sabes cuál es.',memory:'tulip'},
        {text:'Nuestro tulipán ♡',memory:'tulip'}
      ]
    },

    mewo:{
      theme:'mewo',mark:'🐾',frames:[
        {text:'El ritmo termina exactamente donde empiezan las huellitas.',memory:'paws'},
        {text:'Hay huellitas donde todavía no hay nadie.',memory:'paws'},
        {text:'Una aparece demasiado grande.',memory:'mewo-wrong'},
        {text:'Otra mira en la dirección equivocada.',memory:'mewo-wrong'},
        {text:'El mundo encuentra una silueta.',memory:'mewo-shadow'},
        {text:'La reconstruye mal.',memory:'mewo-wrong'},
        {text:'La borra.',memory:'mewo-shadow'},
        {text:'Lo intenta otra vez.',memory:'mewo-forming'},
        {text:'...',cats:['mewo_confused.png'],memory:'mewo-forming'},
        {text:'Ah...',cats:['mewo_confused.png'],memory:'mewo-forming'},
        {text:'eras tú.',cats:['mewo_happy.png'],memory:'mewo-forming'}
      ]
    },

    refuge:{
      theme:'refuge',mark:'⌂',frames:[
        {text:'La corriente llega hasta una luz que todavía no tiene pared.',cats:['mewo_idle.png'],memory:'empty-refuge'},
        {text:'Mewo camina hacia un lugar que todavía no existe.',cats:['mewo_idle.png'],memory:'empty-refuge'},
        {text:'Primero recuerda el árbol.',cats:['mewo_idle.png'],memory:'tree'},
        {text:'Después una luz.',cats:['mewo_idle.png'],memory:'lamp'},
        {text:'La luz parpadea como si dudara.',cats:['mewo_idle.png'],memory:'lamp'},
        {text:'Aparece una almohadita demasiado lejos.',cats:['mewo_idle.png'],memory:'pillow'},
        {text:'El mundo la mueve.',cats:['mewo_idle.png'],memory:'pillow'},
        {text:'La mueve otra vez.',cats:['mewo_idle.png'],memory:'pillow'},
        {text:'Mewo deja de esperar.',cats:['mewo_idle.png'],memory:'refuge'},
        {text:'No volvió exactamente como antes.',cats:['mewo_happy.png'],memory:'refuge'},
        {text:'Mewo se acuesta igual.',cats:['mewo_sleep.png'],memory:'refuge'}
      ]
    },

    marie:{
      theme:'marie',mark:'☾',frames:[
        {text:'El puzzle no encontró una copia perfecta.',memory:'marie-shadow'},
        {text:'Encontró algo más pequeño: cosas que no dejaban de coincidir.',memory:'marie-shadow'},
        {text:'Hay un rincón que insiste en tener a alguien.',memory:'marie-shadow'},
        {text:'La primera silueta no encaja.',memory:'marie-wrong'},
        {text:'La segunda tiene el color correcto... casi.',memory:'marie-wrong2'},
        {text:'La tercera parece correcta hasta que se mueve.',memory:'marie-wrong'},
        {text:'El mundo empieza a corregirla otra vez.',memory:'marie-shadow'},
        {text:'Y se detiene.',memory:'marie-shadow'},
        {text:'...',cats:['cat_gray_idle.png'],memory:'marie-home'},
        {text:'Te recordaba diferente.',cats:['cat_gray_idle.png'],memory:'marie-home'},
        {text:'Pero sigues siendo tú.',cats:['cat_gray_happy.png'],memory:'marie-home'}
      ]
    },

    tuluz:{
      theme:'tuluz',mark:'✦',frames:[
        {text:'La línea temporal termina de abrirse hacia la derecha.',memory:'search'},
        {text:'El mundo vuelve a buscar a alguien más.',memory:'search'},
        {text:'Busca en la lluvia.',memory:'search'},
        {text:'En el refugio.',memory:'search'},
        {text:'En las cartas que todavía recuerda.',memory:'search'},
        {text:'En una noche anterior.',memory:'search'},
        {text:'No encuentra nada.',memory:'gap'},
        {text:'SOURCE DATE: AFTER BACKUP',memory:'gap'},
        {text:'Porque estaba buscando hacia atrás.',memory:'gap'},
        {text:'...',cats:['cat_orange_idle.png'],memory:'future'},
        {text:'No te recordaba.',cats:['cat_orange_idle.png'],memory:'future'},
        {text:'Porque todavía no te había conocido.',cats:['cat_orange_happy.png'],memory:'future'},
        {text:'Y aun así... ahora estás aquí.',cats:['cat_orange_happy.png'],memory:'future'}
      ]
    },

    reconstruct1:{
      theme:'choice',mark:'◇',frames:[
        {text:'El sendero vuelve, pero gira hacia un lugar distinto.',memory:'path'},
        {text:'El mundo espera.',memory:'path'},
        {text:'Podría obligarlo a parecerse al de antes.',memory:'path'}
      ]
    },

    reconstruct2:{
      theme:'choice',mark:'✦',frames:[
        {text:'Las luces regresan en otro orden.',memory:'lights'},
        {text:'Ninguna está rota.',memory:'lights'},
        {text:'Solo son diferentes.',memory:'lights'}
      ]
    },

    reconstruct3:{
      theme:'choice',mark:'✿',frames:[
        {text:'Crecen flores donde antes había espacio vacío.',memory:'new-flowers'},
        {text:'El mundo no recuerda haberlas plantado.',memory:'new-flowers'},
        {text:'Aun así parecen felices de estar aquí.',memory:'new-flowers'}
      ]
    },

    reconstruct4:{
      theme:'choice',mark:'☾',frames:[
        {text:'La luna vuelve completa por un segundo.',memory:'moon'},
        {text:'Después queda una pequeña marca que antes no estaba.',memory:'moon'},
        {text:'El mundo espera a que decidas si debe borrarla.',memory:'moon'}
      ]
    },

    reconstruct5:{
      theme:'choice',mark:'⌂',frames:[
        {text:'El Claro vuelve a reconocerse como hogar.',memory:'world'},
        {text:'Pero hay un pequeño espacio junto al árbol que nadie recuerda.',memory:'future-gap'},
        {text:'Podrías llenarlo con una copia de algo antiguo.',memory:'future-gap'},
        {text:'O podrías dejar que todavía no signifique nada.',memory:'future-gap'}
      ]
    },

    finale:{
      theme:'finale',mark:'♡',frames:[
        {text:'El último hueco sigue vacío.',memory:'future-gap'},
        {text:'Esperas que el mundo intente llenarlo otra vez.',memory:'future-gap'},
        {text:'No lo hace.',memory:'future-gap'},
        {text:'El campo vuelve a tener profundidad.',memory:'world'},
        {text:'El Claro vuelve a tener voces.',cats:['cat_gray_idle.png','mewo_happy.png','cat_orange_idle.png'],memory:'world'},
        {text:'Algunas cosas están donde las recordabas.',cats:['cat_gray_idle.png','mewo_happy.png','cat_orange_idle.png'],memory:'world'},
        {text:'Otras no.',cats:['cat_gray_idle.png','mewo_happy.png','cat_orange_idle.png'],memory:'world'},
        {text:'Y todavía quedan espacios vacíos.',memory:'future-gap'},
        {text:'Esta vez no parecen errores.',memory:'future-gap'},
        {text:'Parecen lugares esperando algo.',memory:'future-gap'},
        {text:'Tal vez no todo lo que falta se perdió.',memory:'future-gap'},
        {text:'Tal vez algunas cosas todavía no han ocurrido.',memory:'future-gap'}
      ]
    }
  };

  function startIfReady(){
    if(shouldStart()) activate();
  }

  window.addEventListener('paradox-act1-finished',()=>{
    writeStory({act:2,phase:'act2'});
    setTimeout(activate,3600);
  });

  window.addEventListener(
    'paradox-act2-archive-requested',
    ()=>{
      ensureAct2Soundscape();
      setAct2SoundMode('archive');
    }
  );

  window.addEventListener('paradox-act2-archive-finished',()=>{
    setAct2SoundMode('silence');
    continueAfterArchive();
  });

  document.addEventListener('DOMContentLoaded',()=>{
    build();
    startIfReady();
  });

  setTimeout(startIfReady,700);

  window.ParadoxAct2={
    activate,
    playScene:playExternalScene,
    showTitle,
    state:()=>({...state}),
    save,
    render:renderWorld,
    setObjectiveForChapter,
    suppressObjectives,
    jumpChapter,
    reset:resetAct2,
    fragments:fragmentState,
    puzzles:()=>({
      ...(
        state.puzzles &&
        typeof state.puzzles==='object'
          ? state.puzzles
          : {}
      )
    }),
    openPuzzle,
    isPuzzleOpen:()=>puzzleOpen,
    showBrokenLine,
    ambientMode:setAct2SoundMode,
    ensureAmbient:ensureAct2Soundscape,
    isSceneOpen:()=>sceneLock,
    isActive:()=>document.body.classList.contains('act2-active'),
    worldX:()=>state.worldX,
    setWorldX(x){
      state.worldX=Math.max(-880,Math.min(880,Number(x)||0));
      save({worldX:state.worldX});
      applyWorldX(true);
      setObjectiveForChapter();
    }
  };
})();
