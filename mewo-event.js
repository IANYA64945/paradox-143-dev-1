/* =========================================================
   MEWO — EVENTO LARGO Y REPETIBLE

   1. Mewo aparece de forma aleatoria.
   2. Hay que atraparla 4 veces.
   3. Después puedes:
      - jugar
      - alimentarla
      - darle mimitos
   4. Las actividades pueden repetirse.
   5. Cuando las tres se hicieron al menos una vez,
      aparece "Dejarla descansar".
   6. Mewo se despide, deja la carta y más adelante
      puede volver a aparecer.
========================================================= */

(() => {

  const STORAGE_KEY =
    'paradox143_letters_v1';

  const MEWO_ID =
    'mewo';

  const MEWO_MESSAGE =
    'eres y seras la mejoll mama gata de todas!!';

  const MEWO_MUSIC_SRC =
    'cats_in_cold.mp3';


  let eventActive=false;
  let phase='waiting';

  let catchCount=0;
  let petCount=0;
  let playCount=0;
  let feedCount=0;

  let petting=false;
  let lastPetX=0;
  let lastPetY=0;
  let petDistance=0;

  let catX=50;
  let catY=69;

  let scheduleTimer=0;

  const careDone=
    new Set();


  /* =====================================================
     DOM
  ===================================================== */

  const layer=
    document.createElement('div');

  layer.id=
    'mewoLayer';


  const catBtn=
    document.createElement('button');

  catBtn.id=
    'mewoCat';

  catBtn.type=
    'button';

  catBtn.setAttribute(
    'aria-label',
    'Mewo'
  );

  catBtn.innerHTML=
    '<img id="mewoImg" src="mewo.png" alt="Mewo">';


  const status=
    document.createElement('div');

  status.id=
    'mewoStatus';


  const hearts=
    document.createElement('div');

  hearts.id=
    'mewoHearts';


  const carePanel=
    document.createElement('div');

  carePanel.id=
    'mewoCarePanel';

  carePanel.innerHTML=
    `
      <div class="mewoCareTitle">¿QUÉ HACEMOS CON MEWO? ♡</div>

      <div class="mewoCareButtons">

        <button
          id="mewoPlayBtn"
          class="mewoCareBtn"
          type="button"
        >
          <span>●</span>
          JUGAR
        </button>

        <button
          id="mewoFeedBtn"
          class="mewoCareBtn"
          type="button"
        >
          <span>⌁</span>
          ALIMENTAR
        </button>

        <button
          id="mewoPetBtn"
          class="mewoCareBtn"
          type="button"
        >
          <span>♡</span>
          MIMITOS
        </button>

        <button
          id="mewoRestBtn"
          class="mewoCareBtn mewoRestBtn"
          type="button"
        >
          DEJARLA DESCANSAR ♡
        </button>

      </div>
    `;


  const toy=
    document.createElement('button');

  toy.id=
    'mewoToy';

  toy.type=
    'button';

  toy.setAttribute(
    'aria-label',
    'Juguete de Mewo'
  );

  toy.innerHTML=
    '<span></span>';


  const food=
    document.createElement('button');

  food.id=
    'mewoFood';

  food.type=
    'button';

  food.setAttribute(
    'aria-label',
    'Comida de Mewo'
  );

  food.innerHTML=
    `
      <span class="mewoFoodBowl"></span>
      <span class="mewoFoodBits">•••</span>
    `;


  const letter=
    document.createElement('button');

  letter.id=
    'mewoLetter';

  letter.type=
    'button';

  letter.setAttribute(
    'aria-label',
    'Carta de Mewo'
  );

  letter.innerHTML=
    `
      <span class="mewoEnvelope"></span>
      <span class="mewoSeal">♡</span>
      <span class="mewoPaw">✦</span>
    `;


  layer.appendChild(catBtn);
  layer.appendChild(status);
  layer.appendChild(hearts);
  layer.appendChild(carePanel);
  layer.appendChild(toy);
  layer.appendChild(food);
  layer.appendChild(letter);

  document.body.appendChild(layer);


  const mewoImg=
    document.getElementById(
      'mewoImg'
    );

  const playBtn=
    document.getElementById(
      'mewoPlayBtn'
    );

  const feedBtn=
    document.getElementById(
      'mewoFeedBtn'
    );

  const petBtn=
    document.getElementById(
      'mewoPetBtn'
    );

  const restBtn=
    document.getElementById(
      'mewoRestBtn'
    );


  /* =====================================================
     SPRITE
  ===================================================== */

  function prepareMewoSprite(){

    const img=
      new Image();


    img.onload=()=>{

      try{

        const c=
          document.createElement(
            'canvas'
          );

        c.width=
          img.naturalWidth||
          img.width;

        c.height=
          img.naturalHeight||
          img.height;


        const g=
          c.getContext(
            '2d',
            {
              willReadFrequently:true
            }
          );

        g.drawImage(
          img,
          0,
          0
        );


        const data=
          g.getImageData(
            0,
            0,
            c.width,
            c.height
          );

        const p=
          data.data;


        for(
          let i=0;
          i<p.length;
          i+=4
        ){

          const light=
            (
              p[i]+
              p[i+1]+
              p[i+2]
            )/3;


          if(light>238){

            p[i+3]=0;
          }

          else if(light>175){

            p[i]=0;
            p[i+1]=0;
            p[i+2]=0;

            p[i+3]=
              Math.max(
                0,
                Math.min(
                  255,
                  (
                    238-light
                  )*4
                )
              );
          }

          else{

            p[i]=0;
            p[i+1]=0;
            p[i+2]=0;
          }
        }


        g.putImageData(
          data,
          0,
          0
        );


        mewoImg.src=
          c.toDataURL(
            'image/png'
          );

      }
      catch(_){}
    };


    img.src=
      'mewo.png';
  }


  prepareMewoSprite();


  /* =====================================================
     CARTAS / CANASTA
  ===================================================== */

  function readSavedLetters(){

    try{

      const raw=
        localStorage.getItem(
          STORAGE_KEY
        );

      const arr=
        raw
        ? JSON.parse(raw)
        : [];

      return Array.isArray(arr)
        ? arr
        : [];
    }
    catch(_){

      return [];
    }
  }


  function saveMewoLetter(){

    const arr=
      readSavedLetters();


    if(
      !arr.includes(
        MEWO_ID
      )
    ){

      arr.push(
        MEWO_ID
      );


      try{

        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(arr)
        );

      }
      catch(_){}
    }


    syncBasketCount();
    injectMewoIntoBasket();
    pulseBasket();
  }


  function hasMewoLetter(){

    return readSavedLetters()
      .includes(
        MEWO_ID
      );
  }


  function syncBasketCount(){

    const count=
      document.getElementById(
        'basketCount'
      );


    if(count){

      count.textContent=
        String(
          new Set(
            readSavedLetters()
          ).size
        );
    }
  }


  function pulseBasket(){

    const basket=
      document.getElementById(
        'letterBasketBtn'
      );


    if(!basket){
      return;
    }


    basket.classList.remove(
      'pulse'
    );

    void basket.offsetWidth;

    basket.classList.add(
      'pulse'
    );
  }


  /* =====================================================
     MÚSICA
  ===================================================== */

  function startMewoMusic(){

    if(window.ParadoxAudio){

      window.ParadoxAudio
        .playSpecial(
          MEWO_MUSIC_SRC,
          .46,
          {
            owner:'mewo',
            trackId:'mewo',
            label:'Mewo · Cats in Cold'
          }
        );
    }
  }


  function restoreFieldMusic(){

    if(window.ParadoxAudio){

      window.ParadoxAudio
        .restoreNormal(
          'mewo'
        );
    }
  }


  /* =====================================================
     MENSAJES
  ===================================================== */

  function showStatus(
    html,
    duration=3000
  ){

    status.innerHTML=
      html;

    status.classList.remove(
      'show'
    );

    void status.offsetWidth;

    status.classList.add(
      'show'
    );


    clearTimeout(
      showStatus.timer
    );


    showStatus.timer=
      setTimeout(
        ()=>{
          status.classList.remove(
            'show'
          );
        },
        duration
      );
  }


  /* =====================================================
     POSICIÓN
  ===================================================== */

  function setCatPosition(
    x,
    y
  ){

    catX=
      Math.max(
        10,
        Math.min(
          90,
          x
        )
      );

    catY=
      Math.max(
        56,
        Math.min(
          82,
          y
        )
      );


    catBtn.style.left=
      `${catX}%`;

    catBtn.style.top=
      `${catY}%`;


    hearts.style.left=
      `${catX}%`;

    hearts.style.top=
      `${catY-5}%`;
  }


  function randomPosition(){

    const portrait=
      window.innerHeight>
      window.innerWidth;


    return{

      x:
        13+
        Math.random()*74,

      y:
        portrait
        ? 59+Math.random()*18
        : 61+Math.random()*16
    };
  }


  function moveMewo(){

    let next=
      randomPosition();


    if(
      Math.abs(
        next.x-catX
      )<18
    ){

      next.x=
        next.x<50

        ? Math.min(
            88,
            next.x+27
          )

        : Math.max(
            12,
            next.x-27
          );
    }


    catBtn.classList.remove(
      'hop'
    );

    void catBtn.offsetWidth;

    catBtn.classList.add(
      'hop'
    );


    setCatPosition(
      next.x,
      next.y
    );
  }


  function setObjectPosition(
    element
  ){

    const p=
      randomPosition();


    element.style.left=
      `${p.x}%`;

    element.style.top=
      `${Math.min(80,p.y+2)}%`;
  }


  /* =====================================================
     CORAZONES
  ===================================================== */

  function makeHeartBurst(){

    hearts.innerHTML='';


    for(
      let i=0;
      i<8;
      i++
    ){

      const h=
        document.createElement(
          'span'
        );

      h.className=
        'mewoHeart';

      h.textContent=
        '♡';

      h.style.left=
        `${8+Math.random()*82}%`;

      h.style.animationDelay=
        `${Math.random()*.35}s`;


      hearts.appendChild(
        h
      );
    }


    hearts.classList.remove(
      'show'
    );

    void hearts.offsetWidth;

    hearts.classList.add(
      'show'
    );


    setTimeout(
      ()=>{
        hearts.classList.remove(
          'show'
        );
      },
      1900
    );
  }


  /* =====================================================
     CUÁNDO APARECE
  ===================================================== */

  function sceneBusy(){

    if(
      document.body.classList.contains(
        'intro-active'
      )
    ){
      return true;
    }


    const game=
      document.getElementById(
        'gameOverlay'
      );


    if(
      game &&
      game.classList.contains(
        'show'
      )
    ){
      return true;
    }


    if(
      window.MAGIC_SPECIAL_PENDING
    ){
      return true;
    }


    /*
      Un clima elegido manualmente desde ☁ es solamente
      el fondo. Mewo puede aparecer encima de él.
    */
    if(
      window.MAGIC_AMBIENT_ACTIVE &&
      !window.MAGIC_MANUAL_CLIMATE_ACTIVE
    ){
      return true;
    }


    const reader=
      document.getElementById(
        'letterReader'
      );


    if(
      reader &&
      reader.classList.contains(
        'show'
      )
    ){
      return true;
    }


    return false;
  }


  function scheduleMewo(
    repeat=false
  ){

    clearTimeout(
      scheduleTimer
    );


    if(
      typeof isMewoResident==='function' &&
      isMewoResident()
    ){

      if(
        typeof showResidentMewo==='function'
      ){
        showResidentMewo();
      }

      return;
    }


    /*
      Primera aparición:
      55 a 100 segundos.

      Después de despedirse:
      3.5 a 6.5 minutos.
    */

    const delay=
      repeat

      ? 210000+
        Math.random()*180000

      : 55000+
        Math.random()*45000;


    scheduleTimer=
      setTimeout(
        startMewoEvent,
        delay
      );
  }


  function waitForField(){

    if(
      !document.body.classList.contains(
        'intro-active'
      )
    ){

      scheduleMewo(false);

      return;
    }


    const observer=
      new MutationObserver(
        ()=>{

          if(
            !document.body.classList.contains(
              'intro-active'
            )
          ){

            observer.disconnect();

            setTimeout(
              ()=>scheduleMewo(false),
              900
            );
          }
        }
      );


    observer.observe(
      document.body,
      {
        attributes:true,
        attributeFilter:['class']
      }
    );
  }


  /* =====================================================
     INICIO
  ===================================================== */

  function resetMewoState(){

    eventActive=false;
    phase='waiting';

    catchCount=0;
    petCount=0;
    playCount=0;
    feedCount=0;

    careDone.clear();

    petting=false;

    catBtn.className='';
    catBtn.id='mewoCat';

    catBtn.style.display='';
    catBtn.classList.remove(
      'show',
      'caught',
      'loved',
      'leaving',
      'petPulse',
      'hop'
    );

    carePanel.classList.remove(
      'show'
    );

    toy.classList.remove(
      'show'
    );

    food.classList.remove(
      'show'
    );

    letter.classList.remove(
      'show'
    );

    letter.style.display='';

    updateCarePanel();
  }


  function startMewoEvent(){

    if(
      typeof isMewoResident==='function' &&
      isMewoResident()
    ){
      showResidentMewo();
      return;
    }


    if(eventActive){
      return;
    }


    if(sceneBusy()){

      scheduleTimer=
        setTimeout(
          startMewoEvent,
          12000
        );

      return;
    }


    eventActive=true;
    phase='catch';

    if(window.ParadoxStats){
      window.ParadoxStats.inc('mewoAppearances');
    }

    catchCount=0;
    careDone.clear();


    const p=
      randomPosition();


    setCatPosition(
      p.x,
      p.y
    );


    catBtn.style.display='';
    catBtn.classList.add(
      'show'
    );


    startMewoMusic();


    showStatus(
      '✦ Algo se mueve entre los tulipanes... <strong>¡Mewo volvió!</strong>',
      4200
    );
  }


  /* =====================================================
     ATRAPAR
  ===================================================== */

  catBtn.addEventListener(
    'click',
    e=>{

      e.preventDefault();
      e.stopPropagation();


      if(!eventActive){
        return;
      }


      if(phase==='catch'){

        catchCount++;


        if(catchCount<4){

          showStatus(
            `¡Mewo se escapó! Atrápala otra vez ♡ &nbsp; ${catchCount}/4`,
            1900
          );

          moveMewo();

          return;
        }


        phase='care';

        catBtn.classList.add(
          'caught'
        );


        showStatus(
          '♡ ¡La atrapaste! Ahora puedes quedarte un rato con Mewo.',
          4200
        );


        setTimeout(
          showCareMenu,
          650
        );

        return;
      }


      if(phase==='pet'){

        addPet();
      }

    }
  );


  /* =====================================================
     MENÚ DE CUIDADOS
  ===================================================== */

  function updateCarePanel(){

    const mapping=[
      [
        'play',
        playBtn
      ],
      [
        'feed',
        feedBtn
      ],
      [
        'pet',
        petBtn
      ]
    ];


    for(
      const [
        key,
        btn
      ]
      of mapping
    ){

      btn.classList.toggle(
        'done',
        careDone.has(key)
      );
    }


    const allDone=
      careDone.has('play') &&
      careDone.has('feed') &&
      careDone.has('pet');


    restBtn.classList.toggle(
      'unlocked',
      allDone
    );
  }


  function showCareMenu(){

    if(!eventActive){
      return;
    }


    phase='care';

    toy.classList.remove(
      'show'
    );

    food.classList.remove(
      'show'
    );

    updateCarePanel();

    carePanel.classList.add(
      'show'
    );


    if(
      careDone.size===0
    ){

      showStatus(
        'Puedes <strong>jugar</strong>, <strong>alimentarla</strong> o darle <strong>mimitos</strong> ♡',
        5000
      );
    }
  }


  function completeCare(
    key,
    text
  ){

    careDone.add(
      key
    );

    makeHeartBurst();

    showStatus(
      text,
      3300
    );


    setTimeout(
      ()=>{
        showCareMenu();
      },
      800
    );
  }


  /* =====================================================
     JUGAR — ATRAPAR LA BOLITA 3 VECES
  ===================================================== */

  function startPlay(){

    if(window.ParadoxStats){
      window.ParadoxStats.inc('mewoPlaySessions');
    }

    phase='play';
    playCount=0;

    carePanel.classList.remove(
      'show'
    );

    setObjectPosition(
      toy
    );

    toy.classList.add(
      'show'
    );


    showStatus(
      '● Juega con Mewo: toca la bolita <strong>3 veces</strong>.',
      4200
    );
  }


  toy.addEventListener(
    'click',
    e=>{

      e.preventDefault();
      e.stopPropagation();


      if(phase!=='play'){
        return;
      }


      playCount++;


      const rect=
        toy.getBoundingClientRect();


      const px=
        (
          rect.left+
          rect.width*.5
        )/
        window.innerWidth*
        100;

      const py=
        (
          rect.top+
          rect.height*.5
        )/
        window.innerHeight*
        100;


      setCatPosition(
        Math.max(
          10,
          Math.min(
            90,
            px-5
          )
        ),
        Math.max(
          56,
          Math.min(
            82,
            py
          )
        )
      );


      catBtn.classList.remove(
        'hop'
      );

      void catBtn.offsetWidth;

      catBtn.classList.add(
        'hop'
      );


      if(playCount>=3){

        toy.classList.remove(
          'show'
        );

        completeCare(
          'play',
          'Mewo persiguió la bolita por todo el pasto ♡'
        );

        return;
      }


      setObjectPosition(
        toy
      );


      showStatus(
        `¡Otra vez! ● &nbsp; ${playCount}/3`,
        1500
      );
    }
  );


  /* =====================================================
     ALIMENTAR — 3 BOCADITOS
  ===================================================== */

  function startFeed(){

    if(window.ParadoxStats){
      window.ParadoxStats.inc('mewoFeedSessions');
    }

    phase='feed';
    feedCount=0;

    carePanel.classList.remove(
      'show'
    );

    setObjectPosition(
      food
    );

    food.classList.add(
      'show'
    );


    showStatus(
      '⌁ Dale de comer a Mewo: toca su platito <strong>3 veces</strong>.',
      4200
    );
  }


  food.addEventListener(
    'click',
    e=>{

      e.preventDefault();
      e.stopPropagation();


      if(phase!=='feed'){
        return;
      }


      feedCount++;


      catBtn.classList.remove(
        'petPulse'
      );

      void catBtn.offsetWidth;

      catBtn.classList.add(
        'petPulse'
      );


      if(feedCount>=3){

        food.classList.remove(
          'show'
        );

        completeCare(
          'feed',
          'ñam ñam... Mewo quedó satisfecha ♡'
        );

        return;
      }


      showStatus(
        `ñam... ♡ &nbsp; ${feedCount}/3`,
        1500
      );
    }
  );


  /* =====================================================
     MIMITOS — DESLIZAR O TOCAR 5 VECES
  ===================================================== */

  function startPet(){

    if(window.ParadoxStats){
      window.ParadoxStats.inc('mewoPetSessions');
    }

    phase='pet';
    petCount=0;

    carePanel.classList.remove(
      'show'
    );


    showStatus(
      '♡ Dale mimitos deslizando el dedo sobre Mewo. <span id="mewoPetMeter">♡♡♡♡♡</span>',
      6500
    );
  }


  function addPet(){

    if(
      phase!=='pet' ||
      !eventActive
    ){
      return;
    }


    petCount=
      Math.min(
        5,
        petCount+1
      );


    catBtn.classList.remove(
      'petPulse'
    );

    void catBtn.offsetWidth;

    catBtn.classList.add(
      'petPulse'
    );


    const meter=
      document.getElementById(
        'mewoPetMeter'
      );


    if(meter){

      meter.textContent=
        '♥'.repeat(petCount)+
        '♡'.repeat(
          5-petCount
        );
    }


    if(petCount>=5){

      completeCare(
        'pet',
        'prrrrr... ♡ Mewo recibió todos sus mimitos.'
      );
    }
  }


  catBtn.addEventListener(
    'pointerdown',
    e=>{

      if(phase!=='pet'){
        return;
      }


      petting=true;

      lastPetX=e.clientX;
      lastPetY=e.clientY;

      petDistance=0;


      try{

        catBtn.setPointerCapture(
          e.pointerId
        );

      }
      catch(_){}
    }
  );


  catBtn.addEventListener(
    'pointermove',
    e=>{

      if(
        !petting ||
        phase!=='pet'
      ){
        return;
      }


      const dx=
        e.clientX-
        lastPetX;

      const dy=
        e.clientY-
        lastPetY;


      petDistance+=
        Math.hypot(
          dx,
          dy
        );


      lastPetX=
        e.clientX;

      lastPetY=
        e.clientY;


      if(petDistance>=28){

        petDistance=0;

        addPet();
      }
    }
  );


  function stopPetting(e){

    if(!petting){
      return;
    }


    petting=false;


    try{

      if(
        catBtn.hasPointerCapture(
          e.pointerId
        )
      ){

        catBtn.releasePointerCapture(
          e.pointerId
        );
      }

    }
    catch(_){}
  }


  catBtn.addEventListener(
    'pointerup',
    stopPetting
  );

  catBtn.addEventListener(
    'pointercancel',
    stopPetting
  );


  playBtn.addEventListener(
    'click',
    startPlay
  );

  feedBtn.addEventListener(
    'click',
    startFeed
  );

  petBtn.addEventListener(
    'click',
    startPet
  );


  /* =====================================================
     MEWO — VÍNCULO, DESCANSO Y POSIBILIDAD DE QUEDARSE
  ===================================================== */

  const MEWO_HOME_KEY=
    'paradox143_mewo_home_v1';


  function defaultHomeState(){

    const now=
      Date.now();

    return {
      resident:false,
      since:0,

      lastFeed:now,
      lastPlay:now,
      lastPet:now,
      sleepUntil:0,

      pillowMade:false,
      craftProgress:0,
      pillowColor:'rose',
      pillowSymbol:'♡',

      residentFeeds:0,
      residentPlays:0,
      residentPets:0
    };
  }


  function loadHomeState(){

    try{

      const raw=
        localStorage.getItem(
          MEWO_HOME_KEY
        );

      if(!raw){
        return defaultHomeState();
      }


      const parsed=
        JSON.parse(raw);

      return {
        ...defaultHomeState(),
        ...(
          parsed &&
          typeof parsed==='object'
          ? parsed
          : {}
        )
      };
    }

    catch(_){
      return defaultHomeState();
    }
  }


  function saveHomeState(
    patch={}
  ){

    const next={
      ...loadHomeState(),
      ...patch
    };


    try{

      localStorage.setItem(
        MEWO_HOME_KEY,
        JSON.stringify(next)
      );

    }

    catch(_){}


    try{

      window.dispatchEvent(
        new CustomEvent(
          'paradox-mewo-home-change',
          {
            detail:next
          }
        )
      );

    }

    catch(_){}


    return next;
  }


  function isMewoResident(){

    return Boolean(
      loadHomeState().resident
    );
  }


  function mewoBond(){

    if(!window.ParadoxStats){
      return 0;
    }


    const get=
      key=>
        Number(
          window.ParadoxStats.get(key)
        )||0;


    return Math.min(
      100,

      get('mewoAppearances')*4+
      get('mewoPlaySessions')*6+
      get('mewoFeedSessions')*6+
      get('mewoPetSessions')*8+
      get('mewoTracksCompleted')*3+
      get('mewoRested')*7
    );
  }


  function dropLetterNearMewo(){

    letter.style.display='';

    letter.style.left=
      `${catX}%`;

    letter.style.top=
      `${Math.min(
        82,
        catY+7
      )}%`;


    setTimeout(
      ()=>{
        letter.classList.add(
          'show'
        );
      },
      1100
    );
  }


  function normalMewoGoodbye(){

    phase='leaving';

    carePanel.classList.remove(
      'show'
    );

    toy.classList.remove(
      'show'
    );

    food.classList.remove(
      'show'
    );


    catBtn.classList.remove(
      'caught',
      'petPulse',
      'sleeping'
    );

    catBtn.classList.add(
      'loved'
    );


    makeHeartBurst();


    showStatus(
      'prrrrr... ♡ Mewo está feliz. Se quedará un poquito más contigo...',
      3800
    );


    setTimeout(
      ()=>{

        catBtn.classList.remove(
          'loved'
        );

        catBtn.classList.add(
          'leaving'
        );


        showStatus(
          'Mewo se va entre los tulipanes... pero antes dejó una cartita ♡',
          4200
        );


        dropLetterNearMewo();


        setTimeout(
          ()=>{
            catBtn.style.display='none';
          },
          2500
        );

      },
      4800
    );
  }


  function temporaryMewoSleep(){

    phase='sleeping-before-leave';

    carePanel.classList.remove(
      'show'
    );

    toy.classList.remove(
      'show'
    );

    food.classList.remove(
      'show'
    );


    /* Cerca de la canasta, sin taparla. */
    setCatPosition(
      window.innerWidth<600
      ? 23
      : 18,
      78
    );


    catBtn.classList.remove(
      'caught',
      'petPulse',
      'loved'
    );

    catBtn.classList.add(
      'sleeping'
    );


    showStatus(
      'zZ... Mewo decidió dormir un ratito cerca de tu canasta ♡',
      4500
    );


    setTimeout(
      ()=>{

        catBtn.classList.remove(
          'sleeping'
        );

        normalMewoGoodbye();

      },
      11000+
      Math.random()*6000
    );
  }


  function makeMewoResident(){

    const now=
      Date.now();


    saveHomeState({
      resident:true,
      since:now,

      lastFeed:now,
      lastPlay:now,
      lastPet:now,
      sleepUntil:0
    });


    eventActive=false;
    phase='resident';


    carePanel.classList.remove(
      'show'
    );

    toy.classList.remove(
      'show'
    );

    food.classList.remove(
      'show'
    );


    setCatPosition(
      window.innerWidth<600
      ? 23
      : 18,
      78
    );


    catBtn.classList.remove(
      'caught',
      'petPulse'
    );

    catBtn.classList.add(
      'loved'
    );


    makeHeartBurst();


    showStatus(
      '♡ Mewo miró la canasta, se acomodó cerca... y decidió quedarse contigo.',
      5600
    );


    clearTimeout(
      scheduleTimer
    );


    setTimeout(
      ()=>{

        catBtn.style.display='none';
        catBtn.classList.remove(
          'loved'
        );


        if(!hasMewoLetter()){
          dropLetterNearMewo();
        }


        restoreFieldMusic();
        showResidentMewo();


        setTimeout(
          ()=>{
            showStatus(
              '🧵 Ahora puedes tejerle una almohada para su nuevo rincón ♡',
              5200
            );
          },
          1700
        );

      },
      2800
    );
  }


  function resolveMewoRest(){

    if(
      !careDone.has('play') ||
      !careDone.has('feed') ||
      !careDone.has('pet')
    ){
      return;
    }


    if(window.ParadoxStats){
      window.ParadoxStats.inc(
        'mewoRested'
      );
    }


    const bond=
      mewoBond();

    const rests=
      window.ParadoxStats
      ? Number(
          window.ParadoxStats.get(
            'mewoRested'
          )
        )||0
      : 0;


    /*
      Desde la segunda visita completa ya existe una
      posibilidad real de que se quede. El vínculo la
      aumenta, pero nunca es obligatorio.
    */
    const eligible=
      rests>=2 ||
      bond>=38;


    const stayChance=
      Math.min(
        .68,
        .14+
        rests*.075+
        Math.max(
          0,
          bond-30
        )*.006
      );


    if(
      eligible &&
      Math.random()<stayChance
    ){

      makeMewoResident();
      return;
    }


    /*
      Incluso cuando todavía no vive aquí, muchas veces
      se queda dormida un rato antes de marcharse.
    */
    const sleepChance=
      Math.min(
        .76,
        .45+
        bond*.003
      );


    if(
      Math.random()<sleepChance
    ){

      temporaryMewoSleep();
      return;
    }


    normalMewoGoodbye();
  }


  restBtn.addEventListener(
    'click',
    resolveMewoRest
  );


  /* =====================================================
     CARTA
  ===================================================== */

  function openMewoLetter(){

    const reader=
      document.getElementById(
        'letterReader'
      );

    const mark=
      document.getElementById(
        'readerMark'
      );

    const title=
      document.getElementById(
        'readerTitle'
      );

    const text=
      document.getElementById(
        'readerText'
      );

    const keep=
      document.getElementById(
        'readerKeep'
      );


    if(
      !reader ||
      !mark ||
      !title ||
      !text
    ){

      alert(
        MEWO_MESSAGE
      );

      saveMewoLetter();
    }

    else{

      mark.textContent='♡';

      title.textContent=
        'Una cartita de Mewo';

      text.textContent=
        MEWO_MESSAGE;


      if(keep){
        keep.style.display=
          'none';
      }


      reader.classList.add(
        'show'
      );


      saveMewoLetter();
    }


    restoreFieldMusic();


    /*
      Mewo puede regresar en esta misma visita.
      La carta no se duplica en la canasta.
    */

    eventActive=false;
    phase='waiting';

    scheduleMewo(true);
  }


  letter.addEventListener(
    'click',
    ()=>{

      letter.classList.remove(
        'show'
      );

      letter.style.display=
        'none';


      openMewoLetter();


      setTimeout(
        resetMewoState,
        700
      );
    }
  );


  /* =====================================================
     CANASTA
  ===================================================== */

  function injectMewoIntoBasket(){

    if(!hasMewoLetter()){
      return;
    }


    const list=
      document.getElementById(
        'basketLetters'
      );


    if(!list){
      return;
    }


    if(
      list.querySelector(
        '.basketLetterItem[data-letter="mewo"]'
      )
    ){

      syncBasketCount();

      return;
    }


    const empty=
      list.querySelector(
        '.basketEmpty'
      );


    if(
      empty &&
      readSavedLetters().length>0
    ){

      empty.remove();
    }


    const item=
      document.createElement(
        'button'
      );


    item.className=
      'basketLetterItem';

    item.dataset.letter=
      'mewo';

    item.type=
      'button';


    item.innerHTML=
      `
        <span class="basketLetterMark">♡</span>

        <span>
          <strong>Carta de Mewo</strong>
          <small>Toca para volver a leerla</small>
        </span>
      `;


    item.addEventListener(
      'click',
      ()=>{

        const overlay=
          document.getElementById(
            'basketOverlay'
          );


        if(overlay){

          overlay.classList.remove(
            'show'
          );
        }


        const reader=
          document.getElementById(
            'letterReader'
          );

        const mark=
          document.getElementById(
            'readerMark'
          );

        const title=
          document.getElementById(
            'readerTitle'
          );

        const text=
          document.getElementById(
            'readerText'
          );

        const keep=
          document.getElementById(
            'readerKeep'
          );


        if(
          reader &&
          mark &&
          title &&
          text
        ){

          mark.textContent='♡';

          title.textContent=
            'Una cartita de Mewo';

          text.textContent=
            MEWO_MESSAGE;


          if(keep){
            keep.style.display=
              'none';
          }


          reader.classList.add(
            'show'
          );
        }
      }
    );


    list.appendChild(
      item
    );


    syncBasketCount();
  }


  const basketBtn=
    document.getElementById(
      'letterBasketBtn'
    );


  if(basketBtn){

    basketBtn.addEventListener(
      'click',
      ()=>{

        setTimeout(
          ()=>{
            injectMewoIntoBasket();
            syncBasketCount();
          },
          0
        );
      }
    );
  }


  setTimeout(
    syncBasketCount,
    800
  );




  /* =====================================================
     HUELLAS ENCONTRADAS

     La actividad de huellas no invoca a Mewo
     inmediatamente: reduce mucho la espera.
  ===================================================== */

  window.addEventListener(
    'mewo-footprints-complete',
    ()=>{

      if(eventActive){
        return;
      }


      clearTimeout(
        scheduleTimer
      );


      /*
        Después de seguir todas las huellas,
        Mewo puede aparecer entre 12 y 28 s.
      */

      scheduleTimer=
        setTimeout(
          startMewoEvent,
          12000+
          Math.random()*16000
        );

    }
  );



  /* =====================================================
     MEWO — MASCOTA VIRTUAL 1.0
  ===================================================== */

  const homeLayer=
    document.createElement(
      'div'
    );

  homeLayer.id=
    'mewoHomeLayer';


  const homePillow=
    document.createElement(
      'button'
    );

  homePillow.id=
    'mewoHomePillow';

  homePillow.type='button';

  homePillow.setAttribute(
    'aria-label',
    'Almohada de Mewo'
  );

  homePillow.innerHTML=
    `
      <img
        id="mewoHomePillowImg"
        src=""
        alt="Almohada de Mewo"
      >
    `;


  const residentCat=
    document.createElement(
      'button'
    );

  residentCat.id=
    'mewoResidentCat';

  residentCat.type='button';

  residentCat.setAttribute(
    'aria-label',
    'Mewo, tu mascota'
  );

  residentCat.innerHTML=
    `
      <img
        id="mewoResidentImg"
        src="mewo.png"
        alt="Mewo"
      >

      <span id="mewoSleepZ">zZ</span>
    `;


  const homeMood=
    document.createElement(
      'div'
    );

  homeMood.id=
    'mewoHomeMood';


  const homePanel=
    document.createElement(
      'div'
    );

  homePanel.id=
    'mewoHomePanel';

  homePanel.innerHTML=
    `
      <div class="mewoHomeTitle">
        MEWO ♡
      </div>

      <div
        id="mewoHomeStateText"
        class="mewoHomeStateText"
      >
        feliz de estar aquí
      </div>

      <div class="mewoHomeActions">

        <button id="mewoHomePetBtn" type="button">
          <span>♡</span>
          MIMITOS
        </button>

        <button id="mewoHomeFeedBtn" type="button">
          <span>⌁</span>
          COMIDA
        </button>

        <button id="mewoHomePlayBtn" type="button">
          <span>●</span>
          JUGAR
        </button>

        <button id="mewoHomeCraftBtn" type="button">
          <span>🧵</span>
          ALMOHADA
        </button>

      </div>
    `;


  const homeToy=
    document.createElement(
      'button'
    );

  homeToy.id=
    'mewoHomeToy';

  homeToy.type='button';

  homeToy.setAttribute(
    'aria-label',
    'Bolita de Mewo'
  );

  homeToy.innerHTML=
    '<span></span>';


  const homeFood=
    document.createElement(
      'button'
    );

  homeFood.id=
    'mewoHomeFood';

  homeFood.type='button';

  homeFood.setAttribute(
    'aria-label',
    'Comida de Mewo'
  );

  homeFood.innerHTML=
    `
      <span class="mewoHomeFoodBowl"></span>
      <span class="mewoHomeFoodBits">•••</span>
    `;


  const craftPanel=
    document.createElement(
      'div'
    );

  craftPanel.id=
    'mewoCraftPanel';


  homeLayer.appendChild(
    homePillow
  );

  homeLayer.appendChild(
    residentCat
  );

  homeLayer.appendChild(
    homeMood
  );

  homeLayer.appendChild(
    homePanel
  );

  homeLayer.appendChild(
    homeToy
  );

  homeLayer.appendChild(
    homeFood
  );

  homeLayer.appendChild(
    craftPanel
  );

  document.body.appendChild(
    homeLayer
  );


  const residentImg=
    document.getElementById(
      'mewoResidentImg'
    );

  const homeStateText=
    document.getElementById(
      'mewoHomeStateText'
    );

  const homePetBtn=
    document.getElementById(
      'mewoHomePetBtn'
    );

  const homeFeedBtn=
    document.getElementById(
      'mewoHomeFeedBtn'
    );

  const homePlayBtn=
    document.getElementById(
      'mewoHomePlayBtn'
    );

  const homeCraftBtn=
    document.getElementById(
      'mewoHomeCraftBtn'
    );


  let residentTimer=0;
  let residentSleepTimer=0;
  let residentMode=null;
  let residentCount=0;


  function syncResidentSprite(){

    /*
      La mascota residente usa un único cuerpo estable.
      Antes copiaba el sprite del evento temporal y otro
      módulo lo volvía a cambiar, causando saltos de tamaño.
    */
    residentImg.src=
      'mewo_idle.png';
  }


  const PILLOW_COLORS={

    rose:[
      '#e9a4c4',
      '#b95f8f'
    ],

    moon:[
      '#a8bce0',
      '#687fac'
    ],

    lavender:[
      '#c5aadf',
      '#80669f'
    ],

    mint:[
      '#a9cfc3',
      '#648f84'
    ],

    cream:[
      '#eadcbb',
      '#b59e74'
    ]
  };


  const PILLOW_SYMBOLS=[
    '♡',
    '☾',
    '✦',
    '🌷'
  ];


  function applyPillow(){

    const state=
      loadHomeState();

    let gardenState={};
    let owned=[];

    try{
      gardenState=
        JSON.parse(
          localStorage.getItem(
            'paradox143_cat_garden_v1'
          ) || '{}'
        ) || {};
    }catch(_){}

    try{
      const parsed=
        JSON.parse(
          localStorage.getItem(
            'paradox143_pillows_v1'
          ) || '[]'
        );

      owned=
        Array.isArray(parsed)
        ? parsed
        : [];
    }catch(_){}

    const active=
      gardenState.activePillow ||
      owned[0] ||
      null;

    const sources={
      huella:'pillow_huella.png',
      luna:'pillow_luna.png',
      estrellas:'pillow_estrellas.png'
    };

    const src=
      active
      ? sources[active]
      : '';

    const pillowImg=
      document.getElementById(
        'mewoHomePillowImg'
      );

    if(pillowImg){
      pillowImg.src=src;
    }

    const ready=
      Boolean(
        state.pillowMade &&
        src
      );

    homePillow.classList.toggle(
      'unfinished',
      !ready
    );

    homePillow.classList.toggle(
      'finished',
      ready
    );

    homePillow.setAttribute(
      'aria-hidden',
      ready ? 'false' : 'true'
    );
  }


  function renderCraftPanel(){

    const state=
      loadHomeState();


    if(!state.pillowMade){

      craftPanel.innerHTML=
        `
          <div class="mewoCraftTitle">
            🧵 TEJER ALMOHADA
          </div>

          <p>
            Toca el hilo para tejer
            la almohada de Mewo.
          </p>

          <div class="mewoThreadBar">
            <span
              style="width:${
                Math.min(
                  100,
                  state.craftProgress*20
                )
              }%"
            ></span>
          </div>

          <div class="mewoThreadCount">
            ${Math.min(5,state.craftProgress)}/5 puntadas
          </div>

          <button
            id="mewoWeaveBtn"
            class="mewoWeaveBtn"
            type="button"
          >
            ⌁ TEJER ✦
          </button>

          <button
            id="mewoCraftClose"
            class="mewoCraftClose"
            type="button"
          >
            cerrar
          </button>
        `;


      document
        .getElementById(
          'mewoWeaveBtn'
        )
        .addEventListener(
          'click',
          ()=>{

            const current=
              loadHomeState();

            const progress=
              Math.min(
                5,
                (
                  current.craftProgress||0
                )+1
              );


            saveHomeState({
              craftProgress:progress,
              pillowMade:
                progress>=5
            });


            makeHeartBurst();


            if(progress>=5){

              showStatus(
                '🧵♡ ¡Terminaste la almohada de Mewo!',
                3400
              );

              applyPillow();
            }


            renderCraftPanel();
          }
        );
    }

    else{

      craftPanel.innerHTML=
        `
          <div class="mewoCraftTitle">
            🧵 ALMOHADA DE MEWO
          </div>

          <p>
            Elige el color y el bordado.
          </p>

          <div class="mewoPillowColors">

            ${
              Object.keys(
                PILLOW_COLORS
              )
              .map(
                color=>
                  `
                    <button
                      type="button"
                      data-pillow-color="${color}"
                      class="${
                        state.pillowColor===color
                        ? 'selected'
                        : ''
                      }"
                      aria-label="Color ${color}"
                    ></button>
                  `
              )
              .join('')
            }

          </div>

          <div class="mewoPillowSymbols">

            ${
              PILLOW_SYMBOLS
              .map(
                symbol=>
                  `
                    <button
                      type="button"
                      data-pillow-symbol="${symbol}"
                      class="${
                        state.pillowSymbol===symbol
                        ? 'selected'
                        : ''
                      }"
                    >
                      ${symbol}
                    </button>
                  `
              )
              .join('')
            }

          </div>

          <small>
            Toca la almohada para que Mewo se acueste ♡
          </small>

          <button
            id="mewoCraftClose"
            class="mewoCraftClose"
            type="button"
          >
            listo ♡
          </button>
        `;


      craftPanel
        .querySelectorAll(
          '[data-pillow-color]'
        )
        .forEach(
          btn=>{

            const color=
              btn.dataset.pillowColor;

            const pair=
              PILLOW_COLORS[color];


            if(pair){
              btn.style.background=
                `linear-gradient(145deg,${pair[0]},${pair[1]})`;
            }


            btn.addEventListener(
              'click',
              ()=>{

                saveHomeState({
                  pillowColor:color
                });

                applyPillow();
                renderCraftPanel();
              }
            );
          }
        );


      craftPanel
        .querySelectorAll(
          '[data-pillow-symbol]'
        )
        .forEach(
          btn=>{

            btn.addEventListener(
              'click',
              ()=>{

                saveHomeState({
                  pillowSymbol:
                    btn.dataset.pillowSymbol
                });

                applyPillow();
                renderCraftPanel();
              }
            );
          }
        );
    }


    const close=
      document.getElementById(
        'mewoCraftClose'
      );


    if(close){

      close.addEventListener(
        'click',
        ()=>{
          craftPanel.classList.remove(
            'show'
          );
        }
      );
    }
  }


  function residentMood(){

    const state=
      loadHomeState();

    const now=
      Date.now();


    if(state.sleepUntil>now){
      return 'sleeping';
    }


    if(
      now-state.lastFeed>
      9*60*1000
    ){
      return 'hungry';
    }


    if(
      now-state.lastPlay>
      7*60*1000
    ){
      return 'playful';
    }


    if(
      now-state.lastPet>
      6*60*1000
    ){
      return 'affection';
    }


    return 'happy';
  }


  function updateResidentMood(){

    if(!isMewoResident()){
      return;
    }


    const mood=
      residentMood();


    residentImg.src=
      'mewo_idle.png';


    residentCat.classList.toggle(
      'sleeping',
      mood==='sleeping'
    );


    homeLayer.classList.toggle(
      'mewo-on-pillow',
      Boolean(
        mood==='sleeping' &&
        homePillow.classList.contains(
          'finished'
        )
      )
    );


    const texts={

      sleeping:
        'zZ... duerme tranquila en su rincón',

      hungry:
        'te mira como si quisiera un bocadito',

      playful:
        'parece que quiere jugar',

      affection:
        'se acercó buscando mimitos',

      happy:
        'feliz de estar aquí contigo ♡'
    };


    homeStateText.textContent=
      texts[mood];


    homeMood.textContent=
      mood==='sleeping'
      ? 'zZ'
      : mood==='hungry'
      ? '⌁'
      : mood==='playful'
      ? '●'
      : mood==='affection'
      ? '♡'
      : '✦';
  }


  function putResidentToSleep(
    seconds=
      65+
      Math.random()*55
  ){

    if(!isMewoResident()){
      return;
    }


    saveHomeState({
      sleepUntil:
        Date.now()+
        seconds*1000
    });


    homePanel.classList.remove(
      'show'
    );

    craftPanel.classList.remove(
      'show'
    );

    homeToy.classList.remove(
      'show'
    );

    homeFood.classList.remove(
      'show'
    );


    residentCat.classList.add(
      'settling'
    );


    setTimeout(
      ()=>{
        residentCat.classList.remove(
          'settling'
        );
        updateResidentMood();
      },
      620
    );


    showStatus(
      'zZ... Mewo se acomodó en su almohada ♡',
      3300
    );
  }


  function scheduleResidentSleep(){

    clearTimeout(
      residentSleepTimer
    );


    if(!isMewoResident()){
      return;
    }


    residentSleepTimer=
      setTimeout(
        ()=>{

          if(
            isMewoResident() &&
            residentMood()!=='sleeping' &&
            !homePanel.classList.contains('show') &&
            !craftPanel.classList.contains('show') &&
            Math.random()<.52
          ){
            putResidentToSleep();
          }


          scheduleResidentSleep();

        },
        65000+
        Math.random()*65000
      );
  }


  function showResidentMewo(){

    if(!isMewoResident()){
      return;
    }


    if(
      document.body.classList.contains(
        'intro-active'
      )
    ){

      setTimeout(
        showResidentMewo,
        1000
      );

      return;
    }


    syncResidentSprite();
    applyPillow();
    updateResidentMood();

    homeLayer.classList.add(
      'show'
    );


    clearInterval(
      residentTimer
    );

    residentTimer=
      setInterval(
        updateResidentMood,
        12000
      );


    scheduleResidentSleep();
  }


  residentCat.addEventListener(
    'click',
    e=>{

      e.preventDefault();
      e.stopPropagation();


      if(!isMewoResident()){
        return;
      }


      if(residentMood()==='sleeping'){

        saveHomeState({
          sleepUntil:0,
          lastPet:Date.now()
        });


        makeHeartBurst();

        showStatus(
          '♡ Mewo abrió los ojitos al sentirte cerca.',
          3000
        );

        updateResidentMood();
        return;
      }


      homePanel.classList.toggle(
        'show'
      );

      craftPanel.classList.remove(
        'show'
      );
    }
  );


  homePetBtn.addEventListener(
    'click',
    ()=>{

      const state=
        loadHomeState();


      saveHomeState({
        lastPet:Date.now(),
        sleepUntil:0,
        residentPets:
          (state.residentPets||0)+1
      });


      if(window.ParadoxStats){
        window.ParadoxStats.inc(
          'mewoPetSessions'
        );
      }


      residentCat.classList.remove(
        'petPulse'
      );

      void residentCat.offsetWidth;

      residentCat.classList.add(
        'petPulse'
      );


      makeHeartBurst();

      showStatus(
        'prrrrr... ♡ Mewo se pegó un poquito más a ti.',
        3200
      );

      updateResidentMood();
    }
  );


  function startResidentFeed(){

    residentMode='feed';
    residentCount=0;

    homePanel.classList.remove(
      'show'
    );

    homeFood.classList.add(
      'show'
    );


    showStatus(
      '⌁ Dale tres bocaditos a Mewo.',
      3000
    );
  }


  homeFeedBtn.addEventListener(
    'click',
    startResidentFeed
  );


  homeFood.addEventListener(
    'click',
    ()=>{

      if(residentMode!=='feed'){
        return;
      }


      residentCount++;


      if(residentCount>=3){

        residentMode=null;

        homeFood.classList.remove(
          'show'
        );


        const state=
          loadHomeState();


        saveHomeState({
          lastFeed:Date.now(),
          sleepUntil:0,
          residentFeeds:
            (state.residentFeeds||0)+1
        });


        if(window.ParadoxStats){
          window.ParadoxStats.inc(
            'mewoFeedSessions'
          );
        }


        makeHeartBurst();

        showStatus(
          'ñam... ♡ quedó satisfecha.',
          3000
        );

        updateResidentMood();
      }
    }
  );


  function moveHomeToy(){

    const spots=[
      [22,46],
      [62,48],
      [38,74],
      [78,68]
    ];


    const p=
      spots[
        Math.floor(
          Math.random()*spots.length
        )
      ];


    homeToy.style.left=
      `${p[0]}px`;

    homeToy.style.bottom=
      `${p[1]}px`;
  }


  homePlayBtn.addEventListener(
    'click',
    ()=>{

      residentMode='play';
      residentCount=0;

      homePanel.classList.remove(
        'show'
      );

      moveHomeToy();

      homeToy.classList.add(
        'show'
      );


      showStatus(
        '● Atrapa la bolita 3 veces con Mewo.',
        3200
      );
    }
  );


  homeToy.addEventListener(
    'click',
    ()=>{

      if(residentMode!=='play'){
        return;
      }


      residentCount++;

      residentCat.classList.remove(
        'homeHop'
      );

      void residentCat.offsetWidth;

      residentCat.classList.add(
        'homeHop'
      );


      if(residentCount>=3){

        residentMode=null;

        homeToy.classList.remove(
          'show'
        );


        const state=
          loadHomeState();


        saveHomeState({
          lastPlay:Date.now(),
          sleepUntil:0,
          residentPlays:
            (state.residentPlays||0)+1
        });


        if(window.ParadoxStats){
          window.ParadoxStats.inc(
            'mewoPlaySessions'
          );
        }


        makeHeartBurst();

        showStatus(
          '●♡ Mewo corrió detrás de la bolita y volvió a su rincón.',
          3300
        );

        updateResidentMood();
        return;
      }


      moveHomeToy();
    }
  );


  homeCraftBtn.addEventListener(
    'click',
    ()=>{

      renderCraftPanel();

      craftPanel.classList.toggle(
        'show'
      );
    }
  );


  homePillow.addEventListener(
    'click',
    ()=>{

      if(!isMewoResident()){
        return;
      }


      const state=
        loadHomeState();


      if(!state.pillowMade){

        renderCraftPanel();
        craftPanel.classList.add(
          'show'
        );

        return;
      }


      putResidentToSleep();
    }
  );


  window.addEventListener(
    'paradox-mewo-home-change',
    ()=>{

      if(isMewoResident()){
        showResidentMewo();
      }
    }
  );


  window.addEventListener(
    'paradox-cat-garden-change',
    ()=>{
      applyPillow();
      updateResidentMood();
    }
  );


  if(isMewoResident()){

    setTimeout(
      showResidentMewo,
      1100
    );
  }


  resetMewoState();
  waitForField();

})();
