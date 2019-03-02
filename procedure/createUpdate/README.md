```js
 function createUpdate(expirationTime) {
  return {
    expirationTime: expirationTime, // 该更新的优先级
    tag: UpdateState, // tag表示这个更新的类型
    payload: null, // 初次渲染时表示要更新的元素 执行setState时 它是传进来的新的state
    callback: null,
    next: null,
    nextEffect: null // 下一个update对应的fiber
  }
}
 
```