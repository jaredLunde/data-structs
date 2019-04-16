import {append, appendLeft, iter, ref} from '@data-structs/linked-list'
import {doublyLinkedList, insertNode, removeNode} from '@data-structs/doubly-linked-list'


const createLevel = (prevLevel = null) => {
  const
    size = ref(0),
    head = ref({
      value: -Infinity,
      next: null,
      prev: null,
      get down () { return prevLevel.___head.current }
    }),
    tail = ref(null)

  const list = {
    ___head: head,
    ___tail: tail,
    ___size: size,
    get size () { return size.current },
    peekLeft () { return head.current },
    peek () { return tail.current },
    append: node => list.insert(tail.current, node),
    appendLeft: node => list.insert(null, node),
    insert: (left = null, node) => {
      const nodeRef = insertNode(left === null ? head.current : left, node.value)
      nodeRef.down = node

      if (tail.current === left || size.current === 0)
        tail.current = nodeRef

      ++size.current
      return nodeRef
    },
    remove: (node) => {
      if (node === tail.current)
        tail.current = node.prev
      removeNode(null, node)
      return --size.current
    },
    toJSON: function () {
      const out = []
      for (let nodeRef of iter(head.current.next))
        out.push(nodeRef.value)
      return out
    }
  }

  return list
}

export const visualize = s => {
  console.log('[0]', s.toJSON())
  // t.is(s.toJSON().length, s.size)
  let i = 0
  s.___levels.forEach(
    l => {
      console.log(`[${++i}]`, l.toJSON())
    }
  )
}

const randomChoice = potential => potential[Math.floor(Math.random() * potential.length)]

// rather than using a coin-flip we use something that is more predictably self-balancing
export const getLevel = (n, levels) => {
  let
    // sets the max-level to be inline with O(log n) lookups
    max = Math.floor(Math.log2(n)),
    potential = [],
    maybeLevel = 1

  for (; maybeLevel <= max; maybeLevel++) {
    let level = levels[maybeLevel - 1]

    const
      // this is the expected number of elements we should see in this level
      expected = Math.floor((2**(-1 * maybeLevel)) * n),
      // this is the actual number of elements in this level
      actual = level === void 0 ? 0 : level.size,
      diff = expected - actual

    // the only possible levels we should insert toward are ones with fewer than expected
    // elements in order to keep the list balanced
    if (diff > 0) potential.push(maybeLevel)
  }

  // if the list is already balanced, don't insert the next value into any levels
  // this extra bit of randomness (Math.random() > 0.5) should help ward off adversaries
  return potential.length > 0 && Math.random() > 0.5 ? randomChoice(potential) : 0
}

const defaultCmp = (a, b) => a - b
const defaultAreEqual = (a, b) => a === b

export const skipList = (initialValues, cmp = defaultCmp) => {
  if (typeof initialValues === 'function') {
    cmp = initialValues
    initialValues = null
  }

  // this is our user-facing list
  const
    list = doublyLinkedList(),
    head = list.___head,
    tail = list.___tail,
    size = list.___size,
    levels = []

  list.___levels = levels
  Object.defineProperty(list, '___levels', {value: levels, writable: false})

  const doInsert = value => {
    if (size.current < 2) {
      // we are still operating on a zero-level skip list at this point
      if (size.current === 0 || cmp(value, head.current.value) > 0)
        append(list, insertNode)(value)
      else
        appendLeft(list, insertNode)(value)
    }
    else if (levels.length === 0) {
      // we need to create our first level
      let node

      for (let next of iter(head.current)) {
        if (cmp(value, next.value) <= 0) {
          node = insertNode(null, value, next)
          if (next === head.current) head.current = node
          break
        }
      }

      if (node === void 0)
        tail.current = node = insertNode(tail.current, value)

      const level = createLevel(list)
      level.insert(null, node)
      levels.push(level)
      ++size.current
    }
    else {
      // searches for the proper insertion point and most efficient insertion method
      let node, topLevel = getLevel(size.current + 1, levels)

      // O(1) head/tail insertion
      if (cmp(value, head.current.value) <= 0) {
        // head
        head.current = node = insertNode(null, value, head.current)
        let levelIdx = topLevel

        while (levelIdx > 0) {
          const level = levels[topLevel - levelIdx--]
          if (level === void 0) break
          node = level.appendLeft(node)
        }
      }
      else if (cmp(value, tail.current.value) > 0) {
        // tail
        tail.current = node = insertNode(tail.current, value, null)
        let levelIdx = topLevel

        while (levelIdx > 0) {
          const level = levels[topLevel - levelIdx--]
          if (level === void 0) break
          node = level.append(node)
        }
      }
      else {
        // O(log n) search insertion
        let
          next = levels[levels.length - 1].peekLeft(),
          insertionPath = [],
          levelIdx = levels.length

        const insertPath = (next) => {
          if (levelIdx-- <= topLevel)
            insertionPath.push(next)
          return next.down
        }

        while (next !== null) {
          if (levelIdx > 0) {
            // these are the fast-lane levels
            if (next.value === -Infinity || cmp(value, next.value) > 0) {
              // value > next.value
              if (next.next === null)
                next = insertPath(next)
              else
                next = next.next
            }
            else
              // value <= next.value
              next = insertPath(next.prev === null ? next : next.prev)
          }
          else {
            // this is the base level
            if (cmp(value, next.value) > 0) {
              // value > next.value
              if (next.next === null) {
                node = insertNode(next, value)
                tail.current = node
                next = null
              }
              else
                next = next.next
            }
            else {
              // value <= next.value
              node = insertNode(null, value, next)

              if (next === head.current)
                head.current = node
              break
            }
          }
        }

        levelIdx = 0
        while (levelIdx < levels.length) {
          const
            level = levels[levelIdx++],
            afterNode = insertionPath.pop()
          if (afterNode === void 0) break
          node = level.insert(afterNode, node)
        }
      }

      // creates any new levels and inserts the latest node
      while (topLevel > levels.length) {
        levels.push(createLevel(levels[levels.length - 1]))
        node = levels[levels.length - 1].append(node)
      }

      return ++size.current
    }
  }

  list.insert = function () {
    doInsert(arguments[0])

    if (arguments.length > 1)
      for (let i = 1; i < arguments.length; i++) doInsert(arguments[i])

    return size.current
  }

  list.pop = function () {
    if (size.current === 0) return
    const result = tail.current.value
    list.remove(result)
    return result
  }

  list.popLeft = function () {
    if (size.current === 0) return
    const result = head.current.value
    list.remove(result)
    return result
  }

  list.remove = (value, all) => {
    let node, visited, result = null

    while (result !== void 0) {
      result = findNode(next => cmp(value, next))

      if (result !== void 0) {
        node = result[0]
        visited = result[1]
        // replaces the current head
        if (node === head.current)
          head.current = node.next
        // replaces the current tail
        if (node === tail.current)
          tail.current = node.prev
        // removes the value from any upper levels
        if (visited !== void 0) {
          let i = 0
          while (visited.length > 0) {
            const level = levels[i++]
            level.remove(visited.pop())
            // deletes the level if it is now empty
            if (level.size === 0)
              levels.splice(--i, 1)
          }
        }
        // removes the value from the base
        removeNode(node.prev, node)
        size.current--
        if (all !== true) break
      }
    }

    return size.current
  }

  const findNode = (cmp = defaultAreEqual) => {
    let headLevel = levels[levels.length - 1]
    headLevel = headLevel === void 0 ? list : headLevel
    if (headLevel.size === 0) return

    let
      next = headLevel.___head.current,
      levelIdx = levels.length
    // determines if the value is the head or if its out of range to the left
    if (cmp(head.current.value) < 0) return
    // determines if the value is the tail or if its out of range to the right
    if (cmp(tail.current.value) > 0) return

    const skip = next => {
      --levelIdx
      return next.down
    }

    while (next !== null) {
      if (levelIdx > 0) {
        // these are the fast-lane levels
        if (next.value === -Infinity || cmp(next.value) > 0) {
          // value > next.value
          if (next.next === null)
            next = skip(next)
          else
            next = next.next
        }
        else if (cmp(next.value) === 0) {
          // provides early bailouts
          const visited = []

          while (next.down !== void 0) {
            visited.push(next)
            next = next.down
          }

          return [next, visited]
        }
        else {
          // value <= next.value
          next = skip(next.prev === null ? next : next.prev)
        }
      }
      else {
        // this is the base level
        const diff = cmp(next.value)

        if (diff === 0)
          return [next, void 0]
        else if (diff < 0)
          return
        else
          next = next.next
      }
    }
  }

  list.has = value => list.search(next => cmp(value, next)) !== void 0
  list.search = cmp => {
    const result = findNode(cmp)
    return result === void 0 ? result : result[0].value
  }

  list.clear = () => {
    head.current = null
    tail.current = null
    size.current = 0
    levels.length = 0
  }

  delete list.append
  delete list.appendLeft
  delete list.insertAfter
  delete list.insertBefore
  delete list.reverse

  if (initialValues !== null && initialValues !== void 0)
    for (let value of initialValues)  list.insert(value)

  return list
}

export default skipList