/* =========================================================
   PARADOX143 — MODO CREADOR / DEV
   SOLO aparece si la URL contiene ?dev=1
========================================================= */

(() => {
  'use strict';

  if(!new URLSearchParams(location.search).has('dev')) return;

  let panel=null;

  function build(){
    if(panel) return;

    const toggle=document.createElement('button');
    toggle.id='paradoxDevToggle';
    toggle.type='button';
    toggle.textContent='DEV';
    document.body.appendChild(toggle);

    panel=document.createElement('aside');
    panel.id='paradoxDevPanel';
    panel.innerHTML=`
      <header>
        <strong>PARADOX · DEV</strong>
        <button id="devClose" type="button">×</button>
      </header>

      <div class="devGrid tools">
        <button id="devCard100Full">100 → ACTO II · PRUEBA COMPLETA</button>
      </div>

      <div class="devGrid">
        <button data-ch="0">II · Despertar</button>
        <button data-ch="1">Primer recuerdo</button>
        <button data-ch="2">Mewo</button>
        <button data-ch="3">Refugio</button>
        <button data-ch="4">Marie</button>
        <button data-ch="5">Tuluz</button>
        <button data-ch="6">Reconstruir</button>
        <button data-ch="7">Final Acto II</button>
      </div>
      <div class="devLabel">FRAGMENTOS</div>
      <div class="devGrid fragments">
        <button data-fr="before">I Antes</button>
        <button data-fr="first">II La primera</button>
        <button data-fr="keep">III Guardar</button>
        <button data-fr="missing">IV Lo que falta</button>
        <button data-fr="marie">V Marie</button>
        <button data-fr="tuluz">VI Tuluz</button>
        <button data-fr="remains">VII Lo que queda</button>
      </div>
      <div class="devGrid tools">
        <button id="devArchive">EL ARCHIVO</button>
        <button id="devAllFragments">7 fragmentos</button>
        <button id="devResetAct2">Reiniciar Acto II</button>
      </div>

      <div class="devLabel">PUZZLES PRINCIPALES · QA</div>

      <div class="devGrid">
        <button data-core-puzzle="0">P0 Radio</button>
        <button data-core-puzzle="1">P1 Tulipán</button>
        <button data-core-puzzle="2">P2 Huellas</button>
        <button data-core-puzzle="3">P3 Circuito</button>
        <button data-core-puzzle="4">P4 Marie</button>
        <button data-core-puzzle="5">P5 Tuluz</button>
        <button data-core-puzzle="6">P6 Recuerdo/Copia</button>
        <button data-core-puzzle="7">P7 Vacío</button>
      </div>

      <div class="devLabel">V4 · RUPTURA TOTAL</div>

      <div class="devGrid">
        <button data-v4="radio">Radio física</button>
        <button data-v4="basket">Canasta vacía</button>
        <button data-v4="false">Recuerdos falsos</button>
        <button data-v4="return">Falso Acto I</button>
        <button data-v4="sound">Puzzle sonido</button>
        <button data-v4="edge">Borde + persecución</button>
        <button data-v4="relay">Relay 1-4-3</button>
        <button data-v4="still">No hacer nada</button>
        <button data-v4="walk">Recorrido final</button>
      </div>
      <div class="devLabel">V5 · ESTACIÓN 143</div>

      <div class="devGrid">
        <button data-v5="mewo">Mewo espera</button>
        <button data-v5="station">Estación 143</button>
        <button data-v5="tape">Cinta 100</button>
        <button data-v5="storm">Tormenta congelada</button>
        <button data-v5="learn">Habitación aprende</button>
        <button data-v5="maze">Laberinto atrás</button>
        <button data-v5="camera">Cámara rebelde</button>
        <button data-v5="recover99">Recover 99%</button>
        <button data-v5="symbols">Palabras → símbolos</button>
        <button data-v5="symmetry">Tuluz rompe puzzle</button>
      </div>

      <div class="devLabel">ACTO III · RUTAS</div>

      <div class="devGrid">
        <button data-act3="start">III · Amanecer</button>
        <button data-act3="world">Mundo nuevo</button>
        <button data-act3="remember">Ruta Recordar</button>
        <button data-act3="release">Ruta Dejar ir</button>
        <button data-act3="grow">Ruta Seguir creciendo</button>
        <button data-act3="no-change">Ruta NO CAMBIES</button>
        <button data-act3="secret">Epílogo secreto</button>
        <button id="devResetAct3">Reiniciar Acto III</button>
      </div>

      <pre id="devState"></pre>
    `;
    document.body.appendChild(panel);

    toggle.addEventListener('click',()=>panel.classList.toggle('show'));
    panel.querySelector('#devClose').addEventListener('click',()=>panel.classList.remove('show'));

    panel.querySelector('#devCard100Full').addEventListener('click',()=>{
      /*
        Reinicia SOLO la historia DEV.
        No toca cartas, gatos, crafting ni el juego público.
      */
      try{
        localStorage.removeItem('paradox143_act2_v1');
        localStorage.removeItem('paradox143_fragments_v1');
        localStorage.removeItem('paradox143_act2_world_v4');
        localStorage.removeItem('paradox143_act2_v5');

        const raw=
          localStorage.getItem(
            'paradox143_story_v1'
          );

        const story=
          raw
            ? JSON.parse(raw)
            : {};

        delete story.card100Seen;
        delete story.card100Started;
        delete story.card100At;
        delete story.card100StartedAt;
        delete story.act2Started;
        delete story.act2Finished;

        story.act=1;
        story.phase='warm';

        localStorage.setItem(
          'paradox143_story_v1',
          JSON.stringify(story)
        );
      }catch(_){}

      location.href=
        location.pathname+
        '?dev=1&card100=1';
    });

    panel.querySelectorAll('[data-ch]').forEach(b=>b.addEventListener('click',()=>{
      window.ParadoxAct2?.jumpChapter?.(Number(b.dataset.ch));
      refresh();
    }));

    panel.querySelectorAll('[data-fr]').forEach(b=>b.addEventListener('click',()=>{
      window.ParadoxAct2Fragments?.play?.(b.dataset.fr);
      refresh();
    }));

    panel.querySelectorAll('[data-core-puzzle]').forEach(
      b=>b.addEventListener('click',()=>{
        panel.classList.remove('show');

        const n=
          Number(
            b.dataset.corePuzzle
          );

        setTimeout(
          ()=>window.ParadoxAct2?.openPuzzle?.(n),
          120
        );
      })
    );

    panel.querySelectorAll('[data-v4]').forEach(b=>b.addEventListener('click',()=>{
      panel.classList.remove('show');
      window.ParadoxAct2WorldV4?.debug?.(b.dataset.v4);
      setTimeout(refresh,300);
    }));

    panel.querySelectorAll('[data-v5]').forEach(
      b=>b.addEventListener('click',()=>{
        panel.classList.remove('show');

        window.ParadoxAct2V5
          ?.debug
          ?.(b.dataset.v5);

        setTimeout(
          refresh,
          300
        );
      })
    );

    panel.querySelectorAll('[data-act3]').forEach(
      b=>b.addEventListener('click',()=>{
        panel.classList.remove('show');

        window.ParadoxAct3
          ?.debug
          ?.(b.dataset.act3);

        setTimeout(
          refresh,
          300
        );
      })
    );

    panel.querySelector('#devResetAct3')
      ?.addEventListener('click',()=>{
        panel.classList.remove('show');
        window.ParadoxAct3?.reset?.();
      });

    panel.querySelector('#devArchive').addEventListener('click',()=>window.ParadoxAct2Archive?.open?.());
    panel.querySelector('#devAllFragments').addEventListener('click',()=>{
      ['before','first','keep','missing','marie','tuluz','remains'].forEach(id=>window.ParadoxAct2Fragments?.collect?.(id));
      window.ParadoxAct2?.render?.();
      refresh();
    });
    panel.querySelector('#devResetAct2').addEventListener('click',()=>{
      if(confirm('¿Reiniciar solo el Acto II y sus fragmentos?')) window.ParadoxAct2?.reset?.();
    });

    setInterval(refresh,1200);
    refresh();
  }

  function refresh(){
    if(!panel) return;
    const state=window.ParadoxAct2?.state?.()||{};
    const fragments=window.ParadoxAct2Fragments?.found?.()||[];
    const v4=window.ParadoxAct2WorldV4?.state?.()||{};
    const v5=window.ParadoxAct2V5?.state?.()||{};
    const act3=window.ParadoxAct3?.state?.()||{};

    panel.querySelector('#devState').textContent=JSON.stringify({
      chapter:state.chapter,
      chapterName:state.chapterName,
      exact:state.exactChoices,
      accept:state.acceptChoices,
      archive:state.archiveSeen,
      fragments,
      v4:{
        radio:v4.radioFound,
        basket:v4.emptyBasketSeen,
        falseMemories:v4.falseMemoriesDone,
        falseReturn:v4.falseReturnDone,
        sound:v4.soundCorridorDone,
        edge:v4.edgeDone,
        relay143:v4.relay143Done,
        still:v4.stillRoomDone,
        finalWalk:v4.finalWalkDone,
        futureGlimpse:v4.futureGlimpseSeen
      },
      v5:{
        mewo:v5.mewoWaitDone,
        station:v5.stationDone,
        tape100:v5.tape100Seen,
        storm:v5.stormDone,
        learn:v5.learningRoomDone,
        marie:v5.marieRevealDone,
        maze:v5.mazeDone,
        camera:v5.cameraLossDone,
        recover99:v5.recover99Done,
        symbols:v5.symbolsDone,
        symmetry:v5.symmetryDone
      },
      act3:{
        dawn:act3.dawnSeen,
        nodes:act3.nodes,
        choices:act3.choices,
        route:act3.route,
        ending:act3.endingSeen,
        newMemory:act3.newMemoryDone,
        secret:act3.secretSeen
      }
    },null,2);
  }

  document.addEventListener('DOMContentLoaded',()=>setTimeout(build,900));
})();
