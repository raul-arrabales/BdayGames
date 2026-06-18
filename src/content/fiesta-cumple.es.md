---
id: fiesta-cumple
title: Fiesta Familiar de Cumpleanos
locale: es
summary: Un set inicial de retos, giros y reglas para dirigir una fiesta de cumpleanos en casa.
---

## Reglas
- El maestro de ceremonias elige el reto que mejor encaje con la energia del momento.
- El cumpleanero elige primero durante el draft de participantes.
- Las cartas sorpresa pueden alterar el marcador o mover miembros entre equipos.
- Gana el equipo con mayor puntuacion al cerrar la ultima ronda.

## Retos:trivia
- title: Preguna de Trivial a elegir
  prompt: Responde la pregunta correcta segun la opcion elegida.
  preQuestion:
    prompt: ¿Queréis pregunta de (A) Mecánica del Automóvil o (B) Cyberseguridad?
    options:
      - label: (A) Mecánica del Automóvil
        challenge:
          prompt: ¿Qué pieza del motor convierte el movimiento de los pistones en giro?
          multipleChoice:
            options:
              - El cigüeñal
              - El radiador
              - La batería
              - El filtro de aire
            answerIndex: 0
            explanation: El cigüeñal transforma el movimiento lineal de los pistones en movimiento giratorio.
          rules:
            - Responde un unico representante.
          points: 100
          time: 60
      - label: (B) Cyberseguridad
        challenge:
          prompt: ¿Qué medida protege mejor una cuenta online frente a accesos no autorizados?
          multipleChoice:
            options:
              - Usar autenticación multifactor
              - Compartir la contraseña con familiares
              - Repetir la misma contraseña en todas partes
              - Escribir la contraseña en un papel visible
            answerIndex: 0
            explanation: La autenticación multifactor añade una capa extra de seguridad al iniciar sesión.
          rules:
            - Responde un unico representante.
          points: 100
          time: 60
  # La variante base solo se usa si se muestra el reto sin resolver la pregunta previa.
  # El MC normalmente elegira una de las opciones anteriores.
  rules:
    - Un representante responde por turno.
    - Si falla, rebote para el otro equipo.
  points: 100
  time: 60
- title: Recuerdo sorpresa
  prompt: Identifica el ano del recuerdo familiar que lee el MC.
  rules:
    - Se permiten 10 segundos de deliberacion.
  points: 150
  time: 45

## Retos:skill
- title: Torre relampago
  prompt: Construye la torre mas alta con objetos seguros en 45 segundos.
  rules:
    - Solo vale usar una mano por jugador.
  points: 120
  time: 45
- title: Mimo turbo
  prompt: Representa una pelicula sin hablar y consigue que tu equipo la adivine.
  rules:
    - Tienes un intento por pelicula.
  points: 100
  time: 60

## Retos:creative
- title: Himno del cumple
  prompt: Crea un mini himno para el cumpleanero con ritmo pegadizo.
  rules:
    - Debe incluir una anecdota real.
  points: 180
  time: 90
- title: Foto congelada
  prompt: Haz una pose dramatica que represente unas vacaciones familiares.
  rules:
    - El publico vota al instante.
  points: 120
  time: 60

## Retos:duel
- title: Duelo de chistes
  prompt: Un representante por equipo lanza un chiste rapido.
  rules:
    - El MC decide el mejor remate.
  points: 90
  time: 30
- title: Ingeniería Extrema
  prompt: Cada equipo deberá diseñar y construir una máquina utilizando únicamente las piezas que consiga durante las distintas fases del desafío.
  phases:
    - title: Reclutamiento de Recursos
      description: Los equipos seleccionan piezas de LEGO de un repositorio común sin conocer todavía el desafío final.
      rules:
        - Los equipos se turnan para escoger piezas.
        - Cada turno permite coger un número limitado de piezas.
        - Las piezas elegidas no pueden devolverse.
    - title: Revelación
      description: Se anuncia que la máquina que deberán construir es un coche capaz de recorrer la máxima distancia posible.
    - title: Última Oportunidad
      description: Último turno para conseguir piezas adicionales.
      rules:
        - Cada equipo dispone de un único turno extra de selección.
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
        - "Tiempo máximo de construcción: 5 minutos."
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
- title: Piedra papel fiesta
  prompt: Tres rondas de piedra, papel o tijera con narracion teatral.
  rules:
    - Deben exagerar cada gesto.
  points: 80
  time: 45

## Retos:chaos
- title: Cambio de voz
  prompt: Responde la siguiente pregunta imitando una voz famosa.
  rules:
    - Si todos se rien, suma extra de energia.
  points: 110
  time: 60
- title: Reto imposible
  prompt: Consigue que todo tu equipo mantenga una cara seria durante 20 segundos.
  rules:
    - Si alguien sonrie, gana el rival.
  points: 130
  time: 20

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
