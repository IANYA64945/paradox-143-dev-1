/* =========================================================
   PARCHE MÁGICO DEL CAMPO

   El arrastre ya no sirve solamente para mover el campo:
   ahora también cuenta como "exploración".

   Al explorar suficiente distancia, aparecen eventos:
   - lluvia de estrellas
   - neblina
   - lluvia
   - tormenta (último evento especial)

   No interfiere con el movimiento original del campo.
========================================================= */

(() => {

  const fieldApp = document.getElementById('app');

  if (!fieldApp) return;




  /* =====================================================
     MÚSICA COMPARTIDA PARA LOS EVENTOS

     Archivos opcionales:
     - musica_estrellas.mp3
     - musica_neblina.mp3
     - musica_lluvia.mp3
     - musica_tormenta.mp3

     Si alguno todavía no existe, el campo continúa
     con musica.mp3 sin romper el evento.
  ===================================================== */

  const EVENT_MUSIC = {
    stars:'musica_estrellas.mp3',
    fog:'musica_neblina.mp3',
    rain:'musica_lluvia.mp3',
    storm:'musica_tormenta.mp3',
    snow:'musica_nieve.mp3'
  };




  /* =====================================================
     PROGRESO / ESTADÍSTICAS
  ===================================================== */

  const PARADOX_STATS_KEY='paradox143_stats_v1';

  function createParadoxStats(){
    if(window.ParadoxStats){
      return window.ParadoxStats;
    }

    let data={};

    try{
      const raw=localStorage.getItem(PARADOX_STATS_KEY);
      const parsed=raw?JSON.parse(raw):{};
      if(parsed && typeof parsed==='object') data=parsed;
    }catch(_){ }

    function save(){
      try{
        localStorage.setItem(PARADOX_STATS_KEY,JSON.stringify(data));
      }catch(_){ }
    }

    function inc(key,amount=1){
      data[key]=Math.max(0,Number(data[key]||0)+amount);
      save();
      try{
        document.dispatchEvent(new CustomEvent('paradox-stats-changed',{detail:{key,value:data[key]}}));
      }catch(_){ }
      return data[key];
    }

    function get(key){
      return Number(data[key]||0);
    }

    function all(){
      return {...data};
    }

    const api={inc,get,all};
    window.ParadoxStats=api;
    return api;
  }

  const paradoxStats=createParadoxStats();


  function createParadoxAudioManager(){

    if(window.ParadoxAudio){
      return window.ParadoxAudio;
    }


    const audio =
      document.getElementById(
        'bgMusic'
      );

    const musicBtn =
      document.getElementById(
        'musicBtn'
      );


    const UNLOCK_KEY =
      'paradox143_music_unlocks_v1';


    /*
      La canción principal siempre está disponible.
      Las demás se desbloquean al descubrir su evento.
    */

    const TRACKS = {

      main:{
        id:'main',
        label:'Campo',
        detail:'principal',
        src:'musica.mp3',
        volume:.35
      },

      garden:{
        id:'garden',
        label:'Claro de Mewo',
        detail:'🐾',
        src:'musica_claro.mp3',
        volume:.38
      },

      moon:{
        id:'moon',
        label:'Luna',
        detail:'☾',
        src:'musica_luna.mp3',
        volume:.44
      },

      stars:{
        id:'stars',
        label:'Estrellas',
        detail:'✦',
        src:'musica_estrellas.mp3',
        volume:.47
      },

      fog:{
        id:'fog',
        label:'Neblina',
        detail:'◌',
        src:'musica_neblina.mp3',
        volume:.46
      },

      rain:{
        id:'rain',
        label:'Lluvia',
        detail:'◇',
        src:'musica_lluvia.mp3',
        volume:.48
      },

      snow:{
        id:'snow',
        label:'Nevada',
        detail:'❄',
        src:'musica_nieve.mp3',
        volume:.46
      },

      storm:{
        id:'storm',
        label:'Tormenta',
        detail:'⚡',
        src:'musica_tormenta.mp3',
        volume:.50
      },

      mewo:{
        id:'mewo',
        label:'Mewo',
        detail:'♡',
        src:'cats_in_cold.mp3',
        volume:.46
      }

    };


    let gardenTime=0;

    let fadeTimer=0;
    let requestToken=0;
    let specialOwner=null;
    let specialTrackId=null;

    let principalTime=0;

    const existsCache=
      new Map();


    /* =====================================================
       DESBLOQUEOS
    ===================================================== */

    function loadUnlocks(){

      const result=
        new Set(['main']);


      try{

        const raw=
          localStorage.getItem(
            UNLOCK_KEY
          );

        const arr=
          raw
          ? JSON.parse(raw)
          : [];


        if(Array.isArray(arr)){

          for(const id of arr){

            if(TRACKS[id]){
              result.add(id);
            }
          }
        }

      }
      catch(_){}


      /*
        Migración:
        si ya había encontrado una carta ANTES de
        instalar este parche, su música ya cuenta
        como desbloqueada.
      */

      try{

        const raw=
          localStorage.getItem(
            'paradox143_letters_v1'
          );

        const letters=
          raw
          ? JSON.parse(raw)
          : [];


        if(Array.isArray(letters)){

          const migration={
            moon:'moon',
            'weather-stars':'stars',
            'weather-fog':'fog',
            'weather-rain':'rain',
            'weather-storm':'storm',
            'weather-snow':'snow',
            mewo:'mewo'
          };


          for(
            const letterId
            of letters
          ){

            const trackId=
              migration[letterId];


            if(trackId){
              result.add(trackId);
            }
          }
        }

      }
      catch(_){}


      /*
        Migración del Claro:
        si el Jardín de Mewo ya estaba desbloqueado antes
        de añadir su música, también debe aparecer como
        música desbloqueada en el menú.
      */

      try{

        const raw=
          localStorage.getItem(
            'paradox143_cat_garden_v1'
          );

        const garden=
          raw
          ? JSON.parse(raw)
          : null;


        if(
          garden &&
          garden.unlocked
        ){
          result.add(
            'garden'
          );
        }

      }
      catch(_){}


      return result;
    }


    const unlocked=
      loadUnlocks();


    function saveUnlocks(){

      try{

        localStorage.setItem(
          UNLOCK_KEY,
          JSON.stringify(
            [...unlocked]
          )
        );

      }
      catch(_){}
    }


    /* =====================================================
       UI PEQUEÑA
    ===================================================== */

    const panel=
      document.createElement(
        'div'
      );

    panel.id=
      'unlockMusicPanel';


    const panelHeader=
      document.createElement(
        'div'
      );

    panelHeader.className=
      'unlockMusicHeader';

    panelHeader.innerHTML=
      `
        <span>MÚSICAS ♫</span>

        <button
          id="unlockMusicPause"
          type="button"
          aria-label="Pausar o reproducir"
        >
          ▮▮
        </button>

        <button
          id="unlockMusicClose"
          type="button"
          aria-label="Cerrar"
        >
          ×
        </button>
      `;


    const trackList=
      document.createElement(
        'div'
      );

    trackList.id=
      'unlockMusicList';


    panel.appendChild(
      panelHeader
    );

    panel.appendChild(
      trackList
    );

    document.body.appendChild(
      panel
    );


    const specialChip=
      document.createElement(
        'div'
      );

    specialChip.id=
      'specialMusicChip';

    specialChip.innerHTML=
      `
        <span id="specialMusicLabel">♫ evento</span>

        <button
          id="specialMusicReturn"
          type="button"
        >
          ↩ normal
        </button>
      `;

    document.body.appendChild(
      specialChip
    );


    const musicToast=
      document.createElement(
        'div'
      );

    musicToast.id=
      'unlockMusicToast';

    document.body.appendChild(
      musicToast
    );


    const pauseBtn=
      panel.querySelector(
        '#unlockMusicPause'
      );

    const closeBtn=
      panel.querySelector(
        '#unlockMusicClose'
      );

    const specialLabel=
      specialChip.querySelector(
        '#specialMusicLabel'
      );

    const specialReturn=
      specialChip.querySelector(
        '#specialMusicReturn'
      );


    function toast(
      text,
      duration=2500
    ){

      musicToast.textContent=
        text;

      musicToast.classList.remove(
        'show'
      );

      void musicToast.offsetWidth;

      musicToast.classList.add(
        'show'
      );


      clearTimeout(
        toast.timer
      );


      toast.timer=
        setTimeout(
          ()=>{
            musicToast.classList.remove(
              'show'
            );
          },
          duration
        );
    }


    function currentSrcName(){

      if(!audio){
        return '';
      }


      const attr=
        audio.getAttribute(
          'src'
        ) || '';


      return attr
        .split('/')
        .pop();
    }


    function currentTrackId(){

      const src=
        currentSrcName();


      for(
        const track
        of Object.values(TRACKS)
      ){

        if(track.src===src){
          return track.id;
        }
      }


      return null;
    }


    function renderTracks(){

      trackList.innerHTML='';


      const activeId=
        currentTrackId();


      for(
        const track
        of Object.values(TRACKS)
      ){

        const isUnlocked=
          unlocked.has(
            track.id
          );


        const row=
          document.createElement(
            'button'
          );

        row.type='button';

        row.className=
          'unlockMusicTrack';


        if(
          activeId===
          track.id
        ){

          row.classList.add(
            'playing'
          );
        }


        if(!isUnlocked){

          row.classList.add(
            'locked'
          );

          row.disabled=true;
        }


        row.innerHTML=
          `
            <span class="musicTrackMark">
              ${
                isUnlocked
                ? track.detail
                : '🔒'
              }
            </span>

            <span class="musicTrackName">
              ${track.label}
            </span>

            <span class="musicTrackState">
              ${
                isUnlocked
                ? (
                    activeId===track.id
                    ? '▶'
                    : '·'
                  )
                : ''
              }
            </span>
          `;


        if(isUnlocked){

          row.addEventListener(
            'click',
            ()=>{

              playManual(
                track.id
              );
            }
          );
        }


        trackList.appendChild(
          row
        );
      }
    }


    function openPanel(){

      renderTracks();

      panel.classList.add(
        'show'
      );
    }


    function closePanel(){

      panel.classList.remove(
        'show'
      );
    }


    function togglePanel(){

      if(
        panel.classList.contains(
          'show'
        )
      ){

        closePanel();
      }

      else{

        openPanel();
      }
    }


    /*
      Reutilizamos el botón ♫ que ya existía.
      El listener usa CAPTURE para que no se ejecute
      el antiguo comportamiento de pausar directamente.
    */

    if(musicBtn){

      musicBtn.classList.add(
        'available'
      );

      musicBtn.textContent='♫';

      musicBtn.setAttribute(
        'aria-label',
        'Músicas desbloqueadas'
      );


      musicBtn.addEventListener(
        'click',
        e=>{

          e.preventDefault();

          e.stopImmediatePropagation();

          togglePanel();
        },
        true
      );
    }


    closeBtn.addEventListener(
      'click',
      closePanel
    );


    pauseBtn.addEventListener(
      'click',
      async ()=>{

        if(!audio){
          return;
        }


        if(audio.paused){

          try{

            await audio.play();

            pauseBtn.textContent=
              '▮▮';
          }
          catch(_){}
        }

        else{

          audio.pause();

          pauseBtn.textContent=
            '▶';
        }


        renderTracks();
      }
    );


    document.addEventListener(
      'pointerdown',
      e=>{

        if(
          !panel.classList.contains(
            'show'
          )
        ){
          return;
        }


        if(
          panel.contains(
            e.target
          ) ||
          (
            musicBtn &&
            musicBtn.contains(
              e.target
            )
          )
        ){
          return;
        }


        closePanel();
      },
      true
    );


    /* =====================================================
       AUDIO
    ===================================================== */

    function fadeTo(
      target,
      duration=620
    ){

      return new Promise(
        resolve=>{

          if(!audio){

            resolve();

            return;
          }


          clearInterval(
            fadeTimer
          );


          const start=
            Number.isFinite(
              audio.volume
            )
            ? audio.volume
            : .35;


          const started=
            performance.now();


          fadeTimer=
            setInterval(
              ()=>{

                const t=
                  Math.min(
                    1,
                    (
                      performance.now()-
                      started
                    )/
                    duration
                  );


                audio.volume=
                  Math.max(
                    0,
                    Math.min(
                      1,
                      start+
                      (
                        target-start
                      )*t
                    )
                  );


                if(t>=1){

                  clearInterval(
                    fadeTimer
                  );

                  fadeTimer=0;

                  resolve();
                }

              },
              35
            );
        }
      );
    }


    async function exists(
      src
    ){

      if(
        existsCache.has(
          src
        )
      ){

        return existsCache.get(
          src
        );
      }


      try{

        const response=
          await fetch(
            src,
            {
              method:'HEAD',
              cache:'no-store'
            }
          );


        const ok=
          response.ok;


        /*
          Solo memorizamos los archivos que SÍ existen.
          Si hoy falta un MP3 y luego lo subes a GitHub,
          el juego podrá detectarlo sin quedar atrapado
          en un 404 guardado.
        */

        if(ok){

          existsCache.set(
            src,
            true
          );

        }

        else{

          existsCache.delete(
            src
          );
        }


        return ok;

      }
      catch(_){

        existsCache.delete(
          src
        );

        return false;
      }
    }


    async function switchTrack(
      track,
      startAt=0
    ){

      if(
        !audio ||
        !track
      ){
        return false;
      }


      const token=
        ++requestToken;


      if(
        !(await exists(
          track.src
        )) ||
        token!==requestToken
      ){

        toast(
          `No encuentro ${track.src}`
        );

        return false;
      }


      if(
        currentSrcName()===
          TRACKS.main.src
      ){

        principalTime=
          Number.isFinite(
            audio.currentTime
          )
          ? audio.currentTime
          : principalTime;
      }


      if(!audio.paused){

        await fadeTo(
          0,
          360
        );
      }


      if(
        token!==requestToken
      ){
        return false;
      }


      try{

        audio.pause();

        audio.setAttribute(
          'src',
          track.src
        );

        audio.load();

        audio.loop=true;

        audio.volume=.02;


        const setTime=()=>{

          try{

            audio.currentTime=
              Math.max(
                0,
                startAt
              );

          }
          catch(_){}
        };


        if(
          audio.readyState>=1
        ){

          setTime();
        }

        else{

          audio.addEventListener(
            'loadedmetadata',
            setTime,
            {
              once:true
            }
          );
        }


        const p=
          audio.play();


        if(
          p &&
          typeof p.then==='function'
        ){

          await p;
        }


        if(
          token!==requestToken
        ){
          return false;
        }


        await fadeTo(
          track.volume,
          520
        );


        if(
          pauseBtn
        ){

          pauseBtn.textContent=
            '▮▮';
        }


        renderTracks();

        return true;

      }
      catch(_){

        toast(
          'El navegador bloqueó la reproducción.'
        );

        return false;
      }
    }


    async function playMain(){

      specialOwner=null;
      specialTrackId=null;

      specialChip.classList.remove(
        'show'
      );


      const ok=
        await switchTrack(
          TRACKS.main,
          principalTime
        );


      renderTracks();

      return ok;
    }


    async function playGarden(){

      /*
        Música exclusiva del Claro.
        Mientras estás dentro, los climas siguen
        visualmente en los bordes pero no sustituyen
        esta canción.
      */

      /*
        Entrar al Jardín ya cuenta como descubrir
        su pista. Así aparece correctamente en el menú.
      */
      unlock(
        'garden',
        false
      );


      specialOwner=null;
      specialTrackId=null;

      specialChip.classList.remove(
        'show'
      );


      const available=
        await exists(
          TRACKS.garden.src
        );


      if(!available){

        /*
          El Jardín sigue funcionando aunque todavía
          no exista su MP3. Mostramos el motivo real.
        */

        toast(
          'Falta musica_claro.mp3 en la raíz del juego.',
          3600
        );

        return playMain();
      }


      specialOwner='cat-garden';
      specialTrackId='garden';

      specialLabel.textContent=
        '♫ Claro de Mewo';

      specialChip.classList.add(
        'show'
      );


      const ok=
        await switchTrack(
          TRACKS.garden,
          gardenTime
        );


      renderTracks();

      return ok;
    }


    async function leaveGardenMusic(){

      if(
        specialOwner!=='cat-garden'
      ){
        return false;
      }


      specialOwner=null;
      specialTrackId=null;

      specialChip.classList.remove(
        'show'
      );


      return playMain();
    }


    async function playManual(
      trackId
    ){

      if(trackId==='main'){

        const ok=
          await playMain();

        if(ok){
          toast('♫ Campo');
        }

        closePanel();

        return ok;
      }


      const track=
        TRACKS[trackId];


      if(
        !track ||
        !unlocked.has(
          trackId
        )
      ){
        return false;
      }


      /*
        Seleccionar una canción desde el menú es
        una decisión del usuario y cancela el
        bloqueo musical del evento actual.
      */

      specialOwner=null;
      specialTrackId=null;

      specialChip.classList.remove(
        'show'
      );


      const startAt=
        trackId==='main'
        ? principalTime
        : 0;


      const ok=
        await switchTrack(
          track,
          startAt
        );


      if(ok){

        toast(
          `♫ ${track.label}`
        );
      }


      closePanel();

      return ok;
    }


    function unlock(
      trackId,
      announce=true
    ){

      if(
        !TRACKS[trackId] ||
        unlocked.has(
          trackId
        )
      ){

        return false;
      }


      unlocked.add(
        trackId
      );

      saveUnlocks();

      renderTracks();


      if(
        musicBtn
      ){

        musicBtn.classList.remove(
          'musicUnlockPulse'
        );

        void musicBtn.offsetWidth;

        musicBtn.classList.add(
          'musicUnlockPulse'
        );
      }


      if(announce){

        toast(
          `♫ Música desbloqueada: ${TRACKS[trackId].label}`,
          3300
        );
      }


      return true;
    }


    async function playSpecial(
      src,
      volume=.46,
      options={}
    ){

      if(
        !audio ||
        !src
      ){
        return false;
      }


      const trackId=
        options.trackId ||
        (
          Object.values(TRACKS)
            .find(
              track=>
                track.src===src
            )
            ?.id
        );


      const owner=
        options.owner ||
        trackId ||
        src;


      const label=
        options.label ||
        (
          trackId &&
          TRACKS[trackId]
          ? TRACKS[trackId].label
          : 'Evento'
        );


      if(trackId){

        unlock(
          trackId,
          true
        );
      }


      /*
        Una música de evento que ya está sonando
        no se corta por otro secreto incidental.
        Así se puede escuchar de verdad.
      */

      if(
        specialOwner &&
        specialOwner!==owner
      ){

        return false;
      }


      const baseTrack=
        trackId &&
        TRACKS[trackId]

        ? {
            ...TRACKS[trackId],
            volume
          }

        : {
            id:trackId||'special',
            label,
            src,
            volume
          };

      const specialStartAt=
        Number.isFinite(options.startAt)
        ? Math.max(0, options.startAt)
        : 0;


      specialOwner=
        owner;

      specialTrackId=
        trackId||null;


      specialLabel.textContent=
        `♫ ${label}`;

      specialChip.classList.add(
        'show'
      );


      const ok=
        await switchTrack(
          baseTrack,
          specialStartAt
        );


      if(!ok){

        if(
          specialOwner===owner
        ){

          specialOwner=null;
          specialTrackId=null;

          specialChip.classList.remove(
            'show'
          );
        }
      }


      return ok;
    }


    async function restoreNormal(
      owner=null
    ){

      /*
        Solo el evento que inició la música puede
        terminarla automáticamente.

        Si el usuario ya pulsó "normal" o eligió
        otra canción, no hacemos nada al final.
      */

      if(
        owner &&
        specialOwner!==owner
      ){

        return false;
      }


      if(
        !specialOwner &&
        owner
      ){

        return false;
      }


      return playMain();
    }


    specialReturn.addEventListener(
      'click',
      e=>{

        e.preventDefault();
        e.stopPropagation();

        /*
          Botón solicitado:
          no hace falta esperar a que termine el evento.
        */

        playMain();

        toast(
          '♫ Volviendo a la música normal'
        );
      }
    );


    /*
      Guardamos la posición de la canción principal
      para volver aproximadamente al mismo punto.
    */

    if(audio){

      audio.addEventListener(
        'timeupdate',
        ()=>{

          if(
            !Number.isFinite(
              audio.currentTime
            )
          ){
            return;
          }


          if(
            currentSrcName()===
            TRACKS.main.src
          ){
            principalTime=
              audio.currentTime;
          }


          if(
            currentSrcName()===
            TRACKS.garden.src
          ){
            gardenTime=
              audio.currentTime;
          }
        }
      );


      audio.addEventListener(
        'play',
        ()=>{

          if(pauseBtn){
            pauseBtn.textContent='▮▮';
          }

          renderTracks();
        }
      );


      audio.addEventListener(
        'pause',
        ()=>{

          if(pauseBtn){
            pauseBtn.textContent='▶';
          }

          renderTracks();
        }
      );
    }


    saveUnlocks();
    renderTracks();


    const manager={
      playSpecial,
      restoreNormal,
      playMain,
      playGarden,
      leaveGardenMusic,
      playManual,
      unlock,
      tracks:TRACKS,
      unlocked
    };


    window.ParadoxAudio=
      manager;


    return manager;
  }


  const paradoxAudio =
    createParadoxAudioManager();


  /*
    El módulo del Jardín ya emite estos eventos.
    No hay que tocar la lógica de Mewo ni del claro.
  */

  window.addEventListener(
    'paradox-cat-garden-open',
    ()=>{
      paradoxAudio.playGarden();
    }
  );


  window.addEventListener(
    'paradox-cat-garden-close',
    ()=>{
      paradoxAudio.leaveGardenMusic();
    }
  );


  /* =====================================================
     CAPA VISUAL
  ===================================================== */

  const layer = document.createElement('div');
  layer.id = 'magicAmbientLayer';

  const twinkles = document.createElement('div');
  twinkles.id = 'magicTwinkles';

  const fog = document.createElement('div');
  fog.id = 'magicFog';
  fog.innerHTML = `
    <div class="magicFogBank"></div>
    <div class="magicFogBank"></div>
    <div class="magicFogBank"></div>
  `;

  const weatherCanvas = document.createElement('canvas');
  weatherCanvas.id = 'magicWeatherCanvas';

  const stormShade = document.createElement('div');
  stormShade.id = 'magicStormShade';

  const lightning = document.createElement('div');
  lightning.id = 'magicLightning';


  /*
    Capas atmosféricas HD:
    cambian la sensación completa del campo,
    no solamente agregan partículas encima.
  */

  const atmosphere =
    document.createElement('div');

  atmosphere.id =
    'magicAtmosphere';

  atmosphere.innerHTML =
    `
      <div id="magicSkyTint"></div>

      <div id="magicCloudLayer">
        <span class="magicCloud cloud1"></span>
        <span class="magicCloud cloud2"></span>
        <span class="magicCloud cloud3"></span>
        <span class="magicCloud cloud4"></span>
        <span class="magicCloud cloud5"></span>
      </div>

      <div id="magicStarGlow"></div>
      <div id="magicRainHaze"></div>
      <div id="magicWetGround"></div>
      <div id="magicWindVeil"></div>
      <div id="magicLightningBolt"></div>
    `;


  layer.appendChild(twinkles);
  layer.appendChild(atmosphere);
  layer.appendChild(fog);
  layer.appendChild(stormShade);
  layer.appendChild(weatherCanvas);
  layer.appendChild(lightning);

  document.body.appendChild(layer);


  const lightningBolt =
    document.getElementById(
      'magicLightningBolt'
    );


  /* =====================================================
     ESTRELLAS TITILANTES
  ===================================================== */

  function buildTwinkles() {

    twinkles.innerHTML = '';

    const mobile =
      window.matchMedia('(max-width:600px)').matches;

    const count =
      mobile ? 22 : 36;

    for (let i = 0; i < count; i++) {

      const star =
        document.createElement('span');

      star.className =
        'magicTwinkleStar' +
        (Math.random() > .79 ? ' big' : '');

      star.style.left =
        `${3 + Math.random() * 94}%`;

      star.style.top =
        `${4 + Math.random() * 88}%`;

      star.style.setProperty(
        '--twinkle-time',
        `${3.2 + Math.random() * 4.8}s`
      );

      star.style.setProperty(
        '--twinkle-delay',
        `${-Math.random() * 6}s`
      );

      twinkles.appendChild(star);
    }
  }

  buildTwinkles();


  /* =====================================================
     CANASTA: BADGE + CARTITA VOLANDO
  ===================================================== */

  const basket =
    document.getElementById('letterBasketBtn');

  const basketCount =
    document.getElementById('basketCount');

  let previousBasketCount =
    basketCount
      ? Number(basketCount.textContent) || 0
      : 0;


  function pulseBadge() {

    if (!basketCount) return;

    basketCount.classList.remove('badgePop');

    void basketCount.offsetWidth;

    basketCount.classList.add('badgePop');
  }


  function flyLetterToBasket() {

    if (!basket) return;

    if (
      document.body.classList.contains(
        'intro-active'
      )
    ) {
      return;
    }

    const basketRect =
      basket.getBoundingClientRect();

    let startX =
      window.innerWidth * .50;

    let startY =
      window.innerHeight * .45;


    /*
      Si hay una carta abierta,
      sale desde la carta.
    */

    const reader =
      document.querySelector(
        '#letterReader.show .readerPaper'
      );

    if (reader) {

      const r =
        reader.getBoundingClientRect();

      startX =
        r.left +
        r.width * .5;

      startY =
        r.top +
        r.height * .62;
    }


    const fly =
      document.createElement('span');

    fly.className =
      'magicCollectionFly';

    fly.style.left =
      `${startX}px`;

    fly.style.top =
      `${startY}px`;

    document.body.appendChild(fly);


    const endX =
      basketRect.left +
      basketRect.width * .55;

    const endY =
      basketRect.top +
      basketRect.height * .55;


    const anim =
      fly.animate(

        [
          {
            transform:
              'translate(-50%,-50%) scale(.72) rotate(-7deg)',
            opacity:0
          },

          {
            offset:.14,
            transform:
              'translate(-50%,-50%) scale(1.10) rotate(3deg)',
            opacity:1
          },

          {
            offset:.62,
            transform:
              `translate(${(endX-startX)*.62}px,${(endY-startY)*.48 - 55}px) scale(.92) rotate(10deg)`,
            opacity:1
          },

          {
            transform:
              `translate(${endX-startX}px,${endY-startY}px) scale(.32) rotate(-5deg)`,
            opacity:.15
          }
        ],

        {
          duration:880,
          easing:
            'cubic-bezier(.20,.68,.24,1)',
          fill:'forwards'
        }

      );


    anim.onfinish =
      () => {

        fly.remove();

        pulseBadge();

        basket.classList.remove('pulse');

        void basket.offsetWidth;

        basket.classList.add('pulse');
      };
  }


  if (basketCount) {

    const countObserver =
      new MutationObserver(() => {

        const current =
          Number(
            basketCount.textContent
          ) || 0;


        if (
          current >
          previousBasketCount
        ) {

          flyLetterToBasket();
        }


        previousBasketCount =
          current;

      });


    countObserver.observe(
      basketCount,
      {
        childList:true,
        characterData:true,
        subtree:true
      }
    );

  }


  /* =====================================================
     LUNA: PARTÍCULAS EXTRA AL TERCER CLIC
  ===================================================== */

  const moon =
    document.getElementById('moonHotspot');


  function moonParticleBurst() {

    if (!moon) return;

    const rect =
      moon.getBoundingClientRect();

    const cx =
      rect.left +
      rect.width*.5;

    const cy =
      rect.top +
      rect.height*.5;


    const count =
      window.innerWidth < 600
      ? 13
      : 19;


    for (
      let i=0;
      i<count;
      i++
    ) {

      const p =
        document.createElement('span');

      p.className =
        'magicMoonParticle' +
        (
          Math.random()>.55
          ? ' diamond'
          : ''
        );


      const angle =
        Math.random() *
        Math.PI *
        2;


      const distance =
        35 +
        Math.random()*78;


      p.style.left =
        `${cx}px`;

      p.style.top =
        `${cy}px`;


      p.style.setProperty(
        '--particle-x',
        `${Math.cos(angle)*distance}px`
      );

      p.style.setProperty(
        '--particle-y',
        `${Math.sin(angle)*distance}px`
      );

      p.style.setProperty(
        '--particle-life',
        `${.85 + Math.random()*.85}s`
      );

      p.style.setProperty(
        '--particle-delay',
        `${Math.random()*.15}s`
      );


      document.body.appendChild(p);


      setTimeout(
        ()=>p.remove(),
        2100
      );
    }
  }


  if (moon) {

    let wasAwakened =
      moon.classList.contains(
        'awakened'
      );


    const moonObserver =
      new MutationObserver(() => {

        const awakened =
          moon.classList.contains(
            'awakened'
          );


        if (
          awakened &&
          !wasAwakened
        ) {

          moonParticleBurst();
        }


        wasAwakened =
          awakened;

      });


    moonObserver.observe(
      moon,
      {
        attributes:true,
        attributeFilter:['class']
      }
    );

  }



  /* =====================================================
     CARTAS SECRETAS DE LOS EVENTOS AMBIENTALES

     Cada evento genera UN elemento especial:
     - lluvia de estrellas -> estrella brillante
     - neblina            -> luz cálida
     - lluvia             -> gota brillante
     - tormenta           -> tulipán que sigue en pie

     El elemento especial suelta una carta.
  ===================================================== */

  const WEATHER_STORAGE_KEY =
    'paradox143_letters_v1';

  const WEATHER_LETTERS = {

    stars:{
      id:'weather-stars',
      title:'Carta de la lluvia de estrellas',
      mark:'✦',
      hint:'✦ Hay una estrella que brilla distinto...',
      text:'cada deseo que llegue a tener lo usare para tener la posibilidad de estar cerca de ti.. cerca de la estrellita mas brillante tu..'
    },

    fog:{
      id:'weather-fog',
      title:'Carta de la neblina',
      mark:'♡',
      hint:'♡ Hay una pequeña luz cálida dentro de la neblina...',
      text:'aun en la oscuridad mas profunda pordria verte y sentirte como siempre mi calida amada'
    },

    rain:{
      id:'weather-rain',
      title:'Carta de la lluvia',
      mark:'◇',
      hint:'◇ Una gota brilla diferente a todas las demás...',
      text:'sea cual sea el clima te acopañare frio o calor me es igual si es a tu lado..'
    },

    storm:{
      id:'weather-storm',
      title:'Carta de la tormenta',
      mark:'⚡',
      hint:'⚡ Entre la tormenta, un tulipán todavía sigue en pie...',
      text:'aunque todo fuera mal yo volveria contigo una y otra vez para volver a intentarlo porque un momento contigo vale mas que una historia completa con cualquiera...'
    },

    snow:{
      id:'weather-snow',
      title:'Carta de la nieve',
      mark:'❄',
      hint:'❄ Un copo de nieve brilla distinto entre todos...',
      text:'aunque el frio llegue a mi cuerpo la luz y el calor que me das nunca se paagaran.. mi pequeña'
    }

  };


  let activeSpecialType=null;
  let activeSpecialTarget=null;
  let activeSpecialLetter=null;
  let activeSpecialResolved=true;

  /*
    Timers controlados para impedir que un objeto secreto
    de un clima anterior aparezca después de cambiar el fondo.
  */
  let specialSpawnTimer=0;
  let specialCleanupTimer=0;


  const specialLayer =
    document.createElement(
      'div'
    );

  specialLayer.id =
    'magicSpecialLayer';

  layer.appendChild(
    specialLayer
  );


  const specialHint =
    document.createElement(
      'div'
    );

  specialHint.id =
    'magicSpecialHint';

  document.body.appendChild(
    specialHint
  );


  function readWeatherSaved(){

    try{

      const raw =
        localStorage.getItem(
          WEATHER_STORAGE_KEY
        );

      const arr =
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


  function writeWeatherSaved(
    arr
  ){

    try{

      localStorage.setItem(
        WEATHER_STORAGE_KEY,
        JSON.stringify(
          [...new Set(arr)]
        )
      );

    }
    catch(_){}
  }


  function hasWeatherLetter(
    type
  ){

    const data =
      WEATHER_LETTERS[type];

    if(!data){
      return false;
    }

    return readWeatherSaved()
      .includes(
        data.id
      );
  }


  function syncWeatherBasketCount(){

    const count =
      document.getElementById(
        'basketCount'
      );

    if(!count){
      return;
    }

    count.textContent =
      String(
        new Set(
          readWeatherSaved()
        ).size
      );
  }


  function showSpecialHint(
    text
  ){

    specialHint.textContent =
      text;

    specialHint.classList.remove(
      'show'
    );

    void specialHint.offsetWidth;

    specialHint.classList.add(
      'show'
    );

    clearTimeout(
      showSpecialHint.timer
    );

    showSpecialHint.timer =
      setTimeout(
        ()=>{
          specialHint.classList.remove(
            'show'
          );
        },
        4300
      );
  }


  function openWeatherLetter(
    type
  ){

    const data =
      WEATHER_LETTERS[type];

    if(!data){
      return;
    }


    const reader =
      document.getElementById(
        'letterReader'
      );

    const mark =
      document.getElementById(
        'readerMark'
      );

    const title =
      document.getElementById(
        'readerTitle'
      );

    const text =
      document.getElementById(
        'readerText'
      );

    const keep =
      document.getElementById(
        'readerKeep'
      );


    if(
      reader &&
      mark &&
      title &&
      text
    ){

      mark.textContent =
        data.mark;

      title.textContent =
        data.title;

      text.textContent =
        data.text;

      if(keep){
        keep.style.display =
          'none';
      }

      reader.classList.add(
        'show'
      );

    }
    else{

      alert(
        data.text
      );
    }


    const saved =
      readWeatherSaved();

    if(
      !saved.includes(
        data.id
      )
    ){

      saved.push(
        data.id
      );

      writeWeatherSaved(
        saved
      );

      syncWeatherBasketCount();

      const basket =
        document.getElementById(
          'letterBasketBtn'
        );

      if(basket){

        basket.classList.remove(
          'pulse'
        );

        void basket.offsetWidth;

        basket.classList.add(
          'pulse'
        );
      }
    }


    clearTimeout(
      specialCleanupTimer
    );

    specialCleanupTimer=0;

    activeSpecialResolved=true;
    activeSpecialType=null;
    window.MAGIC_SPECIAL_PENDING=false;

    injectWeatherLettersIntoBasket();
  }


  function injectWeatherLettersIntoBasket(){

    const list =
      document.getElementById(
        'basketLetters'
      );

    if(!list){
      return;
    }


    /*
      letters.js reconstruye la lista.
      Quitamos nuestras entradas antiguas
      antes de volver a insertarlas.
    */

    list
      .querySelectorAll(
        '.basketLetterItem[data-weather-letter]'
      )
      .forEach(
        item=>item.remove()
      );


    const saved =
      readWeatherSaved();


    for(
      const [
        type,
        data
      ]
      of Object.entries(
        WEATHER_LETTERS
      )
    ){

      if(
        !saved.includes(
          data.id
        )
      ){
        continue;
      }


      const empty =
        list.querySelector(
          '.basketEmpty'
        );

      if(empty){
        empty.remove();
      }


      const item =
        document.createElement(
          'button'
        );

      item.className =
        'basketLetterItem';

      item.type =
        'button';

      item.dataset.weatherLetter =
        type;


      item.innerHTML =
        `
          <span class="basketLetterMark">${data.mark}</span>
          <span>
            <strong>${data.title}</strong>
            <small>Toca para volver a leerla</small>
          </span>
        `;


      item.addEventListener(
        'click',
        ()=>{

          const overlay =
            document.getElementById(
              'basketOverlay'
            );

          if(overlay){
            overlay.classList.remove(
              'show'
            );
          }

          openWeatherLetter(
            type
          );
        }
      );


      list.appendChild(
        item
      );
    }


    syncWeatherBasketCount();
  }


  const weatherBasket =
    document.getElementById(
      'letterBasketBtn'
    );


  if(weatherBasket){

    weatherBasket.addEventListener(
      'click',
      ()=>{

        setTimeout(
          ()=>{
            injectWeatherLettersIntoBasket();
            syncWeatherBasketCount();
          },
          0
        );

      }
    );
  }


  function removeActiveSpecial(){

    if(activeSpecialTarget){

      activeSpecialTarget.remove();

      activeSpecialTarget=null;
    }
  }


  function clearPendingWeatherSecret(){

    clearTimeout(
      specialSpawnTimer
    );

    clearTimeout(
      specialCleanupTimer
    );

    specialSpawnTimer=0;
    specialCleanupTimer=0;

    removeActiveSpecial();

    if(activeSpecialLetter){

      activeSpecialLetter.remove();

      activeSpecialLetter=null;
    }

    specialHint.classList.remove(
      'show'
    );

    activeSpecialResolved=true;
    activeSpecialType=null;

    window.MAGIC_SPECIAL_PENDING=false;
  }


  function makeEventLetter(
    type,
    startX,
    startY
  ){

    const data =
      WEATHER_LETTERS[type];

    if(!data){
      return;
    }


    if(activeSpecialLetter){

      activeSpecialLetter.remove();
    }


    const letter =
      document.createElement(
        'button'
      );

    letter.className =
      'weatherEventLetter';

    letter.type =
      'button';

    letter.setAttribute(
      'aria-label',
      data.title
    );


    letter.innerHTML =
      `
        <span class="weatherEnvelope"></span>
        <span class="weatherEnvelopeSeal">${data.mark}</span>
        <span class="weatherEnvelopeSpark">✦</span>
      `;


    const landingX =
      Math.max(
        72,
        Math.min(
          window.innerWidth-72,
          startX +
          (
            Math.random()-.5
          )*120
        )
      );


    const landingY =
      Math.max(
        window.innerHeight*.61,
        Math.min(
          window.innerHeight*.79,
          startY +
          130
        )
      );


    letter.style.left =
      `${startX}px`;

    letter.style.top =
      `${startY}px`;

    letter.style.setProperty(
      '--eventLetterX',
      `${landingX-startX}px`
    );

    letter.style.setProperty(
      '--eventLetterY',
      `${landingY-startY}px`
    );


    specialLayer.appendChild(
      letter
    );


    activeSpecialLetter =
      letter;


    requestAnimationFrame(
      ()=>{

        letter.classList.add(
          'drop'
        );
      }
    );


    setTimeout(
      ()=>{

        letter.classList.add(
          'ready'
        );

        showSpecialHint(
          '💌 Cayó una cartita...'
        );

      },
      1050
    );


    letter.addEventListener(
      'click',
      ()=>{

        if(
          !letter.classList.contains(
            'ready'
          )
        ){
          return;
        }


        letter.remove();

        activeSpecialLetter=null;

        openWeatherLetter(
          type
        );
      }
    );

  }


  function activateSpecialTarget(
    type
  ){

    const data =
      WEATHER_LETTERS[type];

    if(!data){
      return;
    }


    /*
      La carta del clima vuelve a aparecer SIEMPRE
      que este evento ocurra, aunque ya esté guardada.

      Esto le da presencia a cada repetición del evento.
      La canasta sigue evitando duplicados.
    */


    removeActiveSpecial();


    activeSpecialResolved=false;
    activeSpecialType=type;
    window.MAGIC_SPECIAL_PENDING=true;


    const target =
      document.createElement(
        'button'
      );

    target.type =
      'button';

    target.className =
      `weatherSpecial weatherSpecial-${type}`;

    target.setAttribute(
      'aria-label',
      data.hint
    );


    if(
      type === 'stars'
    ){

      target.innerHTML =
        '<span class="specialStarCore">✦</span>';

      target.style.left =
        `${18 + Math.random()*64}%`;

      target.style.top =
        `${10 + Math.random()*20}%`;
    }


    else if(
      type === 'fog'
    ){

      target.innerHTML =
        '<span class="specialFogCore">♡</span>';

      target.style.left =
        `${18 + Math.random()*64}%`;

      target.style.top =
        `${42 + Math.random()*18}%`;
    }


    else if(
      type === 'rain'
    ){

      target.innerHTML =
        '<span class="specialRainCore"></span>';

      target.style.left =
        `${16 + Math.random()*68}%`;

      target.style.top =
        `${36 + Math.random()*22}%`;
    }


    else if(
      type === 'storm'
    ){

      target.innerHTML =
        `
          <span class="specialStormTulip"></span>
          <span class="specialStormBolt">⚡</span>
        `;

      target.style.left =
        `${18 + Math.random()*64}%`;

      target.style.top =
        `${63 + Math.random()*12}%`;
    }

    else if(
      type === 'snow'
    ){

      target.innerHTML =
        '<span class="specialSnowCore">❄</span>';

      target.style.left =
        `${18 + Math.random()*64}%`;

      target.style.top =
        `${18 + Math.random()*24}%`;
    }


    specialLayer.appendChild(
      target
    );


    activeSpecialTarget =
      target;


    showSpecialHint(
      data.hint
    );


    target.addEventListener(
      'click',
      e=>{

        e.preventDefault();
        e.stopPropagation();


        const rect =
          target.getBoundingClientRect();


        const x =
          rect.left +
          rect.width*.5;

        const y =
          rect.top +
          rect.height*.5;


        target.classList.add(
          'found'
        );


        setTimeout(
          ()=>{

            target.remove();

            if(
              activeSpecialTarget ===
              target
            ){
              activeSpecialTarget=null;
            }


            makeEventLetter(
              type,
              x,
              y
            );

          },
          400
        );

      }
    );

  }


  function spawnSpecialForEvent(
    type
  ){

    const delay =

      type === 'storm'
      ? 5600

      : (
          type === 'stars'
          ? 2800
          : type === 'snow'
          ? 4200
          : 3900
        );


    clearTimeout(
      specialSpawnTimer
    );


    specialSpawnTimer=
      setTimeout(
        ()=>{

          /*
            Si el usuario cambió de clima manualmente,
            el secreto viejo ya no debe aparecer.
          */
          if(
            activeEvent!==type ||
            manualClimateMode
          ){
            return;
          }

          activateSpecialTarget(
            type
          );

        },
        delay
      );
  }



  /* =====================================================
     CAMBIO GLOBAL DE ATMÓSFERA
  ===================================================== */

  function setWeatherAtmosphere(
    type,
    enabled=true
  ){

    document.body.classList.remove(
      'weather-stars',
      'weather-fog',
      'weather-rain',
      'weather-storm',
      'weather-snow'
    );


    if(enabled && type){

      document.body.classList.add(
        `weather-${type}`
      );
    }


    /*
      El Canvas principal usa este valor para
      mover los tulipanes con viento real.
    */

    if(!enabled){

      window.MAGIC_WIND_INTENSITY=0;

      return;
    }


    window.MAGIC_WIND_INTENSITY =

      type==='storm'
      ? 1.65

      : type==='rain'
      ? .72

      : type==='fog'
      ? .18

      : type==='snow'
      ? .26

      : .08;
  }


  function makeLightningBolt(){

    if(!lightningBolt){
      return;
    }


    const startX =
      26 +
      Math.random()*48;


    let x=startX;
    let y=0;

    const points=[
      `${x.toFixed(1)},${y}`
    ];


    for(
      let i=1;
      i<=8;
      i++
    ){

      y=
        i*12.5;

      x +=
        -8+
        Math.random()*16;

      points.push(
        `${x.toFixed(1)},${y.toFixed(1)}`
      );
    }


    lightningBolt.innerHTML =
      `
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <polyline
            class="lightningOuter"
            points="${points.join(' ')}"
          ></polyline>

          <polyline
            class="lightningInner"
            points="${points.join(' ')}"
          ></polyline>
        </svg>
      `;


    lightningBolt.classList.remove(
      'flash'
    );

    void lightningBolt.offsetWidth;

    lightningBolt.classList.add(
      'flash'
    );
  }


  let stormPetalTimer=0;
  let snowflakes=[];


  function stormPetalBurst(){

    if(
      activeEvent!=='storm'
    ){
      return;
    }


    const amount=
      window.innerWidth<600
      ? 13
      : 22;


    for(
      let i=0;
      i<amount;
      i++
    ){

      const petal=
        document.createElement(
          'span'
        );

      petal.className=
        'magicStormPetal';

      petal.style.left=
        `${100+Math.random()*15}%`;

      petal.style.top=
        `${20+Math.random()*68}%`;

      petal.style.setProperty(
        '--storm-petal-x',
        `${-(120+Math.random()*50)}vw`
      );

      petal.style.setProperty(
        '--storm-petal-y',
        `${-40+Math.random()*100}px`
      );

      petal.style.setProperty(
        '--storm-petal-time',
        `${1.8+Math.random()*1.9}s`
      );

      layer.appendChild(
        petal
      );


      setTimeout(
        ()=>petal.remove(),
        4300
      );
    }
  }


  function startStormPetals(){

    clearInterval(
      stormPetalTimer
    );


    stormPetalBurst();


    stormPetalTimer=
      setInterval(
        stormPetalBurst,
        2700
      );
  }


  function stopStormPetals(){

    clearInterval(
      stormPetalTimer
    );

    stormPetalTimer=0;


    layer
      .querySelectorAll(
        '.magicStormPetal'
      )
      .forEach(
        p=>p.remove()
      );
  }


  /* =====================================================
     WEATHER CANVAS
  ===================================================== */

  const weatherCtx =
    weatherCanvas.getContext(
      '2d',
      {
        alpha:true,
        desynchronized:true
      }
    );


  let weatherDpr=1;
  let weatherW=1;
  let weatherH=1;

  let weatherRAF=0;
  let drops=[];
  let splashes=[];

  let activeEvent=null;
  let eventEndingTimer=0;

  let lightningTimers=[];


  function resizeWeather() {

    weatherW =
      Math.max(
        1,
        window.innerWidth
      );

    weatherH =
      Math.max(
        1,
        window.innerHeight
      );


    /*
      El campo está rindiendo bien, así que podemos
      renderizar lluvia y destellos con mayor nitidez.
    */
    weatherDpr =
      Math.min(
        window.devicePixelRatio || 1,
        window.innerWidth < 600
          ? 1.50
          : 1.75
      );


    weatherCanvas.width =
      Math.round(
        weatherW *
        weatherDpr
      );

    weatherCanvas.height =
      Math.round(
        weatherH *
        weatherDpr
      );


    weatherCanvas.style.width =
      `${weatherW}px`;

    weatherCanvas.style.height =
      `${weatherH}px`;


    weatherCtx.setTransform(
      weatherDpr,
      0,
      0,
      weatherDpr,
      0,
      0
    );
  }

  resizeWeather();


  /* =====================================================
     LLUVIA
  ===================================================== */

  function createRain(
    heavy=false
  ) {

    drops=[];


    const mobile =
      window.innerWidth < 600;


    const count =
      heavy

      ? (
          mobile
          ? 320
          : 520
        )

      : (
          mobile
          ? 145
          : 245
        );


    for (
      let i=0;
      i<count;
      i++
    ) {

      drops.push({

        x:
          Math.random() *
          (
            weatherW + 120
          ),

        y:
          Math.random() *
          weatherH,

        len:
          heavy
          ? 20 + Math.random()*22
          : 8 + Math.random()*12,

        speed:
          heavy
          ? 23 + Math.random()*17
          : 10 + Math.random()*9,

        drift:
          heavy
          ? -8.6
          : -3.4,

        alpha:
          heavy
          ? .34 + Math.random()*.55
          : .17 + Math.random()*.36,

        width:
          heavy
          ? .75 + Math.random()*1.35
          : .45 + Math.random()*.90,

        depth:
          .45 + Math.random()*.80

      });
    }
  }


  function drawRain() {

    weatherCtx.clearRect(
      0,
      0,
      weatherW,
      weatherH
    );


    const storm =
      activeEvent === 'storm';


    /*
      Lluvia en varias profundidades:
      las gotas más cercanas son más grandes,
      rápidas y luminosas.
    */

    for (
      const d
      of drops
    ) {

      weatherCtx.lineWidth =
        d.width *
        (
          storm
          ? 1.12
          : 1
        );


      const brightness =
        Math.min(
          .95,
          d.alpha *
          d.depth
        );


      weatherCtx.strokeStyle =
        storm

        ? `rgba(197,222,241,${brightness})`

        : `rgba(176,211,233,${brightness})`;


      weatherCtx.beginPath();

      weatherCtx.moveTo(
        d.x,
        d.y
      );

      weatherCtx.lineTo(
        d.x +
        d.drift *
        d.depth,
        d.y +
        d.len *
        d.depth
      );

      weatherCtx.stroke();


      d.x +=
        d.drift *
        .32 *
        d.depth;

      d.y +=
        d.speed *
        d.depth;


      if (
        d.y >
        weatherH + 32
      ) {

        /*
          Algunas gotas cercanas generan pequeñas
          salpicaduras sobre la parte baja del campo.
        */

        if (
          d.depth > .85 &&
          Math.random() <
          (
            storm
            ? .30
            : .16
          )
        ) {

          splashes.push({

            x:
              Math.max(
                0,
                Math.min(
                  weatherW,
                  d.x
                )
              ),

            y:
              weatherH *
              (
                .78 +
                Math.random()*.18
              ),

            life:1,

            size:
              (
                storm
                ? 6
                : 4
              )
              +
              Math.random()*7

          });


          if (
            splashes.length >
            (
              storm
              ? 100
              : 55
            )
          ) {

            splashes.shift();
          }
        }


        d.y =
          -40 -
          Math.random()*80;

        d.x =
          Math.random() *
          (
            weatherW + 160
          );
      }


      if (
        d.x < -120
      ) {

        d.x =
          weatherW + 80;
      }

    }


    /*
      Reflejos/salpicaduras húmedas en el pasto.
    */

    for (
      let i=
        splashes.length-1;
      i>=0;
      i--
    ) {

      const s=
        splashes[i];


      weatherCtx.strokeStyle =
        `rgba(205,231,241,${s.life*.34})`;

      weatherCtx.lineWidth =
        Math.max(
          .6,
          s.life*1.25
        );


      weatherCtx.beginPath();

      weatherCtx.ellipse(
        s.x,
        s.y,
        s.size*
        (
          1.4-
          s.life*.35
        ),
        Math.max(
          1,
          s.size*.24
        ),
        0,
        0,
        Math.PI*2
      );

      weatherCtx.stroke();


      s.life -=
        storm
        ? .038
        : .046;


      if (
        s.life <= 0
      ) {

        splashes.splice(
          i,
          1
        );
      }
    }


    weatherRAF =
      requestAnimationFrame(
        drawRain
      );
  }


  function startRain(
    heavy=false
  ) {

    createRain(
      heavy
    );


    weatherCanvas.classList.add(
      'show'
    );


    cancelAnimationFrame(
      weatherRAF
    );


    drawRain();
  }



function buildSnowflakes(){

  snowflakes=[];

  const amount=
    window.innerWidth<600
    ? 90
    : 150;

  for(let i=0;i<amount;i++){
    snowflakes.push({
      x:Math.random()*weatherW,
      y:Math.random()*weatherH,
      r:.8+Math.random()*2.6,
      speed:.4+Math.random()*1.25,
      drift:-.45+Math.random()*.9,
      alpha:.35+Math.random()*.55,
      sway:Math.random()*Math.PI*2
    });
  }
}

function drawSnow(){

  weatherCtx.clearRect(0,0,weatherW,weatherH);

  for(const f of snowflakes){
    weatherCtx.globalAlpha=f.alpha;
    weatherCtx.fillStyle='rgba(246,250,255,1)';
    weatherCtx.beginPath();
    weatherCtx.arc(f.x,f.y,f.r,0,Math.PI*2);
    weatherCtx.fill();

    weatherCtx.globalAlpha=f.alpha*.18;
    weatherCtx.beginPath();
    weatherCtx.arc(f.x,f.y,f.r*2.5,0,Math.PI*2);
    weatherCtx.fill();

    f.x += f.drift + Math.sin(performance.now()*.0011+f.sway)*.18;
    f.y += f.speed;

    if(f.y>weatherH+12){
      f.y=-10;
      f.x=Math.random()*weatherW;
    }
    if(f.x<-12) f.x=weatherW+8;
    if(f.x>weatherW+12) f.x=-8;
  }

  weatherCtx.globalAlpha=1;
  weatherRAF=requestAnimationFrame(drawSnow);
}

function startSnow(){
  stopRain();
  buildSnowflakes();
  weatherCanvas.classList.add('show');
  cancelAnimationFrame(weatherRAF);
  drawSnow();
}

function stopSnow(){
  snowflakes=[];
  weatherCanvas.classList.remove('show');
  cancelAnimationFrame(weatherRAF);
  weatherRAF=0;
  weatherCtx.clearRect(0,0,weatherW,weatherH);
}

function stopRain() {

    splashes=[];

    weatherCanvas.classList.remove(
      'show'
    );


    cancelAnimationFrame(
      weatherRAF
    );


    weatherRAF=0;


    setTimeout(
      ()=>{

        weatherCtx.clearRect(
          0,
          0,
          weatherW,
          weatherH
        );

      },
      700
    );
  }


  /* =====================================================
     LLUVIA DE ESTRELLAS
  ===================================================== */

  function shootingStarEvent() {

    const amount =
      window.innerWidth < 600
      ? 14
      : 24;


    for (
      let i=0;
      i<amount;
      i++
    ) {

      const s =
        document.createElement(
          'span'
        );

      s.className =
        'magicShootingStar';


      s.style.left =
        `${-5 + Math.random()*74}%`;

      s.style.top =
        `${2 + Math.random()*28}%`;


      s.style.setProperty(
        '--shoot-x',
        `${240 + Math.random()*360}px`
      );

      s.style.setProperty(
        '--shoot-y',
        `${135 + Math.random()*230}px`
      );

      s.style.setProperty(
        '--shoot-time',
        `${.85 + Math.random()*.95}s`
      );

      s.style.setProperty(
        '--shoot-delay',
        `${Math.random()*3.7}s`
      );

      s.style.setProperty(
        '--tail',
        `${85 + Math.random()*150}px`
      );


      layer.appendChild(s);


      setTimeout(
        ()=>s.remove(),
        5900
      );
    }

  }


  /* =====================================================
     NEBLINA
  ===================================================== */

  function startFog() {

    fog.classList.add(
      'show'
    );
  }


  function stopFog() {

    fog.classList.remove(
      'show'
    );
  }


  /* =====================================================
     TORMENTA — EVENTO FINAL ESPECIAL
  ===================================================== */

  function clearLightningTimers() {

    for (
      const t
      of lightningTimers
    ) {

      clearTimeout(t);
    }


    lightningTimers=[];
  }


  function makeLightning() {

    lightning.classList.remove(
      'flash'
    );

    void lightning.offsetWidth;

    lightning.classList.add(
      'flash'
    );

    makeLightningBolt();


    /*
      Cada relámpago hace más fuerte
      el daño temporal en los tulipanes.
    */

    if(
      window.MAGIC_STORM_ACTIVE
    ){

      window.MAGIC_STORM_DAMAGE =
        Math.min(
          .48,
          (
            window.MAGIC_STORM_DAMAGE
            || .12
          )
          +
          .055
        );


      try{

        fieldApp.animate(

          [
            {transform:'translateX(0)'},
            {transform:'translateX(-3px)'},
            {transform:'translateX(3px)'},
            {transform:'translateX(-2px)'},
            {transform:'translateX(0)'}
          ],

          {
            duration:330,
            easing:'steps(5,end)'
          }

        );

      }
      catch(_){}
    }
  }


  function scheduleLightning() {

    clearLightningTimers();


    const times =
      [
         900 + Math.random()*500,
        3200 + Math.random()*650,
        6800 + Math.random()*700,
       10800 + Math.random()*750,
       15400 + Math.random()*850,
       20500 + Math.random()*900,
       25700 + Math.random()*850,
       31100 + Math.random()*900,
       36000 + Math.random()*700,
       41400 + Math.random()*850,
       46800 + Math.random()*850,
       52300 + Math.random()*900,
       56800 + Math.random()*650
      ];


    for (
      const time
      of times
    ) {

      lightningTimers.push(

        setTimeout(
          makeLightning,
          time
        )

      );
    }

  }


  /* =====================================================
     CONTROL DE EVENTOS
  ===================================================== */

  function buildEventSequence(){

    const soft=[
      'stars',
      'fog',
      'rain',
      'snow'
    ];


    for(
      let i=soft.length-1;
      i>0;
      i--
    ){

      const j=
        Math.floor(
          Math.random()*
          (i+1)
        );

      [
        soft[i],
        soft[j]
      ]=[
        soft[j],
        soft[i]
      ];
    }


    /*
      En cada ciclo los cuatro eventos suaves
      salen en orden aleatorio y la tormenta
      vuelve a ser el cierre especial.
    */

    return [
      ...soft,
      'storm'
    ];
  }


  let eventSequence=
    buildEventSequence();


  let eventIndex=0;

  let exploration=0;

  let nextExplorationGoal =
    1500 +
    Math.random()*1100;

  let lastEventAt=0;

  /*
    Cuando se elige un clima desde el botón ☁,
    queda como fondo persistente hasta elegir otro
    o volver a Campo normal.
  */
  let manualClimateMode=false;
  let manualWeatherLoop=0;


  function busyScene() {

    if (
      document.body.classList.contains(
        'intro-active'
      )
    ) {
      return true;
    }


    const game =
      document.getElementById(
        'gameOverlay'
      );


    if (
      game &&
      game.classList.contains(
        'show'
      )
    ) {
      return true;
    }


    const reader =
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


    /*
      No lanzar clima nuevo justo
      mientras Mewo está siendo atrapada.
    */

    const mewo =
      document.getElementById(
        'mewoCat'
      );


    if (
      mewo &&
      mewo.classList.contains(
        'show'
      ) &&
      !mewo.classList.contains(
        'leaving'
      )
    ) {
      return true;
    }


    return false;
  }


  function startAmbientEvent(
    type,
    options={}
  ) {

    const manual=
      Boolean(
        options &&
        options.manual
      );


    if (
      activeEvent ||
      busyScene() ||
      document.hidden
    ) {

      return false;
    }


    activeEvent=
      type;

    manualClimateMode=
      manual;

    window.MAGIC_MANUAL_CLIMATE_ACTIVE=
      manual;

    window.MAGIC_AMBIENT_ACTIVE=
      type;


    /*
      Los climas elegidos manualmente sirven como
      fondo y no aumentan la estadística de eventos
      espontáneos.
    */
    if(!manual){

      paradoxStats.inc(
        `weather_${type}`
      );

      lastEventAt=
        Date.now();
    }


    setWeatherAtmosphere(
      type,
      true
    );


    /*
      Música propia del evento.
      Si el MP3 todavía no está subido,
      se mantiene la música normal.
    */

    paradoxAudio.playSpecial(
      EVENT_MUSIC[type],

      type==='storm'
        ? .50
        : (
            type==='rain'
            ? .48
            : .46
          ),

      {
        owner:`weather-${type}`,
        trackId:type,
        label:
          type==='stars'
          ? 'Lluvia de estrellas'
          : type==='fog'
          ? 'Neblina'
          : type==='rain'
          ? 'Lluvia'
          : type==='snow'
          ? 'Nevada'
          : 'Tormenta'
      }
    );


    clearTimeout(
      eventEndingTimer
    );


    let duration=6000;


    if (
      type === 'stars'
    ) {

      shootingStarEvent();

      /*
        Cinco oleadas separadas.
        La música y la atmósfera tienen tiempo
        suficiente para sentirse como un evento real.
      */

      [
        6500,
        13000,
        19500,
        26000
      ].forEach(
        delay=>{
          setTimeout(
            ()=>{
              if(activeEvent==='stars'){
                shootingStarEvent();
              }
            },
            delay
          );
        }
      );

      duration=33000;
    }


    else if (
      type === 'fog'
    ) {

      startFog();

      duration=43000;
    }


    else if (
      type === 'rain'
    ) {

      startRain(false);

      duration=46000;
    }


    else if (
      type === 'storm'
    ) {

      /*
        TORMENTA FUERTE:
        viento + lluvia intensa + rayos +
        algunos tulipanes son derribados.
      */

      window.MAGIC_STORM_ACTIVE=true;
      window.MAGIC_STORM_INTENSITY=1.70;
      window.MAGIC_STORM_DAMAGE=.15;


      stormShade.classList.add(
        'show'
      );

      startFog();

      startRain(true);

      scheduleLightning();

      startStormPetals();

      duration=60000;
    }

    else if (
      type === 'snow'
    ) {

      startSnow();

      duration=42000;
    }


    clearInterval(
      manualWeatherLoop
    );

    manualWeatherLoop=0;


    if(manual){

      /*
        Lluvia, nieve y neblina ya son continuas.
        Estrellas y tormenta necesitan renovar
        sus animaciones largas mientras se usan
        como fondo persistente.
      */
      if(type==='stars'){

        manualWeatherLoop=
          setInterval(
            ()=>{

              if(
                manualClimateMode &&
                activeEvent==='stars'
              ){
                shootingStarEvent();
              }

            },
            7200
          );
      }


      else if(type==='storm'){

        manualWeatherLoop=
          setInterval(
            ()=>{

              if(
                manualClimateMode &&
                activeEvent==='storm'
              ){
                scheduleLightning();
              }

            },
            59000
          );
      }
    }


    /*
      SOLO los eventos naturales esconden cartas.
      El selector ☁ cambia el fondo sin generar
      cartas repetidamente.
    */
    if(!manual){

      spawnSpecialForEvent(
        type
      );
    }


    if(!manual){

      eventEndingTimer =
        setTimeout(

          ()=>{
            endAmbientEvent(type);
          },

          duration

        );
    }


    return true;
  }


  function endAmbientEvent(
    type
  ) {

    clearInterval(
      manualWeatherLoop
    );

    manualWeatherLoop=0;


    if (
      type === 'fog'
    ) {

      stopFog();
    }


    if (
      type === 'rain'
    ) {

      stopRain();
    }


    if (
      type === 'snow'
    ) {

      stopSnow();
    }


    if (
      type === 'storm'
    ) {

      clearLightningTimers();

      lightning.classList.remove(
        'flash'
      );

      stormShade.classList.remove(
        'show'
      );

      stopFog();

      stopRain();

      stopSnow();

      stopStormPetals();


      /*
        El campo se recupera después
        de la tormenta.
      */

      window.MAGIC_STORM_ACTIVE=false;
      window.MAGIC_STORM_INTENSITY=0;

      setTimeout(
        ()=>{
          window.MAGIC_STORM_DAMAGE=0;
        },
        1500
      );
    }


    activeEvent=null;
    window.MAGIC_AMBIENT_ACTIVE=null;

    const wasManual=
      manualClimateMode;

    manualClimateMode=false;
    window.MAGIC_MANUAL_CLIMATE_ACTIVE=false;

    setWeatherAtmosphere(
      null,
      false
    );

    paradoxAudio.restoreNormal(
      `weather-${type}`
    );


    /*
      Si quedó una carta/objetivo sin tocar,
      damos unos segundos extra y después lo
      retiramos. Así nunca bloquea para siempre
      los siguientes eventos.
    */
    if(
      !wasManual &&
      !activeSpecialResolved &&
      activeSpecialType===type
    ){

      clearTimeout(
        specialCleanupTimer
      );

      specialCleanupTimer=
        setTimeout(
          ()=>{

            if(
              !activeSpecialResolved &&
              activeSpecialType===type
            ){
              clearPendingWeatherSecret();
            }

          },
          14000
        );
    }


    /*
      El tiempo entre eventos vuelve a contarse
      desde que terminó el clima, no desde que empezó.
    */
    lastEventAt=
      Date.now();

    exploration=0;

    nextExplorationGoal =
      1600 +
      Math.random()*1200;


    if (
      eventIndex <
      eventSequence.length
    ) {

      /*
        eventIndex ya fue avanzado
        al empezar el evento.
      */
    }
  }


  function tryNextEvent() {

    /*
      Si apareció un objeto secreto de un evento
      y aún no abrió su cartita, el siguiente evento
      espera. Así cada clima tiene su pequeño juego.
    */

    if(
      !activeSpecialResolved
    ){

      showSpecialHint(
        'Todavía hay algo especial por encontrar...'
      );

      return false;
    }


    if (
      eventIndex >=
      eventSequence.length
    ) {

      /*
        Nuevo ciclo completo:
        estrellas, neblina, lluvia y
        nuevamente tormenta.
      */

      eventSequence=
        buildEventSequence();

      eventIndex=0;
    }


    const type =
      eventSequence[
        eventIndex
      ];


    if (
      startAmbientEvent(
        type
      )
    ) {

      eventIndex++;

      return true;
    }


    return false;
  }


  /* =====================================================
     ARRASTRAR = EXPLORAR
  ===================================================== */

  let exploring=false;
  let lastPointerX=0;


  fieldApp.addEventListener(

    'pointerdown',

    e=>{

      exploring=true;

      lastPointerX=
        e.clientX;

    },

    {
      passive:true
    }

  );


  fieldApp.addEventListener(

    'pointermove',

    e=>{

      if (
        !exploring
      ) {
        return;
      }


      const dx =
        Math.abs(
          e.clientX -
          lastPointerX
        );


      lastPointerX =
        e.clientX;


      /*
        El campo se sigue moviendo por
        main.js. Aquí SOLO contamos cuánto
        se ha explorado.
      */

      exploration +=
        Math.min(
          80,
          dx
        );


      if (
        exploration >=
        nextExplorationGoal
      ) {

        /*
          Cooldown para que no aparezcan
          eventos uno detrás de otro.
        */

        if (
          Date.now() -
          lastEventAt >
          38000
        ) {

          if (
            tryNextEvent()
          ) {

            exploration=0;
          }
        }
      }

    },

    {
      passive:true
    }

  );


  function stopExploring() {

    exploring=false;
  }


  fieldApp.addEventListener(
    'pointerup',
    stopExploring,
    {
      passive:true
    }
  );


  fieldApp.addEventListener(
    'pointercancel',
    stopExploring,
    {
      passive:true
    }
  );


  /* =====================================================
     SI SOLO MIRA EL CAMPO

     También puede aparecer magia sin arrastrar,
     pero con mucha menos frecuencia.
  ===================================================== */

  const passiveCheck =
    setInterval(

      ()=>{

        if (
          activeEvent ||
          busyScene() ||
          document.hidden
        ) {
          return;
        }


        const elapsed =
          Date.now() -
          lastEventAt;


        /*
          Si llevan bastante tiempo sin evento,
          hay una probabilidad suave.
        */

        if (
          elapsed >
          72000 &&
          Math.random() <
          .32
        ) {

          tryNextEvent();
        }

      },

      8000

    );


  /* =====================================================
     RESIZE
  ===================================================== */

  let resizeTimer=0;


  window.addEventListener(

    'resize',

    ()=>{

      clearTimeout(
        resizeTimer
      );


      resizeTimer =
        setTimeout(

          ()=>{

            resizeWeather();

            buildTwinkles();

          },

          160

        );

    }

  );


  window.addEventListener(

    'orientationchange',

    ()=>{

      setTimeout(

        ()=>{

          resizeWeather();

          buildTwinkles();

        },

        300

      );

    }

  );



  /* =====================================================
     API PÚBLICA DEL CLIMA
     El selector ☁ está en otro módulo/IIFE. Antes intentaba
     usar variables privadas de este módulo y el clic fallaba.
  ===================================================== */

  function manualClimateSceneBusy(){

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


    const mewo=
      document.getElementById(
        'mewoCat'
      );

    if(
      mewo &&
      mewo.classList.contains(
        'show'
      ) &&
      !mewo.classList.contains(
        'leaving'
      )
    ){
      return true;
    }


    return false;
  }


  window.ParadoxWeather={

    getState(){

      return {
        type:activeEvent || null,
        manual:Boolean(manualClimateMode),
        specialPending:Boolean(
          window.MAGIC_SPECIAL_PENDING
        )
      };
    },


    canChange(){

      return !manualClimateSceneBusy();
    },


    normal(){

      if(manualClimateSceneBusy()){
        return false;
      }


      clearPendingWeatherSecret();

      clearTimeout(
        eventEndingTimer
      );


      if(activeEvent){

        const old=
          activeEvent;

        endAmbientEvent(
          old
        );
      }


      manualClimateMode=false;
      window.MAGIC_MANUAL_CLIMATE_ACTIVE=false;

      showSpecialHint(
        '☾ Campo normal'
      );

      return true;
    },


    setManual(type){

      if(
        !EVENT_MUSIC[type] ||
        manualClimateSceneBusy()
      ){
        return false;
      }


      clearPendingWeatherSecret();

      clearTimeout(
        eventEndingTimer
      );


      if(activeEvent){

        const old=
          activeEvent;

        endAmbientEvent(
          old
        );
      }


      setTimeout(
        ()=>{

          const started=
            startAmbientEvent(
              type,
              {manual:true}
            );


          if(started){

            window.MAGIC_MANUAL_CLIMATE_ACTIVE=true;

            const label=
              type==='stars'
              ? '✦ Estrellas fijo'
              : type==='fog'
              ? '◌ Neblina fija'
              : type==='rain'
              ? '◇ Lluvia fija'
              : type==='snow'
              ? '❄ Nevada fija'
              : '⚡ Tormenta fija';

            showSpecialHint(
              label
            );
          }

        },
        260
      );


      return true;
    }

  };


  window.MAGIC_MANUAL_CLIMATE_ACTIVE=
    Boolean(
      manualClimateMode
    );


})();


/* =========================================================
   ACTIVIDADES PEQUEÑAS PARA EXPLORAR EL CAMPO

   Siempre disponible:
   - tocar tulipanes

   Actividades que aparecen durante las esperas:
   - luciérnagas
   - plantar un tulipán
   - constelación
   - huellas de Mewo
   - pétalo al viento
   - estrella viajera
   - piedra/mensaje escondido

   Los eventos grandes (clima, Mewo, juego, cartas)
   tienen prioridad y pausan estas actividades.
========================================================= */

(() => {

  const app =
    document.getElementById('app');

  if(!app){
    return;
  }


  /*
    IMPORTANTE:
    Las estadísticas viven en el primer módulo.
    Este alias evita errores al tocar tulipanes,
    huellas, luciérnagas, etc.
  */
  const paradoxStats =
    window.ParadoxStats ||
    {
      inc(){
        return 0;
      },

      get(){
        return 0;
      },

      all(){
        return {};
      }
    };


  /* =====================================================
     CAPA
  ===================================================== */

  const idleLayer =
    document.createElement('div');

  idleLayer.id =
    'idleActivitiesLayer';


  const idleMessage =
    document.createElement('div');

  idleMessage.id =
    'idleActivityMessage';


  const fireflyBadge =
    document.createElement('div');

  fireflyBadge.id =
    'fireflyBadge';

  fireflyBadge.innerHTML =
    '✨ <span id="fireflyCount">0</span>/10';


  idleLayer.appendChild(
    fireflyBadge
  );

  document.body.appendChild(
    idleLayer
  );

  document.body.appendChild(
    idleMessage
  );


  /* =====================================================
     ESTADO
  ===================================================== */

  let idleTimer=0;
  let activeIdle=null;
  let activityToken=0;

  let lastIdleType=null;

  let fireflyCount=0;

  let tulipPointer=null;


  const cooldowns = {
    fireflies:0,
    plant:0,
    constellation:0,
    footprints:0,
    petal:0,
    traveler:0,
    pebble:0
  };


  const cooldownTime = {
    fireflies:35000,
    plant:75000,
    constellation:90000,
    footprints:48000,
    petal:32000,
    traveler:78000,
    pebble:55000
  };


  /* =====================================================
     UTILIDADES
  ===================================================== */

  function now(){
    return Date.now();
  }


  function sceneBusy(){

    if(
      document.body.classList.contains(
        'intro-active'
      )
    ){
      return true;
    }


    const game =
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
      Un clima NATURAL ocupa la escena y pausa los
      minijuegos. Un clima elegido manualmente desde ☁
      es solo el fondo, así que las actividades siguen
      apareciendo encima.
    */
    if(
      window.MAGIC_AMBIENT_ACTIVE &&
      !window.MAGIC_MANUAL_CLIMATE_ACTIVE
    ){
      return true;
    }


    const mewo =
      document.getElementById(
        'mewoCat'
      );

    if(
      mewo &&
      mewo.classList.contains(
        'show'
      ) &&
      !mewo.classList.contains(
        'leaving'
      )
    ){
      return true;
    }


    const reader =
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


  function showIdleMessage(
    text,
    duration=2600
  ){

    idleMessage.textContent =
      text;

    idleMessage.classList.remove(
      'show'
    );

    void idleMessage.offsetWidth;

    idleMessage.classList.add(
      'show'
    );


    clearTimeout(
      showIdleMessage.timer
    );


    showIdleMessage.timer =
      setTimeout(
        ()=>{
          idleMessage.classList.remove(
            'show'
          );
        },
        duration
      );
  }


  function randomGrassPoint(
    low=.58,
    high=.82
  ){

    return {
      x:
        10+
        Math.random()*80,

      y:
        (
          low+
          Math.random()*
          (
            high-low
          )
        )*100
    };
  }


  function randomSkyPoint(){

    return {
      x:
        10+
        Math.random()*80,

      y:
        8+
        Math.random()*29
    };
  }


  function clearActivityNodes(){

    idleLayer
      .querySelectorAll(
        '.idleTemporary'
      )
      .forEach(
        node=>node.remove()
      );
  }


  function finishIdle(
    type,
    delay=25000
  ){

    if(type){
      cooldowns[type]=
        now();
    }

    activeIdle=null;

    scheduleNext(
      delay
    );
  }


  function scheduleNext(
    customDelay=null
  ){

    clearTimeout(
      idleTimer
    );


    const delay =
      customDelay ??
      (
        13000+
        Math.random()*11000
      );


    idleTimer =
      setTimeout(
        tryRandomActivity,
        delay
      );
  }


  function availableActivities(){

    const t=now();

    return Object
      .keys(cooldowns)
      .filter(
        type=>
          t-
          cooldowns[type]
          >=
          cooldownTime[type]
      );
  }


  function weightedPick(
    list
  ){

    /*
      Más variedad y mayor presencia de huellitas.
      Las actividades ligeras siguen siendo más comunes,
      pero ya no dominan tanto la selección.
    */

    const weighted=[];

    for(const item of list){

      let weight=1;

      if(item==='fireflies'){
        weight=3;
      }

      if(item==='petal'){
        weight=3;
      }

      if(item==='pebble'){
        weight=2;
      }

      if(item==='plant'){
        weight=2;
      }

      if(item==='constellation'){
        weight=2;
      }

      if(item==='footprints'){
        weight=4;
      }

      for(let i=0;i<weight;i++){
        weighted.push(item);
      }
    }


    return weighted[
      Math.floor(
        Math.random()*
        weighted.length
      )
    ];
  }


  function tryRandomActivity(){

    if(
      activeIdle ||
      sceneBusy() ||
      document.hidden
    ){

      scheduleNext(
        7000
      );

      return;
    }


    let list =
      availableActivities();


    if(
      list.length>1 &&
      lastIdleType
    ){
      list=
        list.filter(
          item=>item!==lastIdleType
        );
    }


    if(!list.length){

      scheduleNext(
        10000
      );

      return;
    }


    const type =
      weightedPick(
        list
      );


    activeIdle=type;
    lastIdleType=type;
    activityToken++;

    const token=
      activityToken;


    if(type==='fireflies'){
      startFireflies(token);
    }

    else if(type==='plant'){
      startPlanting(token);
    }

    else if(type==='constellation'){
      startConstellation(token);
    }

    else if(type==='footprints'){
      startFootprints(token);
    }

    else if(type==='petal'){
      startWindPetal(token);
    }

    else if(type==='traveler'){
      startTravelingStar(token);
    }

    else if(type==='pebble'){
      startPebble(token);
    }
  }


  /* =====================================================
     1. TOCAR TULIPANES — SIEMPRE DISPONIBLE
  ===================================================== */

  function tulipTouchBusy(){

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


    const mewo=
      document.getElementById(
        'mewoCat'
      );

    if(
      mewo &&
      mewo.classList.contains(
        'show'
      ) &&
      !mewo.classList.contains(
        'leaving'
      )
    ){
      return true;
    }


    /*
      IMPORTANTE:
      los climas NO bloquean esta interacción.
    */
    return false;
  }


  function reactTulip(
    x,
    y
  ){

    if(
      tulipTouchBusy() ||
      y<
      window.innerHeight*.47
    ){
      return;
    }


    paradoxStats.inc('tulipsTouched');

    const flower =
      document.createElement('span');

    flower.className =
      'tapTulipReaction';

    flower.style.left =
      `${x}px`;

    flower.style.top =
      `${y}px`;


    idleLayer.appendChild(
      flower
    );


    for(let i=0;i<7;i++){

      const petal =
        document.createElement('span');

      petal.className =
        'tapTulipPetal';

      petal.style.left =
        `${x}px`;

      petal.style.top =
        `${y-18}px`;

      petal.style.setProperty(
        '--petal-x',
        `${-30+Math.random()*60}px`
      );

      petal.style.setProperty(
        '--petal-y',
        `${-20-Math.random()*46}px`
      );

      petal.style.animationDelay =
        `${Math.random()*.14}s`;


      idleLayer.appendChild(
        petal
      );


      setTimeout(
        ()=>petal.remove(),
        1450
      );
    }


    setTimeout(
      ()=>flower.remove(),
      1050
    );
  }


  app.addEventListener(
    'pointerdown',
    e=>{

      tulipPointer={
        id:e.pointerId,
        x:e.clientX,
        y:e.clientY,
        time:performance.now()
      };
    },
    {
      passive:true
    }
  );


  app.addEventListener(
    'pointerup',
    e=>{

      if(
        !tulipPointer ||
        tulipPointer.id!==e.pointerId
      ){
        return;
      }


      const distance=
        Math.hypot(
          e.clientX-
          tulipPointer.x,
          e.clientY-
          tulipPointer.y
        );


      const time=
        performance.now()-
        tulipPointer.time;


      if(
        distance<11 &&
        time<420
      ){

        reactTulip(
          e.clientX,
          e.clientY
        );
      }


      tulipPointer=null;
    },
    {
      passive:true
    }
  );


  app.addEventListener(
    'pointercancel',
    ()=>{
      tulipPointer=null;
    },
    {
      passive:true
    }
  );


  /* =====================================================
     2. LUCIÉRNAGAS
  ===================================================== */

  function updateFireflyBadge(){

    const value =
      document.getElementById(
        'fireflyCount'
      );

    if(value){
      value.textContent=
        String(
          fireflyCount%10
        );
    }


    fireflyBadge.classList.add(
      'show'
    );


    clearTimeout(
      updateFireflyBadge.timer
    );


    updateFireflyBadge.timer=
      setTimeout(
        ()=>{
          fireflyBadge.classList.remove(
            'show'
          );
        },
        3300
      );
  }


  function fireflyHeart(){

    const heart =
      document.createElement('div');

    heart.className =
      'fireflyHeart idleTemporary';


    const points=[
      [0,-18],
      [-17,-32],
      [-37,-28],
      [-50,-10],
      [-43,10],
      [-25,28],
      [0,48],
      [25,28],
      [43,10],
      [50,-10],
      [37,-28],
      [17,-32]
    ];


    for(
      const [x,y]
      of points
    ){

      const dot=
        document.createElement('i');

      dot.style.setProperty(
        '--hx',
        `${x}px`
      );

      dot.style.setProperty(
        '--hy',
        `${y}px`
      );

      heart.appendChild(
        dot
      );
    }


    idleLayer.appendChild(
      heart
    );


    showIdleMessage(
      '✨ 10 luciérnagas formaron un corazón en el cielo ♡',
      4200
    );


    setTimeout(
      ()=>heart.remove(),
      5200
    );
  }


  function startFireflies(
    token
  ){

    showIdleMessage(
      '✨ Una pequeña nube de luciérnagas apareció entre los tulipanes.',
      3500
    );


    let remaining=7;
    let caughtHere=0;


    function burstFirefly(
      x,
      y
    ){

      for(
        let i=0;
        i<7;
        i++
      ){

        const spark=
          document.createElement(
            'span'
          );

        spark.className=
          'idleFireflySpark';

        spark.style.left=
          `${x}px`;

        spark.style.top=
          `${y}px`;

        const a=
          Math.random()*
          Math.PI*2;

        const d=
          12+
          Math.random()*33;

        spark.style.setProperty(
          '--ffs-x',
          `${Math.cos(a)*d}px`
        );

        spark.style.setProperty(
          '--ffs-y',
          `${Math.sin(a)*d}px`
        );


        idleLayer.appendChild(
          spark
        );


        setTimeout(
          ()=>spark.remove(),
          900
        );
      }
    }


    for(
      let i=0;
      i<7;
      i++
    ){

      const p=
        randomGrassPoint(
          .53,
          .81
        );


      const f=
        document.createElement(
          'button'
        );

      f.type='button';

      f.className=
        'idleFirefly idleTemporary fireflyV2';


      if(i%4===0){

        f.classList.add(
          'warm'
        );
      }


      f.setAttribute(
        'aria-label',
        'Atrapar luciérnaga'
      );

      f.style.left=
        `${p.x}%`;

      f.style.top=
        `${p.y}%`;

      f.style.setProperty(
        '--fly-delay',
        `${Math.random()*1.8}s`
      );

      f.style.setProperty(
        '--fly-x',
        `${-16+Math.random()*32}px`
      );

      f.style.setProperty(
        '--fly-y',
        `${-13+Math.random()*26}px`
      );

      f.style.setProperty(
        '--fly-scale',
        `${.82+Math.random()*.42}`
      );


      f.addEventListener(
        'click',
        e=>{

          e.stopPropagation();


          if(
            f.classList.contains(
              'caught'
            )
          ){
            return;
          }


          const rect=
            f.getBoundingClientRect();


          burstFirefly(
            rect.left+
            rect.width/2,
            rect.top+
            rect.height/2
          );


          f.classList.add(
            'caught'
          );

          fireflyCount++;
          caughtHere++;
          paradoxStats.inc('firefliesCaught');

          updateFireflyBadge();


          if(
            fireflyCount>0 &&
            fireflyCount%10===0
          ){

            fireflyHeart();
          }


          remaining--;


          setTimeout(
            ()=>f.remove(),
            480
          );


          if(remaining<=0){

            showIdleMessage(
              `✨ Atrapaste toda la nube. +${caughtHere} luciérnagas ♡`,
              3200
            );

            finishIdle(
              'fireflies',
              19000
            );
          }
        }
      );


      idleLayer.appendChild(
        f
      );
    }


    setTimeout(
      ()=>{

        if(
          token!==activityToken ||
          activeIdle!=='fireflies'
        ){
          return;
        }


        idleLayer
          .querySelectorAll(
            '.idleFirefly'
          )
          .forEach(
            node=>node.remove()
          );


        if(caughtHere>0){

          showIdleMessage(
            `✨ Atrapaste ${caughtHere} luciérnaga${caughtHere===1?'':'s'}.`,
            2300
          );
        }


        finishIdle(
          'fireflies',
          17000
        );

      },
      24000
    );
  }

  /* =====================================================
     3. PLANTAR UN TULIPÁN
  ===================================================== */

  function startPlanting(
    token
  ){

    const p=
      randomGrassPoint(
        .64,
        .80
      );


    const plot=
      document.createElement(
        'button'
      );

    plot.type='button';

    plot.className=
      'idlePlantPlot idleTemporary stage-0 plantV2';

    plot.style.left=
      `${p.x}%`;

    plot.style.top=
      `${p.y}%`;

    plot.innerHTML=
      `
        <span class="plantSoil"></span>
        <span class="plantSeed">•</span>
        <span class="plantSprout">⌁</span>
        <span class="plantBud">♡</span>
        <span class="plantFlower"></span>
      `;


    let stage=0;


    function plantRipple(){

      const ripple=
        document.createElement(
          'span'
        );

      ripple.className=
        'plantMagicRipple';

      plot.appendChild(
        ripple
      );


      setTimeout(
        ()=>ripple.remove(),
        900
      );
    }


    showIdleMessage(
      '🌱 Encontraste tierra fértil. Ayuda a que nazca un tulipán.',
      3900
    );


    plot.addEventListener(
      'click',
      e=>{

        e.stopPropagation();


        if(stage>=4){
          return;
        }


        plantRipple();


        stage=
          Math.min(
            4,
            stage+1
          );


        plot.className=
          `idlePlantPlot idleTemporary plantV2 stage-${stage}`;


        if(stage===1){

          showIdleMessage(
            'Una semillita quedó bajo la tierra...'
          );
        }


        else if(stage===2){

          showIdleMessage(
            '🌱 Un pequeño brote apareció.'
          );
        }


        else if(stage===3){

          showIdleMessage(
            '♡ Ya tiene un botón de flor... un toque más.'
          );
        }


        else if(stage===4){

          plot.classList.add(
            'grown'
          );
          paradoxStats.inc('tulipsPlanted');


          for(
            let i=0;
            i<8;
            i++
          ){

            const spark=
              document.createElement(
                'span'
              );

            spark.className=
              'plantBloomSpark';

            spark.style.setProperty(
              '--pbs-x',
              `${-32+Math.random()*64}px`
            );

            spark.style.setProperty(
              '--pbs-y',
              `${-25-Math.random()*45}px`
            );

            plot.appendChild(
              spark
            );


            setTimeout(
              ()=>spark.remove(),
              1250
            );
          }


          showIdleMessage(
            '🌷 Floreció. Este tulipán es tuyo durante esta visita ♡',
            3900
          );


          activeIdle=null;
          cooldowns.plant=now();

          scheduleNext(
            19000
          );


          plot.classList.remove(
            'idleTemporary'
          );


          setTimeout(
            ()=>{

              plot.classList.add(
                'plantFade'
              );

              setTimeout(
                ()=>plot.remove(),
                1800
              );

            },
            150000
          );
        }
      }
    );


    idleLayer.appendChild(
      plot
    );


    setTimeout(
      ()=>{

        if(
          token!==activityToken ||
          stage>=4
        ){
          return;
        }


        plot.remove();


        finishIdle(
          'plant',
          19000
        );

      },
      50000
    );
  }

  /* =====================================================
     4. CONSTELACIÓN
  ===================================================== */

  function startConstellation(
    token
  ){

    const box=
      document.createElement(
        'div'
      );

    box.className=
      'idleConstellation idleTemporary constellationV2';


    const svgNS=
      'http://www.w3.org/2000/svg';


    const lines=
      document.createElementNS(
        svgNS,
        'svg'
      );

    lines.setAttribute(
      'viewBox',
      '0 0 100 100'
    );

    lines.classList.add(
      'constellationLines'
    );


    box.appendChild(
      lines
    );


    const patterns=[
      {
        symbol:'♡',
        points:[
          [18,47],
          [29,28],
          [45,34],
          [50,54],
          [55,34],
          [71,28],
          [82,47]
        ]
      },

      {
        symbol:'✿',
        points:[
          [50,19],
          [70,34],
          [67,58],
          [50,73],
          [33,58],
          [30,34],
          [50,45]
        ]
      },

      {
        symbol:'☾',
        points:[
          [30,25],
          [48,20],
          [66,30],
          [72,49],
          [61,67],
          [42,73],
          [29,59]
        ]
      }
    ];


    const pattern=
      patterns[
        Math.floor(
          Math.random()*
          patterns.length
        )
      ];


    const points=
      pattern.points;


    let current=0;


    showIdleMessage(
      '⭐ Una constelación quiere aparecer. Sigue la estrella que pulse.',
      4300
    );


    function sparkleAt(
      star
    ){

      const r=
        star.getBoundingClientRect();


      for(
        let i=0;
        i<5;
        i++
      ){

        const p=
          document.createElement(
            'span'
          );

        p.className=
          'constellationSpark';

        p.style.left=
          `${r.left+r.width/2}px`;

        p.style.top=
          `${r.top+r.height/2}px`;

        p.style.setProperty(
          '--cs-x',
          `${-24+Math.random()*48}px`
        );

        p.style.setProperty(
          '--cs-y',
          `${-24+Math.random()*48}px`
        );


        document.body.appendChild(
          p
        );


        setTimeout(
          ()=>p.remove(),
          900
        );
      }
    }


    function refresh(){

      box
        .querySelectorAll(
          '.constellationStar'
        )
        .forEach(
          (star,index)=>{

            star.classList.toggle(
              'next',
              index===current
            );

            star.classList.toggle(
              'done',
              index<current
            );
          }
        );
    }


    points.forEach(
      ([x,y],index)=>{

        const star=
          document.createElement(
            'button'
          );

        star.type='button';

        star.className=
          'constellationStar';

        star.textContent='✦';

        star.style.left=
          `${x}%`;

        star.style.top=
          `${y}%`;


        star.addEventListener(
          'click',
          e=>{

            e.stopPropagation();


            if(index!==current){

              box.classList.remove(
                'mistake'
              );

              void box.offsetWidth;

              box.classList.add(
                'mistake'
              );


              current=0;
              lines.innerHTML='';


              showIdleMessage(
                'Las estrellas se desordenaron... sigue nuevamente el pulso ✦',
                2400
              );


              refresh();

              return;
            }


            sparkleAt(
              star
            );


            if(current>0){

              const [
                x1,
                y1
              ]=
                points[
                  current-1
                ];

              const [
                x2,
                y2
              ]=
                points[
                  current
                ];


              const line=
                document.createElementNS(
                  svgNS,
                  'line'
                );

              line.setAttribute(
                'x1',
                x1
              );

              line.setAttribute(
                'y1',
                y1
              );

              line.setAttribute(
                'x2',
                x2
              );

              line.setAttribute(
                'y2',
                y2
              );


              lines.appendChild(
                line
              );
            }


            current++;


            if(
              current>=
              points.length
            ){

              refresh();

              box.classList.add(
                'complete'
              );


              const symbol=
                document.createElement(
                  'div'
                );

              symbol.className=
                'constellationSymbol';

              symbol.textContent=
                pattern.symbol;


              box.appendChild(
                symbol
              );


              for(
                let i=0;
                i<14;
                i++
              ){

                const dust=
                  document.createElement(
                    'span'
                  );

                dust.className=
                  'constellationDust';

                dust.style.left=
                  `${18+Math.random()*64}%`;

                dust.style.top=
                  `${18+Math.random()*58}%`;

                dust.style.animationDelay=
                  `${Math.random()*.8}s`;


                box.appendChild(
                  dust
                );
              }


              paradoxStats.inc('constellationsCompleted');

              showIdleMessage(
                `✨ La constelación ${pattern.symbol} se completó.`,
                3900
              );


              setTimeout(
                ()=>box.remove(),
                6200
              );


              finishIdle(
                'constellation',
                24000
              );

              return;
            }


            refresh();
          }
        );


        box.appendChild(
          star
        );
      }
    );


    idleLayer.appendChild(
      box
    );

    refresh();


    setTimeout(
      ()=>{

        if(
          token!==activityToken ||
          activeIdle!=='constellation'
        ){
          return;
        }


        box.remove();


        finishIdle(
          'constellation',
          21000
        );

      },
      43000
    );
  }

  /* =====================================================
     5. HUELLAS DE MEWO
  ===================================================== */

  function startFootprints(
    token
  ){

    const path=
      [
        {x:19,y:77,r:-18},
        {x:34,y:70,r:12},
        {x:53,y:75,r:-8},
        {x:71,y:67,r:18},
        {x:83,y:73,r:-10}
      ];


    let step=0;
    let currentFoot=null;


    showIdleMessage(
      '🐾 Hay unas huellitas entre el pasto...',
      3600
    );


    function spawnFoot(){

      if(
        token!==activityToken
      ){
        return;
      }


      if(currentFoot){
        currentFoot.remove();
      }


      if(
        step>=path.length
      ){

        showIdleMessage(
          'miau... ♡ Mewo parece estar cerca.',
          4200
        );


        window.dispatchEvent(
          new CustomEvent(
            'mewo-footprints-complete'
          )
        );


        finishIdle(
          'footprints',
          22000
        );

        return;
      }


      const p=
        path[step];


      const foot=
        document.createElement(
          'button'
        );

      foot.type='button';

      foot.className=
        'idleFootprint idleTemporary';

      foot.innerHTML=
        '<span>●</span><i>●</i><b>●</b><em>●</em>';

      foot.style.left=
        `${p.x}%`;

      foot.style.top=
        `${p.y}%`;

      foot.style.transform=
        `translate(-50%,-50%) rotate(${p.r}deg)`;


      foot.addEventListener(
        'click',
        e=>{

          e.stopPropagation();

          foot.classList.add(
            'footFound'
          );

          step++;


          setTimeout(
            spawnFoot,
            260
          );
        }
      );


      currentFoot=foot;

      idleLayer.appendChild(
        foot
      );
    }


    spawnFoot();


    setTimeout(
      ()=>{

        if(
          token!==activityToken ||
          activeIdle!=='footprints'
        ){
          return;
        }

        if(currentFoot){
          currentFoot.remove();
        }

        finishIdle(
          'footprints',
          20000
        );

      },
      39000
    );
  }


  /* =====================================================
     6. PÉTALO AL VIENTO
  ===================================================== */

  function startWindPetal(
    token
  ){

    let round=0;
    let caught=0;
    let finished=false;
    let currentPetal=null;


    showIdleMessage(
      '🌸 Tres pétalos especiales cruzarán el campo. Intenta atrapar al menos dos.',
      3900
    );


    function burst(
      x,
      y,
      big=false
    ){

      const amount=
        big
        ? 18
        : 10;


      for(
        let i=0;
        i<amount;
        i++
      ){

        const spark=
          document.createElement(
            'span'
          );

        spark.className=
          'idlePetalBurst';


        if(big && i%4===0){

          spark.classList.add(
            'gold'
          );
        }


        spark.style.left=
          `${x}px`;

        spark.style.top=
          `${y}px`;

        spark.style.setProperty(
          '--burst-x',
          `${-62+Math.random()*124}px`
        );

        spark.style.setProperty(
          '--burst-y',
          `${-60+Math.random()*120}px`
        );


        idleLayer.appendChild(
          spark
        );


        setTimeout(
          ()=>spark.remove(),
          1350
        );
      }
    }


    function finishChallenge(){

      if(finished){
        return;
      }


      finished=true;


      if(currentPetal){
        currentPetal.remove();
        currentPetal=null;
      }


      if(caught>=2){

        const x=
          window.innerWidth*.5;

        const y=
          window.innerHeight*.52;


        burst(
          x,
          y,
          true
        );


        showIdleMessage(
          `♡ Atrapaste ${caught}/3 pétalos. El viento te dejó un pequeño destello.`,
          3600
        );
      }

      else{

        showIdleMessage(
          `🌸 Atrapaste ${caught}/3. Los demás siguieron con el viento.`,
          3000
        );
      }


      finishIdle(
        'petal',
        17000
      );
    }


    function spawnRound(){

      if(
        token!==activityToken ||
        finished
      ){
        return;
      }


      if(round>=3){

        finishChallenge();

        return;
      }


      const petal=
        document.createElement(
          'button'
        );

      currentPetal=
        petal;

      petal.type='button';

      petal.className=
        'idleWindPetal idleTemporary petalV2';


      if(round===2){

        petal.classList.add(
          'gold'
        );
      }


      petal.setAttribute(
        'aria-label',
        'Atrapar pétalo'
      );

      petal.style.top=
        `${29+Math.random()*43}%`;

      petal.style.setProperty(
        '--petal-drift',
        `${-85+Math.random()*170}px`
      );

      petal.style.setProperty(
        '--petal-time',
        `${7.5+Math.random()*1.5}s`
      );


      let caughtThis=false;


      petal.addEventListener(
        'click',
        e=>{

          e.stopPropagation();


          if(caughtThis){
            return;
          }


          caughtThis=true;
          caught++;
          paradoxStats.inc('petalsCaught');


          const rect=
            petal.getBoundingClientRect();


          petal.classList.add(
            'petalCaught'
          );


          burst(
            rect.left+
            rect.width/2,
            rect.top+
            rect.height/2,
            round===2
          );


          setTimeout(
            ()=>petal.remove(),
            260
          );


          currentPetal=null;
          round++;


          showIdleMessage(
            `🌸 ${caught}/3 atrapados.`,
            1300
          );


          setTimeout(
            spawnRound,
            780
          );
        }
      );


      petal.addEventListener(
        'animationend',
        ()=>{

          if(caughtThis){
            return;
          }


          petal.remove();

          currentPetal=null;
          round++;


          setTimeout(
            spawnRound,
            420
          );
        },
        {
          once:true
        }
      );


      idleLayer.appendChild(
        petal
      );
    }


    setTimeout(
      spawnRound,
      800
    );


    setTimeout(
      ()=>{

        if(
          token!==activityToken ||
          finished ||
          activeIdle!=='petal'
        ){
          return;
        }


        finishChallenge();

      },
      30000
    );
  }

  /* =====================================================
     7. ESTRELLA VIAJERA — ARRASTRAR A LA LUNA
  ===================================================== */

  function startTravelingStar(
    token
  ){

    const moon=
      document.getElementById(
        'moonHotspot'
      );


    if(!moon){

      finishIdle(
        'traveler',
        18000
      );

      return;
    }


    const star=
      document.createElement(
        'button'
      );

    star.type='button';

    star.className=
      'idleTravelingStar idleTemporary';

    star.textContent='✦';

    star.style.left=
      `${12+Math.random()*22}%`;

    star.style.top=
      `${13+Math.random()*18}%`;


    idleLayer.appendChild(
      star
    );


    showIdleMessage(
      '💫 Una estrellita viajera... ¿puedes llevarla hasta la luna?',
      4300
    );


    let dragging=false;
    let pointerId=null;


    function moveStar(
      x,
      y
    ){

      star.style.left=
        `${x}px`;

      star.style.top=
        `${y}px`;
    }


    star.addEventListener(
      'pointerdown',
      e=>{

        dragging=true;
        pointerId=e.pointerId;

        star.classList.add(
          'dragging'
        );


        try{
          star.setPointerCapture(
            e.pointerId
          );
        }
        catch(_){}


        moveStar(
          e.clientX,
          e.clientY
        );

        e.preventDefault();
        e.stopPropagation();
      }
    );


    star.addEventListener(
      'pointermove',
      e=>{

        if(
          !dragging ||
          e.pointerId!==pointerId
        ){
          return;
        }


        moveStar(
          e.clientX,
          e.clientY
        );


        e.preventDefault();
        e.stopPropagation();
      }
    );


    function releaseStar(e){

      if(!dragging){
        return;
      }


      dragging=false;

      star.classList.remove(
        'dragging'
      );


      const mr=
        moon.getBoundingClientRect();


      const x=e.clientX;
      const y=e.clientY;


      const inside=
        x>=mr.left-28 &&
        x<=mr.right+28 &&
        y>=mr.top-28 &&
        y<=mr.bottom+28;


      if(inside){

        star.classList.add(
          'starDelivered'
        );


        moon.classList.add(
          'idleMoonKiss'
        );


        createMoonKiss(
          mr.left+
          mr.width/2,
          mr.top+
          mr.height/2
        );


        showIdleMessage(
          '🌙✨ La luna recibió la estrellita.',
          3500
        );


        setTimeout(
          ()=>{
            moon.classList.remove(
              'idleMoonKiss'
            );

            star.remove();
          },
          1200
        );


        finishIdle(
          'traveler',
          22000
        );
      }

      else{

        star.classList.add(
          'starMissed'
        );


        showIdleMessage(
          'La estrellita siguió su viaje...'
        );


        setTimeout(
          ()=>star.remove(),
          1200
        );


        finishIdle(
          'traveler',
          18000
        );
      }
    }


    star.addEventListener(
      'pointerup',
      releaseStar
    );

    star.addEventListener(
      'pointercancel',
      releaseStar
    );


    setTimeout(
      ()=>{

        if(
          token!==activityToken ||
          activeIdle!=='traveler'
        ){
          return;
        }

        star.remove();

        finishIdle(
          'traveler',
          18000
        );

      },
      30000
    );
  }


  function createMoonKiss(
    x,
    y
  ){

    for(let i=0;i<13;i++){

      const spark=
        document.createElement(
          'span'
        );

      spark.className=
        'idleMoonSpark';

      spark.style.left=
        `${x}px`;

      spark.style.top=
        `${y}px`;


      const a=
        Math.random()*
        Math.PI*2;

      const d=
        26+
        Math.random()*56;


      spark.style.setProperty(
        '--moon-x',
        `${Math.cos(a)*d}px`
      );

      spark.style.setProperty(
        '--moon-y',
        `${Math.sin(a)*d}px`
      );


      document.body.appendChild(
        spark
      );


      setTimeout(
        ()=>spark.remove(),
        1500
      );
    }
  }


  /* =====================================================
     8. PIEDRITA / MENSAJE ESCONDIDO
  ===================================================== */

  const littleMessages=[
    'te encontré ♡',
    'sigue explorando...',
    'miau...',
    'aquí también pensé en ti',
    '♡',
    'un tulipán más para ti',
    'todavía queda magia por encontrar...'
  ];


  function startPebble(
    token
  ){

    const p=
      randomGrassPoint(
        .66,
        .82
      );


    const pebble=
      document.createElement(
        'button'
      );

    pebble.type='button';

    pebble.className=
      'idlePebble idleTemporary';

    pebble.style.left=
      `${p.x}%`;

    pebble.style.top=
      `${p.y}%`;

    pebble.innerHTML=
      '<span>✦</span>';


    idleLayer.appendChild(
      pebble
    );


    showIdleMessage(
      'Hay algo pequeño escondido entre el pasto...'
    );


    pebble.addEventListener(
      'click',
      e=>{

        e.stopPropagation();

        const text=
          littleMessages[
            Math.floor(
              Math.random()*
              littleMessages.length
            )
          ];


        pebble.classList.add(
          'pebbleOpen'
        );


        showIdleMessage(
          text,
          3600
        );


        setTimeout(
          ()=>pebble.remove(),
          900
        );


        finishIdle(
          'pebble',
          19000
        );
      }
    );


    setTimeout(
      ()=>{

        if(
          token!==activityToken ||
          activeIdle!=='pebble'
        ){
          return;
        }

        pebble.remove();

        finishIdle(
          'pebble',
          17000
        );

      },
      30000
    );
  }


  /* =====================================================
     INICIO
  ===================================================== */

  function beginWhenFieldReady(){

    if(
      !document.body.classList.contains(
        'intro-active'
      )
    ){

      scheduleNext(
        9500
      );

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

            scheduleNext(
              9500
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
   ACTIVIDADES V3 — OVERRIDES
===================================================== */

function startFootprints(
  token
){
  const points=[];
  const baseX=14+Math.random()*18;
  const dir=Math.random()>.5?1:-1;
  const count=7+Math.floor(Math.random()*3);
  for(let i=0;i<count;i++){
    const y=58+i*3.3+Math.random()*2.4;
    const zig=(i%2===0?1:-1)*(2.0+Math.random()*2.6);
    const drift=i*5.6*dir;
    points.push({x:Math.max(10,Math.min(88,baseX+drift+zig)),y});
  }
  const pawList=[];
  showIdleMessage('🐾 Unas huellitas aparecieron entre los tulipanes. Síguelas...',3600);
  function pawSpark(node){
    const rect=node.getBoundingClientRect();
    for(let i=0;i<6;i++){
      const spark=document.createElement('span');
      spark.className='pawSpark';
      spark.style.left=`${rect.left+rect.width/2}px`;
      spark.style.top=`${rect.top+rect.height/2}px`;
      spark.style.setProperty('--paw-x',`${-20+Math.random()*40}px`);
      spark.style.setProperty('--paw-y',`${-20+Math.random()*40}px`);
      idleLayer.appendChild(spark);
      setTimeout(()=>spark.remove(),900);
    }
  }
  points.forEach((p,index)=>{
    const paw=document.createElement('button');
    paw.type='button';
    paw.className='idleMewoPaw idleTemporary pawV3';
    paw.setAttribute('aria-label','Seguir huellita');
    paw.style.left=`${p.x}%`;
    paw.style.top=`${p.y}%`;
    paw.style.animationDelay=`${index*.18}s`;
    paw.dataset.index=String(index);
    pawList.push(paw);
    idleLayer.appendChild(paw);
  });
  let current=0;
  function refreshPaws(){ pawList.forEach((paw,index)=>{ paw.classList.toggle('next', index===current); paw.classList.toggle('done', index<current); }); }
  refreshPaws();
  pawList.forEach(paw=>{ paw.addEventListener('click', e=>{ e.stopPropagation(); const index=Number(paw.dataset.index); if(index!==current){ pawList.forEach(p=>p.classList.remove('done')); current=0; refreshPaws(); showIdleMessage('🐾 Mewo cambió de dirección... vuelve a seguir la primera huellita.',2600); return; } paw.classList.add('done'); pawSpark(paw); current++; refreshPaws(); if(current>=pawList.length){ paradoxStats.inc('mewoTracksCompleted'); showIdleMessage('🐈 Encontraste el final del rastro. Mewo estuvo muy cerca...',3400); pawList.forEach(p=>{p.classList.add('pawFade'); setTimeout(()=>p.remove(),700)}); finishIdle('footprints',17000); } }); });
  setTimeout(()=>{ if(token!==activityToken || activeIdle!=='footprints') return; pawList.forEach(p=>p.remove()); finishIdle('footprints',19000); },34000);
}

function startTravelingStar(
  token
){
  const moon=document.getElementById('moonHotspot');
  if(!moon){ finishIdle('traveler',18000); return; }
  const star=document.createElement('button');
  star.type='button';
  star.className='idleTravelingStar idleTemporary starV3';
  star.setAttribute('aria-label','Guiar estrella a la luna');
  star.innerHTML='\n      <span class="travelStarCore">✦</span>\n      <span class="travelStarTail"></span>\n    ';
  star.style.left='10%';
  star.style.top=`${24+Math.random()*16}%`;
  idleLayer.appendChild(star);
  showIdleMessage('💫 Una estrella viaja por el campo. Tócala y guíala hasta la luna.',3600);
  let dragging=false, done=false;
  function starBurst(x,y,amount=12){ for(let i=0;i<amount;i++){ const spark=document.createElement('span'); spark.className='starBurst'; spark.style.left=`${x}px`; spark.style.top=`${y}px`; spark.style.setProperty('--sb-x',`${-46+Math.random()*92}px`); spark.style.setProperty('--sb-y',`${-46+Math.random()*92}px`); idleLayer.appendChild(spark); setTimeout(()=>spark.remove(),1100); } }
  function finishNearMoon(){ if(done) return; done=true; const rect=star.getBoundingClientRect(); starBurst(rect.left+rect.width/2,rect.top+rect.height/2,18); star.classList.add('moonReached'); moon.classList.add('idleMoonKiss'); const mr=moon.getBoundingClientRect(); createMoonKiss(mr.left+mr.width/2,mr.top+mr.height/2); paradoxStats.inc('starsDeliveredToMoon'); showIdleMessage('🌙 La estrella alcanzó a la luna y dejó un pequeño brillo a su alrededor.',3700); setTimeout(()=>{moon.classList.remove('idleMoonKiss'); star.remove();},650); finishIdle('traveler',19000); }
  function pointerMove(e){ if(!dragging || done) return; const x=e.clientX, y=e.clientY; star.style.left=`${x}px`; star.style.top=`${y}px`; const mr=moon.getBoundingClientRect(); const mx=mr.left+mr.width/2, my=mr.top+mr.height/2; const dx=x-mx, dy=y-my; if(Math.sqrt(dx*dx+dy*dy)<68) finishNearMoon(); }
  star.addEventListener('pointerdown', e=>{e.preventDefault(); e.stopPropagation(); dragging=true; star.classList.add('dragging'); try{star.setPointerCapture(e.pointerId)}catch(_){} star.style.left=`${e.clientX}px`; star.style.top=`${e.clientY}px`;});
  star.addEventListener('pointermove', pointerMove);
  star.addEventListener('pointerup', ()=>{dragging=false; star.classList.remove('dragging')});
  star.addEventListener('pointercancel', ()=>{dragging=false; star.classList.remove('dragging')});
  setTimeout(()=>{ if(token!==activityToken || done || activeIdle!=='traveler') return; star.remove(); finishIdle('traveler',17000); },28000);
}

function startPebble(
  token
){
  const phrases=['🪨 Bajo las cosas pequeñas también puede esconderse algo bonito.','🪨 Incluso lo más simple guarda un pedacito de cariño.','🪨 A veces basta mover una piedrita para encontrar un secreto.'];
  const phrase=phrases[Math.floor(Math.random()*phrases.length)];
  const p=randomGrassPoint(.67,.82);
  const stone=document.createElement('button');
  stone.type='button';
  stone.className='idleStone idleTemporary stoneV3';
  stone.setAttribute('aria-label','Mover piedrita');
  stone.style.left=`${p.x}%`;
  stone.style.top=`${p.y}%`;
  stone.innerHTML='\n      <span class="stoneTop"></span>\n      <span class="stoneGlow"></span>\n    ';
  showIdleMessage('🪨 Algo pequeño brilló entre el pasto.',2800);
  stone.addEventListener('click', e=>{ e.stopPropagation(); stone.classList.add('opened'); paradoxStats.inc('stonesFound'); const note=document.createElement('div'); note.className='idleStoneNote'; note.innerHTML=`\n        <span class="stoneNoteMark">✦</span>\n        <p>${phrase}</p>\n        <button type="button">cerrar</button>\n      `; idleLayer.appendChild(note); note.querySelector('button').addEventListener('click',()=>{ note.remove(); stone.remove(); finishIdle('pebble',17000); }); });
  idleLayer.appendChild(stone);
  setTimeout(()=>{ if(token!==activityToken || activeIdle!=='pebble') return; stone.remove(); finishIdle('pebble',17000); },32000);
}





  /*
    El menú de clima ahora vive en:
    climate-menu.js

    Se dejó aquí únicamente el motor del clima.
    Esto evita cruces de variables entre módulos.
  */


  document.addEventListener(
    'visibilitychange',
    ()=>{

      if(
        document.hidden
      ){
        clearTimeout(
          idleTimer
        );
      }

      else if(
        !activeIdle
      ){
        scheduleNext(
          8000
        );
      }
    }
  );


  beginWhenFieldReady();

})();
