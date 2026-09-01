/* =========================================================
   PARADOX143 — TALLER DE MEWO 1.0
   Recolección + almohadas + costura + rascador
========================================================= */

(() => {
  'use strict';

  const INV_KEY='paradox143_cat_inventory_v1';
  const PILLOWS_KEY='paradox143_pillows_v1';
  const HOME_KEY='paradox143_mewo_home_v1';

  const MATERIALS={
    cotton:{name:'Algodón',mark:'☁',src:'material_algodon.png'},
    fabric:{name:'Tela',mark:'▱',src:'material_tela.png'},
    paw:{name:'Aplique huella',mark:'🐾',src:'aplique_huella.png'},
    star:{name:'Aplique estrella',mark:'✦',src:'aplique_estrella.png'},
    moon:{name:'Aplique luna',mark:'☾',src:'aplique_luna.png'},
    wood:{name:'Madera',mark:'▰',src:'material_madera.png'},
    rope:{name:'Cuerda',mark:'⌁',src:'material_cuerda.png'}
  };

  const RECIPES={
    huella:{
      name:'Almohada Huellita',
      final:'pillow_huella.png',
      base:'pillow_base_paw.png',
      applique:'aplique_huella.png',
      costs:{cotton:3,fabric:2,paw:1}
    },
    luna:{
      name:'Almohada Luna',
      final:'pillow_luna.png',
      base:'pillow_base_square.png',
      applique:'aplique_luna.png',
      costs:{cotton:4,fabric:3,moon:1}
    },
    estrellas:{
      name:'Almohada Estrellas',
      final:'pillow_estrellas.png',
      base:'pillow_base_square.png',
      applique:'aplique_estrella.png',
      costs:{cotton:3,fabric:2,star:1}
    }
  };

  function loadJSON(key,fallback){
    try{
      const raw=localStorage.getItem(key);
      const v=raw?JSON.parse(raw):null;
      return v&&typeof v==='object' ? v : fallback;
    }catch(_){ return fallback; }
  }

  function inventory(){
    return {cotton:0,fabric:0,paw:0,star:0,moon:0,wood:0,rope:0,...loadJSON(INV_KEY,{})};
  }

  function saveInventory(next){
    try{ localStorage.setItem(INV_KEY,JSON.stringify(next)); }catch(_){}
    try{ window.dispatchEvent(new CustomEvent('paradox-cat-inventory-change',{detail:next})); }catch(_){}
  }

  function ownedPillows(){
    const v=loadJSON(PILLOWS_KEY,[]);
    return Array.isArray(v)?v:[];
  }

  function savePillows(arr){
    try{ localStorage.setItem(PILLOWS_KEY,JSON.stringify([...new Set(arr)])); }catch(_){}
  }

  function gardenState(){
    return window.ParadoxCatGarden?.getState?.() || {};
  }

  function updateHome(patch){
    const current=loadJSON(HOME_KEY,{});
    const next={...current,...patch};
    try{ localStorage.setItem(HOME_KEY,JSON.stringify(next)); }catch(_){}
    try{ window.dispatchEvent(new CustomEvent('paradox-mewo-home-change',{detail:next})); }catch(_){}
  }

  function hasCosts(costs){
    const inv=inventory();
    return Object.entries(costs).every(([k,n])=>Number(inv[k]||0)>=n);
  }

  function spend(costs){
    const inv=inventory();
    if(!hasCosts(costs)) return false;
    for(const [k,n] of Object.entries(costs)) inv[k]=Math.max(0,Number(inv[k]||0)-n);
    saveInventory(inv);
    return true;
  }

  function addMaterial(type,amount=1){
    const inv=inventory();
    inv[type]=Number(inv[type]||0)+amount;
    saveInventory(inv);
    try{ window.ParadoxStats?.inc?.('materialsCollected',amount); }catch(_){}
  }

  /* =====================================================
     TOAST
  ===================================================== */

  const toast=document.createElement('div');
  toast.id='catCraftToast';
  document.body.appendChild(toast);
  let toastTimer=0;

  function showToast(text){
    clearTimeout(toastTimer);
    toast.textContent=text;
    toast.classList.remove('show');
    void toast.offsetWidth;
    toast.classList.add('show');
    toastTimer=setTimeout(()=>toast.classList.remove('show'),2600);
  }

  /* =====================================================
     MATERIALES QUE APARECEN EN EL CAMPO
  ===================================================== */

  let fieldDrop=null;
  let dropTimer=0;

  function fieldBusy(){
    if(document.hidden || document.body.classList.contains('intro-active') || document.body.classList.contains('cat-garden-open')) return true;
    const game=document.getElementById('gameOverlay');
    if(game?.classList.contains('show')) return true;
    const reader=document.getElementById('letterReader');
    if(reader?.classList.contains('show')) return true;
    return Boolean(window.MAGIC_SPECIAL_PENDING);
  }

  function materialPool(){
    const g=gardenState();
    const base=['cotton','cotton','cotton','fabric','fabric','paw','star','moon'];
    if(g.unlocked) base.push('wood','wood','rope','rope','rope');
    return base;
  }

  function scheduleDrop(delay){
    clearTimeout(dropTimer);
    dropTimer=setTimeout(trySpawn,delay ?? (22000+Math.random()*21000));
  }

  function trySpawn(){
    if(fieldDrop || fieldBusy()){
      scheduleDrop(8000);
      return;
    }

    const pool=materialPool();
    const type=pool[Math.floor(Math.random()*pool.length)];
    const data=MATERIALS[type];

    const btn=document.createElement('button');
    btn.type='button';
    btn.className='catMaterialDrop';
    btn.dataset.material=type;
    btn.setAttribute('aria-label',data.name);
    btn.innerHTML=`<img src="${data.src}" alt=""><span>${data.mark}</span>`;
    btn.style.left=`${10+Math.random()*80}%`;
    btn.style.top=`${54+Math.random()*28}%`;
    document.body.appendChild(btn);
    fieldDrop=btn;

    requestAnimationFrame(()=>btn.classList.add('show'));

    const expire=setTimeout(()=>{
      if(fieldDrop===btn){
        btn.classList.add('leave');
        setTimeout(()=>btn.remove(),350);
        fieldDrop=null;
        scheduleDrop();
      }
    },15000);

    btn.addEventListener('click',()=>{
      clearTimeout(expire);
      addMaterial(type,1);
      btn.classList.add('collected');
      showToast(`${data.mark} ${data.name} +1`);
      setTimeout(()=>btn.remove(),420);
      fieldDrop=null;
      scheduleDrop(14000+Math.random()*15000);
    },{once:true});
  }

  scheduleDrop(11000);

  /* =====================================================
     TALLER
  ===================================================== */

  const overlay=document.createElement('div');
  overlay.id='catCraftOverlay';
  overlay.innerHTML=`
    <div id="catCraftPanel">
      <button id="catCraftClose" type="button">×</button>
      <div class="catCraftTitle">TALLER DE MEWO 🧵</div>
      <div id="catCraftInventory"></div>
      <div id="catCraftContent"></div>
    </div>
  `;
  document.body.appendChild(overlay);

  const panel=overlay.querySelector('#catCraftPanel');
  const invBox=overlay.querySelector('#catCraftInventory');
  const content=overlay.querySelector('#catCraftContent');
  const close=overlay.querySelector('#catCraftClose');

  function renderInventory(){
    const inv=inventory();
    invBox.innerHTML=Object.entries(MATERIALS).map(([id,m])=>`
      <div class="catInvItem ${Number(inv[id]||0)>0?'has':''}">
        <img src="${m.src}" alt="">
        <span>${m.name}</span>
        <strong>${Number(inv[id]||0)}</strong>
      </div>
    `).join('');
  }

  function costsText(costs){
    return Object.entries(costs).map(([k,n])=>`${MATERIALS[k].mark} ${n}`).join('  ');
  }

  function renderMenu(){
    renderInventory();
    const owned=new Set(ownedPillows());
    const gs=gardenState();

    content.innerHTML=`
      <div class="catCraftSectionTitle">ALMOHADAS</div>
      <div class="catRecipeGrid">
        ${Object.entries(RECIPES).map(([id,r])=>`
          <button class="catRecipe" data-recipe="${id}" type="button">
            <img src="${r.final}" alt="">
            <strong>${r.name}</strong>
            <small>${costsText(r.costs)}</small>
            <em>${owned.has(id)?'YA HECHA ♡':hasCosts(r.costs)?'LISTA PARA COSER':'FALTAN MATERIALES'}</em>
          </button>
        `).join('')}
      </div>

      <div class="catCraftSectionTitle">RASCADOR</div>
      <div class="scratcherBuildCard">
        <img src="${Number(gs.scratcherStage||0)>0 ? (Number(gs.scratcherStage)>=4?'scratcher_full.png':`scratcher_stage${Number(gs.scratcherStage)}.png`) : 'scratcher_stage1.png'}" alt="">
        <div>
          <strong>Construcción ${Math.min(4,Number(gs.scratcherStage||0))}/4</strong>
          <small>${scratcherRequirementText(Number(gs.scratcherStage||0))}</small>
          <button id="scratcherBuildBtn" type="button">${Number(gs.scratcherStage||0)>=4?'TERMINADO ♡':'CONSTRUIR SIGUIENTE PARTE'}</button>
        </div>
      </div>

      ${owned.size?`<div class="catCraftSectionTitle">ALMOHADA ACTIVA</div><div class="ownedPillowRow">${[...owned].map(id=>`<button data-use-pillow="${id}" type="button" class="${gs.activePillow===id?'active':''}"><img src="${RECIPES[id].final}" alt=""><span>${RECIPES[id].name}</span></button>`).join('')}</div>`:''}
    `;

    content.querySelectorAll('[data-recipe]').forEach(btn=>{
      btn.addEventListener('click',()=>startCraft(btn.dataset.recipe));
    });

    content.querySelectorAll('[data-use-pillow]').forEach(btn=>{
      btn.addEventListener('click',()=>{
        window.ParadoxCatGarden?.save?.({activePillow:btn.dataset.usePillow});
        renderMenu();
        showToast('♡ Mewo ya tiene esa almohada en su rincón.');
      });
    });

    content.querySelector('#scratcherBuildBtn')?.addEventListener('click',buildScratcherStage);
  }

  function openWorkshop(){
    renderMenu();
    overlay.classList.add('show');
  }

  function closeWorkshop(){
    overlay.classList.remove('show');
  }

  close.addEventListener('click',closeWorkshop);
  overlay.addEventListener('click',e=>{ if(e.target===overlay) closeWorkshop(); });
  window.addEventListener('paradox-open-cat-crafting',openWorkshop);
  window.addEventListener('paradox-cat-inventory-change',()=>{ if(overlay.classList.contains('show')) renderMenu(); });

  /* Sustituye el antiguo botón de 5 clics de Mewo. */
  function bindOldCraftButton(){
    const btn=document.getElementById('mewoHomeCraftBtn');
    if(btn && btn.dataset.newCraft!=='1'){
      btn.dataset.newCraft='1';
      btn.textContent='🧵 TALLER';
      btn.addEventListener('click',e=>{
        e.preventDefault();
        e.stopImmediatePropagation();
        openWorkshop();
      },true);
    }

    const pillow=document.getElementById('mewoHomePillow');
    if(pillow && pillow.dataset.newCraft!=='1'){
      pillow.dataset.newCraft='1';
      pillow.addEventListener('click',e=>{
        if(!loadJSON(HOME_KEY,{}).pillowMade){
          e.preventDefault();
          e.stopImmediatePropagation();
          openWorkshop();
        }
      },true);
    }
  }
  setInterval(bindOldCraftButton,1000);
  bindOldCraftButton();

  /* =====================================================
     MINIJUEGO DE ALMOHADA — 3 ETAPAS
  ===================================================== */

  let activeRecipe=null;
  let sewingIndex=0;
  let stitchCanvas=null;
  let stitchCtx=null;
  let stitchPoints=[];

  function startCraft(id){
    const recipe=RECIPES[id];
    if(!recipe) return;
    if(!hasCosts(recipe.costs)){
      showToast('Todavía te faltan materiales para esta almohada.');
      return;
    }
    activeRecipe=id;
    sewingIndex=0;
    renderSewingStage();
  }

  function pointsForRecipe(id,w,h){
    if(id==='huella'){
      return [
        [.25,.72],[.16,.58],[.18,.40],[.30,.28],[.36,.12],[.48,.19],
        [.58,.10],[.66,.23],[.79,.23],[.84,.39],[.78,.56],[.70,.70],
        [.55,.82],[.39,.82]
      ].map(([x,y])=>[x*w,y*h]);
    }
    return [
      [.16,.18],[.34,.12],[.55,.12],[.78,.20],[.86,.38],[.86,.62],
      [.76,.80],[.56,.87],[.34,.87],[.16,.78],[.10,.58],[.10,.36]
    ].map(([x,y])=>[x*w,y*h]);
  }

  function renderSewingStage(){
    const r=RECIPES[activeRecipe];
    content.innerHTML=`
      <div class="craftGameTitle">1/3 — COSE EL BORDE</div>
      <p class="craftGameHint">Toca las puntadas luminosas en orden. La aguja irá dejando el hilo detrás ♡</p>
      <div id="sewingBoard">
        <img class="sewingPillowBase" src="${r.base}" alt="">
        <canvas id="stitchCanvas"></canvas>
        <img id="sewingNeedle" src="needle.png" alt="">
        <div id="stitchDots"></div>
      </div>
      <button class="craftCancelBtn" type="button">volver</button>
    `;

    const board=content.querySelector('#sewingBoard');
    const dots=content.querySelector('#stitchDots');
    stitchCanvas=content.querySelector('#stitchCanvas');
    stitchCtx=stitchCanvas.getContext('2d');
    const needle=content.querySelector('#sewingNeedle');

    requestAnimationFrame(()=>{
      const rect=board.getBoundingClientRect();
      const dpr=Math.min(window.devicePixelRatio||1,1.5);
      stitchCanvas.width=Math.round(rect.width*dpr);
      stitchCanvas.height=Math.round(rect.height*dpr);
      stitchCanvas.style.width=rect.width+'px';
      stitchCanvas.style.height=rect.height+'px';
      stitchCtx.setTransform(dpr,0,0,dpr,0,0);
      stitchPoints=pointsForRecipe(activeRecipe,rect.width,rect.height);
      stitchPoints.forEach(([x,y],i)=>{
        const b=document.createElement('button');
        b.type='button';
        b.className='stitchDot';
        b.style.left=x+'px';b.style.top=y+'px';
        b.textContent=i===0?'✦':'·';
        b.addEventListener('click',()=>{
          if(i!==sewingIndex){
            b.classList.add('wrong');
            setTimeout(()=>b.classList.remove('wrong'),260);
            return;
          }
          b.classList.add('done');
          const prev=stitchPoints[Math.max(0,i-1)];
          stitchCtx.strokeStyle='rgba(235,139,193,.95)';
          stitchCtx.lineWidth=3;
          stitchCtx.lineCap='round';
          if(i>0){ stitchCtx.beginPath(); stitchCtx.moveTo(prev[0],prev[1]); stitchCtx.lineTo(x,y); stitchCtx.stroke(); }
          needle.style.left=x+'px';needle.style.top=y+'px';
          sewingIndex++;
          if(sewingIndex<stitchPoints.length){ dots.children[sewingIndex].textContent='✦'; }
          else setTimeout(renderStuffingStage,450);
        });
        dots.appendChild(b);
      });
      const [x,y]=stitchPoints[0];needle.style.left=x+'px';needle.style.top=y+'px';
    });

    content.querySelector('.craftCancelBtn').addEventListener('click',renderMenu);
  }

  function renderStuffingStage(){
    content.innerHTML=`
      <div class="craftGameTitle">2/3 — RELLENA LA ALMOHADA</div>
      <p class="craftGameHint">Atrapa 7 copitos antes de que se escapen.</p>
      <div id="stuffingBoard"><div id="stuffCount">0/7</div></div>
      <button class="craftCancelBtn" type="button">volver</button>
    `;
    const board=content.querySelector('#stuffingBoard');
    const count=content.querySelector('#stuffCount');
    let caught=0;

    for(let i=0;i<10;i++){
      const b=document.createElement('button');
      b.type='button';b.className='cottonPuff';
      b.innerHTML='<img src="material_algodon.png" alt="">';
      b.style.left=`${5+Math.random()*82}%`;
      b.style.top=`${5+Math.random()*72}%`;
      b.style.animationDelay=`${Math.random()*1.4}s`;
      b.addEventListener('click',()=>{
        if(b.classList.contains('caught')) return;
        b.classList.add('caught');caught++;
        count.textContent=`${caught}/7`;
        if(caught>=7) setTimeout(renderAppliqueStage,480);
      });
      board.appendChild(b);
    }
    content.querySelector('.craftCancelBtn').addEventListener('click',renderMenu);
  }

  function renderAppliqueStage(){
    const r=RECIPES[activeRecipe];
    content.innerHTML=`
      <div class="craftGameTitle">3/3 — DECÓRALA</div>
      <p class="craftGameHint">Arrastra el aplique hasta el centro de la almohada.</p>
      <div id="appliqueBoard">
        <img class="appliqueBase" src="${r.base}" alt="">
        <div id="appliqueTarget">✦</div>
        <img id="appliqueDrag" src="${r.applique}" alt="">
      </div>
      <button class="craftCancelBtn" type="button">volver</button>
    `;

    const board=content.querySelector('#appliqueBoard');
    const drag=content.querySelector('#appliqueDrag');
    const target=content.querySelector('#appliqueTarget');
    let dragging=false;

    function move(e){
      if(!dragging) return;
      const rct=board.getBoundingClientRect();
      drag.style.left=`${e.clientX-rct.left}px`;
      drag.style.top=`${e.clientY-rct.top}px`;
    }
    drag.addEventListener('pointerdown',e=>{dragging=true;drag.setPointerCapture?.(e.pointerId);move(e);e.preventDefault();});
    drag.addEventListener('pointermove',move);
    drag.addEventListener('pointerup',e=>{
      if(!dragging) return;dragging=false;
      const a=drag.getBoundingClientRect(),t=target.getBoundingClientRect();
      const ax=a.left+a.width/2,ay=a.top+a.height/2,tx=t.left+t.width/2,ty=t.top+t.height/2;
      if(Math.hypot(ax-tx,ay-ty)<Math.max(55,t.width*.65)) finishPillow();
      else{ drag.classList.add('returning');setTimeout(()=>{drag.classList.remove('returning');drag.style.left='18%';drag.style.top='72%';},280); }
    });
    content.querySelector('.craftCancelBtn').addEventListener('click',renderMenu);
  }

  function finishPillow(){
    const id=activeRecipe;
    const r=RECIPES[id];
    if(!spend(r.costs)){
      showToast('Los materiales cambiaron. Intenta otra vez.');
      renderMenu();return;
    }

    const owned=ownedPillows();
    if(!owned.includes(id)) owned.push(id);
    savePillows(owned);

    const gs=gardenState();
    const firstAt=Number(gs.firstPillowAt||0)||Date.now();
    window.ParadoxCatGarden?.save?.({activePillow:id,firstPillowAt:firstAt});
    updateHome({pillowMade:true,craftProgress:5});
    try{ window.ParadoxStats?.inc?.('pillowsCrafted'); }catch(_){}

    content.innerHTML=`
      <div class="craftComplete">
        <span>♡</span>
        <strong>${r.name} terminada</strong>
        <img src="${r.final}" alt="">
        <p>Ahora Mewo puede usarla en su rincón.</p>
        <button type="button">LISTO ♡</button>
      </div>
    `;
    content.querySelector('button').addEventListener('click',()=>{renderMenu();window.ParadoxCatGarden?.refresh?.();});
  }

  /* =====================================================
     RASCADOR — 4 ETAPAS
  ===================================================== */

  const SCRATCHER_COSTS=[
    {wood:2},
    {wood:1,rope:2},
    {rope:2},
    {wood:1,rope:2}
  ];

  function scratcherRequirementText(stage){
    if(stage>=4) return 'Mewo ya tiene su rascador completo ♡';
    return `Siguiente parte: ${costsText(SCRATCHER_COSTS[stage])}`;
  }

  function buildScratcherStage(){
    const gs=gardenState();
    const stage=Math.min(4,Number(gs.scratcherStage||0));
    if(stage>=4) return;

    const costs=SCRATCHER_COSTS[stage];
    if(!hasCosts(costs)){
      showToast('Te faltan materiales para esta parte del rascador.');
      return;
    }

    spend(costs);
    const next=stage+1;
    window.ParadoxCatGarden?.save?.({scratcherStage:next});
    try{ window.ParadoxStats?.inc?.('scratcherBuildSteps'); }catch(_){}
    showToast(next>=4?'✦ Rascador terminado ♡':`🪵 Rascador ${next}/4`);
    renderMenu();
    window.ParadoxCatGarden?.refresh?.();
  }

  /* Public API */
  window.ParadoxCatCrafting={
    open:openWorkshop,
    inventory,
    addMaterial,
    ownedPillows,
    refresh(){ if(overlay.classList.contains('show')) renderMenu(); }
  };
})();
