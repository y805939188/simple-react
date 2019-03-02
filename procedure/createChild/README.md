```js
 function createChild(returnFiber, newChild) {
  if (!newChild) return null
  let createdFiber = null
  if (typeof newChild === 'string' || typeof newChild === 'number') {
    createdFiber = createFiberFromText(String(newChild), returnFiber.mode)
  }
  if (newChild instanceof Object) {
    if (newChild.$$typeof === Symbol.for('react.element')) {
      createdFiber = createFiberFromElement(newChild, returnFiber.mode)
    }
  }
  createdFiber.ref = newChild.ref
  createdFiber.return = returnFiber
  return createdFiber
}

 
```