/* =========================================================
   PARADOX143 — ACTO I · ETAPA 3
   "EL MUNDO CRECE"
   Cartas 68–79
========================================================= */
(() => {
  'use strict';

  const KEY='paradox143_act1_growth_v1';
  const LETTER_KEY='paradox143_letters_v1';
  const LIFE_KEY='paradox143_act1_life_v1';
  const FAMILY_KEY='paradox143_refuge_family_v1';

  const STAGE2=[
    'act1-tuluz-treasure','act1-marie-guide','act1-mewo-awake','act1-star-home',
    'act1-yarn-trail','act1-rain-rescue','act1-tall-tulips','act1-midnight-flower',
    'act1-two-paths','act1-cat-picnic','act1-our-charm','act1-little-adventures'
  ];

  const IDS=[
    'act1-new-nook','act1-second-pillow','act1-toy-box','act1-water-bowl',
    'act1-marie-place','act1-tuluz-place','act1-mewo-place','act1-flowers-grew',
    'act1-home-light','act1-night-home','act1-look-grown','act1-here-we-live'
  ];

  const DEFAULT={
    nook:false,pillow2:false,toyBox:false,water:false,
    mariePlace:false,tuluzPlace:false,mewoPlace:false,
    flowers:false,lantern:false,night:false,look:false,finale:false,
    visits:0,fieldTravel:0,lastWorldX:null,flowerReadyAt:0,lastGrowthAt:0
  };

  let garden=null, layer=null, active=null, scheduler=0, fieldTimer=0, visitTimer=0;

  function readJSON(key,fallback){
    try{const raw=localStorage.getItem(key); if(!raw) return fallback; const x=JSON.parse(raw); return x&&typeof x==='object'?x:fallback;}catch(_){return fallback;}
  }
  function writeJSON(key,value){try{localStorage.setItem(key,JSON.stringify(value));}catch(_){}}
  function state(){return {...DEFAULT,...readJSON(KEY,{})};}
  function save(patch={}){const next={...state(),...patch}; writeJSON(KEY,next); renderPermanent(); return next;}
  function collected(){try{const a=JSON.parse(localStorage.getItem(LETTER_KEY)||'[]'); return new Set(Array.isArray(a)?a:[]);}catch(_){return new Set();}}
  function count(ids){const h=collected(); return ids.filter(id=>h.has(id)).length;}
  function unlocked(){return count(STAGE2)>=5;}
  function family(){return {grayArrived:false,orangeArrived:false,...readJSON(FAMILY_KEY,{})};}
  function catsReady(){const f=family(); return !!(f.grayArrived&&f.orangeArrived);}
  function life(){return readJSON(LIFE_KEY,{});}
  function world(){try{return Number(worldX)||0;}catch(_){return 0;}}
  function isGardenOpen(){garden=garden||document.getElementById('catGarden'); return !!(garden&&garden.classList.contains('show'));}
  function busy(){return !!(active||document.body.classList.contains('intro-active')||document.body.classList.contains('basket2-open')||document.body.classList.contains('refuge-arrival-event-open')||document.body.classList.contains('act1-adventure-open')||document.body.classList.contains('act1-cinematic-open')||document.getElementById('letterReader')?.classList.contains('show')||document.getElementById('basket2Reader')?.classList.contains('show')||document.getElementById('gameOverlay')?.classList.contains('show')||document.getElementById('catCraftOverlay')?.classList.contains('show'));}
  function safeGarden(){return unlocked()&&isGardenOpen()&&catsReady()&&!busy();}
  function safeField(){return unlocked()&&!isGardenOpen()&&!busy();}

  function earn(id,{quiet=false}={}){
    if(!IDS.includes(id)||collected().has(id)) return;
    if(window.ParadoxAct1Life?.earn){window.ParadoxAct1Life.earn(id,{quiet});}
  }

  function forceCollectGrowth(id){
    if(!id) return false;

    try{
      window
        .ParadoxAct1Cinematics
        ?.forceCollect
        ?.(id);

      if(
        window
          .ParadoxLetters
          ?.has
          ?.(id)
      ){
        return true;
      }
    }catch(_){}

    try{
      window
        .ParadoxLetters
        ?.collect
        ?.(id,false);
    }catch(_){}

    let arr=[];

    try{
      arr=
        JSON.parse(
          localStorage.getItem(
            LETTER_KEY
          ) || '[]'
        );

      if(!Array.isArray(arr)){
        arr=[];
      }
    }catch(_){
      arr=[];
    }

    if(!arr.includes(id)){
      arr.push(id);

      try{
        localStorage.setItem(
          LETTER_KEY,
          JSON.stringify(arr)
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
  function whisper(text,duration=3000){
    ensureDOM(); const el=document.getElementById('act1GrowthWhisper'); if(!el) return;
    el.textContent=text; el.classList.remove('show'); void el.offsetWidth; el.classList.add('show');
    clearTimeout(Number(el.dataset.timer||0)); el.dataset.timer=String(setTimeout(()=>el.classList.remove('show'),duration));
  }
  function begin(name){if(active||busy()) return false; active=name; document.body.classList.add('act1-growth-open'); save({lastGrowthAt:Date.now()}); return true;}
  function end(){active=null; document.body.classList.remove('act1-growth-open'); document.querySelectorAll('.act1GrowthTemp').forEach(el=>el.remove()); garden?.classList.remove('growth-marie-scene','growth-tuluz-scene','growth-mewo-scene','growth-night-scene'); schedule();}

  function ensureDOM(){
    if(layer) return;
    layer=document.createElement('div'); layer.id='act1GrowthLayer';
    layer.innerHTML=`
      <div id="act1GrowthWhisper" aria-live="polite"></div>
      <div id="act1GrowthGarden"></div>
      <div id="act1GrowthField"></div>
      <div id="act1GrowthCinema" aria-hidden="true">
        <div class="growthCinemaGlow"></div>
        <div class="growthCinemaHome">
          <div class="growthCinemaCats">
            <img src="mewo_idle.png" alt=""><img src="cat_gray_idle.png" alt=""><img src="cat_orange_idle.png" alt="">
          </div>
          <span id="growthCinemaMark">⌂</span><p id="growthCinemaText"></p>
        </div>
        <button id="growthCinemaClose" type="button">volver ♡</button>
      </div>`;
    document.body.appendChild(layer);
    document.getElementById('growthCinemaClose')?.addEventListener('click',()=>{
      const cinema=document.getElementById('act1GrowthCinema');
      const letterId=cinema?.dataset?.letterId||'';

      cinema?.classList.remove('show');

      /*
        Las cinematográficas 78/79 ahora se guardan aquí mismo.
        Así el contador aumenta de inmediato y no dependen
        de otro botón flotante ni de un segundo guardado.
      */
      if(letterId){
        forceCollectGrowth(
          letterId
        );

        setTimeout(()=>{
          try{
            window.ParadoxLetters?.open?.(letterId,false);
          }catch(_){}
        },220);

        delete cinema.dataset.letterId;
      }

      end();
    });
  }

  function renderPermanent(){
    garden=garden||document.getElementById('catGarden'); if(!garden) return;
    const s=state(); let root=document.getElementById('act1GrowthPermanent');
    if(!root){root=document.createElement('div'); root.id='act1GrowthPermanent'; root.setAttribute('aria-hidden','true'); garden.appendChild(root);}
    root.innerHTML=`
      ${s.nook?`<div class="growthNook"><span class="growthNookStar">✦</span><i></i><i></i><i></i></div>`:''}
      ${s.pillow2?`<div class="growthPillow2"><img src="pillow_base_square.png" alt=""></div>`:''}
      ${s.toyBox?`<div class="growthToyBox"><b></b><img src="toy_ball.png" alt=""><img src="toy_fish.png" alt=""><img src="toy_yarn.png" alt=""></div>`:''}
      ${s.water?`<div class="growthWater"><img src="food_bowl.png" alt=""><span></span></div>`:''}
      ${s.mariePlace?`<div class="growthFavorite growthFavoriteMarie">♡</div>`:''}
      ${s.tuluzPlace?`<div class="growthFavorite growthFavoriteTuluz">✦</div>`:''}
      ${s.mewoPlace?`<div class="growthFavorite growthFavoriteMewo">🐾</div>`:''}
      ${s.lantern?`<div class="growthLantern"><span></span><i>✦</i></div>`:''}
    `;
    renderFieldFlowers();
  }

  function renderFieldFlowers(){
    ensureDOM(); const holder=document.getElementById('act1GrowthField'); if(!holder) return;
    let cluster=document.getElementById('growthFieldFlowers'); const s=state(), t=life().specialTulip;
    if(!s.flowers||!t){cluster?.remove(); return;}
    if(!cluster){cluster=document.createElement('button'); cluster.id='growthFieldFlowers'; cluster.type='button'; cluster.innerHTML='<i>❀</i><i>✿</i><i>❀</i>'; holder.appendChild(cluster); cluster.addEventListener('click',()=>whisper('siguen creciendo cerquita de nuestro tulipán ♡',2500));}
    const app=document.getElementById('app'); if(!app) return; const r=app.getBoundingClientRect(); const x=Number(t.anchorX||0)+world(), y=Number(t.yRatio||.68)*r.height;
    cluster.style.left=`${x}px`; cluster.style.top=`${y}px`; cluster.classList.toggle('show',safeField()&&x>-120&&x<r.width+120);
  }

  // 68 — nueva extensión
  function newNook(){
    const s=state(); if(s.nook||!safeGarden()||!begin('nook')) return false;
    const h=document.getElementById('act1GrowthGarden'); const door=document.createElement('button'); door.type='button'; door.className='growthNookDoor act1GrowthTemp'; door.innerHTML='<span>✦</span><small>...</small>'; h.appendChild(door);
    whisper('ese borde del Claro se ve diferente...',3300);
    door.addEventListener('click',()=>{door.classList.add('open'); setTimeout(()=>{save({nook:true}); earn('act1-new-nook'); whisper('había espacio detrás de las hojas ♡',3000); end();},900);},{once:true}); return true;
  }

  // 69 — almohada con 2 materiales, sin entrar al crafting grande
  function secondPillow(){
    const s=state(); if(!s.nook||s.pillow2||!safeGarden()||!begin('pillow2')) return false;
    const h=document.getElementById('act1GrowthGarden'); const box=document.createElement('div'); box.className='growthBuildPanel act1GrowthTemp'; box.innerHTML=`<p>quizá ya hace falta otra almohadita...</p><div><button data-m="cotton"><img src="material_algodon.png" alt=""><span>algodón</span></button><button data-m="fabric"><img src="material_tela.png" alt=""><span>tela</span></button></div><img class="growthBuildResult" src="pillow_base_square.png" alt="">`; h.appendChild(box);
    const used=new Set(); box.querySelectorAll('[data-m]').forEach(b=>b.addEventListener('click',()=>{b.classList.add('used'); used.add(b.dataset.m); if(used.size===2){box.classList.add('complete'); setTimeout(()=>{save({pillow2:true}); earn('act1-second-pillow'); whisper('ahora sí hay un poquito más de espacio para mimir ♡',3300); end();},1300);}})); return true;
  }

  // 70 — caja de juguetes
  function toyBox(){
    const s=state(); if(!s.pillow2||s.toyBox||!safeGarden()||!begin('toybox')) return false;
    const h=document.getElementById('act1GrowthGarden'); const game=document.createElement('div'); game.className='growthToySort act1GrowthTemp'; game.innerHTML=`<div class="growthToyCrate"><span>□</span></div><button><img src="toy_ball.png" alt=""></button><button><img src="toy_fish.png" alt=""></button><button><img src="toy_yarn.png" alt=""></button>`; h.appendChild(game); let n=0; game.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{if(b.classList.contains('put'))return;b.classList.add('put');n++;if(n===3){setTimeout(()=>{save({toyBox:true}); earn('act1-toy-box'); whisper('ordenado... por ahora >w<',2800); end();},1000);}})); return true;
  }

  // 71 — agua
  function waterBowl(){
    const s=state(); if(!s.toyBox||s.water||!safeGarden()||!begin('water')) return false;
    const h=document.getElementById('act1GrowthGarden'); const bowl=document.createElement('button'); bowl.type='button'; bowl.className='growthWaterQuest act1GrowthTemp'; bowl.innerHTML='<img src="food_bowl.png" alt=""><span></span><small>toca para dejarles agüita</small>'; h.appendChild(bowl); let taps=0; bowl.addEventListener('click',()=>{taps++;bowl.classList.add(`fill-${Math.min(3,taps)}`);if(taps>=3){setTimeout(()=>{save({water:true});earn('act1-water-bowl');whisper('listo ♡',2200);end();},800);}}); return true;
  }

  function settleMarie(){
    const s=state(); if(!s.pillow2||s.mariePlace||!safeGarden()||!begin('marieplace')) return false; const cat=document.getElementById('refugeGrayCat'); if(!cat){end();return false;}
    garden.classList.add('growth-marie-scene'); whisper('Marie parece haber elegido un lugar...',3100); const heart=document.createElement('button'); heart.type='button'; heart.className='growthNotice growthNoticeMarie act1GrowthTemp'; heart.textContent='♡'; document.getElementById('act1GrowthGarden').appendChild(heart); heart.addEventListener('click',()=>{save({mariePlace:true});earn('act1-marie-place');whisper('creo que desde ahora este es su lugar ♡',3100);setTimeout(end,1100);},{once:true}); return true;
  }

  function settleTuluz(){
    const s=state(); if(!s.toyBox||s.tuluzPlace||!safeGarden()||!begin('tuluzplace')) return false; const cat=document.getElementById('refugeOrangeCat'); if(!cat){end();return false;}
    garden.classList.add('growth-tuluz-scene'); whisper('Tuluz encontró el punto perfecto para vigilar sus juguetes >w<',3300); const mark=document.createElement('button'); mark.type='button'; mark.className='growthNotice growthNoticeTuluz act1GrowthTemp'; mark.textContent='✦'; document.getElementById('act1GrowthGarden').appendChild(mark); mark.addEventListener('click',()=>{save({tuluzPlace:true});earn('act1-tuluz-place');setTimeout(end,1000);},{once:true}); return true;
  }

  function settleMewo(){
    const s=state(); const mewo=document.getElementById('catGardenMewoSpot'); if(!s.water||s.mewoPlace||!safeGarden()||!mewo?.classList.contains('show')||!begin('mewoplace')) return false;
    garden.classList.add('growth-mewo-scene'); whisper('Mewo también encontró un lugar al que le gusta volver ♡',3300); const mark=document.createElement('button'); mark.type='button'; mark.className='growthNotice growthNoticeMewo act1GrowthTemp'; mark.textContent='🐾'; document.getElementById('act1GrowthGarden').appendChild(mark); mark.addEventListener('click',()=>{save({mewoPlace:true});earn('act1-mewo-place');setTimeout(end,1000);},{once:true}); return true;
  }

  // 75 — flores alrededor del tulipán permanente
  function flowersGrow(){
    const s=state(), t=life().specialTulip; if(s.flowers||!t||!safeField()||!begin('flowers')) return false;
    const h=document.getElementById('act1GrowthField'); const cluster=document.createElement('button'); cluster.type='button'; cluster.className='growthFlowerQuest act1GrowthTemp'; cluster.innerHTML='<i>❀</i><i>✿</i><i>❀</i>'; const app=document.getElementById('app'); if(!app){end();return false;} const r=app.getBoundingClientRect(); const x=Number(t.anchorX||0)+world(), y=Number(t.yRatio||.68)*r.height; cluster.style.left=`${Math.max(60,Math.min(r.width-60,x))}px`; cluster.style.top=`${y}px`; h.appendChild(cluster); whisper('¿nuestro tulipán siempre tuvo esas florecitas?',3300); cluster.addEventListener('click',()=>{cluster.classList.add('bloom');setTimeout(()=>{save({flowers:true});earn('act1-flowers-grew');whisper('crecieron solas ♡',2500);end();},900);},{once:true}); return true;
  }

  // 76 — luz
  function lantern(){
    const s=state(); if(!s.nook||s.lantern||growthCount()<4||!safeGarden()||!begin('lantern')) return false;
    const h=document.getElementById('act1GrowthGarden'); const lamp=document.createElement('button'); lamp.type='button'; lamp.className='growthLanternQuest act1GrowthTemp'; lamp.innerHTML='<span></span><i>✦</i><small>encender</small>'; h.appendChild(lamp); whisper('podríamos dejar una lucecita encendida aquí...',3200); lamp.addEventListener('click',()=>{lamp.classList.add('lit');setTimeout(()=>{save({lantern:true});earn('act1-home-light');whisper('así siempre habrá algo esperándonos cuando volvamos ♡',3500);end();},1200);},{once:true}); return true;
  }

  function growthCount(){const s=state();return [s.nook,s.pillow2,s.toyBox,s.water,s.mariePlace,s.tuluzPlace,s.mewoPlace,s.flowers,s.lantern].filter(Boolean).length;}

  // 77 — rutina nocturna sin minijuego
  function nightAtHome(){
    const s=state(); if(s.night||growthCount()<6||!safeGarden()||!begin('night')) return false;
    garden.classList.add('growth-night-scene'); const h=document.getElementById('act1GrowthGarden'); const note=document.createElement('div'); note.className='growthNightNote act1GrowthTemp'; h.appendChild(note);
    const frames=['primero comieron un poquito...','Tuluz encontró una razón para jugar otra vez >w<','Marie encontró su rincón...','Mewo comprobó que todos siguieran cerquita ♡','y sin hacer nada extraordinario... el refugio se quedó en silencio.']; let i=0;
    const show=()=>{note.textContent=frames[i++];note.classList.remove('show');void note.offsetWidth;note.classList.add('show');if(i<frames.length)setTimeout(show,2400);else setTimeout(()=>{save({night:true});earn('act1-night-home',{quiet:true});whisper('una noche cualquiera en casa ♡',3200);end();},3100);}; show(); return true;
  }

  // 78 — mirar atrás
  function lookBack(){
    const s=state(); if(!s.night||s.look||!safeGarden()||!begin('look')) return false;
    const c=document.getElementById('act1GrowthCinema'), text=document.getElementById('growthCinemaText'), mark=document.getElementById('growthCinemaMark'), close=document.getElementById('growthCinemaClose'); c.dataset.letterId='act1-look-grown'; c.classList.add('show'); close.textContent='guardar carta ♡'; close.classList.remove('ready');
    const frames=[['·','al principio este lugar estaba casi vacío...'],['zZ','después apareció una almohada.'],['✦','juguetes, luces y pequeños rincones.'],['🐾','Mewo, Marie y Tuluz encontraron lugares propios.'],['⌂','a veces solo notas cuánto creció algo cuando vuelves a mirar desde el principio ♡']]; let i=0;
    const show=()=>{mark.textContent=frames[i][0];text.classList.remove('visible');void text.offsetWidth;text.textContent=frames[i][1];text.classList.add('visible');i++;if(i<frames.length)setTimeout(show,2800);else setTimeout(()=>close.classList.add('ready'),2000);};
    save({look:true}); earn('act1-look-grown',{quiet:true}); show(); return true;
  }

  // 79 — cierre de la etapa
  function finale(){
    const s=state(); if(s.finale||count(IDS.slice(0,11))<8||busy()||!begin('finale')) return false;
    const c=document.getElementById('act1GrowthCinema'), text=document.getElementById('growthCinemaText'), mark=document.getElementById('growthCinemaMark'), close=document.getElementById('growthCinemaClose'); c.dataset.letterId='act1-here-we-live'; c.classList.add('show','finale'); close.textContent='guardar carta ♡'; close.classList.remove('ready');
    const frames=[['⌂','al principio solo encontramos un pequeño claro entre los árboles...'],['♡','después fuimos dejando cositas.'],['🐾','ellos también.'],['☾','y un día dejé de pensar que veníamos a visitar este lugar.'],['⌂','sentí que estábamos volviendo a casa ♡']]; let i=0;
    const show=()=>{mark.textContent=frames[i][0];text.classList.remove('visible');void text.offsetWidth;text.textContent=frames[i][1];text.classList.add('visible');i++;if(i<frames.length)setTimeout(show,3200);else setTimeout(()=>close.classList.add('ready'),2400);};
    save({finale:true}); earn('act1-here-we-live',{quiet:true}); show(); return true;
  }

  function chooseGarden(){
    if(!safeGarden()) return false; const s=state(), options=[];
    if(!s.nook) options.push(newNook,newNook);
    if(s.nook&&!s.pillow2) options.push(secondPillow);
    if(s.pillow2&&!s.toyBox) options.push(toyBox);
    if(s.toyBox&&!s.water) options.push(waterBowl);
    if(s.pillow2&&!s.mariePlace) options.push(settleMarie);
    if(s.toyBox&&!s.tuluzPlace) options.push(settleTuluz);
    if(s.water&&!s.mewoPlace) options.push(settleMewo);
    if(s.nook&&!s.lantern&&growthCount()>=4) options.push(lantern);
    if(!s.night&&growthCount()>=6) options.push(nightAtHome);
    if(s.night&&!s.look) options.push(lookBack);
    if(!options.length) return false; return options[Math.floor(Math.random()*options.length)]?.();
  }

  function schedule(){clearTimeout(scheduler);scheduler=setTimeout(()=>{if(!unlocked()||busy()){schedule();return;} if(isGardenOpen()) chooseGarden(); if(!active)schedule();},13000+Math.random()*10000);}

  function tickField(){
    const s=state(), wx=world(); if(!isGardenOpen()&&unlocked()){
      let travel=Number(s.fieldTravel||0); if(s.lastWorldX!==null) travel+=Math.min(220,Math.abs(wx-Number(s.lastWorldX||0))); save({fieldTravel:travel,lastWorldX:wx});
      const t=life().specialTulip; if(t&&!s.flowers&&travel>=2400&&!active&&safeField()&&Math.random()<.003) flowersGrow(); renderFieldFlowers();
      if(!state().finale&&count(IDS.slice(0,11))>=8&&!busy()) setTimeout(finale,700);
    }else save({lastWorldX:wx});
  }

  function onGardenOpen(){const s=state();save({visits:Number(s.visits||0)+1});renderPermanent(); if(unlocked())visitTimer=setTimeout(()=>{if(!active&&safeGarden())chooseGarden();},7000+Math.random()*5600); if(!state().finale&&count(IDS.slice(0,11))>=8)setTimeout(finale,4200);}
  function onGardenClose(){clearTimeout(visitTimer); if(active&&!document.getElementById('act1GrowthCinema')?.classList.contains('show'))end();}

  function init(){ensureDOM();garden=document.getElementById('catGarden');renderPermanent();window.addEventListener('paradox-cat-garden-open',onGardenOpen);window.addEventListener('paradox-cat-garden-close',onGardenClose);window.addEventListener('paradox-letter-collected',()=>setTimeout(()=>{if(!state().finale&&count(IDS.slice(0,11))>=8&&!busy())finale();},650));fieldTimer=setInterval(tickField,520);schedule();if(isGardenOpen())setTimeout(onGardenOpen,900);}

  const boot=setInterval(()=>{if(window.ParadoxAct1Life&&window.ParadoxAct1Adventures&&document.getElementById('app')){clearInterval(boot);init();}},350);

  window.ParadoxAct1Growth={getState:state,cards:[...IDS],play(name){return ({nook:newNook,pillow:secondPillow,toys:toyBox,water:waterBowl,marie:settleMarie,tuluz:settleTuluz,mewo:settleMewo,flowers:flowersGrow,lantern,night:nightAtHome,look:lookBack,finale})[name]?.();},reset(){localStorage.removeItem(KEY);const h=collected();IDS.forEach(id=>h.delete(id));localStorage.setItem(LETTER_KEY,JSON.stringify([...h]));location.reload();}};
})();
