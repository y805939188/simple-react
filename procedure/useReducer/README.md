```js
function useReducer(reducer, initialState, initialAction) {
  // 当在一个组件中连续调用多次useState时候
  // 每调用一次都会产生一个新的workInProgressHook
  // 但是会有个firstWorkInProgressHook上保存着每次创建的workInProgressHook这条链表
  workInProgressHook = createWorkInProgressHook()
  // 初次渲染时候这里的queue肯定是null
  // 而当执行了setXXX进入到这里时 queue上就有可能有值
  // queue上存储的就是执行setXXX时候传进来的update的那条链表
  let queue = workInProgressHook.queue

  if (!!queue) {
    if (isReRender) {
      // 一般在函数组件render阶段时调用了setXXX就有可能进入这里
    }

    let last = queue.last
    let first = queue.first
    let baseUpdate = workInProgressHook.baseUpdate
    if (!!baseUpdate) {

    }
    if (!!first) {
      let newState = workInProgressHook.baseState
      let newBaseState = null
      let newBaseUpdate = null
      let prevUpdate = baseUpdate
      let update = first
      // let didSkip = false
      do {
        // 每个更新和class组件更新一样 都有优先级
        let updateExpirationTime = update.expirationTime
        // renderExpirationTime 是在prepareToUseHooks方法中赋值的
        // 就是nextRenderExpirationTime
        if (updateExpirationTime < renderExpirationTime) {
          // 进入这里说明当前这个更新的优先级比较低 可以放到之后再更新
          // if (!didSkip) {
          //   // 这一小块在干嘛暂时不太理解它要干嘛
          //   // 应该是要记录下被跳过的更新的前一个更新和前一个state
          //   didSkip = true
          //   newBaseUpdate = prevUpdate
          //   newBaseState = newState
          // }
          // remainingExpirationTime是一个全局变量 只有这个useReducer中会给它赋值
          // 初始是NoWork
          if (updateExpirationTime > remainingExpirationTime) {
            // 进入这里说明当前这个更新可以暂时先被跳过
            // 同时将remainingExpirationTime这个全局变量
            // 赋值为所有被跳过的更新中优先级最高的那个
            remainingExpirationTime = updateExpirationTime
          }
        } else {
          // 进入这里说明当前update不能被跳过
          let action = update.action
          // 传进来的reducer就是下面这个方法
          // function basicStateReducer(state, action) {
          //   return typeof action === 'function' ? action(state) : action
          // }
          newState = reducer(newState, action)
          // 到这为止就已经生成了一个新的值了

          // 然后用当前update的next作为下一个要循环的update
          // 同时将当前这个update记录为上一个update
          prevUpdate = update
          update = update.next
        }
      } while (update !== null && update !== first)

      // if (!didSkip) {
      //   newBaseUpdate = prevUpdate
      //   newBaseState = newState
      // }
      newBaseUpdate = prevUpdate
      newBaseState = newState

      workInProgressHook.memoizedState = newState
      workInProgressHook.baseUpdate = newBaseUpdate
      workInProgressHook.baseState = newBaseState

      return [workInProgressHook.memoizedState, queue.dispatch]
    }
  }

  if (reducer === basicStateReducer) {
    // 在使用useState时候会内部调用useReducer
    // 然后会同时将basicStateReducer作为参数传进来
    // 所以暂时可以认为通过reducer和basicStateReducer是否相等来判断是否是执行的useState
    if (typeof initialState === 'function') {
      // 如果传进来的参数是个函数的话
      // 要获取到这个函数的返回值
      initialState = initialState()
    }
  } else {
    // 如果不是调用的useState进入到的这里的话
    // 那就像是一个正常的reducer使用那样
    // 有点类似于redux中的reducer
    initialState = reducer(initialState, initialAction)
  }
  workInProgressHook.memoizedState = initialState
  workInProgressHook.baseState = initialState
  queue = workInProgressHook.queue = {
    first: null,
    last: null,
    dispatch: null
  }
  queue.dispatch = dispatchAction.bind(null, currentlyRenderingFiber, queue)
  return [workInProgressHook.memoizedState, queue.dispatch]
}
```