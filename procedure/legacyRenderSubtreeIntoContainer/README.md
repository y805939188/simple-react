```js
function legacyRenderSubtreeIntoContainer(parentComponent, children, container, forceHydrate, callback) {
  // 这个_reactRootContainer就是FiberRoot
  // 第一次肯定是undefined
  let root = container._reactRootContainer
  if (!root) {
    // 第二个参数是 isConcurrent 表示是否是异步渲染
    // 初次渲染肯定是false
    // react源码中还要传个是否是服务端渲染
    // 这个isConcurrent表示不使用异步渲染
    // 因为初次渲染时是一定要同步更新的 所以这里要默认状态是false
    let isConcurrent = false
    // 就是这里创建了一个Root作为React应用的根儿
    // 然后在创建Root的同时还顺便创建了一个未初始化的RootFiber
    root = container._reactRootContainer = new ReactRoot(container, isConcurrent)

    // 这里要检查callback
    // ...
    
    // 这个unbatchedUpdates啥也没干
    // 只是改了个全局变量 告诉react不要批量更新
    // 批量更新会在同时执行多个异步的时候用到 比如同时执行了好几个setTimeout
    unbatchedUpdates(function () {
      root.render(children, callback)
    })
  }
}

```