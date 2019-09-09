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
export interface Dispatcher<A extends StandardAction> {
  (action?: A): void
}

export interface Reducer<
  S extends Readonly<S>,
  A extends StandardAction = StandardAction
> {
  (state: S, action: A): S
}

export interface EffectFactory<
  S extends Readonly<S>,
  I extends StandardAction = StandardAction,
  O extends StandardAction = I
> {
  (dispatch: AsapNonVoidDispatcher<O>): (state: S, action: I) => void
}

export interface Trigger<
  S extends Readonly<S>,
  I extends StandardAction = StandardAction,
  O extends StandardAction = I
> {
  (state: S, action: I): void | false | O | (void | false | O)[]
}

export interface AsapNonVoidDispatcher<A extends StandardAction> {
  (action?: void | false | A | PromiseLike<void | false | A>): void
}

export interface StandardAction<T extends string = string, P = any> {
  readonly type: T
  readonly payload?: P
}

export declare type ActionType<A> = A extends StandardAction<infer T, any>
  ? T
  : never

export declare type ActionPayload<
  A,
  T extends ActionType<A> = ActionType<A>
> = A extends StandardAction<T, infer P> ? P : never

const EMPTY_ARRAY = new Array()
const asArray = <V>(val: V | V[]): V[] => EMPTY_ARRAY.concat(val || EMPTY_ARRAY)

export default function createStore<
  S extends Readonly<S>,
  A extends StandardAction = StandardAction
> (
  reducer: Reducer<S, A>,
  effectFactory: EffectFactory<S, A>,
  trigger: Trigger<S, A>
): Dispatcher<A> {
  let state: S
  const nonvoidDispatch = (action?: false | A): void =>
    void (action && dispatch(action))
  const asapNonvoidDispatch: AsapNonVoidDispatcher<A> = action =>
    void Promise.resolve(action).then(nonvoidDispatch)
  const effect = effectFactory(asapNonvoidDispatch)

  return dispatch

  function dispatch (action?: A): void {
    state = reducer(state, action)
    effect(state, action)
    asArray(trigger(state, action)).forEach(nonvoidDispatch)
  }
}
