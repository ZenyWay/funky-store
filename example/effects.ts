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
  GAME_STATUS_X,
  GAME_STATUS_Y,
  HALF_BRICK_HEIGHT,
  HALF_BRICK_WIDTH,
  HALF_PADDLE_HEIGHT,
  HALF_PADDLE_WIDTH,
  PADDLE_Y,
  Ball,
  Brick,
  Paddle,
  State,
  CANVAS_WIDTH,
  CANVAS_HEIGHT
} from './state'
import { EffectSpecs } from '../dist/utils'

const effects: Partial<EffectSpecs<State, Actions>> = {
  ANIMATION_FRAME_REQUEST: ({ time }) =>
    new Promise<ReturnType<typeof actions.ANIMATION_FRAME>>(resolve =>
      requestAnimationFrame(current =>
        resolve(actions.ANIMATION_FRAME(current - time))
      )
    ),
  UPDATE_REPAINT ({
    ball,
    bricks,
    canvas,
    context,
    lives,
    message,
    paddle,
    score
  }) {
    context.clearRect(0, 0, canvas.width, canvas.height)
    drawBall(context, ball)
    drawBricks(context, bricks)
    drawPaddle(context, paddle)
    drawScore(context, score)
    drawLives(context, lives)
    drawMessage(context, message)
  }
}

const TWO_PI = 2 * Math.PI
function drawBall (context: CanvasRenderingContext2D, { x, y }: Ball) {
  context.beginPath()
  context.arc(x, y, BALL_RADIUS, 0, TWO_PI)
  context.fillStyle = '#0095DD'
  context.fill()
  context.closePath()
}

const BRICK_WIDTH = 2 * HALF_BRICK_WIDTH
const BRICK_HEIGHT = 2 * HALF_BRICK_HEIGHT
function drawBricks (context: CanvasRenderingContext2D, bricks: Brick[]) {
  for (const { x, y } of bricks) {
    context.beginPath()
    context.rect(
      x - HALF_BRICK_WIDTH,
      y - HALF_BRICK_HEIGHT,
      BRICK_WIDTH,
      BRICK_HEIGHT
    )
    context.fillStyle = '#0095DD'
    context.fill()
    context.closePath()
  }
}

function drawLives (context: CanvasRenderingContext2D, lives: number) {
  context.font = '16px Arial'
  context.fillStyle = '#0095DD'
  context.textAlign = 'end'
  context.fillText(
    'Lives: ' + lives,
    CANVAS_WIDTH - GAME_STATUS_X,
    GAME_STATUS_Y
  )
}

const PADDLE_WIDTH = 2 * HALF_PADDLE_WIDTH
const PADDLE_HEIGHT = 2 * HALF_PADDLE_HEIGHT
function drawPaddle (context: CanvasRenderingContext2D, { x }: Paddle) {
  context.beginPath()
  context.rect(
    x - HALF_PADDLE_WIDTH,
    PADDLE_Y - HALF_PADDLE_HEIGHT,
    PADDLE_WIDTH,
    PADDLE_HEIGHT
  )
  context.fillStyle = '#0095DD'
  context.fill()
  context.closePath()
}

function drawScore (context: CanvasRenderingContext2D, score: number) {
  context.font = '16px Arial'
  context.fillStyle = '#0095DD'
  context.textAlign = 'start'
  context.fillText('Score: ' + score, GAME_STATUS_X, GAME_STATUS_Y)
}

const HALF_CANVAS_HEIGHT = CANVAS_HEIGHT / 2
const HALF_CANVAS_WIDTH = CANVAS_WIDTH / 2

function drawMessage (
  context: CanvasRenderingContext2D,
  message: string | false
) {
  if (!message) return
  context.font = '16px Arial'
  context.fillStyle = '#0095DD'
  context.textAlign = 'center'
  context.fillText(message, HALF_CANVAS_WIDTH, HALF_CANVAS_HEIGHT)
}

export default effects
