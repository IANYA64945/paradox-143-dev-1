/* =========================================================
   PARADOX143 — CARTA 100
   FIN DEL ACTO I

   PATCH MUSICAL:
   - No cambia la cinematográfica.
   - No cambia textos.
   - No cambia progreso.
   - Solo hace que la música realmente se rompa durante
     la Carta 100 y quede como un eco incompleto al entrar
     al Acto II.
========================================================= */

(() => {
  'use strict';

  const LETTER_KEY='paradox143_letters_v1';
  const STORY_KEY='paradox143_story_v1';

  let signal=null;
  let overlay=null;
  let started=false;
  let availableTimer=0;
  let originalMusic=null;

  /* =======================================================
     MOTOR DE AUDIO ROTO
     ======================================================= */

  let audioWarp=null;
  let act2GhostStarted=false;

  function distortionCurve(amount=0){
    const samples=44100;
    const curve=new Float32Array(samples);

    if(amount<=0){
      for(let i=0;i<samples;i++){
        curve[i]=(i*2/samples)-1;
      }
      return curve;
    }

    const k=amount;
    const deg=Math.PI/180;

    for(let i=0;i<samples;i++){
      const x=(i*2/samples)-1;
      curve[i]=
        (3+k)*x*20*deg/
        (Math.PI+k*Math.abs(x));
    }

    return curve;
  }

  function createAudioWarp(audio){
    if(audioWarp) return audioWarp;
    if(!audio) return null;

    const AudioCtx=
      window.AudioContext ||
      window.webkitAudioContext;

    if(!AudioCtx){
      return null;
    }

    try{
      const ctx=new AudioCtx();
      const source=ctx.createMediaElementSource(audio);

      const lowpass=ctx.createBiquadFilter();
      lowpass.type='lowpass';
      lowpass.frequency.value=18000;
      lowpass.Q.value=.4;

      const highpass=ctx.createBiquadFilter();
      highpass.type='highpass';
      highpass.frequency.value=20;
      highpass.Q.value=.2;

      const shaper=ctx.createWaveShaper();
      shaper.curve=distortionCurve(0);
      shaper.oversample='4x';

      const dry=ctx.createGain();
      dry.gain.value=1;

      const delay=ctx.createDelay(.5);
      delay.delayTime.value=.035;

      const feedback=ctx.createGain();
      feedback.gain.value=.08;

      const wet=ctx.createGain();
      wet.gain.value=0;

      const master=ctx.createGain();
      master.gain.value=1;

      source.connect(lowpass);
      lowpass.connect(highpass);
      highpass.connect(shaper);

      shaper.connect(dry);
      dry.connect(master);

      shaper.connect(delay);
      delay.connect(wet);
      wet.connect(master);

      delay.connect(feedback);
      feedback.connect(delay);

      master.connect(ctx.destination);

      audioWarp={
        ctx,
        audio,
        lowpass,
        highpass,
        shaper,
        dry,
        delay,
        feedback,
        wet,
        master,

        setBroken(amount){
          const a=Math.max(0,Math.min(1,amount));

          lowpass.frequency.setTargetAtTime(
            18000-(16600*a),
            ctx.currentTime,
            .05
          );

          highpass.frequency.setTargetAtTime(
            20+(125*a),
            ctx.currentTime,
            .05
          );

          shaper.curve=
            distortionCurve(
              5+(150*a)
            );

          dry.gain.setTargetAtTime(
            1-(.34*a),
            ctx.currentTime,
            .04
          );

          wet.gain.setTargetAtTime(
            .02+(.33*a),
            ctx.currentTime,
            .04
          );

          delay.delayTime.setTargetAtTime(
            .035+(.095*a),
            ctx.currentTime,
            .04
          );

          feedback.gain.setTargetAtTime(
            .08+(.30*a),
            ctx.currentTime,
            .05
          );
        },

        cut(strength=.12,duration=95){
          const now=ctx.currentTime;

          master.gain.cancelScheduledValues(now);
          master.gain.setValueAtTime(
            master.gain.value,
            now
          );
          master.gain.linearRampToValueAtTime(
            strength,
            now+.025
          );
          master.gain.linearRampToValueAtTime(
            1,
            now+(duration/1000)
          );
        }
      };

      return audioWarp;
    }catch(_){
      /*
        Si otro script ya conectó este elemento a WebAudio,
        seguimos usando la distorsión por playbackRate/stutter.
      */
      return null;
    }
  }

  function resumeWarp(warp){
    try{
      if(
        warp?.ctx &&
        warp.ctx.state==='suspended'
      ){
        warp.ctx.resume().catch(()=>{});
      }
    }catch(_){}
  }

  function startAct2GhostMusic(){
    /*
      Al comenzar el Acto II no vuelve ninguna canción.
      Después de la destrucción de la Carta 100 queda
      silencio total para que el Despertar se sienta vacío.
    */
    if(act2GhostStarted) return;
    act2GhostStarted=true;

    const audio=
      document.getElementById(
        'bgMusic'
      );

    if(!audio) return;

    try{
      audio.pause();
      audio.volume=0;
      audio.playbackRate=1;
    }catch(_){}

    if(audioWarp){
      try{
        audioWarp.master.gain.cancelScheduledValues(
          audioWarp.ctx.currentTime
        );

        audioWarp.master.gain.setValueAtTime(
          0,
          audioWarp.ctx.currentTime
        );

        audioWarp.wet.gain.setValueAtTime(
          0,
          audioWarp.ctx.currentTime
        );

        audioWarp.feedback.gain.setValueAtTime(
          0,
          audioWarp.ctx.currentTime
        );
      }catch(_){}
    }
  }

  function distortMusic(){
    const audio=
      document.getElementById(
        'bgMusic'
      );

    if(!audio) return;

    captureMusic();

    const warp=
      createAudioWarp(audio);

    resumeWarp(warp);

    try{
      audio.preservesPitch=false;
      audio.mozPreservesPitch=false;
      audio.webkitPreservesPitch=false;
    }catch(_){}

    const startVolume=
      Number.isFinite(audio.volume)
        ? Math.max(.32,audio.volume)
        : .55;

    /*
      Esta progresión está hecha para que YA NO suene como
      la canción normal. Primero se dobla, después tartamudea
      y finalmente se apaga.
    */
    const sequence=[
      {rate:.94, broken:.08, vol:1.00},
      {rate:.82, broken:.18, vol:.94},
      {rate:1.10, broken:.26, vol:.88, cut:true},
      {rate:.71, broken:.38, vol:.80},
      {rate:.88, broken:.46, vol:.72, rewind:.10},
      {rate:.60, broken:.60, vol:.62, cut:true},
      {rate:.77, broken:.68, vol:.54, rewind:.18},
      {rate:.49, broken:.78, vol:.43, cut:true},
      {rate:.64, broken:.86, vol:.32, rewind:.26},
      {rate:.41, broken:.94, vol:.20},
      {rate:.33, broken:1.00, vol:.10, cut:true}
    ];

    let i=0;

    const step=()=>{
      if(i>=sequence.length){
        const fade=setInterval(
          ()=>{
            try{
              audio.volume=
                Math.max(
                  0,
                  Number(audio.volume||0)-
                  .018
                );

              audio.playbackRate=
                Math.max(
                  .27,
                  Number(audio.playbackRate||.33)-
                  .009
                );

              if(warp){
                warp.setBroken(1);
              }
            }catch(_){}

            if(
              Number(audio.volume||0)<=.005
            ){
              clearInterval(fade);

              try{
                audio.volume=0;
                audio.pause();
                audio.playbackRate=1;
              }catch(_){}
            }
          },
          75
        );

        return;
      }

      const item=sequence[i++];

      try{
        audio.playbackRate=item.rate;
        audio.volume=
          Math.max(
            0,
            startVolume*item.vol
          );

        if(
          item.rewind &&
          Number.isFinite(audio.currentTime)
        ){
          audio.currentTime=
            Math.max(
              0,
              audio.currentTime-item.rewind
            );
        }
      }catch(_){}

      if(warp){
        try{
          warp.setBroken(
            item.broken
          );

          if(item.cut){
            warp.cut(
              .045,
              120
            );
          }
        }catch(_){}
      }else if(item.cut){
        /*
          Fallback sin WebAudio:
          corte audible corto.
        */
        try{
          const v=audio.volume;
          audio.volume=.015;

          setTimeout(
            ()=>{
              try{
                audio.volume=v;
              }catch(_){}
            },
            95
          );
        }catch(_){}
      }

      setTimeout(
        step,
        260
      );
    };

    step();
  }

  /* =======================================================
     ESTADO / CARTA
     ======================================================= */

  function readStory(){
    try{
      const raw=localStorage.getItem(STORY_KEY);
      const value=raw?JSON.parse(raw):{};
      return value && typeof value==='object' ? value : {};
    }catch(_){
      return {};
    }
  }

  function writeStory(patch={}){
    const next={
      ...readStory(),
      ...patch
    };

    try{
      localStorage.setItem(
        STORY_KEY,
        JSON.stringify(next)
      );
    }catch(_){}

    return next;
  }

  function collectedCount(){
    try{
      const raw=localStorage.getItem(LETTER_KEY);
      const arr=raw?JSON.parse(raw):[];

      return new Set(
        Array.isArray(arr)
          ? arr
          : []
      ).size;
    }catch(_){
      return 0;
    }
  }

  function gardenOpen(){
    return Boolean(
      document
        .getElementById('catGarden')
        ?.classList
        .contains('show')
    );
  }

  function busy(){
    return Boolean(
      document.body.classList.contains('intro-active') ||
      document.body.classList.contains('basket2-open') ||
      document.body.classList.contains('refuge-arrival-event-open') ||
      document.body.classList.contains('act1-adventure-open') ||
      document.body.classList.contains('act1-growth-open') ||
      document.body.classList.contains('act1-cinematic-open') ||
      document.body.classList.contains('act1-constellation-open') ||
      document.body.classList.contains('card100-running') ||
      document.getElementById('letterReader')?.classList.contains('show') ||
      document.getElementById('basket2Reader')?.classList.contains('show') ||
      document.getElementById('gameOverlay')?.classList.contains('show') ||
      gardenOpen()
    );
  }

  function eligible(){
    const story=readStory();

    return (
      collectedCount()>=99 &&
      !story.card100Seen &&
      !started
    );
  }

  function ensureDOM(){
    if(!signal){
      signal=document.createElement('button');
      signal.id='card100Signal';
      signal.type='button';
      signal.setAttribute(
        'aria-label',
        'Una carta que no estaba aquí'
      );

      signal.innerHTML=`
        <span class="card100MiniPaper">
          <i></i>
        </span>
        <span class="card100SignalSpark">·</span>
      `;

      document.body.appendChild(signal);

      signal.addEventListener(
        'click',
        start
      );
    }

    if(!overlay){
      overlay=document.createElement('div');
      overlay.id='card100Overlay';
      overlay.setAttribute('aria-hidden','true');

      overlay.innerHTML=`
        <div id="card100LetterStage">
          <article id="card100Paper">
            <div class="card100ForYou">PARA TI</div>
            <div id="card100PaperMark">♡</div>
            <p id="card100PaperText">
              Quería guardar una última cosa.
            </p>
            <small id="card100PaperSub">
              algo que no quería perder...
            </small>
          </article>
        </div>

        <div id="card100RefugeStage">
          <div class="card100RefugeImage"></div>

          <span class="card100Light l1"></span>
          <span class="card100Light l2"></span>
          <span class="card100Light l3"></span>
          <span class="card100Light l4"></span>
          <span class="card100Light l5"></span>

          <img
            id="card100Marie"
            class="card100Cat"
            src="cat_gray_idle.png"
            alt=""
          >

          <img
            id="card100Mewo"
            class="card100Cat"
            src="mewo_idle.png"
            alt=""
          >

          <img
            id="card100Tuluz"
            class="card100Cat"
            src="cat_orange_idle.png"
            alt=""
          >
        </div>

        <div id="card100MoonMask"></div>
        <div id="card100GroundDark"></div>
        <div id="card100Black"></div>

        <div id="card100LastText">...</div>
      `;

      document.body.appendChild(overlay);
    }
  }

  function showSignal(){
    ensureDOM();

    if(!eligible() || busy()){
      signal?.classList.remove('show');
      return;
    }

    signal.classList.add('show');
  }

  function hideSignal(){
    signal?.classList.remove('show');
  }

  function scheduleSignal(){
    clearTimeout(availableTimer);

    if(!eligible()){
      hideSignal();
      return;
    }

    availableTimer=setTimeout(
      ()=>{
        showSignal();
      },
      4200
    );
  }

  function setPaper(text,sub=''){
    const main=
      document.getElementById(
        'card100PaperText'
      );

    const small=
      document.getElementById(
        'card100PaperSub'
      );

    if(main) main.textContent=text;
    if(small) small.textContent=sub;
  }

  function dispatchPhase(phase){
    try{
      window.dispatchEvent(
        new CustomEvent(
          'paradox-card100-phase',
          {detail:{phase}}
        )
      );
    }catch(_){}
  }

  function closeOpenUi(){
    try{
      document
        .getElementById('basket2Overlay')
        ?.classList.remove('show');

      document
        .getElementById('basket2Reader')
        ?.classList.remove('show');

      document
        .getElementById('climatePanel')
        ?.classList.remove('show');
    }catch(_){}
  }

  function captureMusic(){
    const audio=
      document.getElementById(
        'bgMusic'
      );

    if(!audio) return;

    originalMusic={
      volume:audio.volume,
      playbackRate:audio.playbackRate
    };
  }

  function coverMoon(){
    const moon=
      document.getElementById(
        'moonHotspot'
      );

    const mask=
      document.getElementById(
        'card100MoonMask'
      );

    if(!moon || !mask){
      return;
    }

    const rect=
      moon.getBoundingClientRect();

    const size=
      Math.max(
        rect.width,
        rect.height
      )*1.25;

    mask.style.left=
      `${rect.left + rect.width/2}px`;

    mask.style.top=
      `${rect.top + rect.height/2}px`;

    mask.style.width=
      `${size}px`;

    mask.style.height=
      `${size}px`;

    mask.classList.add(
      'show'
    );
  }

  function endToBlack(){
    dispatchPhase('black');

    document.body.classList.add(
      'card100-world-gone'
    );

    document
      .getElementById(
        'card100GroundDark'
      )
      ?.classList.add(
        'show'
      );

    setTimeout(
      ()=>{
        document
          .getElementById(
            'card100Black'
          )
          ?.classList.add(
            'show'
          );
      },
      1150
    );

    setTimeout(
      ()=>{
        const text=
          document.getElementById(
            'card100LastText'
          );

        text?.classList.add(
          'show'
        );

        writeStory({
          card100Seen:true,
          act:2,
          phase:'awaiting-act2',
          card100At:Date.now()
        });

        dispatchPhase('finished');

        try{
          window.dispatchEvent(
            new CustomEvent(
              'paradox-act1-finished',
              {
                detail:{
                  card100:true,
                  act:2
                }
              }
            )
          );
        }catch(_){}

        /*
          El Acto II ya no recibe la canción limpia.
          Unos segundos después del negro entra el eco roto.
        */
        setTimeout(
          startAct2GhostMusic,
          2100
        );
      },
      2800
    );
  }

  async function start(forceDev=false){
    const devAllowed=
      forceDev &&
      new URLSearchParams(
        location.search
      ).has('dev');

    if(
      started ||
      (!devAllowed && !eligible())
    ){
      return;
    }

    started=true;

    ensureDOM();
    hideSignal();
    closeOpenUi();

    document.body.classList.add(
      'card100-running'
    );

    overlay.classList.add('show');
    overlay.setAttribute(
      'aria-hidden',
      'false'
    );

    writeStory({
      card100Started:true,
      card100StartedAt:
        Date.now()
    });

    dispatchPhase('letter');

    setPaper(
      'Quería guardar una última cosa.',
      'algo que no quería perder...'
    );

    await wait(2600);

    document.body.classList.add(
      'card100-first-failure'
    );

    setPaper(
      'Quería guardar este recuer...',
      ''
    );

    await wait(1250);

    setPaper(
      'Quería re...',
      ''
    );

    await wait(900);

    setPaper(
      '...',
      ''
    );

    await wait(1150);

    const mark=
      document.getElementById(
        'card100PaperMark'
      );

    mark?.classList.add(
      'fail'
    );

    setPaper(
      'Yo sabía qué iba aquí.',
      ''
    );

    await wait(1800);

    setPaper(
      'No recuerdo.',
      ''
    );

    await wait(2200);

    dispatchPhase('collapse');

    /*
      AQUÍ empieza la destrucción musical real.
    */
    distortMusic();

    document
      .getElementById(
        'card100Paper'
      )
      ?.classList.add(
        'erase'
      );

    await wait(1900);

    const refuge=
      document.getElementById(
        'card100RefugeStage'
      );

    refuge?.classList.add('show');

    await wait(2200);

    document.body.classList.add(
      'card100-lights-gone'
    );

    await wait(1300);

    document
      .getElementById(
        'card100Tuluz'
      )
      ?.classList.add(
        'gone'
      );

    await wait(750);

    document
      .getElementById(
        'card100Marie'
      )
      ?.classList.add(
        'gone'
      );

    await wait(1250);

    const mewo=
      document.getElementById(
        'card100Mewo'
      );

    if(mewo){
      mewo.src=
        'mewo_confused.png';

      mewo.classList.add(
        'last'
      );
    }

    await wait(2100);

    mewo?.classList.add(
      'gone'
    );

    await wait(1400);

    refuge?.classList.add(
      'gone'
    );

    await wait(1100);

    coverMoon();

    await wait(1350);

    endToBlack();
  }

  function wait(ms){
    return new Promise(
      resolve=>
        setTimeout(resolve,ms)
    );
  }

  function tick(){
    if(started) return;

    if(!eligible()){
      hideSignal();
      return;
    }

    if(busy()){
      hideSignal();
      return;
    }

    if(
      !signal?.classList.contains(
        'show'
      )
    ){
      scheduleSignal();
    }
  }

  function init(){
    ensureDOM();

    const params=
      new URLSearchParams(
        location.search
      );

    /*
      DEV:
      reproduce la Carta 100 completa sin necesitar 99 cartas.
    */
    if(
      params.has('dev') &&
      params.has('card100')
    ){
      setTimeout(
        ()=>start(true),
        1100
      );

      return;
    }

    if(
      readStory().card100Seen
    ){
      return;
    }

    window.addEventListener(
      'paradox-letter-collected',
      ()=>{
        setTimeout(
          scheduleSignal,
          900
        );
      }
    );

    window.addEventListener(
      'paradox-cat-garden-close',
      ()=>{
        setTimeout(
          scheduleSignal,
          1000
        );
      }
    );

    setInterval(
      tick,
      2200
    );

    setTimeout(
      scheduleSignal,
      2200
    );
  }

  /*
    Si el Acto II empieza dentro de la misma sesión después
    de la Carta 100, mantenemos el sonido fantasma.
  */
  setInterval(
    ()=>{
      if(
        document.body.classList.contains(
          'act2-active'
        ) &&
        started &&
        !act2GhostStarted
      ){
        startAct2GhostMusic();
      }
    },
    1000
  );

  const boot=setInterval(
    ()=>{
      if(
        document.getElementById(
          'app'
        ) &&
        document.getElementById(
          'scene'
        )
      ){
        clearInterval(boot);
        init();
      }
    },
    350
  );

  window.ParadoxCard100={
    eligible,
    start,

    startDev(){
      if(
        !new URLSearchParams(
          location.search
        ).has('dev')
      ) return;

      start(true);
    },

    getState:readStory,

    reset(){
      const story=readStory();

      delete story.card100Seen;
      delete story.card100Started;
      delete story.card100At;
      delete story.card100StartedAt;

      story.act=1;
      story.phase='warm';

      try{
        localStorage.setItem(
          STORY_KEY,
          JSON.stringify(story)
        );
      }catch(_){}

      location.reload();
    }
  };

})();
