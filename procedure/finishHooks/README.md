```js
export function finishHooks(children) {
  // 获取到当前正在render的这个函数组件
  let renderedWork = currentlyRenderingFiber
  renderedWork.memoizedState = firstWorkInProgressHook

  // remainingExpirationTime也是个全局变量 但是只有在函数组件中使用了hooks
  // 才会给它赋值 其他react的正常逻辑中不会用到这个变量
  // useReducer中判断是否要跳过当前更新时会给它赋值
  // renderedWork.expirationTime = remainingExpirationTime
  // componentUpdateQueue也是个全局变量
  // 在调用useEffect时候会执行一个pushEffect的方法
  // 里面会给这个componentUpdateQueue赋值
  // renderedWork.updateQueue = componentUpdateQueue

  // 下边这仨是在prepareToUseHooks中赋值的全局变量
  // renderExpirationTime赋值时是等于nextRenderExpirationTime
  // currentlyRenderingFiber赋值时就是当前正在render的函数组件
  // firstCurrentHook赋值时就是current.memoizedState
  renderExpirationTime = NoWork
  currentlyRenderingFiber = null
  firstCurrentHook = null

  // currentHook是在createWorkInProgressHook中赋值的
  currentHook = null
  // firstWorkInProgressHook就是本次执行该函数组件得到的所有的hooks
  // 已经在上面被保存在fiber.memoizedState上了
  firstWorkInProgressHook = null
  // workInProgressHook是每次执行useXXX产生的hook
  workInProgressHook = null
  // remainingExpirationTime = NoWork
  // componentUpdateQueue = null

  return children
}
```