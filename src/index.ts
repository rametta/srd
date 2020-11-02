import { URIS2 } from "./HKT"

const URI = 'RemoteData'

type URI = typeof URI

declare module './HKT' {
  interface URItoKind2<E, A> {
    readonly RemoteData: RD<E, A>
  }
}

type NotAsked = { readonly tag: 'NotAsked' }
type Loading = { readonly tag: 'Loading' }
type Failure<E> = { readonly tag: 'Failure'; error: E }
type Success<A> = { readonly tag: 'Success'; data: A }

export type RD<E, A>
  = NotAsked
  | Loading
  | Failure<E>
  | Success<A>

/**
 * We have not asked for the data yet.
 */
export const notAsked = <E = never, A = never>(): RD<E, A> => ({ tag: 'NotAsked' })

/**
 * We asked for the data but have not received an answer yet.
 */
export const loading = <E = never, A = never>(): RD<E, A> => ({ tag: 'Loading' })

/**
 * We recieved a failure response.
 * @param error Anything that represents the failure.
 */
export const failure = <E = never, A = never>(error: E): RD<E, A> => ({ tag: 'Failure', error })

/**
 * We recieved the data successfully.
 * @param data The successful payload from the response.
 */
export const success = <E = never, A = never>(data: A): RD<E, A> => ({ tag: 'Success', data })

const isNotAsked = <E, A>(rd: RD<E, A>): rd is NotAsked => rd.tag === 'NotAsked'
const isLoading = <E, A>(rd: RD<E, A>): rd is Loading => rd.tag === 'Loading'
const isFailure = <E, A>(rd: RD<E, A>): rd is Failure<E> => rd.tag === 'Failure'
const isSuccess = <E, A>(rd: RD<E, A>): rd is Success<A> => rd.tag === 'Success'

type Matcher<E, A, G, H, I, J> = {
  notAsked: () => G
  loading: () => H
  failure: (e: E) => I
  success: (a: A) => J
}

interface RemoteData<F extends URIS2> {
  readonly URI: F

  /**
   * Apply a function to a Success type. Any other type will just return the RemoteData unchanged.
   * @param f Function to call with the data inside the Success.
   * @param fa The RemoteData that can be any variant.
   */
  readonly map: <E, A, B>(f: (a: A) => B, fa: RD<E, A>) => RD<E, B>

  /**
   * Provide 2 Remote Data types and if they are both successes, then `f` will be called with
   * both of their data.
   * @param f Function to call with the data inside the both Successes.
   * @param fa RemoteData that can be any variant.
   * @param fb RemoteData that can be any variant.
   */
  readonly map2: <E, A, B, C>(f: (a: A, b: B) => C, fa: RD<E, A>, fb: RD<E, B>) => RD<E, C>

  /**
   * Provide 3 Remote Data types and if they are all successes, then `f` will be called with
   * all of their data.
   * @param f Function to call with the data inside all 3 Successes.
   * @param fa RemoteData that can be any variant.
   * @param fb RemoteData that can be any variant.
   * @param fc RemoteData that can be any variant.
   */
  readonly map3: <E, A, B, C, D>(f: (a: A, b: B, c: C) => D, fa: RD<E, A>, fb: RD<E, B>, fc: RD<E, C>) => RD<E, D>

  /**
   * Apply a function to a Failure type. Any other type will just return the RemoteData unchanged.
   * @param f Function to call with the data inside the Failure.
   * @param fa The RemoteData that can be any variant.
   */
  readonly mapFailure: <E, A, B>(f: (e: E) => B, fa: RD<E, A>) => RD<B, A>

  /**
   * Apply a function to a Success type. Any other type will just return the RemoteData unchanged.
   * @param f Function to call with the data inside the Success. Must return a Remote Data type.
   * @param fa The RemoteData that can be any variant.
   */
  readonly chain: <E, A, B>(f: (a: A) => RD<E, B>, fa: RD<E, A>) => RD<E, B>

  /**
   * Run a success function if `rd` is a Success, or a failure function if `rd` is a Failure.
   * If `rd` is neither a Success or Failure, then it will just be returned unchanged.
   * @param failureFn Will run if `rd` is a Failure.
   * @param successFn Will run if `rd` is a Success.
   * @param rd The Remote Data to check against.
   */
  readonly bimap: <A, B, C, D>(failureFn: (a: A) => B, successFn: (c: C) => D, rd: RD<A, C>) => RD<B, D>

  /**
   * Apply a function wrapped in a Success with a value wrapped in a Success.
   * If either are not a Success then that type is returned unchanged.
   * @param rdFn The function that is wrapped in the Remote Data.
   * @param rd The Remote Data with a value that will be applied to the `rdFn`.
   */
  readonly ap: <E, A, B>(rdFn: RD<E, (a: A) => B>, rd: RD<E, A>) => RD<E, B> 

  /**
   * Checks if the supplied rd is of type Success, if it is, it returns rd, else it returns def
   * @param def Default Remote Data to return
   * @param rd Remote Data to check
   */
  readonly alt: <E, A>(def: RD<E, A>, rd: RD<E, A>) => RD<E, A>

  /**
   * Always returns a Success with `a` inside.
   * @param a Any value
   */
  readonly of: <E = never, A = never>(a: A) => RD<E, A>

  /**
   * Check if two Remote Data's are of the same type.
   * This will only check if the type's are equivalent, not the values inside.
   * @param a Remote Data 1
   * @param b Remote Data 2
   */
  readonly equals: <A extends RD<unknown, unknown>, B extends RD<unknown, unknown>>(a: A, b: B) => boolean

  /**
   * Take a default value, a function and a `RemoteData`.
   * Returns the default value if the `RemoteData` is something other than a `Success a`. 
   * If the `RemoteData` is `Success a`, apply the function on `a` and return the `b`.
   * @param def Default value that will be returned is fa is not a `Success`.
   * @param f Function to call if fa is a `Success`.
   * @param fa Remote Data of any variant.
   */
  readonly unwrap: <E, A, B>(def: B, f: (a: A) => B, fa: RD<E, A>) => B

  /**
   * Similar to `unwrap` but instead of taking a default value, it takes a thunk.
   * Returns the default thunk called if the `RemoteData` is something other than a `Success a`. 
   * If the `RemoteData` is `Success a`, apply the function on `a` and return the `b`.
   * @param def Function to call if fa is anything other than `Success`
   * @param f Function to call if fa is a `Success`.
   * @param fa Remote Data of any variant.
   */
  readonly unpack: <E, A, B>(def: () => B, f: (a: A) => B, fa: RD<E, A>) => B

  /**
   * Utility function to call a function for the specific RemoteData type.
   * @param mapper An object with 4 keys with values that are functions.
   * @param fa The Remote Data to match against.
   */
  readonly match: <E, A, G, H, I, J>(mapper: Matcher<E, A, G, H, I, J>, fa: RD<E, A>) => G | H | I | J

  /**
   * Check if the rd is of type Success.
   * @param rd Remote Data to check.
   */
  readonly isSuccess: <E, A>(rd: RD<E, A>) => rd is Success<A>

  /**
   * Check if the rd is of type NotAsked.
   * @param rd Remote Data to check.
   */
  readonly isNotAsked: <E, A>(rd: RD<E, A>) => rd is NotAsked

  /**
   * Check if the rd is of type Loading.
   * @param rd Remote Data to check.
   */
  readonly isLoading: <E, A>(rd: RD<E, A>) => rd is Loading

  /**
   * Check if the rd is of type Failure.
   * @param rd Remote Data to check.
   */
  readonly isFailure: <E, A>(rd: RD<E, A>) => rd is Failure<E>
}

export const SRD: RemoteData<URI> = {
  URI,
  map: (f, fa) => isSuccess(fa) ? success(f(fa.data)) : fa,
  map2: (f, fa, fb) =>
    isSuccess(fa)
      ? isSuccess(fb)
          ? success(f(fa.data, fb.data))
          : fb
      : fa,
  map3: (f, fa, fb, fc) =>
    isSuccess(fa)
      ? isSuccess(fb)
          ? isSuccess(fc)
              ? success(f(fa.data, fb.data, fc.data))
              : fc
          : fb
      : fa,
  mapFailure: (f, fa) => isFailure(fa) ? failure(f(fa.error)) : fa,
  chain: (f, fa) => isSuccess(fa) ? f(fa.data) : fa,
  bimap: (failureFn, successFn, rd) =>
    isSuccess(rd)
      ? success(successFn(rd.data))
      : isFailure(rd)
          ? failure(failureFn(rd.error))
          : rd,
  ap: (rdFn, rd) =>
    isSuccess(rd)
      ? isSuccess(rdFn)
          ? success(rdFn.data(rd.data))
          : rdFn
      : rd,
  alt: (def, rd) => isSuccess(rd) ? rd : def,
  of: success,
  equals: (a, b) => a.tag === b.tag,
  unwrap: (def, f, fa) => isSuccess(fa) ? f(fa.data) : def,
  unpack: (def, f, fa) => isSuccess(fa) ? f(fa.data) : def(),
  match: (mapper, fa) =>
    isSuccess(fa)
      ? mapper.success(fa.data)
      : isFailure(fa)
          ? mapper.failure(fa.error)
          : isLoading(fa)
              ? mapper.loading()
              : mapper.notAsked(),
  isSuccess,
  isFailure,
  isLoading,
  isNotAsked
}