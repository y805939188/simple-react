```js
 function detachFiber(fiber) {
  fiber.return = null
  fiber.child = null
  fiber.memoizedState = null
  fiber.updateQueue = null
  let alternate = fiber.alternate
  if (!!alternate) {
    alternate.return = null
    alternate.child = null
    alternate.memoizedState = null
    alternate.updateQueue = null
  }
}
 
```