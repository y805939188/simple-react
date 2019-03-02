```js
function updateHostText(workInProgress) {
  // 更新文本节点的话返回null就可以
  // 这样就会回退到beginWork中
  // 然后就会执行completeWork 相当于更新完了一侧的子树
  // 之后completeWork会更新每个父节点上的effect链表
  // 之后往上遍历找到最近的父元素的兄弟元素继续更新fiber
  return null
}
```