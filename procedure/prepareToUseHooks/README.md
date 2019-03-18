```js
export function prepareToUseHooks(workInProgress, nextRenderExpirationTime) {
  let current = workInProgress.alternate
  renderExpirationTime = nextRenderExpirationTime
  currentlyRenderingFiber = workInProgress
  // 对于函数组件来讲
  // 由于不知道在函数中会调用几次hooks对应的api
  // 所以通过链表的形式来记录每次调用hooks时对应的对象
  // 所以这个memoizedState就是用来记录hooks们的链表
  firstCurrentHook = !!current ? current.memoizedState : null
}

```