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
import {
  FactoryAction,
  createActionFactories,
  payload as _
} from 'basic-fsa-factories'

const actions = createActionFactories({
  ANIMATION_FRAME: _<number>(),
  ANIMATION_FRAME_REQUEST: _<void>(),
  BALL_BOUNCE: _<'x' | 'y'>(),
  BALL_HIT_BRICK: _<number>(),
  BALL_STEP: _<{ dx: number; dy: number }>(),
  CLICK_CANVAS: _<void>(),
  CONTROLLER_KEYDOWN: _<string>(),
  CONTROLLER_KEYUP: _<string>(),
  GAME_INIT_NEW: _<void>(),
  GAME_INIT_NEW_BRICKS: _<void>(),
  GAME_INIT_START: _<void>(),
  GAME_OVER: _<void>(),
  GAME_PAUSE: _<void>(),
  GAME_PLAYER_DOWN: _<void>(),
  GAME_RUN: _<void>(),
  PADDLE_STEP: _<number>(),
  UPDATE_BALL: _<number>(),
  UPDATE_PADDLE: _<number>(),
  UPDATE_REPAINT: _<void>()
})

export type Actions = FactoryAction<typeof actions>

export default actions
