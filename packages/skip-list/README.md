# @data-structs/skip-list
A generalized self-balancing skip list implemented in Javascript. You
can insert any value types you wish so long as you provide your own
comparator function. The default comparator is `(a, b) => a -b` which
only allows for numeric comparisons.

The algorithm for level-selection is more predictably balanced than a
traditional coin-flip model while maintaining an element of randomness
in selections. This is accomplished by randomly selecting levels where
the expected number of elements is fewer than the actual number of
elements in that level. The expected number of elements for a level is
calculated using `Math.floor((2**(-1 * level)) * n)` which ensures each
subsequent level has half as many elements as its predecessor, providing
O(log n) insertions and searches with high probability.

## Installation
`yarn add @data-structs/skip-list`

## Usage
```js
import skipList from '@data-structs/skip-list'

const mySkipList = skipList(
  Array.from(Array(16), () => Math.floor(Math.random() * (16 * 2)))
)

skipList.insert(196)
```

## Implementation details
```
[3] Sentinel ->                                                948
[2] Sentinel ->                    545 <>                      948
[1] Sentinel ->             302 <> 545 <>               926 <> 948 
[0]            32 <> 218 <> 302 <> 545 <> 840 <> 855 <> 926 <> 948
```
-  All levels are implemented using doubly-linked lists
- `O(1)` insert at head + tail
  - Ultra-fast inserts when the inserted value is certainly less than or
    equal to the head or certainly greater than or equal to the tail
- `O(log n)` insert with high probability at mid
- `O(1)` remove at head + tail
  - Ultra-fast inserts when the removed value is certainly the head
    or certainly the tail
- `O(log n)` remove at mid
- `O(log n)` search with high probability
- `O(1)` search bailout when value is certainly less than the head value
  or certainly greater than the tail value

