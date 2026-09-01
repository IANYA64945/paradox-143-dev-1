/* =====================================================
   PARADOX143 — MINIJUEGO PRINCIPAL V2
   Corazón + pétalos de luz

   Objetivos V2:
   - 4 fases distintas
   - ataques con aviso previo
   - patrones variados
   - partículas y transiciones
   - dificultad más justa en celular
   - recompensa visual al sobrevivir
===================================================== */


/* =====================================================
   CONFIGURACIÓN
===================================================== */

const GAME_V2_DURATION = 30;

const GAME_V2_PHASES = [
  {
    start:0,
    end:7.5,
    name:'LLUVIA DE PÉTALOS',
    hint:'Mira arriba ♡',
    interval:.66
  },
  {
    start:7.5,
    end:15,
    name:'VIENTO CRUZADO',
    hint:'Los lados también despiertan.',
    interval:.57
  },
  {
    start:15,
    end:22.5,
    name:'PÉTALOS QUE TE BUSCAN',
    hint:'No te quedes quieta.',
    interval:.70
  },
  {
    start:22.5,
    end:30,
    name:'JARDÍN DE LUZ',
    hint:'Última fase. Sigue latiendo ♡',
    interval:.82
  }
];


let gameV2PhaseIndex = -1;
let gameV2AttackTimer = 0;
let gameV2TelegraphTimer = 0;
let gameV2Pattern = null;
let gameV2PatternUntil = 0;

let gameV2Particles = [];
let gameV2Warnings = [];
let gameV2Rings = [];

let gameV2ShakeUntil = 0;
let gameV2WinBurst = 0;


/* =====================================================
   UI V2 — SE CREA SIN TOCAR index.html
===================================================== */

const gamePhaseBanner =
  document.createElement('div');

gamePhaseBanner.id =
  'gamePhaseBanner';

gamePhaseBanner.innerHTML = `
  <strong id="gamePhaseBannerTitle">
    FASE 1
  </strong>

  <span id="gamePhaseBannerHint">
    prepárate...
  </span>
`;

gameOverlay.appendChild(
  gamePhaseBanner
);


const gameDamageFlash =
  document.createElement('div');

gameDamageFlash.id =
  'gameDamageFlash';

gameOverlay.appendChild(
  gameDamageFlash
);


const gameVictoryGlow =
  document.createElement('div');

gameVictoryGlow.id =
  'gameVictoryGlow';

gameOverlay.appendChild(
  gameVictoryGlow
);


/* =====================================================
   RECOMPENSAS DE MATERIALES — MINIJUEGO PRINCIPAL
===================================================== */

const gameMaterialReward=
  document.createElement('div');

gameMaterialReward.id=
  'gameMaterialReward';

gameMaterialReward.innerHTML=`
  <div class="gameMaterialRewardTitle">
    ✦ MATERIALES ENCONTRADOS
  </div>

  <div
    id="gameMaterialRewardItems"
    class="gameMaterialRewardItems"
  ></div>
`;

gameOverlay.appendChild(
  gameMaterialReward
);

const gameMaterialRewardItems=
  document.getElementById(
    'gameMaterialRewardItems'
  );

let gameMaterialRewardTimer=0;


const GAME_MATERIAL_DATA={
  cotton:{
    name:'Algodón',
    mark:'☁',
    src:'material_algodon.png'
  },

  fabric:{
    name:'Tela',
    mark:'▱',
    src:'material_tela.png'
  },

  paw:{
    name:'Huella',
    mark:'🐾',
    src:'aplique_huella.png'
  },

  star:{
    name:'Estrella',
    mark:'✦',
    src:'aplique_estrella.png'
  },

  moon:{
    name:'Luna',
    mark:'☾',
    src:'aplique_luna.png'
  },

  wood:{
    name:'Madera',
    mark:'▰',
    src:'material_madera.png'
  },

  rope:{
    name:'Cuerda',
    mark:'⌁',
    src:'material_cuerda.png'
  }
};


function addGameMaterial(
  type,
  amount=1
){

  const safeAmount=
    Math.max(
      0,
      Number(amount)||0
    );


  if(!safeAmount){
    return;
  }


  /*
    Camino normal: usar el módulo del taller.
  */
  if(
    window.ParadoxCatCrafting &&
    typeof window.ParadoxCatCrafting.addMaterial==='function'
  ){

    window.ParadoxCatCrafting.addMaterial(
      type,
      safeAmount
    );

    return;
  }


  /*
    Respaldo por si el módulo todavía no estuviera disponible.
  */
  try{

    const key=
      'paradox143_cat_inventory_v1';

    const raw=
      localStorage.getItem(
        key
      );

    const inv=
      raw
        ? JSON.parse(raw)
        : {};


    inv[type]=
      Number(inv[type]||0)+
      safeAmount;


    localStorage.setItem(
      key,
      JSON.stringify(inv)
    );


    window.dispatchEvent(
      new CustomEvent(
        'paradox-cat-inventory-change',
        {
          detail:inv
        }
      )
    );

  }

  catch(_){}
}


function randomRareMaterial(){

  const rare=[
    'paw',
    'star',
    'moon'
  ];


  return rare[
    Math.floor(
      Math.random()*
      rare.length
    )
  ];
}


function gardenAlreadyUnlocked(){

  try{

    return Boolean(
      window.ParadoxCatGarden
        ?.getState
        ?.()
        ?.unlocked
    );

  }

  catch(_){

    return false;
  }
}


function grantGameMaterialReward(
  win
){

  /*
    La fase alcanzada hace que incluso perder
    siga sintiéndose como progreso.

    FASE 1:
      1 algodón + 1 tela

    FASE 2:
      2 algodón + 1 tela

    FASE 3:
      2 algodón + 2 tela + 1 aplique

    FASE 4 / victoria:
      3 algodón + 2 tela + 1 aplique

    Victoria:
      +1 algodón +1 tela extra

    Jardín desbloqueado:
      pequeña posibilidad de madera/cuerda.
  */

  const reached=
    Math.max(
      1,
      Math.min(
        4,
        Number(gameV2PhaseIndex)+1
      )
    );


  const reward={};


  if(reached===1){

    reward.cotton=1;
    reward.fabric=1;
  }


  else if(reached===2){

    reward.cotton=2;
    reward.fabric=1;
  }


  else if(reached===3){

    reward.cotton=2;
    reward.fabric=2;
    reward[randomRareMaterial()]=1;
  }


  else{

    reward.cotton=3;
    reward.fabric=2;
    reward[randomRareMaterial()]=1;
  }


  if(win){

    reward.cotton=
      Number(reward.cotton||0)+1;

    reward.fabric=
      Number(reward.fabric||0)+1;
  }


  /*
    Después de desbloquear el Jardín,
    el mismo minijuego también puede ayudar
    con el rascador sin reemplazar la exploración.
  */
  if(
    gardenAlreadyUnlocked() &&
    reached>=3
  ){

    const buildMaterial=
      Math.random()<.56
        ? 'rope'
        : 'wood';


    reward[buildMaterial]=
      Number(
        reward[buildMaterial]||0
      )+1;
  }


  for(
    const [
      type,
      amount
    ]
    of Object.entries(
      reward
    )
  ){

    addGameMaterial(
      type,
      amount
    );
  }


  showGameMaterialReward(
    reward,
    win
  );


  try{

    window.ParadoxStats
      ?.inc
      ?.(
        'gameMaterialRewards'
      );

  }

  catch(_){}


  return reward;
}


function showGameMaterialReward(
  reward,
  win=false
){

  clearTimeout(
    gameMaterialRewardTimer
  );


  const entries=
    Object
      .entries(reward)
      .filter(
        ([,amount])=>
          Number(amount)>0
      );


  gameMaterialRewardItems.innerHTML=
    entries
      .map(
        ([type,amount])=>{

          const data=
            GAME_MATERIAL_DATA[type];


          if(!data){
            return '';
          }


          return `
            <div class="gameMaterialRewardItem">

              <img
                src="${data.src}"
                alt=""
              >

              <span>
                ${data.mark}
                ${data.name}
              </span>

              <strong>
                +${amount}
              </strong>

            </div>
          `;
        }
      )
      .join('');


  const title=
    gameMaterialReward
      .querySelector(
        '.gameMaterialRewardTitle'
      );


  if(title){

    title.textContent=
      win
        ? '✦ BONUS DE VICTORIA'
        : '✦ AUN PERDIENDO ENCONTRASTE';
  }


  gameMaterialReward.classList.remove(
    'show'
  );

  void gameMaterialReward.offsetWidth;

  gameMaterialReward.classList.add(
    'show'
  );


  gameMaterialRewardTimer=
    setTimeout(
      ()=>{

        gameMaterialReward
          .classList
          .remove(
            'show'
          );

      },
      5200
    );
}


/* =====================================================
   CARTA EXTRA AL PERDER
===================================================== */

const loseLetterBtn=
  document.createElement('button');

loseLetterBtn.id=
  'loseLetterBtn';

loseLetterBtn.type='button';
loseLetterBtn.className='gameBtn';
loseLetterBtn.textContent='Abrir cartita ♡';

losePanel.insertBefore(
  loseLetterBtn,
  leaveGameBtn
);

loseLetterBtn.addEventListener(
  'click',
  ()=>{

    if(
      window.ParadoxLetters &&
      window.ParadoxLetters.open
    ){
      window.ParadoxLetters.open(
        'game-lost',
        true
      );
    }
  }
);


function showPhaseBanner(
  phase,
  data
){

  const title =
    document.getElementById(
      'gamePhaseBannerTitle'
    );

  const hint =
    document.getElementById(
      'gamePhaseBannerHint'
    );


  title.textContent =
    `FASE ${phase} — ${data.name}`;

  hint.textContent =
    data.hint;


  gamePhaseBanner.classList.remove(
    'show'
  );

  void gamePhaseBanner.offsetWidth;

  gamePhaseBanner.classList.add(
    'show'
  );
}


function flashDamage(){

  gameDamageFlash.classList.remove(
    'show'
  );

  void gameDamageFlash.offsetWidth;

  gameDamageFlash.classList.add(
    'show'
  );
}


function flashVictory(){

  gameVictoryGlow.classList.remove(
    'show'
  );

  void gameVictoryGlow.offsetWidth;

  gameVictoryGlow.classList.add(
    'show'
  );
}


/* =====================================================
   TAMAÑO / ARENA
===================================================== */

function resizeGame(){

  gameW =
    window.innerWidth;

  gameH =
    window.innerHeight;

  gameDPR =
    Math.min(
      window.devicePixelRatio || 1,
      window.innerWidth < 600
        ? 1.45
        : 1.65
    );


  gameCanvas.width =
    Math.max(
      1,
      Math.round(
        gameW * gameDPR
      )
    );

  gameCanvas.height =
    Math.max(
      1,
      Math.round(
        gameH * gameDPR
      )
    );


  gameCanvas.style.width =
    gameW + 'px';

  gameCanvas.style.height =
    gameH + 'px';


  gctx.setTransform(
    gameDPR,
    0,
    0,
    gameDPR,
    0,
    0
  );


  const portrait =
    gameH > gameW;


  arena =
    portrait
      ? {
          x:gameW*.075,
          y:gameH*.19,
          w:gameW*.85,
          h:gameH*.64
        }
      : {
          x:gameW*.17,
          y:gameH*.15,
          w:gameW*.66,
          h:gameH*.70
        };


  heart.r =
    clamp(
      Math.min(
        gameW,
        gameH
      )*.020,
      8,
      11
    );


  /*
    Un poco más rápido en táctil,
    porque el dedo ya ocupa parte de la pantalla.
  */

  heart.speed =
    gameW < 700
      ? 325
      : 295;


  if(!gameRunning){

    heart.x =
      arena.x +
      arena.w*.5;

    heart.y =
      arena.y +
      arena.h*.72;
  }


  clampHeart();
}


function clampHeart(){

  heart.x =
    clamp(
      heart.x,
      arena.x + heart.r,
      arena.x + arena.w - heart.r
    );

  heart.y =
    clamp(
      heart.y,
      arena.y + heart.r,
      arena.y + arena.h - heart.r
    );
}


/* =====================================================
   REINICIO
===================================================== */

function resetGame(){

  resizeGame();

  gameHP = 3;

  gameProjectiles = [];

  gameV2Particles = [];
  gameV2Warnings = [];
  gameV2Rings = [];

  gameInvulnUntil = 0;

  gameSpawn = 0;

  gameV2PhaseIndex = -1;
  gameV2AttackTimer = 0;
  gameV2TelegraphTimer = 0;
  gameV2Pattern = null;
  gameV2PatternUntil = 0;
  gameV2ShakeUntil = 0;
  gameV2WinBurst = 0;

  gameMaterialReward.classList.remove(
    'show'
  );

  clearTimeout(
    gameMaterialRewardTimer
  );


  heart.x =
    arena.x +
    arena.w*.5;

  heart.y =
    arena.y +
    arena.h*.72;


  updateGameHud(
    1,
    GAME_V2_DURATION
  );
}


function startPetalGame(){

  challengePanel.classList.add(
    'hidden'
  );

  losePanel.classList.add(
    'hidden'
  );

  finalLetter.classList.remove(
    'show'
  );

  gameCanvas.classList.add(
    'show'
  );

  gameHud.classList.add(
    'show'
  );


  resetGame();


  gameRunning = true;

  gameStart =
    performance.now();

  gameLast =
    gameStart;


  showPhaseBanner(
    1,
    GAME_V2_PHASES[0]
  );


  gameRAF =
    requestAnimationFrame(
      gameLoop
    );
}


startGameBtn.addEventListener(
  'click',
  startPetalGame
);

retryGameBtn.addEventListener(
  'click',
  startPetalGame
);

playAgainBtn.addEventListener(
  'click',
  startPetalGame
);


/* =====================================================
   HUD
===================================================== */

function updateGameHud(
  phase,
  seconds
){

  phaseText.textContent =
    'FASE ' + phase;


  livesCover.style.width =
    (
      (3-gameHP)/3*100
    ) + '%';


  timeText.textContent =
    Math.max(
      0,
      Math.ceil(seconds)
    ) + ' s';
}


/* =====================================================
   PARTÍCULAS
===================================================== */

function makeParticle(
  x,
  y,
  options={}
){

  const angle =
    options.angle ??
    Math.random()*
    Math.PI*2;

  const speed =
    options.speed ??
    (
      35+
      Math.random()*75
    );


  gameV2Particles.push({
    x,
    y,

    vx:
      Math.cos(angle)*
      speed,

    vy:
      Math.sin(angle)*
      speed,

    life:
      options.life ??
      (
        .45+
        Math.random()*.45
      ),

    maxLife:
      options.life ??
      (
        .45+
        Math.random()*.45
      ),

    size:
      options.size ??
      (
        2+
        Math.random()*3
      ),

    type:
      options.type ??
      'spark'
  });
}


function burstParticles(
  x,
  y,
  amount=12,
  type='spark'
){

  for(
    let i=0;
    i<amount;
    i++
  ){

    makeParticle(
      x,
      y,
      {
        type,
        speed:
          40+
          Math.random()*110,

        life:
          .45+
          Math.random()*.50
      }
    );
  }
}


function updateParticles(
  dt
){

  for(
    let i=
      gameV2Particles.length-1;
    i>=0;
    i--
  ){

    const p =
      gameV2Particles[i];


    p.life -= dt;

    p.x +=
      p.vx*dt;

    p.y +=
      p.vy*dt;


    p.vx *=
      .985;

    p.vy *=
      .985;


    if(
      p.type==='petal'
    ){

      p.vy +=
        32*dt;
    }


    if(
      p.life<=0
    ){

      gameV2Particles.splice(
        i,
        1
      );
    }
  }
}


function drawParticles(){

  for(
    const p
    of gameV2Particles
  ){

    const alpha =
      clamp(
        p.life/
        p.maxLife,
        0,
        1
      );


    gctx.save();

    gctx.globalAlpha =
      alpha;


    if(
      p.type==='petal'
    ){

      gctx.translate(
        p.x,
        p.y
      );

      gctx.rotate(
        p.x*.035+
        p.y*.018
      );

      gctx.fillStyle =
        'rgba(255,156,204,.95)';

      gctx.beginPath();

      gctx.ellipse(
        0,
        0,
        p.size*.7,
        p.size*1.6,
        0,
        0,
        Math.PI*2
      );

      gctx.fill();
    }

    else{

      gctx.fillStyle =
        'rgba(255,231,174,.96)';

      gctx.shadowColor =
        'rgba(255,174,218,.9)';

      gctx.shadowBlur =
        8;

      gctx.fillRect(
        p.x-p.size*.5,
        p.y-p.size*.5,
        p.size,
        p.size
      );
    }


    gctx.restore();
  }
}


/* =====================================================
   AVISOS / TELEGRAPHS
===================================================== */

function addWarning(
  data
){

  gameV2Warnings.push({
    ...data,
    life:
      data.life ?? .75,
    maxLife:
      data.life ?? .75
  });
}


function updateWarnings(
  dt
){

  for(
    let i=
      gameV2Warnings.length-1;
    i>=0;
    i--
  ){

    const w =
      gameV2Warnings[i];


    w.life -= dt;


    if(
      w.life<=0
    ){

      gameV2Warnings.splice(
        i,
        1
      );
    }
  }
}


function drawWarnings(){

  for(
    const w
    of gameV2Warnings
  ){

    const t =
      1-
      w.life/
      w.maxLife;


    const pulse =
      .42+
      Math.sin(
        t*Math.PI*8
      )*.18;


    gctx.save();

    gctx.globalAlpha =
      clamp(
        pulse,
        .18,
        .72
      );

    gctx.strokeStyle =
      'rgba(255,204,227,.94)';

    gctx.lineWidth =
      2;


    if(
      w.type==='vertical'
    ){

      gctx.fillStyle =
        'rgba(255,126,186,.10)';

      gctx.fillRect(
        w.x-w.w*.5,
        arena.y,
        w.w,
        arena.h
      );

      gctx.strokeRect(
        w.x-w.w*.5,
        arena.y,
        w.w,
        arena.h
      );
    }


    else if(
      w.type==='horizontal'
    ){

      gctx.fillStyle =
        'rgba(255,126,186,.10)';

      gctx.fillRect(
        arena.x,
        w.y-w.h*.5,
        arena.w,
        w.h
      );

      gctx.strokeRect(
        arena.x,
        w.y-w.h*.5,
        arena.w,
        w.h
      );
    }


    else if(
      w.type==='target'
    ){

      const r =
        20+
        t*10;


      gctx.beginPath();

      gctx.arc(
        w.x,
        w.y,
        r,
        0,
        Math.PI*2
      );

      gctx.stroke();


      gctx.beginPath();

      gctx.arc(
        w.x,
        w.y,
        r*.45,
        0,
        Math.PI*2
      );

      gctx.stroke();
    }


    else if(
      w.type==='edge'
    ){

      gctx.fillStyle =
        'rgba(255,185,216,.14)';


      if(w.edge==='left'){

        gctx.fillRect(
          arena.x,
          arena.y,
          18,
          arena.h
        );
      }


      else if(
        w.edge==='right'
      ){

        gctx.fillRect(
          arena.x+
          arena.w-18,
          arena.y,
          18,
          arena.h
        );
      }


      else if(
        w.edge==='top'
      ){

        gctx.fillRect(
          arena.x,
          arena.y,
          arena.w,
          18
        );
      }


      else{

        gctx.fillRect(
          arena.x,
          arena.y+
          arena.h-18,
          arena.w,
          18
        );
      }
    }


    gctx.restore();
  }
}


/* =====================================================
   CORAZÓN
===================================================== */

function drawHeart(
  x,
  y,
  r,
  alpha=1
){

  gctx.save();

  gctx.globalAlpha =
    alpha;

  gctx.imageSmoothingEnabled =
    false;


  if(
    playerHeartImg.complete &&
    playerHeartImg.naturalWidth
  ){

    const size =
      r*5.2;


    gctx.globalCompositeOperation =
      'screen';


    gctx.drawImage(
      playerHeartImg,
      x-size*.5,
      y-size*.5,
      size,
      size
    );


    gctx.globalCompositeOperation =
      'source-over';
  }

  else{

    gctx.fillStyle =
      '#f39ae4';


    const p =
      Math.max(
        2,
        Math.round(
          r*.42
        )
      );


    const cells=[
      [-2,-2],[-1,-3],[0,-2],[1,-3],[2,-2],
      [-3,-1],[-2,-1],[-1,-1],[0,-1],[1,-1],[2,-1],[3,-1],
      [-2,0],[-1,0],[0,0],[1,0],[2,0],
      [-1,1],[0,1],[1,1],[0,2]
    ];


    cells.forEach(
      ([cx,cy])=>
        gctx.fillRect(
          Math.round(
            x+cx*p
          ),
          Math.round(
            y+cy*p
          ),
          p,
          p
        )
    );
  }


  gctx.restore();
}


/* =====================================================
   PÉTALOS / PROYECTILES
===================================================== */

function createProjectile(
  x,
  y,
  vx,
  vy,
  options={}
){

  gameProjectiles.push({
    x,
    y,
    vx,
    vy,

    r:
      options.r ??
      7,

    rot:
      options.rot ??
      Math.random()*
      Math.PI,

    spin:
      options.spin ??
      (
        Math.random()-.5
      )*4,

    kind:
      options.kind ??
      'petal',

    age:0,

    wobble:
      options.wobble ??
      Math.random()*
      Math.PI*2,

    curve:
      options.curve ??
      0,

    source:
      options.source ??
      ''
  });
}


function drawPetal(
  p
){

  gctx.save();

  gctx.translate(
    p.x,
    p.y
  );

  gctx.rotate(
    p.rot
  );


  if(
    p.kind==='gold'
  ){

    gctx.fillStyle =
      'rgba(255,224,146,.95)';

    gctx.shadowColor =
      'rgba(255,225,137,.92)';
  }

  else if(
    p.kind==='blue'
  ){

    gctx.fillStyle =
      'rgba(183,216,255,.94)';

    gctx.shadowColor =
      'rgba(176,203,255,.86)';
  }

  else{

    gctx.fillStyle =
      'rgba(255,150,194,.92)';

    gctx.shadowColor =
      'rgba(255,130,186,.95)';
  }


  gctx.shadowBlur =
    12;


  gctx.beginPath();

  gctx.ellipse(
    0,
    0,
    p.r*.62,
    p.r*1.25,
    0,
    0,
    Math.PI*2
  );

  gctx.fill();


  if(
    p.kind==='gold'
  ){

    gctx.globalAlpha =
      .48;

    gctx.fillStyle =
      '#fff4ca';

    gctx.fillRect(
      -1,
      -p.r*.65,
      2,
      p.r
    );
  }


  gctx.restore();
}


/* =====================================================
   MARCO PIXEL
===================================================== */

function pixelTone(i){

  const tones=[
    '#ffd0ee',
    '#f4afd9',
    '#eb8fca',
    '#d977b7'
  ];


  return tones[
    Math.abs(i)%
    tones.length
  ];
}


function drawTinyPixelHeart(
  cx,
  cy,
  px
){

  const shape=[
    [-2,-1],[-1,-2],[0,-1],[1,-2],[2,-1],
    [-3,0],[-2,0],[-1,0],[0,0],[1,0],[2,0],[3,0],
    [-2,1],[-1,1],[0,1],[1,1],[2,1],
    [-1,2],[0,2],[1,2],[0,3]
  ];


  gctx.fillStyle =
    '#f5abd9';


  shape.forEach(
    ([x,y])=>
      gctx.fillRect(
        Math.round(
          cx+x*px
        ),
        Math.round(
          cy+y*px
        ),
        px,
        px
      )
  );
}


function drawPixelArenaFrame(){

  gctx.save();

  gctx.imageSmoothingEnabled =
    false;


  const px =
    clamp(
      Math.floor(
        Math.min(
          gameW,
          gameH
        )/130
      ),
      3,
      6
    );


  const step =
    px;


  const x0 =
    Math.round(
      arena.x/px
    )*px;

  const y0 =
    Math.round(
      arena.y/px
    )*px;

  const x1 =
    Math.round(
      (
        arena.x+
        arena.w
      )/px
    )*px;

  const y1 =
    Math.round(
      (
        arena.y+
        arena.h
      )/px
    )*px;


  let k=0;


  for(
    let x=x0;
    x<=x1;
    x+=step
  ){

    gctx.fillStyle =
      pixelTone(
        k++
      );

    gctx.fillRect(
      x,
      y0,
      px,
      px
    );

    gctx.fillRect(
      x,
      y0+px,
      px,
      px
    );


    gctx.fillStyle =
      pixelTone(
        k+2
      );

    gctx.fillRect(
      x,
      y1-px,
      px,
      px
    );

    gctx.fillRect(
      x,
      y1,
      px,
      px
    );
  }


  for(
    let y=y0;
    y<=y1;
    y+=step
  ){

    gctx.fillStyle =
      pixelTone(
        k++
      );

    gctx.fillRect(
      x0,
      y,
      px,
      px
    );

    gctx.fillRect(
      x0+px,
      y,
      px,
      px
    );


    gctx.fillStyle =
      pixelTone(
        k+1
      );

    gctx.fillRect(
      x1-px,
      y,
      px,
      px
    );

    gctx.fillRect(
      x1,
      y,
      px,
      px
    );
  }


  const hp =
    Math.max(
      2,
      px-1
    );


  drawTinyPixelHeart(
    x0+px*.5,
    y0+arena.h*.34,
    hp
  );

  drawTinyPixelHeart(
    x0+px*.5,
    y0+arena.h*.68,
    hp
  );

  drawTinyPixelHeart(
    x0+arena.w*.78,
    y1-px*.5,
    hp
  );


  gctx.restore();
}


/* =====================================================
   ATAQUES V2
===================================================== */

function attackRain(){

  const lanes =
    3+
    Math.floor(
      Math.random()*3
    );


  const laneW =
    arena.w/lanes;


  for(
    let i=0;
    i<lanes;
    i++
  ){

    const x =
      arena.x+
      laneW*(i+.5)+
      (
        Math.random()-.5
      )*laneW*.25;


    addWarning({
      type:'vertical',
      x,
      w:
        Math.max(
          20,
          laneW*.34
        ),
      life:.62
    });


    setTimeout(
      ()=>{

        if(!gameRunning){
          return;
        }


        const amount =
          gameW<600
            ? 4
            : 5;


        for(
          let j=0;
          j<amount;
          j++
        ){

          createProjectile(
            x+
            (
              Math.random()-.5
            )*laneW*.20,
            arena.y-18-j*28,

            (
              Math.random()-.5
            )*24,

            120+
            Math.random()*30,

            {
              r:
                6+
                Math.random()*2,

              curve:
                (
                  Math.random()-.5
                )*12
            }
          );
        }

      },
      560
    );
  }
}


function attackSideWave(){

  const fromLeft =
    Math.random()<.5;


  const edge =
    fromLeft
      ? 'left'
      : 'right';


  addWarning({
    type:'edge',
    edge,
    life:.66
  });


  setTimeout(
    ()=>{

      if(!gameRunning){
        return;
      }


      const rows =
        gameW<600
          ? 6
          : 8;


      const gapIndex =
        Math.floor(
          Math.random()*rows
        );


      for(
        let i=0;
        i<rows;
        i++
      ){

        if(
          Math.abs(
            i-gapIndex
          )<=0
        ){
          continue;
        }


        const y =
          arena.y+
          (
            i+.5
          )*
          arena.h/
          rows;


        createProjectile(
          fromLeft
            ? arena.x-22
            : arena.x+
              arena.w+
              22,

          y,

          (
            fromLeft
              ? 1
              : -1
          )*
          (
            145+
            Math.random()*24
          ),

          (
            Math.random()-.5
          )*18,

          {
            r:7,
            kind:
              i%3===0
                ? 'blue'
                : 'petal'
          }
        );
      }

    },
    590
  );
}


function attackTargeted(){

  const targetX =
    heart.x;

  const targetY =
    heart.y;


  addWarning({
    type:'target',
    x:targetX,
    y:targetY,
    life:.72
  });


  setTimeout(
    ()=>{

      if(!gameRunning){
        return;
      }


      const amount =
        gameW<600
          ? 6
          : 8;


      for(
        let i=0;
        i<amount;
        i++
      ){

        const angle =
          Math.PI*2*
          i/amount+
          Math.random()*.12;


        const distance =
          Math.max(
            arena.w,
            arena.h
          )*.64;


        const x =
          targetX+
          Math.cos(angle)*
          distance;

        const y =
          targetY+
          Math.sin(angle)*
          distance;


        const dx =
          targetX-x;

        const dy =
          targetY-y;

        const len =
          Math.hypot(
            dx,
            dy
          ) || 1;


        createProjectile(
          x,
          y,

          dx/len*165,
          dy/len*165,

          {
            r:7,
            kind:
              i%2
                ? 'petal'
                : 'blue'
          }
        );
      }

    },
    660
  );
}


function attackCross(){

  const horizontal =
    Math.random()<.5;


  const gapSize =
    Math.max(
      72,
      (
        horizontal
          ? arena.w
          : arena.h
      )*.20
    );


  const gapCenter =
    horizontal
      ? arena.x+
        arena.w*
        (
          .25+
          Math.random()*.5
        )

      : arena.y+
        arena.h*
        (
          .25+
          Math.random()*.5
        );


  if(horizontal){

    addWarning({
      type:'horizontal',
      y:
        arena.y+
        arena.h*.5,
      h:30,
      life:.68
    });
  }

  else{

    addWarning({
      type:'vertical',
      x:
        arena.x+
        arena.w*.5,
      w:30,
      life:.68
    });
  }


  setTimeout(
    ()=>{

      if(!gameRunning){
        return;
      }


      const count =
        horizontal
          ? 14
          : 12;


      for(
        let i=0;
        i<count;
        i++
      ){

        if(horizontal){

          const x =
            arena.x+
            arena.w*
            i/
            (
              count-1
            );


          if(
            Math.abs(
              x-gapCenter
            )<
            gapSize*.5
          ){
            continue;
          }


          const fromTop =
            i%2===0;


          createProjectile(
            x,
            fromTop
              ? arena.y-20
              : arena.y+
                arena.h+
                20,

            (
              Math.random()-.5
            )*15,

            fromTop
              ? 175
              : -175,

            {
              r:7,
              kind:'gold'
            }
          );
        }

        else{

          const y =
            arena.y+
            arena.h*
            i/
            (
              count-1
            );


          if(
            Math.abs(
              y-gapCenter
            )<
            gapSize*.5
          ){
            continue;
          }


          const fromLeft =
            i%2===0;


          createProjectile(
            fromLeft
              ? arena.x-20
              : arena.x+
                arena.w+
                20,

            y,

            fromLeft
              ? 180
              : -180,

            (
              Math.random()-.5
            )*15,

            {
              r:7,
              kind:'gold'
            }
          );
        }
      }

    },
    620
  );
}


function attackGarden(){

  const centerX =
    arena.x+
    arena.w*
    (
      .30+
      Math.random()*.40
    );

  const centerY =
    arena.y+
    arena.h*
    (
      .30+
      Math.random()*.40
    );


  addWarning({
    type:'target',
    x:centerX,
    y:centerY,
    life:.72
  });


  setTimeout(
    ()=>{

      if(!gameRunning){
        return;
      }


      const petals =
        gameW<600
          ? 10
          : 13;


      for(
        let i=0;
        i<petals;
        i++
      ){

        const angle =
          Math.PI*2*
          i/
          petals;


        const speed =
          92+
          (
            i%3
          )*24;


        createProjectile(
          centerX,
          centerY,

          Math.cos(angle)*
          speed,

          Math.sin(angle)*
          speed,

          {
            r:
              i%4===0
                ? 8
                : 6.5,

            kind:
              i%4===0
                ? 'gold'
                : 'petal',

            curve:
              (
                i%2
                  ? 1
                  : -1
              )*24
          }
        );
      }


      burstParticles(
        centerX,
        centerY,
        16,
        'spark'
      );

    },
    650
  );
}


function chooseAttack(
  phaseIndex
){

  const phase =
    phaseIndex+1;


  if(phase===1){

    attackRain();

    return;
  }


  if(phase===2){

    if(
      Math.random()<.55
    ){

      attackSideWave();
    }

    else{

      attackRain();
    }

    return;
  }


  if(phase===3){

    if(
      Math.random()<.58
    ){

      attackTargeted();
    }

    else{

      attackCross();
    }

    return;
  }


  const roll =
    Math.random();


  if(roll<.34){

    attackGarden();
  }

  else if(roll<.67){

    attackCross();
  }

  else{

    attackTargeted();
  }
}


/* =====================================================
   ACTUALIZACIÓN DE PROYECTILES
===================================================== */

function updateProjectiles(
  dt,
  now
){

  for(
    let i=
      gameProjectiles.length-1;
    i>=0;
    i--
  ){

    const p =
      gameProjectiles[i];


    p.age += dt;


    if(p.curve){

      const len =
        Math.hypot(
          p.vx,
          p.vy
        ) || 1;


      const nx =
        -p.vy/
        len;

      const ny =
        p.vx/
        len;


      p.vx +=
        nx*
        p.curve*
        dt;

      p.vy +=
        ny*
        p.curve*
        dt;
    }


    p.x +=
      p.vx*dt;

    p.y +=
      p.vy*dt;

    p.rot +=
      p.spin*dt;


    if(
      p.x<
        arena.x-100 ||
      p.x>
        arena.x+
        arena.w+
        100 ||
      p.y<
        arena.y-100 ||
      p.y>
        arena.y+
        arena.h+
        100
    ){

      gameProjectiles.splice(
        i,
        1
      );

      continue;
    }


    if(
      now>
        gameInvulnUntil &&
      Math.hypot(
        p.x-heart.x,
        p.y-heart.y
      )<
      p.r+
      heart.r*.72
    ){

      gameHP--;

      gameInvulnUntil =
        now+1200;


      burstParticles(
        heart.x,
        heart.y,
        16,
        'petal'
      );


      gameV2ShakeUntil =
        now+260;


      flashDamage();


      gameProjectiles.splice(
        i,
        1
      );


      if(gameHP<=0){

        finishGame(
          false
        );

        return false;
      }
    }
  }


  return true;
}


/* =====================================================
   CAMBIO DE FASE
===================================================== */

function getPhaseIndex(
  elapsed
){

  for(
    let i=0;
    i<GAME_V2_PHASES.length;
    i++
  ){

    if(
      elapsed<
      GAME_V2_PHASES[i].end
    ){

      return i;
    }
  }


  return (
    GAME_V2_PHASES.length-1
  );
}


function onPhaseChanged(
  nextIndex
){

  gameV2PhaseIndex =
    nextIndex;

  gameV2AttackTimer =
    .45;


  gameProjectiles =
    gameProjectiles.filter(
      p=>
        p.age<2.4
    );


  const data =
    GAME_V2_PHASES[
      nextIndex
    ];


  showPhaseBanner(
    nextIndex+1,
    data
  );


  for(
    let i=0;
    i<18;
    i++
  ){

    const side =
      Math.floor(
        Math.random()*4
      );


    let x,y;


    if(side===0){

      x =
        arena.x+
        Math.random()*
        arena.w;

      y =
        arena.y;
    }

    else if(side===1){

      x =
        arena.x+
        Math.random()*
        arena.w;

      y =
        arena.y+
        arena.h;
    }

    else if(side===2){

      x =
        arena.x;

      y =
        arena.y+
        Math.random()*
        arena.h;
    }

    else{

      x =
        arena.x+
        arena.w;

      y =
        arena.y+
        Math.random()*
        arena.h;
    }


    makeParticle(
      x,
      y,
      {
        type:'spark',
        speed:
          24+
          Math.random()*65,
        life:.75
      }
    );
  }
}


/* =====================================================
   DIBUJO DEL FONDO DEL JUEGO
===================================================== */

function drawGameBackground(
  now,
  phaseIndex
){

  const pulse =
    .5+
    Math.sin(
      now*.0015
    )*.5;


  const shade =
    gctx.createRadialGradient(
      gameW*.5,
      gameH*.48,
      10,

      gameW*.5,
      gameH*.48,

      Math.max(
        gameW,
        gameH
      )*.78
    );


  shade.addColorStop(
    0,
    phaseIndex===3
      ? `rgba(35,23,52,${.21+pulse*.04})`
      : 'rgba(15,20,37,.18)'
  );

  shade.addColorStop(
    1,
    'rgba(0,0,0,.53)'
  );


  gctx.fillStyle =
    shade;

  gctx.fillRect(
    0,
    0,
    gameW,
    gameH
  );


  /*
    Destello suave dentro del marco.
  */

  gctx.save();

  gctx.globalAlpha =
    phaseIndex===3
      ? .10+
        pulse*.05
      : .055;

  gctx.fillStyle =
    phaseIndex===3
      ? '#f4a6d8'
      : '#9db7e7';

  gctx.fillRect(
    arena.x,
    arena.y,
    arena.w,
    arena.h
  );

  gctx.restore();
}


/* =====================================================
   GAME LOOP
===================================================== */

function gameLoop(
  now
){

  if(!gameRunning){
    return;
  }


  const dt =
    Math.min(
      .034,
      (
        now-gameLast
      )/1000
    );


  gameLast =
    now;


  const elapsed =
    (
      now-gameStart
    )/1000;


  const left =
    GAME_V2_DURATION-
    elapsed;


  const phaseIndex =
    getPhaseIndex(
      elapsed
    );


  if(
    phaseIndex!==
    gameV2PhaseIndex
  ){

    onPhaseChanged(
      phaseIndex
    );
  }


  const phase =
    phaseIndex+1;


  /* =================================================
     MOVIMIENTO
  ================================================= */

  const dx =
    (
      keys.ArrowRight ||
      keys.d
        ? 1
        : 0
    )-
    (
      keys.ArrowLeft ||
      keys.a
        ? 1
        : 0
    );


  const dy =
    (
      keys.ArrowDown ||
      keys.s
        ? 1
        : 0
    )-
    (
      keys.ArrowUp ||
      keys.w
        ? 1
        : 0
    );


  if(
    dx ||
    dy
  ){

    const len =
      Math.hypot(
        dx,
        dy
      ) || 1;


    heart.x +=
      dx/
      len*
      heart.speed*
      dt;

    heart.y +=
      dy/
      len*
      heart.speed*
      dt;


    clampHeart();
  }


  /* =================================================
     ATAQUES
  ================================================= */

  gameV2AttackTimer -=
    dt;


  if(
    gameV2AttackTimer<=0
  ){

    chooseAttack(
      phaseIndex
    );


    const data =
      GAME_V2_PHASES[
        phaseIndex
      ];


    gameV2AttackTimer =
      data.interval+
      (
        Math.random()*.18
      );
  }


  if(
    !updateProjectiles(
      dt,
      now
    )
  ){

    return;
  }


  updateParticles(
    dt
  );

  updateWarnings(
    dt
  );


  /* =================================================
     DIBUJO
  ================================================= */

  gctx.setTransform(
    gameDPR,
    0,
    0,
    gameDPR,
    0,
    0
  );


  gctx.clearRect(
    0,
    0,
    gameW,
    gameH
  );


  const shake =
    now<
    gameV2ShakeUntil;


  if(shake){

    gctx.save();

    gctx.translate(
      (
        Math.random()-.5
      )*5,

      (
        Math.random()-.5
      )*5
    );
  }


  drawGameBackground(
    now,
    phaseIndex
  );

  drawPixelArenaFrame();

  drawWarnings();


  gameProjectiles.forEach(
    drawPetal
  );


  drawParticles();


  const blink =
    now<
    gameInvulnUntil

      ? (
          Math.floor(
            now/90
          )%2
            ? .28
            : 1
        )

      : 1;


  drawHeart(
    heart.x,
    heart.y,
    heart.r,
    blink
  );


  if(shake){

    gctx.restore();
  }


  updateGameHud(
    phase,
    left
  );


  if(left<=0){

    finishGame(
      true
    );

    return;
  }


  gameRAF =
    requestAnimationFrame(
      gameLoop
    );
}


/* =====================================================
   FINAL
===================================================== */

function finishGame(
  win
){

  gameRunning =
    false;


  cancelAnimationFrame(
    gameRAF
  );


  gameCanvas.classList.remove(
    'show'
  );

  gameHud.classList.remove(
    'show'
  );

  gamePhaseBanner.classList.remove(
    'show'
  );


  /*
    Cada intento completo entrega materiales.
    Así el minijuego también sirve como una
    ruta alternativa a esperar drops en el campo.
  */
  grantGameMaterialReward(
    win
  );


  if(win){

    flashVictory();


    /*
      Se registra de forma segura solo si ya existe
      el sistema de estadísticas.
    */

    try{

      window.ParadoxStats?.inc?.(
        'mainGameWins'
      );

    }

    catch(_){}


    setTimeout(
      ()=>{

        finalLetter.classList.add(
          'show'
        );

      },
      520
    );


    if(!bgMusic.paused){

      bgMusic.volume =
        .35;
    }
  }

  else{

    try{

      window.ParadoxStats?.inc?.(
        'mainGameAttempts'
      );

    }

    catch(_){}


    losePanel.classList.remove(
      'hidden'
    );
  }
}


/* =====================================================
   TECLADO
===================================================== */

window.addEventListener(
  'keydown',
  e=>{

    keys[e.key]=true;


    if(
      gameRunning &&
      [
        'ArrowUp',
        'ArrowDown',
        'ArrowLeft',
        'ArrowRight',
        ' '
      ]
      .includes(
        e.key
      )
    ){

      e.preventDefault();
    }

  },
  {
    passive:false
  }
);


window.addEventListener(
  'keyup',
  e=>{

    keys[e.key]=false;
  }
);


/* =====================================================
   TÁCTIL / RATÓN
===================================================== */

function moveHeartToPointer(
  e
){

  const rect =
    gameCanvas
      .getBoundingClientRect();


  heart.x =
    e.clientX-
    rect.left;

  heart.y =
    e.clientY-
    rect.top;


  clampHeart();
}


gameCanvas.addEventListener(
  'pointerdown',
  e=>{

    if(!gameRunning){
      return;
    }


    gamePointer=true;


    gameCanvas
      .setPointerCapture?.(
        e.pointerId
      );


    moveHeartToPointer(
      e
    );


    e.preventDefault();
  }
);


gameCanvas.addEventListener(
  'pointermove',
  e=>{

    if(
      gameRunning &&
      gamePointer
    ){

      moveHeartToPointer(
        e
      );
    }
  }
);


gameCanvas.addEventListener(
  'pointerup',
  e=>{

    gamePointer=false;


    try{

      gameCanvas
        .releasePointerCapture?.(
          e.pointerId
        );

    }

    catch(_){}
  }
);


gameCanvas.addEventListener(
  'pointercancel',
  ()=>{

    gamePointer=false;
  }
);


/* =====================================================
   RESIZE
===================================================== */

window.addEventListener(
  'resize',
  ()=>{

    if(
      gameOverlay
        .classList
        .contains(
          'show'
        )
    ){

      resizeGame();
    }
  }
);
