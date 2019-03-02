```js
function updateContextConsumer(workInProgress) {
  let context = workInProgress.type._context
  let newProps = workInProgress.pendingProps
  let render = newProps.children
  if (typeof render !== 'function') return null
  let contextItem = {
    context,
  }
  // firstContextDependency暂时没啥用
  workInProgress.firstContextDependency = contextItem
  let newValue = context._currentValue
  let newChildren = render(newValue)
  return reconcileChildren(workInProgress, newChildren)
}

```