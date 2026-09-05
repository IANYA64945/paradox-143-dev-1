/* =========================================================
   PARADOX143 — ACTO III
   LO QUE TODAVÍA NOS FALTA VIVIR

   RUTAS:
   - RECORDAR
   - DEJAR IR
   - SEGUIR CRECIENDO
   - NO CAMBIES / EL ARCHIVO
   - EPÍLOGO SECRETO ABSOLUTO

   Idea central:
   Acto I   = guardar
   Acto II  = reconstruir
   Acto III = crear
========================================================= */

(() => {
  'use strict';

  const KEY='paradox143_act3_v1';

  const DEFAULT={
    version:1,
    started:false,
    dawnSeen:false,
    archiveOfferSeen:false,
    archiveRefused:false,

    nodes:{
      flower:false,
      place:false,
      cats:false,
      sky:false
    },

    choices:{
      remember:0,
      release:0,
      grow:0
    },

    route:'',
    endingSeen:false,
    newMemoryDone:false,
    secretSeen:false,
    postVisits:0
  };

  let state=load();

  let root=null;
  let stage=null;
  let cine=null;
  let cineText=null;
  let cineSub=null;
  let cineMark=null;
  let choicesBox=null;

  let sceneFrames=[];
  let sceneIndex=0;
  let sceneDone=null;
  let sceneLocked=false;

  let ambience=null;

  const IS_DEV=
    new URLSearchParams(
      location.search
    ).has('dev');

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

  function load(){
    const raw=parse(KEY,{});

    return {
      ...DEFAULT,
      ...raw,
      nodes:{
        ...DEFAULT.nodes,
        ...(raw?.nodes||{})
      },
      choices:{
        ...DEFAULT.choices,
        ...(raw?.choices||{})
      }
    };
  }

  function save(patch={}){
    const next={
      ...state,
      ...patch
    };

    if(patch.nodes){
      next.nodes={
        ...state.nodes,
        ...patch.nodes
      };
    }

    if(patch.choices){
      next.choices={
        ...state.choices,
        ...patch.choices
      };
    }

    state=next;

    try{
      localStorage.setItem(
        KEY,
        JSON.stringify(state)
      );
    }catch(_){}

    return state;
  }

  function act2State(){
    return window.ParadoxAct2?.state?.() || {};
  }

  function v4State(){
    try{
      return JSON.parse(
        localStorage.getItem(
          'paradox143_act2_world_v4'
        ) || '{}'
      );
    }catch(_){
      return {};
    }
  }

  function fragmentState(){
    try{
      return JSON.parse(
        localStorage.getItem(
          'paradox143_fragments_v1'
        ) || '{}'
      );
    }catch(_){
      return {};
    }
  }

  function noChangeEligible(){
    const a2=act2State();

    return Boolean(
      a2.archiveSeen &&
      Number(a2.exactChoices||0)>=4
    );
  }

  function secretEligible(){
    const fr=fragmentState();
    const v4=v4State();

    return Boolean(
      Array.isArray(fr.found) &&
      fr.found.length>=7 &&
      fr.starSeen &&
      v4.futureGlimpseSeen
    );
  }

  /* =======================================================
     AUDIO
  ======================================================= */

  function ensureAmbience(){
    if(ambience) return ambience;

    const AudioCtx=
      window.AudioContext ||
      window.webkitAudioContext;

    if(!AudioCtx) return null;

    try{
      const ctx=new AudioCtx();

      const master=ctx.createGain();
      master.gain.value=.32;
      master.connect(ctx.destination);

      const padA=ctx.createOscillator();
      const padB=ctx.createOscillator();
      const gainA=ctx.createGain();
      const gainB=ctx.createGain();

      padA.type='sine';
      padB.type='sine';

      padA.frequency.value=196;
      padB.frequency.value=293.66;

      gainA.gain.value=0;
      gainB.gain.value=0;

      padA.connect(gainA);
      padB.connect(gainB);
      gainA.connect(master);
      gainB.connect(master);

      padA.start();
      padB.start();

      ambience={
        ctx,
        master,
        padA,
        padB,
        gainA,
        gainB
      };

      return ambience;
    }catch(_){
      return null;
    }
  }

  function resumeAudio(){
    const a=ensureAmbience();

    try{
      if(
        a?.ctx?.state==='suspended'
      ){
        a.ctx.resume().catch(()=>{});
      }
    }catch(_){}

    return a;
  }

  function setWarmth(level=.02){
    const a=resumeAudio();
    if(!a) return;

    const now=a.ctx.currentTime;

    [a.gainA,a.gainB].forEach(
      (g,i)=>{
        try{
          g.gain.cancelScheduledValues(now);
          g.gain.setValueAtTime(
            g.gain.value,
            now
          );
          g.gain.linearRampToValueAtTime(
            level*(i?0.65:1),
            now+.8
          );
        }catch(_){}
      }
    );
  }

  function note(
    freq=392,
    duration=.35,
    volume=.035
  ){
    const a=resumeAudio();
    if(!a) return;

    try{
      const ctx=a.ctx;
      const now=ctx.currentTime;

      const osc=ctx.createOscillator();
      const gain=ctx.createGain();

      osc.type='sine';
      osc.frequency.value=freq;

      gain.gain.setValueAtTime(
        .0001,
        now
      );

      gain.gain.exponentialRampToValueAtTime(
        volume,
        now+.025
      );

      gain.gain.exponentialRampToValueAtTime(
        .0001,
        now+duration
      );

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now+duration+.05);
    }catch(_){}
  }

  /* =======================================================
     BUILD
  ======================================================= */

  function build(){
    if(root) return true;

    root=document.createElement('section');
    root.id='act3Root';

    root.innerHTML=`
      <div id="act3Sky">
        <div id="act3Sun"></div>
        <div id="act3Moon">☾</div>
        <div id="act3Stars"></div>
      </div>

      <div id="act3Stage">
        <div class="act3Horizon"></div>
        <div class="act3Ground"></div>

        <div id="act3Nodes">
          <button data-node="flower" class="act3Node flower" type="button">
            <span>✿</span>
            <small>algo quiere crecer aquí</small>
          </button>

          <button data-node="place" class="act3Node place" type="button">
            <span>⌂</span>
            <small>un lugar sin historia</small>
          </button>

          <button data-node="cats" class="act3Node cats" type="button">
            <span>🐾</span>
            <small>ellos también pueden elegir</small>
          </button>

          <button data-node="sky" class="act3Node sky" type="button">
            <span>✦</span>
            <small>el cielo todavía tiene espacio</small>
          </button>
        </div>

        <div id="act3Cats">
          <button class="act3Cat mewo" data-cat="mewo" type="button">
            <img src="mewo_idle.png" alt="">
            <small>Mewo</small>
          </button>

          <button class="act3Cat marie" data-cat="marie" type="button">
            <img src="cat_gray_idle.png" alt="">
            <small>Marie</small>
          </button>

          <button class="act3Cat tuluz" data-cat="tuluz" type="button">
            <img src="cat_orange_idle.png" alt="">
            <small>Tuluz</small>
          </button>
        </div>

        <button id="act3FinalGap" type="button">
          <span>＋</span>
          <small>SIN FUENTE</small>
        </button>

        <button id="act3SecretStar" type="button" aria-label="Una estrella diminuta">·</button>
      </div>

      <div id="act3Title">
        <small>ACTO III</small>
        <h2>LO QUE TODAVÍA NOS FALTA VIVIR</h2>
        <p>El mundo ya no está intentando volver atrás.</p>
      </div>

      <div id="act3Cine" aria-hidden="true">
        <div id="act3CineShade"></div>
        <div id="act3CineVisual">
          <div id="act3CineMark">·</div>
          <div id="act3CineMemory"></div>
        </div>

        <div id="act3CineWords">
          <p id="act3CineText"></p>
          <small id="act3CineSub"></small>
          <i id="act3CineTap">toca para continuar</i>
        </div>

        <div id="act3Choices"></div>
      </div>

      <div id="act3Ending"></div>
      <div id="act3PostWorld"></div>
    `;

    document.body.appendChild(root);

    stage=root.querySelector('#act3Stage');
    cine=root.querySelector('#act3Cine');
    cineText=root.querySelector('#act3CineText');
    cineSub=root.querySelector('#act3CineSub');
    cineMark=root.querySelector('#act3CineMark');
    choicesBox=root.querySelector('#act3Choices');

    cine.addEventListener(
      'click',
      e=>{
        if(
          e.target.closest(
            '#act3Choices button'
          )
        ) return;

        if(
          !cine.classList.contains('show') ||
          sceneLocked
        ) return;

        nextFrame();
      }
    );

    root.addEventListener(
      'pointerdown',
      resumeAudio,
      {passive:true}
    );

    root.querySelectorAll(
      '[data-node]'
    ).forEach(
      b=>{
        b.addEventListener(
          'click',
          ()=>{
            openNode(
              b.dataset.node
            );
          }
        );
      }
    );

    root.querySelectorAll(
      '[data-cat]'
    ).forEach(
      b=>{
        b.addEventListener(
          'click',
          ()=>{
            catMoment(
              b.dataset.cat
            );
          }
        );
      }
    );

    root.querySelector(
      '#act3FinalGap'
    ).addEventListener(
      'click',
      chooseRoute
    );

    root.querySelector(
      '#act3SecretStar'
    ).addEventListener(
      'click',
      secretEpilogue
    );

    return true;
  }

  /* =======================================================
     VISUAL LIFECYCLE / DEV CLEAN JUMPS
  ======================================================= */

  function destroyVisualRoot({restoreField=false}={}){
    try{
      document.getElementById('act3Root')?.remove();
    }catch(_){}

    root=null;
    stage=null;
    cine=null;
    cineText=null;
    cineSub=null;
    cineMark=null;
    choicesBox=null;
    sceneFrames=[];
    sceneIndex=0;
    sceneDone=null;
    sceneLocked=false;

    document.body.classList.remove(
      'act3-active',
      'act3-v2-field'
    );

    document.getElementById('act2Root')
      ?.classList.remove('act2-under-act3');

    if(restoreField){
      window.ParadoxFieldTheme?.set?.('night');
    }
  }

  function cleanForeignDevLayers(){
    if(!IS_DEV) return;

    [...document.body.classList].forEach(
      cls=>{
        if(
          cls.startsWith('act2-') ||
          cls.startsWith('card100-')
        ){
          document.body.classList.remove(cls);
        }
      }
    );

    document
      .querySelectorAll('[id^="act2"]')
      .forEach(el=>{
        el.classList.remove(
          'show',
          'active',
          'open',
          'playing'
        );
      });

    [
      'catGarden',
      'basket2Overlay',
      'basket2Reader',
      'gameOverlay',
      'secretLetterReader'
    ].forEach(id=>{
      document.getElementById(id)
        ?.classList.remove('show','active','open');
    });
  }

  function resetDevState(action){
    save({
      started:true,
      dawnSeen:action!=='start',
      archiveOfferSeen:false,
      archiveRefused:false,
      nodes:{...DEFAULT.nodes},
      choices:{...DEFAULT.choices},
      route:'',
      endingSeen:false,
      newMemoryDone:false,
      secretSeen:false,
      postVisits:0
    });
  }

  function deactivate(opts={}){
    destroyVisualRoot({
      restoreField:
        opts.restoreField!==false
    });
  }

  /* =======================================================
     ACTIVATION
  ======================================================= */

  function activate(){
    build();

    const act2Root=
      document.getElementById(
        'act2Root'
      );

    act2Root?.classList.add(
      'act2-under-act3'
    );

    root.classList.add(
      'active'
    );

    document.body.classList.add(
      'act3-active'
    );

    if(
      !state.started
    ){
      save({
        started:true
      });

      opening();
      return;
    }

    if(
      state.endingSeen
    ){
      renderPostWorld();
      return;
    }

    renderWorld();

    if(!state.dawnSeen){
      opening();
    }
  }

  /* =======================================================
     SCENE SYSTEM
  ======================================================= */

  function playScene(
    frames,
    opts={}
  ){
    sceneFrames=frames || [];
    sceneIndex=0;
    sceneDone=
      typeof opts.onDone==='function'
        ? opts.onDone
        : null;

    sceneLocked=false;

    choicesBox.innerHTML='';
    choicesBox.classList.remove(
      'show'
    );

    cine.dataset.theme=
      opts.theme || 'future';

    cine.classList.add(
      'show'
    );

    cine.setAttribute(
      'aria-hidden',
      'false'
    );

    renderFrame();
  }

  function renderFrame(){
    const frame=
      sceneFrames[
        sceneIndex
      ];

    if(!frame){
      closeScene();
      return;
    }

    cineMark.textContent=
      frame.mark ?? '·';

    cineText.textContent=
      frame.text || '';

    cineSub.textContent=
      frame.sub || '';

    cine.dataset.memory=
      frame.memory || '';

    if(
      frame.choices &&
      frame.choices.length
    ){
      sceneLocked=true;
      renderChoices(
        frame.choices
      );
    }else{
      sceneLocked=false;
      choicesBox.innerHTML='';
      choicesBox.classList.remove(
        'show'
      );
    }

    if(frame.className){
      cine.className=
        `show ${frame.className}`;
    }else{
      cine.className='show';
    }

    note(
      frame.freq ||
      330+
      sceneIndex*24,
      .18,
      .012
    );
  }

  function nextFrame(){
    sceneIndex++;

    if(
      sceneIndex>=
      sceneFrames.length
    ){
      closeScene();
      return;
    }

    renderFrame();
  }

  function closeScene(){
    cine.classList.remove(
      'show'
    );

    cine.setAttribute(
      'aria-hidden',
      'true'
    );

    choicesBox.innerHTML='';
    choicesBox.classList.remove(
      'show'
    );

    sceneFrames=[];
    sceneIndex=0;
    sceneLocked=false;

    const done=sceneDone;
    sceneDone=null;

    setTimeout(
      ()=>{
        done?.();
      },
      250
    );
  }

  function renderChoices(list){
    choicesBox.innerHTML='';

    list.forEach(
      item=>{
        const b=
          document.createElement(
            'button'
          );

        b.type='button';
        b.textContent=
          item.label;

        if(item.tone){
          b.dataset.tone=
            item.tone;
        }

        b.addEventListener(
          'click',
          e=>{
            e.stopPropagation();

            choicesBox
              .querySelectorAll(
                'button'
              )
              .forEach(
                x=>x.disabled=true
              );

            item.onChoose?.();

            if(item.next===false){
              return;
            }

            sceneLocked=false;
            nextFrame();
          }
        );

        choicesBox.appendChild(
          b
        );
      }
    );

    choicesBox.classList.add(
      'show'
    );
  }

  /* =======================================================
     OPENING — FIRST DAWN
  ======================================================= */

  function opening(){
    root.classList.add(
      'opening'
    );

    setWarmth(0);

    const frames=[
      {
        mark:'',
        text:'',
        sub:'',
        memory:'dark'
      },
      {
        mark:'·',
        text:'Durante un momento no ocurre nada.',
        sub:'',
        memory:'dark'
      },
      {
        mark:'☾',
        text:'La luna sigue allí.',
        sub:'pero por primera vez parece estar terminando su turno.',
        memory:'moon'
      },
      {
        mark:'',
        text:'El cielo cambia de color.',
        sub:'ningún archivo sabe qué versión debe cargar.',
        memory:'dawn'
      },
      {
        mark:'☀',
        text:'No está volviendo el día.',
        sub:'está llegando uno que todavía no había ocurrido.',
        memory:'sunrise'
      }
    ];

    if(noChangeEligible()){
      frames.push({
        mark:'▣',
        text:'STABLE BUILD AVAILABLE',
        sub:'Una versión anterior todavía puede conservarse sin cambios.',
        memory:'archive-offer',
        choices:[
          {
            label:'NO CAMBIES',
            tone:'archive',
            next:false,
            onChoose:()=>{
              save({
                archiveOfferSeen:true,
                route:'no-change'
              });

              setTimeout(
                ()=>{
                  cine.classList.remove(
                    'show'
                  );

                  runNoChangeEnding();
                },
                450
              );
            }
          },
          {
            label:'DEJAR QUE AMANEZCA',
            tone:'grow',
            onChoose:()=>{
              save({
                archiveOfferSeen:true,
                archiveRefused:true
              });
            }
          }
        ]
      });
    }

    frames.push(
      {
        mark:'☀',
        text:'Mewo abre los ojos.',
        sub:'Marie se estira. Tuluz mira algo que ninguno de los otros había visto.',
        memory:'cats'
      },
      {
        mark:'✿',
        text:'Hay lugares vacíos.',
        sub:'esta vez no parecen errores.',
        memory:'field'
      },
      {
        mark:'',
        text:'No hay nada que recuperar aquí.',
        sub:'',
        memory:'new'
      },
      {
        mark:'♡',
        text:'Entonces hagamos algo que todavía no existe.',
        sub:'',
        memory:'future'
      }
    );

    playScene(
      frames,
      {
        theme:'dawn',
        onDone:()=>{
          save({
            dawnSeen:true
          });

          root.classList.remove(
            'opening'
          );

          root.classList.add(
            'dawn'
          );

          setWarmth(.022);

          showTitle();

          setTimeout(
            renderWorld,
            1600
          );
        }
      }
    );
  }

  function showTitle(){
    const title=
      root.querySelector(
        '#act3Title'
      );

    title.classList.add(
      'show'
    );

    setTimeout(
      ()=>title.classList.remove(
        'show'
      ),
      3600
    );
  }

  /* =======================================================
     MAIN FUTURE WORLD
  ======================================================= */

  function renderWorld(){
    if(!root) return;

    root.classList.toggle(
      'route-remember',
      state.route==='remember'
    );

    root.classList.toggle(
      'route-release',
      state.route==='release'
    );

    root.classList.toggle(
      'route-grow',
      state.route==='grow'
    );

    root.querySelectorAll(
      '[data-node]'
    ).forEach(
      b=>{
        const id=
          b.dataset.node;

        b.classList.toggle(
          'done',
          Boolean(
            state.nodes[id]
          )
        );

        b.disabled=
          Boolean(
            state.nodes[id]
          );
      }
    );

    const allDone=
      Object.values(
        state.nodes
      ).every(Boolean);

    root.querySelector(
      '#act3FinalGap'
    ).classList.toggle(
      'show',
      allDone &&
      !state.route
    );

    if(
      state.endingSeen
    ){
      renderPostWorld();
    }
  }

  const NODE_DATA={
    flower:{
      mark:'✿',
      intro:[
        {
          text:'Aquí podría crecer una flor.',
          sub:'El mundo busca una referencia anterior y no encuentra ninguna.'
        },
        {
          text:'No tiene por qué ser igual a las otras.',
          sub:'Puedes decidir qué hacer con este espacio.'
        }
      ],
      choices:[
        {
          label:'PLANTAR UNA COMO LAS DE ANTES',
          tone:'remember',
          result:[
            'El rosa vuelve a aparecer.',
            'No es la misma flor. Solo recuerda su forma.'
          ]
        },
        {
          label:'DEJAR LA TIERRA VACÍA',
          tone:'release',
          result:[
            'La tierra queda abierta.',
            'No todo espacio necesita llenarse.'
          ]
        },
        {
          label:'DEJAR CRECER ALGO NUEVO',
          tone:'grow',
          result:[
            'Aparece un color que el campo nunca había usado.',
            'No existe una copia con la cual compararlo.'
          ]
        }
      ]
    },

    place:{
      mark:'⌂',
      intro:[
        {
          text:'Este rincón no tiene nombre.',
          sub:'No hubo refugio aquí antes.'
        },
        {
          text:'Podría permanecer así.',
          sub:'O convertirse en algo que todavía no conocemos.'
        }
      ],
      choices:[
        {
          label:'RECONSTRUIR UN RINCÓN CONOCIDO',
          tone:'remember',
          result:[
            'Una forma familiar vuelve.',
            'Sabes exactamente dónde sentarte.'
          ]
        },
        {
          label:'DEJARLO ABIERTO',
          tone:'release',
          result:[
            'El camino atraviesa el lugar sin detenerse.',
            'La ausencia también puede ser parte del paisaje.'
          ]
        },
        {
          label:'CONSTRUIR UN MIRADOR NUEVO',
          tone:'grow',
          result:[
            'El Claro gana un lugar que jamás tuvo.',
            'Tuluz llega primero.'
          ]
        }
      ]
    },

    cats:{
      mark:'🐾',
      intro:[
        {
          text:'Mewo, Marie y Tuluz esperan.',
          sub:'No parece que estén esperando una orden.'
        },
        {
          text:'Quizá también pueden tener costumbres que nunca programamos.',
          sub:''
        }
      ],
      choices:[
        {
          label:'VOLVER A SUS RUTINAS CONOCIDAS',
          tone:'remember',
          result:[
            'Mewo encuentra su lugar. Marie repite su vuelta. Tuluz observa.',
            'Todo encaja.'
          ]
        },
        {
          label:'NO DECIDIR POR ELLOS',
          tone:'release',
          result:[
            'Durante unos segundos ninguno hace nada.',
            'Después cada uno se va por un camino diferente.'
          ]
        },
        {
          label:'INVENTAR UN JUEGO NUEVO',
          tone:'grow',
          result:[
            'Tuluz corre primero.',
            'Marie lo persigue. Mewo tarda un momento... y después también.'
          ]
        }
      ]
    },

    sky:{
      mark:'✦',
      intro:[
        {
          text:'El cielo tiene espacio.',
          sub:'Las constelaciones antiguas no lo ocupan todo.'
        },
        {
          text:'No necesitas encontrar una estrella que ya estuviera allí.',
          sub:''
        }
      ],
      choices:[
        {
          label:'VOLVER A DIBUJAR LA CONSTELACIÓN ANTERIOR',
          tone:'remember',
          result:[
            'Las estrellas forman algo conocido.',
            'Todavía sabes encontrarlo.'
          ]
        },
        {
          label:'DEJAR ESA PARTE DEL CIELO VACÍA',
          tone:'release',
          result:[
            'No aparece ninguna figura.',
            'El cielo sigue siendo cielo.'
          ]
        },
        {
          label:'DIBUJAR OTRA CONSTELACIÓN',
          tone:'grow',
          result:[
            'Cinco estrellas se unen por primera vez.',
            'Ningún registro tiene su nombre.'
          ]
        }
      ]
    }
  };

  function openNode(id){
    if(
      !NODE_DATA[id] ||
      state.nodes[id] ||
      state.route
    ) return;

    const data=NODE_DATA[id];

    const choiceFrame={
      mark:data.mark,
      text:'¿Qué quieres hacer aquí?',
      sub:'',
      choices:
        data.choices.map(
          c=>({
            label:c.label,
            tone:c.tone,
            onChoose:()=>{
              registerChoice(
                c.tone
              );

              const nodes={
                ...state.nodes,
                [id]:true
              };

              save({
                nodes
              });

              root.dataset.lastChoice=
                c.tone;

              setTimeout(
                ()=>{
                  playScene(
                    [
                      {
                        mark:data.mark,
                        text:c.result[0],
                        sub:c.result[1],
                        memory:`node-${id}-${c.tone}`
                      }
                    ],
                    {
                      theme:c.tone,
                      onDone:()=>{
                        delete root.dataset.lastChoice;
                        renderWorld();
                      }
                    }
                  );
                },
                320
              );
            }
          })
        )
    };

    playScene(
      [
        ...data.intro.map(
          x=>({
            ...x,
            mark:data.mark,
            memory:`node-${id}`
          })
        ),
        choiceFrame
      ],
      {
        theme:'future-node'
      }
    );
  }

  function registerChoice(tone){
    const choices={
      ...state.choices
    };

    if(
      tone in choices
    ){
      choices[tone]++;
    }

    save({
      choices
    });
  }

  function catMoment(id){
    if(
      !state.dawnSeen ||
      state.route
    ) return;

    const lines={
      mewo:[
        'Mewo se queda a tu lado.',
        'No parece estar comprobando si este lugar existía antes.'
      ],
      marie:[
        'Marie mira el amanecer.',
        'Esta vez no compara lo que ve con ninguna versión anterior.'
      ],
      tuluz:[
        'Tuluz encuentra otro camino.',
        'Naturalmente, es uno que el Archivo nunca tuvo.'
      ]
    };

    const line=lines[id];

    playScene(
      [
        {
          mark:
            id==='mewo'
              ? '🐾'
              : id==='marie'
                ? '☾'
                : '✦',
          text:line[0],
          sub:line[1],
          memory:`cat-${id}`
        }
      ],
      {
        theme:'cat-moment'
      }
    );
  }

  /* =======================================================
     ROUTE CHOICE
  ======================================================= */

  function routeTendency(){
    const c=state.choices||{};
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

    const leaders=Object.keys(values)
      .filter(k=>values[k]===max);

    return max>=2 && leaders.length===1
      ? leaders[0]
      : '';
  }

  function chooseRoute(){
    if(
      state.route ||
      !Object.values(
        state.nodes
      ).every(Boolean)
    ) return;

    const tendency=routeTendency();

    const tendencyText={
      remember:'Durante el camino elegiste conservar más de una vez.',
      release:'Durante el camino dejaste espacio más de una vez.',
      grow:'Durante el camino elegiste lo nuevo más de una vez.'
    };

    const markLabel=(route,label)=>
      tendency===route
        ? `${label}  ♡`
        : label;

    playScene(
      [
        {
          mark:'□',
          text:tendency
            ? 'El campo recuerda cómo caminaste.'
            : 'Queda un último espacio.',
          sub:tendency
            ? tendencyText[tendency]
            : 'No todas tus decisiones apuntaron al mismo lugar.'
        },
        {
          mark:'□',
          text:'SOURCE: NONE',
          sub:'No falta ningún archivo. Lo que ocurra aquí no puede venir de un respaldo.'
        },
        {
          mark:'♡',
          text:'Este espacio no pertenece al pasado.',
          sub:'Tus decisiones te trajeron hasta aquí. La última sigue siendo tuya.',
          choices:[
            {
              label:markLabel(
                'remember',
                'GUARDAR LO QUE YA CONOCEMOS'
              ),
              tone:'remember',
              next:false,
              onChoose:()=>{
                chooseEnding(
                  'remember'
                );
              }
            },
            {
              label:markLabel(
                'release',
                'DEJAR ESPACIO'
              ),
              tone:'release',
              next:false,
              onChoose:()=>{
                chooseEnding(
                  'release'
                );
              }
            },
            {
              label:markLabel(
                'grow',
                'HACER ALGO NUEVO'
              ),
              tone:'grow',
              next:false,
              onChoose:()=>{
                chooseEnding(
                  'grow'
                );
              }
            }
          ]
        }
      ],
      {
        theme:'route-choice'
      }
    );
  }

  function chooseEnding(route){
    save({
      route
    });

    cine.classList.remove(
      'show'
    );

    root.classList.add(
      `route-${route}`
    );

    setTimeout(
      ()=>{
        if(route==='remember'){
          runRememberEnding();
        }else if(route==='release'){
          runReleaseEnding();
        }else{
          runGrowEnding();
        }
      },
      500
    );
  }

  /* =======================================================
     ROUTE — RECORDAR
  ======================================================= */

  function runRememberEnding(){
    setWarmth(.012);

    root.classList.add(
      'ending-remember'
    );

    playScene(
      [
        {
          mark:'✿',
          text:'El campo recuerda.',
          sub:'Los tulipanes encuentran posiciones familiares.'
        },
        {
          mark:'☾',
          text:'La luna vuelve a parecerse a la de antes.',
          sub:'El amanecer permanece detrás de ella.'
        },
        {
          mark:'🐾',
          text:'Mewo vuelve a su rincón.',
          sub:'Marie toma el mismo camino. Tuluz aprende dónde debería detenerse.'
        },
        {
          mark:'◇',
          text:'Todo es hermoso.',
          sub:'Todo es reconocible.'
        },
        {
          mark:'·',
          text:'Mañana las flores volverán a estar exactamente aquí.',
          sub:'Y al día siguiente también.'
        },
        {
          mark:'♡',
          text:'Recordar puede mantener un lugar cerca.',
          sub:'Solo no dejes que sea el único lugar donde puedas vivir.'
        }
      ],
      {
        theme:'remember',
        onDone:()=>{
          finishRoute(
            'recordar'
          );
        }
      }
    );
  }

  /* =======================================================
     ROUTE — DEJAR IR
  ======================================================= */

  function runReleaseEnding(){
    setWarmth(.016);

    root.classList.add(
      'ending-release'
    );

    playScene(
      [
        {
          mark:'□',
          text:'Una cosa deja de estar.',
          sub:'No ocurre nada terrible.'
        },
        {
          mark:'',
          text:'Después otra.',
          sub:'El campo respira un poco más.'
        },
        {
          mark:'🐾',
          text:'Mewo todavía sabe dónde encontrarte.',
          sub:'Marie todavía se acomoda cerca. Tuluz sigue cruzando lugares nuevos.'
        },
        {
          mark:'☀',
          text:'El amanecer entra en los espacios que quedaron libres.',
          sub:''
        },
        {
          mark:'♡',
          text:'No todo tiene que quedarse para haber significado algo.',
          sub:''
        }
      ],
      {
        theme:'release',
        onDone:()=>{
          finishRoute(
            'dejar-ir'
          );
        }
      }
    );
  }

  /* =======================================================
     ROUTE — SEGUIR CRECIENDO
  ======================================================= */

  function runGrowEnding(){
    setWarmth(.032);

    root.classList.add(
      'ending-grow'
    );

    /*
      Esta ruta NO termina con texto inmediatamente.
      Primero crea una memoria que no tiene fuente en Acto I.
    */
    playScene(
      [
        {
          mark:'✿',
          text:'No hay nada que recuperar.',
          sub:'Perfecto.'
        },
        {
          mark:'☀',
          text:'Vamos a hacer el primer recuerdo que el Archivo nunca pudo conocer.',
          sub:''
        }
      ],
      {
        theme:'grow',
        onDone:()=>{
          newMemory();
        }
      }
    );
  }

  function newMemory(){
    const ending=
      root.querySelector(
        '#act3Ending'
      );

    ending.className=
      'show new-memory';

    ending.innerHTML=`
      <div class="act3NewMemory">
        <header>
          <small>
            SOURCE: NONE
          </small>
          <strong>
            NEW FRAME CREATION
          </strong>
        </header>

        <button
          id="act3NewFlower"
          type="button"
        >
          <i></i>
          <span>
            toca la tierra
          </span>
        </button>

        <div id="act3NewCats">
          <img src="mewo_idle.png" alt="">
          <img src="cat_gray_idle.png" alt="">
          <img src="cat_orange_idle.png" alt="">
        </div>

        <div id="act3NewSky">
          <button data-new-star="1" type="button">·</button>
          <button data-new-star="2" type="button">·</button>
          <button data-new-star="3" type="button">·</button>
          <button data-new-star="4" type="button">·</button>
          <button data-new-star="5" type="button">·</button>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none">
            <polyline id="act3NewConstellation" points=""></polyline>
          </svg>
        </div>

        <p id="act3NewMemoryLine">
          Esto no ocurrió antes.
        </p>
      </div>
    `;

    const flower=
      ending.querySelector(
        '#act3NewFlower'
      );

    const line=
      ending.querySelector(
        '#act3NewMemoryLine'
      );

    let flowerStep=0;
    let stars=[];

    flower.addEventListener(
      'click',
      ()=>{
        if(flowerStep>=4) return;

        flowerStep++;

        flower.dataset.step=
          String(flowerStep);

        note(
          310+
          flowerStep*55,
          .24,
          .025
        );

        const text=[
          '',
          'La tierra se abre.',
          'Aparece un tallo que nunca estuvo aquí.',
          'Los pétalos no coinciden con ninguna flor anterior.',
          'Y aun así ya pertenece al campo.'
        ];

        line.textContent=
          text[flowerStep];

        if(flowerStep>=4){
          flower
            .querySelector('span')
            .textContent=
              'una flor nueva';

          ending.classList.add(
            'flower-created'
          );
        }

        checkNewMemory();
      }
    );

    ending.querySelectorAll(
      '[data-new-star]'
    ).forEach(
      (b,i)=>{
        b.addEventListener(
          'click',
          ()=>{
            if(
              b.classList.contains(
                'chosen'
              )
            ) return;

            b.classList.add(
              'chosen'
            );

            const rect=
              b.parentElement
                .getBoundingClientRect();

            const br=
              b.getBoundingClientRect();

            const x=
              (
                (
                  br.left+
                  br.width/2-
                  rect.left
                )/
                rect.width
              )*100;

            const y=
              (
                (
                  br.top+
                  br.height/2-
                  rect.top
                )/
                rect.height
              )*100;

            stars.push(
              [x,y]
            );

            ending
              .querySelector(
                '#act3NewConstellation'
              )
              .setAttribute(
                'points',
                stars
                  .map(
                    p=>p.join(',')
                  )
                  .join(' ')
              );

            note(
              520+
              stars.length*47,
              .18,
              .018
            );

            if(stars.length===5){
              line.textContent=
                'Cinco estrellas forman algo que nunca tuvo nombre.';
            }

            checkNewMemory();
          }
        );
      }
    );

    function checkNewMemory(){
      if(
        flowerStep>=4 &&
        stars.length>=5 &&
        !state.newMemoryDone
      ){
        save({
          newMemoryDone:true
        });

        ending
          .querySelector(
            '#act3NewCats'
          )
          .classList.add(
            'join'
          );

        line.textContent=
          'Mewo, Marie y Tuluz llegan sin que nadie los llame.';

        setTimeout(
          ()=>{
            ending.classList.remove(
              'show'
            );

            ending.innerHTML='';

            finalGrowWords();
          },
          2600
        );
      }
    }
  }

  function finalGrowWords(){
    playScene(
      [
        {
          mark:'♡',
          text:'No quiero solamente recordarte.',
          sub:''
        },
        {
          mark:'♡',
          text:'Quiero seguir conociéndote.',
          sub:''
        },
        {
          mark:'♡',
          text:'Quiero seguir eligiéndote.',
          sub:''
        },
        {
          mark:'♡',
          text:'Y quiero seguir haciendo recuerdos contigo.',
          sub:''
        },
        {
          mark:'□',
          text:'Para lo que todavía nos falta vivir ♡',
          sub:''
        },
        {
          mark:'🐾',
          text:'Nos vemos en el próximo recuerdo. ♡',
          sub:''
        }
      ],
      {
        theme:'grow-final',
        onDone:()=>{
          finishRoute(
            'seguir-creciendo'
          );
        }
      }
    );
  }

  /* =======================================================
     ROUTE — NO CAMBIES / ARCHIVO
  ======================================================= */

  function runNoChangeEnding(){
    setWarmth(0);

    root.classList.add(
      'route-no-change'
    );

    const ending=
      root.querySelector(
        '#act3Ending'
      );

    ending.className=
      'show archive-ending';

    ending.innerHTML=`
      <div class="act3ArchiveEnding">
        <header>
          <span>
            CURRENT BUILD
          </span>
          <small>
            STABILITY: 100%
          </small>
        </header>

        <div id="act3ArchiveField">
          <i>✿</i><i>✿</i><i>✿</i><i>✿</i><i>✿</i>
          <i>✿</i><i>✿</i><i>✿</i><i>✿</i><i>✿</i>
        </div>

        <div id="act3ArchiveCats">
          <img src="mewo_idle.png" alt="">
          <img src="cat_gray_idle.png" alt="">
          <img src="cat_orange_idle.png" alt="">
        </div>

        <div id="act3ArchiveText">
          <span>NO NEW FRAMES</span>
          <small>WORLD LOCKED</small>
        </div>

        <button id="act3ArchiveObserve" type="button">
          ESPERAR
        </button>
      </div>
    `;

    const text=
      ending.querySelector(
        '#act3ArchiveText'
      );

    const button=
      ending.querySelector(
        '#act3ArchiveObserve'
      );

    let waits=0;

    button.addEventListener(
      'click',
      ()=>{
        waits++;

        const lines=[
          [
            'Mewo repite el mismo movimiento.',
            'FRAME 143'
          ],
          [
            'Marie parpadea en el mismo instante.',
            'FRAME 143'
          ],
          [
            'Tuluz vuelve al punto donde debería estar.',
            'FRAME 143'
          ],
          [
            'Nada se perdió.',
            'Nada cambió.'
          ],
          [
            'NO NEW FRAMES',
            'WORLD LOCKED'
          ]
        ];

        const l=
          lines[
            Math.min(
              waits-1,
              lines.length-1
            )
          ];

        text
          .querySelector('span')
          .textContent=
            l[0];

        text
          .querySelector('small')
          .textContent=
            l[1];

        ending.classList.add(
          'archive-tick'
        );

        setTimeout(
          ()=>ending.classList.remove(
            'archive-tick'
          ),
          180
        );

        if(waits>=5){
          button.disabled=true;
          button.textContent=
            'NO CAMBIES';

          setTimeout(
            ()=>{
              save({
                endingSeen:true,
                route:'no-change'
              });

              renderPostWorld();
            },
            1500
          );
        }
      }
    );
  }

  /* =======================================================
     FINISH / POST-STORY WORLD
  ======================================================= */

  function finishRoute(routeName){
    save({
      endingSeen:true
    });

    root.dataset.ending=
      routeName;

    setTimeout(
      renderPostWorld,
      500
    );
  }

  function renderPostWorld(){
    const post=
      root.querySelector(
        '#act3PostWorld'
      );

    const route=
      state.route;

    root.classList.add(
      'post-world'
    );

    root.querySelector(
      '#act3Ending'
    ).className='';

    root.querySelector(
      '#act3Ending'
    ).innerHTML='';

    let title='';
    let line='';

    if(route==='remember'){
      title='UN LUGAR QUE RECUERDA';
      line='Todo sigue donde sabes encontrarlo.';
    }else if(route==='release'){
      title='UN LUGAR CON ESPACIO';
      line='Algunas cosas ya no están. El campo continúa.';
    }else if(route==='grow'){
      title='UN LUGAR QUE SIGUE CRECIENDO';
      line='Mañana puede ocurrir algo que hoy todavía no existe.';
    }else{
      title='STABLE BUILD';
      line='NO NEW FRAMES';
    }

    post.className=
      `show route-${route}`;

    post.innerHTML=`
      <div class="act3PostCard">
        <small>
          ACTO III
        </small>

        <h3>
          ${title}
        </h3>

        <p id="act3PostLine">
          ${line}
        </p>

        <div class="act3PostActions">
          <button data-post="walk" type="button">
            pasear
          </button>

          <button data-post="sit" type="button">
            sentarse
          </button>

          <button data-post="sky" type="button">
            mirar el cielo
          </button>
        </div>
      </div>
    `;

    post.querySelectorAll(
      '[data-post]'
    ).forEach(
      b=>{
        b.addEventListener(
          'click',
          ()=>{
            postMoment(
              b.dataset.post
            );
          }
        );
      }
    );

    const star=
      root.querySelector(
        '#act3SecretStar'
      );

    star.classList.toggle(
      'show',
      route==='grow' &&
      secretEligible() &&
      !state.secretSeen
    );
  }

  function postMoment(type){
    const line=
      root.querySelector(
        '#act3PostLine'
      );

    const route=state.route;

    const data={
      remember:{
        walk:[
          'Los tulipanes están exactamente donde los dejaste.',
          'Mewo vuelve a recorrer el mismo sendero.'
        ],
        sit:[
          'El lugar sigue siendo cálido.',
          'Conoces cada sonido antes de escucharlo.'
        ],
        sky:[
          'La constelación sigue intacta.',
          'No aparece ninguna estrella fuera de ella.'
        ]
      },

      release:{
        walk:[
          'El camino atraviesa un lugar donde antes había algo.',
          'No necesitas recordar qué era para seguir caminando.'
        ],
        sit:[
          'Hay más espacio alrededor.',
          'El silencio ya no parece una ausencia.'
        ],
        sky:[
          'Algunas figuras desaparecieron.',
          'Las estrellas que quedan no parecen menos importantes.'
        ]
      },

      grow:{
        walk:[
          'Un brote nuevo apareció lejos del sendero.',
          'Tuluz ya lo encontró.'
        ],
        sit:[
          'Marie escogió otro lugar para dormir.',
          'Mewo decide acompañarla.'
        ],
        sky:[
          'Hay una estrella que ayer no estaba allí.',
          'Tal vez mañana haya otra.'
        ]
      },

      'no-change':{
        walk:[
          'FRAME 143',
          'FRAME 143'
        ],
        sit:[
          'NO CHANGES DETECTED',
          'NO CHANGES DETECTED'
        ],
        sky:[
          'SKY CHECKSUM OK',
          'SKY CHECKSUM OK'
        ]
      }
    };

    const lines=
      data[route]?.[type] ||
      ['...'];

    const visits=
      Number(
        state.postVisits||0
      )+1;

    save({
      postVisits:visits
    });

    line.textContent=
      route==='grow'
        ? lines[
            visits%
            lines.length
          ]
        : lines[
            Math.min(
              visits-1,
              lines.length-1
            )
          ];

    note(
      route==='no-change'
        ? 143
        : 390+
          visits*20,
      .18,
      .016
    );
  }

  /* =======================================================
     SECRET ABSOLUTE EPILOGUE
  ======================================================= */

  function secretEpilogue(){
    if(
      state.secretSeen ||
      state.route!=='grow' ||
      !secretEligible()
    ) return;

    save({
      secretSeen:true
    });

    root.querySelector(
      '#act3SecretStar'
    ).classList.remove(
      'show'
    );

    playScene(
      [
        {
          mark:'·',
          text:'Ahora sabes.',
          sub:''
        },
        {
          mark:'',
          text:'El Archivo registró lo que ocurrió.',
          sub:'Los fragmentos registraron lo que casi se perdió.'
        },
        {
          mark:'✿',
          text:'Pero esta flor no aparece en ninguno de los dos.',
          sub:'Nació después.'
        },
        {
          mark:'✦',
          text:'Una estrella nueva aparece lejos de tu constelación.',
          sub:'No la tocaste.'
        },
        {
          mark:'🐾',
          text:'Hay una huella junto a ella.',
          sub:'Tampoco la pusiste tú.'
        },
        {
          mark:'☀',
          text:'El mundo sigue haciendo cosas cuando no estás mirando.',
          sub:''
        },
        {
          mark:'♡',
          text:'Entonces esto nunca fue un archivo.',
          sub:'Solo era un lugar donde algo aprendió a seguir viviendo.'
        },
        {
          mark:'·',
          text:'Hasta el próximo recuerdo.',
          sub:''
        }
      ],
      {
        theme:'secret',
        onDone:()=>{
          renderPostWorld();
        }
      }
    );
  }

  /* =======================================================
     DEV
  ======================================================= */

  function reset(){
    try{
      localStorage.removeItem(
        KEY
      );
    }catch(_){}

    state=load();
    destroyVisualRoot({restoreField:false});
    activate();
  }

  function debug(action){
    if(!IS_DEV) return;

    /* Cada botón DEV abre una escena limpia, no una capa nueva. */
    cleanForeignDevLayers();
    destroyVisualRoot({restoreField:false});
    state=load();
    resetDevState(action);

    build();

    root.classList.add(
      'active',
      'dawn'
    );

    document.body.classList.add(
      'act3-active'
    );

    if(action==='start'){
      opening();
      return;
    }

    if(action==='remember'){
      save({
        route:'remember'
      });
      runRememberEnding();
      return;
    }

    if(action==='release'){
      save({
        route:'release'
      });
      runReleaseEnding();
      return;
    }

    if(action==='grow'){
      save({
        route:'grow'
      });
      runGrowEnding();
      return;
    }

    if(action==='no-change'){
      save({
        route:'no-change'
      });
      runNoChangeEnding();
      return;
    }

    if(action==='secret'){
      /*
        DEV permite ver el epílogo aunque no tengas los 7 fragmentos.
        No altera las condiciones reales del juego.
      */
      save({
        route:'grow',
        endingSeen:true,
        secretSeen:false
      });

      const original=secretEligible;

      playScene(
        [
          {
            mark:'·',
            text:'Ahora sabes.',
            sub:'DEV · vista previa del epílogo secreto.'
          },
          {
            mark:'✿',
            text:'Esta flor no pertenece a ninguna versión anterior.',
            sub:''
          },
          {
            mark:'✦',
            text:'Una estrella aparece sin que la hayas colocado.',
            sub:''
          },
          {
            mark:'♡',
            text:'El mundo sigue viviendo fuera del archivo.',
            sub:''
          }
        ],
        {
          theme:'secret',
          onDone:renderPostWorld
        }
      );

      return;
    }

    if(action==='journey'){
      save({
        dawnSeen:true,
        nodes:{
          flower:false,
          place:false,
          cats:false,
          sky:false
        },
        choices:{
          remember:0,
          release:0,
          grow:0
        },
        route:'',
        endingSeen:false
      });

      setWarmth(.022);
      renderWorld();
      return;
    }

    if(action==='world'){
      /*
        Compatibilidad con un DEV anterior:
        ahora "world" abre también el recorrido real en vez de
        saltar directamente al final de Flor/Lugar/Gatos/Cielo.
      */
      save({
        dawnSeen:true,
        nodes:{
          flower:false,
          place:false,
          cats:false,
          sky:false
        },
        choices:{
          remember:0,
          release:0,
          grow:0
        },
        route:'',
        endingSeen:false
      });

      setWarmth(.022);
      renderWorld();
    }
  }

  window.addEventListener(
    'paradox-act2-finished',
    ()=>{
      /*
        No activamos automáticamente.
        El botón "continuar ♡" del final del Acto II llama activate().
      */
    }
  );

  window.ParadoxAct3={
    activate,
    deactivate,
    state:()=>({
      ...state,
      nodes:{...state.nodes},
      choices:{...state.choices}
    }),
    reset,
    debug
  };
})();
