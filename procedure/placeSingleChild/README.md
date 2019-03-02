```js
 
function placeSingleChild(newFiber, isMount) {
  if (!isMount && !newFiber.alternate) {
    newFiber.effectTag = Placement
  }
  return newFiber
}
 
```