```js
function updateFunctionComponent(workInProgress) {
  prepareToUseHooks(workInProgress, nextRenderExpirationTime)

  let component = workInProgress.type
  let nextChildren = component(workInProgress.pendingProps)
  nextChildren = finishHooks(nextChildren) // 用来处理hooks
  reconcileChildren(workInProgress, nextChildren)
  return workInProgress.child
}
```