export const insertNode = (left = null, value, right = null) => {
  const node = {value, next: null}

  if (left !== null) {
    node.next = left.next
    left.next = node
  }

  if (right !== null)
    node.next = right

  return node
}

export const removeNode = (left = null, node) => {
  if (left !== null)
    left.next = node.next
}

export const iter = (head, prop) => {
  let next = head

  return {
    next () {
      if (next === null)
        return {value: void 0, done: true}

      let result = {value: prop === void 0 ? next : next[prop], done: false}
      next = next.next
      return result
    },
    [Symbol.iterator] () { return this }
  }
}

export const append = (list, insertNode) => {
  const head = list.___head, tail = list.___tail, size = list.___size
  const stackSafeAppend = value => {
    tail.current = insertNode(tail.current, value)

    if (head.current === null)
      head.current = tail.current

    ++size.current
  }

  return function append_ () {
    stackSafeAppend(arguments[0])
    // we get quicker singular inserts by lazy loading this loop
    if (arguments.length > 1)
      for (let i = 1; i < arguments.length; i++) stackSafeAppend(arguments[i])

    return size.current
  }
}

export const appendLeft = (list, insertNode) => {
  const head = list.___head, tail = list.___tail, size = list.___size
  const stackSafeAppendLeft = value => {
    head.current = insertNode(null, value, head.current)

    if (tail.current === null)
      tail.current = head.current

    ++size.current
  }

  return function appendLeft_ () {
    stackSafeAppendLeft(arguments[0])
    // we get quicker singular inserts by lazy loading this loop
    if (arguments.length > 1)
      for (let i = 1; i < arguments.length; i++) stackSafeAppendLeft(arguments[i])

    return size.current
  }
}

export const insertAfter = (list, insertNode) => {
  const head = list.___head, tail = list.___tail, size = list.___size

  return function insertAfter_ (afterValue, value, afterLast) {
    let afterNode = null

    for (let next of iter(head.current)) {
      if (next.value === afterValue) {
        afterNode = next
        if (afterLast !== true) break
      }
    }

    if (afterNode === null)
      throw new Error(`Value was not found in list: ${afterValue}`)

    const node = insertNode(afterNode, value)

    if (afterNode === tail.current)
      tail.current = node

    return ++size.current
  }
}

export const insertBefore = (list, insertNode) => {
  const head = list.___head, size = list.___size

  return function insertBefore_ (beforeValue, value, beforeLast) {
    let leftNode = null, rightNode = null, prev = null

    for (let next of iter(head.current)) {
      if (next.value === beforeValue) {
        leftNode = prev
        rightNode = next
        if (beforeLast !== true) break
      }

      prev = next
    }

    if (rightNode === null)
      throw new Error(`Value was not found in list: ${beforeValue}`)

    const node = insertNode(leftNode, value)

    if (leftNode === null)
      head.current = node

    return ++size.current
  }
}

export const remove = (list, removeNode) => {
  const head = list.___head, tail = list.___tail, size = list.___size

  return function remove_ (value, all) {
    let prev = null

    for (let next of iter(head.current)) {
      if (next.value === value) {
        removeNode(prev, next)

        if (prev === null)
          head.current = next.next

        if (next === tail.current)
          tail.current = prev

        size.current--

        if (all !== true) break
      }
      else {
        prev = next
      }
    }

    return size.current
  }
}

export const ref = (v = null) => ({current: v})

export const linkedList = initialValues => {
  let size = ref(0), head = ref(), tail = ref()

  const list = {
    get size () { return size.current },
    peek () { return tail.current && tail.current.value },
    peekLeft () { return head.current && head.current.value },
    pop () {
      if (size.current === 0) return
      const result = tail.current.value, prev = tail.current

      for (let item of iter(head.current))
        if (prev !== item)
          tail.current = item

      tail.current.next = null
      size.current--

      if (size.current === 0) {
        head.current = null
        tail.current = null
      }

      return result
    },
    popLeft () {
      if (size.current === 0) return
      const result = head.current.value
      list.remove(result)
      return result
    },
    has (value) {
      for (let item of iter(head.current))
        if (item.value === value)
          return true

      return false
    },
    clear ()  {
      head.current = null
      tail.current = null
      size.current = 0
      return size.current
    },
    copy: () => linkedList(list),
    forEach (fn) { for (let item of list) fn(item) },
    map (fn) {
      const nextList = linkedList()

      for (let item of list)
        nextList.append(fn(item))

      return nextList
    },
    toJSON: () => [...list],
    toString: () => JSON.stringify(list),
    [Symbol.iterator] () { return iter(head.current, 'value') }
  }

  Object.defineProperties(
    list,
    {
      ___head: {value: head, writable: false},
      ___tail: {value: tail, writable: false},
      ___size: {value: size, writable: false},
    }
  )

  list.append = append(list, insertNode)
  list.appendLeft = appendLeft(list, insertNode)
  list.insertAfter = insertAfter(list, insertNode)
  list.insertBefore = insertBefore(list, insertNode)
  list.remove = remove(list, removeNode)

  if (initialValues !== null && initialValues !== void 0)
    for (let value of initialValues)  list.append(value)

  return list
}

export default linkedList