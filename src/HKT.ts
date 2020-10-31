/**
 * `* -> *` constructors
 */
export interface HKT<URI, A> {
  readonly _URI: URI
  readonly _A: A
}

/**
 * `* -> * -> *` constructors
 */
export interface HKT2<URI, E, A> extends HKT<URI, A> {
  readonly _E: E
}

/**
 * `* -> *` constructors
 */
export interface URItoKind<A> {}

/**
 * `* -> * -> *` constructors
 */
export interface URItoKind2<E, A> {}


/**
 * `* -> *` constructors
 */
export type URIS = keyof URItoKind<any>

/**
 * `* -> * -> *` constructors
 */
export type URIS2 = keyof URItoKind2<any, any>

/**
 * `* -> *` constructors
 */
export type Kind<URI extends URIS, A> = URI extends URIS ? URItoKind<A>[URI] : any

/**
 * `* -> * -> *` constructors
 */
export type Kind2<URI extends URIS2, E, A> = URI extends URIS2 ? URItoKind2<E, A>[URI] : any
