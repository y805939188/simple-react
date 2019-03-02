```js
 
function useFiber(toBeCloneFiber, pendingProps) {
  let clonedFiber = createWorkInProgress(toBeCloneFiber, pendingProps)
  // 如果当前这个fiber没有兄弟节点 也就是说它的父节点只有它一个子节点的情况时候
  // 就不需要使用index做对比算法
  // 基本上只有在父节点存在多个子元素的情况下才需要index
  // 这里把克隆出来的fiber的index置为0
  // 在处理array类型的子元素时还会对index根据循环进行赋值的
  clonedFiber.index = 0
  clonedFiber.sibling = null
  return clonedFiber
}
 
```