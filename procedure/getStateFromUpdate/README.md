```js
function getStateFromUpdate(workInProgress, queue, update, instance) {
  if (update.tag === UpdateState) {
    // 这个payload有可能是执行setState时候传进来的新的状态
    // 也有可能是初次渲染的时候传进来的那个element
    let payload = update.payload
    let partialState = null // partialState是部分state的意思
    let prevState = queue.baseState
    let nextProps = workInProgress.pendingProps
    if (typeof payload === 'function') {
      // setState时候可以传个函数
      // 传函数的话一定得有个返回值
      partialState = payload.call(instance, prevState, nextProps)
    } else {
      partialState = payload
    }
    // 如果payload不是函数的话说明要么传的是个对象 要么是初次渲染时候的{element}
    if (payload) {
      return Object.assign({}, prevState, partialState)
    } else {
      return prevState
    }
  }
}

```