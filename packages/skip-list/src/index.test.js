import test from 'ava'
import skipList from './index'
import bench from '@essentials/benchmark'

const randomChoice = potential => potential[Math.floor(Math.random() * potential.length)]
const randomValues = (num = 16) =>
  Array.from(Array(num), () => Math.floor(Math.random() * num))
const cmp = (a, b) => a - b

test('insert 1', t => {
  const s = skipList()
  t.is(s.insert(5), 1)
  t.deepEqual(s.toJSON(), [5])
  t.is(s.peekLeft(), 5)
  t.is(s.peek(), 5)
  t.is(s.size, 1)
  t.is(s.___height.length, 0)
})

test('insert 2', t => {
  let s = skipList()
  s.insert(5)
  t.is(s.insert(6), 2)
  t.deepEqual(s.toJSON(), [5, 6])
  t.is(s.peekLeft(), 5)
  t.is(s.peek(), 6)
  t.is(s.size, 2)

  s = skipList()
  s.insert(5)
  t.is(s.insert(4), 2)
  t.deepEqual(s.toJSON(), [4, 5])
  t.is(s.peekLeft(), 4)
  t.is(s.peek(), 5)
  t.is(s.size, 2)

  t.is(s.___height.length, 0)
})

test('insert 3', t => {
  let s = skipList()
  s.insert(5)
  s.insert(6)
  t.is(s.insert(7), 3)
  t.deepEqual(s.toJSON(), [5, 6, 7])
  t.is(s.peekLeft(), 5)
  t.is(s.peek(), 7)
  t.is(s.size, 3)
  t.is(s.___height.length, 1)

  s = skipList()
  s.insert(5)
  s.insert(7)
  t.is(s.insert(6), 3)
  t.deepEqual(s.toJSON(), [5, 6, 7])
  t.is(s.peekLeft(), 5)
  t.is(s.peek(), 7)
  t.is(s.size, 3)
  t.is(s.___height.length, 1)

  s = skipList()
  s.insert(5)
  s.insert(7)
  t.is(s.insert(4), 3)
  t.deepEqual(s.toJSON(), [4, 5, 7])
  t.is(s.peekLeft(), 4)
  t.is(s.peek(), 7)
  t.is(s.size, 3)
  t.is(s.___height.length, 1)
})

test('insert 10,000', t => {
  const
    original = randomValues(10000),
    s = skipList(original)
  original.sort(cmp)
  t.deepEqual(s.toJSON(), original)

  s.___height.forEach(
    l => {
      // ensures the upper height are also sorted correct
      const check = l.toJSON()
      check.sort(cmp)
      t.deepEqual(l.toJSON(), check)
    }
  )

  t.true(s.___height.length >= 11)
  t.is(s.size, original.length)
})

const bigListValues = randomValues(100000)
const bigList = skipList(bigListValues)

test('has', t => {
  for (let value of bigListValues)
    t.true(bigList.has(value))
  // out of upper range
  t.false(bigList.has(bigListValues.length + 1))
  // out of lower range
  t.false(bigList.has(-6))
})

test('remove', t => {
  const values = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
  const s = skipList(values)
  t.is(s.remove(-3), values.length)
  t.is(s.remove(17), values.length)
  for (let i = 0; i <= 16; i++) {
    const value = randomChoice(values)
    values.splice(values.indexOf(value), 1)
    t.is(s.remove(value), values.length)
  }
  t.is(s.size, 0)
  t.is(s.___height.length, 0)
  t.is(s.remove(-3), 0)
  t.is(s.remove(17), 0)
})

test('remove all', t => {
  const s = skipList([0, 1, 2, 3, 4, 5, 6, 6, 6, 6, 6, 6, 6, 6, 14, 15, 16])
  t.is(s.remove(6, true), 9)
  t.false(s.has(6))
})

test('pop', t => {
  const values = [1, 2, 3, 4, 5, 6, 7, 8]
  let l = skipList(values)
  while (l.size > 0) {
    t.is(l.pop(), values.pop())
    t.is(l.size, values.length)
    const peek = values[values.length - 1]
    t.is(l.peek(), peek === void 0 ? null : peek)
  }
})

test('popLeft', t => {
  const values = [1, 2, 3, 4, 5, 6, 7, 8]
  let l = skipList(values)
  while (l.size > 0) {
    t.is(l.popLeft(), values.shift())
    t.is(l.size, values.length)
    const peekLeft = values[0]
    t.is(l.peekLeft(), peekLeft === void 0 ? null : peekLeft)
  }
})

test('clear', t => {
  let l = skipList('abc')
  l.clear()
  t.is(l.size, 0)
  t.is(l.peekLeft(), null)
  t.is(l.peek(), null)
})

test('copy', t => {
  let a = skipList('abc')
  let b = a.copy()
  t.false(a === b)
  t.deepEqual(a.toJSON(), b.toJSON())
})

test('forEach', t => {
  let
    vals = randomValues(16),
    l = skipList(vals),
    i = 0

  vals.sort(cmp)
  l.forEach(v => {
    t.true(vals[i] === v)
    i++
  })
})

test('forEachLeft', t => {
  let
    vals = randomValues(16),
    l = skipList(vals),
    i = 0

  vals.sort(cmp)
  vals.reverse()
  l.forEachLeft(v => {
    t.true(vals[i] === v)
    i++
  })
})

test('map', t => {
  let
    vals = randomValues(),
    a = skipList(vals),
    b = a.map(v => v + 100)

  t.false(a === b)
  t.is(b.peekLeft(), a.peekLeft() + 100)
  t.is(b.peek(), a.peek() + 100)
})

test('mapLeft', t => {
  let
    vals = randomValues(),
    a = skipList(vals),
    b = a.mapLeft(v => v + 100)

  t.false(a === b)
  t.is(b.peekLeft(), a.peek() + 100)
  t.is(b.peek(), a.peekLeft() + 100)
})

test('toString', t => {
  const values = randomValues()
  let l = skipList(values)
  values.sort(cmp)
  t.is(l.toString(), JSON.stringify(values))
})

test('toJSON', t => {
  const values = randomValues()
  let l = skipList(values)
  values.sort(cmp)
  t.true(Array.isArray(l.toJSON()))
  t.is(JSON.stringify(l), JSON.stringify(values))
})

test('benchmarks', t => {
  console.log('Benchmarks')
  const values = [...bigListValues]
  values.sort(cmp)
  bench(() => bigList.has(values[values.length / 2]))
  bench(() => bigListValues.indexOf(values[values.length / 2]))
  bench(() => bigList.has(values[values.length - 1]))
  bench(() => bigListValues.indexOf(values[values.length - 1]))
  bench(() => bigList.has(values[0]))
  bench(() => bigListValues.indexOf(values[0]))
  bench(() => bigList.forEach(v => v))
  bench(() => bigListValues.forEach(v => v))
  bench('create skipList()', () => skipList())
  bench('create []', () => [])
  t.is(1, 1)
})