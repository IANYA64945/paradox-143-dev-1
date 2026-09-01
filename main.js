async function init(){
  fill.style.width='12%';
  const [atlas,grass]=await Promise.all([
    loadImg(TULIP_SRC),
    loadImg(GRASS_SRC),
    loadImg(PLAYER_HEART_SRC),
    loadImg(PIXEL_FRAME_SRC),
    loadImg('pixel_hearts.png')
  ]).then(v=>[v[0],v[1]]);
  fill.style.width='48%';
  buildFlowerFrames(atlas); groundGlow=makeGroundGlow();
  fill.style.width='72%'; resize(grass); fill.style.width='92%';

  app.addEventListener('pointerdown',e=>{
    drag=true; cancelAnimationFrame(inertiaRAF); startX=lastX=e.clientX; startWorld=worldX; lastT=performance.now(); velocity=0;
    try{app.setPointerCapture(e.pointerId)}catch(_){}
  },{passive:true});

  app.addEventListener('pointermove',e=>{
    if(!drag)return;
    const now=performance.now(),dt=Math.max(1,now-lastT);
    worldX=startWorld+(e.clientX-startX);
    maybeRevealSecret();
    velocity=(e.clientX-lastX)/dt*16;
    lastX=e.clientX; lastT=now; schedule(grass);
  },{passive:true});

  const release=e=>{
    if(!drag)return; drag=false;
    try{if(app.hasPointerCapture(e.pointerId))app.releasePointerCapture(e.pointerId)}catch(_){}
    startInertia(grass);
  };
  app.addEventListener('pointerup',release,{passive:true});
  app.addEventListener('pointercancel',release,{passive:true});
  app.addEventListener('contextmenu',e=>e.preventDefault());

  let resizeTimer;
  const queueResize=()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>resize(grass),120)};
  window.addEventListener('resize',queueResize);
  window.addEventListener('orientationchange',()=>setTimeout(()=>resize(grass),250));
  if(window.visualViewport)window.visualViewport.addEventListener('resize',queueResize);

  setInterval(()=>{currentFrame=(currentFrame+1)%3;schedule(grass)},VERY_LOW?340:(MEDIUM?285:250));

  fill.style.width='100%';
  setTimeout(()=>loader.classList.add('hide'),260);
}

fsBtn.addEventListener('click',async()=>{
  try{
    if(document.fullscreenElement||document.webkitFullscreenElement){
      const exit=document.exitFullscreen||document.webkitExitFullscreen;
      if(exit)await exit.call(document);
      return;
    }
    const element=document.documentElement;
    const request=element.requestFullscreen||element.webkitRequestFullscreen||element.msRequestFullscreen;
    if(!request)throw new Error('fullscreen');
    await request.call(element);
  }catch(_){showTip('Tu navegador no permitió pantalla completa.')}
});

function updateFsIcon(){fsBtn.textContent=(document.fullscreenElement||document.webkitFullscreenElement)?'×':'⛶'}
document.addEventListener('fullscreenchange',updateFsIcon);
document.addEventListener('webkitfullscreenchange',updateFsIcon);

requestAnimationFrame(()=>setTimeout(()=>{
  init().catch(()=>{
    fill.style.width='100%'; showTip('No se pudo iniciar el campo.');
    setTimeout(()=>loader.classList.add('hide'),250);
  });
},20));
