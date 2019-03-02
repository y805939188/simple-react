```js
 function unbatchedUpdates(fn, a) {
  // a 表示参数
  if (isBatchingUpdates && !isUnbatchingUpdates) {
    // 这里是告诉全局 不进行批量更新
    // 初次渲染时候不会走到这里
    isUnbatchingUpdates = true;
    try {
      return fn(a);
    } finally {
      isUnbatchingUpdates = false;
    }
  }
  // 初次渲染会直接走到这里 这个函数就是 root.render
  return fn(a);
}
 
```