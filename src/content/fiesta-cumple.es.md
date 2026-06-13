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
- title: Cancion secreta
  prompt: Adivina la cancion familiar con solo tres palabras de pista.
  rules:
    - Un representante responde por turno.
    - Si falla, rebote para el otro equipo.
  points: 100
- title: Recuerdo sorpresa
  prompt: Identifica el ano del recuerdo familiar que lee el MC.
  rules:
    - Se permiten 10 segundos de deliberacion.
  points: 150

## Retos:skill
- title: Torre relampago
  prompt: Construye la torre mas alta con objetos seguros en 45 segundos.
  rules:
    - Solo vale usar una mano por jugador.
  points: 120
- title: Mimo turbo
  prompt: Representa una pelicula sin hablar y consigue que tu equipo la adivine.
  rules:
    - Tienes un intento por pelicula.
  points: 100

## Retos:creative
- title: Himno del cumple
  prompt: Crea un mini himno para el cumpleanero con ritmo pegadizo.
  rules:
    - Debe incluir una anecdota real.
  points: 180
- title: Foto congelada
  prompt: Haz una pose dramatica que represente unas vacaciones familiares.
  rules:
    - El publico vota al instante.
  points: 120

## Retos:duel
- title: Duelo de chistes
  prompt: Un representante por equipo lanza un chiste rapido.
  rules:
    - El MC decide el mejor remate.
  points: 90
- title: Piedra papel fiesta
  prompt: Tres rondas de piedra, papel o tijera con narracion teatral.
  rules:
    - Deben exagerar cada gesto.
  points: 80

## Retos:chaos
- title: Cambio de voz
  prompt: Responde la siguiente pregunta imitando una voz famosa.
  rules:
    - Si todos se rien, suma extra de energia.
  points: 110
- title: Reto imposible
  prompt: Consigue que todo tu equipo mantenga una cara seria durante 20 segundos.
  rules:
    - Si alguien sonrie, gana el rival.
  points: 130

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
