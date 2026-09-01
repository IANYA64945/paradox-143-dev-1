/* =========================================================
   PARCHE: LUNA + CANASTA DE CARTAS
   - 3 toques en la luna
   - brillo especial
   - mensaje secreto
   - caída de una cartita
   - canasta que guarda las cartas encontradas
========================================================= */

(() => {
  const STORAGE_KEY = 'paradox143_letters_v1';

  const LETTERS = {
    intro: {
      title: 'Primera carta',
      mark: '♡',
      text: '“Te amaré un día más por cada tulipán aquí plantado.”'
    },
    moon: {
      title: 'Carta de la luna',
      mark: '☾',
      text: 'Si llegaste hasta aquí y miraste la luna tres veces, encontraste un pedacito más de mí. Incluso cuando el campo duerme, sigo pensando en ti. ♡'
    },
    final: {
      title: 'Carta encontrada',
      mark: '✦',
      text: 'Y si algún día dudas de cuánto te quiero, vuelve a mirar este campo. Todavía quedan infinitos tulipanes por contar.'
    },
    'game-lost': {
      title: 'No te rindas ♡',
      mark: '♡',
      text: 'Mientras sigas intentando, jamás habrás fracasado para mí..'
    },

    /* =====================================================
       COLECCIÓN JARDÍN DE GATOS I — 18 CARTAS
    ===================================================== */

    'garden-first': {
      title: 'Un pequeño refugio ♡',
      mark: '⌂',
      text: 'entre tantos tulipanes encontramos un pequeño lugar para descansar.. un rinconcito donde incluso el mundo parece hablar un poquito mas bajito ♡'
    },

    'garden-return': {
      title: 'Volviste ♡',
      mark: '↺',
      text: 'me gusta pensar que algunos lugares dejan de ser solo lugares cuando alguien decide volver a ellos..'
    },

    'garden-pillow': {
      title: 'Su lugar favorito',
      mark: '☾',
      text: 'al final no importaba cuanto tardaramos en hacerla.. verla descansar aqui hizo que cada pequeño esfuerzo valiera la pena ♡'
    },

    'garden-sleep': {
      title: 'Mientras duerme',
      mark: 'zZ',
      text: 'shhh.. por un momento dejemos que todo siga girando sin nosotros. ella duerme tranquila y yo me quedaria aqui contigo un poquito mas..'
    },

    'garden-pet': {
      title: 'Un poquito de cariño',
      mark: '♡',
      text: 'a veces algo tan pequeño como una caricia basta para recordarnos que sentirse querido tambien puede ser un hogar.'
    },

    'garden-feed': {
      title: 'Hora de comer',
      mark: '◇',
      text: 'quizas cuidar a alguien tambien sea esto.. recordar las cosas pequeñas incluso cuando nadie nos pide que lo hagamos ♡'
    },

    'garden-play': {
      title: 'Solo un rato más',
      mark: '✦',
      text: 'si alguna vez todo se vuelve demasiado serio espero que podamos seguir encontrando razones tontas para jugar un rato mas..'
    },

    'garden-ball': {
      title: 'La pelotita',
      mark: '●',
      text: 'no se quien se divierte mas persiguiendo esa pelota.. mewo o yo viendola hacerlo ♡'
    },

    'garden-fish': {
      title: 'El pececito',
      mark: '◇',
      text: 'lo empuja, lo mira, vuelve a empujarlo y actua como si nada hubiera pasado.. definitivamente este juguete ya tiene dueña.'
    },

    'garden-yarn': {
      title: 'Un pequeño desastre',
      mark: '⌁',
      text: 'el ovillo ya no esta donde lo dejamos y probablemente nunca vuelva a estarlo.. creo que eso significa que a mewo le gusto ♡'
    },

    'garden-scratcher': {
      title: 'Valió la pena',
      mark: '⌂',
      text: 'lo construimos poco a poco y ahora ella lo usa como si siempre hubiera estado aqui.. algunas cosas tardan en construirse pero pueden terminar sintiendose como hogar.'
    },

    'garden-all-toys': {
      title: 'Sus tesoros',
      mark: '✦',
      text: 'una pelota, un pececito, un ovillo y una gata completamente convencida de que absolutamente todo este jardin le pertenece ♡'
    },

    'garden-rain': {
      title: 'Lluvia afuera',
      mark: '◇',
      text: 'puedo escuchar la lluvia desde aqui.. pero esta vez no tenemos que correr. podemos quedarnos bajo techo mirando como cae juntos ♡'
    },

    'garden-storm': {
      title: 'Mientras truena',
      mark: '⚡',
      text: 'afuera puede hacer todo el ruido que quiera.. mientras tengamos un pequeño lugar al cual volver no todo tiene que dar miedo.'
    },

    'garden-snow': {
      title: 'Frío afuera',
      mark: '❄',
      text: 'el frio puede quedarse en los bordes del jardin.. aqui dentro tenemos almohadas, una gatita y suficientes razones para quedarnos un rato mas ♡'
    },

    'garden-stars': {
      title: 'Desde aquí también se ven',
      mark: '✦',
      text: 'no hace falta estar en medio del cielo para pedir un deseo.. desde este pequeño rincon las estrellas siguen encontrandonos.'
    },

    'garden-night': {
      title: 'Cuando todo está tranquilo',
      mark: '☾',
      text: 'hay momentos en los que no pasa absolutamente nada.. y aun asi no quisiera estar en ningun otro lugar.'
    },

    'garden-home': {
      title: 'Hogar ♡',
      mark: '⌂',
      text: 'primero fue solo un claro entre los arboles.. luego llego una almohada, algunos juguetes, mewo y un monton de pequeños recuerdos. supongo que asi empiezan los hogares.'
    },

    /* =====================================================
       NUEVOS GATITOS DEL REFUGIO
    ===================================================== */

    'garden-gray-arrival': {
      title: '¿Me extrañaste?',
      mark: '♡',
      text: 'me extrañaste?.. volvi a este pequeño refugio porque yo tambien queria estar cerquita de ti.. hay cariños que siempre encuentran el camino de regreso ♡'
    },

    'garden-orange-arrival': {
      title: 'Y trajo compañía ♡',
      mark: '♡',
      text: 'y no llego sola.. con ella tambien vino un pequeño solecito naranja. quizas no compartan sangre, pero el cariño tambien sabe formar familia ♡'
    },

    /* =====================================================
       CONVIVENCIA DE LA FAMILIA — ETAPA 1
    ===================================================== */

    'family-more': {
      title: 'Ahora somos más ♡',
      mark: '♡',
      text: 'por un momento los mire a los tres juntitos y el refugio se sintio diferente.. ya no era solo un rincon para descansar. ahora habia una pequeña familia viviendo dentro ♡'
    },

    'family-pillow': {
      title: 'No cabemos >w<',
      mark: 'zZ',
      text: 'parece que una sola almohada no fue pensada para tanto gatito.. pero eso no les impidio intentarlo de todas formas >w< ♡'
    },

    'family-let-sleep': {
      title: 'Déjala mimir',
      mark: '!',
      text: 'marie solo queria mimir tranquila.. tuluz tenia otros planes. creo que tener hermanitos tambien significa aprender cuando dejar de molestar.. o intentarlo al menos ♡'
    },

    'family-siblings': {
      title: 'Hermanitos',
      mark: '♡',
      text: 'no necesitan parecerse ni compartir la misma sangre para saber que pertenecen juntos.. a veces la familia simplemente se encuentra ♡'
    },

    'family-close': {
      title: 'Todos cerquita',
      mark: '☾',
      text: 'mewo, marie y tuluz se quedaron cerquita sin hacer absolutamente nada.. y por alguna razon ese pequeño momento se sintio suficiente ♡'
    },

    'family-full': {
      title: 'El refugio está lleno ♡',
      mark: '⌂',
      text: 'primero construimos un lugar para descansar. despues llegaron almohadas, juguetes, recuerdos y tres pequeñas vidas que decidieron quedarse.. ahora si puedo decir que este refugio esta lleno ♡'
    },

    /* =====================================================
       SECRETOS DEL CLARO — COLECCIÓN I
    ===================================================== */

    'secret-garden-moon': {
      title: 'La lunita del refugio ☾',
      mark: '☾',
      text: 'esta lunita es mas pequeña que la del campo.. pero desde aqui parece cuidar el refugio mientras todos mimimos tranquilos ♡'
    },

    'secret-garden-lantern': {
      title: 'Una lucecita encendida',
      mark: '✦',
      text: 'hay luces que no necesitan alumbrar todo el camino.. a veces basta con que nos recuerden donde esta nuestro pequeño lugar seguro ♡'
    },

    'secret-garden-tree': {
      title: 'Debajo del árbol',
      mark: '⌂',
      text: 'tantas cositas pasaron debajo de este arbol que ya parece guardar nuestros secretos entre sus ramitas.. shhh ♡'
    },

    'secret-garden-flowers': {
      title: 'También crecieron aquí',
      mark: '✿',
      text: 'no plantamos estas florecitas una por una como los tulipanes.. aun asi crecieron cerquita de nosotros. tal vez algunas cosas bonitas aparecen cuando un lugar recibe suficiente cariño ♡'
    },

    'secret-three-wishes': {
      title: 'Tres deseos ♡',
      mark: '✦',
      text: 'una estrellita para mewo, otra para marie y otra para tuluz.. aunque pensandolo bien mi deseo favorito sigue siendo poder compartir este pequeño mundo contigo ♡'
    },

    'secret-stay-longer': {
      title: 'Quédate un ratito más',
      mark: '☾',
      text: 'no esta pasando nada especial ahora mismo.. nadie corre, nadie juega, nadie llama. y aun asi me gustaria que te quedaras un ratito mas aqui conmigo ♡'
    },

    /* =====================================================
       ACTO I · ETAPA 1 — PEQUEÑOS DÍAS
       Cartas 44–55
    ===================================================== */

    'act1-five-minutes': {
      title: 'Cinco minutitos más',
      mark: '☾',
      text: 'dije cinco minutitos mas y sin darme cuenta me quedaria aqui contigo mucho mas tiempo.. supongo que algunos lugares se sienten bonitos porque tu tambien estas en ellos ♡'
    },

    'act1-tuluz-ball': {
      title: 'No era para ti, Tuluz',
      mark: '●',
      text: 'esa pelotita ya paso por medio jardin antes de volver a sus patitas.. tuluz puede convertir cualquier rincon tranquilo en una pequeña aventura >w<'
    },

    'act1-marie-trail': {
      title: '¿A dónde vas, Marie?',
      mark: '🐾',
      text: 'segui sus huellitas pensando que escondia algo importante.. al final solo queria encontrar un rinconcito tranquilo. creo que yo tambien te seguiria aunque no supiera a donde vamos ♡'
    },

    'act1-fireflies': {
      title: 'Luciérnagas',
      mark: '✦',
      text: 'por unos segundos las lucecitas parecian pequeñas estrellas que decidieron bajar a visitarnos.. me alegra haberlas visto contigo ♡'
    },

    'act1-after-rain': {
      title: 'Después de la lluvia',
      mark: '◇',
      text: 'la lluvia termino y todo quedo brillando un poquito diferente.. me gusta pensar que incluso despues de los dias grises siempre podemos encontrar algo bonito que mirar juntos ♡'
    },

    'act1-save-toy': {
      title: 'A salvo ♡',
      mark: '⌂',
      text: 'era solo un juguetito afuera bajo la lluvia, pero ninguno de nuestros pequeños tesoros tenia por que quedarse solo.. aqui adentro siempre hay espacio ♡'
    },

    'act1-fallen-star': {
      title: 'Una estrellita cayó',
      mark: '✦',
      text: 'una estrellita se cayo demasiado cerca del campo.. asi que la guardamos un ratito. si pudiera pedirle algo seria tener muchos dias mas para compartir contigo ♡'
    },

    'act1-field-loop': {
      title: 'Otra vuelta por el campo',
      mark: '↺',
      text: 'camine tanto entre los tulipanes que por un momento senti que habia vuelto al mismo lugar.. aunque contigo no me molestaria recorrer el mismo camino otra vez ♡'
    },

    'act1-our-tulip': {
      title: 'Nuestro tulipán ♡',
      mark: '✿',
      text: 'este no aparecio por casualidad. elegiste donde plantarlo y ahora tiene su propio rinconcito entre todos los demas.. un pequeño tulipan que solo existe porque estuvimos aqui ♡'
    },

    'act1-choice-place': {
      title: 'Donde sea contigo',
      mark: '♡',
      text: 'debajo del arbol, junto a las flores o cerquita de los gatitos.. al final el lugar nunca fue lo importante. lo bonito era poder quedarme contigo ♡'
    },

    'act1-three-sleep': {
      title: 'Shhh... los tres mimieron',
      mark: 'zZ',
      text: 'shhh.. los tres se quedaron mimidos al mismo tiempo. por unos segundos el refugio estuvo tan quietito que parecia que hasta la noche tenia miedo de despertarlos ♡'
    },

    'act1-little-world': {
      title: 'Nuestro pequeño mundo ♡',
      mark: '⌂',
      text: 'empezo con tulipanes y una cartita.. y sin darnos cuenta aparecieron una lunita, tormentas, juguetes, un refugio y tres pequeñas vidas. mira todo lo que nuestro pequeño mundo ya tiene ♡'
    },

    /* =====================================================
       ACTO I · ETAPA 2 — PEQUEÑAS AVENTURAS
       Cartas 56–67
    ===================================================== */

    'act1-tuluz-treasure': {
      title: 'El tesorito de Tuluz',
      mark: '◇',
      text: 'resulto que su gran tesoro era una cosita diminuta que podria haber pasado desapercibida para cualquiera.. pero si algo le importa a uno de nuestros gatitos entonces tambien merece que lo busquemos ♡'
    },

    'act1-marie-guide': {
      title: 'Marie sabía el camino',
      mark: '🐾',
      text: 'marie camino despacito como si supiera exactamente donde queria llevarme.. la segui sin preguntar y termine encontrando otro rinconcito bonito. contigo tambien seguiria caminos que todavia no conozco ♡'
    },

    'act1-mewo-awake': {
      title: 'Mewo no quería mimir',
      mark: '☾',
      text: 'comida, mimitos, compañia.. quizas mewo no necesitaba una respuesta perfecta. tal vez solo queria saber que alguien se quedaria despierto con ella un ratito mas ♡'
    },

    'act1-star-home': {
      title: 'De vuelta al cielo ✦',
      mark: '✦',
      text: 'la estrellita encontro el camino de regreso al cielo.. y aunque ya no podamos tocarla sigue brillando desde arriba. algunas cosas pueden alejarse sin dejar de acompañarnos ♡'
    },

    'act1-yarn-trail': {
      title: 'El ovillo imposible',
      mark: '∞',
      text: 'el hilo cruzo medio jardin antes de volver al ovillo.. tuluz parecia orgullosisimo del desastre. supongo que algunas pequeñas aventuras empiezan solamente porque alguien dejo todo patas arriba >w<'
    },

    'act1-rain-rescue': {
      title: 'Antes de que se moje',
      mark: '☂',
      text: 'corrimos a guardar cada cosita antes de que la lluvia llegara mas fuerte.. no hacia falta salvar el mundo, solo cuidar nuestro pequeño mundo por un momento ♡'
    },

    'act1-tall-tulips': {
      title: 'Donde los tulipanes crecen altos',
      mark: '✿',
      text: 'caminando un poquito mas lejos encontramos tulipanes que parecian querer alcanzar las estrellas.. incluso en un campo infinito todavia quedan rincones que no habiamos visto juntos ♡'
    },

    'act1-midnight-flower': {
      title: 'Flor de medianoche',
      mark: '❀',
      text: 'solo abrio cuando el cielo estuvo lleno de estrellas y por un momento parecio guardar un pedacito de su luz.. me gusta que este mundo todavia pueda sorprendernos ♡'
    },

    'act1-two-paths': {
      title: 'Dos caminos',
      mark: '↗',
      text: 'marie fue por un lado y tuluz por el otro.. elegimos uno, pero el otro seguira esperando para otra noche. no necesito conocer todos los caminos mientras pueda seguir recorriendo alguno contigo ♡'
    },

    'act1-cat-picnic': {
      title: 'Picnic para tres',
      mark: '♡',
      text: 'un poquito de comida, juguetes tirados por todos lados y tres gatitos convencidos de que aquello era una celebracion enorme.. creo que los momentos pequeños tambien saben sentirse especiales ♡'
    },

    'act1-our-charm': {
      title: 'Nuestro detallito',
      mark: '✧',
      text: 'elegiste una pequeña señal para dejarla colgada en el refugio.. ahora seguira ahi cada vez que volvamos. una cosita sencilla que dice que este lugar tambien tiene un pedacito elegido por ti ♡'
    },

    'act1-little-adventures': {
      title: 'Pequeñas aventuras ♡',
      mark: '✦',
      text: 'ninguna fue una gran hazaña.. solo seguimos huellitas, recogimos juguetes, perseguimos luces y encontramos rincones nuevos. pero contigo hasta las cosas pequeñas terminan sintiendose como una aventura ♡'
    },

    /* =====================================================
       ACTO I · ETAPA 3 — EL MUNDO CRECE
       Cartas 68–79
    ===================================================== */

    'act1-new-nook': {
      title: 'Un rinconcito nuevo',
      mark: '⌂',
      text: 'juraria que antes aqui terminaba el refugio.. pero entre las hojas apareció un espacio mas. parece que este pequeño lugar todavia tiene ganas de crecer con nosotros ♡'
    },

    'act1-second-pillow': {
      title: 'Segunda almohadita',
      mark: 'zZ',
      text: 'una sola almohada era tierna hasta que intentaron dormir tres gatitos encima >w< ahora hay un poquito mas de espacio para descansar.. aunque seguramente igual terminaran todos juntos ♡'
    },

    'act1-toy-box': {
      title: 'La cajita de juguetes',
      mark: '□',
      text: 'por fin encontramos un lugar para la pelota, el pececito y el ovillo.. no prometo que tuluz vaya a dejarlos ahi mucho tiempo, pero al menos podemos intentarlo >w<'
    },

    'act1-water-bowl': {
      title: 'Agüita para todos',
      mark: '◇',
      text: 'entre tantas aventuras tambien habia que acordarse de algo sencillo.. dejarles agüita fresca. cuidar un hogar casi siempre esta hecho de detalles pequeñitos ♡'
    },

    'act1-marie-place': {
      title: 'El lugar de Marie',
      mark: '☾',
      text: 'marie eligio este rinconcito sin pedir permiso y creo que desde ese momento dejo de ser solo un lugar del jardin.. ahora es su lugar ♡'
    },

    'act1-tuluz-place': {
      title: 'El lugar de Tuluz',
      mark: '✦',
      text: 'tuluz encontro un sitio desde donde puede llegar rapido a sus juguetes, al rascador y probablemente a cualquier problema que decida causar >w< definitivamente lo eligio bien ♡'
    },

    'act1-mewo-place': {
      title: 'El rinconcito de Mewo',
      mark: '🐾',
      text: 'mewo puede ir y venir cuando quiera.. pero incluso ella termino encontrando un lugar al que le gusta volver. supongo que tener libertad tambien significa poder elegir donde descansar ♡'
    },

    'act1-flowers-grew': {
      title: 'Crecieron solas',
      mark: '❀',
      text: 'yo solo recuerdo haber plantado un tulipan.. pero ahora hay florecitas creciendo a su alrededor. quizas algunas cosas bonitas empiezan con algo pequeño y despues encuentran solas la forma de crecer ♡'
    },

    'act1-home-light': {
      title: 'Una lucecita para volver',
      mark: '✧',
      text: 'dejamos una pequeña luz encendida en el refugio.. no porque estuviera oscuro, sino porque me gusta imaginar que cada vez que volvamos algo aqui ya nos estaba esperando ♡'
    },

    'act1-night-home': {
      title: 'Una noche en casa',
      mark: '☾',
      text: 'comieron, jugaron, hicieron un pequeño desastre y al final todos encontraron donde mimir.. no paso nada extraordinario. creo que por eso se sintio tanto como estar en casa ♡'
    },

    'act1-look-grown': {
      title: 'Mira cuánto creció',
      mark: '↺',
      text: 'a veces cuesta notar cuanto cambio algo cuando lo vemos todos los dias.. hasta que miramos hacia atras y descubrimos que aquel pequeño claro ya esta lleno de pedacitos de nosotros ♡'
    },

    'act1-here-we-live': {
      title: 'Aquí vivimos ♡',
      mark: '⌂',
      text: 'al principio solo encontramos un pequeño claro entre los arboles.. despues fuimos dejando cositas, ellos tambien, y un dia deje de sentir que veniamos a visitar este lugar. senti que estabamos volviendo a casa ♡'
    },

    'act1-place-return': {
      title: 'Un lugar al que volver',
      mark: '⌂',
      text: 'hay lugares bonitos porque existen.. y otros porque alguien decide volver a ellos una y otra vez. creo que este pequeño Claro ya aprendio a esperarnos ♡'
    },

    'act1-same-moon': {
      title: 'La misma luna ♡',
      mark: '☾',
      text: 'la luna es la misma que vimos desde el campo, pero desde aqui se siente diferente.. tal vez los lugares cambian cuando sabes con quien quieres mirarlos ♡'
    },

    'act1-nothing-happens': {
      title: 'Cuando no pasa nada',
      mark: '·',
      text: 'no corrio nadie, no aparecio ninguna carta y no tuvimos que encontrar nada.. solo estuvimos aqui. creo que tambien quiero guardar los momentos que parecen no tener nada especial ♡'
    },

    'act1-things-stayed': {
      title: 'Cositas que se quedaron',
      mark: '◇',
      text: 'una estrellita, una huellita, un hilo, una flor.. cosas pequeñas que no parecian importantes cuando ocurrieron y ahora juntas cuentan una parte de este lugar ♡'
    },

    'act1-return-tulip': {
      title: 'Volver a nuestro tulipán',
      mark: '✿',
      text: 'lo plantaste en medio de miles y aun asi sigo sabiendo cual es.. me gusta pensar que entre tantas cosas en el mundo siempre habra algunas que podamos reconocer como nuestras ♡'
    },

    'act1-rain-stay': {
      title: 'Quedarnos bajo la lluvia',
      mark: '◇',
      text: 'afuera seguia lloviendo y no habia nada que arreglar ni rescatar.. esta vez simplemente podiamos escucharla caer mientras nos quedabamos aqui juntos ♡'
    },

    'act1-still-knowing-cats': {
      title: 'Todavía los estamos conociendo',
      mark: '🐾',
      text: 'creia que ya sabia donde dormiria marie, que haria tuluz y donde apareceria mewo.. pero cada noche hacen algo pequeño que no esperaba. me gusta que este lugar todavia pueda sorprenderme ♡'
    },

    'act1-your-choices': {
      title: 'Las cosas que elegiste',
      mark: '✧',
      text: 'un tulipan aqui, un detallito alla, una forma entre las estrellas.. este mundo ya no se ve exactamente como lo imagine al principio. ahora tambien tiene decisiones tuyas dentro ♡'
    },

    'act1-one-more-while': {
      title: 'Un ratito más',
      mark: '☾',
      text: 'podriamos volver al campo ahora.. pero no hay prisa. si estas aqui conmigo, cinco minutitos mas siempre pueden convertirse en otro pequeño recuerdo ♡'
    },

    'act1-meaning-stay': {
      title: 'Lo que significa quedarse ♡',
      mark: '♡',
      text: 'al principio pensaba que quedarse era no irse.. ahora creo que es algo diferente. es volver, encontrar algo cambiado, reconocer lo que sigue aqui y aun asi querer ver que viene despues contigo ♡'
    },

    /* =====================================================
       ACTO I · ETAPA 5 — TODO LO QUE GUARDAMOS
       Cartas 90–99
    ===================================================== */

    'act1-again-from-start': {
      title: 'Si volviera a empezar',
      mark: '↺',
      text: 'si tuviera que empezar este pequeño mundo otra vez, volveria a plantar el primer tulipan, volveria a encontrar a mewo y volveria a esperar cada cosita que fue llegando.. pero creo que lo que mas querria repetir seria descubrirlo todo contigo ♡'
    },

    'act1-what-changed': {
      title: 'Todo lo que cambió',
      mark: '✦',
      text: 'el campo sigue pareciendo infinito, pero ya no se siente vacio. ahora hay caminos que reconocemos, una casa a la que volver y pequeñas cosas que solo existen porque estuvimos aqui ♡'
    },

    'act1-what-remains': {
      title: 'Todo lo que sigue aquí',
      mark: '⌂',
      text: 'algunas noches fueron ruidosas, otras tranquilas y muchas apenas duraron unos minutos.. pero cuando volvemos, encuentro pedacitos de todas ellas esperandonos en el mismo lugar ♡'
    },

    'act1-whole-night': {
      title: 'Una noche completa',
      mark: '☾',
      text: 'jugamos, caminamos, miramos el cielo, volvimos al refugio y terminamos viendo a los tres mimir.. no hubo un gran momento. fue toda la noche la que termino sintiendose especial ♡'
    },

    'act1-sky-we-made': {
      title: 'El cielo que hicimos',
      mark: '✦',
      text: 'antes las estrellas solamente estaban ahi arriba. ahora cada vez que las miro recuerdo que incluso el cielo de este lugar termino teniendo una pequeña forma elegida por ti ♡'
    },

    'act1-where-began': {
      title: 'Donde comenzó todo',
      mark: '✿',
      text: 'volvi al campo y por un momento intente imaginarlo como era al principio.. sin refugio, sin huellitas, sin juguetes ni recuerdos. cuesta creer que todo esto haya empezado con un solo tulipan ♡'
    },

    'act1-they-grew-too': {
      title: 'Ellos también crecieron',
      mark: '🐾',
      text: 'mewo ya no esta sola, marie encontro su rincón y tuluz consiguio llenar medio refugio de problemas >w< supongo que este mundo no fue el unico que cambio mientras estabamos aqui ♡'
    },

    'act1-this-little-world': {
      title: 'Todo este pequeño mundo',
      mark: '◇',
      text: 'el campo, la luna, la lluvia, el refugio, las flores, los tres gatitos y todas esas cositas que parecian separadas.. ahora cuando las miro juntas siento que forman un mismo lugar ♡'
    },

    'act1-tomorrow-too': {
      title: 'Mañana también',
      mark: '☀',
      text: 'me gusta todo lo que ya vivimos aqui, pero tambien me gusta pensar que mañana podemos volver sin saber exactamente que pequeña cosa terminaremos recordando de ese dia ♡'
    },

    'act1-everything-kept': {
      title: 'Todo lo que guardamos ♡',
      mark: '♡',
      text: 'quise llenar este lugar de cosas que pudieran recordarme cuanto te quiero.. y al final termino lleno de algo mejor: momentos que solo significan algo porque los vivimos contigo aqui. si alguna vez volvemos a recorrerlo desde el principio, espero que sigamos encontrando razones para quedarnos un ratito mas ♡'
    }
  };

  function safeLoad() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return new Set(Array.isArray(arr) ? arr : []);
    } catch (_) {
      return new Set();
    }
  }

  function safeSave() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...collected]));
    } catch (_) {}
  }

  const collected = safeLoad();


  const MOON_MUSIC_SRC =
    'musica_luna.mp3';

  let moonMusicTimer=0;


  function playMoonMusic(){

    clearTimeout(
      moonMusicTimer
    );


    if(
      window.ParadoxAudio
    ){

      window.ParadoxAudio
        .playSpecial(
          MOON_MUSIC_SRC,
          .44,
          {
            owner:'moon',
            trackId:'moon',
            label:'Luna'
          }
        );


      /*
        Tiempo suficiente para ver el brillo,
        recoger la carta y leerla.
      */

      moonMusicTimer=
        setTimeout(
          ()=>{
            if(window.ParadoxAudio){
              window.ParadoxAudio
                .restoreNormal(
                  'moon'
                );
            }
          },
          42000
        );
    }
  }

  /* =====================================================
     CREAR ELEMENTOS
  ===================================================== */

  const moonHotspot = document.createElement('button');
  moonHotspot.id = 'moonHotspot';
  moonHotspot.setAttribute('aria-label', 'Luna');
  moonHotspot.type = 'button';
  document.body.appendChild(moonHotspot);

  const moonWhisper = document.createElement('div');
  moonWhisper.id = 'moonWhisper';
  moonWhisper.innerHTML = '<span>☾</span><p>La luna también quería decirte algo...</p>';
  document.body.appendChild(moonWhisper);

  const moonLetterDrop = document.createElement('button');
  moonLetterDrop.id = 'moonLetterDrop';
  moonLetterDrop.type = 'button';
  moonLetterDrop.setAttribute('aria-label', 'Carta de la luna');
  moonLetterDrop.innerHTML = `
    <span class="moonMiniEnvelope">
      <span class="moonSeal">♡</span>
    </span>
    <span class="moonLetterSpark">✦</span>
  `;
  document.body.appendChild(moonLetterDrop);

  const basketBtn = document.createElement('button');
  basketBtn.id = 'letterBasketBtn';
  basketBtn.type = 'button';
  basketBtn.setAttribute('aria-label', 'Canasta de cartas');
  basketBtn.innerHTML = `
    <img class="basketPixelImage" src="basket.png" alt="" aria-hidden="true">
    <span id="basketCount">0</span>
  `;
  document.body.appendChild(basketBtn);

  /* =====================================================
     OCULTAR / MOSTRAR CANASTA
  ===================================================== */

  const BASKET_HIDDEN_KEY =
    'paradox143_basket_hidden_v1';

  const basketVisibilityToggle =
    document.createElement('button');

  basketVisibilityToggle.id =
    'basketVisibilityToggle';

  basketVisibilityToggle.type =
    'button';

  basketVisibilityToggle.setAttribute(
    'aria-label',
    'Ocultar canasta'
  );

  basketVisibilityToggle.textContent =
    '◀';

  document.body.appendChild(
    basketVisibilityToggle
  );

  function basketUserHidden(){
    try{
      return localStorage.getItem(BASKET_HIDDEN_KEY)==='1';
    }catch(_){
      return false;
    }
  }

  function applyBasketVisibility(){
    const hidden=basketUserHidden();

    basketBtn.classList.toggle(
      'userHidden',
      hidden
    );

    basketVisibilityToggle.textContent=
      hidden ? '♡' : '◀';

    basketVisibilityToggle.setAttribute(
      'aria-label',
      hidden
        ? 'Mostrar canasta'
        : 'Ocultar canasta'
    );
  }

  basketVisibilityToggle.addEventListener(
    'click',
    e=>{
      e.preventDefault();
      e.stopPropagation();

      const next=!basketUserHidden();

      try{
        localStorage.setItem(
          BASKET_HIDDEN_KEY,
          next ? '1' : '0'
        );
      }catch(_){ }

      applyBasketVisibility();
    }
  );

  const basketOverlay = document.createElement('div');
  basketOverlay.id = 'basketOverlay';
  basketOverlay.innerHTML = `
    <div id="basketPanel">
      <button id="basketClose" type="button" aria-label="Cerrar">×</button>
      <div class="basketTitle">CANASTA DE CARTAS</div>
      <div class="basketSubtitle">Aquí se guardan las cartas que encuentres ♡</div>
      <div id="basketLetters"></div>
    </div>
  `;
  document.body.appendChild(basketOverlay);

  const letterReader = document.createElement('div');
  letterReader.id = 'letterReader';
  letterReader.innerHTML = `
    <div class="readerPaper">
      <button id="readerClose" type="button" aria-label="Cerrar">×</button>
      <div id="readerMark">♡</div>
      <h2 id="readerTitle">Carta</h2>
      <p id="readerText"></p>
      <button id="readerKeep" type="button">Guardar en la canasta ♡</button>
    </div>
  `;
  document.body.appendChild(letterReader);

  const basketCount = document.getElementById('basketCount');
  const basketLetters = document.getElementById('basketLetters');
  const basketClose = document.getElementById('basketClose');
  const readerClose = document.getElementById('readerClose');
  const readerMark = document.getElementById('readerMark');
  const readerTitle = document.getElementById('readerTitle');
  const readerText = document.getElementById('readerText');
  const readerKeep = document.getElementById('readerKeep');

  let currentReaderId = null;
  let basketUnlocked = collected.has('intro');
  let moonClicks = 0;
  let moonResetTimer = 0;
  let moonTriggered = false;

  /* =====================================================
     CANASTA
  ===================================================== */

  function pulseBasket() {
    basketBtn.classList.remove('pulse');
    void basketBtn.offsetWidth;
    basketBtn.classList.add('pulse');
  }

  function updateBasket() {
    basketCount.textContent = String(collected.size);

    const order = [
      'intro',
      'moon',
      'game-lost',
      'final',
      'garden-first',
      'garden-return',
      'garden-pillow',
      'garden-sleep',
      'garden-pet',
      'garden-feed',
      'garden-play',
      'garden-ball',
      'garden-fish',
      'garden-yarn',
      'garden-scratcher',
      'garden-all-toys',
      'garden-rain',
      'garden-storm',
      'garden-snow',
      'garden-stars',
      'garden-night',
      'garden-home',
      'garden-gray-arrival',
      'garden-orange-arrival',

      'family-more',
      'family-pillow',
      'family-let-sleep',
      'family-siblings',
      'family-close',
      'family-full',

      'secret-garden-moon',
      'secret-garden-lantern',
      'secret-garden-tree',
      'secret-garden-flowers',
      'secret-three-wishes',
      'secret-stay-longer',

      'act1-five-minutes',
      'act1-tuluz-ball',
      'act1-marie-trail',
      'act1-fireflies',
      'act1-after-rain',
      'act1-save-toy',
      'act1-fallen-star',
      'act1-field-loop',
      'act1-our-tulip',
      'act1-choice-place',
      'act1-three-sleep',
      'act1-little-world',

      'act1-tuluz-treasure',
      'act1-marie-guide',
      'act1-mewo-awake',
      'act1-star-home',
      'act1-yarn-trail',
      'act1-rain-rescue',
      'act1-tall-tulips',
      'act1-midnight-flower',
      'act1-two-paths',
      'act1-cat-picnic',
      'act1-our-charm',
      'act1-little-adventures',

      'act1-new-nook',
      'act1-second-pillow',
      'act1-toy-box',
      'act1-water-bowl',
      'act1-marie-place',
      'act1-tuluz-place',
      'act1-mewo-place',
      'act1-flowers-grew',
      'act1-home-light',
      'act1-night-home',
      'act1-look-grown',
      'act1-here-we-live',
      'act1-place-return',
      'act1-same-moon',
      'act1-nothing-happens',
      'act1-things-stayed',
      'act1-return-tulip',
      'act1-rain-stay',
      'act1-still-knowing-cats',
      'act1-your-choices',
      'act1-one-more-while',
      'act1-meaning-stay',
      'act1-again-from-start',
      'act1-what-changed',
      'act1-what-remains',
      'act1-whole-night',
      'act1-sky-we-made',
      'act1-where-began',
      'act1-they-grew-too',
      'act1-this-little-world',
      'act1-tomorrow-too',
      'act1-everything-kept'
    ];
    const html = order
      .filter(id => collected.has(id))
      .map(id => {
        const item = LETTERS[id];
        return `
          <button class="basketLetterItem" data-letter="${id}" type="button">
            <span class="basketLetterMark">${item.mark}</span>
            <span>
              <strong>${item.title}</strong>
              <small>Toca para volver a leerla</small>
            </span>
          </button>
        `;
      })
      .join('');

    basketLetters.innerHTML = html || `
      <div class="basketEmpty">
        Todavía no hay cartas guardadas.
      </div>
    `;

    basketLetters.querySelectorAll('.basketLetterItem').forEach(btn => {
      btn.addEventListener('click', () => {
        basketOverlay.classList.remove('show');
        openLetter(btn.dataset.letter, false);
      });
    });
  }

  function collectLetter(id, pulse = true) {
    if (!LETTERS[id]) return;

    const wasNew = !collected.has(id);
    collected.add(id);
    safeSave();
    updateBasket();

    if (id === 'intro') basketUnlocked = true;

    if (pulse && wasNew) pulseBasket();

    try{
      window.dispatchEvent(
        new CustomEvent(
          'paradox-letter-collected',
          {
            detail:{
              id,
              wasNew
            }
          }
        )
      );
    }catch(_){}
  }

  function showBasketWhenFieldIsVisible() {
    if (!basketUnlocked) return;
    basketBtn.classList.add('visible');
    basketVisibilityToggle.classList.add('visible');
    applyBasketVisibility();
  }

  basketBtn.addEventListener('click', () => {
    updateBasket();
    basketOverlay.classList.add('show');
  });

  basketClose.addEventListener('click', () => {
    basketOverlay.classList.remove('show');
  });

  basketOverlay.addEventListener('click', e => {
    if (e.target === basketOverlay) basketOverlay.classList.remove('show');
  });

  /* =====================================================
     LECTOR DE CARTAS
  ===================================================== */

  function openLetter(id, canCollect = true) {
    const item = LETTERS[id];
    if (!item) return;

    currentReaderId = id;
    readerMark.textContent = item.mark;
    readerTitle.textContent = item.title;
    readerText.textContent = item.text;

    if (canCollect && !collected.has(id)) {
      readerKeep.style.display = '';
      readerKeep.textContent = 'Guardar en la canasta ♡';
    } else {
      readerKeep.style.display = 'none';
    }

    letterReader.classList.add('show');
  }

  function closeReader() {
    letterReader.classList.remove('show');
    currentReaderId = null;
  }

  readerClose.addEventListener('click', closeReader);

  letterReader.addEventListener('click', e => {
    if (e.target === letterReader) closeReader();
  });

  readerKeep.addEventListener('click', () => {
    if (!currentReaderId) return;
    collectLetter(currentReaderId);
    readerKeep.textContent = 'Guardada ♡';
    setTimeout(() => {
      closeReader();
      showBasketWhenFieldIsVisible();
    }, 500);
  });

  /* =====================================================
     PRIMERA CARTA

     Al abrirla:
     - se desbloquea la canasta
     - la carta se guarda automáticamente
     - la canasta aparecerá cuando entremos al campo
  ===================================================== */

  if (typeof introEnvelope !== 'undefined' && introEnvelope) {
    introEnvelope.addEventListener('click', () => {
      collectLetter('intro', false);
      basketUnlocked = true;
    });
  }

  if (typeof introContinue !== 'undefined' && introContinue) {
    introContinue.addEventListener('click', () => {
      setTimeout(showBasketWhenFieldIsVisible, 900);
    });
  }

  /* Si ya estaba guardada en una visita anterior */
  if (basketUnlocked && !document.body.classList.contains('intro-active')) {
    showBasketWhenFieldIsVisible();
  }

  /* =====================================================
     POSICIÓN DE LA LUNA

     Usa exactamente la misma posición que field.js:
     vertical:   x 82%, y 10%
     horizontal: x 88%, y 13%
  ===================================================== */

  function moonGeometry() {
    const rect = app.getBoundingClientRect();
    const w = Math.max(1, rect.width);
    const h = Math.max(1, rect.height);
    const portrait = h > w;

    const x = rect.left + (portrait ? w * .82 : w * .88);
    const y = rect.top + (portrait ? h * .10 : h * .13);
    const r = Math.max(15, Math.min(29, Math.min(w, h) * .055));

    return { x, y, r };
  }

  function updateMoonHotspot() {
    const { x, y, r } = moonGeometry();
    const size = Math.max(46, r * 2.35);

    moonHotspot.style.left = `${x}px`;
    moonHotspot.style.top = `${y}px`;
    moonHotspot.style.width = `${size}px`;
    moonHotspot.style.height = `${size}px`;
    moonHotspot.style.setProperty('--moonRadius', `${r}px`);
  }

  window.addEventListener('resize', updateMoonHotspot);
  window.addEventListener('orientationchange', () => {
    setTimeout(updateMoonHotspot, 250);
  });
  document.addEventListener('fullscreenchange', () => {
    setTimeout(updateMoonHotspot, 120);
  });

  requestAnimationFrame(() => {
    updateMoonHotspot();
    setTimeout(updateMoonHotspot, 500);
  });

  /* =====================================================
     MENSAJE DE LA LUNA
  ===================================================== */

  function showMoonWhisper(text) {
    const { x, y, r } = moonGeometry();

    moonWhisper.querySelector('p').textContent = text;
    moonWhisper.style.left = `${Math.min(window.innerWidth - 135, Math.max(135, x))}px`;
    moonWhisper.style.top = `${y + r + 24}px`;

    moonWhisper.classList.remove('show');
    void moonWhisper.offsetWidth;
    moonWhisper.classList.add('show');

    setTimeout(() => {
      moonWhisper.classList.remove('show');
    }, 3300);
  }

  /* =====================================================
     SOLTAR CARTA DESDE LA LUNA
  ===================================================== */

  function releaseMoonLetter() {
    /*
      La carta de la luna puede volver a aparecer
      todas las veces que se active el secreto.
      La canasta NO duplica la carta.
    */

    const { x, y } = moonGeometry();

    const targetX = window.innerWidth * (window.innerHeight > window.innerWidth ? .57 : .68);
    const targetY = window.innerHeight * (window.innerHeight > window.innerWidth ? .42 : .48);

    moonLetterDrop.style.left = `${x}px`;
    moonLetterDrop.style.top = `${y}px`;
    moonLetterDrop.style.setProperty('--moonLetterDX', `${targetX - x}px`);
    moonLetterDrop.style.setProperty('--moonLetterDY', `${targetY - y}px`);

    moonLetterDrop.classList.remove('fall', 'ready');
    void moonLetterDrop.offsetWidth;
    moonLetterDrop.classList.add('fall');

    setTimeout(() => {
      moonLetterDrop.classList.add('ready');
    }, 1750);
  }

  moonLetterDrop.addEventListener('click', () => {
    if (!moonLetterDrop.classList.contains('ready')) return;

    moonLetterDrop.classList.remove('fall', 'ready');
    moonLetterDrop.style.display = 'none';

    openLetter('moon', true);

    setTimeout(() => {
      moonLetterDrop.style.display = '';
    }, 450);
  });

  /* =====================================================
     3 TOQUES EN LA LUNA
  ===================================================== */

  moonHotspot.addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();

    if (document.body.classList.contains('intro-active')) return;
    if (gameOverlay && gameOverlay.classList.contains('show')) return;

    moonHotspot.classList.remove('tap');
    void moonHotspot.offsetWidth;
    moonHotspot.classList.add('tap');

    clearTimeout(moonResetTimer);
    moonClicks++;

    if (moonClicks < 3) {
      moonResetTimer = setTimeout(() => {
        moonClicks = 0;
      }, 2600);
      return;
    }

    moonClicks = 0;
    moonTriggered = true;

    moonHotspot.classList.add('awakened');

    playMoonMusic();

    showMoonWhisper(
      'La luna también quería decirte algo...'
    );

    setTimeout(releaseMoonLetter, 1200);

    setTimeout(() => {
      moonHotspot.classList.remove('awakened');
      moonTriggered = false;
    }, 5200);
  });

  /* =====================================================
     GUARDAR LA CARTA FINAL DEL MINIJUEGO

     No modifica game.js.
     Observa cuando #finalLetter recibe la clase "show".
  ===================================================== */

  if (typeof finalLetter !== 'undefined' && finalLetter) {
    const observer = new MutationObserver(() => {
      if (finalLetter.classList.contains('show')) {
        collectLetter('final');
      }
    });

    observer.observe(finalLetter, {
      attributes: true,
      attributeFilter: ['class']
    });
  }

  window.ParadoxLetters={
    open:openLetter,
    collect:collectLetter,
    has:id=>collected.has(id),
    list:()=>[...collected],
    refresh:updateBasket
  };

  applyBasketVisibility();
  updateBasket();
})();


/* =========================================================
   LADO OSCURO DE LA LUNA
========================================================= */
(() => {
  const DARK_LETTER_ID='moon-dark';
  const REQUIRED_TAPS=15;
  const MOON_MUSIC_SRC='musica_luna.mp3';
  const CLIMAX_START=120;
  let moonTapCount=0;
  let darkOverlay=null;
  function getLetters(){ try{ const raw=localStorage.getItem('paradox143_letters_v1'); const arr=raw?JSON.parse(raw):[]; return Array.isArray(arr)?arr:[]; }catch(_){ return []; } }
  function saveDarkLetter(){ try{ const set=new Set(getLetters()); set.add(DARK_LETTER_ID); localStorage.setItem('paradox143_letters_v1', JSON.stringify([...set])); }catch(_){} }
  function refreshBasketCount(){ const count=document.getElementById('basketCount'); if(count) count.textContent=String(getLetters().length); }
  function ensureOverlay(){ if(darkOverlay) return darkOverlay; darkOverlay=document.createElement('div'); darkOverlay.id='darkMoonOverlay'; darkOverlay.innerHTML=`<div class="darkMoonHalo"></div><div class="darkMoonPanel"><div class="darkMoonMark">◐</div><p>Aun en la penumbra de este lado<br>puedo llegar a sentir como<br>tu cálida presencia resuena en mí...</p><button type="button">guardar en canasta ♡</button></div>`; document.body.appendChild(darkOverlay); darkOverlay.querySelector('button').addEventListener('click',()=>{ saveDarkLetter(); refreshBasketCount(); darkOverlay.classList.remove('show'); if(window.ParadoxAudio){ window.ParadoxAudio.restoreNormal('moon-dark'); } }); return darkOverlay; }
  function showDarkLetter(){ const overlay=ensureOverlay(); overlay.classList.add('show'); if(window.ParadoxAudio){ window.ParadoxAudio.playSpecial(MOON_MUSIC_SRC,.44,{owner:'moon-dark',trackId:'moon',label:'Lado oscuro de la luna',startAt:CLIMAX_START}); } }
  window.ParadoxDarkMoonOpen=showDarkLetter;
  function attachDarkMoon(){ const moon=document.getElementById('moonHotspot'); if(!moon) return false; if(moon.dataset.darkMoonBound==='1') return true; moon.dataset.darkMoonBound='1'; moon.addEventListener('click', ()=>{ moonTapCount++; moon.classList.add('darkMoonPulse'); setTimeout(()=>moon.classList.remove('darkMoonPulse'),380); if(moonTapCount>=REQUIRED_TAPS){ moonTapCount=0; showDarkLetter(); } }); return true; }
  if(!attachDarkMoon()){ const retry=setInterval(()=>{ if(attachDarkMoon()) clearInterval(retry); },1000); }
})();



/* =========================================================
   CANASTA 2.0
========================================================= */
(() => {
  const LETTER_KEY='paradox143_letters_v1';
  const MUSIC_KEY='paradox143_music_unlocks_v1';

  const memories=[
    ['intro','♡','Primera carta'],
    ['moon','☾','Luna'],
    ['moon-dark','◐','Lado oscuro de la luna'],
    ['final','✦','Carta del minijuego'],
    ['game-lost','♡','No te rindas'],
    ['mewo','🐾','Mewo'],
    ['weather-stars','✦','Lluvia de estrellas'],
    ['weather-fog','◌','Neblina'],
    ['weather-rain','◇','Lluvia'],
    ['weather-snow','❄','Nevada'],
    ['weather-storm','⚡','Tormenta']
  ];

  function loadSet(key){
    try{
      const raw=localStorage.getItem(key);
      const arr=raw?JSON.parse(raw):[];
      return new Set(Array.isArray(arr)?arr:[]);
    }catch(_){ return new Set(); }
  }

  function stat(key){
    return window.ParadoxStats?window.ParadoxStats.get(key):0;
  }

  function init(){
    const panel=document.getElementById('basketPanel');
    const lettersList=document.getElementById('basketLetters');
    const overlay=document.getElementById('basketOverlay');
    if(!panel || !lettersList || !overlay) return false;
    if(panel.dataset.basketV2==='1') return true;
    panel.dataset.basketV2='1';

    const title=panel.querySelector('.basketTitle');
    const subtitle=panel.querySelector('.basketSubtitle');
    if(title) title.textContent='CANASTA ♡';
    if(subtitle) subtitle.textContent='Cartas, recuerdos y todo lo que has vivido en el campo.';

    const tabs=document.createElement('div');
    tabs.id='basketTabs';
    tabs.innerHTML=`
      <button class="basketTab active" data-tab="cards" type="button">💌 CARTAS</button>
      <button class="basketTab" data-tab="memories" type="button">✦ RECUERDOS</button>
      <button class="basketTab" data-tab="mewo" type="button">🐈 MEWO</button>
      <button class="basketTab" data-tab="history" type="button">📊 HISTORIA</button>
    `;
    lettersList.parentNode.insertBefore(tabs,lettersList);

    const cards=document.createElement('div');
    cards.className='basketPane active';
    cards.dataset.pane='cards';
    lettersList.parentNode.insertBefore(cards,lettersList);
    cards.appendChild(lettersList);

    const memoriesPane=document.createElement('div');
    memoriesPane.className='basketPane'; memoriesPane.dataset.pane='memories'; panel.appendChild(memoriesPane);
    const mewoPane=document.createElement('div');
    mewoPane.className='basketPane'; mewoPane.dataset.pane='mewo'; panel.appendChild(mewoPane);
    const historyPane=document.createElement('div');
    historyPane.className='basketPane'; historyPane.dataset.pane='history'; panel.appendChild(historyPane);

    function addDarkMoonCard(){
      const collected=loadSet(LETTER_KEY);
      lettersList.querySelectorAll('.basketV2DarkMoon').forEach(el=>el.remove());
      if(!collected.has('moon-dark')) return;
      const btn=document.createElement('button');
      btn.type='button';
      btn.className='basketLetterItem basketV2DarkMoon';
      btn.innerHTML=`<span class="basketLetterMark">◐</span><span><strong>Lado oscuro de la luna</strong><small>Toca para volver a leerla</small></span>`;
      btn.addEventListener('click',()=>{
        overlay.classList.remove('show');
        if(window.ParadoxDarkMoonOpen) window.ParadoxDarkMoonOpen();
      });
      lettersList.appendChild(btn);
    }

    function renderMemories(){
      const collected=loadSet(LETTER_KEY);
      const found=memories.filter(([id])=>collected.has(id)).length;
      const music=loadSet(MUSIC_KEY);
      const climates=['weather-stars','weather-fog','weather-rain','weather-snow','weather-storm'].filter(id=>collected.has(id)).length;
      memoriesPane.innerHTML=`
        <div class="basketSectionHead"><strong>ÁLBUM DE RECUERDOS</strong><span>${found}/${memories.length}</span></div>
        <div class="basketMemoryGrid">
          ${memories.map(([id,mark,name])=>{const ok=collected.has(id);return `<div class="basketMemory ${ok?'found':'locked'}"><span>${ok?mark:'?'}</span><strong>${ok?name:'???'}</strong><small>${ok?'descubierto':'por descubrir'}</small></div>`}).join('')}
        </div>
        <div class="basketProgressBox">
          <div><span>♫ músicas</span><strong>${Math.max(1,music.size)}/8</strong></div>
          <div><span>☁ climas</span><strong>${climates}/5</strong></div>
        </div>
      `;
    }

    function bond(){
      return Math.min(100,stat('mewoAppearances')*5+stat('mewoPlaySessions')*7+stat('mewoFeedSessions')*7+stat('mewoPetSessions')*9+stat('mewoTracksCompleted')*4);
    }

    function renderMewo(){
      const b=bond();
      let state='todavía está conociendo el campo';
      if(b>=75) state='confía muchísimo en ti ♡';
      else if(b>=45) state='cada vez se siente más en casa';
      else if(b>=20) state='ya reconoce tu cariño';
      mewoPane.innerHTML=`
        <div class="basketMewoCard"><img src="mewo.png" alt=""><div><strong>MEWO ♡</strong><small>${state}</small></div></div>
        <div class="mewoBondLabel"><span>VÍNCULO</span><strong>${b}%</strong></div>
        <div class="mewoBondBar"><span style="width:${b}%"></span></div>
        <div class="basketStatsGrid">
          <div><span>🐈 apariciones</span><strong>${stat('mewoAppearances')}</strong></div>
          <div><span>● juegos</span><strong>${stat('mewoPlaySessions')}</strong></div>
          <div><span>⌁ comidas</span><strong>${stat('mewoFeedSessions')}</strong></div>
          <div><span>♡ mimitos</span><strong>${stat('mewoPetSessions')}</strong></div>
          <div><span>🐾 rastros</span><strong>${stat('mewoTracksCompleted')}</strong></div>
          <div><span>zZ descansos</span><strong>${stat('mewoRested')}</strong></div>
        </div>
        <div class="mewoFutureHome"><span>⌂</span><div><strong>RINCÓN DE MEWO</strong><small>${b>=60?'casi listo para desbloquearse...':'sigue cuidándola para acercarte a este secreto'}</small></div></div>
      `;
    }

    function renderHistory(){
      const weather=stat('weather_stars')+stat('weather_fog')+stat('weather_rain')+stat('weather_snow')+stat('weather_storm');
      historyPane.innerHTML=`
        <div class="basketSectionHead"><strong>HISTORIA DEL CAMPO</strong><span>♡</span></div>
        <div class="basketStatsGrid">
          <div><span>🌷 tulipanes tocados</span><strong>${stat('tulipsTouched')}</strong></div>
          <div><span>🌱 tulipanes plantados</span><strong>${stat('tulipsPlanted')}</strong></div>
          <div><span>✨ luciérnagas</span><strong>${stat('firefliesCaught')}</strong></div>
          <div><span>⭐ constelaciones</span><strong>${stat('constellationsCompleted')}</strong></div>
          <div><span>🌸 pétalos</span><strong>${stat('petalsCaught')}</strong></div>
          <div><span>💫 estrellas a la luna</span><strong>${stat('starsDeliveredToMoon')}</strong></div>
          <div><span>🪨 piedritas</span><strong>${stat('stonesFound')}</strong></div>
          <div><span>☁ climas vividos</span><strong>${weather}</strong></div>
        </div>
        <div class="weatherHistoryMini"><span>✦ ${stat('weather_stars')}</span><span>◌ ${stat('weather_fog')}</span><span>◇ ${stat('weather_rain')}</span><span>❄ ${stat('weather_snow')}</span><span>⚡ ${stat('weather_storm')}</span></div>
        <p class="basketStatsNote">Las estadísticas empiezan a guardarse desde esta actualización.</p>
      `;
    }

    function refresh(){ const count=document.getElementById('basketCount'); if(count) count.textContent=String(loadSet(LETTER_KEY).size); addDarkMoonCard(); renderMemories(); renderMewo(); renderHistory(); }

    tabs.querySelectorAll('.basketTab').forEach(btn=>{
      btn.addEventListener('click',()=>{
        tabs.querySelectorAll('.basketTab').forEach(b=>b.classList.remove('active'));
        panel.querySelectorAll('.basketPane').forEach(p=>p.classList.remove('active'));
        btn.classList.add('active');
        panel.querySelector(`.basketPane[data-pane="${btn.dataset.tab}"]`).classList.add('active');
        refresh();
      });
    });

    new MutationObserver(()=>{ if(overlay.classList.contains('show')) setTimeout(refresh,0); }).observe(overlay,{attributes:true,attributeFilter:['class']});
    document.addEventListener('paradox-stats-changed',refresh);
    refresh();
    return true;
  }

  if(!init()){
    const retry=setInterval(()=>{ if(init()) clearInterval(retry); },800);
  }
})();
