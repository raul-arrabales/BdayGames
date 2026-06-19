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

## Retos:trivia
- title: Pon a prueba el conocimiento de tu equipo
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
