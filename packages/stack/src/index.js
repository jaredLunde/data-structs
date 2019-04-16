import list from '@data-structs/linked-list'


const stack = initialStack => {
  const s = list(initialStack)

  return {
    get size () { return s.size },
    peek: s.peek,
    push: s.append,
    pop: s.pop,
    map: s.map,
    has: s.has,
    forEach: s.forEach,
    copy: () => stack(s),
    [Symbol.iterator]: s[Symbol.iterator],
    toJSON: s.toJSON,
    toString: s.toString
  }
}

export default stack