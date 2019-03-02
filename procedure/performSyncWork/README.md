```js
function performSyncWork(root) {
  // 同步更新的情况下只干了一件事就是调用performWork
  // 第一个参数是表示优先级是同步的最高优先级
  // 第二个参数禁止yield也就是不能暂停 从头到尾一把梭
  performWork(Sync, false)
}
```