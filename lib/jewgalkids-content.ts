// Contenido de las herramientas interactivas del curso Joogalkids — transcripto
// fielmente del material original (carpeta de la certificación: posturas,
// valores universales y patrones de respiración).

export type BreathingPattern = {
  id: string
  name: string
  description: string
  inhale: number
  hold: number
  exhale: number
  visual: "circle" | "balloon"
}

export const BREATHING_PATTERNS: BreathingPattern[] = [
  {
    id: "nariz-nariz",
    name: "Nariz a nariz",
    description: "Inhalá por la nariz, exhalá por la nariz. La forma más simple para empezar.",
    inhale: 4, hold: 0, exhale: 4,
    visual: "circle",
  },
  {
    id: "nariz-boca",
    name: "Nariz a boca",
    description: "Inhalá por la nariz, exhalá suavemente por la boca.",
    inhale: 4, hold: 0, exhale: 4,
    visual: "circle",
  },
  {
    id: "cuenta-5",
    name: "Cuenta de 5",
    description: "Inhalá 5 segundos, sostené 5, exhalá 5. Ideal para calmar la mente.",
    inhale: 5, hold: 5, exhale: 5,
    visual: "circle",
  },
  {
    id: "cuenta-8",
    name: "Cuenta de 8",
    description: "Inhalá 8 segundos, sostené 5, exhalá 8. Respiración profunda y relajante.",
    inhale: 8, hold: 5, exhale: 8,
    visual: "circle",
  },
  {
    id: "globo",
    name: "El globo",
    description: "Imaginá que inflás un globo con cada inhalación… y lo soltás despacio al exhalar.",
    inhale: 4, hold: 1, exhale: 6,
    visual: "balloon",
  },
]

export type Posture = {
  id: string
  order: number
  nameGeneral: string
  nameHebrew: string
  instructions: string
  variations: string
  spiritualGeneral: string
  spiritualHebrew: string
}

export const POSTURES: Posture[] = [
  {
    id: "silencio", order: 1, nameGeneral: "Silencio", nameHebrew: "Álef",
    instructions: "Comienza parado, con tus piernas abiertas y rectas. Tus pies pueden estar viendo hacia el frente o estar un poco girados hacia afuera. Sube tus brazos hacia arriba y ábrelos a la misma distancia de tus pies. Tus manos y tus pies deben estar alineados. Respira profundo inhalando y exhalando. Cierra tus ojos e imagina el símbolo del silencio.",
    variations: "Conservando la posición original, dobla tus rodillas como si quisieras agacharte un poco. Dobla tus brazos en escuadra a 90°. Puedes jugar a sostener el equilibrio, pararte de puntillas y crecer, o dar una vuelta girando tu cuerpo sin deshacer la posición.",
    spiritualGeneral: "Cuando guardamos silencio, podemos escuchar mejor nuestro mundo interior y también el mundo que nos rodea. El silencio nos ayuda a conectarnos con la Creación y el Universo.",
    spiritualHebrew: "La Álef no tiene sonido, es el silencio. Cuando guardamos silencio, podemos escuchar mejor nuestro mundo interior y también el mundo que nos rodea. El silencio nos ayuda a conectarnos con la Creación y el Universo.",
  },
  {
    id: "la-casa", order: 2, nameGeneral: "La casa", nameHebrew: "Bet",
    instructions: "Comienza sentado, con tus piernas rectas hacia adelante y tus pies juntos. Tu espalda lo más recta que puedas. Coloca tu brazo derecho atrás y cerca de tu espalda, palma mirando hacia atrás. Extiende el brazo izquierdo hacia adelante, paralelo a tus piernas, mano apuntando hacia arriba. Ahora lo realizamos con la otra mano.",
    variations: "Gira tu cabeza hacia la derecha como volteando a ver detrás de ti (inhalando) y regresa hacia adelante (exhalando). Jugando con alguien: formen una casita colocando pies con pies y sosteniéndose de las manos.",
    spiritualGeneral: "Nuestro cuerpo es nuestra casa. Allí vive nuestra alma, por eso es importante cuidarlo y quererlo. Nuestra alma necesita una casa donde vivir cómoda y ser feliz.",
    spiritualHebrew: "La Bet es la casa. Nuestro cuerpo es nuestra casa. Allí vive nuestra alma, por eso es importante cuidarlo y quererlo. Nuestra alma necesita una casa donde vivir cómoda y ser feliz.",
  },
  {
    id: "dar", order: 3, nameGeneral: "Dar", nameHebrew: "Guímel",
    instructions: "Empieza parado recto, extiende tu pie derecho hacia adelante, el izquierdo hacia atrás. Lleva tu brazo derecho hacia adelante con la mano en posición vertical. Cambia de pie y de brazo.",
    variations: "Balancea tu cuerpo, sin mover tus pies, hacia adelante y hacia atrás, flexionando la rodilla delantera. Inhala hacia adelante, exhala hacia atrás.",
    spiritualGeneral: "Siempre tenemos que tener una mano extendida que busca a quién dar. Dar amor y también dar lo que la otra persona necesita nos engrandece como seres humanos.",
    spiritualHebrew: "La Guímel significa dar. Siempre tenemos que tener una mano extendida que busca a quién dar. Dar amor y también dar lo que la otra persona necesita nos engrandece como seres humanos.",
  },
  {
    id: "puerta-humildad", order: 4, nameGeneral: "La puerta de la humildad", nameHebrew: "Dálet",
    instructions: "Empieza parado con tus pies juntos y paralelos. Dobla tu torso hacia adelante en posición horizontal, manteniendo la espalda lo más recta posible. Tus brazos van hacia atrás con las manos rectas y paralelas.",
    variations: "Podés sostener la posición varias respiraciones, sintiendo el estiramiento de la espalda.",
    spiritualGeneral: "Ser más humildes nos da la posibilidad de ser más abiertos a aprender más sobre la vida. A tener más aceptación y ser más felices con lo que tenemos.",
    spiritualHebrew: "La Dálet representa la puerta de la humildad. Ser más humildes nos da la posibilidad de ser más abiertos a aprender más sobre la vida. A tener más aceptación y ser más felices con lo que tenemos.",
  },
  {
    id: "expresion-alma", order: 5, nameGeneral: "Expresión del alma", nameHebrew: "Hei",
    instructions: "Coloca un objeto en el suelo y párate enfrente, con tus pies juntos y paralelos. Dobla tu cuerpo hacia adelante en posición horizontal, espalda recta, brazos hacia atrás. Fija tu mirada en el objeto. Inhala y exhala en esta posición.",
    variations: "Baja tus brazos y prueba alcanzar el objeto con las manos (inhalando), manteniendo la espalda derecha, y regresa a la horizontal inicial (exhalando).",
    spiritualGeneral: "Esta posición representa las tres formas de expresión del alma: Pensamiento (siempre positivos), Palabra (siempre amable) y Acción (siempre un acto de bien).",
    spiritualHebrew: "La Hei representa las tres formas de expresión del alma: Pensamiento (siempre positivos), Palabra (siempre amable) y Acción (siempre un acto de bien).",
  },
  {
    id: "conexion", order: 6, nameGeneral: "Conexión", nameHebrew: "Vav",
    instructions: "Párate recto, con tus pies juntos y paralelos. Levanta tus brazos, extiéndelos hacia arriba y relaja los hombros (inhala). Baja los brazos por los costados de tu cuerpo (exhala).",
    variations: "Lleva la mirada hacia arriba y hacia abajo mientras sigues el movimiento de los brazos. Intenta ponerte de puntillas y luego baja los pies, acompañando con la respiración.",
    spiritualGeneral: "Esta posición significa conexión. Es nuestro cable de conexión con el Universo. Es la conexión entre el mundo espiritual de arriba y el mundo de abajo donde estamos. Siente esa unidad.",
    spiritualHebrew: "La Vav significa conexión. Es nuestro cable de conexión con el Universo o D-s. Es la conexión entre el mundo espiritual de arriba y el mundo de abajo donde estamos. Siente esa unidad.",
  },
  {
    id: "la-corona", order: 7, nameGeneral: "La corona", nameHebrew: "Záin",
    instructions: "Comienza parado con tus pies juntos y paralelos. Levanta una pierna, flexionando un poco la rodilla. Extiende los brazos hacia arriba y junta tus manos formando un círculo sobre tu cabeza. Relaja tus hombros y mantén la postura poniendo a prueba tu equilibrio. Repite con la otra pierna.",
    variations: "Manteniendo la postura, decí bien fuerte: ¡Yo puedo! Soy fuerte como un rey. Probá cambiar la pierna levantada hacia adelante, el costado y hacia atrás.",
    spiritualGeneral: "Esta posición representa la corona sobre nuestra cabeza. Nosotros somos el rey o la reina de nuestro propio ser. Al hacer esta posición demostramos que tenemos dominio sobre nuestro cuerpo, mente y emociones.",
    spiritualHebrew: "La Záin es la corona sobre nuestra cabeza. Nosotros somos el rey o la reina de nuestro propio ser. Al hacer esta posición demostramos que tenemos dominio sobre nuestro cuerpo, mente y emociones.",
  },
  {
    id: "el-puente", order: 8, nameGeneral: "El puente", nameHebrew: "Jet",
    instructions: "Comienza parado con tus pies un poco separados y paralelos. Agacha tu cuerpo con los brazos hacia abajo, dejándolos caer relajados. Tu espalda debe estar curva. Relaja tu cuello y respira tranquilamente.",
    variations: "Hacé movimientos muy lentos y chiquitos con tu espalda, sintiendo cómo se mueve cada vértebra.",
    spiritualGeneral: "La vida es como un puente. A veces con paisajes hermosos, a veces con dificultades. A veces estamos dispuestos a cruzarlo, a veces nos da miedo. Pero siempre debemos cruzarlo: podríamos encontrar caminos de felicidad y aprendizaje que nunca pensamos encontrar.",
    spiritualHebrew: "La Jet significa cruzar un puente angosto. La vida es como un puente. A veces con paisajes hermosos, a veces con dificultades. Pero siempre debemos cruzarlo: podríamos encontrar caminos de felicidad y aprendizaje que nunca pensamos encontrar.",
  },
  {
    id: "bolsita-semillas", order: 9, nameGeneral: "Bolsita de semillas", nameHebrew: "Tet",
    instructions: "Comienza acostado sobre el suelo, boca arriba. Levanta tus piernas, un poco flexionadas, y extiende tus brazos hacia arriba, rectos y relajados. Respira relajadamente. Cierra tus ojos e imagina que hay una semilla al lado de tu ombligo, muy chiquita, que tenés que cuidar.",
    variations: "Inhalá, encogé tus piernas y brazos; exhalá y volvé a la posición. Sentí que abrazás y cuidás a esa semilla, dándole tu calor.",
    spiritualGeneral: "Esta posición representa la bolsita donde plantamos nuestras semillitas, donde crecen con calidez y amor. Es nuestro espacio de creación, un lugar donde me siento tranquilo y en paz.",
    spiritualHebrew: "La Tet es la bolsita donde plantamos nuestras semillitas, donde crecen con calidez y amor. Es nuestro espacio de creación, un lugar donde me siento tranquilo y en paz.",
  },
  {
    id: "semillas", order: 10, nameGeneral: "Semillas", nameHebrew: "Yud",
    instructions: "Comienza acostado sobre el suelo, boca arriba. Flexiona tus piernas y abrázalas con tus brazos. Deja tu cabeza relajada en el suelo. Ahora somos la semilla: respirá y sentí los latidos de tu corazón.",
    variations: "Sentado, con las piernas flexionadas, encorvá tu espalda y abrazá tus piernas. Probá esta posición viendo hacia arriba, hacia abajo o hacia un lado.",
    spiritualGeneral: "Esta posición representa la semilla, el principio de todo. Cada vez que quiero realizar algo debo encontrar la semilla para plantarla. Todo comienza con algo muy pequeño.",
    spiritualHebrew: "La Yud es la semilla, el principio de todo. Cada vez que quiero realizar algo debo encontrar la semilla para plantarla. Todo comienza con algo muy pequeño.",
  },
  {
    id: "recipiente-recibir", order: 11, nameGeneral: "Recipiente para recibir", nameHebrew: "Caf",
    instructions: "Comienza sentado con tus piernas extendidas hacia adelante. Espalda recta, brazos extendidos hacia adelante con las palmas apuntando hacia arriba… ¡listas para recibir!",
    variations: "Inhalá abriendo las manos, exhalá cerrándolas.",
    spiritualGeneral: "Nosotros también tenemos que abrir nuestras manos para recibir. Si querés obtener algo, simplemente abrí tu mano.",
    spiritualHebrew: "La Caf es un recipiente para recibir. Nosotros también tenemos que abrir nuestras manos para recibir. Si querés obtener algo, simplemente abrí tu mano.",
  },
  {
    id: "estudio", order: 12, nameGeneral: "Estudio", nameHebrew: "Lámed",
    instructions: "Comienza parado con tus pies paralelos. Dobla la cintura hacia adelante y extendé tus brazos hacia arriba, paralelos, con la cabeza viendo hacia abajo.",
    variations: "Inhalá con tus brazos arriba y exhalá bajándolos. Imaginá que en cada inhalación llevás oxígeno a tu cerebro y lo nutrís, lo llenás de vida.",
    spiritualGeneral: "Solo a través del conocimiento vamos a entender un poco más este mundo y también el objetivo del por qué estamos aquí.",
    spiritualHebrew: "La letra Lámed significa el estudio, el conocimiento. Solo a través del conocimiento vamos a entender un poco más este mundo y también el objetivo del por qué estamos aquí.",
  },
  {
    id: "agua", order: 13, nameGeneral: "Agua", nameHebrew: "Mem",
    instructions: "Empieza sentado con tus piernas extendidas hacia adelante. Subí tus brazos hacia arriba con las palmas hacia abajo. Espalda recta, tronco inclinado ligeramente hacia adelante (ángulo de 45°). Doblá la muñeca hacia abajo.",
    variations: "Podés inclinarte hacia adelante inhalando y volver hacia atrás exhalando, como olas que vienen y van.",
    spiritualGeneral: "El agua es la fuente principal que nutre nuestro planeta. Por eso simboliza la bondad y, al mismo tiempo, la pureza.",
    spiritualHebrew: "La Mem significa el agua, la fuente principal que nutre nuestro planeta. Por eso simboliza la bondad y, al mismo tiempo, la pureza.",
  },
  {
    id: "milagros", order: 14, nameGeneral: "Milagros", nameHebrew: "Num",
    instructions: "Empieza sentado con tus piernas extendidas hacia adelante. Subí tus brazos hacia arriba con las manos apuntando hacia arriba. Espalda recta en ángulo de 90°.",
    variations: "Inhalá y extendé los brazos lo más alto posible, luego exhalá y relajá tus brazos sin bajarlos.",
    spiritualGeneral: "Los milagros son aquellas cosas que nos suceden en la vida y nos sorprenden, cosas que no tienen explicación. Cada día es un milagro: aprendé a sorprenderte de las pequeñas cosas, ellas también son un milagro.",
    spiritualHebrew: "La Num simboliza los milagros: aquellas cosas que nos suceden en la vida y nos sorprenden, cosas que no tienen explicación. Cada día es un milagro: aprendé a sorprenderte de las pequeñas cosas, ellas también son un milagro.",
  },
  {
    id: "circulos", order: 15, nameGeneral: "Círculos", nameHebrew: "Sámaj",
    instructions: "Acuéstate en el suelo boca abajo. Dobla las piernas y, con tus brazos girados hacia atrás, agarrá tus pies con tus manos. Tu espalda se arquea y tu cabeza debe estar relajada en el suelo para no forzar el cuello.",
    variations: "Moví cada parte de tu cuerpo como un círculo, dando movimiento a cada articulación.",
    spiritualGeneral: "El círculo no tiene ni principio ni fin y encierra todos los secretos más profundos de la creación. Cada creación en el universo tiene forma de círculo: los astros, los planetas. La vida es un círculo.",
    spiritualHebrew: "La Sámaj significa círculo. Esta forma no tiene ni principio ni fin y encierra todos los secretos más profundos de la creación. Cada creación en el universo tiene forma de círculo: los astros, los planetas. La vida es un círculo.",
  },
  {
    id: "el-ojo", order: 16, nameGeneral: "El ojo", nameHebrew: "Áin",
    instructions: "Acuéstate en el suelo boca arriba. Levantá tus piernas y abrilas formando una V (pies flexionados). Colocá tus manos a la par de tu cuerpo, usando la fuerza del abdomen para sostener las piernas arriba.",
    variations: "Inhalá, subí la cabeza y enfocá la vista a través de tus piernas. Exhalá y relajala en el piso.",
    spiritualGeneral: "Esta posición simboliza el ojo, la virtud de poder VER. Es importante diferenciar entre ver y mirar: mirar es solo usar el sentido de la vista, mientras que ver es profundizar en aquello que miramos. Si hay una flor, detenete a VER cuán hermosa es.",
    spiritualHebrew: "La Áin simboliza el ojo, la virtud de poder VER. Es importante diferenciar entre ver y mirar: mirar es solo usar el sentido de la vista, mientras que ver es profundizar en aquello que miramos. Si hay una flor, detenete a VER cuán hermosa es.",
  },
  {
    id: "boca", order: 17, nameGeneral: "Boca", nameHebrew: "Pei",
    instructions: "Siéntate en el suelo con tus piernas rectas y extendidas hacia adelante. Encorvá tu espalda y cruzá tus brazos adelante formando un círculo. Tu cabeza y tu vista deben estar hacia abajo.",
    variations: "Inhalá y exhalá por la boca, relajando también su parte interna.",
    spiritualGeneral: "Esta posición simboliza la boca. Solo tenemos una boca: debemos prestar atención a que, cuando hablamos, la usemos solo para decir cosas bellas.",
    spiritualHebrew: "La Pei simboliza la boca. Solo tenemos una boca: debemos prestar atención a que, cuando hablamos, la usemos solo para decir cosas bellas.",
  },
  {
    id: "el-justo", order: 18, nameGeneral: "El justo", nameHebrew: "Tzádik",
    instructions: "Siéntate con las piernas rectas extendidas hacia adelante, espalda recta y brazos extendidos hacia arriba. Girá tu tronco hacia la derecha abriendo tus brazos a 45°. Hacé lo mismo hacia el otro lado, inhalando y exhalando mientras vas girando.",
    variations: "Recostado boca arriba, llevá las piernas hacia la derecha hasta 90°, girando cabeza y vista hacia el lado contrario. Hacé lo mismo cambiando de lado.",
    spiritualGeneral: "Justa es aquella persona que puede sentir compasión por los otros y amor por toda creación. Una persona justa no juzga los actos de los demás; puede ver siempre el bien en cada paso de su vida.",
    spiritualHebrew: "La Tzádik significa ser justo. Justa es aquella persona que puede sentir compasión por los otros y amor por toda creación. No juzga los actos de los demás; puede ver siempre el bien en cada paso de su vida.",
  },
  {
    id: "mono", order: 19, nameGeneral: "Mono", nameHebrew: "Kuf",
    instructions: "Comienza parado con tus pies un poco separados y paralelos. Con los brazos relajados, empezá a agacharte encorvando la espalda hasta tocar la punta de tus pies. Flexioná un poco las rodillas y dejá caer brazos y cabeza, relajando el cuello.",
    variations: "Bajá y subí, inhalando y exhalando, sin llegar hasta arriba del todo.",
    spiritualGeneral: "El mono es amigable y cuida de aquel que ama. Es divertido y muy simpático. La vida también es diversión: es un aprendizaje encontrar la felicidad en cada cosa que hacemos.",
    spiritualHebrew: "La Kuf viene de la palabra Kof, que significa mono. Es amigable y cuida de aquel que ama, es divertido y muy simpático. La vida también es diversión: es un aprendizaje encontrar la felicidad en cada cosa que hacemos.",
  },
  {
    id: "cabeza", order: 20, nameGeneral: "Cabeza", nameHebrew: "Resh",
    instructions: "Comienza parado con tus pies un poco separados y paralelos. Doblá la cintura hacia adelante con la espalda lo más recta posible. Brazos extendidos hacia adelante, dedos apuntando hacia arriba en un ángulo de 90°. Inhalá y exhalá concentrándote en la forma de tu cabeza, asiento de tus pensamientos.",
    variations: "Podés sostener la posición varias respiraciones, sintiendo el estiramiento.",
    spiritualGeneral: "En la cabeza está la fuerza de la sabiduría y donde las ideas se crean. Mantener calma nuestra mente y elegir qué pensamientos queremos mantener es uno de los mayores objetivos de nuestra vida.",
    spiritualHebrew: "La Resh viene de la palabra Rosh, que significa cabeza. Allí está la fuerza de la sabiduría y donde las ideas se crean. Mantener calma nuestra mente y elegir qué pensamientos queremos mantener es uno de los mayores objetivos de nuestra vida.",
  },
  {
    id: "paz", order: 21, nameGeneral: "Paz", nameHebrew: "Shin",
    instructions: "Acuéstate en el suelo boca arriba. Levantá tus piernas hacia arriba y abrilas formando una V. Ahora levantá tus brazos rectos hacia arriba, centrándolos entre el espacio de tus piernas.",
    variations: "Inhalá y exhalá. Es una posición de mucho desafío y fuerza, al igual que la paz.",
    spiritualGeneral: "La paz es una de las cosas más bellas que pueden suceder entre los seres humanos.",
    spiritualHebrew: "La Shin significa paz, una de las cosas más bellas que pueden suceder entre los seres humanos.",
  },
  {
    id: "camino-verdad", order: 22, nameGeneral: "Camino de la verdad", nameHebrew: "Tav",
    instructions: "Ponte en posición de cuatro puntos. Haciendo fuerza con tus brazos y empujando hacia arriba, separá tus rodillas levemente del suelo. Tu espalda debe estar lo más recta posible.",
    variations: "Inhalá y exhalá mientras levantás y bajás las rodillas.",
    spiritualGeneral: "A la verdad la encontramos al final de una acción o aventura, no al principio. Al ver los resultados al final, nos damos cuenta de que la verdad es la única manera de lograr lo que nos proponemos.",
    spiritualHebrew: "La Tav representa el camino de la verdad. Está al final de la palabra emet (verdad, en hebreo), enseñándonos que la verdad la encontramos al final de una acción o aventura, no al principio.",
  },
]

export type ValueCard = {
  id: string
  name: string
  color: string
  bg: string
  description: string
  isShadow?: boolean
}

export const VALUE_CARDS: ValueCard[] = [
  { id: "respeto", name: "Respeto", color: "#2F7D4F", bg: "#EAF6EE", description: "Cuidar y valorar a cada persona, respetando su ritmo y sus tiempos." },
  { id: "humildad", name: "Humildad", color: "#B08900", bg: "#FDF6DC", description: "Estar abiertos a aprender y aceptar lo que la vida nos enseña." },
  { id: "paciencia", name: "Paciencia", color: "#7A4FA3", bg: "#F3EAFA", description: "Confiar en que cada cosa llega en su momento." },
  { id: "esperanza", name: "Esperanza", color: "#C6600A", bg: "#FDEEE0", description: "Creer que siempre hay un camino hacia algo mejor." },
  { id: "amor", name: "Amor", color: "#C24F82", bg: "#FBE9F1", description: "Dar y recibir con el corazón abierto." },
  { id: "bondad", name: "Bondad", color: "#7A2E3B", bg: "#F5E3E6", description: "Actuar pensando en el bienestar de los demás." },
  { id: "agradecimiento", name: "Agradecimiento", color: "#1F7A8C", bg: "#E3F4F7", description: "Reconocer y valorar lo que tenemos cada día." },
  { id: "perdon", name: "Perdón", color: "#2A5CA8", bg: "#E6EEFB", description: "Soltar lo que pesa para poder seguir en paz." },
  { id: "felicidad", name: "Felicidad", color: "#C13B3B", bg: "#FBE7E7", description: "Disfrutar plenamente del momento presente." },
  { id: "compasion", name: "Compasión", color: "#A76D61", bg: "#FBF8F4", description: "Sentir y acompañar el dolor del otro con ternura." },
  { id: "sombrita", name: "Sombrita", color: "#6B6B6B", bg: "#EDEDED", description: "La sombra de cada valor: lo que nos impide brillar con toda nuestra luz.", isShadow: true },
]
