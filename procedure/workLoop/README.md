```js
function workLoop(isYield) {
  // 这里要把每一个workInProgress作为参数
  // 然后在performUnitOfWork中生成下一个workInProgress
  // 直到没有workInProgress或者时间不够用了才退出
  if (!isYield) {
    // 如果不能暂停的话就一路solo下去
    while (!!nextUnitOfWork) {
      // 每个节点或者说每个react元素都是一个unit
      // 不管是真实dom节点还是class类或是函数节点
      nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
    }
  } else {
    // 如果isYield是true说明可能是用的异步渲染
    // 那每次都要判断是否还有剩余时间
    while (!!nextUnitOfWork && !shouldYieldToRenderer()) {
      nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
    }
  }
}
```