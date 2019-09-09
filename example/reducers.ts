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
import { Actions } from './actions'
import {
  BALL_RADIUS,
  CANVAS_WIDTH,
  CONTROLLER_KEYS,
  CONTROLLER_LEFT_KEYS,
  CONTROLLER_RIGHT_KEYS,
  HALF_PADDLE_HEIGHT,
  INITIAL_BALL_VELOCITY_X,
  INITIAL_BALL_VELOCITY_Y,
  INITIAL_BRICKS,
  MAX_LIVES,
  MESSAGE_GAME_OVER,
  MESSAGE_GAME_PAUSED,
  MESSAGE_ALL_CLEARED,
  PADDLE_Y,
  ControllerState,
  GameState,
  State
} from './state'
import { into, propCursor as within } from 'basic-cursors'
import { ReducerSpecs } from '../dist/utils'

const reducers: Partial<ReducerSpecs<State, Actions>> = {
  ANIMATION_FRAME: within('time')((time, dt) => time + dt),
  BALL_BOUNCE: within('ball')(
    within('v')(({ x, y }, direction) =>
      direction === 'x' ? { x: -x, y } : { x, y: -y }
    )
  ),
  BALL_HIT_BRICK: [
    within('bricks')((bricks, index) =>
      bricks.slice(0, index).concat(bricks.slice(index + 1))
    ),
    within('score')(score => score + 1)
  ],
  BALL_STEP: within('ball')(({ x, y, v }, { dx, dy }) => ({
    x: x + dx,
    y: y + dy,
    v
  })),
  CONTROLLER_KEYDOWN: within('controller')((state, key) =>
    CONTROLLER_LEFT_KEYS.indexOf(key) >= 0
      ? ControllerState.Left
      : CONTROLLER_RIGHT_KEYS.indexOf(key) >= 0
      ? ControllerState.Right
      : state
  ),
  CONTROLLER_KEYUP: within('controller')((state, key) =>
    CONTROLLER_KEYS.indexOf(key) >= 0 ? ControllerState.Idle : state
  ),
  GAME_INIT_NEW: [
    into('lives')(() => MAX_LIVES),
    into('score')(() => 0),
    into('time')(() => 0)
  ],
  GAME_INIT_NEW_BRICKS: into('bricks')(() => INITIAL_BRICKS),
  GAME_INIT_START: [
    into('paddle')(() => ({ x: CANVAS_WIDTH / 2 })),
    into('ball')(() => ({
      x: CANVAS_WIDTH / 2,
      y: PADDLE_Y - HALF_PADDLE_HEIGHT - BALL_RADIUS,
      v: { x: INITIAL_BALL_VELOCITY_X, y: INITIAL_BALL_VELOCITY_Y }
    }))
  ],
  GAME_OVER: [
    into('message')(({ lives }) =>
      !lives ? MESSAGE_GAME_OVER : MESSAGE_ALL_CLEARED
    ),
    into('game')(() => GameState.GameOver)
  ],
  GAME_PAUSE: [
    into('message')(() => MESSAGE_GAME_PAUSED),
    into('game')(() => GameState.Paused)
  ],
  GAME_PLAYER_DOWN: within('lives')(lives => lives - 1),
  GAME_RUN: [
    into('message')(() => ''),
    within('game')(game =>
      game !== GameState.Ready ? GameState.Ready : GameState.Running
    )
  ],
  PADDLE_STEP: within('paddle')(
    within('x')((x, dx) => Math.max(0, Math.min(CANVAS_WIDTH, x + dx)))
  )
}

export default reducers
