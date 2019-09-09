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
  ActionPayload,
  ActionType,
  EffectFactory,
  Reducer,
  Trigger,
  StandardAction
} from './'

export type ReducerSpecs<
  S extends Readonly<S>,
  A extends StandardAction = StandardAction
> = {
  [type in ActionType<A>]:
    | ReducerSpec<S, ActionPayload<A, type>>[]
    | ReducerSpec<S, ActionPayload<A, type>>
}

export interface ReducerSpec<S extends Readonly<S>, P = any> {
  (state: S, payload?: P): S
}

export type EffectSpecs<
  S extends Readonly<S>,
  I extends StandardAction = StandardAction,
  O extends StandardAction = I
> = {
  [type in ActionType<I>]:
    | EffectSpec<S, ActionPayload<I, type>, O>
    | EffectSpec<S, ActionPayload<I, type>, O>[]
}

export interface EffectSpec<
  S extends Readonly<S>,
  P = any,
  O extends StandardAction = StandardAction<string, P>
> {
  (state: S, payload?: P): void | false | O | Promise<void | false | O>
}

export type TriggerSpecs<
  S extends Readonly<S>,
  I extends StandardAction = StandardAction,
  O extends StandardAction = I
> = { [type in ActionType<I>]: TriggerSpec<S, ActionPayload<I, type>, O> }

export interface TriggerSpec<
  S extends Readonly<S>,
  P = any,
  O extends StandardAction = StandardAction<string, P>
> {
  (state: S, payload?: P): void | false | O | (void | false | O)[]
}

const EMPTY_ARRAY = new Array()
const asArray = <V>(val: V | V[]): V[] => EMPTY_ARRAY.concat(val || EMPTY_ARRAY)

export function createReducer<
  S extends Readonly<S>,
  A extends StandardAction = StandardAction,
  I extends Partial<Readonly<S>> = Partial<Readonly<S>>
> (spec: Partial<ReducerSpecs<S, A>>, init: I): Reducer<S, A> {
  const reducers = arrayify(spec as KVMap<ActionType<A>, ReducerSpec<S, A>>)
  return function (state, action) {
    const { type, payload } = action
    let reduced = typeof state === 'undefined' ? (init as S) : state
    for (const reducer of reducers[type as ActionType<A>] || EMPTY_ARRAY) {
      reduced = reducer(reduced, payload)
    }
    return reduced
  }
}

export function createEffectFactory<
  S extends Readonly<S>,
  I extends StandardAction = StandardAction,
  O extends StandardAction = I
> (spec: Partial<EffectSpecs<S, I, O>>): EffectFactory<S, I, O> {
  const effects = arrayify(spec as KVMap<
    ActionType<I>,
    EffectSpec<S, ActionPayload<I, any>, O>[]
  >)
  return dispatch =>
    function (state, action) {
      const { type, payload } = action
      for (const effect of effects[type as ActionType<I>] || EMPTY_ARRAY) {
        dispatch(effect(state, payload))
      }
    }
}

export function concatEffectFactories<
  S extends Readonly<S>,
  I extends StandardAction = StandardAction,
  O extends StandardAction = I
> (...factories: (EffectFactory<S, I, O> | false)[]): EffectFactory<S, I, O> {
  return function (dispatch) {
    const effects = new Array()
    for (const factory of factories) {
      if (factory) effects.push(factory(dispatch))
    }
    return function (state, action) {
      for (const effect of effects) {
        effect(state, action)
      }
    }
  }
}

export function createTrigger<
  S extends Readonly<S>,
  I extends StandardAction = StandardAction,
  O extends StandardAction = I
> (triggers: Partial<TriggerSpecs<S, I, O>>): Trigger<S, I, O> {
  return function (state, action) {
    const { type, payload } = action
    const trigger = triggers[type as ActionType<I>]
    return trigger && trigger(state, payload)
  }
}

function arrayify<K extends string, V> (entries: KVMap<K, V[] | V>) {
  const dict = Object.create(null) as KVMap<K, V[]>
  for (const key of Object.keys(entries) as K[]) {
    dict[key] = asArray<V>(entries[key])
  }
  return dict
}

type KVMap<K extends string, V> = { [key in K]: V }
