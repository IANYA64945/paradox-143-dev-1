/* =========================================================
   PARADOX143 — CANASTA 2.4 · COLECCIÓN DE 99 CARTAS
========================================================= */
(() => {
  'use strict';

  const LETTER_KEY='paradox143_letters_v1';
  const SEEN_KEY='paradox143_basket2_seen_v1';
  const INSTALL_KEY='paradox143_basket2_installed_v1';
  const TOTAL=99;

  const CARDS={
  "intro": {
    "title": "Primera carta",
    "mark": "♡",
    "text": "“Te amaré un día más por cada tulipán aquí plantado.”"
  },
  "moon": {
    "title": "Carta de la luna",
    "mark": "☾",
    "text": "Si llegaste hasta aquí y miraste la luna tres veces, encontraste un pedacito más de mí. Incluso cuando el campo duerme, sigo pensando en ti. ♡"
  },
  "final": {
    "title": "Carta encontrada",
    "mark": "✦",
    "text": "Y si algún día dudas de cuánto te quiero, vuelve a mirar este campo. Todavía quedan infinitos tulipanes por contar."
  },
  "game-lost": {
    "title": "No te rindas ♡",
    "mark": "♡",
    "text": "Mientras sigas intentando, jamás habrás fracasado para mí.."
  },
  "garden-first": {
    "title": "Un pequeño refugio ♡",
    "mark": "⌂",
    "text": "entre tantos tulipanes encontramos un pequeño lugar para descansar.. un rinconcito donde incluso el mundo parece hablar un poquito mas bajito ♡"
  },
  "garden-return": {
    "title": "Volviste ♡",
    "mark": "↺",
    "text": "me gusta pensar que algunos lugares dejan de ser solo lugares cuando alguien decide volver a ellos.."
  },
  "garden-pillow": {
    "title": "Su lugar favorito",
    "mark": "☾",
    "text": "al final no importaba cuanto tardaramos en hacerla.. verla descansar aqui hizo que cada pequeño esfuerzo valiera la pena ♡"
  },
  "garden-sleep": {
    "title": "Mientras duerme",
    "mark": "zZ",
    "text": "shhh.. por un momento dejemos que todo siga girando sin nosotros. ella duerme tranquila y yo me quedaria aqui contigo un poquito mas.."
  },
  "garden-pet": {
    "title": "Un poquito de cariño",
    "mark": "♡",
    "text": "a veces algo tan pequeño como una caricia basta para recordarnos que sentirse querido tambien puede ser un hogar."
  },
  "garden-feed": {
    "title": "Hora de comer",
    "mark": "◇",
    "text": "quizas cuidar a alguien tambien sea esto.. recordar las cosas pequeñas incluso cuando nadie nos pide que lo hagamos ♡"
  },
  "garden-play": {
    "title": "Solo un rato más",
    "mark": "✦",
    "text": "si alguna vez todo se vuelve demasiado serio espero que podamos seguir encontrando razones tontas para jugar un rato mas.."
  },
  "garden-ball": {
    "title": "La pelotita",
    "mark": "●",
    "text": "no se quien se divierte mas persiguiendo esa pelota.. mewo o yo viendola hacerlo ♡"
  },
  "garden-fish": {
    "title": "El pececito",
    "mark": "◇",
    "text": "lo empuja, lo mira, vuelve a empujarlo y actua como si nada hubiera pasado.. definitivamente este juguete ya tiene dueña."
  },
  "garden-yarn": {
    "title": "Un pequeño desastre",
    "mark": "⌁",
    "text": "el ovillo ya no esta donde lo dejamos y probablemente nunca vuelva a estarlo.. creo que eso significa que a mewo le gusto ♡"
  },
  "garden-scratcher": {
    "title": "Valió la pena",
    "mark": "⌂",
    "text": "lo construimos poco a poco y ahora ella lo usa como si siempre hubiera estado aqui.. algunas cosas tardan en construirse pero pueden terminar sintiendose como hogar."
  },
  "garden-all-toys": {
    "title": "Sus tesoros",
    "mark": "✦",
    "text": "una pelota, un pececito, un ovillo y una gata completamente convencida de que absolutamente todo este jardin le pertenece ♡"
  },
  "garden-rain": {
    "title": "Lluvia afuera",
    "mark": "◇",
    "text": "puedo escuchar la lluvia desde aqui.. pero esta vez no tenemos que correr. podemos quedarnos bajo techo mirando como cae juntos ♡"
  },
  "garden-storm": {
    "title": "Mientras truena",
    "mark": "⚡",
    "text": "afuera puede hacer todo el ruido que quiera.. mientras tengamos un pequeño lugar al cual volver no todo tiene que dar miedo."
  },
  "garden-snow": {
    "title": "Frío afuera",
    "mark": "❄",
    "text": "el frio puede quedarse en los bordes del jardin.. aqui dentro tenemos almohadas, una gatita y suficientes razones para quedarnos un rato mas ♡"
  },
  "garden-stars": {
    "title": "Desde aquí también se ven",
    "mark": "✦",
    "text": "no hace falta estar en medio del cielo para pedir un deseo.. desde este pequeño rincon las estrellas siguen encontrandonos."
  },
  "garden-night": {
    "title": "Cuando todo está tranquilo",
    "mark": "☾",
    "text": "hay momentos en los que no pasa absolutamente nada.. y aun asi no quisiera estar en ningun otro lugar."
  },
  "garden-home": {
    "title": "Hogar ♡",
    "mark": "⌂",
    "text": "primero fue solo un claro entre los arboles.. luego llego una almohada, algunos juguetes, mewo y un monton de pequeños recuerdos. supongo que asi empiezan los hogares."
  },
  "garden-gray-arrival": {
    "title": "¿Me extrañaste?",
    "mark": "♡",
    "text": "me extrañaste?.. volvi a este pequeño refugio porque yo tambien queria estar cerquita de ti.. hay cariños que siempre encuentran el camino de regreso ♡"
  },
  "garden-orange-arrival": {
    "title": "Y trajo compañía ♡",
    "mark": "♡",
    "text": "y no llego sola.. con ella tambien vino un pequeño solecito naranja. quizas no compartan sangre, pero el cariño tambien sabe formar familia ♡"
  },
  "family-more": {
    "title": "Ahora somos más ♡",
    "mark": "♡",
    "text": "por un momento los mire a los tres juntitos y el refugio se sintio diferente.. ya no era solo un rincon para descansar. ahora habia una pequeña familia viviendo dentro ♡"
  },
  "family-pillow": {
    "title": "No cabemos >w<",
    "mark": "zZ",
    "text": "parece que una sola almohada no fue pensada para tanto gatito.. pero eso no les impidio intentarlo de todas formas >w< ♡"
  },
  "family-let-sleep": {
    "title": "Déjala mimir",
    "mark": "!",
    "text": "marie solo queria mimir tranquila.. tuluz tenia otros planes. creo que tener hermanitos tambien significa aprender cuando dejar de molestar.. o intentarlo al menos ♡"
  },
  "family-siblings": {
    "title": "Hermanitos",
    "mark": "♡",
    "text": "no necesitan parecerse ni compartir la misma sangre para saber que pertenecen juntos.. a veces la familia simplemente se encuentra ♡"
  },
  "family-close": {
    "title": "Todos cerquita",
    "mark": "☾",
    "text": "mewo, marie y tuluz se quedaron cerquita sin hacer absolutamente nada.. y por alguna razon ese pequeño momento se sintio suficiente ♡"
  },
  "family-full": {
    "title": "El refugio está lleno ♡",
    "mark": "⌂",
    "text": "primero construimos un lugar para descansar. despues llegaron almohadas, juguetes, recuerdos y tres pequeñas vidas que decidieron quedarse.. ahora si puedo decir que este refugio esta lleno ♡"
  },
  "secret-garden-moon": {
    "title": "La lunita del refugio ☾",
    "mark": "☾",
    "text": "esta lunita es mas pequeña que la del campo.. pero desde aqui parece cuidar el refugio mientras todos mimimos tranquilos ♡"
  },
  "secret-garden-lantern": {
    "title": "Una lucecita encendida",
    "mark": "✦",
    "text": "hay luces que no necesitan alumbrar todo el camino.. a veces basta con que nos recuerden donde esta nuestro pequeño lugar seguro ♡"
  },
  "secret-garden-tree": {
    "title": "Debajo del árbol",
    "mark": "⌂",
    "text": "tantas cositas pasaron debajo de este arbol que ya parece guardar nuestros secretos entre sus ramitas.. shhh ♡"
  },
  "secret-garden-flowers": {
    "title": "También crecieron aquí",
    "mark": "✿",
    "text": "no plantamos estas florecitas una por una como los tulipanes.. aun asi crecieron cerquita de nosotros. tal vez algunas cosas bonitas aparecen cuando un lugar recibe suficiente cariño ♡"
  },
  "secret-three-wishes": {
    "title": "Tres deseos ♡",
    "mark": "✦",
    "text": "una estrellita para mewo, otra para marie y otra para tuluz.. aunque pensandolo bien mi deseo favorito sigue siendo poder compartir este pequeño mundo contigo ♡"
  },
  "secret-stay-longer": {
    "title": "Quédate un ratito más",
    "mark": "☾",
    "text": "no esta pasando nada especial ahora mismo.. nadie corre, nadie juega, nadie llama. y aun asi me gustaria que te quedaras un ratito mas aqui conmigo ♡"
  },
  "moon-dark": {
    "title": "Lado oscuro de la lunita",
    "mark": "◐",
    "text": "Aun en la penumbra de este lado\npuedo llegar a sentir como\ntu cálida presencia resuena en mí..."
  },
  "mewo": {
    "title": "Cartita de Mewo >w<",
    "mark": "🐾",
    "text": "eres y seras la mejoll mama gata de todas!!"
  },
  "weather-stars": {
    "title": "Cartita de la lluvia de estrellas",
    "mark": "✦",
    "text": "cada deseo que llegue a tener lo usare para tener la posibilidad de estar cerca de ti.. cerca de la estrellita mas brillante tu.."
  },
  "weather-fog": {
    "title": "Carta de la neblina",
    "mark": "♡",
    "text": "aun en la oscuridad mas profunda pordria verte y sentirte como siempre mi calida amada"
  },
  "weather-rain": {
    "title": "Cartita de la lluvia",
    "mark": "◇",
    "text": "sea cual sea el clima te acopañare frio o calor me es igual si es a tu lado.."
  },
  "weather-storm": {
    "title": "Cartita de la tormentita",
    "mark": "⚡",
    "text": "aunque todo fuera mal yo volveria contigo una y otra vez para volver a intentarlo porque un momento contigo vale mas que una historia completa con cualquiera..."
  },
  "weather-snow": {
    "title": "Cartita de la nieve",
    "mark": "❄",
    "text": "aunque el frio llegue a mi cuerpo la luz y el calor que me das nunca se paagaran.. mi pequeña"
  },
  "act1-five-minutes": {
    "title": "Cinco minutitos más",
    "mark": "☾",
    "text": "dije cinco minutitos mas y sin darme cuenta me quedaria aqui contigo mucho mas tiempo.. supongo que algunos lugares se sienten bonitos porque tu tambien estas en ellos ♡"
  },
  "act1-tuluz-ball": {
    "title": "No era para ti, Tuluz",
    "mark": "●",
    "text": "esa pelotita ya paso por medio jardin antes de volver a sus patitas.. tuluz puede convertir cualquier rincon tranquilo en una pequeña aventura >w<"
  },
  "act1-marie-trail": {
    "title": "¿A dónde vas, Marie?",
    "mark": "🐾",
    "text": "segui sus huellitas pensando que escondia algo importante.. al final solo queria encontrar un rinconcito tranquilo. creo que yo tambien te seguiria aunque no supiera a donde vamos ♡"
  },
  "act1-fireflies": {
    "title": "Luciérnagas",
    "mark": "✦",
    "text": "por unos segundos las lucecitas parecian pequeñas estrellas que decidieron bajar a visitarnos.. me alegra haberlas visto contigo ♡"
  },
  "act1-after-rain": {
    "title": "Después de la lluvia",
    "mark": "◇",
    "text": "la lluvia termino y todo quedo brillando un poquito diferente.. me gusta pensar que incluso despues de los dias grises siempre podemos encontrar algo bonito que mirar juntos ♡"
  },
  "act1-save-toy": {
    "title": "A salvo ♡",
    "mark": "⌂",
    "text": "era solo un juguetito afuera bajo la lluvia, pero ninguno de nuestros pequeños tesoros tenia por que quedarse solo.. aqui adentro siempre hay espacio ♡"
  },
  "act1-fallen-star": {
    "title": "Una estrellita cayó",
    "mark": "✦",
    "text": "una estrellita se cayo demasiado cerca del campo.. asi que la guardamos un ratito. si pudiera pedirle algo seria tener muchos dias mas para compartir contigo ♡"
  },
  "act1-field-loop": {
    "title": "Otra vuelta por el campo",
    "mark": "↺",
    "text": "camine tanto entre los tulipanes que por un momento senti que habia vuelto al mismo lugar.. aunque contigo no me molestaria recorrer el mismo camino otra vez ♡"
  },
  "act1-our-tulip": {
    "title": "Nuestro tulipán ♡",
    "mark": "✿",
    "text": "este no aparecio por casualidad. elegiste donde plantarlo y ahora tiene su propio rinconcito entre todos los demas.. un pequeño tulipan que solo existe porque estuvimos aqui ♡"
  },
  "act1-choice-place": {
    "title": "Donde sea contigo",
    "mark": "♡",
    "text": "debajo del arbol, junto a las flores o cerquita de los gatitos.. al final el lugar nunca fue lo importante. lo bonito era poder quedarme contigo ♡"
  },
  "act1-three-sleep": {
    "title": "Shhh... los tres mimieron",
    "mark": "zZ",
    "text": "shhh.. los tres se quedaron mimidos al mismo tiempo. por unos segundos el refugio estuvo tan quietito que parecia que hasta la noche tenia miedo de despertarlos ♡"
  },
  "act1-little-world": {
    "title": "Nuestro pequeño mundo ♡",
    "mark": "⌂",
    "text": "empezo con tulipanes y una cartita.. y sin darnos cuenta aparecieron una lunita, tormentas, juguetes, un refugio y tres pequeñas vidas. mira todo lo que nuestro pequeño mundo ya tiene ♡"
  },
  "act1-tuluz-treasure": {
    "title": "El tesorito de Tuluz",
    "mark": "◇",
    "text": "resulto que su gran tesoro era una cosita diminuta que podria haber pasado desapercibida para cualquiera.. pero si algo le importa a uno de nuestros gatitos entonces tambien merece que lo busquemos ♡"
  },
  "act1-marie-guide": {
    "title": "Marie sabía el camino",
    "mark": "🐾",
    "text": "marie camino despacito como si supiera exactamente donde queria llevarme.. la segui sin preguntar y termine encontrando otro rinconcito bonito. contigo tambien seguiria caminos que todavia no conozco ♡"
  },
  "act1-mewo-awake": {
    "title": "Mewo no quería mimir",
    "mark": "☾",
    "text": "comida, mimitos, compañia.. quizas mewo no necesitaba una respuesta perfecta. tal vez solo queria saber que alguien se quedaria despierto con ella un ratito mas ♡"
  },
  "act1-star-home": {
    "title": "De vuelta al cielo ✦",
    "mark": "✦",
    "text": "la estrellita encontro el camino de regreso al cielo.. y aunque ya no podamos tocarla sigue brillando desde arriba. algunas cosas pueden alejarse sin dejar de acompañarnos ♡"
  },
  "act1-yarn-trail": {
    "title": "El ovillo imposible",
    "mark": "∞",
    "text": "el hilo cruzo medio jardin antes de volver al ovillo.. tuluz parecia orgullosisimo del desastre. supongo que algunas pequeñas aventuras empiezan solamente porque alguien dejo todo patas arriba >w<"
  },
  "act1-rain-rescue": {
    "title": "Antes de que se moje",
    "mark": "☂",
    "text": "corrimos a guardar cada cosita antes de que la lluvia llegara mas fuerte.. no hacia falta salvar el mundo, solo cuidar nuestro pequeño mundo por un momento ♡"
  },
  "act1-tall-tulips": {
    "title": "Donde los tulipanes crecen altos",
    "mark": "✿",
    "text": "caminando un poquito mas lejos encontramos tulipanes que parecian querer alcanzar las estrellas.. incluso en un campo infinito todavia quedan rincones que no habiamos visto juntos ♡"
  },
  "act1-midnight-flower": {
    "title": "Flor de medianoche",
    "mark": "❀",
    "text": "solo abrio cuando el cielo estuvo lleno de estrellas y por un momento parecio guardar un pedacito de su luz.. me gusta que este mundo todavia pueda sorprendernos ♡"
  },
  "act1-two-paths": {
    "title": "Dos caminos",
    "mark": "↗",
    "text": "marie fue por un lado y tuluz por el otro.. elegimos uno, pero el otro seguira esperando para otra noche. no necesito conocer todos los caminos mientras pueda seguir recorriendo alguno contigo ♡"
  },
  "act1-cat-picnic": {
    "title": "Picnic para tres",
    "mark": "♡",
    "text": "un poquito de comida, juguetes tirados por todos lados y tres gatitos convencidos de que aquello era una celebracion enorme.. creo que los momentos pequeños tambien saben sentirse especiales ♡"
  },
  "act1-our-charm": {
    "title": "Nuestro detallito",
    "mark": "✧",
    "text": "elegiste una pequeña señal para dejarla colgada en el refugio.. ahora seguira ahi cada vez que volvamos. una cosita sencilla que dice que este lugar tambien tiene un pedacito elegido por ti ♡"
  },
  "act1-little-adventures": {
    "title": "Pequeñas aventuras ♡",
    "mark": "✦",
    "text": "ninguna fue una gran hazaña.. solo seguimos huellitas, recogimos juguetes, perseguimos luces y encontramos rincones nuevos. pero contigo hasta las cosas pequeñas terminan sintiendose como una aventura ♡"
  },
  "act1-new-nook": {"title":"Un rinconcito nuevo","mark":"⌂","text":"juraria que antes aqui terminaba el refugio.. pero entre las hojas apareció un espacio mas. parece que este pequeño lugar todavia tiene ganas de crecer con nosotros ♡"},
  "act1-second-pillow": {"title":"Segunda almohadita","mark":"zZ","text":"una sola almohada era tierna hasta que intentaron dormir tres gatitos encima >w< ahora hay un poquito mas de espacio para descansar.. aunque seguramente igual terminaran todos juntos ♡"},
  "act1-toy-box": {"title":"La cajita de juguetes","mark":"□","text":"por fin encontramos un lugar para la pelota, el pececito y el ovillo.. no prometo que tuluz vaya a dejarlos ahi mucho tiempo, pero al menos podemos intentarlo >w<"},
  "act1-water-bowl": {"title":"Agüita para todos","mark":"◇","text":"entre tantas aventuras tambien habia que acordarse de algo sencillo.. dejarles agüita fresca. cuidar un hogar casi siempre esta hecho de detalles pequeñitos ♡"},
  "act1-marie-place": {"title":"El lugar de Marie","mark":"☾","text":"marie eligio este rinconcito sin pedir permiso y creo que desde ese momento dejo de ser solo un lugar del jardin.. ahora es su lugar ♡"},
  "act1-tuluz-place": {"title":"El lugar de Tuluz","mark":"✦","text":"tuluz encontro un sitio desde donde puede llegar rapido a sus juguetes, al rascador y probablemente a cualquier problema que decida causar >w< definitivamente lo eligio bien ♡"},
  "act1-mewo-place": {"title":"El rinconcito de Mewo","mark":"🐾","text":"mewo puede ir y venir cuando quiera.. pero incluso ella termino encontrando un lugar al que le gusta volver. supongo que tener libertad tambien significa poder elegir donde descansar ♡"},
  "act1-flowers-grew": {"title":"Crecieron solas","mark":"❀","text":"yo solo recuerdo haber plantado un tulipan.. pero ahora hay florecitas creciendo a su alrededor. quizas algunas cosas bonitas empiezan con algo pequeño y despues encuentran solas la forma de crecer ♡"},
  "act1-home-light": {"title":"Una lucecita para volver","mark":"✧","text":"dejamos una pequeña luz encendida en el refugio.. no porque estuviera oscuro, sino porque me gusta imaginar que cada vez que volvamos algo aqui ya nos estaba esperando ♡"},
  "act1-night-home": {"title":"Una noche en casa","mark":"☾","text":"comieron, jugaron, hicieron un pequeño desastre y al final todos encontraron donde mimir.. no paso nada extraordinario. creo que por eso se sintio tanto como estar en casa ♡"},
  "act1-look-grown": {"title":"Mira cuánto creció","mark":"↺","text":"a veces cuesta notar cuanto cambio algo cuando lo vemos todos los dias.. hasta que miramos hacia atras y descubrimos que aquel pequeño claro ya esta lleno de pedacitos de nosotros ♡"},
  "act1-here-we-live": {"title":"Aquí vivimos ♡","mark":"⌂","text":"al principio solo encontramos un pequeño claro entre los arboles.. despues fuimos dejando cositas, ellos tambien, y un dia deje de sentir que veniamos a visitar este lugar. senti que estabamos volviendo a casa ♡"},
  "act1-place-return": {"title":"Un lugar al que volver","mark":"⌂","text":"hay lugares bonitos porque existen.. y otros porque alguien decide volver a ellos una y otra vez. creo que este pequeño Claro ya aprendio a esperarnos ♡"},
  "act1-same-moon": {"title":"La misma luna ♡","mark":"☾","text":"la luna es la misma que vimos desde el campo, pero desde aqui se siente diferente.. tal vez los lugares cambian cuando sabes con quien quieres mirarlos ♡"},
  "act1-nothing-happens": {"title":"Cuando no pasa nada","mark":"·","text":"no corrio nadie, no aparecio ninguna carta y no tuvimos que encontrar nada.. solo estuvimos aqui. creo que tambien quiero guardar los momentos que parecen no tener nada especial ♡"},
  "act1-things-stayed": {"title":"Cositas que se quedaron","mark":"◇","text":"una estrellita, una huellita, un hilo, una flor.. cosas pequeñas que no parecian importantes cuando ocurrieron y ahora juntas cuentan una parte de este lugar ♡"},
  "act1-return-tulip": {"title":"Volver a nuestro tulipán","mark":"✿","text":"lo plantaste en medio de miles y aun asi sigo sabiendo cual es.. me gusta pensar que entre tantas cosas en el mundo siempre habra algunas que podamos reconocer como nuestras ♡"},
  "act1-rain-stay": {"title":"Quedarnos bajo la lluvia","mark":"◇","text":"afuera seguia lloviendo y no habia nada que arreglar ni rescatar.. esta vez simplemente podiamos escucharla caer mientras nos quedabamos aqui juntos ♡"},
  "act1-still-knowing-cats": {"title":"Todavía los estamos conociendo","mark":"🐾","text":"creia que ya sabia donde dormiria marie, que haria tuluz y donde apareceria mewo.. pero cada noche hacen algo pequeño que no esperaba. me gusta que este lugar todavia pueda sorprenderme ♡"},
  "act1-your-choices": {"title":"Las cosas que elegiste","mark":"✧","text":"un tulipan aqui, un detallito alla, una forma entre las estrellas.. este mundo ya no se ve exactamente como lo imagine al principio. ahora tambien tiene decisiones tuyas dentro ♡"},
  "act1-one-more-while": {"title":"Un ratito más","mark":"☾","text":"podriamos volver al campo ahora.. pero no hay prisa. si estas aqui conmigo, cinco minutitos mas siempre pueden convertirse en otro pequeño recuerdo ♡"},
  "act1-meaning-stay": {"title":"Lo que significa quedarse ♡","mark":"♡","text":"al principio pensaba que quedarse era no irse.. ahora creo que es algo diferente. es volver, encontrar algo cambiado, reconocer lo que sigue aqui y aun asi querer ver que viene despues contigo ♡"},
  "act1-again-from-start": {"title":"Si volviera a empezar","mark":"↺","text":"si tuviera que empezar este pequeño mundo otra vez, volveria a plantar el primer tulipan, volveria a encontrar a mewo y volveria a esperar cada cosita que fue llegando.. pero creo que lo que mas querria repetir seria descubrirlo todo contigo ♡"},
  "act1-what-changed": {"title":"Todo lo que cambió","mark":"✦","text":"el campo sigue pareciendo infinito, pero ya no se siente vacio. ahora hay caminos que reconocemos, una casa a la que volver y pequeñas cosas que solo existen porque estuvimos aqui ♡"},
  "act1-what-remains": {"title":"Todo lo que sigue aquí","mark":"⌂","text":"algunas noches fueron ruidosas, otras tranquilas y muchas apenas duraron unos minutos.. pero cuando volvemos, encuentro pedacitos de todas ellas esperandonos en el mismo lugar ♡"},
  "act1-whole-night": {"title":"Una noche completa","mark":"☾","text":"jugamos, caminamos, miramos el cielo, volvimos al refugio y terminamos viendo a los tres mimir.. no hubo un gran momento. fue toda la noche la que termino sintiendose especial ♡"},
  "act1-sky-we-made": {"title":"El cielo que hicimos","mark":"✦","text":"antes las estrellas solamente estaban ahi arriba. ahora cada vez que las miro recuerdo que incluso el cielo de este lugar termino teniendo una pequeña forma elegida por ti ♡"},
  "act1-where-began": {"title":"Donde comenzó todo","mark":"✿","text":"volvi al campo y por un momento intente imaginarlo como era al principio.. sin refugio, sin huellitas, sin juguetes ni recuerdos. cuesta creer que todo esto haya empezado con un solo tulipan ♡"},
  "act1-they-grew-too": {"title":"Ellos también crecieron","mark":"🐾","text":"mewo ya no esta sola, marie encontro su rincón y tuluz consiguio llenar medio refugio de problemas >w< supongo que este mundo no fue el unico que cambio mientras estabamos aqui ♡"},
  "act1-this-little-world": {"title":"Todo este pequeño mundo","mark":"◇","text":"el campo, la luna, la lluvia, el refugio, las flores, los tres gatitos y todas esas cositas que parecian separadas.. ahora cuando las miro juntas siento que forman un mismo lugar ♡"},
  "act1-tomorrow-too": {"title":"Mañana también","mark":"☀","text":"me gusta todo lo que ya vivimos aqui, pero tambien me gusta pensar que mañana podemos volver sin saber exactamente que pequeña cosa terminaremos recordando de ese dia ♡"},
  "act1-everything-kept": {"title":"Todo lo que guardamos ♡","mark":"♡","text":"quise llenar este lugar de cosas que pudieran recordarme cuanto te quiero.. y al final termino lleno de algo mejor: momentos que solo significan algo porque los vivimos contigo aqui. si alguna vez volvemos a recorrerlo desde el principio, espero que sigamos encontrando razones para quedarnos un ratito mas ♡"}
};
  const CATEGORIES=[
  {
    "id": "field",
    "label": "CAMPO",
    "icon": "🌷",
    "description": "Cartas del campo, la luna y el minijuego.",
    "cards": [
      "intro",
      "moon",
      "moon-dark",
      "game-lost",
      "final"
    ]
  },
  {
    "id": "weather",
    "label": "CLIMA",
    "icon": "☁",
    "description": "Recuerdos encontrados cuando el cielo cambia.",
    "cards": [
      "weather-stars",
      "weather-fog",
      "weather-rain",
      "weather-storm",
      "weather-snow",
      "garden-rain",
      "garden-storm",
      "garden-snow",
      "garden-stars"
    ]
  },
  {
    "id": "mewo",
    "label": "MEWO",
    "icon": "🐾",
    "description": "El refugio, sus juguetes y los recuerdos de Mewo.",
    "cards": [
      "mewo",
      "garden-first",
      "garden-return",
      "garden-pillow",
      "garden-sleep",
      "garden-pet",
      "garden-feed",
      "garden-play",
      "garden-ball",
      "garden-fish",
      "garden-yarn",
      "garden-scratcher",
      "garden-all-toys",
      "garden-night",
      "garden-home"
    ]
  },
  {
    "id": "marie-tuluz",
    "label": "MARIE Y TULUZ",
    "icon": "♡",
    "description": "Las dos llegadas que cambiaron el Claro.",
    "cards": [
      "garden-gray-arrival",
      "garden-orange-arrival"
    ]
  },
  {
    "id": "family",
    "label": "FAMILIA",
    "icon": "⌂",
    "description": "Momentos que ocurren cuando los tres están juntos.",
    "cards": [
      "family-more",
      "family-pillow",
      "family-let-sleep",
      "family-siblings",
      "family-close",
      "family-full"
    ]
  },
  {
    "id": "secrets",
    "label": "SECRETOS",
    "icon": "✦",
    "description": "Pequeños secretos escondidos dentro del Claro.",
    "cards": [
      "secret-garden-moon",
      "secret-garden-lantern",
      "secret-garden-tree",
      "secret-garden-flowers",
      "secret-three-wishes",
      "secret-stay-longer"
    ]
  },
  {
    "id": "moments",
    "label": "MOMENTOS",
    "icon": "♡",
    "description": "Pequeñas cosas que pasan cuando simplemente te quedas a vivir un rato en este mundo.",
    "cards": [
      "act1-five-minutes",
      "act1-tuluz-ball",
      "act1-marie-trail",
      "act1-fireflies",
      "act1-after-rain",
      "act1-save-toy",
      "act1-fallen-star",
      "act1-field-loop",
      "act1-our-tulip",
      "act1-choice-place",
      "act1-three-sleep",
      "act1-little-world"
    ]
  },
  {
    "id": "adventures",
    "label": "AVENTURAS",
    "icon": "✦",
    "description": "Pequeñas historias que aparecieron mientras el mundo seguía creciendo.",
    "cards": [
      "act1-tuluz-treasure",
      "act1-marie-guide",
      "act1-mewo-awake",
      "act1-star-home",
      "act1-yarn-trail",
      "act1-rain-rescue",
      "act1-tall-tulips",
      "act1-midnight-flower",
      "act1-two-paths",
      "act1-cat-picnic",
      "act1-our-charm",
      "act1-little-adventures"
    ]
  },
  {
    "id": "homegrowth",
    "label": "HOGAR",
    "icon": "⌂",
    "description": "Cosas que aparecieron cuando el refugio dejó de sentirse terminado.",
    "cards": [
      "act1-new-nook",
      "act1-second-pillow",
      "act1-toy-box",
      "act1-water-bowl",
      "act1-marie-place",
      "act1-tuluz-place",
      "act1-mewo-place",
      "act1-flowers-grew",
      "act1-home-light",
      "act1-night-home",
      "act1-look-grown",
      "act1-here-we-live"
    ]
  },
  {
    "id": "staying",
    "label": "QUEDARSE",
    "icon": "♡",
    "description": "No se trata de encontrar más cosas, sino de volver y descubrir qué significa seguir aquí.",
    "cards": [
      "act1-place-return",
      "act1-same-moon",
      "act1-nothing-happens",
      "act1-things-stayed",
      "act1-return-tulip",
      "act1-rain-stay",
      "act1-still-knowing-cats",
      "act1-your-choices",
      "act1-one-more-while",
      "act1-meaning-stay"
    ]
  },
  {
    "id": "memories",
    "label": "RECUERDOS",
    "icon": "✦",
    "description": "Las últimas noches cálidas del Acto I: mirar todo lo vivido y guardarlo juntos.",
    "cards": [
      "act1-again-from-start",
      "act1-what-changed",
      "act1-what-remains",
      "act1-whole-night",
      "act1-sky-we-made",
      "act1-where-began",
      "act1-they-grew-too",
      "act1-this-little-world",
      "act1-tomorrow-too",
      "act1-everything-kept"
    ]
  }
];
  const SPECIAL={
  "moon-dark": "lunar",
  "garden-gray-arrival": "arrival-marie",
  "garden-orange-arrival": "arrival-tuluz",
  "secret-garden-moon": "secret",
  "secret-garden-lantern": "secret",
  "secret-garden-tree": "secret",
  "secret-garden-flowers": "secret",
  "secret-three-wishes": "secret",
  "secret-stay-longer": "secret"
};

  let basketButton=null;
  let basketCount=null;
  let overlay=null;
  let panel=null;
  let categoryTabs=null;
  let grid=null;
  let reader=null;
  let activeCategory='all';

  function readSet(key){
    try{
      const raw=localStorage.getItem(key);
      const arr=raw?JSON.parse(raw):[];
      return new Set(Array.isArray(arr)?arr:[]);
    }catch(_){
      return new Set();
    }
  }

  function writeSet(key,set){
    try{
      localStorage.setItem(key,JSON.stringify([...set]));
    }catch(_){}
  }

  function collected(){
    const all=readSet(LETTER_KEY);
    return new Set([...all].filter(id=>CARDS[id]));
  }

  function seen(){
    return readSet(SEEN_KEY);
  }

  function ensureFirstInstall(){
    let installed=false;
    try{
      installed=localStorage.getItem(INSTALL_KEY)==='1';
    }catch(_){}

    if(installed) return;

    // Evita que todas las cartas antiguas aparezcan como NUEVA.
    writeSet(SEEN_KEY,collected());

    try{
      localStorage.setItem(INSTALL_KEY,'1');
    }catch(_){}
  }

  function foundCountFor(category){
    const have=collected();
    return category.cards.filter(id=>have.has(id)).length;
  }

  function progressPercent(){
    return Math.round(collected().size/TOTAL*100);
  }

  function specialClass(id){
    const value=SPECIAL[id];
    return value ? ` basket2-special-${value}` : '';
  }

  function isNew(id){
    const have=collected();
    const opened=seen();
    return have.has(id) && !opened.has(id);
  }

  function markSeen(id){
    const current=seen();
    current.add(id);
    writeSet(SEEN_KEY,current);
  }

  function cardCategory(id){
    return CATEGORIES.find(category=>category.cards.includes(id));
  }

  function createDOM(){
    basketButton=document.getElementById('letterBasketBtn');
    basketCount=document.getElementById('basketCount');

    if(!basketButton) return false;

    if(document.getElementById('basket2Overlay')){
      overlay=document.getElementById('basket2Overlay');
      panel=document.getElementById('basket2Panel');
      categoryTabs=document.getElementById('basket2CategoryTabs');
      grid=document.getElementById('basket2Grid');
      reader=document.getElementById('basket2Reader');
      return true;
    }

    overlay=document.createElement('div');
    overlay.id='basket2Overlay';
    overlay.setAttribute('aria-hidden','true');
    overlay.innerHTML=`
      <section id="basket2Panel" role="dialog" aria-modal="true" aria-label="Colección de cartas">
        <button id="basket2Close" class="basket2-close" type="button" aria-label="Cerrar colección">×</button>

        <header class="basket2-header">
          <div class="basket2-mini-basket">
            <img src="basket.png" alt="" aria-hidden="true">
          </div>
          <div class="basket2-heading">
            <strong>CANASTA DE RECUERDOS ♡</strong>
            <small>todos los pedacitos encontrados en este pequeño mundo</small>
          </div>
        </header>

        <div class="basket2-overall">
          <div class="basket2-progress-head">
            <span>PROGRESO DEL PEQUEÑO MUNDO</span>
            <strong id="basket2OverallCount">0/${TOTAL}</strong>
          </div>
          <div class="basket2-progress" aria-hidden="true">
            <span id="basket2OverallBar"></span>
          </div>
          <p id="basket2ProgressMessage"></p>
        </div>

        <nav id="basket2CategoryTabs" class="basket2-category-tabs" aria-label="Categorías de cartas"></nav>
        <div id="basket2CategoryIntro" class="basket2-category-intro"></div>
        <div id="basket2Grid" class="basket2-grid"></div>
      </section>
    `;
    document.body.appendChild(overlay);

    reader=document.createElement('div');
    reader.id='basket2Reader';
    reader.setAttribute('aria-hidden','true');
    reader.innerHTML=`
      <article class="basket2-reader-paper" role="dialog" aria-modal="true" aria-label="Carta">
        <button id="basket2ReaderClose" class="basket2-reader-close" type="button" aria-label="Cerrar carta">×</button>
        <div id="basket2ReaderMark" class="basket2-reader-mark">♡</div>
        <div id="basket2ReaderCategory" class="basket2-reader-category"></div>
        <h2 id="basket2ReaderTitle"></h2>
        <p id="basket2ReaderText"></p>
        <button id="basket2ReaderBack" class="basket2-reader-back" type="button">Volver a la colección ♡</button>
      </article>
    `;
    document.body.appendChild(reader);

    panel=document.getElementById('basket2Panel');
    categoryTabs=document.getElementById('basket2CategoryTabs');
    grid=document.getElementById('basket2Grid');

    document.getElementById('basket2Close').addEventListener('click',closeBasket);
    document.getElementById('basket2ReaderClose').addEventListener('click',closeReader);
    document.getElementById('basket2ReaderBack').addEventListener('click',closeReader);

    overlay.addEventListener('click',event=>{
      if(event.target===overlay) closeBasket();
    });

    reader.addEventListener('click',event=>{
      if(event.target===reader) closeReader();
    });

    document.addEventListener('keydown',event=>{
      if(event.key!=='Escape') return;

      if(reader.classList.contains('show')){
        closeReader();
        return;
      }

      if(overlay.classList.contains('show')){
        closeBasket();
      }
    });

    /*
      La canasta antigua conserva toda su lógica.
      Este listener CAPTURE abre la colección nueva antes
      de que se ejecute el listener visual antiguo.
    */
    basketButton.addEventListener('click',event=>{
      event.preventDefault();
      event.stopImmediatePropagation();

      document.getElementById('basketOverlay')?.classList.remove('show');
      openBasket();
    },true);

    return true;
  }

  function renderTabs(){
    if(!categoryTabs) return;

    const have=collected();
    const totalNew=[...have].filter(id=>isNew(id)).length;

    const allButton=`
      <button class="basket2-category-tab ${activeCategory==='all'?'active':''}" data-category="all" type="button">
        <span>♡</span>
        <strong>TODAS</strong>
        <small>${have.size}/${TOTAL}</small>
        ${totalNew?`<i>${totalNew}</i>`:''}
      </button>
    `;

    const categoryButtons=CATEGORIES.map(category=>{
      const found=foundCountFor(category);
      const newCount=category.cards.filter(id=>isNew(id)).length;

      return `
        <button class="basket2-category-tab ${activeCategory===category.id?'active':''}" data-category="${category.id}" type="button">
          <span>${category.icon}</span>
          <strong>${category.label}</strong>
          <small>${found}/${category.cards.length}</small>
          ${newCount?`<i>${newCount}</i>`:''}
        </button>
      `;
    }).join('');

    categoryTabs.innerHTML=allButton+categoryButtons;

    categoryTabs.querySelectorAll('[data-category]').forEach(button=>{
      button.addEventListener('click',()=>{
        activeCategory=button.dataset.category;
        render();
      });
    });
  }

  function currentCategoryInfo(){
    if(activeCategory==='all'){
      return {
        label:'TODAS LAS CARTAS',
        icon:'♡',
        description:'Encontradas y todavía escondidas, sin revelar sus secretos.',
        cards:CATEGORIES.flatMap(category=>category.cards)
      };
    }

    return CATEGORIES.find(category=>category.id===activeCategory) || CATEGORIES[0];
  }

  function escapeAttr(text){
    return String(text)
      .replaceAll('&','&amp;')
      .replaceAll('"','&quot;')
      .replaceAll('<','&lt;')
      .replaceAll('>','&gt;');
  }

  function renderGrid(){
    const info=currentCategoryInfo();
    const have=collected();
    const intro=document.getElementById('basket2CategoryIntro');

    if(intro){
      const found=info.cards.filter(id=>have.has(id)).length;
      intro.innerHTML=`
        <span>${info.icon}</span>
        <div>
          <strong>${info.label}</strong>
          <small>${info.description}</small>
        </div>
        <b>${found}/${info.cards.length}</b>
      `;
    }

    grid.innerHTML=info.cards.map((id,index)=>{
      const item=CARDS[id];
      const unlocked=have.has(id);
      const newBadge=isNew(id);
      const category=cardCategory(id);
      const extraClass=specialClass(id);
      const aria=unlocked ? escapeAttr(item.title) : 'Carta todavía no encontrada';

      return `
        <button
          class="basket2-card ${unlocked?'found':'locked'} ${newBadge?'new':''}${extraClass}"
          data-letter="${id}"
          type="button"
          ${unlocked?'':'disabled'}
          aria-label="${aria}"
        >
          <span class="basket2-card-number">${String(index+1).padStart(2,'0')}</span>
          ${newBadge?'<span class="basket2-new-badge">NUEVA</span>':''}
          <span class="basket2-card-mark">${unlocked?item.mark:'?'}</span>
          <span class="basket2-card-copy">
            <strong>${unlocked?item.title:'???'}</strong>
            <small>${unlocked?category.label:'por descubrir'}</small>
          </span>
          <span class="basket2-card-corner">${unlocked?'♡':'·'}</span>
        </button>
      `;
    }).join('');

    grid.querySelectorAll('.basket2-card.found').forEach(button=>{
      button.addEventListener('click',()=>{
        openReader(button.dataset.letter);
      });
    });
  }

  function renderProgress(){
    const have=collected();
    const count=have.size;
    const percentage=progressPercent();

    if(basketCount){
      basketCount.textContent=String(count);
    }

    const countEl=document.getElementById('basket2OverallCount');
    const barEl=document.getElementById('basket2OverallBar');
    const messageEl=document.getElementById('basket2ProgressMessage');

    if(countEl) countEl.textContent=`${count}/${TOTAL}`;
    if(barEl) barEl.style.width=`${percentage}%`;

    if(messageEl){
      let message='Todavía quedan pequeños recuerdos escondidos por encontrar.';

      if(percentage>=35){
        message='Tu canasta empieza a guardar muchos pedacitos de este mundo ♡';
      }

      if(percentage>=65){
        message='Ya conoces gran parte de este pequeño mundo... pero aún guarda secretos.';
      }

      if(percentage>=90 && count<TOTAL){
        message='Quedan muy poquitos recuerdos escondidos ♡';
      }

      if(count>=TOTAL){
        message='Encontraste todas las cartas que existen por ahora ♡';
      }

      messageEl.textContent=`${percentage}% · ${message}`;
    }
  }

  function render(){
    renderProgress();
    renderTabs();
    renderGrid();
  }

  function openBasket(){
    if(!overlay) return;

    render();

    overlay.classList.add('show');
    overlay.setAttribute('aria-hidden','false');
    document.body.classList.add('basket2-open');
  }

  function closeBasket(){
    overlay?.classList.remove('show');
    overlay?.setAttribute('aria-hidden','true');
    document.body.classList.remove('basket2-open');
  }

  function openReader(id){
    const item=CARDS[id];

    if(!item || !collected().has(id)) return;

    markSeen(id);

    const category=cardCategory(id);

    document.getElementById('basket2ReaderMark').textContent=item.mark;
    document.getElementById('basket2ReaderCategory').textContent=`${category.icon} ${category.label}`;
    document.getElementById('basket2ReaderTitle').textContent=item.title;
    document.getElementById('basket2ReaderText').textContent=item.text;

    reader.dataset.special=SPECIAL[id] || 'normal';

    reader.classList.add('show');
    reader.setAttribute('aria-hidden','false');

    render();
  }

  function closeReader(){
    reader?.classList.remove('show');
    reader?.setAttribute('aria-hidden','true');
  }

  function refresh(){
    if(!createDOM()) return;
    render();
  }

  ensureFirstInstall();

  window.addEventListener('paradox-letter-collected',()=>{
    setTimeout(refresh,60);
  });

  /*
    Algunas cartas externas escriben directamente en localStorage.
    Este chequeo liviano mantiene todo sincronizado.
  */
  let lastSnapshot='';

  setInterval(()=>{
    const snapshot=JSON.stringify([...collected()].sort());

    if(snapshot!==lastSnapshot){
      lastSnapshot=snapshot;
      refresh();
    }
  },1400);

  const initTimer=setInterval(()=>{
    if(createDOM()){
      clearInterval(initTimer);
      refresh();
    }
  },300);

  window.ParadoxBasket2={
    open:openBasket,
    close:closeBasket,
    refresh,
    total:TOTAL,
    collected:()=>[...collected()]
  };
})();
