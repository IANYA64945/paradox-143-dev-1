/* =========================================================
   CANASTA — ZONA DE PISTAS
   Pistas contextuales, indirectas, estilo guía.
========================================================= */
(() => {
  'use strict';
  const LETTER_KEY='paradox143_letters_v1';
  const LIFE_KEY='paradox143_act1_life_v1';
  const ADV_KEY='paradox143_act1_adventures_v1';
  const GROWTH_KEY='paradox143_act1_growth_v1';
  let hintIndex=0,lastPool=[];

  function json(key){try{return JSON.parse(localStorage.getItem(key)||'{}')||{};}catch(_){return {};}}
  function have(){try{const a=JSON.parse(localStorage.getItem(LETTER_KEY)||'[]');return new Set(Array.isArray(a)?a:[]);}catch(_){return new Set();}}
  function missing(set,id){return !set.has(id);}

  function pool(){
    const h=have(), l=json(LIFE_KEY), a=json(ADV_KEY), g=json(GROWTH_KEY), p=[];

    // Momentos 44–55
    if(missing(h,'act1-five-minutes')) p.push('Hay lugares que no esconden nada hasta que dejas de intentar encontrar algo y simplemente te quedas un rato.');
    if(missing(h,'act1-tuluz-ball')) p.push('Tuluz se mueve mucho, pero sus juguetes no siempre consiguen seguirle el ritmo. Mira bien el suelo del Claro.');
    if(missing(h,'act1-marie-trail')) p.push('Marie no suele dejar huellitas porque sí. Si ves una, quizá haya otra un poquito más adelante.');
    if(missing(h,'act1-fireflies')) p.push('Algunas lucecitas del Claro parecen demasiado bajas para ser estrellas.');
    if(missing(h,'act1-after-rain')) p.push('Cuando termina la lluvia no todo vuelve a la normalidad de inmediato. A veces el suelo guarda un poquito del cielo.');
    if(missing(h,'act1-save-toy')) p.push('Cuando llueve fuerte, quizá convenga mirar los bordes del refugio antes de acomodarse dentro.');
    if(missing(h,'act1-fallen-star')) p.push('El campo es infinito por una razón. Hay cosas que no caen cerca de donde empezaste.');
    if(missing(h,'act1-field-loop')&&h.has('act1-fallen-star')) p.push('Después de caminar muchísimo, algunos lugares empiezan a sentirse conocidos aunque jurarías no haber estado ahí.');
    if(missing(h,'act1-our-tulip')&&l.fallenStarDone&&l.fieldLoopDone) p.push('Ya recorriste bastante este campo. Quizá sea hora de dejar algo tuyo entre tantos tulipanes.');
    if(missing(h,'act1-three-sleep')) p.push('Los tres no siempre coinciden para dormir. Cuando ocurra, tal vez sea mejor no despertarlos demasiado rápido.');

    // Aventuras 56–67
    if(missing(h,'act1-tuluz-treasure')) p.push('Cuando Tuluz parece estar buscando algo, normalmente significa que él mismo lo perdió.');
    if(missing(h,'act1-marie-guide')) p.push('Marie camina despacio. Si alguna vez parece esperar que la sigas, no tengas prisa.');
    if(missing(h,'act1-mewo-awake')) p.push('A veces Mewo no necesita una sola cosa. Un poco de compañía puede tener muchas formas.');
    if(missing(h,'act1-star-home')) p.push('No todas las estrellas quieren quedarse en el campo. Algunas parecen estar intentando subir otra vez.');
    if(missing(h,'act1-yarn-trail')) p.push('Un ovillo ordenado es sospechoso cuando Tuluz anda cerca.');
    if(missing(h,'act1-rain-rescue')) p.push('Si la lluvia o la tormenta te encuentra dentro del Claro, revisa qué quedó afuera.');
    if(missing(h,'act1-tall-tulips')) p.push('Los tulipanes no tienen exactamente la misma altura en todos los rincones lejanos.');
    if(missing(h,'act1-midnight-flower')) p.push('Hay una flor que parece preferir las noches en las que el cielo está especialmente lleno de estrellas.');
    if(missing(h,'act1-two-paths')) p.push('Si Marie y Tuluz quieren ir en direcciones distintas, elegir uno no significa perder al otro.');
    if(missing(h,'act1-cat-picnic')) p.push('Tres gatitos, comida y juguetes. A veces no hace falta una ocasión especial para organizar algo pequeño.');
    if(missing(h,'act1-our-charm')) p.push('Después de varias aventuras, el refugio quizá esté listo para que elijas un detallito que se quede allí.');

    // Hogar 68–79
    if(missing(h,'act1-new-nook')) p.push('Ese borde del Claro parece menos cerrado de lo que era antes. Quizá las hojas estén escondiendo espacio, no un secreto.');
    if(missing(h,'act1-second-pillow')&&g.nook) p.push('Una sola almohada era suficiente cuando el refugio estaba más vacío. Ya no estoy tan seguro.');
    if(missing(h,'act1-toy-box')&&g.pillow2) p.push('Tuluz ha conseguido repartir sus juguetes por medio jardín. Tal vez deberían tener un sitio propio.');
    if(missing(h,'act1-water-bowl')&&g.toyBox) p.push('Hay comida en el refugio. Algo igual de sencillo todavía parece faltar cerca del comedero.');
    if(missing(h,'act1-marie-place')&&g.pillow2) p.push('Marie empieza a volver al mismo rincón con demasiada frecuencia para que sea casualidad.');
    if(missing(h,'act1-tuluz-place')&&g.toyBox) p.push('Si quisieras encontrar a Tuluz rápidamente, probablemente mirarías cerca de aquello con lo que puede jugar.');
    if(missing(h,'act1-mewo-place')&&g.water) p.push('Mewo puede ir y venir, pero incluso quien tiene todo el campo puede terminar teniendo un rincón favorito.');
    if(missing(h,'act1-flowers-grew')&&l.specialTulip) p.push('¿Hace cuánto no vuelves a mirar el tulipán que plantaste tú?');
    if(missing(h,'act1-home-light')&&g.nook) p.push('Un hogar se siente distinto cuando hay una lucecita encendida antes de que llegues.');
    if(missing(h,'act1-night-home')&&[g.nook,g.pillow2,g.toyBox,g.water,g.mariePlace,g.tuluzPlace,g.mewoPlace,g.flowers,g.lantern].filter(Boolean).length>=6) p.push('Tal vez ya construiste suficiente por hoy. Podrías quedarte en el refugio y ver cómo termina una noche normal.');
    if(missing(h,'act1-look-grown')&&g.night) p.push('Cuando ves un lugar todos los días es difícil notar cuánto cambió. A veces hay que mirarlo como si fuera la primera vez.');
    if(missing(h,'act1-here-we-live')&&h.size>=70) p.push('El Claro ya tiene muchas cosas. Quizá lo que falta no sea construir algo más, sino darte cuenta de qué se convirtió.');

    // Etapa 4 — Lo que significa quedarse
    const homeIds=[
      'act1-new-nook','act1-second-pillow','act1-toy-box','act1-water-bowl',
      'act1-marie-place','act1-tuluz-place','act1-mewo-place','act1-flowers-grew',
      'act1-home-light','act1-night-home','act1-look-grown','act1-here-we-live'
    ];

    const homeCount=homeIds.filter(id=>h.has(id)).length;

    if(homeCount>=5 || h.has('act1-here-we-live')){
      if(missing(h,'act1-place-return')) p.push('Quizá el siguiente recuerdo no esté escondido en algo nuevo. Prueba volver al Claro cuando ya sientas que conoces casi cada rincón.');
      if(missing(h,'act1-same-moon')&&h.has('act1-place-return')) p.push('El mirador no sirve solamente para dibujar estrellas. Algunas noches vale la pena mirar algo que siempre estuvo ahí.');
      if(missing(h,'act1-nothing-happens')&&h.has('act1-place-return')) p.push('Hay noches en las que el Claro no necesita una misión. Quédate sin buscar nada durante un poquito.');
      if(missing(h,'act1-things-stayed')&&h.has('act1-place-return')) p.push('La caja de madera guarda rastros de cosas que ya pasaron. Quizá abrirla ahora se sienta diferente.');
      if(missing(h,'act1-return-tulip')&&h.has('act1-place-return')) p.push('Entre miles de flores hay una cuyo lugar no decidió el mundo. Vuelve a buscarla.');
      if(missing(h,'act1-rain-stay')&&h.has('act1-place-return')) p.push('La próxima vez que llueva no corras a salvar nada. El mirador también sirve para escuchar.');
      if(missing(h,'act1-still-knowing-cats')&&h.has('act1-place-return')) p.push('Aunque creas conocer a los tres, observa lo que hacen cuando no les estás pidiendo nada.');
      if(missing(h,'act1-your-choices')&&h.has('act1-place-return')) p.push('Mira cuántas cosas de este mundo están exactamente donde están porque tú elegiste que estuvieran allí.');
      if(missing(h,'act1-one-more-while')&&h.has('act1-place-return')) p.push('Hay un lugar donde cinco minutitos más nunca parecen demasiado.');
      if(missing(h,'act1-meaning-stay')&&h.size>=85) p.push('Quizá quedarse no signifique estar quieto. Tal vez ya tienes suficientes recuerdos para entenderlo.');
    }

    // Etapa 5 — Todo lo que guardamos
    const stayIds=[
      'act1-place-return','act1-same-moon','act1-nothing-happens',
      'act1-things-stayed','act1-return-tulip','act1-rain-stay',
      'act1-still-knowing-cats','act1-your-choices','act1-one-more-while',
      'act1-meaning-stay'
    ];

    const stayCount=stayIds.filter(id=>h.has(id)).length;

    if(stayCount>=6 || h.has('act1-meaning-stay')){
      if(missing(h,'act1-again-from-start')) p.push('Cuando un lugar ya está lleno de recuerdos, a veces dan ganas de imaginar cómo se veía antes de tenerlos.');
      if(missing(h,'act1-what-changed')&&h.has('act1-again-from-start')) p.push('Camina otra vez por el campo. Quizá siga siendo el mismo y, al mismo tiempo, ya no lo sea.');
      if(missing(h,'act1-what-remains')&&h.has('act1-again-from-start')) p.push('La cajita no es la única cosa que guarda rastros. Mira también todo lo que quedó repartido por el Claro.');
      if(missing(h,'act1-whole-night')&&h.size>=92) p.push('No todos los recuerdos tienen que caber en unos segundos. Quédate hasta sentir que viviste una noche entera.');
      if(missing(h,'act1-sky-we-made')&&h.size>=92) p.push('El cielo tuvo estrellas desde el principio, pero quizá ahora haya una parte que se sienta un poquito más tuya.');
      if(missing(h,'act1-where-began')&&h.size>=93) p.push('Vuelve al campo y busca aquello que hizo que todo empezara a crecer.');
      if(missing(h,'act1-they-grew-too')&&h.size>=93) p.push('El refugio cambió mucho, pero no fue lo único. Mira a quienes viven dentro.');
      if(missing(h,'act1-this-little-world')&&h.size>=94) p.push('Prueba mirar el campo y el refugio como si no fueran dos lugares diferentes.');
      if(missing(h,'act1-tomorrow-too')&&h.size>=95) p.push('Recordar lo de ayer es bonito. Pensar que todavía puede existir mañana también.');
      if(missing(h,'act1-everything-kept')&&h.size>=97) p.push('Tal vez ya no falte encontrar nada. Quizá solo falta mirar todo junto una última vez por esta noche.');
    }

    // Cositas opcionales del mundo vivo (no dan cartas)
    if(h.size>=50){
      p.push('Hay un punto del Claro desde el que el cielo se ve especialmente bien. Con lluvia de estrellas quizá valga la pena quedarse allí un rato.');
    }

    if(h.size>=45){
      p.push('La pequeña caja de madera no parece esconder algo nuevo. Más bien parece guardar rastros de cosas que ya ocurrieron.');
    }

    // Si no hay nada disponible o todo está completo
    if(!p.length){
      if(h.size>=99) p.push('Por ahora el pequeño mundo está tranquilo. Parece feliz de tener todo esto guardado aquí ♡');
      else p.push('No todo aparece por hacer algo específico. Cambia de clima, visita el Claro, camina por el campo y vuelve otro día.');
    }
    return p;
  }

  function install(){
    const panel=document.getElementById('basket2Panel'); if(!panel||document.getElementById('basket2Hints')) return !!panel;
    const tabs=document.getElementById('basket2CategoryTabs'); if(!tabs) return false;
    const box=document.createElement('section'); box.id='basket2Hints'; box.innerHTML=`
      <button id="basket2HintsToggle" type="button" aria-expanded="false">
        <span>?</span><div><strong>PISTAS DEL PEQUEÑO MUNDO</strong><small>una ayudita sin decirte exactamente qué hacer</small></div><b>+</b>
      </button>
      <div id="basket2HintsBody" aria-hidden="true">
        <div class="basket2GuideMark">✦</div>
        <p id="basket2HintText"></p>
        <button id="basket2NextHint" type="button">otra pista</button>
      </div>`;
    panel.insertBefore(box,tabs);
    const toggle=document.getElementById('basket2HintsToggle'), body=document.getElementById('basket2HintsBody');
    toggle.addEventListener('click',()=>{const open=box.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));body.setAttribute('aria-hidden',String(!open));if(open)showHint(true);});
    document.getElementById('basket2NextHint').addEventListener('click',()=>showHint(false));
    return true;
  }

  function showHint(reset){
    const p=pool(); if(reset||JSON.stringify(p)!==JSON.stringify(lastPool)){hintIndex=0;lastPool=p;}
    const text=document.getElementById('basket2HintText'); if(!text)return; text.classList.remove('show');void text.offsetWidth;text.textContent=p[hintIndex%p.length];text.classList.add('show');hintIndex=(hintIndex+1)%p.length;
  }

  const boot=setInterval(()=>{if(install()){clearInterval(boot);}},250);
  window.addEventListener('paradox-letter-collected',()=>setTimeout(()=>{if(document.getElementById('basket2Hints')?.classList.contains('open'))showHint(true);},100));
})();
