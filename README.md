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

## React Example

The following is a common use case in [React](https://reactjs.org/). Fetching data from an API, showing it on screen and handling initial, loading, and error states.

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

## Documentation

`SRD` comes with many of the Static Land functions that all know and love. Here is a breakdown of all the supported algebras:

### Setoid

For comparing 2 SRD's to see if they are the same type.

> *Note: This only compares the data types and not the inner value. So `Success(5) != Failure(5)` but `Success(5) == Success(80)`.

#### Signature

```ts
Setoid<T> {
  equals: (T, T) => boolean
}
```

#### Example

```ts
import { SRD, success, notAsked } from 'SRD'

SRD.equals(success(5), notAsked()) // false
```

### Functor

Allowing the type to be `mapped` over by the function provided.

#### Signature

```ts
Functor<T> {
  map: <a, b>(a => b, T<a>) => T<b>
}
```

#### Example

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

#### Signature

```ts
Bifunctor<T> {
  bimap: <a, b, c, d>(a => b, c => d, T<a, c>) => T<b, d>
}
```

#### Example

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

#### Signature

```ts
Apply<T> {
  ap: <a, b>(T<a => b>, T<a>) => T<b>
}
```

#### Example

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

#### Signature

```ts
Applicative<T> {
  of: <a>(a) => T<a>
}
```

#### Example

```ts
import { SRD } from 'SRD'

SRD.of(4) // success(4)
```

### Alt

Provide a default value to be returned when an `SRD` is not a `success` type.

#### Signature

```ts
Alt<T> {
  alt: <a>(T<a>, T<a>) => T<a>
}
```

#### Example

```ts
import { SRD, success, loading, notAsked } from 'SRD'

SRD.alt(success(4), notAsked()) // success(4)
SRD.alt(success(50), success(4)) // success(4)
SRD.alt(loading(), notAsked()) // loading()
SRD.alt(loading(), success(4)) // success(4)
```

### Chain

Similar to `map` but the callback must return another `SRD`.

#### Signature

```ts
Chain<T> {
  chain: <a, b>(a => T<b>, T<a>) => T<b>
}
```

#### Example

```ts
import { SRD, success, failure, notAsked } from 'SRD'

SRD.chain(x => success(x * 2), success(4)) // success(8)
SRD.chain(x => success(x * 2), notAsked()) // notAsked()
SRD.chain(x => failure('failed'), success(4)) // failure('failed')
```

### Match

Provide a mapper object for each SRD type and whichever type the SRD is - that function will run.

#### Signature

```ts
Matcher<E, A, G, H, I, J> {
  notAsked: () => G
  loading: () => H
  failure: (e: E) => I
  success: (a: A) => J
}

Match<T> {
  match: <E, A, G, H, I, J>(mapper: Matcher<E, A, G, H, I, J>, fa: T<E, A>) => G | H | I | J
}
```

#### Example

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

#### Signature

```ts
MapFailure<T> {
  mapFailure: <E, A, B>(f: (e: E) => B, fa: T<E, A>) => T<B, A>
}
```

#### Example

```ts
import { SRD, success, failure } from 'SRD'

SRD.mapFailure(x => `hello ${x}`, success(4)) // success(4)
SRD.mapFailure(x => `hello ${x}`, failure('bob')) // failure('hello bob')
```

### Map2

Similar to `map` but takes 2 `SRD's` instead of one, and if both are a success, the provided callback will be called.

#### Signature

```ts
Map2<T> {
  map2: <E, A, B, C>(f: (a: A, b: B) => C, fa: T<E, A>, fb: T<E, B>) => T<E, C>
}
```

#### Example

```ts
import { SRD, success, failure } from 'SRD'

SRD.map2((x, y) => x + y, success(4), success(8)) // success(12)
SRD.map2((x, y) => x + y, failure('bob'), success(8)) // failure('bob')
SRD.map2((x, y) => x + y, success(8), failure('bob')) // failure('bob')
```

### Map3

Similar to `map2` but takes 3 `SRD's` instead of two, and if all three are a success, the provided callback will be called.

#### Signature

```ts
Map3<T> {
  map3: <E, A, B, C, D>(f: (a: A, b: B, c: C) => D, fa: T<E, A>, fb: T<E, B>, fc: T<E, C>) => T<E, D>
}
```

#### Example

```ts
import { SRD, success, failure, notAsked, loading } from 'SRD'

const add3 = (x, y, z) = x + y + z

SRD.map3(add3, success(4), success(8), success(10)) // success(22)
SRD.map3(add3, failure('bob'), success(8), notAsked()) // failure('bob')
SRD.map3(add3, success(8), loading(), failure('bob')) // loading()
```

### Unwrap

Similar to `alt`, but unwraps the SRD from it's type and runs the callback on it. If the SRD is a success the inner value is passed to the callback and returned, any other value the default is returned.

#### Signature

```ts
Unwrap<T> {
  unwrap: <E, A, B>(def: B, f: (a: A) => B, fa: T<E, A>) => B
}
```

#### Example

```ts
import { SRD, success, notAsked, loading } from 'SRD'

const double = x => x * 2

SRD.unwrap(6, double, success(8)) // 16
SRD.unwrap(6, double, notAsked()) // 6
SRD.unwrap(6, double, loading()) // 6
```