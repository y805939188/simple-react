```js
function reconcileChildren(workInProgress, newChild) {
  // 初次渲染时 只有第一个RootFiber有current
  // 其他任何字节点都没有 都走mountChildFibers
  let current = workInProgress.alternate
  // 是不是Mount的区别是
  // mount阶段在后面会给fiber的effectTag一个Placement
  let isMount = !!current ? false : true
  if (!!current) {
    workInProgress.child = reconcileChildFibers(workInProgress, newChild, isMount)
  } else {
    workInProgress.child = reconcileChildFibers(workInProgress, newChild, isMount)
  }
  return workInProgress.child
}
```