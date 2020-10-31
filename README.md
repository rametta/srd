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

## Documentation

View the [full docs here](docs.md), with in-depth explanations and examples of all `SRD` features.

Below is the most common use case for any Remote Data type.

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

  return SRD.match(
    {
      notAsked: () => <div>Empty</div>,
      loading: () => <div>Loading...</div>,
      failure: (err) => <div>{err}</div>,
      success: (data) => <div>{data}</div>,
    },
    rd
  )
}
```

That's it! Very easy to use, and 90% of the time that's everything you will need.

But `SRD` also provides a lot of extra functionality for data manipulation, React is not necessary to use `SRD`. [Check out our docs](docs.md) for full examples of every feature!
