/* =========================================================
   PARADOX143 — CINEMÁTICAS DEL ACTO I

   No añade cartas nuevas.
   Convierte momentos importantes ya existentes en pequeñas
   escenas cinematográficas antes de presentar su carta.
========================================================= */

(() => {
  'use strict';

  const QUEUE=[];
  let current=null;
  let layer=null;
  let frameTimer=0;
  let readyTimer=0;

  const SCENES={
    'act1-fireflies':{
      theme:'fireflies',
      mark:'✦',
      cats:[],
      prop:null,
      frames:[
        'las lucecitas dejaron de huir por un momento...',
        'parecían estrellas demasiado pequeñas para quedarse en el cielo.',
        'y durante unos segundos el Claro brilló solamente para nosotros ♡'
      ]
    },

    'act1-tuluz-treasure':{
      theme:'tuluz',
      mark:'◇',
      cats:['cat_orange_happy.png'],
      prop:'toy_yarn.png',
      frames:[
        'Tuluz salió corriendo antes de que pudiera preguntarle qué estaba buscando...',
        'dio media vuelta al refugio por una cosita diminuta.',
        'para él era un tesoro. supongo que eso era suficiente para que también lo fuera para nosotros ♡'
      ]
    },

    'act1-mewo-awake':{
      theme:'mewo',
      mark:'☾',
      cats:['mewo_idle.png'],
      prop:null,
      frames:[
        'esa noche Mewo simplemente no quería mimir.',
        'probamos comida, mimitos y quedarnos cerquita...',
        'al final quizá solo necesitaba saber que alguien todavía estaba ahí ♡'
      ]
    },

    'act1-yarn-trail':{
      theme:'yarn',
      mark:'∞',
      cats:['cat_orange_happy.png'],
      prop:'toy_yarn.png',
      frames:[
        'el hilo atravesó el jardín como si alguien hubiera dibujado un camino sin preguntar.',
        'Tuluz lo miró como si aquel desastre fuera una obra maestra.',
        'creo que volverá a hacerlo >w<' 
      ]
    },

    'act1-midnight-flower':{
      theme:'flower',
      mark:'❀',
      cats:[],
      prop:null,
      frames:[
        'la flor esperó a que el cielo estuviera lleno de estrellas...',
        'entonces abrió poquito a poquito.',
        'como si hubiera guardado una luz que solo quería enseñarnos esta noche ♡'
      ]
    },

    'act1-cat-picnic':{
      theme:'picnic',
      mark:'♡',
      cats:['mewo_idle.png','cat_gray_happy.png','cat_orange_happy.png'],
      prop:'food_bowl.png',
      frames:[
        'no era una gran celebración.',
        'solo comida, juguetes y tres gatitos haciendo lo que se les daba la gana...',
        'pero se sintió exactamente como uno de esos momentos que quisiera guardar ♡'
      ]
    },

    'act1-our-charm':{
      theme:'charm',
      mark:'✧',
      cats:['cat_gray_idle.png','mewo_idle.png','cat_orange_idle.png'],
      prop:null,
      frames:[
        'lo colgamos sin hacer demasiado ruido.',
        'una cosita pequeña elegida por ti.',
        'ahora cada vez que volvamos habrá algo en este refugio que recuerde que tú también ayudaste a construirlo ♡'
      ]
    },

    'act1-new-nook':{
      theme:'nook',
      mark:'✦',
      cats:['cat_gray_idle.png','mewo_idle.png','cat_orange_idle.png'],
      prop:null,
      frames:[
        'las hojas se movieron donde antes parecía terminar el Claro...',
        'detrás había espacio.',
        'tal vez este pequeño lugar todavía no terminó de crecer con nosotros ♡'
      ]
    },

    'act1-marie-place':{
      theme:'marie',
      mark:'♡',
      cats:['cat_gray_sleep.png'],
      prop:'pillow_base_square.png',
      frames:[
        'Marie volvió al mismo rincón otra vez.',
        'dio una vuelta pequeñita y se acomodó como si siempre hubiera pertenecido ahí.',
        'creo que ya eligió su lugar ♡'
      ]
    },

    'act1-tuluz-place':{
      theme:'tuluz-place',
      mark:'✦',
      cats:['cat_orange_happy.png'],
      prop:'toy_ball.png',
      frames:[
        'Tuluz también encontró un sitio favorito.',
        'casualmente queda muy cerca de todo lo que puede tirar, perseguir o robar >w<',
        'sí... definitivamente es su lugar.'
      ]
    },

    'act1-mewo-place':{
      theme:'mewo-place',
      mark:'🐾',
      cats:['mewo_idle.png'],
      prop:null,
      frames:[
        'Mewo puede irse al campo, acercarse a la canasta o volver aquí cuando quiera.',
        'pero incluso ella terminó escogiendo un pequeño rincón al cual regresar.',
        'supongo que tener libertad también significa poder elegir dónde volver ♡'
      ]
    },

    'act1-home-light':{
      theme:'light',
      mark:'✦',
      cats:['mewo_idle.png','cat_gray_idle.png','cat_orange_idle.png'],
      prop:null,
      frames:[
        'encendimos una lucecita y el refugio cambió apenas un poquito.',
        'no ilumina todo el bosque.',
        'solo lo suficiente para recordarnos dónde volver ♡'
      ]
    },

    'act1-night-home':{
      theme:'night',
      mark:'☾',
      cats:['mewo_sleep.png','cat_gray_sleep.png','cat_orange_sleep.png'],
      prop:null,
      frames:[
        'Tuluz dejó de correr.',
        'Marie encontró dónde mimir. Mewo se quedó cerquita.',
        'y sin que ocurriera nada extraordinario... el refugio se sintió completamente lleno ♡'
      ]
    },

    'act1-place-return':{
      theme:'stay-home',mark:'⌂',
      cats:['cat_gray_idle.png','mewo_idle.png','cat_orange_idle.png'],prop:null,
      frames:['volvimos otra vez.','el árbol seguía aquí. las lucecitas también. ellos encontraron sus lugares antes que nosotros.','creo que este pequeño Claro ya aprendió a esperarnos ♡']
    },

    'act1-same-moon':{
      theme:'stay-moon',mark:'☾',
      cats:['cat_gray_idle.png','mewo_idle.png','cat_orange_idle.png'],prop:null,
      frames:['desde el campo la luna parecía enorme.','desde este rinconcito sigue siendo la misma...','pero algunas cosas se sienten diferentes cuando sabes con quién quieres mirarlas ♡']
    },

    'act1-nothing-happens':{
      theme:'stay-quiet',mark:'·',
      cats:['mewo_idle.png','cat_gray_sleep.png','cat_orange_idle.png'],prop:null,
      frames:['esta vez no apareció nada que perseguir.','nadie necesitaba ayuda. ninguna lucecita estaba escondiendo un secreto.','solo estuvimos aquí... y creo que eso también merece quedarse ♡']
    },

    'act1-things-stayed':{
      theme:'stay-box',mark:'◇',
      cats:[],prop:'aplique_huella.png',
      frames:['abrimos la cajita y había cosas demasiado pequeñas para parecer importantes.','una huellita. un hilo. una estrellita. una flor.','juntas se parecían muchísimo a una historia que nunca intentamos escribir ♡']
    },

    'act1-return-tulip':{
      theme:'stay-tulip',mark:'✿',
      cats:[],prop:null,
      frames:['entre miles de tulipanes todavía pude encontrar este.','no porque sea el más grande ni el que más brilla.','sino porque tú elegiste dónde debía crecer ♡']
    },

    'act1-rain-stay':{
      theme:'stay-rain',mark:'◇',
      cats:['mewo_idle.png','cat_gray_sleep.png','cat_orange_idle.png'],prop:null,
      frames:['afuera seguía lloviendo.','pero esta vez no había nada que rescatar ni ninguna carrera contra la tormenta.','podíamos simplemente escucharla caer mientras nos quedábamos aquí juntos ♡']
    },

    'act1-still-knowing-cats':{
      theme:'stay-cats',mark:'🐾',
      cats:['cat_gray_happy.png','mewo_idle.png','cat_orange_happy.png'],prop:'toy_ball.png',
      frames:['creía que ya sabía exactamente cómo eran sus noches.','Marie encontró otra forma de acomodarse. Tuluz inventó otro desastre. Mewo decidió mirar algo que nadie más vio.','me gusta que todavía podamos seguir conociéndolos ♡']
    },

    'act1-your-choices':{
      theme:'stay-choices',mark:'✧',
      cats:['mewo_idle.png','cat_gray_idle.png','cat_orange_idle.png'],prop:'aplique_estrella.png',
      frames:['este lugar ya no se ve exactamente como lo imaginé al principio.','hay un tulipán donde tú decidiste plantarlo, un detallito que tú escogiste y hasta una forma nueva en el cielo.','ahora este pequeño mundo también tiene decisiones tuyas dentro ♡']
    },

    'act1-one-more-while':{
      theme:'stay-more',mark:'☾',
      cats:['cat_gray_sleep.png','mewo_sleep.png','cat_orange_sleep.png'],prop:null,
      frames:['podríamos volver al campo ahora.','pero nadie tiene prisa.','cinco minutitos más siempre pueden convertirse en otro pequeño recuerdo ♡']
    },

    'act1-meaning-stay':{
      theme:'stay-finale',mark:'♡',
      cats:['cat_gray_idle.png','mewo_idle.png','cat_orange_idle.png'],prop:null,
      frames:['al principio pensé que quedarse significaba simplemente no irse.','después entendí que también es volver y encontrar algo un poquito diferente.','reconocer lo que sigue aquí.','y aun así querer descubrir qué viene después contigo ♡']
    },

    'act1-again-from-start':{
      theme:'warm-restart',mark:'↺',
      cats:['mewo_idle.png'],prop:null,
      frames:['por un momento intenté recordar cómo se veía todo al principio.','solo había tulipanes, una luna y un montón de espacio esperando algo.','si tuviera que empezar otra vez, volvería a querer descubrirlo contigo ♡']
    },

    'act1-what-changed':{
      theme:'warm-changed',mark:'✦',
      cats:['cat_gray_idle.png','mewo_idle.png','cat_orange_idle.png'],prop:null,
      frames:['el campo sigue siendo enorme.','pero ahora conozco lugares a los que quiero volver.','supongo que un mundo cambia mucho cuando empiezas a tener recuerdos dentro de él ♡']
    },

    'act1-what-remains':{
      theme:'warm-remains',mark:'⌂',
      cats:[],prop:'aplique_huella.png',
      frames:['algunas cosas duraron segundos. otras se quedaron durante muchas noches.','una luz, una huella, una flor, una almohadita.','me gusta que tantas cositas sigan esperándonos cuando volvemos ♡']
    },

    'act1-whole-night':{
      theme:'warm-night',mark:'☾',
      cats:['cat_gray_sleep.png','mewo_sleep.png','cat_orange_sleep.png'],prop:null,
      frames:['caminamos bastante esta noche.','hubo juegos, cielo, lluvia de estrellas y un regreso a casa.','esta vez el recuerdo no fue un momento... fue toda la noche ♡']
    },

    'act1-sky-we-made':{
      theme:'warm-stars',mark:'✦',
      cats:[],prop:'aplique_estrella.png',
      frames:['había miles de estrellas antes de que llegáramos.','pero ahora hay una pequeña forma que no estaba allí.','me gusta que hasta el cielo tenga algo elegido por ti ♡']
    },

    'act1-where-began':{
      theme:'warm-tulip',mark:'✿',
      cats:[],prop:null,
      frames:['volví al lugar donde todo empezó.','cuesta imaginar este mundo sin refugio, huellitas ni gatos corriendo por todas partes.','todo esto empezó con un solo tulipán ♡']
    },

    'act1-they-grew-too':{
      theme:'warm-cats',mark:'🐾',
      cats:['cat_gray_happy.png','mewo_happy.png','cat_orange_happy.png'],prop:'toy_ball.png',
      frames:['Mewo ya no está sola.','Marie tiene un rincón. Tuluz tiene demasiados juguetes >w<','creo que ellos también fueron construyendo este lugar mientras nosotros mirábamos ♡']
    },

    'act1-this-little-world':{
      theme:'warm-world',mark:'◇',
      cats:['cat_gray_idle.png','mewo_idle.png','cat_orange_idle.png'],prop:null,
      frames:['el campo. la luna. la lluvia. el Claro.','las flores, los juguetes y tres pequeñas vidas corriendo por aquí.','ya no parecen cosas separadas... ahora todo esto se siente como un mismo pequeño mundo ♡']
    },

    'act1-tomorrow-too':{
      theme:'warm-tomorrow',mark:'☀',
      cats:['mewo_idle.png'],prop:null,
      frames:['me gusta todo lo que ya ocurrió aquí.','pero también me gusta que todavía podamos volver mañana.','quizá el próximo recuerdo todavía ni siquiera sabe que va a existir ♡']
    },

    'act1-everything-kept':{
      theme:'warm-final',mark:'♡',
      cats:['cat_gray_idle.png','mewo_happy.png','cat_orange_idle.png'],prop:null,
      frames:[
        'quise llenar este lugar de cosas que pudieran recordarme cuánto te quiero.',
        'y terminó lleno de noches, huellitas, flores, juegos, pequeñas decisiones y lugares a los que aprendimos a volver.',
        'no porque todo tuviera que ser importante...',
        'sino porque lo vivimos contigo aquí.',
        'todo lo que guardamos ♡'
      ]
    }
  };

  function ensure(){
    if(layer) return;

    layer=document.createElement('div');
    layer.id='act1Cinematic';
    layer.setAttribute('aria-hidden','true');
    layer.innerHTML=`
      <div class="act1CineAtmosphere">
        <span></span><span></span><span></span><span></span><span></span><span></span>
      </div>

      <div class="act1CineStage">
        <div id="act1CineVisual">
          <div id="act1CineCats"></div>
          <img id="act1CineProp" alt="">
          <div id="act1CineFlower"><i></i><i></i><i></i></div>
          <div id="act1CineLantern">✦</div>
        </div>

        <span id="act1CineMark">♡</span>
        <p id="act1CineText"></p>
      </div>

      <button id="act1CineContinue" type="button">guardar carta ♡</button>
    `;

    document.body.appendChild(layer);

    document.getElementById('act1CineContinue')?.addEventListener('click',finish);
  }

  function queued(id){
    return current===id || QUEUE.includes(id);
  }

  /*
    Guardado robusto:
    usa la API normal y después VERIFICA localStorage.
    Si por cualquier motivo la API no guardó, lo hace
    directamente y refresca la Canasta.
  */
  function forceCollect(id){
    if(!id) return false;

    try{
      window
        .ParadoxLetters
        ?.collect
        ?.(id,false);
    }catch(_){}

    let list=[];

    try{
      const raw=
        localStorage.getItem(
          'paradox143_letters_v1'
        );

      const parsed=
        raw
          ? JSON.parse(raw)
          : [];

      list=
        Array.isArray(parsed)
          ? parsed
          : [];
    }catch(_){
      list=[];
    }

    if(!list.includes(id)){
      list.push(id);

      try{
        localStorage.setItem(
          'paradox143_letters_v1',
          JSON.stringify(list)
        );
      }catch(_){}

      try{
        window.dispatchEvent(
          new CustomEvent(
            'paradox-letter-collected',
            {
              detail:{
                id,
                wasNew:true,
                repaired:true
              }
            }
          )
        );
      }catch(_){}
    }

    try{
      window
        .ParadoxLetters
        ?.refresh
        ?.();

      window
        .ParadoxBasket2
        ?.refresh
        ?.();
    }catch(_){}

    return true;
  }

  function enqueue(id){
    if(!SCENES[id] || queued(id)) return false;
    QUEUE.push(id);
    playNext();
    return true;
  }

  function playNext(){
    if(current || !QUEUE.length) return;

    /*
      No ponemos una cinematográfica detrás de una carta
      que todavía se está leyendo.
    */
    if(
      document.getElementById('letterReader')
        ?.classList.contains('show')
    ){
      setTimeout(playNext,700);
      return;
    }

    start(QUEUE.shift());
  }

  function start(id){
    const scene=SCENES[id];
    if(!scene) return;

    ensure();
    current=id;

    clearTimeout(frameTimer);
    clearTimeout(readyTimer);

    document.body.classList.add('act1-cinematic-open');

    layer.dataset.theme=scene.theme;
    layer.classList.add('show');
    layer.setAttribute('aria-hidden','false');

    const mark=document.getElementById('act1CineMark');
    const text=document.getElementById('act1CineText');
    const cats=document.getElementById('act1CineCats');
    const prop=document.getElementById('act1CineProp');
    const cont=document.getElementById('act1CineContinue');

    mark.textContent=scene.mark;
    cats.innerHTML=(scene.cats||[]).map((src,i)=>`<img src="${src}" alt="" style="--i:${i}">`).join('');

    if(scene.prop){
      prop.src=scene.prop;
      prop.classList.add('show');
    }else{
      prop.removeAttribute('src');
      prop.classList.remove('show');
    }

    cont.classList.remove('ready');

    let i=0;
    const showFrame=()=>{
      if(current!==id) return;

      text.classList.remove('visible');
      void text.offsetWidth;
      text.textContent=scene.frames[i];
      text.classList.add('visible');
      i++;

      if(i<scene.frames.length){
        frameTimer=setTimeout(showFrame,3100);
      }else{
        readyTimer=setTimeout(()=>cont.classList.add('ready'),1900);
      }
    };

    setTimeout(showFrame,650);
  }

  function finish(){
    if(!current) return;

    const finished=current;
    current=null;

    clearTimeout(frameTimer);
    clearTimeout(readyTimer);

    layer?.classList.remove('show');
    layer?.setAttribute('aria-hidden','true');
    document.body.classList.remove('act1-cinematic-open');

    /*
      CORRECCIÓN IMPORTANTE:
      al pulsar "guardar carta ♡" la carta se añade AHORA
      MISMO a paradox143_letters_v1 mediante la API oficial
      de letters.js. Por eso el contador 53/79 sí aumenta.
    */
    forceCollect(
      finished
    );

    try{
      window.dispatchEvent(
        new CustomEvent(
          'paradox-act1-cinematic-finished',
          {detail:{id:finished}}
        )
      );
    }catch(_){}

    /*
      Después de guardarla la abrimos para que pueda leerse.
      Ya aparece como guardada, sin segundo botón ni patita.
    */
    setTimeout(()=>{
      try{
        window.ParadoxLetters?.open?.(finished,false);
      }catch(_){}
    },240);

    setTimeout(playNext,900);
  }

  window.addEventListener(
    'paradox-act1-earned',
    event=>{
      const id=event.detail?.id;
      enqueue(id);
    }
  );

  /*
    RECUPERACIÓN:
    Si con el parche anterior una cinematográfica ya ocurrió
    pero su carta quedó en "earned" sin entrar al contador,
    la detectamos y la volvemos a presentar una sola vez.
  */
  function recoverPendingCinematics(){
    try{
      const life=
        JSON.parse(
          localStorage.getItem(
            'paradox143_act1_life_v1'
          ) || '{}'
        );

      const letters=
        new Set(
          JSON.parse(
            localStorage.getItem(
              'paradox143_letters_v1'
            ) || '[]'
          )
        );

      const earned=
        Array.isArray(life.earned)
          ? life.earned
          : [];

      earned.forEach(id=>{
        if(
          SCENES[id] &&
          !letters.has(id)
        ){
          enqueue(id);
        }
      });
    }catch(_){}
  }

  setTimeout(
    recoverPendingCinematics,
    2600
  );

  window.ParadoxAct1Cinematics={
    play:enqueue,
    scenes:Object.keys(SCENES),
    recover:recoverPendingCinematics,
    isRunning:()=>Boolean(current),
    forceCollect
  };
})();
