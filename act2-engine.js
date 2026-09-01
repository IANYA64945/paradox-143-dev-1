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
        <div id="act2WalkHint">arrastra el campo</div>
      </div>

      <div id="act2TitleCard">
        <small id="act2TitleTop">ACTO II</small>
        <h1 id="act2TitleMain">LO QUE OLVIDAMOS</h1>
        <p id="act2TitleSub"></p>
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
  }

  function activate(){
    if(booted) return;
    booted=true;
    build();

    save({started:true});
    writeStory({act:2,phase:'act2',act2Started:true});

    document.body.classList.remove('intro-active');
    document.body.classList.add('act2-active');

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
    if(state.reconstructionStep>=3 || state.archiveSeen) ch=Math.max(ch,7);
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
    const points=[-360,90,470];
    setObjective(`reconstruct-${step+1}`,'',points[Math.min(step,2)]);
  }

  function onObjective(){
    const id=objectiveId;
    if(!id || sceneLock) return;
    clearObjective();

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
    const scenes=[SCENES.reconstruct1,SCENES.reconstruct2,SCENES.reconstruct3];
    const scene=scenes[Math.min(step,2)];

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

        if(state.reconstructionStep>=3){
          if(state.exactChoices>=3 && !state.archiveSeen){
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
    const patch={chapter:n,started:true,finished:false,finaleSeen:false};
    if(n>=2) patch.firstTulip=true;
    if(n>=3) patch.mewo=true;
    if(n>=4) patch.refuge=true;
    if(n>=5) patch.marie=true;
    if(n>=6) patch.tuluz=true;
    if(n>=7) patch.reconstructionStep=3;
    save(patch);
    document.body.classList.add('act2-active');
    if(!booted) activate();
    renderWorld();
    setObjectiveForChapter();
  }

  function resetAct2(){
    try{ localStorage.removeItem(ACT2_KEY); localStorage.removeItem(FRAGMENT_KEY); }catch(_){}
    const s=story();
    writeStory({...s,act:2,phase:'act2',act2Finished:false});
    location.reload();
  }

  const SCENES={
    awakening:{
      theme:'awakening',mark:'·',frames:[
        {text:'...',memory:'empty'},
        {text:'El viento sigue aquí.',memory:'wind'},
        {text:'La luna también.',memory:'moon'},
        {text:'Pero el mundo no sabe qué debería haber debajo.',memory:'empty'},
        {text:'Este no es un mundo que recuerda todo.',memory:'glimmer'},
        {text:'Es un mundo que intenta recordar.',memory:'glimmer'}
      ]
    },

    wakeGlimmer:{
      theme:'glimmer',mark:'✦',frames:[
        {text:'Algo responde cuando te acercas.',memory:'glimmer'},
        {text:'No parece una carta.',memory:'trace'},
        {text:'Parece el lugar donde una carta alguna vez pudo existir.',memory:'trace'}
      ]
    },

    firstTulip:{
      theme:'first-tulip',mark:'✿',frames:[
        {text:'Primero vuelve un color.',memory:'pink'},
        {text:'Después una forma.',memory:'stem'},
        {text:'El mundo intenta recordar cómo crecía.',memory:'tulip'},
        {text:'No queda exactamente igual.',memory:'tulip'},
        {text:'Pero cuando termina... sabes cuál es.',memory:'tulip'},
        {text:'Nuestro tulipán ♡',memory:'tulip'}
      ]
    },

    mewo:{
      theme:'mewo',mark:'🐾',frames:[
        {text:'Hay huellitas donde todavía no hay nadie.',memory:'paws'},
        {text:'El mundo encuentra una silueta.',memory:'mewo-shadow'},
        {text:'La reconstruye mal.',memory:'mewo-wrong'},
        {text:'Lo intenta otra vez.',memory:'mewo-forming'},
        {text:'...',cats:['mewo_confused.png'],memory:'mewo-forming'},
        {text:'Ah...',cats:['mewo_confused.png'],memory:'mewo-forming'},
        {text:'eras tú.',cats:['mewo_happy.png'],memory:'mewo-forming'}
      ]
    },

    refuge:{
      theme:'refuge',mark:'⌂',frames:[
        {text:'Mewo camina hacia un lugar que todavía no existe.',cats:['mewo_idle.png'],memory:'empty-refuge'},
        {text:'Primero recuerda el árbol.',cats:['mewo_idle.png'],memory:'tree'},
        {text:'Después una luz.',cats:['mewo_idle.png'],memory:'lamp'},
        {text:'Una almohadita aparece demasiado lejos.',cats:['mewo_idle.png'],memory:'pillow'},
        {text:'El mundo la mueve.',cats:['mewo_idle.png'],memory:'pillow'},
        {text:'No volvió exactamente como antes.',cats:['mewo_happy.png'],memory:'refuge'},
        {text:'Mewo se acuesta igual.',cats:['mewo_sleep.png'],memory:'refuge'}
      ]
    },

    marie:{
      theme:'marie',mark:'☾',frames:[
        {text:'Hay un rincón que insiste en tener a alguien.',memory:'marie-shadow'},
        {text:'La primera silueta no encaja.',memory:'marie-wrong'},
        {text:'La segunda tiene el color correcto... casi.',memory:'marie-wrong2'},
        {text:'El mundo deja de corregir por un momento.',memory:'marie-shadow'},
        {text:'...',cats:['cat_gray_idle.png'],memory:'marie-home'},
        {text:'Te recordaba diferente.',cats:['cat_gray_idle.png'],memory:'marie-home'},
        {text:'Pero sigues siendo tú.',cats:['cat_gray_happy.png'],memory:'marie-home'}
      ]
    },

    tuluz:{
      theme:'tuluz',mark:'✦',frames:[
        {text:'El mundo busca a alguien más.',memory:'search'},
        {text:'Busca en la lluvia.',memory:'search'},
        {text:'En el refugio.',memory:'search'},
        {text:'En las cartas que todavía recuerda.',memory:'search'},
        {text:'No encuentra nada.',memory:'gap'},
        {text:'Porque estaba buscando hacia atrás.',memory:'gap'},
        {text:'...',cats:['cat_orange_idle.png'],memory:'future'},
        {text:'No te recordaba.',cats:['cat_orange_idle.png'],memory:'future'},
        {text:'Porque todavía no te había conocido.',cats:['cat_orange_happy.png'],memory:'future'}
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

    finale:{
      theme:'finale',mark:'♡',frames:[
        {text:'El campo vuelve a tener profundidad.',memory:'world'},
        {text:'El Claro vuelve a tener voces.',cats:['cat_gray_idle.png','mewo_happy.png','cat_orange_idle.png'],memory:'world'},
        {text:'Algunas cosas están donde las recordabas.',cats:['cat_gray_idle.png','mewo_happy.png','cat_orange_idle.png'],memory:'world'},
        {text:'Otras no.',cats:['cat_gray_idle.png','mewo_happy.png','cat_orange_idle.png'],memory:'world'},
        {text:'Y todavía quedan espacios vacíos.',memory:'future-gap'},
        {text:'Por primera vez, el mundo no intenta llenarlos.',memory:'future-gap'},
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

  window.addEventListener('paradox-act2-archive-finished',()=>{
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
