import test from 'ava'
import queue from './index'


test('init', t => {
  const s = queue('abc')
  t.is(s.size, 3)
})

test('peek', t => {
  const s = queue('abc')
  t.is(s.peek(), 'a')
})

test('enqueue', t => {
  const s = queue()
  s.enqueue('a')
  t.is(s.peek(), 'a')
  s.enqueue('b')
  t.is(s.peek(), 'a')
  t.is(s.size, 2)
})

test('dequeue', t => {
  const s = queue('abc')
  t.is(s.dequeue(), 'a')
  t.is(s.size, 2)
})

test('has', t => {
  const s = queue('abc')
  t.true(s.has('b'))
})

test('copy', t => {
  const s = queue('abc')
  t.false(s === s.copy())
  t.deepEqual(s.toJSON(), s.copy().toJSON())
})

test('iterate', t => {
  const s = queue('a')
  let i = 0
  for (let item of s) {
    i++
    t.is(item, 'a')
  }
  t.is(i, 1)
})

test('toString', t => {
  let s = queue('abc')
  t.deepEqual(s.toJSON(), ["a", "b", "c"])
})

test('toJSON', t => {
  let s = queue('abc')
  t.is(JSON.stringify(s), '["a","b","c"]')
  t.deepEqual(s.toJSON(), ["a", "b", "c"])
})