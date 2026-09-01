/* =========================================================
   PARADOX143 — CARTA 100
   FIN DEL ACTO I

   IMPORTANTE:
   - NO borra ninguna carta.
   - NO borra localStorage del mundo.
   - NO altera gatos, tulipán, crafting, constelación, etc.
   - La Carta 100 NO entra a la Canasta.
     El mundo intenta guardarla y falla.
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

  function distortMusic(){
    const audio=
      document.getElementById(
        'bgMusic'
      );

    if(!audio) return;

    captureMusic();

    let n=0;

    const wobble=setInterval(
      ()=>{
        n++;

        try{
          audio.playbackRate=
            n%2
              ? .86
              : 1.06;

          audio.volume=
            Math.max(
              0,
              Number(audio.volume||0)-
              .045
            );
        }catch(_){}

        if(n>=14){
          clearInterval(wobble);

          try{
            audio.volume=0;
            audio.pause();
            audio.playbackRate=1;
          }catch(_){}
        }
      },
      155
    );
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
      },
      2800
    );
  }

  async function start(){
    if(
      started ||
      !eligible()
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

    /*
      Primera lectura: completamente normal.
    */
    setPaper(
      'Quería guardar una última cosa.',
      'algo que no quería perder...'
    );

    await wait(2600);

    /*
      Primer fallo. No hay glitch previo a la Carta 100:
      esta es la primera vez que el mundo falla.
    */
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

    /*
      El papel deja de poder permanecer.
    */
    dispatchPhase('collapse');

    distortMusic();

    document
      .getElementById(
        'card100Paper'
      )
      ?.classList.add(
        'erase'
      );

    await wait(1900);

    /*
      El mundo intenta recurrir al refugio:
      lo último que todavía se siente "casa".
    */
    const refuge=
      document.getElementById(
        'card100RefugeStage'
      );

    refuge?.classList.add('show');

    await wait(2200);

    /*
      Primero las pequeñas luces.
    */
    document.body.classList.add(
      'card100-lights-gone'
    );

    await wait(1300);

    /*
      Marie y Tuluz desaparecen.
    */
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

    /*
      Mewo es lo último que permanece.
    */
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

    /*
      El refugio también se va.
    */
    refuge?.classList.add(
      'gone'
    );

    await wait(1100);

    /*
      Campo real: primero la luna queda tapada,
      después desaparecen los tulipanes y finalmente todo.
    */
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

    /*
      Si ya vio la Carta 100, no repetimos el colapso.
      Al recargar, el Acto I vuelve a ser visible por ahora.
      El próximo módulo de Acto II leerá STORY_KEY y tomará
      el control desde ahí.
    */
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
    getState:readStory,

    /*
      Solo para pruebas manuales del creador desde consola.
      No aparece como botón dentro del juego.
    */
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
