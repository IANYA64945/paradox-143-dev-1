/* =========================================================
   PARADOX143 — "EL MUNDO TIENE HÁBITOS"

   NO añade cartas.
   NO cambia el total de 79.
   NO cambia la progresión.

   Añade:
   - rutinas silenciosas al entrar al Claro
   - mirador interactivo
   - constelación propia y permanente
   - caja física de recuerdos
========================================================= */

(() => {
  'use strict';

  const KEY='paradox143_world_habits_v1';

  const LETTER_KEY='paradox143_letters_v1';
  const LIFE_KEY='paradox143_act1_life_v1';
  const ADV_KEY='paradox143_act1_adventures_v1';
  const GROWTH_KEY='paradox143_act1_growth_v1';
  const FAMILY_KEY='paradox143_refuge_family_v1';

  const DEFAULT={
    visits:0,
    lastHabit:'',
    constellation:null,
    constellationMadeAt:0,
    lookoutVisits:0,
    boxOpened:0
  };

  const STAR_POINTS=[
    {id:'a',x:18,y:66},
    {id:'b',x:34,y:31},
    {id:'c',x:52,y:49},
    {id:'d',x:69,y:24},
    {id:'e',x:82,y:58}
  ];

  let garden=null;
  let root=null;
  let fieldConstellation=null;
  let habitTimer=0;
  let closeTimer=0;
  let constellationSelection=[];

  function json(key,fallback={}){
    try{
      const raw=localStorage.getItem(key);
      if(!raw) return fallback;
      const parsed=JSON.parse(raw);
      return parsed && typeof parsed==='object'
        ? parsed
        : fallback;
    }catch(_){
      return fallback;
    }
  }

  function write(key,value){
    try{
      localStorage.setItem(
        key,
        JSON.stringify(value)
      );
    }catch(_){}
  }

  function state(){
    return {
      ...DEFAULT,
      ...json(KEY,{})
    };
  }

  function save(patch={}){
    const next={
      ...state(),
      ...patch
    };

    write(KEY,next);

    renderConstellation();
    renderMemoryBox();

    return next;
  }

  function have(){
    try{
      const raw=
        localStorage.getItem(
          LETTER_KEY
        );

      const arr=
        raw
          ? JSON.parse(raw)
          : [];

      return new Set(
        Array.isArray(arr)
          ? arr
          : []
      );
    }catch(_){
      return new Set();
    }
  }

  function isGardenOpen(){
    garden=
      garden ||
      document.getElementById(
        'catGarden'
      );

    return Boolean(
      garden &&
      garden.classList.contains(
        'show'
      )
    );
  }

  function catsReady(){
    const f={
      grayArrived:false,
      orangeArrived:false,
      ...json(FAMILY_KEY,{})
    };

    return Boolean(
      f.grayArrived &&
      f.orangeArrived
    );
  }

  function busy(){
    return Boolean(
      document.body.classList.contains(
        'intro-active'
      ) ||
      document.body.classList.contains(
        'basket2-open'
      ) ||
      document.body.classList.contains(
        'refuge-arrival-event-open'
      ) ||
      document.body.classList.contains(
        'act1-adventure-open'
      ) ||
      document.body.classList.contains(
        'act1-growth-open'
      ) ||
      document.body.classList.contains(
        'act1-cinematic-open'
      ) ||
      document.body.classList.contains(
        'act1-constellation-open'
      ) ||
      document.getElementById(
        'letterReader'
      )?.classList.contains(
        'show'
      ) ||
      document.getElementById(
        'basket2Reader'
      )?.classList.contains(
        'show'
      ) ||
      document.getElementById(
        'gameOverlay'
      )?.classList.contains(
        'show'
      ) ||
      document.getElementById(
        'catCraftOverlay'
      )?.classList.contains(
        'show'
      )
    );
  }

  function currentWeather(){
    return (
      window.MAGIC_AMBIENT_ACTIVE ||
      garden?.dataset?.weather ||
      ''
    );
  }

  function ensureDOM(){
    garden=
      garden ||
      document.getElementById(
        'catGarden'
      );

    if(!garden){
      return false;
    }

    if(
      !document.getElementById(
        'worldHabitsRoot'
      )
    ){
      root=
        document.createElement(
          'div'
        );

      root.id=
        'worldHabitsRoot';

      root.innerHTML=`
        <div
          id="habitRoutineDecor"
          aria-hidden="true"
        ></div>

        <button
          id="habitLookout"
          type="button"
          aria-label="Mirador del Claro"
        >
          <span class="habitLookoutStone"></span>
          <span class="habitLookoutStar">✦</span>
        </button>

        <button
          id="habitMemoryBox"
          type="button"
          aria-label="Pequeña caja de recuerdos"
        >
          <span></span>
          <i>♡</i>
        </button>
      `;

      garden.appendChild(
        root
      );

      document
        .getElementById(
          'habitLookout'
        )
        ?.addEventListener(
          'click',
          openLookout
        );

      document
        .getElementById(
          'habitMemoryBox'
        )
        ?.addEventListener(
          'click',
          openMemoryBox
        );
    }else{
      root=
        document.getElementById(
          'worldHabitsRoot'
        );
    }

    if(
      !document.getElementById(
        'habitLookoutOverlay'
      )
    ){
      const overlay=
        document.createElement(
          'div'
        );

      overlay.id=
        'habitLookoutOverlay';

      overlay.setAttribute(
        'aria-hidden',
        'true'
      );

      overlay.innerHTML=`
        <div class="habitLookoutSky">
          <span>✦</span>
          <span>·</span>
          <span>✦</span>
          <span>·</span>
          <span>✦</span>
        </div>

        <div class="habitLookoutScene">
          <div class="habitLookoutCats">
            <img
              src="cat_gray_idle.png"
              alt=""
            >
            <img
              src="mewo_idle.png"
              alt=""
            >
            <img
              src="cat_orange_idle.png"
              alt=""
            >
          </div>

          <p id="habitLookoutText"></p>

          <button
            id="habitLookoutAction"
            type="button"
          ></button>

          <button
            id="habitLookoutClose"
            type="button"
          >
            volver al Claro
          </button>
        </div>
      `;

      document.body.appendChild(
        overlay
      );

      document
        .getElementById(
          'habitLookoutClose'
        )
        ?.addEventListener(
          'click',
          closeLookout
        );

      document
        .getElementById(
          'habitLookoutAction'
        )
        ?.addEventListener(
          'click',
          ()=>{
            if(
              currentWeather()==='stars' &&
              !state().constellation
            ){
              closeLookout(
                false
              );

              setTimeout(
                openConstellationCinema,
                550
              );
            }
          }
        );
    }

    if(
      !document.getElementById(
        'habitMemoryOverlay'
      )
    ){
      const overlay=
        document.createElement(
          'div'
        );

      overlay.id=
        'habitMemoryOverlay';

      overlay.setAttribute(
        'aria-hidden',
        'true'
      );

      overlay.innerHTML=`
        <section>
          <span class="habitMemoryBoxMark">♡</span>

          <h3>
            cositas que el Claro decidió guardar
          </h3>

          <p>
            no son otra colección.
            solo quedaron aquí.
          </p>

          <div
            id="habitMemoryItems"
          ></div>

          <button
            id="habitMemoryClose"
            type="button"
          >
            cerrar la cajita
          </button>
        </section>
      `;

      document.body.appendChild(
        overlay
      );

      document
        .getElementById(
          'habitMemoryClose'
        )
        ?.addEventListener(
          'click',
          closeMemoryBox
        );
    }

    if(
      !document.getElementById(
        'habitConstellationCinema'
      )
    ){
      const overlay=
        document.createElement(
          'div'
        );

      overlay.id=
        'habitConstellationCinema';

      overlay.setAttribute(
        'aria-hidden',
        'true'
      );

      overlay.innerHTML=`
        <div class="habitConstellationBackdrop"></div>

        <div class="habitConstellationHeader">
          <span>✦</span>
          <p>
            toca las estrellas en el orden que quieras
          </p>
          <small>
            esta forma será tuya
          </small>
        </div>

        <div
          id="habitConstellationBoard"
        >
          <svg
            id="habitConstellationLines"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          ></svg>
        </div>

        <div
          id="habitConstellationEnding"
        >
          <p>
            ahora hay una forma en el cielo
            que antes no existía ♡
          </p>

          <button
            id="habitConstellationSave"
            type="button"
          >
            dejarla aquí ✦
          </button>
        </div>

        <button
          id="habitConstellationCancel"
          type="button"
        >
          volver
        </button>
      `;

      document.body.appendChild(
        overlay
      );

      document
        .getElementById(
          'habitConstellationSave'
        )
        ?.addEventListener(
          'click',
          saveConstellation
        );

      document
        .getElementById(
          'habitConstellationCancel'
        )
        ?.addEventListener(
          'click',
          closeConstellationCinema
        );
    }

    if(
      !document.getElementById(
        'habitFieldConstellation'
      )
    ){
      fieldConstellation=
        document.createElement(
          'button'
        );

      fieldConstellation.id=
        'habitFieldConstellation';

      fieldConstellation.type=
        'button';

      fieldConstellation.setAttribute(
        'aria-label',
        'Nuestra constelación'
      );

      fieldConstellation.innerHTML=`
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        ></svg>
        <span>✦</span>
      `;

      document.body.appendChild(
        fieldConstellation
      );

      fieldConstellation.addEventListener(
        'click',
        ()=>{
          const note=
            document.getElementById(
              'habitFieldConstellation'
            );

          note?.classList.remove(
            'remember'
          );

          void note?.offsetWidth;

          note?.classList.add(
            'remember'
          );
        }
      );
    }else{
      fieldConstellation=
        document.getElementById(
          'habitFieldConstellation'
        );
    }

    renderMemoryBox();
    renderConstellation();

    return true;
  }


  /* =====================================================
     RUTINAS SILENCIOSAS
  ===================================================== */

  const HABITS=[
    'marie-sleep',
    'tuluz-mess',
    'mewo-moon',
    'after-meal',
    'family-rest',
    'quiet-home'
  ];

  function chooseHabit(){
    const st=state();

    let pool=
      HABITS.filter(
        name=>
          name!==st.lastHabit
      );

    const chosen=
      pool[
        Math.floor(
          Math.random()*
          pool.length
        )
      ] ||
      'quiet-home';

    return chosen;
  }

  function applyHabit(){
    if(
      !isGardenOpen() ||
      !catsReady() ||
      busy()
    ){
      return;
    }

    clearTimeout(
      habitTimer
    );

    const chosen=
      chooseHabit();

    const st=state();

    save({
      visits:
        Number(st.visits||0)+1,
      lastHabit:
        chosen
    });

    garden.dataset.worldHabit=
      chosen;

    document.body.classList.add(
      'act1-habits-open'
    );

    renderHabitDecor(
      chosen
    );

    /*
      Solo inmoviliza unos segundos para que al entrar
      realmente puedas notar qué estaban haciendo.
      Después el Jardín 2.0 vuelve a moverse normalmente.
    */
    habitTimer=setTimeout(
      ()=>{
        document.body.classList.remove(
          'act1-habits-open'
        );
      },
      7200
    );
  }

  function renderHabitDecor(name){
    const holder=
      document.getElementById(
        'habitRoutineDecor'
      );

    if(!holder){
      return;
    }

    holder.innerHTML='';

    if(name==='tuluz-mess'){
      holder.innerHTML=`
        <img
          class="habitMessToy a"
          src="toy_ball.png"
          alt=""
        >
        <img
          class="habitMessToy b"
          src="toy_fish.png"
          alt=""
        >
        <img
          class="habitMessToy c"
          src="toy_yarn.png"
          alt=""
        >
      `;
      return;
    }

    if(name==='marie-sleep'){
      holder.innerHTML=`
        <span
          class="habitRoutineSymbol marie"
        >
          zZ
        </span>
      `;
      return;
    }

    if(name==='mewo-moon'){
      holder.innerHTML=`
        <span
          class="habitRoutineSymbol mewo"
        >
          ☾
        </span>
      `;
      return;
    }

    if(name==='after-meal'){
      holder.innerHTML=`
        <span
          class="habitEmptyBowl"
        >
          ·
        </span>
      `;
      return;
    }

    if(name==='family-rest'){
      holder.innerHTML=`
        <span
          class="habitRoutineSymbol family"
        >
          ♡
        </span>
      `;
      return;
    }

    if(name==='quiet-home'){
      holder.innerHTML=`
        <i class="habitQuietLight a"></i>
        <i class="habitQuietLight b"></i>
        <i class="habitQuietLight c"></i>
      `;
    }
  }

  function clearHabit(){
    clearTimeout(
      habitTimer
    );

    document.body.classList.remove(
      'act1-habits-open'
    );

    if(garden){
      delete garden.dataset.worldHabit;
    }

    const holder=
      document.getElementById(
        'habitRoutineDecor'
      );

    if(holder){
      holder.innerHTML='';
    }
  }


  /* =====================================================
     MIRADOR
  ===================================================== */

  function openLookout(){
    if(
      !isGardenOpen() ||
      busy()
    ){
      return;
    }

    const overlay=
      document.getElementById(
        'habitLookoutOverlay'
      );

    const text=
      document.getElementById(
        'habitLookoutText'
      );

    const action=
      document.getElementById(
        'habitLookoutAction'
      );

    const weather=
      currentWeather();

    document.body.classList.add(
      'act1-habits-open'
    );

    garden.classList.add(
      'habit-lookout-scene'
    );

    overlay?.classList.add(
      'show'
    );

    overlay?.setAttribute(
      'aria-hidden',
      'false'
    );

    const st=state();

    save({
      lookoutVisits:
        Number(
          st.lookoutVisits||0
        )+1
    });

    const constellation=
      state().constellation;

    const messages={
      rain:
        'desde aquí la lluvia suena más lejos.. por ahora podemos quedarnos bajo techo mirando cómo cae ♡',

      storm:
        'los truenos se sienten enormes desde el campo, pero desde aquí el refugio sigue pareciendo un lugar seguro.',

      snow:
        'el frío llegó hasta los bordes del Claro.. los tres decidieron que este era un buen momento para quedarse cerquita.',

      fog:
        'la niebla tapa casi todo el bosque.. aun así las lucecitas del refugio siguen encontrándonos.',

      stars:
        constellation
          ? 'entre tantas estrellas ahora hay una forma que solo existe porque tú la dibujaste ✦'
          : 'esta noche las estrellas parecen quedarse quietas el tiempo suficiente para unirlas...',

      normal:
        'no está pasando nada especial.. y justamente por eso este lugar se siente bonito ♡'
    };

    text.textContent=
      messages[weather] ||
      messages.normal;

    if(
      weather==='stars' &&
      !constellation
    ){
      action.textContent=
        'mirar las estrellas ✦';

      action.classList.add(
        'show'
      );
    }else{
      action.classList.remove(
        'show'
      );

      action.textContent='';
    }
  }

  function closeLookout(release=true){
    const overlay=
      document.getElementById(
        'habitLookoutOverlay'
      );

    overlay?.classList.remove(
      'show'
    );

    overlay?.setAttribute(
      'aria-hidden',
      'true'
    );

    garden?.classList.remove(
      'habit-lookout-scene'
    );

    if(release){
      document.body.classList.remove(
        'act1-habits-open'
      );
    }
  }


  /* =====================================================
     CONSTELACIÓN PROPIA
  ===================================================== */

  function openConstellationCinema(){
    if(
      state().constellation ||
      currentWeather()!=='stars'
    ){
      return;
    }

    ensureDOM();

    constellationSelection=[];

    const overlay=
      document.getElementById(
        'habitConstellationCinema'
      );

    const board=
      document.getElementById(
        'habitConstellationBoard'
      );

    const svg=
      document.getElementById(
        'habitConstellationLines'
      );

    if(
      !overlay ||
      !board ||
      !svg
    ){
      return;
    }

    document.body.classList.remove(
      'act1-habits-open'
    );

    document.body.classList.add(
      'act1-constellation-open'
    );

    svg.innerHTML='';

    board
      .querySelectorAll(
        '.habitConstellationStar'
      )
      .forEach(
        node=>node.remove()
      );

    document
      .getElementById(
        'habitConstellationEnding'
      )
      ?.classList.remove(
        'show'
      );

    STAR_POINTS.forEach(
      point=>{
        const star=
          document.createElement(
            'button'
          );

        star.type='button';

        star.className=
          'habitConstellationStar';

        star.dataset.id=
          point.id;

        star.style.left=
          `${point.x}%`;

        star.style.top=
          `${point.y}%`;

        star.textContent='✦';

        star.addEventListener(
          'click',
          ()=>{
            chooseConstellationStar(
              point.id
            );
          }
        );

        board.appendChild(
          star
        );
      }
    );

    overlay.classList.add(
      'show'
    );

    overlay.setAttribute(
      'aria-hidden',
      'false'
    );
  }

  function chooseConstellationStar(id){
    if(
      constellationSelection.includes(id)
    ){
      return;
    }

    constellationSelection.push(id);

    const star=
      document.querySelector(
        `.habitConstellationStar[data-id="${id}"]`
      );

    star?.classList.add(
      'selected'
    );

    drawConstellationLines(
      constellationSelection,
      'habitConstellationLines'
    );

    if(
      constellationSelection.length>=
      STAR_POINTS.length
    ){
      document
        .querySelectorAll(
          '.habitConstellationStar'
        )
        .forEach(
          node=>
            node.disabled=true
        );

      setTimeout(
        ()=>{
          document
            .getElementById(
              'habitConstellationEnding'
            )
            ?.classList.add(
              'show'
            );
        },
        900
      );
    }
  }

  function pointById(id){
    return STAR_POINTS.find(
      point=>point.id===id
    );
  }

  function drawConstellationLines(
    order,
    svgId
  ){
    const svg=
      document.getElementById(
        svgId
      );

    if(!svg){
      return;
    }

    svg.innerHTML='';

    if(
      !Array.isArray(order) ||
      order.length<2
    ){
      return;
    }

    for(
      let i=1;
      i<order.length;
      i++
    ){
      const a=
        pointById(
          order[i-1]
        );

      const b=
        pointById(
          order[i]
        );

      if(!a || !b){
        continue;
      }

      const line=
        document.createElementNS(
          'http://www.w3.org/2000/svg',
          'line'
        );

      line.setAttribute(
        'x1',
        String(a.x)
      );

      line.setAttribute(
        'y1',
        String(a.y)
      );

      line.setAttribute(
        'x2',
        String(b.x)
      );

      line.setAttribute(
        'y2',
        String(b.y)
      );

      svg.appendChild(
        line
      );
    }
  }

  function saveConstellation(){
    if(
      constellationSelection.length<
      STAR_POINTS.length
    ){
      return;
    }

    save({
      constellation:[
        ...constellationSelection
      ],
      constellationMadeAt:
        Date.now()
    });

    closeConstellationCinema();

    setTimeout(
      ()=>{
        fieldConstellation
          ?.classList.add(
            'born'
          );

        setTimeout(
          ()=>{
            fieldConstellation
              ?.classList.remove(
                'born'
              );
          },
          2800
        );
      },
      450
    );
  }

  function closeConstellationCinema(){
    const overlay=
      document.getElementById(
        'habitConstellationCinema'
      );

    overlay?.classList.remove(
      'show'
    );

    overlay?.setAttribute(
      'aria-hidden',
      'true'
    );

    document.body.classList.remove(
      'act1-constellation-open'
    );

    constellationSelection=[];

    renderConstellation();
  }

  function renderConstellation(){
    ensureDOM();

    const data=
      state().constellation;

    if(
      !fieldConstellation ||
      !data ||
      !Array.isArray(data)
    ){
      fieldConstellation
        ?.classList.remove(
          'show'
        );

      return;
    }

    const svg=
      fieldConstellation
        .querySelector(
          'svg'
        );

    if(!svg){
      return;
    }

    svg.innerHTML='';

    STAR_POINTS.forEach(
      point=>{
        const circle=
          document.createElementNS(
            'http://www.w3.org/2000/svg',
            'circle'
          );

        circle.setAttribute(
          'cx',
          String(point.x)
        );

        circle.setAttribute(
          'cy',
          String(point.y)
        );

        circle.setAttribute(
          'r',
          '1.7'
        );

        svg.appendChild(
          circle
        );
      }
    );

    for(
      let i=1;
      i<data.length;
      i++
    ){
      const a=
        pointById(
          data[i-1]
        );

      const b=
        pointById(
          data[i]
        );

      if(!a || !b){
        continue;
      }

      const line=
        document.createElementNS(
          'http://www.w3.org/2000/svg',
          'line'
        );

      line.setAttribute(
        'x1',
        String(a.x)
      );

      line.setAttribute(
        'y1',
        String(a.y)
      );

      line.setAttribute(
        'x2',
        String(b.x)
      );

      line.setAttribute(
        'y2',
        String(b.y)
      );

      svg.appendChild(
        line
      );
    }

    fieldConstellation.classList.toggle(
      'show',
      !isGardenOpen() &&
      !document.body.classList.contains(
        'intro-active'
      )
    );

    fieldConstellation.dataset.weather=
      currentWeather()==='stars'
        ? 'stars'
        : 'normal';
  }


  /* =====================================================
     CAJA FÍSICA DE RECUERDOS
  ===================================================== */

  function memoryItems(){
    const h=have();
    const life=json(LIFE_KEY,{});
    const adv=json(ADV_KEY,{});

    const items=[];

    if(
      h.has(
        'act1-fallen-star'
      ) ||
      h.has(
        'act1-star-home'
      )
    ){
      items.push({
        type:'image',
        src:'aplique_estrella.png',
        name:'una estrellita'
      });
    }

    if(
      h.has(
        'act1-yarn-trail'
      ) ||
      h.has(
        'garden-yarn'
      )
    ){
      items.push({
        type:'image',
        src:'toy_yarn.png',
        name:'un pedacito del ovillo'
      });
    }

    if(
      h.has(
        'act1-marie-trail'
      ) ||
      h.has(
        'garden-gray-arrival'
      )
    ){
      items.push({
        type:'image',
        src:'aplique_huella.png',
        name:'una huellita'
      });
    }

    if(
      h.has(
        'act1-midnight-flower'
      ) ||
      h.has(
        'secret-garden-flowers'
      )
    ){
      items.push({
        type:'flower',
        name:'una florecita'
      });
    }

    if(
      h.has(
        'act1-our-tulip'
      ) ||
      life.specialTulip
    ){
      items.push({
        type:'tulip',
        name:'un pétalo de nuestro tulipán'
      });
    }

    if(
      h.has(
        'act1-our-charm'
      ) &&
      adv.charm
    ){
      const src={
        star:
          'aplique_estrella.png',
        moon:
          'aplique_luna.png',
        paw:
          'aplique_huella.png'
      }[adv.charm];

      if(src){
        items.push({
          type:'image',
          src,
          name:'el detallito que elegiste'
        });
      }
    }

    return items.slice(
      0,
      6
    );
  }

  function renderMemoryBox(){
    const box=
      document.getElementById(
        'habitMemoryBox'
      );

    if(!box){
      return;
    }

    const items=
      memoryItems();

    box.classList.toggle(
      'has-memories',
      items.length>0
    );
  }

  function openMemoryBox(){
    if(
      !isGardenOpen() ||
      busy()
    ){
      return;
    }

    const overlay=
      document.getElementById(
        'habitMemoryOverlay'
      );

    const holder=
      document.getElementById(
        'habitMemoryItems'
      );

    if(
      !overlay ||
      !holder
    ){
      return;
    }

    document.body.classList.add(
      'act1-habits-open'
    );

    holder.innerHTML='';

    const items=
      memoryItems();

    if(!items.length){
      holder.innerHTML=`
        <div
          class="habitMemoryEmpty"
        >
          todavía está casi vacía...
        </div>
      `;
    }else{
      items.forEach(
        item=>{
          const cell=
            document.createElement(
              'div'
            );

          cell.className=
            'habitMemoryItem';

          if(
            item.type==='image'
          ){
            cell.innerHTML=`
              <img
                src="${item.src}"
                alt=""
              >
              <small>
                ${item.name}
              </small>
            `;
          }

          if(
            item.type==='flower'
          ){
            cell.innerHTML=`
              <span
                class="habitMemoryFlower"
              >
                ❀
              </span>
              <small>
                ${item.name}
              </small>
            `;
          }

          if(
            item.type==='tulip'
          ){
            cell.innerHTML=`
              <span
                class="habitMemoryTulip"
              ></span>
              <small>
                ${item.name}
              </small>
            `;
          }

          holder.appendChild(
            cell
          );
        }
      );
    }

    overlay.classList.add(
      'show'
    );

    overlay.setAttribute(
      'aria-hidden',
      'false'
    );

    const st=state();

    save({
      boxOpened:
        Number(
          st.boxOpened||0
        )+1
    });
  }

  function closeMemoryBox(){
    document
      .getElementById(
        'habitMemoryOverlay'
      )
      ?.classList.remove(
        'show'
      );

    document
      .getElementById(
        'habitMemoryOverlay'
      )
      ?.setAttribute(
        'aria-hidden',
        'true'
      );

    document.body.classList.remove(
      'act1-habits-open'
    );
  }


  /* =====================================================
     ENTRADA / SALIDA
  ===================================================== */

  function onOpen(){
    ensureDOM();

    renderMemoryBox();

    closeTimer=setTimeout(
      ()=>{
        applyHabit();
      },
      950
    );

    renderConstellation();
  }

  function onClose(){
    clearTimeout(
      closeTimer
    );

    clearHabit();

    closeLookout();

    closeMemoryBox();

    renderConstellation();
  }

  function tick(){
    renderConstellation();
  }


  /* =====================================================
     INICIO
  ===================================================== */

  function init(){
    if(!ensureDOM()){
      return;
    }

    window.addEventListener(
      'paradox-cat-garden-open',
      onOpen
    );

    window.addEventListener(
      'paradox-cat-garden-close',
      onClose
    );

    window.addEventListener(
      'paradox-letter-collected',
      ()=>{
        setTimeout(
          ()=>{
            renderMemoryBox();
          },
          250
        );
      }
    );

    setInterval(
      tick,
      1400
    );

    if(isGardenOpen()){
      setTimeout(
        onOpen,
        700
      );
    }
  }

  const boot=setInterval(
    ()=>{
      if(
        document.getElementById(
          'catGarden'
        ) &&
        document.getElementById(
          'app'
        )
      ){
        clearInterval(
          boot
        );

        init();
      }
    },
    350
  );

  window.ParadoxWorldHabits={
    getState:state,

    openLookout,

    openBox:openMemoryBox,

    constellation(){
      if(
        currentWeather()==='stars'
      ){
        openConstellationCinema();
        return true;
      }

      return false;
    },

    reset(){
      localStorage.removeItem(
        KEY
      );

      location.reload();
    }
  };

})();
