/* =========================================================
   PARADOX143 — SECRETOS DEL CLARO + JARDÍN EVOLUTIVO

   6 cartitas secretas.
   4 secretos mediante exploración.
   2 secretos mediante condiciones especiales.

   El Claro evoluciona visualmente conforme descubres
   estas cartas, sin reemplazar el fondo ni los assets.
========================================================= */

(() => {
  'use strict';

  const KEY=
    'paradox143_refuge_secrets_v1';

  const PENDING_KEY=
    'paradox143_refuge_secret_letters_pending_v1';

  const FAMILY_KEY=
    'paradox143_refuge_family_v1';

  const SECRET_IDS=[
    'secret-garden-moon',
    'secret-garden-lantern',
    'secret-garden-tree',
    'secret-garden-flowers',
    'secret-three-wishes',
    'secret-stay-longer'
  ];


  const DEFAULT={
    moonTaps:0,
    lanternTaps:0,
    treeTaps:0,
    flowerTaps:0,

    moonFound:false,
    lanternFound:false,
    treeFound:false,
    flowersFound:false,
    wishesFound:false,
    stayFound:false,

    totalGardenMs:0,
    sessionStartedAt:0,

    stage:0
  };


  let garden=null;
  let layer=null;
  let letterDrop=null;
  let letterCount=null;
  let sessionTimer=0;
  let conditionTimer=0;


  function readJSON(
    key,
    fallback
  ){

    try{

      const raw=
        localStorage.getItem(
          key
        );

      if(!raw){
        return fallback;
      }

      const parsed=
        JSON.parse(raw);

      return parsed ?? fallback;

    }

    catch(_){

      return fallback;
    }
  }


  function writeJSON(
    key,
    value
  ){

    try{

      localStorage.setItem(
        key,
        JSON.stringify(value)
      );

    }

    catch(_){}
  }


  function load(){

    const value=
      readJSON(
        KEY,
        {}
      );

    return {
      ...DEFAULT,
      ...(
        value &&
        typeof value==='object'
        ? value
        : {}
      )
    };
  }


  function save(
    patch={}
  ){

    const next={
      ...load(),
      ...patch
    };

    writeJSON(
      KEY,
      next
    );

    return next;
  }


  function hasLetter(
    id
  ){

    try{

      return Boolean(
        window.ParadoxLetters
          ?.has
          ?.(
            id
          )
      );

    }

    catch(_){

      return false;
    }
  }


  function loadPending(){

    const arr=
      readJSON(
        PENDING_KEY,
        []
      );

    return Array.isArray(arr)
      ? arr.filter(
          id=>
            SECRET_IDS.includes(id)
        )
      : [];
  }


  function savePending(
    arr
  ){

    writeJSON(
      PENDING_KEY,
      arr
    );
  }


  function cleanPending(){

    const next=
      loadPending()
        .filter(
          id=>
            !hasLetter(id)
        );

    savePending(next);

    return next;
  }


  function queueLetter(
    id
  ){

    if(
      !SECRET_IDS.includes(id) ||
      hasLetter(id)
    ){
      return false;
    }


    const pending=
      loadPending();


    if(
      pending.includes(id)
    ){
      return false;
    }


    pending.push(id);

    savePending(
      pending
    );

    refreshLetterDrop();

    showHint(
      '💌 encontraste un secreto del Claro...',
      3300
    );

    updateEvolution();

    return true;
  }


  function ensureDOM(){

    garden=
      document.getElementById(
        'catGarden'
      );


    if(!garden){
      return false;
    }


    if(
      !document.getElementById(
        'refugeSecretsLayer'
      )
    ){

      layer=
        document.createElement(
          'div'
        );

      layer.id=
        'refugeSecretsLayer';

      layer.innerHTML=`
        <button
          class="refugeSecretHotspot moon"
          data-secret="moon"
          type="button"
          aria-label="Lunita del Claro"
        ></button>

        <button
          class="refugeSecretHotspot lantern"
          data-secret="lantern"
          type="button"
          aria-label="Farolito del Claro"
        ></button>

        <button
          class="refugeSecretHotspot tree"
          data-secret="tree"
          type="button"
          aria-label="Árbol del Claro"
        ></button>

        <button
          class="refugeSecretHotspot flowers"
          data-secret="flowers"
          type="button"
          aria-label="Flores del Claro"
        ></button>

        <div
          class="refugeEvolutionFireflies"
          aria-hidden="true"
        ></div>

        <div
          class="refugeEvolutionGarland"
          aria-hidden="true"
        >
          <span></span><span></span><span></span><span></span>
          <span></span><span></span><span></span>
        </div>

        <div
          class="refugeEvolutionFlowers"
          aria-hidden="true"
        >
          <i>✦</i><i>·</i><i>✦</i><i>·</i><i>✦</i>
        </div>

        <div
          id="refugeSecretHint"
          class="refugeSecretHint"
        ></div>
      `;


      garden.appendChild(
        layer
      );


      layer.addEventListener(
        'click',
        event=>{

          const hotspot=
            event
              .target
              .closest(
                '[data-secret]'
              );


          if(!hotspot){
            return;
          }


          handleHotspot(
            hotspot.dataset.secret,
            hotspot
          );
        }
      );
    }


    layer=
      document.getElementById(
        'refugeSecretsLayer'
      );


    if(
      !document.getElementById(
        'refugeSecretLetterDrop'
      )
    ){

      letterDrop=
        document.createElement(
          'button'
        );

      letterDrop.id=
        'refugeSecretLetterDrop';

      letterDrop.type='button';

      letterDrop.setAttribute(
        'aria-label',
        'Cartita secreta'
      );

      letterDrop.innerHTML=`
        <span class="refugeSecretEnvelope">
          <span>☾</span>
        </span>

        <span class="refugeSecretSpark">✦</span>

        <small
          id="refugeSecretLetterCount"
        ></small>
      `;


      garden.appendChild(
        letterDrop
      );


      letterDrop.addEventListener(
        'click',
        openNextSecret
      );
    }


    letterDrop=
      document.getElementById(
        'refugeSecretLetterDrop'
      );

    letterCount=
      document.getElementById(
        'refugeSecretLetterCount'
      );


    return true;
  }


  function showHint(
    text,
    duration=2200
  ){

    if(!ensureDOM()){
      return;
    }


    const hint=
      document.getElementById(
        'refugeSecretHint'
      );


    if(!hint){
      return;
    }


    hint.textContent=text;

    hint.classList.remove(
      'show'
    );

    void hint.offsetWidth;

    hint.classList.add(
      'show'
    );


    setTimeout(
      ()=>{
        hint.classList.remove(
          'show'
        );
      },
      duration
    );
  }


  function sparkleAt(
    hotspot,
    symbol='✦'
  ){

    const sparkle=
      document.createElement(
        'span'
      );

    sparkle.className=
      'refugeSecretTapSpark';

    sparkle.textContent=
      symbol;


    hotspot.appendChild(
      sparkle
    );


    setTimeout(
      ()=>sparkle.remove(),
      1100
    );
  }


  function handleHotspot(
    type,
    hotspot
  ){

    const st=load();


    if(type==='moon'){

      if(st.moonFound){
        sparkleAt(
          hotspot,
          '☾'
        );

        return;
      }


      const taps=
        Number(
          st.moonTaps||0
        )+1;


      save({
        moonTaps:taps
      });


      sparkleAt(
        hotspot,
        taps>=3
          ? '♡'
          : '☾'
      );


      if(taps>=3){

        save({
          moonFound:true
        });

        queueLetter(
          'secret-garden-moon'
        );
      }

      else{

        showHint(
          taps===1
            ? '☾ la lunita brilló un poquito...'
            : '☾ otra vez...',
          1500
        );
      }

      return;
    }


    if(type==='lantern'){

      if(st.lanternFound){
        sparkleAt(
          hotspot,
          '✦'
        );

        return;
      }


      const taps=
        Number(
          st.lanternTaps||0
        )+1;


      save({
        lanternTaps:taps
      });


      sparkleAt(
        hotspot,
        '✦'
      );


      if(taps>=3){

        save({
          lanternFound:true
        });

        queueLetter(
          'secret-garden-lantern'
        );
      }

      else{

        showHint(
          'el farolito se puso un poquito más cálido...',
          1600
        );
      }

      return;
    }


    if(type==='tree'){

      if(st.treeFound){
        sparkleAt(
          hotspot,
          '·'
        );

        return;
      }


      const taps=
        Number(
          st.treeTaps||0
        )+1;


      save({
        treeTaps:taps
      });


      sparkleAt(
        hotspot,
        taps>=5
          ? '♡'
          : '·'
      );


      if(taps>=5){

        save({
          treeFound:true
        });

        queueLetter(
          'secret-garden-tree'
        );
      }

      else if(
        taps===2 ||
        taps===4
      ){

        showHint(
          '...algo parece esconderse entre las ramitas',
          1700
        );
      }

      return;
    }


    if(type==='flowers'){

      if(st.flowersFound){
        sparkleAt(
          hotspot,
          '✿'
        );

        return;
      }


      const taps=
        Number(
          st.flowerTaps||0
        )+1;


      save({
        flowerTaps:taps
      });


      sparkleAt(
        hotspot,
        '✿'
      );


      if(taps>=4){

        save({
          flowersFound:true
        });

        queueLetter(
          'secret-garden-flowers'
        );
      }

      else{

        showHint(
          '✿ una florecita se movió...',
          1400
        );
      }
    }
  }


  function refreshLetterDrop(){

    if(!letterDrop){
      return;
    }


    const pending=
      cleanPending();


    letterDrop.classList.toggle(
      'show',
      pending.length>0
    );


    letterCount.textContent=
      pending.length>1
        ? `+${pending.length-1}`
        : '';
  }


  function openNextSecret(){

    const pending=
      cleanPending();

    const id=
      pending[0];


    if(!id){

      refreshLetterDrop();
      return;
    }


    try{

      window.ParadoxLetters
        ?.open
        ?.(
          id,
          true
        );

    }

    catch(_){}
  }


  window.addEventListener(
    'paradox-letter-collected',
    event=>{

      const id=
        event
          ?.detail
          ?.id;


      if(
        !SECRET_IDS.includes(id)
      ){
        return;
      }


      const next=
        loadPending()
          .filter(
            value=>
              value!==id
          );

      savePending(next);

      refreshLetterDrop();
      updateEvolution();
    }
  );


  /* =====================================================
     SECRETOS AUTOMÁTICOS
  ===================================================== */

  function allThreeHere(){

    const family=
      readJSON(
        FAMILY_KEY,
        {}
      );


    const mewo=
      document.getElementById(
        'catGardenMewoSpot'
      );


    return Boolean(
      family.grayArrived &&
      family.orangeArrived &&
      mewo &&
      mewo.classList.contains(
        'show'
      )
    );
  }


  function checkConditions(){

    if(
      !garden ||
      !garden.classList.contains(
        'show'
      )
    ){
      return;
    }


    const st=load();


    /*
      Tres deseos:
      los tres gatos juntos durante lluvia de estrellas.
    */
    if(
      !st.wishesFound &&
      allThreeHere() &&
      window.MAGIC_AMBIENT_ACTIVE==='stars'
    ){

      save({
        wishesFound:true
      });

      queueLetter(
        'secret-three-wishes'
      );
    }


    /*
      Quédate un ratito más:
      3 minutos acumulados dentro del Claro.
    */
    if(
      !st.stayFound &&
      Number(
        st.totalGardenMs||0
      )>=
        180000
    ){

      save({
        stayFound:true
      });

      queueLetter(
        'secret-stay-longer'
      );
    }
  }


  /* =====================================================
     EVOLUCIÓN VISUAL
  ===================================================== */

  function discoveredCount(){

    const st=load();


    return [
      st.moonFound,
      st.lanternFound,
      st.treeFound,
      st.flowersFound,
      st.wishesFound,
      st.stayFound
    ].filter(Boolean).length;
  }


  function updateEvolution(){

    if(!garden){
      return;
    }


    const count=
      discoveredCount();


    let stage=0;


    if(count>=2){
      stage=1;
    }

    if(count>=4){
      stage=2;
    }

    if(count>=6){
      stage=3;
    }


    save({
      stage
    });


    garden.dataset.secretStage=
      String(stage);
  }


  /* =====================================================
     TIEMPO EN EL CLARO
  ===================================================== */

  function startSession(){

    const st=load();


    if(
      !st.sessionStartedAt
    ){

      save({
        sessionStartedAt:
          Date.now()
      });
    }


    clearInterval(
      sessionTimer
    );


    sessionTimer=
      setInterval(
        ()=>{
          commitSessionTime();
          checkConditions();
        },
        15000
      );
  }


  function commitSessionTime(){

    const st=load();

    const started=
      Number(
        st.sessionStartedAt||0
      );


    if(!started){
      return;
    }


    const now=
      Date.now();


    save({
      totalGardenMs:
        Number(
          st.totalGardenMs||0
        )+
        Math.max(
          0,
          now-started
        ),

      sessionStartedAt:
        now
    });
  }


  function stopSession(){

    commitSessionTime();

    clearInterval(
      sessionTimer
    );


    save({
      sessionStartedAt:0
    });
  }


  function onOpen(){

    if(!ensureDOM()){
      return;
    }


    refreshLetterDrop();
    updateEvolution();
    startSession();


    clearInterval(
      conditionTimer
    );


    conditionTimer=
      setInterval(
        checkConditions,
        3500
      );


    checkConditions();
  }


  function onClose(){

    stopSession();

    clearInterval(
      conditionTimer
    );
  }


  window.addEventListener(
    'paradox-cat-garden-open',
    onOpen
  );


  window.addEventListener(
    'paradox-cat-garden-close',
    onClose
  );


  const init=
    setInterval(
      ()=>{

        if(ensureDOM()){

          clearInterval(init);

          refreshLetterDrop();
          updateEvolution();


          if(
            garden.classList.contains(
              'show'
            )
          ){
            onOpen();
          }
        }

      },
      500
    );


  window.ParadoxRefugeSecrets={
    getState:load,

    reset(){
      localStorage.removeItem(KEY);
      localStorage.removeItem(PENDING_KEY);

      refreshLetterDrop();
      updateEvolution();
    }
  };

})();
