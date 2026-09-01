/* =========================================================
   PARADOX143 — ACTO II · 7 FRAGMENTOS OCULTOS

   No son cartas.
   No aparecen en la Canasta.
   No existe contador visible.
   No hay pistas explícitas.
========================================================= */

(() => {
  'use strict';

  const KEY='paradox143_fragments_v1';
  const IDS=['before','first','keep','missing','marie','tuluz','remains'];

  let root=null;
  let hotspot=null;
  let active='';
  let dwellTimer=null;
  let lastChapter=-1;

  function parse(){
    try{
      const raw=localStorage.getItem(KEY);
      const v=raw?JSON.parse(raw):{};
      return {
        found:Array.isArray(v?.found)?v.found:[],
        starSeen:Boolean(v?.starSeen)
      };
    }catch(_){
      return {found:[],starSeen:false};
    }
  }

  function write(next){
    try{ localStorage.setItem(KEY,JSON.stringify(next)); }catch(_){}
    return next;
  }

  function has(id){ return parse().found.includes(id); }

  function collect(id){
    if(!IDS.includes(id)) return false;
    const st=parse();
    if(st.found.includes(id)) return false;
    st.found.push(id);
    write(st);
    window.ParadoxAct2?.render?.();
    try{ window.dispatchEvent(new CustomEvent('paradox-act2-fragment-found',{detail:{id}})); }catch(_){}
    return true;
  }

  function build(){
    if(root) return;
    root=document.getElementById('act2Root');
    if(!root) return;

    hotspot=document.createElement('button');
    hotspot.id='act2FragmentHotspot';
    hotspot.type='button';
    hotspot.setAttribute('aria-label','Algo apenas visible');
    hotspot.innerHTML='<span></span>';
    root.querySelector('#act2World')?.appendChild(hotspot);

    hotspot.addEventListener('click',()=>{
      const id=active;
      if(!id) return;
      hide();
      play(id);
    });
  }

  function show(id,x,y=58){
    build();
    if(!hotspot || has(id)) return;
    active=id;
    hotspot.dataset.fragment=id;
    hotspot.style.left=`calc(50% + ${x-(window.ParadoxAct2?.worldX?.()||0)}px)`;
    hotspot.style.top=`${y}%`;
    hotspot.classList.add('show');
  }

  function hide(){
    active='';
    hotspot?.classList.remove('show');
  }

  function evaluate(detail){
    if(!window.ParadoxAct2?.isActive?.()) return;
    build();
    const st=detail?.state || window.ParadoxAct2.state();
    const x=Number(detail?.x ?? st.worldX ?? 0);
    const ch=Number(detail?.chapter ?? st.chapter ?? 0);
    lastChapter=ch;

    hide();

    // I — ANTES: ir a propósito en dirección contraria al primer objetivo.
    if(!has('before') && ch<=1 && x<=-430){
      show('before',-575,50);
      return;
    }

    // II — LA PRIMERA: regresar un poco después de reconstruir el tulipán.
    if(!has('first') && st.firstTulip && ch>=2 && x>=280 && x<=520){
      show('first',430,61);
      return;
    }

    // III — GUARDAR: aparece discretamente en la caja del refugio.
    if(!has('keep') && st.refuge && ch>=4 && x>=-220 && x<=70){
      show('keep',-75,64);
      return;
    }

    // IV — LO QUE FALTA: requiere quedarse mirando un hueco.
    if(!has('missing') && st.marie && ch>=5 && x>=300 && x<=500){
      clearTimeout(dwellTimer);
      dwellTimer=setTimeout(()=>{
        if(lastChapter>=5 && !has('missing')) show('missing',415,53);
      },5200);
      return;
    }else{
      clearTimeout(dwellTimer);
    }

    // V — MARIE: volver a ella cuando su capítulo ya terminó.
    if(!has('marie') && st.marie && ch>=5 && x>=40 && x<=230){
      show('marie',135,63);
      return;
    }

    // VI — TULUZ: volver al lugar vacío donde el mundo lo buscó.
    if(!has('tuluz') && st.tuluz && ch>=6 && x>=500 && x<=720){
      show('tuluz',610,53);
      return;
    }

    // VII — LO QUE QUEDA: zona que queda sin reconstruir cerca del final.
    if(!has('remains') && ch>=7 && x<=-500){
      show('remains',-630,52);
    }
  }

  const SCENES={
    before:{theme:'fragment-before',mark:'·',frames:[
      {text:'El sonido desaparece antes que la imagen.',memory:'fragment-empty'},
      {text:'Por un instante ves el campo sin caminos.',memory:'fragment-before'},
      {text:'Sin refugio.',memory:'fragment-before'},
      {text:'Sin huellitas.',memory:'fragment-before'},
      {text:'Antes de recordarte...',memory:'fragment-before'},
      {text:'...también estaba vacío.',memory:'fragment-before'}
    ]},

    first:{theme:'fragment-first',mark:'✿',frames:[
      {text:'Una flor aparece antes de que el mundo termine de dibujarla.',memory:'fragment-tulip'},
      {text:'No era importante porque fuera la primera.',memory:'fragment-tulip'},
      {text:'Fue la primera porque alguien decidió que no quería perderla.',memory:'fragment-tulip'},
      {text:'Después vino todo lo demás.',memory:'fragment-tulip'}
    ]},

    keep:{theme:'fragment-keep',mark:'◇',frames:[
      {text:'La caja parece vacía.',memory:'fragment-box'},
      {text:'Pero en la oscuridad flotan cosas que conoces.',memory:'fragment-objects'},
      {text:'Una huella. Una estrella. Un hilo. Una flor.',memory:'fragment-objects'},
      {text:'Guardar todo parecía una forma de evitar perderlo.',memory:'fragment-objects'},
      {text:'Durante un tiempo... funcionó.',memory:'fragment-box'}
    ]},

    missing:{theme:'fragment-missing',mark:'□',frames:[
      {text:'El hueco intenta llenarse.',memory:'fragment-gap1'},
      {text:'Falla.',memory:'fragment-gap2'},
      {text:'Lo intenta de nuevo.',memory:'fragment-gap1'},
      {text:'Vuelve a fallar.',memory:'fragment-gap2'},
      {text:'Entonces deja de intentarlo.',memory:'fragment-gap3'},
      {text:'No todo espacio vacío significa que algo se perdió.',memory:'fragment-gap3'}
    ]},

    marie:{theme:'fragment-marie',mark:'☾',frames:[
      {text:'Marie no parece estar esperando nada.',cats:['cat_gray_idle.png'],memory:'fragment-marie'},
      {text:'Te mira igual.',cats:['cat_gray_idle.png'],memory:'fragment-marie'},
      {text:'Un recuerdo puede cambiar de forma.',cats:['cat_gray_happy.png'],memory:'fragment-marie'},
      {text:'Reconocerlo no siempre depende de que siga siendo idéntico.',cats:['cat_gray_happy.png'],memory:'fragment-marie'},
      {text:'Marie se acomoda a tu lado.',cats:['cat_gray_sleep.png'],memory:'fragment-marie'}
    ]},

    tuluz:{theme:'fragment-tuluz',mark:'✦',frames:[
      {text:'Aquí el mundo buscó durante mucho tiempo.',memory:'fragment-search'},
      {text:'No había nada que recuperar.',memory:'fragment-search'},
      {text:'No podía recordarlo.',memory:'fragment-search'},
      {text:'Y aun así estaba aquí.',cats:['cat_orange_idle.png'],memory:'fragment-future'},
      {text:'Tal vez pertenecer no siempre significa haber estado antes.',cats:['cat_orange_happy.png'],memory:'fragment-future'}
    ]},

    remains:{theme:'fragment-remains',mark:'✦',frames:[
      {text:'El mundo se mira a sí mismo como si fueran muchas noches superpuestas.',memory:'fragment-layers'},
      {text:'Ninguna coincide por completo con la anterior.',memory:'fragment-layers'},
      {text:'Y sin embargo todas se reconocen entre sí.',memory:'fragment-layers'},
      {text:'Quizá recordar nunca fue mantenerlo todo igual.',memory:'fragment-layers'},
      {text:'Quizá era saber por qué todavía queremos volver.',memory:'fragment-star'}
    ]}
  };

  function play(id){
    const scene=SCENES[id];
    if(!scene) return;
    window.ParadoxAct2?.suppressObjectives?.(true);
    window.ParadoxAct2?.playScene?.(scene,{onDone:()=>{
      collect(id);
      window.ParadoxAct2?.suppressObjectives?.(false);
      setTimeout(()=>window.ParadoxAct2?.setObjectiveForChapter?.(),500);
    }});
  }

  function onSecretStar(){
    const st=parse();
    if(st.found.length<7) return;
    window.ParadoxAct2?.suppressObjectives?.(true);
    window.ParadoxAct2?.playScene?.({
      theme:'fragment-star-secret',mark:'✦',frames:[
        {text:'La estrella no intenta mostrarte otro recuerdo.',memory:'fragment-star'},
        {text:'Ahora sabes.',memory:'fragment-star'}
      ]
    },{onDone:()=>{
      st.starSeen=true;
      write(st);
      window.ParadoxAct2?.render?.();
      window.ParadoxAct2?.suppressObjectives?.(false);
    }});
  }

  window.addEventListener('paradox-act2-world-position',e=>evaluate(e.detail));
  window.addEventListener('paradox-act2-memory-restored',()=>setTimeout(()=>evaluate({state:window.ParadoxAct2?.state?.()}),550));
  window.addEventListener('paradox-act2-secret-star-click',onSecretStar);

  document.addEventListener('DOMContentLoaded',()=>setTimeout(build,700));

  window.ParadoxAct2Fragments={
    found:()=>[...parse().found],
    has,
    collect,
    play,
    reset(){ try{ localStorage.removeItem(KEY); }catch(_){} window.ParadoxAct2?.render?.(); }
  };
})();
