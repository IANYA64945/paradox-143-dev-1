/* =========================================================
   PARADOX143 — RUTA SECRETA "NO CAMBIES" / EL ARCHIVO

   Se activa solo si, durante RECONSTRUIR, el jugador insiste
   tres veces en "Como antes".
========================================================= */

(() => {
  'use strict';

  let overlay=null;
  let room=0;
  let openFlag=false;
  let text=null;
  let title=null;
  let visual=null;
  let action=null;

  const ROOMS=[
    {
      title:'NO CAMBIES',
      text:'Si todo queda exactamente igual, nada tendrá que perderse otra vez.',
      cls:'archive-tulips',
      action:'seguir'
    },
    {
      title:'EL ARCHIVO',
      text:'Cada tulipán ocupa el mismo lugar. Cada noche empieza en el mismo segundo.',
      cls:'archive-repeat',
      action:'seguir'
    },
    {
      title:'EL ARCHIVO',
      text:'Mewo vuelve a sentarse. Marie vuelve a dormir. Mewo vuelve a sentarse. Marie vuelve a dormir.',
      cls:'archive-cats',
      action:'seguir'
    },
    {
      title:'EL ARCHIVO',
      text:'Tuluz no encaja.',
      cls:'archive-tuluz',
      action:'seguir'
    },
    {
      title:'',
      text:'No existe una versión antigua suya que pueda archivarse.',
      cls:'archive-gap',
      action:'seguir'
    },
    {
      title:'',
      text:'Nada volverá a pasar.',
      cls:'archive-still',
      action:'seguir'
    },
    {
      title:'',
      text:'Un recuerdo que nunca cambia deja de ser un lugar donde vivir.',
      cls:'archive-dark',
      action:'...'
    },
    {
      title:'',
      text:'Solo tendríamos que permitir que mañana sea diferente de ayer.',
      cls:'archive-exit',
      action:'Permitirlo'
    }
  ];

  function build(){
    if(overlay) return;
    overlay=document.createElement('section');
    overlay.id='act2Archive';
    overlay.setAttribute('aria-hidden','true');
    overlay.innerHTML=`
      <div id="act2ArchiveNoise"></div>
      <div id="act2ArchiveVisual">
        <div class="archiveGrid"></div>
        <div class="archiveTulips"></div>
        <div class="archiveCopies">
          <img src="mewo_idle.png" alt="">
          <img src="mewo_idle.png" alt="">
          <img src="mewo_idle.png" alt="">
          <img src="cat_gray_sleep.png" alt="">
          <img src="cat_gray_sleep.png" alt="">
          <img src="cat_orange_idle.png" alt="">
        </div>
      </div>
      <div id="act2ArchiveWords">
        <small id="act2ArchiveTitle"></small>
        <p id="act2ArchiveText"></p>
        <button id="act2ArchiveAction" type="button">seguir</button>
      </div>
    `;
    document.body.appendChild(overlay);
    text=overlay.querySelector('#act2ArchiveText');
    title=overlay.querySelector('#act2ArchiveTitle');
    visual=overlay.querySelector('#act2ArchiveVisual');
    action=overlay.querySelector('#act2ArchiveAction');
    action.addEventListener('click',next);
  }

  function open(){
    if(openFlag) return;
    build();
    openFlag=true;
    room=0;
    window.ParadoxAct2?.suppressObjectives?.(true);
    document.body.classList.add('act2-archive-open');
    overlay.classList.add('show');
    overlay.setAttribute('aria-hidden','false');
    render();
  }

  function render(){
    const r=ROOMS[room];
    if(!r){ finish(); return; }
    title.textContent=r.title;
    text.textContent=r.text;
    action.textContent=r.action;
    visual.className=r.cls;
    overlay.dataset.room=String(room);
  }

  function next(){
    if(room>=ROOMS.length-1){ finish(); return; }
    room++;
    overlay.classList.add('shift');
    setTimeout(()=>overlay.classList.remove('shift'),300);
    render();
  }

  function finish(){
    if(!openFlag) return;
    openFlag=false;
    overlay.classList.remove('show');
    overlay.setAttribute('aria-hidden','true');
    document.body.classList.remove('act2-archive-open');
    window.ParadoxAct2?.save?.({archiveSeen:true,exactChoices:0,acceptChoices:1});
    window.ParadoxAct2?.suppressObjectives?.(false);
    try{ window.dispatchEvent(new CustomEvent('paradox-act2-archive-finished')); }catch(_){}
  }

  document.addEventListener('DOMContentLoaded',()=>setTimeout(build,800));

  window.ParadoxAct2Archive={open,close:finish,isOpen:()=>openFlag};
})();
