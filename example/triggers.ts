/**
 * @license MIT
 * @author Stephane M. Catala <stephane@zenyway.com>
 *
 * Copyright (C) 2019, Stephane M. Catala <stephane@zenyway.com>
 *
 * Permission is hereby granted, free of charge,
 * to any person obtaining a copy of this software
 * and associated documentation files (the "Software"),
 * to deal in the Software without restriction,
 * including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice
 * shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
 * THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE
 * OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
import actions, { Actions } from './actions'
import {
  BALL_RADIUS,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  HALF_BRICK_HEIGHT,
  HALF_BRICK_WIDTH,
  HALF_PADDLE_HEIGHT,
  HALF_PADDLE_WIDTH,
  PADDLE_VELOCITY,
  PADDLE_Y,
  Ball,
  Brick,
  ControllerState,
  GameState,
  Paddle,
  State
} from './state'
import { TriggerSpecs } from '../dist/utils'

const triggers: Partial<TriggerSpecs<State, Actions>> = {
  ANIMATION_FRAME: ({ game }, dt) =>
    game === GameState.Ready
      ? actions.GAME_RUN() // first call only sets time reference
      : game === GameState.Running
      ? [
          actions.UPDATE_BALL(dt),
          actions.UPDATE_PADDLE(dt),
          actions.UPDATE_REPAINT(),
          actions.ANIMATION_FRAME_REQUEST() // loop
        ]
      : actions.UPDATE_REPAINT(), // once
  BALL_HIT_BRICK: ({ bricks }) => !bricks.length && actions.GAME_OVER(),
  CLICK_CANVAS: ({ game, lives }) =>
    game === GameState.Idle || (game === GameState.GameOver && !lives)
      ? [actions.GAME_INIT_NEW(), actions.GAME_RUN()]
      : game === GameState.GameOver
      ? [actions.GAME_INIT_NEW_BRICKS(), actions.GAME_RUN()]
      : game === GameState.Paused
      ? actions.GAME_RUN()
      : actions.GAME_PAUSE(), // Ready or Running
  GAME_INIT_NEW: () => actions.GAME_INIT_NEW_BRICKS(),
  GAME_INIT_NEW_BRICKS: () => actions.GAME_INIT_START(),
  GAME_PLAYER_DOWN: ({ lives }) =>
    lives
      ? [actions.GAME_INIT_START(), actions.GAME_PAUSE()]
      : actions.GAME_OVER(),
  GAME_RUN: () => actions.ANIMATION_FRAME_REQUEST(),
  CONTROLLER_KEYDOWN: ({ game }) =>
    game !== GameState.Ready &&
    game !== GameState.Running &&
    actions.CLICK_CANVAS(),
  UPDATE_BALL ({ ball, bricks, paddle }, dt) {
    const { step, hit } = updateBall(ball, bricks, paddle, dt)
    return hit === false
      ? actions.BALL_STEP(step)
      : hit.bounce === false
      ? actions.GAME_PLAYER_DOWN()
      : [
          actions.BALL_STEP(step),
          'index' in hit && actions.BALL_HIT_BRICK(hit.index),
          actions.BALL_BOUNCE(hit.bounce),
          actions.UPDATE_BALL(dt - (1000 * step.dy) / ball.v.y)
        ]
  },
  UPDATE_PADDLE: ({ controller }, dt) =>
    controller !== ControllerState.Idle &&
    actions.PADDLE_STEP(
      ((controller === ControllerState.Left ? -dt : dt) * PADDLE_VELOCITY) /
        1000
    )
}

function updateBall (
  ball: Ball,
  bricks: Brick[],
  paddle: Paddle,
  dt: number
): BallUpdate {
  let update: BallUpdate = hitBricks(ball, bricks, {
    dx: (ball.v.x * dt) / 1000,
    dy: (ball.v.y * dt) / 1000
  })
  if (update.hit) return update
  update = hitPaddle(ball, paddle, update.step)
  if (update.hit) return update
  return hitPlayfield(ball, update.step)
}

interface BallUpdate {
  step: Step
  hit: false | Collision
}

interface Step {
  dx: number
  dy: number
}

interface Collision {
  /**
   * false => exit playfield
   */
  bounce: false | 'x' | 'y'
  /**
   * brick index
   */
  index?: number
}

const PLAYFIELD = [
  { bounce: false, x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT } as const,
  { bounce: 'y', x: CANVAS_WIDTH / 2, y: 0 } as const,
  { bounce: 'x', x: 0, y: CANVAS_HEIGHT / 2 } as const,
  { bounce: 'x', x: CANVAS_WIDTH, y: CANVAS_HEIGHT / 2 } as const
]

function hitPlayfield (ball: Ball, step: Step): BallUpdate {
  const update: BallUpdate = { step, hit: false }
  for (const limit of PLAYFIELD) {
    const { bounce } = limit
    const hit =
      bounce === 'x'
        ? hitVerticalSegment(ball, update.step, {
            x: limit.x,
            y: limit.y,
            dy: Infinity
          })
        : hitHorizontalSegment(ball, update.step, {
            x: limit.x,
            y: limit.y,
            dx: Infinity
          })
    if (hit !== false) {
      update.step = hit
      update.hit = { bounce }
    }
  }
  return update
}

function hitPaddle (ball: Ball, { x }: Paddle, step: Step): BallUpdate {
  const hit = hitHorizontalSegment(ball, step, {
    x,
    y: PADDLE_Y - HALF_PADDLE_HEIGHT,
    dx: HALF_PADDLE_WIDTH
  })
  return hit === false
    ? { step, hit: false }
    : { step: hit, hit: { bounce: 'y' } }
}

function hitBricks (ball: Ball, bricks: Brick[], step: Step): BallUpdate {
  // TODO only run collision checks when ball within or heading towards bricks
  const update: BallUpdate = { step, hit: false }

  let index = bricks.length
  while (index--) {
    const brick = bricks[index]
    const hitClosestHside = hitHorizontalSegment(ball, update.step, {
      x: brick.x,
      y: brick.y - (brick.y < ball.y ? -HALF_BRICK_HEIGHT : HALF_BRICK_HEIGHT),
      dx: HALF_BRICK_WIDTH
    })
    if (hitClosestHside !== false) {
      update.step = hitClosestHside
      update.hit = { index, bounce: 'y' }
    }
    const hitClosestVside = hitVerticalSegment(ball, update.step, {
      x: brick.x - (brick.x < ball.x ? -HALF_BRICK_WIDTH : HALF_BRICK_WIDTH),
      y: brick.y,
      dy: HALF_BRICK_HEIGHT
    })
    if (hitClosestVside !== false) {
      update.step = hitClosestVside
      update.hit = { index, bounce: 'x' }
    }
  }
  return update
}

function hitVerticalSegment (
  ball: { x: number; y: number },
  step: Step,
  segment: { x: number; y: number; dy: number }
): false | Step {
  // swap x/y
  const hit = hitHorizontalSegment(
    { x: ball.y, y: ball.x },
    { dx: step.dy, dy: step.dx },
    { x: segment.y, y: segment.x, dx: segment.dy }
  )
  return hit && { dx: hit.dy, dy: hit.dx }
}

function hitHorizontalSegment (
  ball: { x: number; y: number },
  step: Step,
  segment: { x: number; y: number; dx: number }
): false | Step {
  const d = segment.y - ball.y
  if (step.dy < 0 ? d < step.dy || d > 0 : d > step.dy || d < 0) {
    return false // ball is heading away from segment
  }
  const dy = d - (d < 0 ? -BALL_RADIUS : BALL_RADIUS)
  const dx = (dy * step.dx) / step.dy
  return Math.abs(segment.x + dx - ball.x) <= segment.dx && { dx, dy }
}

export default triggers
