/* =========================================================
   PARADOX143 — EL ARCHIVO V2
   Ruta secreta "NO CAMBIES"

   Horror analógico / psicológico SIN gore.

   Esta versión ya no es una simple sucesión de textos:
   - primero obliga a revisar todos los registros;
   - no hay contador;
   - cada registro devuelve información incompleta;
   - TULUZ no puede ser archivado porque apareció después;
   - después comienza una reproducción cerrada del mundo.
========================================================= */

(() => {
  'use strict';

  let overlay=null;
  let indexView=null;
  let playbackView=null;
  let preview=null;
  let startButton=null;
  let room=0;
  let openFlag=false;
  let seen=new Set();
  let commandsSeen=new Set();

  const RECORDS=[
    {
      id:'field',
      code:'FIELD_0001',
      label:'CAMPO',
      preview:'estado: RECUPERABLE\nposición: conocida\nvariación: 18.4%'
    },
    {
      id:'moon',
      code:'MOON_0002',
      label:'LUNA',
      preview:'estado: RECUPERABLE\nfase: no coincide\ncorregir: SÍ'
    },
    {
      id:'mewo',
      code:'MEWO_0015',
      label:'MEWO',
      preview:'estado: RECUPERABLE\ncopias encontradas: 04\nseleccionando la más antigua...'
    },
    {
      id:'marie',
      code:'MARIE_0030',
      label:'MARIE',
      preview:'estado: RECUPERABLE\nforma: inestable\nreintentos previos: 12'
    },
    {
      id:'tuluz',
      code:'TULUZ_NULL',
      label:'TULUZ',
      preview:'ERROR: NO SOURCE DATE\nERROR: BEFORE/AFTER MISMATCH\nno existe versión anterior'
    },
    {
      id:'home',
      code:'HOME_0079',
      label:'HOGAR',
      preview:'estado: RECUPERABLE\nobjetos: 31\nespacio libre: 00\nbloquear cambios: disponible'
    },
    {
      id:'weather',
      code:'WEATHER_ALL',
      label:'CLIMA',
      preview:'rain / storm / snow / stars\nframes recuperables: 891\nvariación encontrada: DEMASIADA'
    },
    {
      id:'letters',
      code:'LETTERS_0099',
      label:'CARTAS',
      preview:'99 objetos válidos\n1 objeto sin índice\nCARD_0100: NOT SAVED'
    },
    {
      id:'future',
      code:'FUTURE_NULL',
      label:'DESPUÉS',
      preview:'permiso: DENEGADO\nsource: NONE\nframes: 0\ncrear nuevos frames: BLOQUEADO'
    }
  ];

  const ROOMS=[
    {
      title:'NO CAMBIES',
      meta:'RECOVERY MODE / LOCK = TRUE',
      text:'Si todo queda exactamente igual, nada tendrá que perderse otra vez.',
      cls:'archive-tulips',
      action:'REPRODUCIR'
    },
    {
      title:'FIELD_0001',
      meta:'FRAME 000001 / 00:00:00',
      text:'Cada tulipán ocupa el lugar correcto.',
      cls:'archive-repeat',
      action:'SIGUIENTE'
    },
    {
      title:'FIELD_0001',
      meta:'FRAME 000001 / 00:00:00',
      text:'Cada tulipán ocupa el lugar correcto.',
      cls:'archive-repeat-2',
      action:'SIGUIENTE'
    },
    {
      title:'MOON_0002',
      meta:'PHASE CORRECTION 100%',
      text:'La luna vuelve a la misma fase. La misma noche. El mismo cielo.',
      cls:'archive-moon',
      action:'SIGUIENTE'
    },
    {
      title:'MEWO_0015',
      meta:'PLAYBACK LOOP / TAKE 01',
      text:'Mewo vuelve a sentarse.',
      cls:'archive-mewo-1',
      action:'SIGUIENTE'
    },
    {
      title:'MEWO_0015',
      meta:'PLAYBACK LOOP / TAKE 01',
      text:'Mewo vuelve a sentarse.',
      cls:'archive-mewo-2',
      action:'SIGUIENTE'
    },
    {
      title:'MARIE_0030',
      meta:'PLAYBACK LOOP / TAKE 04',
      text:'Marie vuelve a dormir.',
      cls:'archive-marie',
      action:'SIGUIENTE'
    },
    {
      title:'HOME_0079',
      meta:'WORLD STATUS / READ ONLY',
      text:'Todo está exactamente donde debería estar.',
      cls:'archive-home',
      action:'SIGUIENTE'
    },
    {
      title:'TULUZ_NULL',
      meta:'SOURCE NOT FOUND',
      text:'Tuluz no encaja.',
      cls:'archive-tuluz',
      action:'REINTENTAR'
    },
    {
      title:'TULUZ_NULL',
      meta:'SEARCHING BEFORE 0000...',
      text:'No existe una versión antigua suya que pueda archivarse.',
      cls:'archive-gap',
      action:'REINTENTAR'
    },
    {
      title:'TULUZ_NULL',
      meta:'SOURCE DATE: AFTER BACKUP',
      text:'El Archivo está intentando recordar algo que todavía no había ocurrido.',
      cls:'archive-future',
      action:'...'
    },
    {
      title:'WEATHER_ALL',
      meta:'NORMALIZING VARIATION...',
      text:'La lluvia cae exactamente igual cada vez.',
      cls:'archive-rain-loop',
      action:'SIGUIENTE'
    },
    {
      title:'LETTERS_0099',
      meta:'99 / 99 VALID · CARD_0100 MISSING',
      text:'La colección está completa si ignoramos lo que no pudo guardarse.',
      cls:'archive-letters',
      action:'SIGUIENTE'
    },
    {
      title:'FUTURE_NULL',
      meta:'NEW FRAME CREATION = DISABLED',
      text:'El futuro no contiene errores.',
      cls:'archive-future-null',
      action:'...'
    },
    {
      title:'FUTURE_NULL',
      meta:'NEW FRAME CREATION = DISABLED',
      text:'El futuro tampoco contiene nada.',
      cls:'archive-future-null-2',
      action:'BACK'
    },
    {
      title:'WORLD_LOCK',
      meta:'CHANGES DISABLED',
      text:'Nada puede perderse aquí.',
      cls:'archive-still',
      action:'...'
    },
    {
      title:'WORLD_LOCK',
      meta:'CHANGES DISABLED',
      text:'Nada puede ocurrir aquí.',
      cls:'archive-still-2',
      action:'...'
    },
    {
      title:'',
      meta:'NO NEW FRAMES',
      text:'Nada volverá a pasar.',
      cls:'archive-dark',
      action:'...'
    },
    {
      title:'',
      meta:'',
      text:'Un recuerdo que nunca cambia deja de ser un lugar donde vivir.',
      cls:'archive-dead',
      action:'...'
    },
    {
      title:'',
      meta:'WRITE ACCESS REQUEST',
      text:'Solo tendríamos que permitir que mañana sea diferente de ayer.',
      cls:'archive-exit',
      action:'PERMITIRLO'
    }
  ];

  function build(){
    if(overlay) return;

    overlay=document.createElement('section');
    overlay.id='act2Archive';
    overlay.setAttribute('aria-hidden','true');

    overlay.innerHTML=`
      <div id="act2ArchiveNoise"></div>
      <div id="act2ArchiveScan"></div>

      <header id="act2ArchiveHeader">
        <span>PARADOX RECOVERY ARCHIVE</span>
        <small>READ ONLY · LOCAL MEMORY</small>
      </header>

      <div id="act2ArchiveIndex">
        <div class="archiveIndexIntro">
          <small>INDEX RECOVERED</small>
          <p>Verifica los registros antes de bloquear el mundo.</p>
        </div>

        <div id="act2ArchiveRecords"></div>

        <pre id="act2ArchivePreview">selecciona un registro</pre>

        <div id="act2ArchiveCommands">
          <button type="button" data-cmd="recover">RECOVER</button>
          <button type="button" data-cmd="replace">REPLACE</button>
          <button type="button" data-cmd="ignore">IGNORE</button>
          <button type="button" data-cmd="lock">LOCK</button>
        </div>

        <button id="act2ArchiveStart" type="button" disabled>
          LOCK WORLD
        </button>
      </div>

      <div id="act2ArchivePhantom"></div>

      <div id="act2ArchivePlayback">
        <div id="act2ArchiveVisual">
          <div class="archiveGrid"></div>
          <div class="archiveMoon"></div>
          <div class="archiveTulips"></div>

          <div class="archiveCopies">
            <img src="mewo_idle.png" alt="">
            <img src="mewo_idle.png" alt="">
            <img src="mewo_idle.png" alt="">
            <img src="cat_gray_sleep.png" alt="">
            <img src="cat_gray_sleep.png" alt="">
            <img src="cat_orange_idle.png" alt="">
          </div>

          <div class="archiveTimestamp">00:00:00:00</div>
          <div class="archiveRec">● REC</div>
        </div>

        <div id="act2ArchiveWords">
          <small id="act2ArchiveTitle"></small>
          <code id="act2ArchiveMeta"></code>
          <p id="act2ArchiveText"></p>
          <button id="act2ArchiveAction" type="button">SIGUIENTE</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    indexView=overlay.querySelector('#act2ArchiveIndex');
    playbackView=overlay.querySelector('#act2ArchivePlayback');
    preview=overlay.querySelector('#act2ArchivePreview');
    startButton=overlay.querySelector('#act2ArchiveStart');

    const records=overlay.querySelector('#act2ArchiveRecords');

    RECORDS.forEach(record=>{
      const b=document.createElement('button');
      b.type='button';
      b.dataset.record=record.id;
      b.innerHTML=`
        <code>${record.code}</code>
        <span>${record.label}</span>
        <i>UNREAD</i>
      `;

      b.addEventListener('click',()=>{
        inspectRecord(record,b);
      });

      records.appendChild(b);
    });

    startButton.addEventListener('click',startPlayback);
    overlay.querySelector('#act2ArchiveAction').addEventListener('click',next);

    overlay.querySelectorAll('#act2ArchiveCommands [data-cmd]').forEach(button=>{
      button.addEventListener('click',()=>{
        inspectCommand(button.dataset.cmd,button);
      });
    });
  }

  function inspectRecord(record,button){
    seen.add(record.id);

    button.classList.add('seen');
    button.querySelector('i').textContent=
      record.id==='tuluz'
        ? 'ERROR'
        : 'READ';

    preview.textContent=
      `${record.code}\n${record.preview}`;

    overlay.classList.remove('record-flash');
    void overlay.offsetWidth;
    overlay.classList.add('record-flash');

    if(seen.size>=RECORDS.length){
      overlay.classList.add('commands-ready');

      setTimeout(()=>{
        preview.textContent=
          '9 REGISTROS LEÍDOS\n\nCOMMAND INTERFACE = AVAILABLE\n\nno existe una opción que devuelva exactamente el mundo anterior.';
      },450);
    }
  }


  function inspectCommand(cmd,button){
    if(seen.size<RECORDS.length) return;

    commandsSeen.add(cmd);
    button.classList.add('seen');

    const messages={
      recover:
        'RECOVER\\n\\nvariaciones detectadas: 184\\nresultado: mundo recuperable, no idéntico.',
      replace:
        'REPLACE\\n\\nSOURCE REQUIRED\\nno existe una fuente perfecta que pueda reemplazar el presente.',
      ignore:
        'IGNORE\\n\\nRETURN PATH NOT FOUND\\nignorar los cambios no deshace que hayan ocurrido.',
      lock:
        'LOCK\\n\\nREAD ONLY MODE AVAILABLE\\nningún frame nuevo será permitido.'
    };

    preview.textContent=
      messages[cmd] ||
      'UNKNOWN COMMAND';

    flashPhantom(
      cmd==='lock'
        ? 'NEW FRAME CREATION = DISABLED'
        : cmd.toUpperCase(),
      105
    );

    if(commandsSeen.size>=4){
      startButton.disabled=false;
      startButton.classList.add('ready');
      startButton.textContent='LOCK WORLD';
    }
  }

  function flashPhantom(text='',duration=90){
    const el=
      overlay?.querySelector(
        '#act2ArchivePhantom'
      );

    if(!el) return;

    el.textContent=text;
    el.classList.remove('show');
    void el.offsetWidth;
    el.classList.add('show');

    clearTimeout(flashPhantom.timer);
    flashPhantom.timer=setTimeout(
      ()=>el.classList.remove('show'),
      duration
    );
  }

  function open(){
    if(openFlag) return;

    build();

    openFlag=true;
    room=0;
    seen=new Set();
    commandsSeen=new Set();

    window.ParadoxAct2?.suppressObjectives?.(true);
    document.body.classList.add('act2-archive-open');

    overlay.classList.add('show');
    overlay.setAttribute('aria-hidden','false');

    indexView.classList.add('show');
    playbackView.classList.remove('show');
    startButton.disabled=true;
    startButton.classList.remove('ready');
    startButton.textContent='LOCK WORLD';
    preview.textContent='selecciona un registro';
    overlay.classList.remove('commands-ready');

    overlay
      .querySelectorAll('#act2ArchiveCommands [data-cmd]')
      .forEach(b=>b.classList.remove('seen'));

    overlay
      .querySelectorAll('#act2ArchiveRecords button')
      .forEach(b=>{
        b.classList.remove('seen');
        b.querySelector('i').textContent='UNREAD';
      });
  }

  function startPlayback(){
    if(seen.size<RECORDS.length) return;

    room=0;
    indexView.classList.remove('show');
    playbackView.classList.add('show');

    render();
  }

  function render(){
    const r=ROOMS[room];

    if(!r){
      finish();
      return;
    }

    const title=overlay.querySelector('#act2ArchiveTitle');
    const meta=overlay.querySelector('#act2ArchiveMeta');
    const text=overlay.querySelector('#act2ArchiveText');
    const action=overlay.querySelector('#act2ArchiveAction');
    const visual=overlay.querySelector('#act2ArchiveVisual');

    title.textContent=r.title;
    meta.textContent=r.meta;
    text.textContent=r.text;
    action.textContent=r.action;

    visual.className=r.cls;
    overlay.dataset.room=String(room);

    const phantomFrames={
      1:'00:00:00:00',
      3:'CARD_0100 = NOT SAVED',
      6:'SHE LOOKED DIFFERENT',
      9:'TULUZ_NULL',
      11:'SOURCE DATE: AFTER BACKUP',
      13:'NO NEW FRAMES',
      16:'NOTHING HAPPENED',
      18:'BACK'
    };

    if(phantomFrames[room]){
      setTimeout(
        ()=>flashPhantom(
          phantomFrames[room],
          room===18?180:78
        ),
        130
      );
    }

    /*
      Algunos cuadros parecen trabarse / repetirse a propósito.
      La imagen cambia ligeramente aunque el texto sea idéntico.
    */
    overlay.classList.remove('shift');
    void overlay.offsetWidth;
    overlay.classList.add('shift');
  }

  function next(){
    if(room>=ROOMS.length-1){
      finish();
      return;
    }

    room++;
    render();
  }

  function finish(){
    if(!openFlag) return;

    openFlag=false;

    overlay.classList.remove('show');
    overlay.setAttribute('aria-hidden','true');

    document.body.classList.remove('act2-archive-open');

    window.ParadoxAct2?.save?.({
      archiveSeen:true,
      exactChoices:0,
      acceptChoices:1
    });

    window.ParadoxAct2?.suppressObjectives?.(false);

    try{
      window.dispatchEvent(
        new CustomEvent(
          'paradox-act2-archive-finished'
        )
      );
    }catch(_){}
  }

  document.addEventListener(
    'DOMContentLoaded',
    ()=>setTimeout(build,800)
  );

  window.ParadoxAct2Archive={
    open,
    close:finish,
    isOpen:()=>openFlag
  };
})();
