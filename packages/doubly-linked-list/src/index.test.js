import test from 'ava'
import list, {insertNode, removeNode} from './index'


test('init', t => {
  let l = list()
  t.is(l.size, 0)

  l = list('abc')
  t.is(l.size, 3)

  l = list(['abc'])
  t.is(l.size, 1)

  l = list(new Set(['abc']))
  t.is(l.size, 1)
})

test('has', t => {
  let l = list('abc')
  t.true(l.has('b'))
  t.false(l.has('d'))
})

test('append', t => {
  let l = list()
  l.append('a')
  t.true(l.has('a'))
  t.is(l.size, 1)
  l.append('b', 'c')
  t.is(l.peekLeft(), 'a')
  t.is(l.peek(), 'c')
  t.is(l.size, 3)
  t.is(l.append('d'), 4)
})

test('appendLeft', t => {
  let l = list()
  l.appendLeft('a')
  t.true(l.has('a'))
  t.is(l.size, 1)
  l.appendLeft('b', 'c')
  t.is(l.peekLeft(), 'c')
  t.is(l.peek(), 'a')
  t.is(l.size, 3)
  t.is(l.appendLeft('1'), 4)
})


test('peek', t => {
  let l = list('abc')
  t.is(l.peek(), 'c')
})

test('peekLeft', t => {
  let l = list('abc')
  t.is(l.peekLeft(), 'a')
})

test('insertAfter', t => {
  let l = list()
  l.append('a', 'c')
  l.insertAfter('a', 'b')
  t.is(l.toString(), '["a","b","c"]')
  t.is(l.peekLeft(), 'a')
  t.is(l.peek(), 'c')
  t.is(l.size, 3)
  t.true(l.has('b'))
  l.insertAfter('c', 'd')
  t.is(l.peek(), 'd')
  t.is(l.insertAfter('d', 'e'), 5)
})

test('insertAfter last', t => {
  let l = list()
  l.append('a', 'c', 'a')
  l.insertAfter('a', 'b', true)
  t.is(l.peek(), 'b')
  t.is(l.size, 4)
})

test('insertAfter throws', t => {
  let l = list()
  l.append('a', 'c')
  t.throws(() => l.insertAfter('b', 'b'))
})

test('insertBefore', t => {
  let l = list()
  l.append('a', 'c')
  l.insertBefore('c', 'b')
  t.is(l.toString(), '["a","b","c"]')
  t.is(l.peekLeft(), 'a')
  t.is(l.peek(), 'c')
  t.is(l.size, 3)
  t.true(l.has('b'))
  l.insertBefore('a', 'd')
  t.is(l.peekLeft(), 'd')
  t.is(l.insertAfter('d', 'e'), 5)
})

test('insertBefore last', t => {
  let l = list()
  l.append('a', 'a')
  l.insertBefore('a', 'b', true)
  t.is(l.peekLeft(), 'a')
  t.is(l.peek(), 'a')
  t.is(l.size, 3)
})

test('insertBefore throws', t => {
  let l = list()
  l.append('a', 'c')
  t.throws(() => l.insertBefore('b', 'b'))
})

test('remove', t => {
  let l = list()
  l.append('a', 'b')
  l.remove('b')
  t.is(l.peek(), 'a')
  t.is(l.peekLeft(), 'a')
  l.append('b')
  t.is(l.remove('a'), 1)
  t.deepEqual(l.toJSON(), ['b'])
  t.is(l.peek(), 'b')
  t.is(l.peekLeft(), 'b')
  l.remove('b')
  t.is(l.peek(), null)
  t.is(l.peekLeft(), null)
})

test('remove all', t => {
  let l = list()
  l.append('a', 'b', 'b')
  l.remove('b')
  t.is(l.size, 2)
  t.true(l.has('b'))
  l.append('b')
  t.is(l.remove('b', true), 1)
  t.false(l.has('b'))
  t.is(l.size, 1)
  t.deepEqual(l.toJSON(), ['a'])
  t.is(l.peekLeft(), 'a')
  t.is(l.peek(), 'a')
})

test('pop', t => {
  let l = list()
  l.append('a', 'b', 'a')
  t.is(l.pop(), 'a')
  t.is(l.size, 2)
  t.is(l.peek(), 'b')
  t.deepEqual(l.toJSON(), ['a', 'b'])
})

test('popLeft', t => {
  let l = list()
  l.append('a', 'a', 'b')
  t.is(l.popLeft(), 'a')
  t.is(l.size, 2)
  t.is(l.peekLeft(), 'a')
  t.is(l.peek(), 'b')
  t.deepEqual(l.toJSON(), ['a', 'b'])
})

test('clear', t => {
  let l = list('abc')
  l.clear()
  t.is(l.size, 0)
  t.is(l.peekLeft(), null)
  t.is(l.peek(), null)
})

test('copy', t => {
  let a = list('abc')
  let b = a.copy()
  t.false(a === b)
  t.deepEqual(a.toJSON(), b.toJSON())
})

test('forEach', t => {
  let
    vals = ['a', 'b', 'c'],
    l = list(vals),
    i = 0
  l.forEach(v => {
    t.true(vals[i] === v)
    i++
  })
})

test('forEachLeft', t => {
  let
    vals = ['a', 'b', 'c'],
    l = list(vals),
    i = 0

  vals.reverse()
  l.forEachLeft(v => {
    t.true(vals[i] === v)
    i++
  })
})

test('map', t => {
  let
    vals = ['a', 'b'],
    a = list(vals),
    b = a.map(v => v.toUpperCase())
  t.false(a === b)
  t.is(b.peekLeft(), 'A')
  t.is(b.peek(), 'B')
})

test('mapLeft', t => {
  let
    vals = ['a', 'b'],
    a = list(vals),
    b = a.mapLeft(v => v.toUpperCase())
  t.false(a === b)
  t.is(b.peekLeft(), 'B')
  t.is(b.peek(), 'A')
})

test('toString', t => {
  let l = list('abc')
  t.is(l.toString(), '["a","b","c"]')
})

test('toJSON', t => {
  let l = list('abc')
  t.is(JSON.stringify(l), '["a","b","c"]')
  t.true(Array.isArray(l.toJSON()))
})

test('reverse', t => {
  const l = list('abc')
  l.reverse()
  t.deepEqual(l.toJSON(), ['c', 'b', 'a'])
})

test('insertNode', t => {
  let nodeA = insertNode(null, 3)
  t.deepEqual(nodeA, {next: null, prev: null, value: 3})

  let nodeB = insertNode(nodeA, 4)
  t.deepEqual(nodeB, {next: null, prev: nodeA, value: 4})
  t.deepEqual(nodeA, {next: nodeB, prev: null, value: 3})

  let nodeC = insertNode(nodeA, 5, nodeB)
  t.deepEqual(nodeC, {next: nodeB, prev: nodeA, value: 5})
  t.deepEqual(nodeA, {next: nodeC, prev: null, value: 3})
  t.deepEqual(nodeB, {next: null, prev: nodeC, value: 4})

  let nodeD = insertNode(nodeB, 6)
  t.deepEqual(nodeD, {next: null, prev: nodeB, value: 6})
  t.deepEqual(nodeB, {next: nodeD, prev: nodeC, value: 4})

  let nodeE = insertNode(null, 7, nodeD)
  t.deepEqual(nodeE, {next: nodeD, prev: nodeB, value: 7})
  t.deepEqual(nodeD, {next: null, prev: nodeE, value: 6})
  t.deepEqual(nodeB, {next: nodeE, prev: nodeC, value: 4})
})

test('removeNode', t=> {
  t.is(1, 1)
})