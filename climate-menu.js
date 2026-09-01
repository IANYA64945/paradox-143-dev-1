/* =========================================================
   PARADOX143 — MENÚ DE CLIMA INDEPENDIENTE

   Este archivo SOLO controla la interfaz ☁.
   El motor de clima sigue en magic-events.js.

   La separación evita que el botón dependa de variables
   privadas de otros módulos.
========================================================= */

(() => {

  'use strict';


  const LETTER_KEY =
    'paradox143_letters_v1';


  const CLIMATES = {

    normal:{
      mark:'☾',
      name:'Campo normal',
      letter:null
    },

    stars:{
      mark:'✦',
      name:'Estrellas',
      letter:'weather-stars'
    },

    fog:{
      mark:'◌',
      name:'Neblina',
      letter:'weather-fog'
    },

    rain:{
      mark:'◇',
      name:'Lluvia',
      letter:'weather-rain'
    },

    snow:{
      mark:'❄',
      name:'Nevada',
      letter:'weather-snow'
    },

    storm:{
      mark:'⚡',
      name:'Tormenta',
      letter:'weather-storm'
    }

  };


  let openedAt=0;


  function getLetters(){

    try{

      const raw=
        localStorage.getItem(
          LETTER_KEY
        );

      const value=
        raw
        ? JSON.parse(raw)
        : [];


      return new Set(
        Array.isArray(value)
        ? value
        : []
      );

    }

    catch(_){

      return new Set();
    }
  }


  function getWeather(){

    const weather=
      window.ParadoxWeather;


    if(
      !weather ||
      typeof weather.getState!=='function' ||
      typeof weather.setManual!=='function' ||
      typeof weather.normal!=='function'
    ){

      return null;
    }


    return weather;
  }


  function getWeatherState(){

    const weather=
      getWeather();


    if(!weather){

      return {
        type:null,
        manual:false
      };
    }


    try{

      return (
        weather.getState() ||
        {
          type:null,
          manual:false
        }
      );

    }

    catch(_){

      return {
        type:null,
        manual:false
      };
    }
  }


  /* =====================================================
     DOM
  ===================================================== */

  /*
    Si una versión antigua dejó elementos con estos IDs,
    los retiramos antes de crear el módulo nuevo.
  */

  document
    .getElementById(
      'climateBtn'
    )
    ?.remove();


  document
    .getElementById(
      'climatePanel'
    )
    ?.remove();


  const button=
    document.createElement(
      'button'
    );

  button.id=
    'climateBtn';

  button.type=
    'button';

  button.textContent=
    '☁';

  button.setAttribute(
    'aria-label',
    'Cambiar clima'
  );

  button.setAttribute(
    'aria-expanded',
    'false'
  );


  const panel=
    document.createElement(
      'div'
    );

  panel.id=
    'climatePanel';

  panel.setAttribute(
    'role',
    'dialog'
  );

  panel.setAttribute(
    'aria-label',
    'Selector de clima'
  );


  panel.innerHTML=
    `
      <div class="climatePanelHeader">

        <span>
          CLIMA ☁
        </span>

        <button
          id="climatePanelClose"
          type="button"
          aria-label="Cerrar"
        >
          ×
        </button>

      </div>

      <div
        id="climatePanelStatus"
        aria-live="polite"
      ></div>

      <div
        id="climatePanelList"
      ></div>
    `;


  document.body.appendChild(
    button
  );

  document.body.appendChild(
    panel
  );


  const list=
    panel.querySelector(
      '#climatePanelList'
    );

  const status=
    panel.querySelector(
      '#climatePanelStatus'
    );

  const closeBtn=
    panel.querySelector(
      '#climatePanelClose'
    );


  /* =====================================================
     ESTADO DE LA INTERFAZ
  ===================================================== */

  function anyClimateUnlocked(){

    const letters=
      getLetters();


    return Object
      .values(CLIMATES)
      .some(
        climate=>
          climate.letter &&
          letters.has(
            climate.letter
          )
      );
  }


  function refreshButtonVisibility(){

    button.classList.toggle(
      'visible',
      anyClimateUnlocked()
    );
  }


  function setStatus(
    text='',
    tone=''
  ){

    status.textContent=
      text;

    status.dataset.tone=
      tone;
  }


  function openPanel(){

    render();

    panel.classList.add(
      'show'
    );

    button.setAttribute(
      'aria-expanded',
      'true'
    );

    openedAt=
      performance.now();
  }


  function closePanel(){

    panel.classList.remove(
      'show'
    );

    button.setAttribute(
      'aria-expanded',
      'false'
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


  /* =====================================================
     CAMBIAR CLIMA
  ===================================================== */

  function applyClimate(
    type
  ){

    const weather=
      getWeather();


    if(!weather){

      setStatus(
        'El clima todavía está cargando…',
        'wait'
      );

      return;
    }


    try{

      if(
        typeof weather.canChange==='function' &&
        !weather.canChange()
      ){

        setStatus(
          'Termina la escena actual y vuelve a intentarlo ♡',
          'wait'
        );

        return;
      }


      if(type==='normal'){

        const ok=
          weather.normal();


        if(ok===false){

          setStatus(
            'Ahora no se puede cambiar el clima.',
            'wait'
          );

          return;
        }


        button.textContent=
          '☁';

        setStatus(
          '☾ Campo normal',
          'ok'
        );

        closePanel();

        setTimeout(
          render,
          350
        );

        return;
      }


      const ok=
        weather.setManual(
          type
        );


      if(ok===false){

        setStatus(
          'Ahora no se puede cambiar el clima.',
          'wait'
        );

        return;
      }


      button.textContent=
        CLIMATES[type].mark;


      setStatus(
        `${CLIMATES[type].mark} ${CLIMATES[type].name} activado`,
        'ok'
      );


      closePanel();


      setTimeout(
        render,
        520
      );

    }

    catch(error){

      console.error(
        '[Paradox143 clima]',
        error
      );


      setStatus(
        'No pude cambiar el clima. Intenta otra vez.',
        'error'
      );
    }
  }


  /* =====================================================
     RENDER
  ===================================================== */

  function render(){

    const letters=
      getLetters();

    const weatherState=
      getWeatherState();


    list.innerHTML=
      '';


    for(
      const [
        type,
        climate
      ]
      of Object.entries(
        CLIMATES
      )
    ){

      const unlocked=
        type==='normal' ||
        (
          climate.letter &&
          letters.has(
            climate.letter
          )
        );


      const row=
        document.createElement(
          'button'
        );

      row.type=
        'button';

      row.className=
        'climateChoice';


      if(!unlocked){

        row.classList.add(
          'locked'
        );

        row.disabled=
          true;
      }


      const active=
        type!=='normal' &&
        weatherState.manual &&
        weatherState.type===type;


      if(active){

        row.classList.add(
          'active'
        );
      }


      const mark=
        unlocked
        ? climate.mark
        : '🔒';

      const name=
        unlocked
        ? climate.name
        : '???';

      const detail=
        !unlocked
        ? 'aún no descubierto'

        : active
        ? 'ACTIVO'

        : type==='normal'
        ? 'volver a eventos automáticos'

        : 'usar como fondo';


      row.innerHTML=
        `
          <span>${mark}</span>

          <strong>
            ${name}
          </strong>

          <small>
            ${detail}
          </small>
        `;


      if(unlocked){

        row.addEventListener(
          'click',
          e=>{

            e.preventDefault();
            e.stopPropagation();

            applyClimate(
              type
            );
          }
        );
      }


      list.appendChild(
        row
      );
    }


    if(
      !getWeather()
    ){

      setStatus(
        'Cargando motor climático…',
        'wait'
      );
    }

    else{

      setStatus('');
    }
  }


  /* =====================================================
     EVENTOS
  ===================================================== */

  let lastPointerOpen=0;


  button.addEventListener(
    'pointerup',
    e=>{

      e.preventDefault();
      e.stopPropagation();

      lastPointerOpen=
        performance.now();

      togglePanel();
    }
  );


  /*
    Click de respaldo para navegadores que no generen
    pointerup correctamente. El control de tiempo evita
    ejecutar el mismo toque dos veces.
  */

  button.addEventListener(
    'click',
    e=>{

      e.preventDefault();
      e.stopPropagation();


      const now=
        performance.now();


      if(
        now-lastPointerOpen<
        500
      ){

        return;
      }


      togglePanel();
    }
  );


  button.addEventListener(
    'pointerdown',
    e=>{

      e.stopPropagation();

      lastPointerOpen=
        performance.now();
    }
  );


  closeBtn.addEventListener(
    'click',
    e=>{

      e.preventDefault();
      e.stopPropagation();

      closePanel();
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


      /*
        Evita que el mismo toque que abrió el panel
        sea interpretado como un toque exterior.
      */

      if(
        performance.now()-
        openedAt<
        180
      ){

        return;
      }


      if(
        panel.contains(
          e.target
        ) ||
        button.contains(
          e.target
        )
      ){

        return;
      }


      closePanel();

    },
    true
  );


  window.addEventListener(
    'storage',
    refreshButtonVisibility
  );


  document.addEventListener(
    'paradox-letter-added',
    refreshButtonVisibility
  );


  /*
    Algunos sistemas anteriores actualizan la canasta
    sin emitir evento. Este pequeño chequeo mantiene
    el botón sincronizado sin afectar rendimiento.
  */

  setInterval(
    ()=>{

      refreshButtonVisibility();


      if(
        panel.classList.contains(
          'show'
        )
      ){

        render();
      }

    },
    1800
  );


  refreshButtonVisibility();

})();
