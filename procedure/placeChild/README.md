```js
 function placeChild(newFiber, lastPlacedIndex, newIndex, isMount) {
  newFiber.index = newIndex
  if (isMount) {
    // 初次渲染传会进这里
    return lastPlacedIndex
  }
  // 有current的话 说明他的current应该已经被挂载过了
  // 没有的话说明这个fiber应该是新创建的 本次要让它Placement
  const current = newFiber.alternate
  if (current !== null) {
    const oldIndex = current.index
    if (oldIndex < lastPlacedIndex) {
      // 比如说前面已经有俩要被新插入的节点了
      // 这个lastPlacedIndex是2 但是当前遍历到的这个节点
      // 的oldIndex是1的话 那当前这个节点应该被放到3的位置
      newFiber.effectTag = Placement
      return lastPlacedIndex
    } else {
      return oldIndex
    }
  } else {
    // 进入这里说明是一个新创建的fiber
    // 要把这个新的fiber放置到dom上
    newFiber.effectTag = Placement
    return lastPlacedIndex
  }
}

 
```