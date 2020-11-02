import { SRD, notAsked, loading, failure, success } from '../src'

const rd1 = notAsked()
const rd2 = loading()
const rd3 = failure('msg')
const rd4 = success(5)
const f = (x: number) => x * 2
const g = (x: number) => x * 10
const h = (x: number) => x + 1
const i = (x: number) => x - 6
const f1 = (x: string) => x + ' f'
const g1 = (x: string) => x + ' g'
const h1 = (x: string) => x + ' h'
const i1 = (x: string) => x + ' i'

describe('SRD - Static Land Compliancy', () => {

  describe('Setoid', () => {

    describe('equals', () => {

      it('Reflexivity', () => {
        expect(SRD.equals(rd1, rd1)).toBe(true)
        expect(SRD.equals(rd2, rd2)).toBe(true)
        expect(SRD.equals(rd3, rd3)).toBe(true)
        expect(SRD.equals(rd4, rd4)).toBe(true)
        expect(SRD.equals(rd1, rd2)).toBe(false)
        expect(SRD.equals(rd2, rd3)).toBe(false)
        expect(SRD.equals(rd3, rd4)).toBe(false)
        expect(SRD.equals(rd4, rd1)).toBe(false)
      })

      it('Symmetry', () => {
        expect(SRD.equals(rd1, rd2)).toEqual(SRD.equals(rd2, rd1))
        expect(SRD.equals(rd2, rd3)).toEqual(SRD.equals(rd3, rd2))
        expect(SRD.equals(rd3, rd4)).toEqual(SRD.equals(rd4, rd3))
        expect(SRD.equals(rd4, rd1)).toEqual(SRD.equals(rd1, rd4))
      })
  
      it('Transitivity', () => {
        const a = loading()
        const b = loading()
        const c = loading()
        expect(SRD.equals(a, b)).toBe(true)
        expect(SRD.equals(b, c)).toBe(true)
        expect(SRD.equals(a, c)).toBe(true)
      })

    })

  })

  describe('Functor', () => {

    describe('map', () => {

      it('identity', () => {
        expect(SRD.map(x => x, rd1)).toEqual(rd1)
        expect(SRD.map(x => x, rd2)).toEqual(rd2)
        expect(SRD.map(x => x, rd3)).toEqual(rd3)
        expect(SRD.map(x => x, rd4)).toEqual(rd4)

        expect(SRD.map(x => x * 2, rd1)).toEqual(rd1)
        expect(SRD.map(x => x * 2, rd2)).toEqual(rd2)
        expect(SRD.map(x => x * 2, rd3)).toEqual(rd3)
        expect(SRD.map(x => x * 2, rd4)).toEqual(success(10))
      })

      it('composition', () => {
        expect(SRD.map(x => f(g(x)), rd1)).toEqual(SRD.map(f, SRD.map(g, rd1)))
        expect(SRD.map(x => f(g(x)), rd2)).toEqual(SRD.map(f, SRD.map(g, rd2)))
        expect(SRD.map(x => f(g(x)), rd3)).toEqual(SRD.map(f, SRD.map(g, rd3)))
        expect(SRD.map(x => f(g(x)), rd4)).toEqual(SRD.map(f, SRD.map(g, rd4)))
      })

    })

  })

  describe('Bifunctor', () => {

    describe('bimap', () => {

      it('identity', () => {
        expect(SRD.bimap(x => x, x => x, rd1)).toEqual(rd1)
        expect(SRD.bimap(x => x, x => x, rd2)).toEqual(rd2)
        expect(SRD.bimap(x => x, x => x, rd3)).toEqual(rd3)
        expect(SRD.bimap(x => x, x => x, rd4)).toEqual(rd4)
        expect(SRD.bimap(x => x + 'msg', x => x * 2, rd1)).toEqual(rd1)
        expect(SRD.bimap(x => x + 'msg', x => x * 2, rd2)).toEqual(rd2)
        expect(SRD.bimap(x => x + 'msg', x => x * 2, rd3)).toEqual(failure('msgmsg'))
        expect(SRD.bimap(x => x + 'msg', x => x * 2, rd4)).toEqual(success(10))
      })

      it('composition', () => {
        expect(SRD.bimap(x => f(g(x)), x => h(i(x)), rd1)).toEqual(SRD.bimap(f, h, SRD.bimap(g, i, rd1)))
        expect(SRD.bimap(x => f(g(x)), x => h(i(x)), rd2)).toEqual(SRD.bimap(f, h, SRD.bimap(g, i, rd2)))
        expect(SRD.bimap(x => f1(g1(x)), x => h(i(x)), rd3)).toEqual(SRD.bimap(f1, h, SRD.bimap(g1, i, rd3)))
        expect(SRD.bimap(x => f(g(x)), x => h(i(x)), rd4)).toEqual(SRD.bimap(f, h, SRD.bimap(g, i, rd4)))
      })

    })

  })

  describe('Alt', () => {

    describe('alt', () => {

      it('associativity', () => {
        expect(SRD.alt(SRD.alt(rd1, rd1), rd1)).toEqual(SRD.alt(rd1, SRD.alt(rd1, rd1)))
        expect(SRD.alt(SRD.alt(rd2, rd2), rd2)).toEqual(SRD.alt(rd2, SRD.alt(rd2, rd2)))
        expect(SRD.alt(SRD.alt(rd3, rd3), rd3)).toEqual(SRD.alt(rd3, SRD.alt(rd3, rd3)))
        expect(SRD.alt(SRD.alt(rd4, rd4), rd4)).toEqual(SRD.alt(rd4, SRD.alt(rd4, rd4)))
        expect(SRD.alt(SRD.alt(rd1, rd2), rd3)).toEqual(SRD.alt(rd1, SRD.alt(rd2, rd3)))
        expect(SRD.alt(SRD.alt(rd2, rd3), rd4)).toEqual(SRD.alt(rd2, SRD.alt(rd3, rd4)))
        expect(SRD.alt(SRD.alt(rd3, rd4), rd1)).toEqual(SRD.alt(rd3, SRD.alt(rd4, rd1)))
        expect(SRD.alt(SRD.alt(rd4, rd1), rd2)).toEqual(SRD.alt(rd4, SRD.alt(rd1, rd2)))
      })

      it('distributivity', () => {
        expect(SRD.map(f, SRD.alt(rd1, rd1))).toEqual(SRD.alt(SRD.map(f, rd1), SRD.map(f, rd1)))
        expect(SRD.map(f, SRD.alt(rd2, rd2))).toEqual(SRD.alt(SRD.map(f, rd2), SRD.map(f, rd2)))
        expect(SRD.map(f, SRD.alt(rd3, rd3))).toEqual(SRD.alt(SRD.map(f, rd3), SRD.map(f, rd3)))
        expect(SRD.map(f, SRD.alt(rd4, rd4))).toEqual(SRD.alt(SRD.map(f, rd4), SRD.map(f, rd4)))

        expect(SRD.map(f, SRD.alt(rd1, rd2))).toEqual(SRD.alt(SRD.map(f, rd1), SRD.map(f, rd2)))
        expect(SRD.map(f, SRD.alt(rd2, rd3))).toEqual(SRD.alt(SRD.map(f, rd2), SRD.map(f, rd3)))
        expect(SRD.map(f, SRD.alt(rd3, rd4))).toEqual(SRD.alt(SRD.map(f, rd3), SRD.map(f, rd4)))
        expect(SRD.map(f, SRD.alt(rd4, rd1))).toEqual(SRD.alt(SRD.map(f, rd4), SRD.map(f, rd1)))

        expect(SRD.map(f, SRD.alt(rd2, rd1))).toEqual(SRD.alt(SRD.map(f, rd2), SRD.map(f, rd1)))
        expect(SRD.map(f, SRD.alt(rd3, rd2))).toEqual(SRD.alt(SRD.map(f, rd3), SRD.map(f, rd2)))
        expect(SRD.map(f, SRD.alt(rd4, rd3))).toEqual(SRD.alt(SRD.map(f, rd4), SRD.map(f, rd3)))
        expect(SRD.map(f, SRD.alt(rd1, rd4))).toEqual(SRD.alt(SRD.map(f, rd1), SRD.map(f, rd4)))
      })

    })

  })

  describe('Chain', () => {

    describe('chain', () => {

      it('associativity', () => {
        const m1 = (x: number) => success(x)
        const m2 = (x: number) => success(x * 2)

        const m3 = (x: number) => failure('msg1')
        const m4 = (x: number) => failure('msg2')

        const m5 = (x: number) => notAsked()
        const m6 = (x: number) => notAsked()

        const m7 = (x: number) => loading()
        const m8 = (x: number) => loading()

        expect(SRD.chain(m1, SRD.chain(m2, rd1))).toEqual(SRD.chain(x => SRD.chain(m1, m2(x)), rd1))
        expect(SRD.chain(m1, SRD.chain(m2, rd2))).toEqual(SRD.chain(x => SRD.chain(m1, m2(x)), rd2))
        expect(SRD.chain(m1, SRD.chain(m2, rd3))).toEqual(SRD.chain(x => SRD.chain(m1, m2(x)), rd3))
        expect(SRD.chain(m1, SRD.chain(m2, rd4))).toEqual(SRD.chain(x => SRD.chain(m1, m2(x)), rd4))

        expect(SRD.chain(m3, SRD.chain(m4, rd1))).toEqual(SRD.chain(x => SRD.chain(m3, m4(x)), rd1))
        expect(SRD.chain(m3, SRD.chain(m4, rd2))).toEqual(SRD.chain(x => SRD.chain(m3, m4(x)), rd2))
        expect(SRD.chain(m3, SRD.chain(m4, rd3))).toEqual(SRD.chain(x => SRD.chain(m3, m4(x)), rd3))
        expect(SRD.chain(m3, SRD.chain(m4, rd4))).toEqual(SRD.chain(x => SRD.chain(m3, m4(x)), rd4))

        expect(SRD.chain(m5, SRD.chain(m6, rd1))).toEqual(SRD.chain(x => SRD.chain(m5, m6(x)), rd1))
        expect(SRD.chain(m5, SRD.chain(m6, rd2))).toEqual(SRD.chain(x => SRD.chain(m5, m6(x)), rd2))
        expect(SRD.chain(m5, SRD.chain(m6, rd3))).toEqual(SRD.chain(x => SRD.chain(m5, m6(x)), rd3))
        expect(SRD.chain(m5, SRD.chain(m6, rd4))).toEqual(SRD.chain(x => SRD.chain(m5, m6(x)), rd4))

        expect(SRD.chain(m7, SRD.chain(m8, rd1))).toEqual(SRD.chain(x => SRD.chain(m7, m8(x)), rd1))
        expect(SRD.chain(m7, SRD.chain(m8, rd2))).toEqual(SRD.chain(x => SRD.chain(m7, m8(x)), rd2))
        expect(SRD.chain(m7, SRD.chain(m8, rd3))).toEqual(SRD.chain(x => SRD.chain(m7, m8(x)), rd3))
        expect(SRD.chain(m7, SRD.chain(m8, rd4))).toEqual(SRD.chain(x => SRD.chain(m7, m8(x)), rd4))

        expect(SRD.chain(m2, SRD.chain(m8, rd1))).toEqual(SRD.chain(x => SRD.chain(m2, m8(x)), rd1))
        expect(SRD.chain(m8, SRD.chain(m2, rd2))).toEqual(SRD.chain(x => SRD.chain(m8, m2(x)), rd2))
        expect(SRD.chain(m3, SRD.chain(m6, rd3))).toEqual(SRD.chain(x => SRD.chain(m3, m6(x)), rd3))
        expect(SRD.chain(m1, SRD.chain(m7, rd4))).toEqual(SRD.chain(x => SRD.chain(m1, m7(x)), rd4))

      })

    })

  })

  describe('Apply', () => {

    describe('ap', () => {

      it('composition', () => {
        const mappper = SRD.map(f => (g: typeof f) => (x: number) => f(g(x)), success(f))
        const a = SRD.ap(SRD.ap(mappper, success(f)), success(4))
        const b = SRD.ap(success(f), SRD.ap(success(f), success(4)))
        expect(a).toEqual(b)
      })

    })

  })

  describe('Applicative', () => {

    describe('of', () => {

      it('identity', () => {
        expect(SRD.ap(SRD.of(f), rd1)).toEqual(rd1)
        expect(SRD.ap(SRD.of(f), rd2)).toEqual(rd2)
        expect(SRD.ap(SRD.of(f), rd3)).toEqual(rd3)
        expect(SRD.ap(SRD.of(f), rd4)).toEqual(success(10))
      })

      it('homomorphism', () => {
        expect(SRD.ap(SRD.of(f), SRD.of(5))).toEqual(SRD.of(f(5)))
      })

      it('interchange', () => {
        expect(SRD.ap(rd1, SRD.of(5))).toEqual(SRD.ap(SRD.of(f => f(5)), rd1))
        expect(SRD.ap(rd2, SRD.of(5))).toEqual(SRD.ap(SRD.of(f => f(5)), rd2))
        expect(SRD.ap(rd3, SRD.of(5))).toEqual(SRD.ap(SRD.of(f => f(5)), rd3))
        expect(SRD.ap(success(f), SRD.of(5))).toEqual(SRD.ap(SRD.of((x: (a: number) => number) => x(5)), success(f)))
      })

    })

  })

  describe('Monad', () => {

    describe('chain', () => {

      it('left identity', () => {
        const m2 = (x: number) => success(x * 2)
        const m4 = (x: number) => failure('msg2')
        const m6 = (x: number) => notAsked()
        const m8 = (x: number) => loading()
        expect(SRD.chain(m2, SRD.of(5))).toEqual(m2(5))
        expect(SRD.chain(m4, SRD.of(5))).toEqual(m4(5))
        expect(SRD.chain(m6, SRD.of(5))).toEqual(m6(5))
        expect(SRD.chain(m8, SRD.of(5))).toEqual(m8(5))
      })

      it('right identity', () => {
        expect(SRD.chain(SRD.of, rd1)).toEqual(rd1)
        expect(SRD.chain(SRD.of, rd2)).toEqual(rd2)
        expect(SRD.chain(SRD.of, rd3)).toEqual(rd3)
        expect(SRD.chain(SRD.of, rd4)).toEqual(rd4)
      })

    })

  })

  describe('Utils', () => {

    describe('match', () => {

      const mapper = {
        notAsked: jest.fn(),
        loading: jest.fn(),
        failure: jest.fn(),
        success: jest.fn()
      }

      beforeEach(() => jest.resetAllMocks())

      it('notAsked', () => {
        expect(mapper.notAsked).toHaveBeenCalledTimes(0)
        expect(mapper.loading).toHaveBeenCalledTimes(0)
        expect(mapper.failure).toHaveBeenCalledTimes(0)
        expect(mapper.success).toHaveBeenCalledTimes(0)
        SRD.match(mapper, rd1)
        expect(mapper.notAsked).toHaveBeenCalledTimes(1)
        expect(mapper.loading).toHaveBeenCalledTimes(0)
        expect(mapper.failure).toHaveBeenCalledTimes(0)
        expect(mapper.success).toHaveBeenCalledTimes(0)
      })

      it('loading', () => {
        expect(mapper.notAsked).toHaveBeenCalledTimes(0)
        expect(mapper.loading).toHaveBeenCalledTimes(0)
        expect(mapper.failure).toHaveBeenCalledTimes(0)
        expect(mapper.success).toHaveBeenCalledTimes(0)
        SRD.match(mapper, rd2)
        expect(mapper.notAsked).toHaveBeenCalledTimes(0)
        expect(mapper.loading).toHaveBeenCalledTimes(1)
        expect(mapper.failure).toHaveBeenCalledTimes(0)
        expect(mapper.success).toHaveBeenCalledTimes(0)
      })

      it('failure', () => {
        expect(mapper.notAsked).toHaveBeenCalledTimes(0)
        expect(mapper.loading).toHaveBeenCalledTimes(0)
        expect(mapper.failure).toHaveBeenCalledTimes(0)
        expect(mapper.success).toHaveBeenCalledTimes(0)
        SRD.match(mapper, rd3)
        expect(mapper.notAsked).toHaveBeenCalledTimes(0)
        expect(mapper.loading).toHaveBeenCalledTimes(0)
        expect(mapper.failure).toHaveBeenCalledWith('msg')
        expect(mapper.success).toHaveBeenCalledTimes(0)
      })

      it('success', () => {
        expect(mapper.notAsked).toHaveBeenCalledTimes(0)
        expect(mapper.loading).toHaveBeenCalledTimes(0)
        expect(mapper.failure).toHaveBeenCalledTimes(0)
        expect(mapper.success).toHaveBeenCalledTimes(0)
        SRD.match(mapper, rd4)
        expect(mapper.notAsked).toHaveBeenCalledTimes(0)
        expect(mapper.loading).toHaveBeenCalledTimes(0)
        expect(mapper.failure).toHaveBeenCalledTimes(0)
        expect(mapper.success).toHaveBeenCalledWith(5)
      })

    })

    describe('map2', () => {

      it('notAsked', () => {
        expect(SRD.map2((a, b) => a + b, rd1, rd4)).toEqual(rd1)
      })

      it('loading', () => {
        expect(SRD.map2((a, b) => a + b, rd2, rd4)).toEqual(rd2)
      })

      it('failure', () => {
        expect(SRD.map2((a, b) => a + b, rd3, rd4)).toEqual(rd3)
      })

      it('success', () => {
        expect(SRD.map2((a, b) => a + b, rd4, rd4)).toEqual(success(10))
      })

    })

    describe('map3', () => {

      it('notAsked', () => {
        expect(SRD.map3((a, b, c) => a + b + c, rd1, rd4, rd4)).toEqual(rd1)
      })

      it('loading', () => {
        expect(SRD.map3((a, b, c) => a + b + c, rd2, rd4, rd4)).toEqual(rd2)
      })

      it('failure', () => {
        expect(SRD.map3((a, b, c) => a + b + c, rd3, rd4, rd4)).toEqual(rd3)
      })

      it('success', () => {
        expect(SRD.map3((a, b, c) => a + b + c, rd4, rd4, rd4)).toEqual(success(15))
      })

    })

    describe('mapFailure', () => {

      it('notAsked', () => {
        expect(SRD.mapFailure((e) => e + 'hello', rd1)).toEqual(rd1)
      })

      it('loading', () => {
        expect(SRD.mapFailure((e) => e + 'hello', rd2)).toEqual(rd2)
      })

      it('failure', () => {
        expect(SRD.mapFailure((e) => e + 'hello', rd3)).toEqual(failure('msghello'))
      })

      it('success', () => {
        expect(SRD.mapFailure((e) => e + 'hello', rd4)).toEqual(rd4)
      })

    })

    describe('unwrap', () => {

      it('notAsked', () => {
        expect(SRD.unwrap(4, f, rd1)).toEqual(4)
      })

      it('loading', () => {
        expect(SRD.unwrap(4, f, rd2)).toEqual(4)
      })

      it('failure', () => {
        expect(SRD.unwrap(4, f, rd3)).toEqual(4)
      })

      it('success', () => {
        expect(SRD.unwrap(4, f, rd4)).toEqual(10)
      })

    })


    describe('unpack', () => {

      it('notAsked', () => {
        expect(SRD.unpack(() => 4, f, rd1)).toEqual(4)
      })

      it('loading', () => {
        expect(SRD.unpack(() => 4, f, rd2)).toEqual(4)
      })

      it('failure', () => {
        expect(SRD.unpack(() => 4, f, rd3)).toEqual(4)
      })

      it('success', () => {
        expect(SRD.unpack(() => 4, f, rd4)).toEqual(10)
      })

    })

  })
})