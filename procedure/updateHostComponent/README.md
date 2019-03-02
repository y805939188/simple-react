```js
function updateHostComponent(workInProgress) {
  let nextProps = workInProgress.pendingProps // 获取属性 就是ReactElement方法的第二个参数
  let nextChildren = nextProps.children
  if (typeof nextChildren === 'string' || typeof nextChildren === 'number') {
    nextChildren = null
  }
  // 如果有ref或者ref更新了就给他设置上Ref
  markRef(workInProgress)
  return reconcileChildren(workInProgress, nextChildren)
}
```