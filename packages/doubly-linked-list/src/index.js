import {
  linkedList,
  insertNode as insertNode_,
  removeNode as removeNode_,
  append,
  appendLeft,
  insertAfter,
  insertBefore,
  remove,
} from '@data-structs/linked-list'


export const insertNode = (left = null, value, right = null) => {
  const node = insertNode_(left, value, right)
  node.prev = null

  if (right !== null) {
    node.prev = right.prev
    right.prev = node

    if (left === null && node.prev !== null)
      node.prev.next = node
  }

  if (left !== null) {
    node.prev = left

    if (right === null && node.next !== null)
      node.next.prev = node
  }

  return node
}

export const removeNode = (left = null, node, right = null) => {
  removeNode_(left, node)

  if (right !== null) {
    right.prev = node.prev
  }
  else if (left !== null) {
    if (left.next !== null)
      left.next.prev = node.prev
  }
  else {
    if (node.next !== null)
      node.next.prev = node.prev
    if (node.prev !== null)
      node.prev.next = node.next
  }
}

export const iterLeft = (tail, prop) => {
  let prev = tail

  return {
    next () {
      if (prev === null)
        return {value: void 0, done: true}

      let result = {value: prop === void 0 ? prev : prev[prop], done: false}
      prev = prev.prev
      return result
    },
    [Symbol.iterator] () { return this }
  }
}

export const doublyLinkedList = initialValues => {
  const
    list = linkedList(),
    head = list.___head,
    tail = list.___tail
  
  list.append = append(list, insertNode)
  list.appendLeft = appendLeft(list, insertNode)
  list.insertAfter = insertAfter(list, insertNode)
  list.insertBefore = insertBefore(list, insertNode)
  list.remove = remove(list, removeNode)
  list.reverse = () => {
    for (let item of iterLeft(tail.current)) {
      const prev = item.next
      item.next = item.prev
      item.prev = prev
    }

    const head_ = head.current
    head.current = tail.current
    tail.current = head_
  }
  list.forEachLeft = fn => { for (let item of iterLeft(tail.current, 'value')) fn(item) }
  list.mapLeft = fn => {
    const nextList = linkedList()

    for (let item of iterLeft(tail.current, 'value'))
      nextList.append(fn(item))

    return nextList
  }

  if (initialValues !== null && initialValues !== void 0)
    for (let value of initialValues)  list.append(value)

  return list
}

export default doublyLinkedList