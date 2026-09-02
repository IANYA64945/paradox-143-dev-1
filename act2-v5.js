/* =========================================================
   PARADOX143 — ACTO II V5
   ESTACIÓN 143 Y RUPTURA FINAL

   Se activa en capítulo 6 DESPUÉS de terminar V4:
   - puzzle de sonido
   - Borde / persecución
   - Relay 143

   Después V5 toma el control antes de la Reconstrucción normal.

   Capas:
   1. Mewo se niega a entrar.
   2. Estación 143 completa.
   3. Tormenta congelada.
   4. Habitación que aprende.
   5. Marie detecta la reconstrucción falsa.
   6. Laberinto de mirar atrás.
   7. Cámara deja de obedecer.
   8. RECOVERING WORLD 99%.
   9. Palabras → símbolos.
   10. Puzzle imposible de simetría.
   11. Tuluz rompe el puzzle.
   12. Salida a Reconstrucción.

   Secreto:
   CARD_0100 / RECOVERY ATTEMPT
========================================================= */

(() => {
  'use strict';

  const KEY='paradox143_act2_v5';

  const DEFAULT={
    version:5,

    mewoWaitDone:false,
    stationDone:false,
    tape100Seen:false,
    stormDone:false,
    learningRoomDone:false,
    marieRevealDone:false,
    mazeDone:false,
    cameraLossDone:false,
    recover99Done:false,
    symbolsDone:false,
    symmetryDone:false,

    oneShots:[],
    startedAt:0
  };

  const IS_DEV=
    new URLSearchParams(
      location.search
    ).has('dev');

  let state=load();

  let root=null;
  let overlay=null;
  let objective=null;
  let objectiveType='';

  let running=false;
  let cleanup=null;

  let audio=null;

  function parse(key,fallback){
    try{
      const raw=
        localStorage.getItem(key);

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
      ...(
        raw &&
        typeof raw==='object'
          ? raw
          : {}
      )
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

    return state;
  }

  function core(){
    return window.ParadoxAct2;
  }

  function v4(){
    return window.ParadoxAct2WorldV4;
  }

  function coreState(){
    return core()?.state?.() || {};
  }

  function build(){
    if(root) return true;

    root=document.getElementById(
      'act2Root'
    );

    if(!root) return false;

    objective=
      document.createElement(
        'button'
      );

    objective.id=
      'act2V5Objective';

    objective.type='button';

    objective.innerHTML=`
      <span>·</span>
      <i></i>
    `;

    root.appendChild(
      objective
    );

    objective.addEventListener(
      'click',
      ()=>{
        const type=
          objectiveType;

        clearObjective();

        run(
          type
        );
      }
    );

    overlay=
      document.createElement(
        'section'
      );

    overlay.id=
      'act2V5Event';

    overlay.setAttribute(
      'aria-hidden',
      'true'
    );

    root.appendChild(
      overlay
    );

    return true;
  }

  function ensureAudio(){
    if(audio) return audio;

    const AudioCtx=
      window.AudioContext ||
      window.webkitAudioContext;

    if(!AudioCtx){
      return null;
    }

    try{
      const ctx=
        new AudioCtx();

      const master=
        ctx.createGain();

      master.gain.value=.48;

      master.connect(
        ctx.destination
      );

      const buffer=
        ctx.createBuffer(
          1,
          ctx.sampleRate*1.2,
          ctx.sampleRate
        );

      const arr=
        buffer.getChannelData(0);

      for(
        let i=0;
        i<arr.length;
        i++
      ){
        arr[i]=
          Math.random()*2-1;
      }

      const noise=
        ctx.createBufferSource();

      noise.buffer=buffer;
      noise.loop=true;

      const filter=
        ctx.createBiquadFilter();

      filter.type='bandpass';
      filter.frequency.value=1200;
      filter.Q.value=1.1;

      const noiseGain=
        ctx.createGain();

      noiseGain.gain.value=0;

      noise.connect(
        filter
      );

      filter.connect(
        noiseGain
      );

      noiseGain.connect(
        master
      );

      const hum=
        ctx.createOscillator();

      hum.type='sine';
      hum.frequency.value=52;

      const humGain=
        ctx.createGain();

      humGain.gain.value=0;

      hum.connect(
        humGain
      );

      humGain.connect(
        master
      );

      noise.start();
      hum.start();

      audio={
        ctx,
        master,
        noise,
        filter,
        noiseGain,
        hum,
        humGain
      };

      return audio;
    }catch(_){
      return null;
    }
  }

  function resumeAudio(){
    const a=ensureAudio();

    try{
      if(
        a?.ctx?.state===
        'suspended'
      ){
        a.ctx.resume().catch(
          ()=>{}
        );
      }
    }catch(_){}

    return a;
  }

  function soundMode(mode='off'){
    const a=resumeAudio();

    if(!a) return;

    const now=
      a.ctx.currentTime;

    const ramp=(param,value,time=.12)=>{
      try{
        param.cancelScheduledValues(
          now
        );

        param.setValueAtTime(
          param.value,
          now
        );

        param.linearRampToValueAtTime(
          value,
          now+time
        );
      }catch(_){}
    };

    if(mode==='off'){
      ramp(
        a.noiseGain.gain,
        0,
        .25
      );

      ramp(
        a.humGain.gain,
        0,
        .25
      );

      return;
    }

    if(mode==='station'){
      ramp(
        a.noiseGain.gain,
        .026,
        .15
      );

      ramp(
        a.humGain.gain,
        .026,
        .18
      );

      try{
        a.filter.frequency.setTargetAtTime(
          860,
          now,
          .12
        );
      }catch(_){}

      return;
    }

    if(mode==='storm'){
      ramp(
        a.noiseGain.gain,
        .070,
        .10
      );

      ramp(
        a.humGain.gain,
        .008,
        .12
      );

      try{
        a.filter.frequency.setTargetAtTime(
          1900,
          now,
          .10
        );
      }catch(_){}

      return;
    }

    if(mode==='error'){
      ramp(
        a.noiseGain.gain,
        .130,
        .04
      );

      ramp(
        a.humGain.gain,
        .018,
        .05
      );

      setTimeout(
        ()=>soundMode('off'),
        250
      );

      return;
    }
  }

  function tone(
    freq=300,
    duration=.20,
    volume=.045,
    type='sine'
  ){
    const a=resumeAudio();

    if(!a) return;

    try{
      const ctx=a.ctx;
      const now=ctx.currentTime;

      const osc=
        ctx.createOscillator();

      const gain=
        ctx.createGain();

      osc.type=type;
      osc.frequency.setValueAtTime(
        freq,
        now
      );

      gain.gain.setValueAtTime(
        .0001,
        now
      );

      gain.gain.exponentialRampToValueAtTime(
        volume,
        now+.02
      );

      gain.gain.exponentialRampToValueAtTime(
        .0001,
        now+duration
      );

      osc.connect(
        gain
      );

      gain.connect(
        ctx.destination
      );

      osc.start(now);
      osc.stop(
        now+
        duration+
        .04
      );
    }catch(_){}
  }

  function delay(ms){
    return new Promise(
      resolve=>
        setTimeout(
          resolve,
          ms
        )
    );
  }

  function begin(
    theme=''
  ){
    if(running) return false;

    build();

    running=true;

    clearObjective();

    core()?.suppressObjectives?.(
      true
    );

    core()?.ambientMode?.(
      'silence'
    );

    try{
      cleanup?.();
    }catch(_){}

    cleanup=null;

    overlay.className='';
    overlay.id='act2V5Event';
    overlay.dataset.theme=theme;
    overlay.innerHTML='';
    overlay.style.pointerEvents='';

    overlay.classList.add(
      'show'
    );

    overlay.setAttribute(
      'aria-hidden',
      'false'
    );

    document.body.classList.add(
      'act2-v5-open'
    );

    return true;
  }

  function end(){
    try{
      cleanup?.();
    }catch(_){}

    cleanup=null;

    soundMode('off');

    overlay.classList.remove(
      'show'
    );

    overlay.setAttribute(
      'aria-hidden',
      'true'
    );

    overlay.innerHTML='';
    overlay.style.pointerEvents='';

    document.body.classList.remove(
      'act2-v5-open'
    );

    running=false;

    core()?.suppressObjectives?.(
      false
    );

    setTimeout(
      ()=>{
        core()
          ?.setObjectiveForChapter
          ?.();
      },
      450
    );
  }

  function whisper(
    main='',
    sub=''
  ){
    core()
      ?.showBrokenLine
      ?.(
        main,
        sub
      );
  }

  /* =======================================================
     GATE
  ======================================================= */

  const STEPS=[
    [
      'mewoWaitDone',
      'mewo-wait',
      -420,
      '🐾'
    ],
    [
      'stationDone',
      'station',
      -150,
      '⌁'
    ],
    [
      'stormDone',
      'storm',
      370,
      '◇'
    ],
    [
      'learningRoomDone',
      'learn',
      80,
      '□'
    ],
    [
      'mazeDone',
      'maze',
      610,
      '↺'
    ],
    [
      'cameraLossDone',
      'camera',
      0,
      '◌'
    ],
    [
      'recover99Done',
      'recover99',
      -240,
      '%'
    ],
    [
      'symbolsDone',
      'symbols',
      220,
      '…'
    ],
    [
      'symmetryDone',
      'symmetry',
      535,
      '✦'
    ]
  ];

  function gate(
    chapter,
    st={}
  ){
    if(
      chapter!==6 ||
      !build()
    ){
      return false;
    }

    /*
      V5 solo entra cuando V4 ya terminó su cadena obligatoria
      del capítulo 6. Esto evita pisar Puzzle sonido / Borde / Relay.
    */
    const v4State=
      v4()?.state?.() || {};

    if(
      !v4State.soundCorridorDone ||
      !v4State.edgeDone ||
      !v4State.relay143Done
    ){
      clearObjective();
      return false;
    }

    for(
      const [
        flag,
        type,
        x,
        mark
      ]
      of STEPS
    ){
      if(!state[flag]){
        showObjective(
          type,
          x,
          mark
        );

        return true;
      }
    }

    clearObjective();

    return false;
  }

  function showObjective(
    type,
    x,
    mark
  ){
    const worldX=
      Number(
        core()?.worldX?.() || 0
      );

    objectiveType=type;

    objective.style.left=
      `calc(50% + ${x-worldX}px)`;

    objective
      .querySelector('span')
      .textContent=
        mark;

    objective.classList.add(
      'show'
    );
  }

  function clearObjective(){
    objectiveType='';

    objective
      ?.classList
      .remove(
        'show'
      );
  }

  function run(type){
    switch(type){
      case 'mewo-wait':
        mewoWait();
        break;

      case 'station':
        station143();
        break;

      case 'storm':
        frozenStorm();
        break;

      case 'learn':
        learningRoom();
        break;

      case 'maze':
        backwardMaze();
        break;

      case 'camera':
        cameraLoss();
        break;

      case 'recover99':
        recovering99();
        break;

      case 'symbols':
        wordsToSymbols();
        break;

      case 'symmetry':
        symmetryBreak();
        break;
    }
  }

  /* =======================================================
     1. MEWO REFUSES TO CONTINUE
  ======================================================= */

  function mewoWait(){
    if(!begin('mewo-wait')) return;

    let taps=0;
    let elapsed=0;
    let done=false;

    overlay.innerHTML=`
      <div class="v5MewoWait">
        <div class="v5StationDoor">
          <span>STATION 143</span>
          <i>NO CARRIER</i>
        </div>

        <button
          id="v5MewoWaiting"
          type="button"
          aria-label="Mewo espera"
        >
          <img
            src="mewo_idle.png"
            alt=""
          >
        </button>

        <div id="v5MewoWaitLine">
          <span></span>
          <small></small>
        </div>

        ${
          IS_DEV
            ? '<div class="v5Qa">DEV · quédate con Mewo unos segundos</div>'
            : ''
        }
      </div>
    `;

    const mewo=
      overlay.querySelector(
        '#v5MewoWaiting'
      );

    const line=
      overlay.querySelector(
        '#v5MewoWaitLine'
      );

    const speak=(
      main,
      sub=''
    )=>{
      line
        .querySelector('span')
        .textContent=
          main;

      line
        .querySelector('small')
        .textContent=
          sub;
    };

    mewo.addEventListener(
      'click',
      ()=>{
        if(done) return;

        taps++;

        if(taps===1){
          speak(
            'Mewo no se mueve.',
            ''
          );
        }else if(taps===2){
          speak(
            'Mewo mira la entrada.',
            'después vuelve a mirarte.'
          );
        }else{
          speak(
            '...',
            'parece que no quiere entrar sola.'
          );
        }
      }
    );

    const timer=
      setInterval(
        ()=>{
          elapsed++;

          if(
            elapsed===4 &&
            taps===0
          ){
            speak(
              'Mewo se queda.',
              ''
            );
          }

          if(elapsed>=8){
            clearInterval(
              timer
            );

            done=true;

            mewo.classList.add(
              'ready'
            );

            speak(
              'Mewo se levanta.',
              'esta vez camina contigo.'
            );

            setTimeout(
              ()=>{
                save({
                  mewoWaitDone:true
                });

                end();

                oneShot(
                  'after-mewo',
                  'una huella queda frente a la puerta.',
                  'cuando vuelves a mirar ya no está.'
                );
              },
              1500
            );
          }
        },
        1000
      );

    cleanup=()=>{
      clearInterval(
        timer
      );
    };
  }

  /* =======================================================
     2. STATION 143
  ======================================================= */

  function station143(){
    if(!begin('station')) return;

    soundMode(
      'station'
    );

    const inspected=
      new Set();

    overlay.innerHTML=`
      <div class="v5Station">
        <div class="v5StationBack"></div>

        <header>
          <small>
            STATION 143
          </small>

          <strong>
            LOCAL MEMORY RELAY
          </strong>

          <span>
            CARRIER:
            1 · 4 · 3
          </span>
        </header>

        <button
          data-station="antenna"
          class="v5StationPart antenna"
          type="button"
        >
          <i>⌁</i>
          <span>ANTENNA</span>
        </button>

        <button
          data-station="terminal"
          class="v5StationPart terminal"
          type="button"
        >
          <i>▣</i>
          <span>TERMINAL</span>
        </button>

        <button
          data-station="receiver"
          class="v5StationPart receiver"
          type="button"
        >
          <i>◉</i>
          <span>RECEIVER</span>
        </button>

        <button
          data-station="monitor"
          class="v5StationPart monitor"
          type="button"
        >
          <i>□</i>
          <span>MONITOR</span>
        </button>

        <button
          id="v5Tape100"
          type="button"
          aria-label="Una cinta sin etiqueta"
        >
          ▬
        </button>

        <div id="v5StationText">
          <span>
            sin sincronizar
          </span>

          <small></small>
        </div>

        <button
          id="v5StationConnect"
          type="button"
          disabled
        >
          CONNECT 143
        </button>
      </div>
    `;

    const text=
      overlay.querySelector(
        '#v5StationText'
      );

    const connect=
      overlay.querySelector(
        '#v5StationConnect'
      );

    const messages={
      antenna:[
        'ANTENNA',
        'apunta hacia una zona que no existe en el mapa.'
      ],

      terminal:[
        'TERMINAL',
        'la última sesión terminó durante CARD_0100.'
      ],

      receiver:[
        'RECEIVER',
        'la misma portadora que escuchaste antes: 1 · 4 · 3.'
      ],

      monitor:[
        'MONITOR',
        'WORLD WRITE ACCESS: PARTIAL.'
      ]
    };

    overlay
      .querySelectorAll(
        '[data-station]'
      )
      .forEach(
        b=>{
          b.addEventListener(
            'click',
            ()=>{
              const id=
                b.dataset.station;

              inspected.add(
                id
              );

              b.classList.add(
                'seen'
              );

              const m=
                messages[id];

              text
                .querySelector('span')
                .textContent=
                  m[0];

              text
                .querySelector('small')
                .textContent=
                  m[1];

              tone(
                160+
                inspected.size*75,
                .15,
                .025
              );

              if(
                inspected.size>=4
              ){
                connect.disabled=
                  false;

                connect.classList.add(
                  'ready'
                );
              }
            }
          );
        }
      );

    overlay
      .querySelector(
        '#v5Tape100'
      )
      .addEventListener(
        'click',
        ()=>{
          playTape100();
        }
      );

    connect.addEventListener(
      'click',
      ()=>{
        if(
          inspected.size<4
        ) return;

        connect.disabled=true;

        text
          .querySelector('span')
          .textContent=
            'LOCAL MEMORY INDEX 143';

        text
          .querySelector('small')
          .textContent=
            'conectando zonas que todavía se contradicen...';

        overlay.classList.add(
          'v5-station-connect'
        );

        soundMode(
          'error'
        );

        setTimeout(
          ()=>{
            soundMode(
              'station'
            );

            text
              .querySelector('span')
              .textContent=
                'CONNECTED';

            text
              .querySelector('small')
              .textContent=
                'la estación no recuperó el mundo. solo consiguió que sus partes pudieran hablar entre sí.';
          },
          900
        );

        setTimeout(
          ()=>{
            save({
              stationDone:true
            });

            end();

            oneShot(
              'station-off',
              'la antena continúa girando.',
              'no parece estar buscando el pasado.'
            );
          },
          2400
        );
      }
    );
  }

  function playTape100(){
    if(
      state.tape100Seen
    ){
      whisper(
        'CARD_0100',
        'la cinta ya no reproduce nada.'
      );

      return;
    }

    save({
      tape100Seen:true
    });

    core()?.suppressObjectives?.(
      true
    );

    core()?.ambientMode?.(
      'silence'
    );

    const stationWasOpen=
      overlay.classList.contains(
        'show'
      );

    overlay.classList.add(
      'v5-tape-playing'
    );

    const tape=
      document.createElement(
        'div'
      );

    tape.className=
      'v5TapeScene';

    tape.innerHTML=`
      <header>
        <span>
          CARD_0100
        </span>

        <small>
          RECOVERY ATTEMPT
        </small>
      </header>

      <div id="v5TapeAttempt"></div>
      <div id="v5TapeStatus">
        REC
      </div>
    `;

    overlay.appendChild(
      tape
    );

    const target=
      tape.querySelector(
        '#v5TapeAttempt'
      );

    const attempts=[
      'Quería guardar una última cosa.',
      'Quería guardar una última...',
      'Quería decirte que...',
      'Si mañana...',
      'Yo...',
      '...',
      'NOT SAVED'
    ];

    let i=0;

    const next=()=>{
      if(
        i>=attempts.length
      ){
        setTimeout(
          ()=>{
            tape.classList.add(
              'gone'
            );

            setTimeout(
              ()=>{
                /*
                  FIX CINTA 100:
                  Si la cinta se abrió dentro de Estación 143,
                  volvemos a la estación.

                  Si se abrió directamente desde DEV, antes quedaba
                  una pantalla negra vacía sin forma de avanzar.
                  En ese caso cerramos el evento y regresamos al mundo.
                */
                const hasStationControls=
                  Boolean(
                    overlay.querySelector(
                      '#v5StationConnect'
                    )
                  );

                tape.remove();

                overlay.classList.remove(
                  'v5-tape-playing'
                );

                if(hasStationControls){
                  core()
                    ?.suppressObjectives
                    ?.(
                      true
                    );
                }else{
                  end();
                }
              },
              600
            );
          },
          1200
        );

        return;
      }

      const text=
        attempts[i++];

      target.textContent=
        text;

      tape.classList.remove(
        'cut'
      );

      void tape.offsetWidth;

      tape.classList.add(
        'cut'
      );

      if(
        text==='NOT SAVED'
      ){
        soundMode(
          'error'
        );
      }else{
        tone(
          210+
          i*19,
          .10,
          .018
        );
      }

      setTimeout(
        next,
        text==='...'
          ? 1150
          : 720
      );
    };

    next();
  }

  /* =======================================================
     3. FROZEN STORM
  ======================================================= */

  function frozenStorm(){
    if(!begin('storm')) return;

    soundMode(
      'storm'
    );

    const drops=[
      ['◇','la lluvia.',220],
      ['◇','frío afuera.',255],
      ['◇','mientras truena.',285],
      ['◇','no te rindas.',330],
      ['◇','cinco minutitos más.',370],
      ['◇','hogar.',415],
      ['◇','mañana...',470]
    ];

    const seen=
      new Set();

    overlay.innerHTML=`
      <div class="v5Storm">
        <div class="v5StormCloud"></div>
        <div id="v5FrozenDrops"></div>

        <div id="v5StormLine">
          <span></span>
          <small></small>
        </div>

        <button
          id="v5ReleaseStorm"
          type="button"
          disabled
        >
          DEJAR CAER
        </button>
      </div>
    `;

    const wrap=
      overlay.querySelector(
        '#v5FrozenDrops'
      );

    const line=
      overlay.querySelector(
        '#v5StormLine'
      );

    const release=
      overlay.querySelector(
        '#v5ReleaseStorm'
      );

    drops.forEach(
      ([mark,text,freq],i)=>{
        const b=
          document.createElement(
            'button'
          );

        b.type='button';
        b.className=
          `v5Drop d${i+1}`;

        b.textContent=
          mark;

        b.addEventListener(
          'click',
          ()=>{
            if(
              seen.has(i)
            ) return;

            seen.add(i);

            b.classList.add(
              'heard'
            );

            line
              .querySelector('span')
              .textContent=
                text;

            line
              .querySelector('small')
              .textContent=
                'una impresión del Acto I queda suspendida dentro de la gota.';

            tone(
              freq,
              .20,
              .033
            );

            if(
              seen.size>=
              drops.length
            ){
              release.disabled=
                false;

              release.classList.add(
                'ready'
              );
            }
          }
        );

        wrap.appendChild(
          b
        );
      }
    );

    release.addEventListener(
      'click',
      ()=>{
        if(
          seen.size<
          drops.length
        ) return;

        release.disabled=true;

        overlay.classList.add(
          'v5-rain-release'
        );

        soundMode(
          'storm'
        );

        setTimeout(
          ()=>{
            soundMode(
              'off'
            );

            line
              .querySelector('span')
              .textContent=
                'toda la lluvia cae al mismo tiempo.';

            line
              .querySelector('small')
              .textContent=
                'durante un segundo el mundo vuelve a sonar normal.';
          },
          1150
        );

        setTimeout(
          ()=>{
            save({
              stormDone:true
            });

            end();

            oneShot(
              'after-storm',
              'una sola gota quedó suspendida.',
              'cuando la tocas solo dice: “mañana...”'
            );
          },
          2600
        );
      }
    );
  }

  /* =======================================================
     4. ROOM THAT LEARNS + MARIE
  ======================================================= */

  function learningRoom(){
    if(!begin('learn')) return;

    let phase='record';
    let order=[];
    let unique=
      new Set();

    let predictionIndex=0;

    overlay.innerHTML=`
      <div class="v5LearningRoom">
        <header>
          <small>
            OBSERVATION ROOM
          </small>

          <strong>
            LEARNING...
          </strong>
        </header>

        <div class="v5LearningObjects">
          <button
            data-object="moon"
            type="button"
          >
            ☾
          </button>

          <button
            data-object="flower"
            type="button"
          >
            ✿
          </button>

          <button
            data-object="box"
            type="button"
          >
            □
          </button>
        </div>

        <div id="v5LearningStatus">
          <span>
            toca los tres objetos.
          </span>

          <small>
            la habitación observa.
          </small>
        </div>

        <div
          id="v5MarieOutside"
          aria-hidden="true"
        >
          <img
            src="cat_gray_idle.png"
            alt=""
          >

          <span>
            Marie no entra.
          </span>
        </div>

        <button
          id="v5RejectPrediction"
          type="button"
        >
          NO ES UN RECUERDO
        </button>
      </div>
    `;

    const buttons=[
      ...overlay.querySelectorAll(
        '[data-object]'
      )
    ];

    const status=
      overlay.querySelector(
        '#v5LearningStatus'
      );

    const marie=
      overlay.querySelector(
        '#v5MarieOutside'
      );

    const reject=
      overlay.querySelector(
        '#v5RejectPrediction'
      );

    const setStatus=(
      main,
      sub=''
    )=>{
      status
        .querySelector('span')
        .textContent=
          main;

      status
        .querySelector('small')
        .textContent=
          sub;
    };

    const flashButton=async id=>{
      const b=
        buttons.find(
          x=>
            x.dataset.object===id
        );

      b?.classList.add(
        'predicted'
      );

      tone(
        id==='moon'
          ? 240
          : id==='flower'
            ? 330
            : 420,
        .16,
        .024
      );

      await delay(
        390
      );

      b?.classList.remove(
        'predicted'
      );

      await delay(
        180
      );
    };

    async function playback(){
      phase='playback';

      setStatus(
        'la habitación recuerda tu orden.',
        ''
      );

      buttons.forEach(
        b=>b.disabled=true
      );

      await delay(
        700
      );

      for(
        const id
        of order
      ){
        await flashButton(
          id
        );
      }

      setStatus(
        'hazlo otra vez.',
        'esta vez la habitación intenta adelantarse.'
      );

      predictionIndex=0;

      buttons.forEach(
        b=>b.disabled=false
      );

      phase='predict';
    }

    async function anticipate(){
      const id=
        order[
          predictionIndex
        ];

      if(!id) return;

      /*
        La habitación activa el objeto ANTES de que el jugador
        termine de elegirlo.
      */
      await flashButton(
        id
      );

      setStatus(
        'PREDICTED',
        'ya sabía cuál ibas a tocar.'
      );
    }

    buttons.forEach(
      b=>{
        b.addEventListener(
          'pointerdown',
          ()=>{
            if(
              phase==='predict'
            ){
              anticipate();
            }
          }
        );

        b.addEventListener(
          'click',
          ()=>{
            const id=
              b.dataset.object;

            if(
              phase==='record'
            ){
              if(
                unique.has(id)
              ){
                setStatus(
                  'ya tocaste ese.',
                  'la habitación espera otro movimiento.'
                );

                return;
              }

              unique.add(
                id
              );

              order.push(
                id
              );

              b.classList.add(
                'recorded'
              );

              tone(
                190+
                order.length*80,
                .14,
                .022
              );

              if(
                order.length>=3
              ){
                setTimeout(
                  playback,
                  650
                );
              }

              return;
            }

            if(
              phase==='predict'
            ){
              const expected=
                order[
                  predictionIndex
                ];

              if(id===expected){
                predictionIndex++;

                b.classList.add(
                  'predicted'
                );

                setTimeout(
                  ()=>b.classList.remove(
                    'predicted'
                  ),
                  250
                );

                if(
                  predictionIndex>=
                  order.length
                ){
                  phase='locked';

                  buttons.forEach(
                    x=>x.disabled=true
                  );

                  setStatus(
                    'PREDICTION CONFIDENCE: 100%',
                    'la habitación ya no necesita que hagas nada.'
                  );

                  marie.classList.add(
                    'show'
                  );

                  marie.setAttribute(
                    'aria-hidden',
                    'false'
                  );

                  reject.classList.add(
                    'show'
                  );
                }else{
                  setTimeout(
                    anticipate,
                    250
                  );
                }
              }else{
                setStatus(
                  'UNEXPECTED INPUT',
                  'la habitación intenta corregirte.'
                );

                soundMode(
                  'error'
                );
              }
            }
          }
        );
      }
    );

    reject.addEventListener(
      'click',
      ()=>{
        if(
          phase!=='locked'
        ) return;

        reject.disabled=true;

        setStatus(
          'Marie no entró.',
          'la copia era perfecta. por eso ella no la reconoció.'
        );

        marie.classList.add(
          'happy'
        );

        setTimeout(
          ()=>{
            save({
              learningRoomDone:true,
              marieRevealDone:true
            });

            end();

            oneShot(
              'marie-door',
              'la puerta queda abierta.',
              'Marie entra recién cuando la habitación deja de predecir.'
            );
          },
          1900
        );
      }
    );
  }

  /* =======================================================
     5. MAZE — LOOKING BACK
  ======================================================= */

  function backwardMaze(){
    if(!begin('maze')) return;

    let forward=0;
    let backCount=0;

    overlay.innerHTML=`
      <div class="v5Maze">
        <div id="v5MazeRoom">
          <span>
            ROOM 01
          </span>

          <small>
            ya estuviste aquí.
          </small>
        </div>

        <div class="v5MazeControls">
          <button
            id="v5MazeBack"
            type="button"
          >
            ↺ MIRAR ATRÁS
          </button>

          <button
            id="v5MazeForward"
            type="button"
          >
            AVANZAR →
          </button>
        </div>

        <div id="v5MazeLine"></div>

        ${
          IS_DEV
            ? '<div class="v5Qa">DEV · la salida aparece si dejas de mirar atrás</div>'
            : ''
        }
      </div>
    `;

    const room=
      overlay.querySelector(
        '#v5MazeRoom'
      );

    const line=
      overlay.querySelector(
        '#v5MazeLine'
      );

    const render=()=>{
      room
        .querySelector('span')
        .textContent=
          `ROOM ${
            String(
              Math.min(
                6,
                forward+1
              )
            ).padStart(
              2,
              '0'
            )
          }`;

      room
        .querySelector('small')
        .textContent=
          backCount>0
            ? 'esta habitación se parece demasiado a la anterior.'
            : 'el pasillo continúa.';
    };

    overlay
      .querySelector(
        '#v5MazeBack'
      )
      .addEventListener(
        'click',
        ()=>{
          backCount++;

          forward=
            Math.max(
              0,
              forward-2
            );

          overlay.classList.add(
            'v5-maze-loop'
          );

          line.textContent=
            backCount===1
              ? 'ya estuviste aquí.'
              : backCount===2
                ? 'otra vez.'
                : 'la salida no está detrás.';

          soundMode(
            'error'
          );

          setTimeout(
            ()=>overlay.classList.remove(
              'v5-maze-loop'
            ),
            380
          );

          render();
        }
      );

    overlay
      .querySelector(
        '#v5MazeForward'
      )
      .addEventListener(
        'click',
        ()=>{
          forward++;

          line.textContent=
            forward<4
              ? '...'
              : forward<6
                ? 'el pasillo dejó de repetirse.'
                : 'hay una salida que no estaba antes.';

          tone(
            210+
            forward*36,
            .13,
            .020
          );

          render();

          if(
            forward>=6
          ){
            overlay
              .querySelectorAll(
                '.v5MazeControls button'
              )
              .forEach(
                b=>b.disabled=true
              );

            room.classList.add(
              'exit'
            );

            setTimeout(
              ()=>{
                save({
                  mazeDone:true
                });

                end();
              },
              1300
            );
          }
        }
      );

    render();
  }

  /* =======================================================
     6. CAMERA LOSS
  ======================================================= */

  function cameraLoss(){
    if(!begin('camera')) return;

    overlay.innerHTML=`
      <div class="v5CameraLoss">
        <div id="v5CameraTrack">
          <div class="c1">
            CAMPO MUERTO
          </div>

          <div class="c2">
            STATION 143
          </div>

          <div class="c3">
            LLUVIA
          </div>

          <div class="c4">
            BORDE
          </div>
        </div>

        <div id="v5CameraCoordinates">
          X 000
        </div>

        <div id="v5CameraLine">
          <span></span>
          <small></small>
        </div>
      </div>
    `;

    const track=
      overlay.querySelector(
        '#v5CameraTrack'
      );

    const coords=
      overlay.querySelector(
        '#v5CameraCoordinates'
      );

    const line=
      overlay.querySelector(
        '#v5CameraLine'
      );

    const positions=[
      [0,'X 000'],
      [-18,'X -220'],
      [27,'X 370'],
      [-34,'X -610'],
      [42,'X 821'],
      [8,'X 143'],
      [0,'X 000']
    ];

    let i=0;

    const move=()=>{
      if(
        i>=positions.length
      ){
        line
          .querySelector('span')
          .textContent=
            'la cámara vuelve.';

        line
          .querySelector('small')
          .textContent=
            'no porque la recuperaste. porque terminó de llevarte donde quería.';

        setTimeout(
          ()=>{
            save({
              cameraLossDone:true
            });

            end();
          },
          1800
        );

        return;
      }

      const [
        x,
        label
      ]=
        positions[i++];

      track.style.transform=
        `translateX(${x}vw)`;

      coords.textContent=
        label;

      if(i===2){
        line
          .querySelector('span')
          .textContent=
            'arrastras hacia la derecha.';

        line
          .querySelector('small')
          .textContent=
            'el mundo se mueve hacia la izquierda.';
      }

      if(i===4){
        line
          .querySelector('span')
          .textContent=
            'ya no te está obedeciendo.';

        line
          .querySelector('small')
          .textContent=
            '';
      }

      tone(
        150+
        i*28,
        .12,
        .014
      );

      setTimeout(
        move,
        900
      );
    };

    setTimeout(
      move,
      700
    );
  }

  /* =======================================================
     7. RECOVERING 99%
  ======================================================= */

  function recovering99(){
    if(!begin('recover99')) return;

    overlay.innerHTML=`
      <div class="v5Recover99">
        <header>
          <small>
            WORLD RECOVERY
          </small>

          <strong>
            RECOVERING...
          </strong>
        </header>

        <button
          id="v5RecoverPercent"
          type="button"
          disabled
        >
          00%
        </button>

        <div class="v5RecoverBar">
          <i></i>
        </div>

        <div id="v5RecoverLine">
          <span></span>
          <small></small>
        </div>

        ${
          IS_DEV
            ? '<div class="v5Qa late">DEV · cuando quede en 99%, toca el 99%</div>'
            : ''
        }
      </div>
    `;

    const percent=
      overlay.querySelector(
        '#v5RecoverPercent'
      );

    const bar=
      overlay.querySelector(
        '.v5RecoverBar i'
      );

    const line=
      overlay.querySelector(
        '#v5RecoverLine'
      );

    let n=0;
    let at99=false;
    let hintTimer=null;

    const timer=
      setInterval(
        ()=>{
          if(
            n<92
          ){
            n+=
              4+
              Math.floor(
                Math.random()*5
              );
          }else{
            n=99;
          }

          n=
            Math.min(
              99,
              n
            );

          percent.textContent=
            `${String(n).padStart(2,'0')}%`;

          bar.style.width=
            `${n}%`;

          tone(
            110+
            n*1.2,
            .05,
            .008
          );

          if(n>=99){
            clearInterval(
              timer
            );

            at99=true;

            percent.disabled=
              false;

            percent.classList.add(
              'stuck'
            );

            line
              .querySelector('span')
              .textContent=
                'RECOVERY STALLED';

            line
              .querySelector('small')
              .textContent=
                'waiting for 100%';

            hintTimer=
              setTimeout(
                ()=>{
                  line
                    .querySelector('span')
                    .textContent=
                      '100% NOT FOUND';

                  line
                    .querySelector('small')
                    .textContent=
                      'el mundo sigue esperando una parte que no existe.';
                },
                9000
              );
          }
        },
        150
      );

    percent.addEventListener(
      'click',
      ()=>{
        if(!at99) return;

        clearTimeout(
          hintTimer
        );

        percent.disabled=true;

        percent.classList.remove(
          'stuck'
        );

        percent.textContent=
          '99%';

        line
          .querySelector('span')
          .textContent=
            'CONTINUE WITH 99%';

        line
          .querySelector('small')
          .textContent=
            '100% nunca fue necesario.';

        overlay.classList.add(
          'v5-recover-accept'
        );

        setTimeout(
          ()=>{
            save({
              recover99Done:true
            });

            end();

            oneShot(
              'ninety-nine',
              'el mundo continúa incompleto.',
              'y continúa igual.'
            );
          },
          1800
        );
      }
    );

    cleanup=()=>{
      clearInterval(
        timer
      );

      clearTimeout(
        hintTimer
      );
    };
  }

  /* =======================================================
     8. WORDS → SYMBOLS
  ======================================================= */

  function wordsToSymbols(){
    if(!begin('symbols')) return;

    const entries=[
      [
        'MEWO',
        [
          'MEWO',
          'ME...',
          'M—',
          '🐾'
        ]
      ],
      [
        'HOGAR',
        [
          'HOGAR',
          'HOG...',
          'H—',
          '⌂'
        ]
      ],
      [
        'MARIE',
        [
          'MARIE',
          'MAR...',
          'M—',
          '☾'
        ]
      ],
      [
        'TULUZ',
        [
          'TULUZ',
          'TUL...',
          'T—',
          '✦'
        ]
      ]
    ];

    overlay.innerHTML=`
      <div class="v5Symbols">
        <div id="v5SymbolWord"></div>

        <div id="v5SymbolLine">
          <span></span>
          <small></small>
        </div>
      </div>
    `;

    const word=
      overlay.querySelector(
        '#v5SymbolWord'
      );

    const line=
      overlay.querySelector(
        '#v5SymbolLine'
      );

    let e=0;
    let f=0;

    const tick=()=>{
      if(
        e>=entries.length
      ){
        line
          .querySelector('span')
          .textContent=
            'los nombres fallan.';

        line
          .querySelector('small')
          .textContent=
            'lo que significan todavía llega.';

        setTimeout(
          ()=>{
            save({
              symbolsDone:true
            });

            end();
          },
          1600
        );

        return;
      }

      const [
        label,
        frames
      ]=
        entries[e];

      word.textContent=
        frames[f];

      word.dataset.original=
        label;

      tone(
        310-
        f*45+
        e*20,
        .10,
        .018
      );

      f++;

      if(
        f>=frames.length
      ){
        f=0;
        e++;

        setTimeout(
          tick,
          900
        );
      }else{
        setTimeout(
          tick,
          500
        );
      }
    };

    tick();
  }

  /* =======================================================
     9. IMPOSSIBLE SYMMETRY / TULUZ BREAKS IT
  ======================================================= */

  function symmetryBreak(){
    if(!begin('symmetry')) return;

    let attempts=0;
    let tuluzReady=false;
    let solved=false;

    overlay.innerHTML=`
      <div class="v5Symmetry">
        <header>
          <small>
            STABILITY TEST
          </small>

          <strong>
            RESTORE PERFECT SYMMETRY
          </strong>
        </header>

        <div id="v5SymmetryGrid"></div>

        <div id="v5SymmetryStatus">
          <span>
            100% SYMMETRICAL
          </span>

          <small>
            exit unavailable
          </small>
        </div>

        <button
          id="v5TuluzBreak"
          type="button"
          aria-label="Tuluz"
        >
          <img
            src="cat_orange_idle.png"
            alt=""
          >
        </button>
      </div>
    `;

    const grid=
      overlay.querySelector(
        '#v5SymmetryGrid'
      );

    const status=
      overlay.querySelector(
        '#v5SymmetryStatus'
      );

    const tuluz=
      overlay.querySelector(
        '#v5TuluzBreak'
      );

    const cells=[];

    for(
      let i=0;
      i<16;
      i++
    ){
      const b=
        document.createElement(
          'button'
        );

      b.type='button';
      b.dataset.cell=
        String(i);

      if(
        i===5 ||
        i===6 ||
        i===9 ||
        i===10
      ){
        b.classList.add(
          'lit'
        );
      }

      b.addEventListener(
        'click',
        ()=>{
          if(solved) return;

          attempts++;

          const mirror=
            15-i;

          const pair=[
            b,
            cells[
              mirror
            ]
          ];

          pair.forEach(
            el=>
              el?.classList.toggle(
                'lit'
              )
          );

          status
            .querySelector('span')
            .textContent=
              'SYMMETRY RESTORED';

          status
            .querySelector('small')
            .textContent=
              'exit unavailable';

          overlay.classList.add(
            'v5-symmetry-reset'
          );

          tone(
            190,
            .12,
            .020,
            'square'
          );

          setTimeout(
            ()=>overlay.classList.remove(
              'v5-symmetry-reset'
            ),
            300
          );

          /*
            El sistema SIEMPRE refleja la acción.
            Por diseño no puedes romper la simetría tú sola.
          */
          if(
            attempts>=3 &&
            !tuluzReady
          ){
            tuluzReady=true;

            tuluz.classList.add(
              'show'
            );

            status
              .querySelector('span')
              .textContent=
                'UNREGISTERED MOVEMENT';

            status
              .querySelector('small')
              .textContent=
                'TULUZ_NULL';
          }
        }
      );

      cells.push(
        b
      );

      grid.appendChild(
        b
      );
    }

    tuluz.addEventListener(
      'click',
      ()=>{
        if(
          !tuluzReady ||
          solved
        ) return;

        solved=true;

        tuluz.classList.add(
          'run'
        );

        status
          .querySelector('span')
          .textContent=
            'ASYMMETRY DETECTED';

        status
          .querySelector('small')
          .textContent=
            'EXIT AVAILABLE';

        /*
          Tuluz rompe SOLO un lado.
          Por primera vez el sistema no puede copiar el movimiento.
        */
        cells[14]
          ?.classList
          .toggle(
            'lit'
          );

        cells[14]
          ?.classList
          .add(
            'broken'
          );

        soundMode(
          'error'
        );

        setTimeout(
          ()=>{
            status
              .querySelector('span')
              .textContent=
                'Tuluz atravesó la parte que decía INVALID.';

            status
              .querySelector('small')
              .textContent=
                'el puzzle nunca tuvo una solución antigua.';
          },
          750
        );

        setTimeout(
          ()=>{
            save({
              symmetryDone:true
            });

            end();

            oneShot(
              'tuluz-break',
              'la cuadrícula queda rota.',
              'nadie intenta repararla.'
            );
          },
          2300
        );
      }
    );
  }

  /* =======================================================
     ONE-SHOT EVENTS
  ======================================================= */

  function oneShot(
    id,
    main,
    sub=''
  ){
    const seen=
      new Set(
        state.oneShots || []
      );

    if(
      seen.has(id)
    ){
      return;
    }

    seen.add(id);

    save({
      oneShots:[
        ...seen
      ]
    });

    setTimeout(
      ()=>{
        whisper(
          main,
          sub
        );
      },
      1100
    );
  }

  /* =======================================================
     DEV
  ======================================================= */

  function debug(name){
    if(!IS_DEV) return;

    switch(name){
      case 'mewo':
        mewoWait();
        break;

      case 'station':
        station143();
        break;

      case 'storm':
        frozenStorm();
        break;

      case 'learn':
        learningRoom();
        break;

      case 'maze':
        backwardMaze();
        break;

      case 'camera':
        cameraLoss();
        break;

      case 'recover99':
        recovering99();
        break;

      case 'symbols':
        wordsToSymbols();
        break;

      case 'symmetry':
        symmetryBreak();
        break;

      case 'tape':
        if(
          !build()
        ) return;

        begin('station');

        overlay.innerHTML=`
          <div class="v5Station">
            <div class="v5StationBack"></div>
          </div>
        `;

        playTape100();
        break;
    }
  }

  function reset(){
    try{
      localStorage.removeItem(
        KEY
      );
    }catch(_){}

    state=load();

    location.reload();
  }

  /* =======================================================
     BOOT
  ======================================================= */

  document.addEventListener(
    'DOMContentLoaded',
    ()=>{
      const boot=
        setInterval(
          ()=>{
            if(
              window.ParadoxAct2 &&
              window.ParadoxAct2WorldV4 &&
              document.getElementById(
                'act2Root'
              )
            ){
              clearInterval(
                boot
              );

              build();
            }
          },
          300
        );
    }
  );

  window.ParadoxAct2V5={
    gate,
    state:()=>({
      ...state
    }),
    debug,
    reset
  };
})();
