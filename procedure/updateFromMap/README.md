```js
 function updateFromMap(existingChildren, returnFiber, newIdx, newChild, expirationTime) {
  if (typeof newChild === 'string' || typeof newChild === 'number') {
    const matchedFiber = existingChildren.get(newIdx) || null
    return updateTextNode(returnFiber, matchedFiber, '' + newChild, expirationTime)
  }
  if (typeof newChild === 'object' && newChild !== null) {
    switch (newChild.$$typeof) {
      case REACT_ELEMENT_TYPE: {
        const matchedFiber =
          existingChildren.get(newChild.key === null ? newIdx : newChild.key) || null
        return updateElement(
          returnFiber,
          matchedFiber,
          newChild,
          expirationTime,
        )
      }
    }
  }
  return null
}
 
```