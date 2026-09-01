/* =========================================================
   PARADOX143 — EVENTOS DE LLEGADA DEL REFUGIO

   MARIE:
   Evento principal, emocional y largo.
   Duración mínima aproximada: 70+ segundos.
   No se puede perder.

   TULUZ:
   Evento completo de llegada posterior.
   Duración aproximada: 45+ segundos.
   No se puede perder.

   Ambos eventos existen SOLO dentro del Claro.
========================================================= */

(() => {
  'use strict';

  const MARIE_LETTER=
    'garden-gray-arrival';

  const TULUZ_LETTER=
    'garden-orange-arrival';


  let overlay=null;
  let scene=null;
  let title=null;
  let text=null;
  let cat=null;
  let symbols=null;
  let action=null;
  let progress=null;
  let footprints=null;

  let running=null;
  let timers=[];

  let musicVolumeBefore=null;


  function clearTimers(){

    timers.forEach(
      timer=>{
        clearTimeout(timer);
        clearInterval(timer);
      }
    );

    timers=[];
  }


  function later(
    fn,
    ms
  ){

    const timer=
      setTimeout(
        fn,
        ms
      );

    timers.push(timer);

    return timer;
  }


  function ensureDOM(){

    if(overlay){
      return true;
    }


    const garden=
      document.getElementById(
        'catGarden'
      );


    if(!garden){
      return false;
    }


    overlay=
      document.createElement(
        'div'
      );

    overlay.id=
      'refugeArrivalEvent';

    overlay.setAttribute(
      'aria-hidden',
      'true'
    );

    overlay.innerHTML=`
      <div class="refugeEventShade"></div>

      <div
        id="refugeEventScene"
        class="refugeEventScene"
      >
        <div
          id="refugeEventSymbols"
          class="refugeEventSymbols"
          aria-hidden="true"
        ></div>

        <div
          id="refugeEventFootprints"
          class="refugeEventFootprints"
          aria-label="Huellitas"
        ></div>

        <img
          id="refugeEventCat"
          class="refugeEventCat"
          alt=""
        >
      </div>

      <div class="refugeEventStory">
        <div
          id="refugeEventTitle"
          class="refugeEventTitle"
        ></div>

        <div
          id="refugeEventText"
          class="refugeEventText"
        ></div>

        <div
          id="refugeEventProgress"
          class="refugeEventProgress"
          aria-hidden="true"
        >
          <span></span>
        </div>

        <button
          id="refugeEventAction"
          class="refugeEventAction"
          type="button"
        ></button>
      </div>
    `;


    garden.appendChild(
      overlay
    );


    scene=
      overlay.querySelector(
        '#refugeEventScene'
      );

    title=
      overlay.querySelector(
        '#refugeEventTitle'
      );

    text=
      overlay.querySelector(
        '#refugeEventText'
      );

    cat=
      overlay.querySelector(
        '#refugeEventCat'
      );

    symbols=
      overlay.querySelector(
        '#refugeEventSymbols'
      );

    action=
      overlay.querySelector(
        '#refugeEventAction'
      );

    progress=
      overlay.querySelector(
        '#refugeEventProgress'
      );

    footprints=
      overlay.querySelector(
        '#refugeEventFootprints'
      );


    return true;
  }


  function openOverlay(
    eventName
  ){

    if(!ensureDOM()){
      return false;
    }


    clearTimers();

    running=
      eventName;


    overlay.dataset.event=
      eventName;


    overlay.classList.add(
      'show'
    );

    overlay.setAttribute(
      'aria-hidden',
      'false'
    );


    document.body.classList.add(
      'refuge-arrival-event-open'
    );


    action.classList.remove(
      'show'
    );

    footprints.innerHTML='';
    symbols.innerHTML='';

    cat.className=
      'refugeEventCat';

    scene.className=
      'refugeEventScene';


    /*
      Bajamos suavemente la música del Claro,
      pero no la sustituimos.
    */
    const audio=
      document.getElementById(
        'bgMusic'
      );

    if(audio){

      musicVolumeBefore=
        Number.isFinite(
          audio.volume
        )
        ? audio.volume
        : .38;

      fadeAudio(
        audio,
        Math.min(
          musicVolumeBefore,
          .18
        ),
        1200
      );
    }


    return true;
  }


  function closeOverlay(){

    clearTimers();

    overlay?.classList.remove(
      'show'
    );

    overlay?.setAttribute(
      'aria-hidden',
      'true'
    );


    document.body.classList.remove(
      'refuge-arrival-event-open'
    );


    const audio=
      document.getElementById(
        'bgMusic'
      );

    if(
      audio &&
      musicVolumeBefore!==null
    ){

      fadeAudio(
        audio,
        musicVolumeBefore,
        1200
      );
    }


    musicVolumeBefore=null;
    running=null;
  }


  function fadeAudio(
    audio,
    target,
    duration=1000
  ){

    const from=
      audio.volume;

    const started=
      performance.now();


    function step(
      now
    ){

      const t=
        Math.min(
          1,
          (
            now-
            started
          )/
          duration
        );


      audio.volume=
        from+
        (
          target-
          from
        )*
        t;


      if(t<1){
        requestAnimationFrame(
          step
        );
      }
    }


    requestAnimationFrame(
      step
    );
  }


  function setStory(
    newTitle,
    newText
  ){

    title.textContent=
      newTitle;

    text.classList.remove(
      'change'
    );

    void text.offsetWidth;

    text.textContent=
      newText;

    text.classList.add(
      'change'
    );
  }


  function setProgress(
    pct
  ){

    progress
      .querySelector('span')
      .style.width=
        `${Math.max(
          0,
          Math.min(
            100,
            pct
          )
        )}%`;
  }


  function addSymbol(
    symbol,
    x,
    y,
    className=''
  ){

    const bit=
      document.createElement(
        'span'
      );

    bit.className=
      `refugeEventSymbol ${className}`;

    bit.textContent=
      symbol;

    bit.style.left=
      `${x}%`;

    bit.style.top=
      `${y}%`;


    symbols.appendChild(
      bit
    );


    later(
      ()=>bit.remove(),
      5200
    );
  }


  function chime(
    kind='soft'
  ){

    try{

      const AudioCtx=
        window.AudioContext ||
        window.webkitAudioContext;


      if(!AudioCtx){
        return;
      }


      const ctx=
        window.__paradoxArrivalAudioCtx ||
        new AudioCtx();


      window.__paradoxArrivalAudioCtx=
        ctx;


      const now=
        ctx.currentTime;


      const notes=
        kind==='warm'
        ? [
            [392,.00,.16],
            [523,.18,.18],
            [659,.38,.26]
          ]
        : kind==='orange'
          ? [
              [440,.00,.10],
              [587,.13,.10],
              [784,.27,.18]
            ]
          : [
              [523,.00,.11],
              [659,.15,.16]
            ];


      notes.forEach(
        ([freq,delay,dur])=>{

          const osc=
            ctx.createOscillator();

          const gain=
            ctx.createGain();


          osc.type='sine';
          osc.frequency.value=freq;

          gain.gain.setValueAtTime(
            0,
            now+delay
          );

          gain.gain.linearRampToValueAtTime(
            .035,
            now+delay+.025
          );

          gain.gain.exponentialRampToValueAtTime(
            .001,
            now+delay+dur
          );


          osc.connect(gain);
          gain.connect(
            ctx.destination
          );

          osc.start(
            now+delay
          );

          osc.stop(
            now+delay+dur+.04
          );
        }
      );

    }

    catch(_){}
  }


  function buildFootprintTrail(
    count,
    onComplete
  ){

    footprints.innerHTML='';

    const positions=[
      [13,76],
      [26,67],
      [38,73],
      [49,60],
      [61,66],
      [72,55]
    ];


    let current=0;


    function revealNext(){

      if(
        current>=count
      ){

        later(
          onComplete,
          1300
        );

        return;
      }


      const [
        x,
        y
      ]=
        positions[current];


      const paw=
        document.createElement(
          'button'
        );

      paw.type='button';

      paw.className=
        'refugeEventPaw';

      paw.innerHTML='🐾';

      paw.style.left=
        `${x}%`;

      paw.style.top=
        `${y}%`;


      footprints.appendChild(
        paw
      );


      later(
        ()=>{
          paw.classList.add(
            'ready'
          );
        },
        80
      );


      paw.addEventListener(
        'click',
        ()=>{

          if(
            !paw.classList.contains(
              'ready'
            )
          ){
            return;
          }


          paw.disabled=true;

          paw.classList.add(
            'found'
          );

          chime('soft');


          current++;

          setProgress(
            12+
            current*
            5
          );


          later(
            revealNext,
            2100
          );
        },
        {
          once:true
        }
      );
    }


    revealNext();
  }


  function showAction(
    label,
    handler
  ){

    action.textContent=
      label;

    action.onclick=
      null;


    action.addEventListener(
      'click',
      handler,
      {
        once:true
      }
    );


    action.classList.add(
      'show'
    );
  }


  /* =====================================================
     MARIE
  ===================================================== */

  function startMarie(
    {
      onCommit
    }={}
  ){

    if(
      running ||
      !openOverlay(
        'marie'
      )
    ){
      return false;
    }


    setProgress(2);

    setStory(
      'El Claro se quedó muy quieto...',
      'Por unos segundos incluso el viento entre los árboles pareció detenerse.'
    );


    scene.classList.add(
      'marie-night'
    );


    addSymbol(
      '·',
      8,
      42,
      'faint'
    );

    addSymbol(
      '·',
      91,
      35,
      'faint'
    );


    /*
      FASE 1 — 0 a 10 s
    */
    later(
      ()=>{

        setProgress(10);

        setStory(
          'Hay algo entre los árboles.',
          'No parece tener miedo... pero tampoco quiere acercarse todavía.'
        );

        addSymbol(
          '?',
          87,
          48,
          'gray'
        );

        chime('soft');

      },
      10000
    );


    /*
      FASE 2 — 10 a ~27 s
      Huellas interactivas.
    */
    later(
      ()=>{

        setProgress(14);

        setStory(
          'Mira el suelo...',
          'Una huellita apareció cerca del borde del refugio. Tócala y sigue el caminito.'
        );


        buildFootprintTrail(
          5,
          ()=>marieSilhouette(
            onCommit
          )
        );

      },
      14500
    );


    return true;
  }


  function marieSilhouette(
    onCommit
  ){

    setProgress(42);

    footprints.innerHTML='';


    cat.src=
      'cat_gray_idle.png';

    cat.alt=
      'Marie';


    cat.classList.add(
      'marie-silhouette'
    );


    setStory(
      'Ya está muy cerca.',
      'La pequeña figura gris y blanca se quedó mirando el refugio como si intentara recordar algo.'
    );


    chime('warm');


    later(
      ()=>{

        setProgress(51);

        cat.classList.remove(
          'marie-silhouette'
        );

        cat.classList.add(
          'marie-reveal'
        );


        addSymbol(
          '♡',
          48,
          24,
          'pink big'
        );


        setStory(
          'Marie.',
          'No hizo falta llamarla. Simplemente dio un pasito más... y el Claro volvió a sentirse completo.'
        );


        chime('warm');

      },
      12000
    );


    /*
      FASE DE REENCUENTRO
    */
    later(
      ()=>{

        setProgress(63);

        cat.src=
          'cat_gray_love.png';

        cat.classList.add(
          'marie-love'
        );


        addSymbol(
          '♡',
          37,
          29,
          'pink'
        );

        addSymbol(
          '♡',
          62,
          23,
          'pink'
        );


        setStory(
          'No era una visita.',
          'Marie eligió quedarse. Este será también su pequeño lugar seguro, junto a Mewo y todo lo que vaya creciendo aquí.'
        );

      },
      25500
    );


    later(
      ()=>{

        setProgress(76);

        scene.classList.add(
          'warm'
        );


        setStory(
          'Un lugar más en la familia.',
          'Afuera el mundo puede seguir cambiando. Aquí dentro, hay recuerdos que encuentran otra forma de quedarse cerquita.'
        );


        addSymbol(
          '✦',
          29,
          19,
          'gold'
        );

        addSymbol(
          '✦',
          71,
          31,
          'gold'
        );

        chime('warm');

      },
      38500
    );


    /*
      FASE FINAL — el commit ocurre antes de la carta,
      así Marie queda guardada incluso si luego cierran.
    */
    later(
      ()=>{

        setProgress(88);

        try{
          onCommit?.();
        }catch(_){}


        cat.src=
          'cat_gray_happy.png';


        setStory(
          'Y entonces apareció una cartita...',
          'Estaba esperándote desde que Marie llegó al centro del Claro.'
        );


        addSymbol(
          '💌',
          50,
          18,
          'letter'
        );


        chime('warm');

      },
      50500
    );


    /*
      Marie supera los 60 s de la tormenta:
      la cartita aparece cerca de los 70 s.
    */
    later(
      ()=>{

        setProgress(100);

        showAction(
          'Abrir “¿Me extrañaste?” ♡',
          ()=>{

            try{

              window.ParadoxLetters
                ?.open
                ?.(
                  MARIE_LETTER,
                  true
                );

            }

            catch(_){}


            later(
              closeOverlay,
              1100
            );
          }
        );


        setStory(
          '¿Me extrañaste?',
          'Tócala cuando quieras. No hay prisa.'
        );

      },
      70000
    );


    return true;
  }


  /* =====================================================
     TULUZ
  ===================================================== */

  function startTuluz(
    {
      onCommit
    }={}
  ){

    if(
      running ||
      !openOverlay(
        'tuluz'
      )
    ){
      return false;
    }


    setProgress(4);

    scene.classList.add(
      'tuluz-glow'
    );


    setStory(
      'Algo naranja apareció entre los árboles...',
      'Esta vez no se quedó quieto ni un segundo.'
    );


    addSymbol(
      '✦',
      88,
      42,
      'gold'
    );


    /*
      Primer movimiento.
    */
    later(
      ()=>{

        setProgress(18);

        setStory(
          'Una colita desapareció detrás del tronco.',
          'Y volvió a aparecer del otro lado. Parece que alguien está jugando contigo.'
        );


        addSymbol(
          '!',
          78,
          51,
          'gold'
        );

        chime('orange');

      },
      7000
    );


    later(
      ()=>{

        setProgress(29);

        cat.src=
          'cat_orange_confused.png';

        cat.alt=
          'Tuluz';

        cat.classList.add(
          'tuluz-peek'
        );


        setStory(
          'Ahí estás.',
          'El pequeño gatito naranja te miró como si él fuera quien te hubiera estado buscando a ti.'
        );


        addSymbol(
          '?',
          58,
          23,
          'orange'
        );

      },
      15000
    );


    later(
      ()=>{

        setProgress(47);

        cat.src=
          'cat_orange_happy.png';

        cat.classList.remove(
          'tuluz-peek'
        );

        cat.classList.add(
          'tuluz-reveal'
        );


        setStory(
          'Tuluz.',
          'Llegó detrás de Marie y, en cuestión de segundos, actuó como si este rincón siempre hubiera sido suyo.'
        );


        addSymbol(
          '✦',
          36,
          23,
          'gold'
        );

        addSymbol(
          '✦',
          65,
          28,
          'gold'
        );

        chime('orange');

      },
      24500
    );


    later(
      ()=>{

        setProgress(68);

        cat.src=
          'cat_orange_love.png';


        setStory(
          'No tienen que compartir sangre.',
          'A veces basta compartir cuidados, travesuras, un lugar seguro... y decidir quedarse juntos.'
        );


        addSymbol(
          '♡',
          48,
          20,
          'pink big'
        );

      },
      33000
    );


    later(
      ()=>{

        setProgress(84);

        try{
          onCommit?.();
        }catch(_){}


        setStory(
          'Ahora el Claro tiene otra pequeña vida dentro.',
          'Marie no llegó sola. Tuluz también encontró su lugar.'
        );


        addSymbol(
          '💌',
          50,
          18,
          'letter'
        );

        chime('orange');

      },
      40500
    );


    later(
      ()=>{

        setProgress(100);

        showAction(
          'Abrir “Y trajo compañía ♡”',
          ()=>{

            try{

              window.ParadoxLetters
                ?.open
                ?.(
                  TULUZ_LETTER,
                  true
                );

            }

            catch(_){}


            later(
              closeOverlay,
              1100
            );
          }
        );


        setStory(
          'Y trajo compañía ♡',
          'La segunda cartita está lista.'
        );

      },
      48000
    );


    return true;
  }


  /*
    Si el jugador sale del Claro a mitad de evento,
    se cierra de forma segura.
    Si todavía no se había llegado al commit,
    el evento se repetirá en otra visita.
  */
  window.addEventListener(
    'paradox-cat-garden-close',
    ()=>{

      if(running){
        closeOverlay();
      }
    }
  );


  window.ParadoxRefugeArrivalEvents={
    startMarie,
    startTuluz,
    isRunning:()=>Boolean(running)
  };

})();
