```js
function constructorClassInstance(workInProgress, nextProps, component) {
  let context = null
  let instance = new component(nextProps, context)
  workInProgress.memoizedState = instance.state || null
  cc(workInProgress, instance)
  return instance
}
```