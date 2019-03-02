```js
 function interactiveUpdates(fn, eventName, event) {
  // isBatchingInteractiveUpdates 初始是false
  // 只有在这个函数中才会改变isBatchingInteractiveUpdates
  if (isBatchingInteractiveUpdates) {
    return fn(eventName, event)
  }
  // 记录下当前的isBatchingInteractiveUpdates和isBatchingUpdates的值
  let previousIsBatchingInteractiveUpdates = isBatchingInteractiveUpdates
  let previousIsBatchingUpdates = isBatchingUpdates
  // 都置为true 用来在后面执行setState时候先不render和commit
  isBatchingInteractiveUpdates = true
  isBatchingUpdates = true
  try {
    return fn(eventName, event)
  } finally {
    // 把状态置回原来的
    isBatchingInteractiveUpdates = previousIsBatchingInteractiveUpdates
    isBatchingUpdates = previousIsBatchingUpdates
    if (!isBatchingUpdates && !isRendering) {
      performSyncWork()
    }
  }
}
 
```