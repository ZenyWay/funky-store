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
export interface State extends InitialState {
  ball: Ball
  bricks: Brick[]
  lives: number
  message: string
  paddle: Paddle
  score: number
  /**
   * from requestAnimationFrame
   */
  time: number
}

export interface InitialState {
  canvas: HTMLCanvasElement
  context: CanvasRenderingContext2D
  controller: ControllerState
  game: GameState
}

export interface Ball {
  x: number
  y: number
  v: Velocity
}

/**
 * grid units / s
 */
export interface Velocity {
  x: number
  y: number
}

export interface Brick {
  x: number
  y: number
}

export interface Paddle {
  x: number
}

export enum ControllerState {
  Idle = 'IDLE',
  Right = 'RIGHT',
  Left = 'LEFT'
}

export enum GameState {
  Idle = 'IDLE',
  Paused = 'PAUSED',
  Ready = 'READY',
  Running = 'RUNNING',
  GameOver = 'GAME_OVER'
}

export const MAX_LIVES = 3
export const MESSAGE_ALL_CLEARED =
  'All bricks cleared ! Press any key to continue'
export const MESSAGE_GAME_OVER = 'Game Over !'
export const MESSAGE_GAME_PAUSED = 'Game paused: press any key to start'
export const CANVAS_HEIGHT = 480
export const CANVAS_WIDTH = 320
export const CONTROLLER_LEFT_KEYS = ['Left', 'ArrowLeft']
export const CONTROLLER_RIGHT_KEYS = ['Right', 'ArrowRight']
export const CONTROLLER_KEYS = CONTROLLER_LEFT_KEYS.concat(
  CONTROLLER_RIGHT_KEYS
)
export const GAME_STATUS_X = 8
export const GAME_STATUS_Y = 20
export const BALL_RADIUS = 4
export const INITIAL_BALL_VELOCITY_ANGLE = -Math.PI / 3
/**
 * pixels per seconds
 */
export const INITIAL_BALL_VELOCITY_MAGNITUDE = CANVAS_HEIGHT / 2
export const INITIAL_BALL_VELOCITY_X =
  INITIAL_BALL_VELOCITY_MAGNITUDE * Math.cos(INITIAL_BALL_VELOCITY_ANGLE)
export const INITIAL_BALL_VELOCITY_Y =
  INITIAL_BALL_VELOCITY_MAGNITUDE * Math.sin(INITIAL_BALL_VELOCITY_ANGLE)
export const BRICK_ROWS = 4
export const BRICK_COLUMNS = 5
export const BRICK_Y_OFFSET = 32
export const BRICK_PADDING = 8
export const HALF_BRICK_HEIGHT = 8
export const HALF_BRICK_WIDTH =
  ((CANVAS_WIDTH - BRICK_PADDING) / BRICK_COLUMNS - BRICK_PADDING) / 2
export const INITIAL_BRICKS = getInitialBricks()
export const HALF_PADDLE_HEIGHT = 4
export const HALF_PADDLE_WIDTH = 24
export const PADDLE_Y = CANVAS_HEIGHT - HALF_PADDLE_HEIGHT
/**
 * pixels per seconds
 */
export const PADDLE_VELOCITY = CANVAS_WIDTH << 1

function getInitialBricks () {
  const bricks = [] as Brick[]
  let row = BRICK_ROWS
  while (row--) {
    const y =
      BRICK_Y_OFFSET +
      HALF_BRICK_HEIGHT +
      row * (2 * HALF_BRICK_HEIGHT + BRICK_PADDING)
    let x = CANVAS_WIDTH - BRICK_PADDING - HALF_BRICK_WIDTH
    while (x > 0) {
      bricks.unshift({ x: Math.round(x), y: Math.round(y) })
      x -= 2 * HALF_BRICK_WIDTH + BRICK_PADDING
    }
  }
  return bricks
}
