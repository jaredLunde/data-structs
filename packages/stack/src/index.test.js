import test from 'ava'
import stack from './index'


test('init', t => {
  const s = stack('abc')
  t.is(s.size, 3)
})

test('peek', t => {
  const s = stack('abc')
  t.is(s.peek(), 'c')
})

test('push', t => {
  const s = stack()
  s.push('a')
  t.is(s.peek(), 'a')
  s.push('b')
  t.is(s.peek(), 'b')
})

test('pop', t => {
  const s = stack('abc')
  t.is(s.pop(), 'c')
  t.is(s.size, 2)
})

test('has', t => {
  const s = stack('abc')
  t.true(s.has('b'))
  t.false(s.has('d'))
})

test('copy', t => {
  const s = stack('abc')
  t.false(s === s.copy())
  t.deepEqual(s.toJSON(), s.copy().toJSON())
})

test('iterate', t => {
  const s = stack('a')
  let i = 0
  for (let item of s) {
    i++
    t.is(item, 'a')
  }
  t.is(i, 1)
})

test('toString', t => {
  let s = stack('abc')
  t.deepEqual(s.toJSON(), ["a", "b", "c"])
})

test('toJSON', t => {
  let s = stack('abc')
  t.is(JSON.stringify(s), '["a","b","c"]')
  t.deepEqual(s.toJSON(), ["a", "b", "c"])
})