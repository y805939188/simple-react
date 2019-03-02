```js
function adoptClassInstance(workInProgress, instance) {
  // 该方法先让Component构造函数中的this.updater = classComponentUpdater
  // classComponentUpdater就是那个有enqueueSetState等方法的那个对象
  // 也就是说根据平台不一样 这个updater是可能发生改变的 浏览器下肯定就是react-dom中的classComponentUpdater
  instance.updater = classComponentUpdater
  // 之后给当前class对应的fiber创建实例
  workInProgress.stateNode = instance
  // 这一步是为了以后在更新时可以方便的找到这个类对应的fiber
  // 在组件中可以通过this._reactInternalFiber拿到对应fiber
  // 在enqueueSetState中执行的 fiber = get(instance) 就是这么获取的
  instance._reactInternalFiber = workInProgress
}
```