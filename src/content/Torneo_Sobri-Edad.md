---
id: sobri-edad
title: Torneo de la Sobri-edad
locale: es
summary: Torneo con pruebas inspiradas en los juegos rusos de Sobrinov
---

## Reglas
- El maestro de ceremonias elige el reto que mejor encaje con la energia del momento.
- El cumpleañero elige primero durante el draft de participantes.
- Las cartas sorpresa pueden alterar la dinámica del juego.
- Gana el equipo con mayor puntuacion al cerrar la ultima ronda.

## Retos:skill
- title: Torre relampago
  prompt: Construye la torre mas alta con objetos seguros en 5 minutos.
  rules:
    - La torre deberá soportar un objeto secreto durante 10 segundos. 
    - El objeto secreto se revelará después de los 90 segundos de construcción. 
    - La torre que más tiempo aguante sin caer gana. 
    - Si todas las torres aguantan 10 segundos, se repite ronda aumentando altura. 
  points: 120
  time: 300
- title: Mimo turbo
  prompt: Representa una pelicula sin hablar y consigue que tu equipo la adivine.
  rules:
    - Cada equipo tiene un intento por pelicula.
    - El capitán elige el miembro del equipo que tienen que adivinar. 
    - El equipo que tiene el turno comienza eligiendo película. 
  points: 100
  time: 60
- title: Catapulta humana
  prompt: Un miembro lanza, otro hace de "catapulta" usando una toalla o manta pequeña sujetada entre dos personas.
  rules:
    - Hay que encestar la pelota en el cubo utilizando la catapulta.
    - Los dos equipos lanzan a la vez en dos cubos diferentes. 
    - Gana el equipo que meta más pelotas en el cubo en 2 minutos. 
    - El capitán de cada equipo decide quién lanza y quien hace de catapulta. 
  points: 100
  time: 120
- title: Transporte nuclear
  prompt: Mover el huevo por el circuito entre todos los miembros del equipo usando únicamente cucharas.
  rules:
    - No se puede tocar el huevo con las manos. 
    - No se puede coger la cuchara con las manos. 
    - Si cae, vuelta al inicio. 
    - Gana el equipo más rápido.  
    - Los conos indican el punto de relevo entre miembros del equipo. 
  points: 100
  time: 300
- title: El laberinto humano
  prompt: Un jugador vendado debe recorrer el circuito guiado únicamente por las instrucciones del equipo.
  rules:
    - El capitán de cada equipo decide quién es el corredor vendado. 
    - Ambos corredores salen a la vez por el mismo circuito (que no conocen). 
    - Ambos equipos pueden dar instrucciones verbales, pero no tocar a los corredores.
    - Gana el equipo más rápido que toque todos los conos en el orden establecido.
  points: 100
  time: 300

## Retos:trivia
- title: Pon a prueba el conocimiento de tu equipo (Mec/IT)
  prompt: Responde la pregunta segun la opcion elegida.
  preQuestion:
    prompt: ¿Queréis una pregunta de (A) Mecánica del Automóvil o (B) Cyberseguridad?
    options:
      - label: (A) Mecánica del Automóvil
        challenge:
          prompt: En un motor de combustión de cuatro tiempos, ¿qué componente es el responsable final de transmitir la fuerza generada en los cilindros hacia la caja de cambios?
          multipleChoice:
            options:
              - El árbol de levas
              - El volante motor
              - El cigüeñal
              - La biela
            answerIndex: 2
            explanation: Las bielas transmiten la fuerza de los pistones al cigüeñal, pero es el cigüeñal quien convierte ese movimiento alternativo en giro y lo entrega al resto de la transmisión.
          rules:
            - Responde un unico representante.
          points: 100
          time: 45
      - label: (B) Cyberseguridad
        challenge:
          prompt: ¿Cuál de estas contraseñas suele ser más difícil de romper para un atacante moderno?
          multipleChoice:
            options:
              - Verano2026
              - P4ssw0rd!
              - Correcto-Horno-Lápiz-Cascada
              - Daniel18              
            answerIndex: 2
            explanation: Los atacantes modernos prueban primero contraseñas comunes, patrones predecibles y pequeñas variaciones como "P4ssw0rd!" o "Verano2026". Una secuencia larga de palabras no relacionadas contiene mucha más entropía y resiste mejor los ataques de fuerza bruta y diccionario.
          rules:
            - Responde un unico representante.
          points: 100
          time: 45
  # La variante base solo se usa si se muestra el reto sin resolver la pregunta previa.
  # El MC normalmente elegira una de las opciones anteriores.
  rules:
    - Un representante responde por turno.
    - Si falla, rebote para el otro equipo.
  points: 100
  time: 45
- title: Pon a prueba el conocimiento de tu equipo (Sp/Inv)
  prompt: Responde la pregunta según la opción elegida.
  preQuestion:
    prompt: ¿Queréis una pregunta de (A) Industria Espacial o (B) Inversión Minorista?
    options:
      - label: (A) Industria Espacial
        challenge:
          prompt: ¿Por qué es más difícil enviar una nave a Mercurio que a Marte?
          multipleChoice:
            options:
              - Porque Mercurio tiene una atmósfera muy densa
              - Porque hay que reducir mucha velocidad orbital para acercarse al Sol
              - Porque Mercurio está más lejos de la Tierra que Marte
              - Porque Mercurio tiene una gravedad superior a la de Júpiter
            answerIndex: 1
            explanation: Una nave que sale de la Tierra ya viaja alrededor del Sol a gran velocidad. Para llegar a Mercurio debe perder gran parte de esa velocidad orbital, lo que requiere mucha energía y maniobras complejas.
          rules:
            - Responde un único representante.
          points: 100
          time: 45
      - label: (B) Inversión Minorista
        challenge:
          prompt: ¿Cuál es la principal ventaja de un fondo indexado global frente a comprar acciones de una única empresa?
          multipleChoice:
            options:
              - Garantiza rentabilidad positiva todos los años
              - Está protegido por el Estado frente a pérdidas
              - Reduce el riesgo al diversificar entre muchas empresas
              - No puede perder valor en mercados bajistas
              - El índice siempre se comporta mejor que una única empresa
            answerIndex: 2
            explanation: Un fondo indexado global reparte la inversión entre cientos o miles de empresas, reduciendo el impacto que tendría el mal comportamiento de una sola compañía.
          rules:
            - Responde un único representante.
          points: 100
          time: 45
    rules:
      - Un representante responde por turno.
      - Si falla, rebote para el otro equipo.
  points: 100
  time: 45
- title: Pon a prueba el conocimiento de tu equipo (Can/Dev)
  prompt: Responde la pregunta según la opción elegida.
  preQuestion:
    prompt: ¿Queréis una pregunta de (A) Educación Canina o (B) Psicología del Desarrollo?
    options:
      - label: (A) Educación Canina
        challenge:
          prompt: Cuando un perro recibe una recompensa inmediatamente después de sentarse cuando se le da la orden, ¿qué principio de aprendizaje se está utilizando?
          multipleChoice:
            options:
              - Habituación o asentamiento
              - Refuerzo positivo
              - Asimilación positiva
              - Castigo negativo
              - Impronta positiva
              - Refuerzo negativo
            answerIndex: 1
            explanation: El refuerzo positivo consiste en añadir algo que el perro valora (comida, juego o atención) para aumentar la probabilidad de que repita la conducta.
          rules:
            - Responde un único representante.
          points: 100
          time: 45
      - label: (B) Psicología del Desarrollo
        challenge:
          prompt: ¿Cuál de los siguientes logros cognitivos suele aparecer primero en el desarrollo infantil según la teoría de Piaget?
          multipleChoice:
            options:
              - Pensamiento hipotético-deductivo
              - Conservación de la cantidad
              - Permanencia del objeto
              - Razonamiento proporcional
            answerIndex: 2
            explanation: La permanencia del objeto aparece durante la etapa sensoriomotora, mientras que la conservación surge más tarde durante las operaciones concretas y el razonamiento hipotético-deductivo durante las operaciones formales.
          rules:
            - Responde un único representante.
          points: 100
          time: 45
    rules:
      - Un representante responde por turno.
      - Si falla, rebote para el otro equipo.
  points: 100
  time: 45
- title: Pon a prueba el conocimiento de tu equipo (Bio/Sp)
  prompt: Responde la pregunta según la opción elegida.
  preQuestion:
    prompt: ¿Queréis una pregunta de (A) Biología de los Conejos o (B) Industria Espacial Avanzada?
    options:
    - label: (A) Biología de los Conejos
      challenge:
        prompt: ¿Por qué los conejos domésticos producen dos tipos distintos de excrementos y se comen uno de ellos?
        multipleChoice:
          options:
            - Para marcar territorio
            - Para regular la temperatura corporal
            - Para aprovechar nutrientes producidos durante la digestión
            - Para evitar depredadores
          answerIndex: 2
          explanation: Los conejos producen cecotrofos, ricos en nutrientes y vitaminas generados por la fermentación intestinal, que vuelven a ingerir para completar la digestión.
        rules:
          - Responde un único representante.
        points: 100
        time: 45
    - label: (B) Industria Espacial Avanzada
      challenge:
        prompt: ¿Cuál es la principal ventaja de reutilizar la primera etapa de un cohete orbital?
        multipleChoice:
          options:
            - Aumentar la velocidad de la luz
            - Reducir significativamente los costes de lanzamiento
            - Eliminar la necesidad de combustible
            - Evitar cualquier riesgo durante el despegue
          answerIndex: 1
          explanation: La primera etapa suele ser la parte más cara del vehículo. Recuperarla y reutilizarla permite reducir considerablemente el coste por lanzamiento.
        rules:
          - Responde un único representante.
        points: 100
        time: 45
    rules:
      - Un representante responde por turno.
      - Si falla, rebote para el otro equipo.
    points: 100
    time: 45
- title: Pon a prueba el conocimiento de tu equipo (VG/Met)
  prompt: Responde la pregunta según la opción elegida.
  preQuestion:
    prompt: ¿Queréis una pregunta de (A) Videojuegos o (B) Meteorología?
    options:
    - label: (A) Videojuegos
      challenge:
        prompt: ¿Cuál fue el videojuego más vendido de la historia?
        multipleChoice:
          options:
            - GTA V
            - Minecraft
            - Tetris
            - Wii Sports
          answerIndex: 1
          explanation: El juego más vendido de la historia es Minecraft, con más de 350 millones de copias comercializadas. Le sigue de cerca Tetris, con más de 200 millones (gracias a sus múltiples adaptaciones), y Grand Theft Auto V (GTA V), que supera los 200 millones de unidades vendidas.
        rules:
          - Responde un único representante.
        points: 100
        time: 45
    - label: (B) Meteorología
      challenge:
        prompt: ¿Es cierto que los rayos nunca caen dos veces en el mismo sitio?
        multipleChoice:
          options:
            - Sí, porque la descarga eléctrica neutraliza temporalmente la zona
            - "Depende: solo pueden caer dos veces si la segunda descarga ocurre antes de 30 segundos"
            - Sí, salvo que el lugar haya sido bendecido por un meteorólogo profesional
            - No, de hecho los rayos suelen impactar repetidamente en los mismos puntos
          answerIndex: 3
          explanation: Los rayos pueden caer en el mismo lugar más de una vez. De hecho, los rayos frecuentemente caen en el mismo lugar repetidamente, en especial en objetos altos, puntiagudos y aislados. Al Empire State Building le caen más de 100 rayos al año.
        rules:
          - Responde un único representante.
        points: 100
        time: 45
    rules:
      - Un representante responde por turno.
      - Si falla, rebote para el otro equipo.
    points: 100
    time: 45




## Retos:duel
- title: El Huevo Imposible
  prompt: Consigue que el huevo (de gomaespuma) entre en el jarrón después de rebotar una única vez en el suelo.
  rules:
    - Cada equipo deberá demostrar precisión, control y un poco de suerte para superar este desafío. El huevo debe golpear primero el suelo y, tras el rebote, acabar dentro del jarrón. Los equipos se turnarán lanzamiento a lanzamiento hasta que uno consiga 3 aciertos.
  points: 300
  time: 300
- title: El Tesoro Sumergido
  prompt: Un objeto descansa en el fondo de un jarrón lleno de agua hasta el borde. Sacarlo parece imposible, pero existe una solución elegante. ¿La encontraréis antes que el otro equipo?
  rules:
    - No se puede tocar ni mover el jarrón.
    - No se puede vaciar ni derramar agua.
    - Se permite utilizar únicamente los materiales proporcionados.
    - El objeto debe salir completamente del agua.
    - Se dispone de un intento por turno y cada equipo decide qué participante lo intenta. 
    - Gana el equipo que primero consiga sacar el objeto sin derramar agua. 
  points: 150
  time: 300
- title: Ingeniería Extrema
  prompt: Cada equipo deberá diseñar y construir una máquina utilizando únicamente las piezas que consiga durante las distintas fases del desafío.
  phases:
    - title: Acopio de Recursos
      description: Los equipos seleccionan piezas de LEGO de un repositorio común sin conocer todavía el desafío final.
      rules:
        - Los equipos se turnan para escoger piezas.
        - Cada turno permite coger un número limitado de piezas (10).
        - Las piezas elegidas no pueden devolverse.
    - title: Revelación
      description: Se anuncia que la máquina que deberán construir es un vehículo capaz de recorrer la máxima distancia posible.
    - title: Última Oportunidad
      description: Último turno para conseguir piezas adicionales.
      rules:
        - Cada equipo dispone de un único turno extra de selección ahora que ya saben que tienen que construir un vehículo.
    - title: Mercado de Piezas
      description: Los equipos pueden negociar libremente entre sí.
      rules:
        - Se permite comprar, vender o intercambiar piezas por puntos.
        - Todas las negociaciones deben completarse antes de finalizar la fase.
    - title: Construcción
      description: Es el momento de diseñar y montar el vehículo.
      rules:
        - Solo pueden utilizarse las piezas obtenidas.
        - El vehículo debe ser capaz de rodar por sí mismo.
        - "Tiempo máximo de construcción: 15 minutos."
    - title: Prueba de Rodadura
      description: Todos los coches se enfrentan en la misma rampa.
      rules:
        - El coche se colocará en la misma posición inicial para todos los equipos.
        - No se permite empujar ni impulsar el vehículo.
        - El coche se soltará simplemente desde reposo.
        - Gana el equipo cuyo coche recorra la mayor distancia.
        - Si un coche pierde piezas durante el recorrido, la distancia sigue siendo válida.
        - Si un coche no rueda, su distancia será cero.
  points: 500
  time: 600



## Sorpresas
- title: Robo elegante
  description: El equipo lider roba temporalmente a la ultima persona reclutada por otro equipo.
  effectType: steal_member
- title: Lluvia de bonus
  description: El primer equipo del tablero recibe un empujon extra de puntuacion.
  effectType: bonus_points
  value: 100
- title: Marcadores locos
  description: Los dos primeros equipos intercambian sus puntos por una ronda.
  effectType: swap_scores
- title: Doble o nada
  description: El siguiente reparto de puntos vale el doble.
  effectType: double_round
- title: Silencio tactico
  description: El equipo que va primero pierde su siguiente turno estrategico.
  effectType: skip_turn
- title: Relevo relampago
  description: El lider de la ronda salta al siguiente equipo en el orden actual.
  effectType: shift_round_leader
