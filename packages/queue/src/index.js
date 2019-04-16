import list from '@data-structs/linked-list'


const queue = initialQueue => {
  const q = list(initialQueue)

  return {
    get size () { return q.size },
    peek: q.peekLeft,
    enqueue: q.append,
    dequeue: q.popLeft,
    has: q.has,
    map: q.map,
    forEach: q.forEach,
    copy: () => queue(q),
    [Symbol.iterator]: q[Symbol.iterator],
    toJSON: q.toJSON,
    toString: q.toString
  }
}

export default queue