```js
 function diffAndUpdateHostComponent(workInProgress, instance, type, newProps) {
  let current = workInProgress.alternate
  let oldProps = workInProgress.alternate.memoizedProps
  if (oldProps === newProps) return

  // 在prepareUpdate中要对比两次dom的各种属性
  // 然后产生一个新的数组
  let updatePayload = prepareUpdate(instance, type, newProps, oldProps)
  workInProgress.updateQueue = updatePayload
  if (!!updatePayload) workInProgress.effectTag |= Update
}
 
```