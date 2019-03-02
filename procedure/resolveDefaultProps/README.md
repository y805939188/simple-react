```js
function resolveDefaultProps(workInProgress) {
  let pendingProps = workInProgress.pendingProps
  let component = workInProgress.type
  let defaultProps = component.defaultProps
  let resolvedProps = pendingProps
  if (defaultProps && defaultProps instanceof Object) {
    resolvedProps = Object.assign({}, defaultProps, pendingProps)
  }
  return resolvedProps
}
```