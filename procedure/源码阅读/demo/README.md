### 可以把这个demo放到script标签里跑一下，打打断点啥的。方便理解这个过程
```js
    let MyClass = {
      id: 1,
      child: null,
      sibling: null,
      return: null,
      children: null
    }
    let h1 = {
      id: 2,
      child: null,
      sibling: null,
      return: null,
      children: null,
      isFiber: false
    }
    let div = {
      id: 3,
      child: null,
      sibling: null,
      return: null,
      children: null,
      isFiber: false
    }
    let span = {
      id: 4,
      child: null,
      sibling: null,
      return: null,
      children: null,
      isFiber: false
    }
    let h2 = {
      id: 5,
      child: null,
      sibling: null,
      return: null,
      children: null,
      isFiber: false
    }
    let h3 = {
      id: 6,
      child: null,
      sibling: null,
      return: null,
      children: null,
      isFiber: false
    }
    // ！！！！！！fiber上没有children属性 我只是为了在beginWork中模拟而已
    Object.defineProperty(MyClass, 'child', { get: () => (h1) })
    Object.defineProperty(MyClass, 'children', { get: () => ([h1, div, span]) })
    Object.defineProperty(h1, 'sibling', { get: () => (div) })
    Object.defineProperty(h1, 'return', { get: () => (MyClass) })
    Object.defineProperty(div, 'child', { get: () => (h2) })
    Object.defineProperty(div, 'sibling', { get: () => (span) })
    Object.defineProperty(div, 'return', { get: () => (MyClass) })
    Object.defineProperty(div, 'children', { get: () => ([h2, h3]) })
    Object.defineProperty(span, 'return', { get: () => (MyClass) })
    Object.defineProperty(h2, 'sibling', { get: () => (h3) })
    Object.defineProperty(h2, 'return', { get: () => (div) })
    Object.defineProperty(h3, 'return', { get: () => (div) })

    function completeUnitOfWork(workInProgress) {
      while (true) {
        let siblingFiber = workInProgress.sibling
        let returnFiber = workInProgress.return
        if (!!siblingFiber) {
          return siblingFiber
        } else if (!!returnFiber) {
          workInProgress = returnFiber
          continue
        }
        return null
      }
    }
    function beginWork(workInProgress) {
      let next = null
      if (!workInProgress.isFiber) {
        console.log(workInProgress.id)
      }
      if (!!workInProgress.children) {
        // 如果workInProgress有过个子节点的话
        // 要对它下的子节点都创建一个fiber
        // 注意只创建子节点的fiber 不创建孙子节点及一下的fiber
        // fiber上没有children属性 我只是为了在beginWork中模拟而已
        workInProgress.children.forEach((item, index) => {
          if (!item.isFiber) {
            console.log(item.id)
            item.isFiber = true
          }
          if (index === 0) next = item
        })
      } else {
        next = workInProgress.child
      }
      return next
    }
    function performUnitOfWork(workInProgress) {
      let next = beginWork(workInProgress)
      if (next === null) {
        next = completeUnitOfWork(workInProgress)
      }
      return next
    }
    function workLoop(nextUnitOfWork) {
      while (!!nextUnitOfWork) {
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
      }
    }
    workLoop(MyClass)

```