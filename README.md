# funky-store

[![NPM](https://nodei.co/npm/funky-store.png?compact=true)](https://nodei.co/npm/funky-store/)

extremely lightweight [FSA](https://www.npmjs.com/package/flux-standard-action)-based functional store,
for managing application or module state with:

- an action-triggered reducer for updating local state with pure functions:<br/>
  `(state, action) => State`
- an action-triggered async effect for side-effects _external_ to local state:<br/>
  `asapDispatch => (state, action) => void`,<br/>
  where actions from the effects are asynchronously dispatched with `asapDispatch`
  on the [microtask queue](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises#Timing)
  at the end of the current run of the JavaScript event loop
- an action-triggered _side-effect-free_ trigger for dispatching actions synchronously:<br/>
  `(state, action) => void | false | Action | (void | false | Action)[]`

when an action is dispatched to the store,
it first hits the reducer, then the effect, and finally the trigger.
when first called, the reducer receives an `undefined` state:
it should fallback to a predefined initial state.
finally, although the effect runs before the trigger,
the actions it triggers are always dispatched after those from the trigger.
effect and trigger hence both operate from the same reduced state.

# Example

run the [example 2D-Breakout Game](./example) in a browser:

```bash
npm install
npm run example
```

# API

run the tests with `npm test` in node, or `npm test:web` in the browser.

## core API (231 bytes gzip)

the core API exposes the store factory, which returns a dispatch function
for synchronously dispatching actions into the store:

```ts
export default function createStore<
  S extends Readonly<S>,
  A extends StandardAction = StandardAction
> (
  reducer: Reducer<S, A>,
  effectFactory: EffectFactory<S, A>,
  trigger: Trigger<S, A>
): Dispatcher<A>

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

export interface Dispatcher<A extends StandardAction> {
  (action?: A): void
}

export declare type ActionType<A> = A extends StandardAction<infer T, any>
  ? T
  : never

export declare type ActionPayload<
  A,
  T extends ActionType<A> = ActionType<A>
> = A extends StandardAction<T, infer P> ? P : never
```

## utils (396 bytes gzip)

beyond the core store factory, this module also exposes a few helper functions,
e.g. for specifying reducers, effects or triggers by action-type.

the [example 2D-Breakout Game](./example) demonstrates usage of these utilities.

```ts
export declare function createReducer<
  S extends Readonly<S>,
  A extends StandardAction = StandardAction,
  I extends Partial<Readonly<S>> = Partial<Readonly<S>>
> (spec: Partial<ReducerSpecs<S, A>>, init: I): Reducer<S, A>

export declare function createEffectFactory<
  S extends Readonly<S>,
  I extends StandardAction = StandardAction,
  O extends StandardAction = I
> (spec: Partial<EffectSpecs<S, I, O>>): EffectFactory<S, I, O>

export declare function concatEffectFactories<
  S extends Readonly<S>,
  I extends StandardAction = StandardAction,
  O extends StandardAction = I
> (...factories: (EffectFactory<S, I, O> | false)[]): EffectFactory<S, I, O>

export declare function createTrigger<
  S extends Readonly<S>,
  I extends StandardAction = StandardAction,
  O extends StandardAction = I
> (triggers: Partial<TriggerSpecs<S, I, O>>): Trigger<S, I, O>

export declare type ReducerSpecs<
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

export declare type EffectSpecs<
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

export declare type TriggerSpecs<
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
```

# TypeScript

although this library is written in [TypeScript](https://www.typescriptlang.org),
it may also be imported into plain JavaScript code:
modern code editors will still benefit from the available type definition,
e.g. for helpful code completion.

# License: MIT

Copyright 2019 Stéphane M. Catala

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
