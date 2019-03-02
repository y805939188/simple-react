```js
 function propagateContextChange(workInProgress) {
  // 这里要往下找 直到找到Consumer组件
  // 不过注意这个Consumer组件也有可能是新添加的
  // 也就是说 如果找到的Consumer是上一轮就有的 那么这个Consumer会有dependency
  // 反之如果是本次新产生的则没有
}
 
```