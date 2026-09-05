/* =========================================================
   PARADOX143 — PANEL DEV EXCLUSIVO ACTO III
   Solo existe con ?dev=1

   Este panel es INDEPENDIENTE del panel DEV grande del Acto II.
   Así el Acto III siempre queda visible aunque el otro panel
   sea muy largo o el navegador conserve una versión anterior.
========================================================= */

(() => {
  'use strict';

  if(
    !new URLSearchParams(
      location.search
    ).has('dev')
  ) return;

  function build(){
    if(
      document.getElementById(
        'paradoxAct3DevToggle'
      )
    ) return;

    const toggle=
      document.createElement(
        'button'
      );

    toggle.id=
      'paradoxAct3DevToggle';

    toggle.type='button';
    toggle.textContent='III';

    document.body.appendChild(
      toggle
    );

    const panel=
      document.createElement(
        'aside'
      );

    panel.id=
      'paradoxAct3DevPanel';

    panel.innerHTML=`
      <header>
        <div>
          <strong>
            ACTO III · DEV
          </strong>
          <small id="act3DevStatus">
            comprobando...
          </small>
        </div>

        <button
          id="act3DevClose"
          type="button"
        >
          ×
        </button>
      </header>

      <div class="act3DevGrid">
        <button data-act3dev="start">
          III · Amanecer
        </button>

        <button data-act3dev="world">
          Mundo nuevo
        </button>

        <button data-act3dev="remember">
          Ruta Recordar
        </button>

        <button data-act3dev="release">
          Ruta Dejar ir
        </button>

        <button data-act3dev="grow">
          Ruta Seguir creciendo
        </button>

        <button data-act3dev="no-change">
          Ruta NO CAMBIES
        </button>

        <button data-act3dev="secret">
          Epílogo secreto
        </button>

        <button data-act3dev="leave">
          Comparar · Campo Acto I
        </button>

        <button id="act3DevReset">
          Reiniciar Acto III
        </button>
      </div>

      <div class="act3DevHelp">
        Este panel es solo para pruebas.
        No aparece sin ?dev=1.
      </div>
    `;

    document.body.appendChild(
      panel
    );

    const status=
      panel.querySelector(
        '#act3DevStatus'
      );

    const refreshStatus=()=>{
      if(window.ParadoxAct3){
        const st=
          window.ParadoxAct3
            .state?.() || {};

        status.textContent=
          st.route
            ? `cargado · ${st.route}`
            : 'cargado';
        status.classList.add(
          'ok'
        );
      }else{
        status.textContent=
          'ACTO III NO CARGADO';
        status.classList.remove(
          'ok'
        );
      }
    };

    toggle.addEventListener(
      'click',
      ()=>{
        panel.classList.toggle(
          'show'
        );

        refreshStatus();
      }
    );

    panel.querySelector(
      '#act3DevClose'
    ).addEventListener(
      'click',
      ()=>{
        panel.classList.remove(
          'show'
        );
      }
    );

    panel.querySelectorAll(
      '[data-act3dev]'
    ).forEach(
      b=>{
        b.addEventListener(
          'click',
          ()=>{
            const action=
              b.dataset.act3dev;

            if(
              !window.ParadoxAct3
            ){
              status.textContent=
                'ERROR: act3.js no está cargado';

              return;
            }

            panel.classList.remove(
              'show'
            );

            if(action==='leave'){
              window.ParadoxAct3
                .deactivate?.({restoreField:true});
            }else{
              window.ParadoxAct3
                .debug?.(
                  action
                );
            }

            setTimeout(
              refreshStatus,
              250
            );
          }
        );
      }
    );

    panel.querySelector(
      '#act3DevReset'
    ).addEventListener(
      'click',
      ()=>{
        if(
          !window.ParadoxAct3
        ){
          status.textContent=
            'ERROR: act3.js no está cargado';
          return;
        }

        panel.classList.remove(
          'show'
        );

        window.ParadoxAct3
          .reset?.();
      }
    );

    setInterval(
      refreshStatus,
      1500
    );

    refreshStatus();
  }

  if(
    document.readyState==='loading'
  ){
    document.addEventListener(
      'DOMContentLoaded',
      build,
      {once:true}
    );
  }else{
    build();
  }
})();
