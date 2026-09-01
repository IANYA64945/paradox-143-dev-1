/* =====================================================
   INTRODUCCIÓN Y MÚSICA
===================================================== */
introEnvelope.addEventListener('click',()=>intro.classList.add('open'));

function tryStartMusic(){
  bgMusic.volume=.35;
  const p=bgMusic.play();
  if(p&&p.then){
    p.then(()=>{musicOn=true;musicBtn.textContent='♫'}).catch(()=>{});
  }
}

function playBloomTransition(){
  bloomTransition.innerHTML='';
  const points=[
    [50,66,0],[39,69,.24],[61,69,.24],[29,72,.44],[48,73,.44],[70,72,.44],
    [20,77,.62],[34,80,.62],[54,80,.62],[73,79,.62],[85,76,.62]
  ];
  points.forEach(([x,y,d],i)=>{
    const t=document.createElement('span');
    t.className='bloomTulip';
    t.style.left=x+'%';
    t.style.top=y+'%';
    t.style.animationDelay=d+'s';
    t.style.width=(i===0?68:(46+Math.random()*22))+'px';
    t.style.height=(i===0?130:(90+Math.random()*42))+'px';
    bloomTransition.appendChild(t);
  });
  bloomTransition.classList.add('active');
  setTimeout(()=>{bloomTransition.classList.remove('active');bloomTransition.innerHTML=''},2200);
}

introContinue.addEventListener('click',()=>{
  tryStartMusic();
  introDone=true;
  document.body.classList.remove('intro-active');
  playBloomTransition();
  intro.classList.add('hide');
  setTimeout(()=>{intro.style.display='none'},950);
  setTimeout(()=>showTip('Arrastra el campo. Hay algo escondido…'),1250);
});

bgMusic.addEventListener('canplay',()=>musicBtn.classList.add('available'),{once:true});
bgMusic.addEventListener('error',()=>musicBtn.classList.remove('available'));

musicBtn.addEventListener('click',()=>{
  if(bgMusic.paused){
    bgMusic.play().then(()=>{musicOn=true;musicBtn.textContent='♫'}).catch(()=>{});
  }else{
    bgMusic.pause();musicOn=false;musicBtn.textContent='♪';
  }
});

function maybeRevealSecret(){
  if(!introDone||secretShown)return;
  if(Math.abs(worldX)>Math.max(220,W*.55)){
    secretShown=true;
    secretLetterBtn.classList.add('visible');
  }
}

secretLetterBtn.addEventListener('click',()=>{
  gameOverlay.classList.add('show');
  challengePanel.classList.remove('hidden');
  losePanel.classList.add('hidden');
  finalLetter.classList.remove('show');
  gameHud.classList.remove('show');
  gameCanvas.classList.remove('show');
  if(!bgMusic.paused)bgMusic.volume=.18;
});

closeChallengeBtn.addEventListener('click',closeGameOverlay);
leaveGameBtn.addEventListener('click',closeGameOverlay);
backToFieldBtn.addEventListener('click',closeGameOverlay);

function closeGameOverlay(){
  gameRunning=false;
  cancelAnimationFrame(gameRAF);
  gameOverlay.classList.remove('show');
  gameCanvas.classList.remove('show');
  gameHud.classList.remove('show');
  if(!bgMusic.paused)bgMusic.volume=.35;
}
