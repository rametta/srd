[![npm](https://img.shields.io/npm/v/srd.svg)](http://npm.im/srd)
[![SRD](https://badgen.net/bundlephobia/minzip/srd)](https://bundlephobia.com/result?p=srd)
[![License](https://img.shields.io/badge/license-BSD--3--Clause-blue)](https://opensource.org/licenses/BSD-3-Clause)
![License](https://img.shields.io/badge/output-esm%20%7C%20cjs%20%7C%20umd-blue)

# 🚀 Simple Remote Data

Simple Remote Data (SRD) is a fully [static land](https://github.com/fantasyland/static-land/blob/master/docs/spec.md) compliant implementation of the Remote Data type in TypeScript - built with [Higer Kinded Types](<https://en.wikipedia.org/wiki/Kind_(type_theory)>) (HKT's) inspired by [fp-ts](https://github.com/gcanti/fp-ts) and [Elm Remote Data](https://package.elm-lang.org/packages/krisajenkins/remotedata/6.0.1/RemoteData).

The idea for using HKT's in TypeScript is based on [Lightweight higher-kinded polymorphism](https://www.cl.cam.ac.uk/~jdy22/papers/lightweight-higher-kinded-polymorphism.pdf).

## <img width="80" height="50" src="https://raw.githubusercontent.com/fantasyland/static-land/master/logo/logo.png" /> Static Land Compliant

## Install

With yarn

```sh
yarn add srd
```

or if you prefer npm

```sh
npm i srd
```

SRD supports [CJS](https://requirejs.org/docs/commonjs.html), [UMD](https://github.com/umdjs/umd) and [ESM](https://webpack.js.org/guides/ecma-script-modules/) bundle outputs.

## Examples

### React Example

The following is a common use case in [React](https://reactjs.org/). Fetching data async, showing it on screen and handling initial, loading, and error states.

Without `SRD`, we would need something like this:

```tsx
import React, { useState, useEffect } from 'react'

const App = () => {
  const [asked, setAsked] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  useEffect(() => {
    setAsked(true)
    setLoading(true)
    fetch('...')
      .then((data) => {
        setData(data)
        setError(false)
        setLoading(false)
      })
      .catch((err) => {
        setData(null)
        setError(err)
        setLoading(false)
      })
  }, [])

  if (!asked) {
    return <div>Empty</div>
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>{error}</div>
  }

  if (data) {
    return <div>{data}</div>
  }

  return <div>Something went wrong...</div>
}
```

That's a lot of code for something we do very often, and highly error prone if we forget to unset/set some state values.

Here's the SRD way - using only 1 state variable instead of 4, preventing any impossible states:

```tsx
import React, { useState, useEffect } from 'react'
import { SRD, notAsked, loading, failure, success } from 'srd'

const App = () => {
  const [rd, setRd] = useState(notAsked())

  useEffect(() => {
    setRd(loading())
    fetch('...')
      .then((data) => setRd(success(data)))
      .catch((err) => setRd(failure(err)))
  }, [])

  return SRD.match({
    notAsked: () => <div>Empty</div>,
    loading: () => <div>Loading...</div>,
    failure: (err) => <div>{err}</div>,
    success: (data) => <div>{data}</div>,
  }, rd)
}
```

That's it! Very easy to use, and 90% of the time that's everything you will need.

### Typescript React Example

SRD works even better with Typescript! Declare your RD type once and have typescript powerfully infer it everywhere! Like magic!

```tsx
import React, { useState, useEffect } from 'react'
import { SRD, RD, notAsked, loading, failure, success } from 'srd'
import { Person, getPerson } from './people'

const App = () => {
  const [rd, setRd] = useState<RD<string, Person>>(notAsked())

  useEffect(() => {
    setRd(loading())
    getPerson(123)
      .then((person) => setRd(success(person)))
      .catch((err) => setRd(failure(err)))
  }, [])

  return SRD.match({
    notAsked: () => <div>Empty</div>,
    loading: () => <div>Loading...</div>,
    failure: (msg) => <div>{msg}</div>,
    success: (person) => <div>{person}</div>,
  }, rd)
}
```

## Documentation

`SRD` comes with many of the Static Land functions that we all know and love. Here is a breakdown of all the supported algebras and utilities:

### Setoid

For comparing 2 SRD's to see if they are the same type.

> *Note: This only compares the data types and not the inner value. So `Success(5) != Failure(5)` but `Success(5) == Success(80)`.

```hs
equals :: (RD e a, RD e b) -> boolean
```

```ts
import { SRD, success, notAsked } from 'SRD'

SRD.equals(success(5), notAsked()) // false
```

### Functor

Allowing the type to be `mapped` over by the function provided.

```hs
map :: (a -> b, RD e a) -> RD e b
```

```ts
import { SRD, success, loading } from 'SRD'

const double = x => x * 2
const rd1 = success(4)
const rd2 = loading()

SRD.map(double, rd1) // success(8)
SRD.map(double, rd2) // loading()
```

### Bifunctor

Allowing the type to be `bimapped` over by the functions provided. Common usecase is for when you need to `map` and `mapFailure` in one shot.

```hs
bimap :: (e -> b, a -> c, RD e a) -> RD b c
```

```ts
import { SRD, success, failure } from 'SRD'

const double = x => x * 2
const formatErr = err => `Something went wrong: ${err}`
const rd1 = success(4)
const rd2 = failure('404 not found')

SRD.bimap(formatErr, double, rd1) // success(8)
SRD.bimap(formatErr, double, rd2) // failure('Something went wrong: 404 not found')
```

### Apply

Apply a function wrapped in a SRD to a value wrapped in a SRD.

```hs
ap :: (RD e (a -> b), RD e a) -> RD e b
```

```ts
import { SRD, success, failure } from 'SRD'

const double = x => x * 2
const formatErr = err => `Something went wrong: ${err}`
const rd1 = success(4)
const rd2 = failure('404 not found')

SRD.ap(success(double), rd1)) // success(8)
SRD.ap(success(double), rd2)) // failure('404 not found')
```

### Applicative

Always returns a `success` with whatever value is passed within.

```hs
of :: a -> RD e a
```

```ts
import { SRD } from 'SRD'

SRD.of(4) // success(4)
```

### Alt

Provide a default value to be returned when an `SRD` is not a `success` type.

```hs
alt :: (RD e a, RD e a) -> RD e a
```

```ts
import { SRD, success, loading, notAsked } from 'SRD'

SRD.alt(success(4), notAsked())  // success(4)
SRD.alt(success(50), success(4)) // success(4)
SRD.alt(loading(), notAsked())   // loading()
SRD.alt(loading(), success(4))   // success(4)
```

### Chain

Similar to `map` but the callback must return another `SRD`.

```hs
chain :: (a -> RD e b, RD e a) -> RD e b
```

```ts
import { SRD, success, failure, notAsked } from 'SRD'

SRD.chain(x => success(x * 2), success(4))    // success(8)
SRD.chain(x => success(x * 2), notAsked())    // notAsked()
SRD.chain(x => failure('failed'), success(4)) // failure('failed')
```

### Match

Provide a mapper object for each SRD type and whichever type the SRD is - that function will run.

```hs
data Matcher e a ::
  { notAsked :: () -> c
  , loading :: () -> c
  , failure :: e -> c
  , success :: a -> c
  }

match :: (Matcher e a -> c, RD e a) -> c
```

```ts
import { SRD, success } from 'SRD'

SRD.match({
  notAsked: () => 'Empty',
  loading: () => 'Loading...',
  failure: e => `Err: ${e}`,
  success: data => `My data is ${data}`
}, success(4)) // My data is 4
```

### Map Failure

Similar to `map` but instead of running the callback on a `success`, it calls it on a `failure`.

```hs
mapFailure :: (e -> b, RD e a) -> RD b a
```

```ts
import { SRD, success, failure } from 'SRD'

SRD.mapFailure(x => `hello ${x}`, success(4))     // success(4)
SRD.mapFailure(x => `hello ${x}`, failure('bob')) // failure('hello bob')
```

### Map2

Similar to `map` but takes 2 `SRD's` instead of one, and if both are a success, the provided callback will be called.

```hs
map2 :: (a b -> c, RD e a, RD e b) -> RD e c
```

```ts
import { SRD, success, failure } from 'SRD'

SRD.map2((x, y) => x + y, success(4), success(8))     // success(12)
SRD.map2((x, y) => x + y, failure('bob'), success(8)) // failure('bob')
SRD.map2((x, y) => x + y, success(8), failure('bob')) // failure('bob')
```

### Map3

Similar to `map2` but takes 3 `SRD's` instead of two, and if all three are a success, the provided callback will be called.

```hs
map3 :: (a b c -> d, RD e a, RD e b, RD e c) -> RD e d
```

```ts
import { SRD, success, failure, notAsked, loading } from 'SRD'

const add3 = (x, y, z) = x + y + z

SRD.map3(add3, success(4), success(8), success(10))    // success(22)
SRD.map3(add3, failure('bob'), success(8), notAsked()) // failure('bob')
SRD.map3(add3, success(8), loading(), failure('bob'))  // loading()
```

### Unwrap

Similar to `alt`, but unwraps the SRD from it's type and runs the callback on it. If the SRD is a success the inner value is passed to the callback and returned, any other value the default is returned.

```hs
unwrap :: (b, a -> b, RD e a) -> b
```

```ts
import { SRD, success, notAsked, loading } from 'SRD'

const double = x => x * 2

SRD.unwrap(6, double, success(8)) // 16
SRD.unwrap(6, double, notAsked()) // 6
SRD.unwrap(6, double, loading())  // 6
```

### Unpack

Similar to `unwrap`, but takes a default thunk instead of a default value.

```hs
unpack :: (() -> b, a -> b, RD e a) -> b
```

```ts
import { SRD, success, notAsked, loading } from 'SRD'

const double = x => x * 2

SRD.unpack(() => 6, double, success(8)) // 16
SRD.unpack(() => 6, double, notAsked()) // 6
SRD.unpack(() => 6, double, loading())  // 6
```

### WithDefault

Takes a default value and an SRD. If the SRD is a success then the inner value is returned, otherwise the default value is returned.

```hs
withDefault :: (a, RD e a) -> a
```

```ts
import { SRD, success, notAsked, loading } from 'SRD'

SRD.withDefault(4, success(8)) // 8
SRD.withDefault(4, notAsked()) // 4
SRD.withDefault(4, loading())  // 4
```