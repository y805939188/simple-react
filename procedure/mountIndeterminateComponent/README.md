```js
function mountIndeterminateComponent(workInProgress) {
  // 一般来讲 在初次渲染时除了RootFiber 剩下的节点都没有alternate
  let props = workInProgress.pendingProps
  let value = workInProgress.type(props)
  // react源码中这里判断了返回值是否是对象并且是否有render方法
  // 如果有的话就把这个返回对象当成一个class类来处理
  // 也就是说如果函数返回类似 { render: function(){} }
  // 这样的类型react也能处理 当成class处理 同样的里头写的周期方法也能执行
  // 不过我觉得这玩意儿吧, 可以, 但没必要 哪儿有人这么写呀
  // 所以我这儿也就不写了

  // 直接给它当成Function类型的
  workInProgress.tag = FunctionComponent
  return reconcileChildren(workInProgress, value)
}
```