```js
 function deleteChild(returnFiber, toBeDeleteChild) {
  // 这里不会真的删除某个节点
  // 像删除节点这种操作是在后面的commit阶段去做的
  // 所以这里只是单纯的把这个节点自身置为Deletion就可以了
  toBeDeleteChild.effectTag = Deletion
  // 然后把这个要被删除的子节点的父节点(return)上的effect链更新一下
  let last = returnFiber.lastEffect
  if (!!last) {
    last.nextEffect = toBeDeleteChild
    returnFiber.lastEffect = toBeDeleteChild
  } else {
    returnFiber.firstEffect = returnFiber.lastEffect = toBeDeleteChild
  }
  // 之后由于这个节点都要被删除了 所以它自己的子节点们就没有必要更新
  toBeDeleteChild.nextEffect = null
}
 
```