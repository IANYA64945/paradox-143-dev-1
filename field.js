let fieldGroundLightCanvas=null;

function makeGroundGlow(){
  const c=document.createElement('canvas'); c.width=160; c.height=42;
  const g=c.getContext('2d');
  const gr=g.createRadialGradient(80,21,0,80,21,80);
  gr.addColorStop(0,'rgba(255,239,145,.36)');
  gr.addColorStop(.20,'rgba(202,255,140,.29)');
  gr.addColorStop(.48,'rgba(88,235,128,.16)');
  gr.addColorStop(.72,'rgba(60,187,130,.07)');
  gr.addColorStop(1,'rgba(55,170,85,0)');
  g.fillStyle=gr; g.fillRect(0,0,160,42); return c;
}

function buildFlowerFrames(atlas){
  flowerFrames=[]; plainFrames=[];
  for(let f=0;f<3;f++){
    const simple=document.createElement('canvas'); simple.width=100; simple.height=192;
    const sg=simple.getContext('2d'); sg.drawImage(atlas,f*100,0,100,192,0,0,100,192); plainFrames.push(simple);
    const c=document.createElement('canvas'); c.width=166; c.height=192;
    const g=c.getContext('2d');
    const halo=g.createRadialGradient(83,43,2,83,43,57);
    halo.addColorStop(0,'rgba(255,251,196,1)');
    halo.addColorStop(.13,'rgba(255,220,118,.88)');
    halo.addColorStop(.31,'rgba(255,163,126,.63)');
    halo.addColorStop(.52,'rgba(255,115,191,.39)');
    halo.addColorStop(.72,'rgba(238,91,205,.17)');
    halo.addColorStop(.90,'rgba(115,103,255,.045)');
    halo.addColorStop(1,'rgba(246,94,181,0)');
    g.fillStyle=halo; g.fillRect(20,0,126,108);
    g.drawImage(atlas,f*100,0,100,192,33,0,100,192); flowerFrames.push(c);
  }
}

function buildSky(){
  skyCanvas=document.createElement('canvas');
  skyCanvas.width=Math.max(1,Math.round(W*DPR)); skyCanvas.height=Math.max(1,Math.round(H*DPR));
  const s=skyCanvas.getContext('2d'); s.setTransform(DPR,0,0,DPR,0,0);
  const portrait=H>W;

  /*
    Cielo más vibrante pero pre-renderizado:
    no aumenta el costo de cada frame.
  */
  const bg=s.createLinearGradient(0,0,0,H);
  bg.addColorStop(0,'#020612');
  bg.addColorStop(.16,'#07162c');
  bg.addColorStop(.34,'#0c3152');
  bg.addColorStop(portrait?.51:.46,'#164a67');
  bg.addColorStop(portrait?.64:.57,'#123e42');
  bg.addColorStop(portrait?.74:.68,'#10281e');
  bg.addColorStop(1,'#030805');
  s.fillStyle=bg; s.fillRect(0,0,W,H);

  /*
    Profundidad azul/violeta en el cielo.
  */
  const nebulaA=s.createRadialGradient(W*.27,H*.18,0,W*.27,H*.18,Math.max(W,H)*.42);
  nebulaA.addColorStop(0,'rgba(73,104,205,.13)');
  nebulaA.addColorStop(.45,'rgba(49,72,150,.06)');
  nebulaA.addColorStop(1,'rgba(20,35,70,0)');
  s.fillStyle=nebulaA; s.fillRect(0,0,W,H*.62);

  const nebulaB=s.createRadialGradient(W*.72,H*.26,0,W*.72,H*.26,Math.max(W,H)*.34);
  nebulaB.addColorStop(0,'rgba(183,74,170,.070)');
  nebulaB.addColorStop(.52,'rgba(100,60,154,.028)');
  nebulaB.addColorStop(1,'rgba(80,45,120,0)');
  s.fillStyle=nebulaB; s.fillRect(0,0,W,H*.64);

  const haloY=portrait?H*.34:H*.38;
  const halo=s.createRadialGradient(W*.5,haloY,0,W*.5,haloY,Math.max(W,H)*.48);
  halo.addColorStop(0,'rgba(76,143,190,.25)');
  halo.addColorStop(.40,'rgba(35,91,121,.11)');
  halo.addColorStop(.72,'rgba(37,76,76,.045)');
  halo.addColorStop(1,'rgba(20,45,70,0)');
  s.fillStyle=halo; s.fillRect(0,0,W,H*.78);

  /*
    Más estrellas, pero siguen estando horneadas en skyCanvas.
  */
  const starCount=VERY_LOW?22:(MEDIUM?42:62);
  for(let i=0;i<starCount;i++){
    const x=hash(i*7.1)*W;
    const y=hash(i*11.3)*H*.35;
    const bright=.24+hash(i*4.3)*.65;
    const size=.42+hash(i*3.2)*1.05;

    s.globalAlpha=bright;
    s.fillStyle=(i%9===0)?'#fff1c7':'#edf6ff';
    s.beginPath(); s.arc(x,y,size,0,Math.PI*2); s.fill();

    /*
      Solo unas pocas estrellas grandes reciben destello.
    */
    if(i%17===0 && !VERY_LOW){
      s.globalAlpha=bright*.42;
      s.strokeStyle='#eef7ff';
      s.lineWidth=.55;
      s.beginPath();
      s.moveTo(x-size*3.2,y); s.lineTo(x+size*3.2,y);
      s.moveTo(x,y-size*3.2); s.lineTo(x,y+size*3.2);
      s.stroke();
    }
  }
  s.globalAlpha=1;

  const mx=portrait?W*.82:W*.88, my=portrait?H*.10:H*.13;
  const mr=clamp(Math.min(W,H)*.055,15,29);

  /*
    Halo lunar integrado en el cielo.
  */
  const moonGlow=s.createRadialGradient(mx,my,mr*.35,mx,my,mr*4.2);
  moonGlow.addColorStop(0,'rgba(244,247,255,.25)');
  moonGlow.addColorStop(.28,'rgba(205,221,255,.16)');
  moonGlow.addColorStop(.60,'rgba(167,187,255,.065)');
  moonGlow.addColorStop(1,'rgba(136,154,240,0)');
  s.fillStyle=moonGlow;
  s.fillRect(mx-mr*4.4,my-mr*4.4,mr*8.8,mr*8.8);

  const moon=s.createRadialGradient(mx-mr*.25,my-mr*.25,1,mx,my,mr);
  moon.addColorStop(0,'#fffef1');
  moon.addColorStop(.48,'#f3f3dd');
  moon.addColorStop(.75,'#d8def1');
  moon.addColorStop(1,'#9eabc9');
  s.fillStyle=moon; s.beginPath(); s.arc(mx,my,mr,0,Math.PI*2); s.fill();

  /*
    Cráteres muy sutiles para que no parezca un círculo plano.
  */
  s.globalAlpha=.10;
  s.fillStyle='#7584a4';
  s.beginPath(); s.arc(mx-mr*.20,my+mr*.08,mr*.17,0,Math.PI*2); s.fill();
  s.beginPath(); s.arc(mx+mr*.24,my-mr*.18,mr*.11,0,Math.PI*2); s.fill();
  s.beginPath(); s.arc(mx+mr*.12,my+mr*.29,mr*.08,0,Math.PI*2); s.fill();
  s.globalAlpha=1;

  /*
    Luz ambiental del suelo también se pre-renderiza.
    Esto mejora mucho el color sin crear gradientes cada frame.
  */
  fieldGroundLightCanvas=document.createElement('canvas');
  fieldGroundLightCanvas.width=Math.max(1,Math.round(W*DPR));
  fieldGroundLightCanvas.height=Math.max(1,Math.round(H*DPR));
  const g=fieldGroundLightCanvas.getContext('2d');
  g.setTransform(DPR,0,0,DPR,0,0);

  const horizonY=portrait?H*.31:H*.43;
  const horizonGlow=g.createLinearGradient(0,horizonY-H*.05,0,horizonY+H*.23);
  horizonGlow.addColorStop(0,'rgba(39,123,147,.00)');
  horizonGlow.addColorStop(.20,'rgba(56,151,151,.075)');
  horizonGlow.addColorStop(.44,'rgba(66,151,111,.075)');
  horizonGlow.addColorStop(.72,'rgba(46,123,80,.025)');
  horizonGlow.addColorStop(1,'rgba(30,93,60,0)');
  g.fillStyle=horizonGlow;
  g.fillRect(0,horizonY-H*.05,W,H*.32);

  const moonPath=g.createRadialGradient(mx,H*.66,0,mx,H*.66,Math.max(W,H)*.31);
  moonPath.addColorStop(0,'rgba(153,209,222,.080)');
  moonPath.addColorStop(.38,'rgba(95,172,173,.042)');
  moonPath.addColorStop(.72,'rgba(63,142,121,.018)');
  moonPath.addColorStop(1,'rgba(60,130,110,0)');
  g.fillStyle=moonPath;
  g.fillRect(0,H*.40,W,H*.60);

  const warmLow=g.createRadialGradient(W*.46,H*.88,0,W*.46,H*.88,Math.max(W,H)*.48);
  warmLow.addColorStop(0,'rgba(221,100,161,.035)');
  warmLow.addColorStop(.52,'rgba(132,91,168,.018)');
  warmLow.addColorStop(1,'rgba(80,70,130,0)');
  g.fillStyle=warmLow;
  g.fillRect(0,H*.48,W,H*.52);
}

function buildRows(){
  const portrait=H>W;
  let base,farCount;
  if(portrait){
    farCount=7;
    base=[
      {bottom:72,w:5,h:9,density:48,opacity:.012,speed:.07,grassH:6,grassOpacity:0,glow:false},
      {bottom:69,w:7,h:12,density:43,opacity:.028,speed:.10,grassH:8,grassOpacity:0,glow:false},
      {bottom:66,w:9,h:16,density:38,opacity:.055,speed:.14,grassH:10,grassOpacity:.01,glow:false},
      {bottom:63,w:11,h:20,density:34,opacity:.10,speed:.18,grassH:13,grassOpacity:.035,glow:false},
      {bottom:60,w:14,h:26,density:30,opacity:.18,speed:.23,grassH:17,grassOpacity:.08,glow:false},
      {bottom:56,w:17,h:32,density:27,opacity:.29,speed:.29,grassH:23,grassOpacity:.18,glow:true},
      {bottom:52,w:21,h:40,density:24,opacity:.43,speed:.36,grassH:30,grassOpacity:.32,glow:true},
      {bottom:48,w:25,h:48,density:22,opacity:.56,speed:.43,grassH:36,grassOpacity:.48,glow:true},
      {bottom:44,w:30,h:58,density:20,opacity:.66,speed:.50,grassH:44,grassOpacity:.59,glow:true},
      {bottom:39,w:36,h:69,density:18,opacity:.75,speed:.58,grassH:52,grassOpacity:.68,glow:true},
      {bottom:34,w:43,h:83,density:16,opacity:.82,speed:.66,grassH:60,grassOpacity:.75,glow:true},
      {bottom:28,w:51,h:98,density:14,opacity:.88,speed:.74,grassH:69,grassOpacity:.81,glow:true},
      {bottom:21,w:60,h:115,density:12,opacity:.93,speed:.82,grassH:78,grassOpacity:.87,glow:true},
      {bottom:14,w:70,h:134,density:10,opacity:.97,speed:.91,grassH:88,grassOpacity:.92,glow:true},
      {bottom:7,w:82,h:157,density:8,opacity:1,speed:.98,grassH:98,grassOpacity:.95,glow:true},
      {bottom:1,w:94,h:180,density:7,opacity:1,speed:1.04,grassH:108,grassOpacity:.97,glow:true}
    ];
  }else{
    farCount=5;
    base=[
      {bottom:58,w:5,h:10,density:72,opacity:.012,speed:.07,grassH:6,grassOpacity:0,glow:false},
      {bottom:55,w:7,h:13,density:62,opacity:.030,speed:.10,grassH:8,grassOpacity:0,glow:false},
      {bottom:52,w:9,h:17,density:54,opacity:.070,speed:.15,grassH:12,grassOpacity:.035,glow:false},
      {bottom:49,w:12,h:23,density:47,opacity:.15,speed:.22,grassH:19,grassOpacity:.12,glow:false},
      {bottom:46,w:15,h:29,density:43,opacity:.28,speed:.29,grassH:25,grassOpacity:.28,glow:true},
      {bottom:43,w:18,h:35,density:42,opacity:.48,speed:.38,grassH:32,grassOpacity:.60,glow:true},
      {bottom:40,w:21,h:40,density:38,opacity:.64,speed:.43,grassH:36,grassOpacity:.70,glow:true},
      {bottom:37,w:24,h:46,density:35,opacity:.69,speed:.48,grassH:40,grassOpacity:.73,glow:true},
      {bottom:34,w:28,h:53,density:32,opacity:.74,speed:.54,grassH:45,grassOpacity:.76,glow:true},
      {bottom:31,w:32,h:61,density:29,opacity:.79,speed:.60,grassH:50,grassOpacity:.79,glow:true},
      {bottom:27,w:37,h:70,density:27,opacity:.84,speed:.66,grassH:56,grassOpacity:.82,glow:true},
      {bottom:23,w:42,h:80,density:24,opacity:.88,speed:.72,grassH:62,grassOpacity:.85,glow:true},
      {bottom:19,w:48,h:91,density:22,opacity:.92,speed:.78,grassH:68,grassOpacity:.87,glow:true},
      {bottom:14,w:54,h:103,density:20,opacity:.95,speed:.84,grassH:76,grassOpacity:.90,glow:true},
      {bottom:9,w:61,h:116,density:18,opacity:.98,speed:.91,grassH:84,grassOpacity:.92,glow:true},
      {bottom:4,w:69,h:132,density:16,opacity:1,speed:1,grassH:94,grassOpacity:.95,glow:true}
    ];
  }

  const sizeScale=portrait?clamp(W/390,.82,1.12):clamp(H/390,.86,1.15);
  rows=base.map((a,i)=>{
    const spacing=W/a.density;
    const idealW=a.w*sizeScale, idealH=a.h*sizeScale;
    const w=Math.min(idealW,spacing*1.13);
    const h=idealH*(w/idealW);
    const depth=
      i/
      Math.max(
        1,
        base.length-1
      );

    const parallaxSpeed=
      a.speed*
      (
        .90+
        depth*.18
      );

    return{
      baseY:H*(1-a.bottom/100),w,h,spacing,speed:parallaxSpeed,alpha:a.opacity,
      phase:(i%2?.50:0)+(hash(i*19.3)-.5)*.10,index:i,
      grassH:a.grassH*sizeScale,grassAlpha:a.grassOpacity,
      horizon:i<farCount,glow:a.glow
    };
  });
}

function drawGroundBase(){
  const portrait=H>W;
  const horizon=portrait?H*.28:H*.405;
  const floor=ctx.createLinearGradient(0,horizon,0,H);
  floor.addColorStop(0,'rgba(21,67,59,.22)');
  floor.addColorStop(.08,'rgba(25,66,39,.66)');
  floor.addColorStop(.22,'#12341d');
  floor.addColorStop(.48,'#0b2515');
  floor.addColorStop(.74,'#07160d');
  floor.addColorStop(1,'#020704');
  ctx.fillStyle=floor; ctx.fillRect(0,horizon,W,H-horizon);
}

function drawGrassBand(grass,row){
  if(row.grassAlpha<=.005)return;
  const th=row.grassH;
  const tw=th*(grass.width/grass.height);
  const y=row.baseY+th*.08;
  const off=mod(worldX*(row.speed*.72),tw);
  ctx.globalAlpha=row.grassAlpha*.80;
  for(let x=-tw*2+off;x<W+tw*2;x+=tw){ctx.drawImage(grass,x,y-th,tw,th)}
  ctx.globalAlpha=1;
}

function drawTulip(row,j,x,time){
  const seed=j*31.71+row.index*173.9;
  const depth=row.index/Math.max(1,rows.length-1);
  const jitter=(hash(seed)-.5)*row.spacing*.10;
  const vertical=(hash(seed+9)-.5)*row.h*.035;

  const stormActive=
    !!window.MAGIC_STORM_ACTIVE;

  const stormIntensity=
    stormActive
    ? Math.max(
        0,
        Number(
          window.MAGIC_STORM_INTENSITY
          || 1
        )
      )
    : 0;


  const ambientWind=
    Math.max(
      0,
      Number(
        window.MAGIC_WIND_INTENSITY
        || 0
      )
    );


  const normalSway=
    (VERY_LOW||row.horizon)
    ? 0
    : (
        Math.sin(time*.00103+seed)*row.w*.013
        +
        Math.sin(time*.00063+seed*.37)*row.w*.005
      );

  /*
    Lluvia, niebla y tormenta ahora cambian
    físicamente el movimiento del campo.
  */

  const ambientSway=
    (
      !row.horizon &&
      ambientWind>0
    )
    ? (
        Math.sin(
          time*.0042+
          seed*.47
        )
        *
        row.w
        *
        .038
        *
        ambientWind
      )
    : 0;


  /*
    Durante la tormenta los tallos se inclinan
    con ráfagas mucho más fuertes.
  */
  const stormSway=
    (
      stormActive &&
      !row.horizon
    )
    ? (
        Math.sin(
          time*.0105 +
          seed*.39
        )
        *
        row.w
        *
        .105
        *
        stormIntensity
      )
    : 0;

  const xx=
    x+
    jitter+
    normalSway+
    ambientSway+
    stormSway;

  const yy=
    row.baseY+
    vertical;

  const naturalScale=
    .955+
    hash(seed+44.7)*.09;

  const drawW=
    row.w*
    naturalScale;

  const drawH=
    row.h*
    naturalScale;

  const lifePulse=
    row.horizon
    ? 1
    : .965+
      Math.sin(
        time*.00125+
        seed*.23
      )*.035;


  /*
    Algunos tulipanes cercanos son derribados
    durante la tormenta.

    No desaparece todo el campo:
    son huecos dispersos y tallos rotos.
  */

  if(
    stormActive &&
    !row.horizon &&
    row.index>=Math.max(0,rows.length-7)
  ){

    const damage=
      Math.max(
        0,
        Math.min(
          .55,
          Number(
            window.MAGIC_STORM_DAMAGE
            || 0
          )
        )
      );

    const chance=
      damage*
      (
        .34+
        depth*.84
      );


    if(
      hash(seed+771.9)<
      chance
    ){

      const lean=
        (
          hash(seed+80)-.5
        )
        *
        row.w*
        1.15;

      const brokenH=
        row.h*
        (
          .28+
          hash(seed+91)*.20
        );


      ctx.globalAlpha=
        row.alpha*.72;

      ctx.strokeStyle=
        'rgba(79,122,57,.88)';

      ctx.lineWidth=
        Math.max(
          1,
          row.w*.055
        );

      ctx.beginPath();

      ctx.moveTo(
        xx,
        yy
      );

      ctx.lineTo(
        xx+lean,
        yy-brokenH
      );

      ctx.stroke();


      /*
        Pétalos caídos.
      */

      ctx.fillStyle=
        'rgba(235,151,184,.82)';

      const petal=
        Math.max(
          1.4,
          row.w*.07
        );

      ctx.fillRect(
        xx+
        lean+
        row.w*.08,
        yy-
        brokenH+
        row.h*.05,
        petal*1.7,
        petal
      );

      ctx.fillRect(
        xx+
        lean-
        row.w*.16,
        yy-
        brokenH+
        row.h*.09,
        petal*1.4,
        petal*.9
      );


      ctx.globalAlpha=1;

      return;
    }
  }


  if(!row.horizon){
    ctx.globalAlpha=row.alpha*(.095+.20*depth)*lifePulse;
    ctx.drawImage(
      groundGlow,
      xx-drawW*.94,
      yy-drawH*.025,
      drawW*1.88,
      Math.max(6,drawH*.235)
    );
  }

  if(!row.glow){
    ctx.globalAlpha=row.alpha*lifePulse;
    ctx.drawImage(
      plainFrames[currentFrame],
      xx-drawW*.5,
      yy-drawH,
      drawW,
      drawH
    );
    ctx.globalAlpha=1; return;
  }

  const scale=drawH/192, compW=166*scale;
  ctx.globalAlpha=row.alpha*lifePulse;
  ctx.drawImage(
    flowerFrames[currentFrame],
    xx-compW*.5,
    yy-drawH,
    compW,
    drawH
  );

  /*
    Unos pocos tulipanes cercanos tienen un pequeño
    destello cálido. Son simples círculos, no filtros.
  */
  if(
    !VERY_LOW &&
    depth>.48 &&
    hash(seed+911.4)>.925
  ){
    const sparkle=
      .18+
      .22*
      (
        .5+
        .5*Math.sin(
          time*.0018+
          seed
        )
      );

    ctx.globalAlpha=
      row.alpha*
      sparkle;

    ctx.fillStyle='#fff1a9';
    ctx.beginPath();
    ctx.arc(
      xx+drawW*.06,
      yy-drawH*.78,
      Math.max(.7,drawW*.025),
      0,
      Math.PI*2
    );
    ctx.fill();
  }

  ctx.globalAlpha=1;
}

function drawDistanceMist(){
  const portrait=H>W;
  const top=portrait?H*.24:H*.375;
  const bottom=portrait?H*.52:H*.585;
  const mist=ctx.createLinearGradient(0,top,0,bottom);
  if(portrait){
    mist.addColorStop(0,'rgba(7,25,43,.84)');
    mist.addColorStop(.17,'rgba(10,39,55,.64)');
    mist.addColorStop(.36,'rgba(15,55,58,.42)');
    mist.addColorStop(.58,'rgba(20,58,46,.19)');
    mist.addColorStop(.80,'rgba(17,43,31,.065)');
    mist.addColorStop(1,'rgba(9,27,18,0)');
  }else{
    mist.addColorStop(0,'rgba(10,39,58,.69)');
    mist.addColorStop(.21,'rgba(14,51,60,.49)');
    mist.addColorStop(.44,'rgba(17,55,48,.29)');
    mist.addColorStop(.68,'rgba(14,42,31,.105)');
    mist.addColorStop(1,'rgba(9,28,18,0)');
  }
  ctx.fillStyle=mist; ctx.fillRect(0,top,W,bottom-top);
}

function render(grass){
  ctx.setTransform(DPR,0,0,DPR,0,0);
  ctx.clearRect(0,0,W,H);
  ctx.drawImage(skyCanvas,0,0,skyCanvas.width,skyCanvas.height,0,0,W,H);
  drawGroundBase();

  if(fieldGroundLightCanvas){
    ctx.globalAlpha=1;
    ctx.drawImage(
      fieldGroundLightCanvas,
      0,0,
      fieldGroundLightCanvas.width,
      fieldGroundLightCanvas.height,
      0,0,W,H
    );
  }

  const now=performance.now();
  let lastHorizon=-1;
  for(let i=0;i<rows.length;i++)if(rows[i].horizon)lastHorizon=i;

  for(let r=0;r<rows.length;r++){
    const row=rows[r];
    drawGrassBand(grass,row);
    const phase=row.phase*row.spacing;
    const off=mod(worldX*row.speed+phase,row.spacing);
    const start=-row.spacing*2+off;
    const count=Math.ceil(W/row.spacing)+5;
    for(let j=0;j<count;j++){
      const x=start+j*row.spacing+row.spacing*.5;
      drawTulip(row,j+r*101,x,now);
    }
    if(r===lastHorizon)drawDistanceMist();
  }

  const fg=ctx.createLinearGradient(0,H*.84,0,H);
  fg.addColorStop(0,'rgba(5,14,8,0)'); fg.addColorStop(1,'rgba(3,8,5,.25)');
  ctx.fillStyle=fg; ctx.fillRect(0,H*.84,W,H*.16);
}

function schedule(grass){if(raf)return;raf=requestAnimationFrame(()=>{raf=0;render(grass)})}

function resize(grass){
  W=Math.max(1,app.clientWidth); H=Math.max(1,app.clientHeight);
  let targetDpr,maxPixels;
  if(VERY_LOW){targetDpr=.92;maxPixels=520000}
  else if(MEDIUM){targetDpr=1.08;maxPixels=1020000}
  else{targetDpr=Math.min(window.devicePixelRatio||1,1.38);maxPixels=1550000}
  const allowed=Math.sqrt(maxPixels/(W*H));
  DPR=clamp(Math.min(targetDpr,allowed),.80,1.38);
  canvas.width=Math.max(1,Math.round(W*DPR)); canvas.height=Math.max(1,Math.round(H*DPR));
  canvas.style.width=W+'px'; canvas.style.height=H+'px';
  buildSky(); buildRows(); schedule(grass);
}

function startInertia(grass){
  cancelAnimationFrame(inertiaRAF); let previous=performance.now();
  function step(now){
    if(drag)return;
    const dt=Math.min(32,now-previous); previous=now;
    velocity*=Math.pow(.925,dt/16.67);
    if(Math.abs(velocity)<.07){velocity=0;return}
    worldX+=velocity*(dt/16.67); schedule(grass); inertiaRAF=requestAnimationFrame(step);
  }
  inertiaRAF=requestAnimationFrame(step);
}
