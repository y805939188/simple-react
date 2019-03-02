```js
 function commitWork(finishedWork) {
  let tag = finishedWork.tag
  let instance = finishedWork.stateNode

  // 基本上只要原生dom节点或文本节点可以有Update类型
  // react源码中还有suspense组件也可以
  if (tag === HostComponent) {
    if (!!instance) {
      commitUpdate(instance, finishedWork)
    }
  } else if (tag === HostText) {
    if (!!instance) {
      instance.nodeValue = finishedWork.memoizedProps
    }
  }
}
 
```