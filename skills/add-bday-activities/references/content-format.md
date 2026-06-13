# Bday Games Content Format

Current packs live in `src/content/` and are parsed by `src/lib/content.ts`.

## Frontmatter

Required:

```yaml
---
id: my-pack-id
title: Mi Pack de Juego
locale: es
summary: Breve descripcion del pack.
---
```

## Rules section

```md
## Reglas
- Regla 1
- Regla 2
```

## Challenge sections

Each category uses YAML list items under an exact heading.

```md
## Retos:trivia
- title: Nombre del reto
  prompt: Frase breve que el MC puede leer en voz alta.
  rules:
    - Regla breve 1
    - Regla breve 2
  points: 100
```

Valid category headings:

- `## Retos:trivia`
- `## Retos:skill`
- `## Retos:creative`
- `## Retos:duel`
- `## Retos:chaos`

Challenge fields:

- `title`: required
- `prompt`: required
- `rules`: optional list
- `points`: optional, defaults to `100`

## Twist section

```md
## Sorpresas
- title: Nombre de la sorpresa
  description: Lo que sucede cuando el MC la activa.
  effectType: bonus_points
  value: 100
```

Twist fields:

- `title`: required
- `description`: required
- `effectType`: required
- `value`: optional numeric value, only when the effect uses one

Valid `effectType` values:

- `steal_member`
- `bonus_points`
- `swap_scores`
- `double_round`
- `skip_turn`

## Authoring template

```md
---
id: nuevo-pack
title: Nuevo Pack
locale: es
summary: Pack inicial para una fiesta familiar.
---

## Reglas
- Regla 1
- Regla 2
- Regla 3

## Retos:trivia
- title: Reto de ejemplo
  prompt: Pregunta o dinamica breve.
  rules:
    - Regla breve.
  points: 100

## Retos:skill

## Retos:creative

## Retos:duel

## Retos:chaos

## Sorpresas
- title: Giro de ejemplo
  description: Sucede algo divertido.
  effectType: double_round
```
