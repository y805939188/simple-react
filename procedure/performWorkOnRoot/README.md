```js
function performWorkOnRoot(root, expirationTime, isYield) {
  isRendering = true // 上来要先告诉react目前在更新(创建)fiber阶段
  let finishedWork = root.finishedWork || null // 这个就是最终生成的fiber树 初始是null 并且每次commit完都要再置为null
  if (finishedWork) {
    // 如果有有finishedWork说明已经生成好了fiber树
    // 或者是在异步的状态下 上一帧生成好了fiber树但是没时间提交了 于是放到这一帧
    completeRoot(root, finishedWork, expirationTime)
  } else {
    renderRoot(root, isYield)
    if (!!root.finishedWork) {
      if ( !isYield || (isYield && shouldYieldToRenderer()) ) {
        // 在renderRoot中会给root挂上最终生成的这个finishedWork 也就是fiber树
        // 如果isYield是false说明优先级高 是同步的 所以就直接肛

        // 如果不是同步是异步的也就是说允许暂停的情况的话
        // 就通过shouldYieldToRenderer这个方法判断是否还有剩余时间来渲染
        // 有的话再渲染 没有的话就等下一帧再说
        completeRoot(root, root.finishedWork)
      }
    }
  }
  isRendering = false
}
```