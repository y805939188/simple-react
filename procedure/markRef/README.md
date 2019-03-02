```js
 function markRef(workInProgress) {
  let newRef = workInProgress.ref
  let current = workInProgress.alternate
  if (!!newRef) {
    if (!current) {
      // 说明是初次渲染
      // 要给他个Ref
      workInProgress.effectTag |= Ref
    } else if (!!current && current.ref !== newRef) {
      // 进到这里说明不是初次渲染
      // 但是本次更新的ref和上一次的不一样
      // 也要给他设置Ref
      workInProgress.effectTag |= Ref
    }
  }
}
 
```