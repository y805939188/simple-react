```js
 // resetChildExpirationTime主要作用是用来更新childExpirationTime的
// 因为假设当同时有两个子树都产生了更新
// 其中一个优先级高 另一个优先级低一点
// 更新完优先级高的那个 如果不修改这个childExpirationTime的话 就更新不到优先级低的那个了
function resetChildExpirationTime(workInProgress) {
  let child = workInProgress.child
  let newChildExpirationTime = NoWork
  while (!!child) {
    let childUpdateExpirationTime = child.expirationTime
    let childChildExpirationTime = child.childExpirationTime
    if (childUpdateExpirationTime > newChildExpirationTime) {
      newChildExpirationTime = childUpdateExpirationTime
    }
    if (childChildExpirationTime > newChildExpirationTime) {
      newChildExpirationTime = childChildExpirationTime
    }
    child = child.sibling
  }
  workInProgress.childExpirationTime = newChildExpirationTime
}
 
```