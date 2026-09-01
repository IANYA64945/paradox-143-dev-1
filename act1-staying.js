/* =========================================================
   PARADOX143 — ACTO I · ETAPA 4
   "LO QUE SIGNIFICA QUEDARSE"

   Cartas 80–89.
   Todas son cinematográficas.
   Sin minijuegos normales.
   Sin azar.
========================================================= */

(() => {
  'use strict';

  const LETTER_KEY='paradox143_letters_v1';
  const LIFE_KEY='paradox143_act1_life_v1';
  const ADV_KEY='paradox143_act1_adventures_v1';
  const HABITS_KEY='paradox143_world_habits_v1';
  const FAMILY_KEY='paradox143_refuge_family_v1';

  const HOME_IDS=[
    'act1-new-nook','act1-second-pillow','act1-toy-box','act1-water-bowl',
    'act1-marie-place','act1-tuluz-place','act1-mewo-place','act1-flowers-grew',
    'act1-home-light','act1-night-home','act1-look-grown','act1-here-we-live'
  ];

  const STAY_IDS=[
    'act1-place-return','act1-same-moon','act1-nothing-happens',
    'act1-things-stayed','act1-return-tulip','act1-rain-stay',
    'act1-still-knowing-cats','act1-your-choices','act1-one-more-while',
    'act1-meaning-stay'
  ];

  const FIRST_NINE=STAY_IDS.slice(0,9);

  const META={
    'act1-place-return':{zone:'garden',icon:'⌂',label:'algo aquí se siente diferente...'},
    'act1-same-moon':{zone:'lookout',icon:'☾',label:'la luna parece especialmente quieta'},
    'act1-nothing-happens':{zone:'garden',icon:'·',label:'por un momento no está pasando nada'},
    'act1-things-stayed':{zone:'box',icon:'◇',label:'la cajita se siente diferente'},
    'act1-return-tulip':{zone:'field',icon:'✿',label:'hay una flor que ya conoces'},
    'act1-rain-stay':{zone:'lookout',icon:'◇',label:'esta vez no hace falta correr'},
    'act1-still-knowing-cats':{zone:'cats',icon:'🐾',label:'los tres están haciendo de las suyas'},
    'act1-your-choices':{zone:'garden',icon:'✧',label:'hay varias cositas aquí que tú elegiste'},
    'act1-one-more-while':{zone:'lookout',icon:'☾',label:'quizá podamos quedarnos un ratito más'},
    'act1-meaning-stay':{zone:'final',icon:'♡',label:'algo importante quiere quedarse contigo'}
  };

  let cue=null;
  let currentCue='';
  let garden=null;
  let quietSince=Date.now();

  function json(key,fallback={}){
    try{
      const raw=localStorage.getItem(key);
      if(!raw) return fallback;
      const parsed=JSON.parse(raw);
      return parsed && typeof parsed==='object' ? parsed : fallback;
    }catch(_){
      return fallback;
    }
  }

  function have(){
    try{
      const raw=localStorage.getItem(LETTER_KEY);
      const arr=raw?JSON.parse(raw):[];
      return new Set(Array.isArray(arr)?arr:[]);
    }catch(_){
      return new Set();
    }
  }

  function missing(id){ return !have().has(id); }
  function count(ids){ const h=have(); return ids.filter(id=>h.has(id)).length; }

  function stageUnlocked(){
    return count(HOME_IDS)>=5 || have().has('act1-here-we-live');
  }

  function isGardenOpen(){
    garden=garden||document.getElementById('catGarden');
    return Boolean(garden&&garden.classList.contains('show'));
  }

  function familyReady(){
    const f={grayArrived:false,orangeArrived:false,...json(FAMILY_KEY,{})};
    return Boolean(f.grayArrived&&f.orangeArrived);
  }

  function weather(){
    return window.MAGIC_AMBIENT_ACTIVE || garden?.dataset?.weather || '';
  }

  function busy(){
    return Boolean(
      document.body.classList.contains('intro-active') ||
      document.body.classList.contains('basket2-open') ||
      document.body.classList.contains('refuge-arrival-event-open') ||
      document.body.classList.contains('act1-adventure-open') ||
      document.body.classList.contains('act1-growth-open') ||
      document.body.classList.contains('act1-cinematic-open') ||
      document.body.classList.contains('act1-constellation-open') ||
      document.getElementById('letterReader')?.classList.contains('show') ||
      document.getElementById('basket2Reader')?.classList.contains('show') ||
      document.getElementById('gameOverlay')?.classList.contains('show')
    );
  }

  function ensureCue(){
    if(cue) return;

    cue=document.createElement('button');
    cue.id='act1StayingCue';
    cue.type='button';
    cue.innerHTML='<span id="act1StayingCueIcon">♡</span><small id="act1StayingCueText"></small>';
    document.body.appendChild(cue);

    cue.addEventListener('click',()=>{
      if(!currentCue) return;
      const id=currentCue;
      hideCue();
      quietSince=Date.now();
      window.ParadoxAct1Cinematics?.play?.(id);
    });
  }

  function showCue(id){
    ensureCue();
    const meta=META[id];
    if(!meta) return;

    currentCue=id;
    cue.dataset.zone=meta.zone;
    document.getElementById('act1StayingCueIcon').textContent=meta.icon;
    document.getElementById('act1StayingCueText').textContent=meta.label;
    cue.classList.add('show');
  }

  function hideCue(){
    ensureCue();
    cue.classList.remove('show');
    currentCue='';
  }

  function nextEligible(){
    if(!stageUnlocked() || busy()) return '';

    const h=have();
    const life=json(LIFE_KEY,{});
    const adv=json(ADV_KEY,{});
    const habits=json(HABITS_KEY,{});

    if(missing('act1-place-return') && isGardenOpen())
      return 'act1-place-return';

    if(!h.has('act1-place-return'))
      return '';

    if(
      missing('act1-same-moon') &&
      isGardenOpen() &&
      Number(habits.lookoutVisits||0)>=1
    ) return 'act1-same-moon';

    if(
      missing('act1-nothing-happens') &&
      isGardenOpen() &&
      Date.now()-quietSince>=18000
    ) return 'act1-nothing-happens';

    if(
      missing('act1-things-stayed') &&
      isGardenOpen() &&
      Number(habits.boxOpened||0)>=1
    ) return 'act1-things-stayed';

    if(
      missing('act1-return-tulip') &&
      !isGardenOpen() &&
      Boolean(life.specialTulip || h.has('act1-our-tulip'))
    ) return 'act1-return-tulip';

    if(
      missing('act1-rain-stay') &&
      isGardenOpen() &&
      ['rain','storm'].includes(weather())
    ) return 'act1-rain-stay';

    if(
      missing('act1-still-knowing-cats') &&
      isGardenOpen() &&
      familyReady() &&
      count(STAY_IDS.slice(0,6))>=2
    ) return 'act1-still-knowing-cats';

    if(
      missing('act1-your-choices') &&
      isGardenOpen() &&
      count(STAY_IDS.slice(0,7))>=3 &&
      Boolean(life.specialTulip || adv.charm || habits.constellation)
    ) return 'act1-your-choices';

    if(
      missing('act1-one-more-while') &&
      isGardenOpen() &&
      count(STAY_IDS.slice(0,8))>=4 &&
      Number(habits.lookoutVisits||0)>=1
    ) return 'act1-one-more-while';

    if(
      missing('act1-meaning-stay') &&
      isGardenOpen() &&
      count(FIRST_NINE)>=6
    ) return 'act1-meaning-stay';

    return '';
  }

  function tick(){
    if(!stageUnlocked() || busy()){
      hideCue();
      return;
    }

    const id=nextEligible();
    if(id) showCue(id);
    else hideCue();
  }

  function resetQuiet(){
    quietSince=Date.now();
  }

  function init(){
    ensureCue();
    garden=document.getElementById('catGarden');

    window.addEventListener('paradox-cat-garden-open',()=>{
      resetQuiet();
      setTimeout(tick,1200);
    });

    window.addEventListener('paradox-cat-garden-close',()=>{
      resetQuiet();
      setTimeout(tick,800);
    });

    window.addEventListener('paradox-letter-collected',()=>{
      resetQuiet();
      setTimeout(tick,900);
    });

    document.addEventListener(
      'pointerdown',
      event=>{
        if(event.target?.closest?.('#act1StayingCue')) return;

        if(isGardenOpen() && !busy()){
          quietSince=Date.now();
        }
      },
      {capture:true,passive:true}
    );

    setInterval(tick,1700);
    setTimeout(tick,1800);
  }

  const boot=setInterval(()=>{
    if(
      window.ParadoxAct1Cinematics &&
      document.getElementById('catGarden')
    ){
      clearInterval(boot);
      init();
    }
  },350);

  window.ParadoxAct1Staying={
    cards:[...STAY_IDS],
    next:nextEligible,
    refresh:tick
  };
})();
