```js
function applyDerivedStateFromProps(workInProgress, getDerivedStateFromProps, nextProps) {
  let prevState = workInProgress.memoizedState
  let partialState = getDerivedStateFromProps(nextProps, prevState) || {}
  let memoizedState = Object.assign({}, prevState, partialState)
  workInProgress.memoizedState = memoizedState
}
```