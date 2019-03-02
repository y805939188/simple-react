```js
  enqueueSetState(instance, payload, callback) {
    // debugger
    /*
      执行setState时
      基数次更新时(1, 3, 5, ...)
      instance对应的fiber是current
      执行processUpdateQueue时fiber的updateQueue不会改变
      偶数次更新时(2, 4, 6, ...)
      instance对应的fiber是workInProgress
      执行processUpdateQueue时fiber的updateQueue会被操作
    */

    /*
      <Ding>
        <button></button>
        ...
      </Ding>

    |----------------------------------------------------------------------
    |
    |                   第一次commit前
    |           
    |           Root
    |             ↓
    |         RootFiber#① ←→ WorkInProgress#①
    |             ↓                 ↓
    |           null              Ding#①
    |             ↓                 ↓
    |          ...null             ...
    |
    |
    |
    |                  第一次commit后
    |           
    |                               Root
    |                                 ↓
    |         RootFiber#① ←→ WorkInProgress#①
    |              ↓                 ↓
    |            null              Ding#①
    |              ↓                 ↓
    |          ...null              ...
    |
    |
    |
    |-------------------------------------------------------------------
    |
    |
    |                   第二次commit前
    |           
    |                             Root
    |                               ↓
    |         RootFiber#① ←→ WorkInProgress#①
    |             ↓                 ↓
    |           null              Ding#①
    |             ↓                 ↓
    |          ...null             ...
    |
    |
    |
    |                       
    | 当执行到performWorkOnRoot时会调用createWorkInProgress参数是 WorkInProgress#①
    | createWorkInProgress中检测到WorkInProgress#①有值 是RootFiber#①
    | 于是直接把RootFiber#①拿来用作本次Root节点的WorkInProgress 并且child指向current的child
    | 也就是指向Ding#①
    |
    |                             Root
    |                               ↓
    |                        WorkInProgress#① ←→ RootFiber#①
    |                               ↓                 │ 
    |                             Ding#① ←————————————┙ 
    |                               ↓
    |                              ...
    |
    |
    |
    | 
    | 创建完本次更新的RootFiber的workInProgress后会继续往下调度子节点
    | 然后会发现本次RootFiber没有要更新的 于是执行bailoutOnAlreadyFinishedWork跳过本次更新
    | 在执行跳过更新的函数时 如果发现有子节点需要更新的话 就执行cloneChildFibers克隆子节点
    | 这个克隆子节点的方法中也是调用的createWorkInProgress
    | 此时发现Ding#①没有alternate 于是会新创建一个fiber对象
    |
    |                              Root
    |                               ↓
    |                        WorkInProgress#① ←→ RootFiber#①
    |                               ↓                 ↓
    |                             Ding#①   ←——————→  Ding#②
    |                               ↓                 │
    |                              ...  ←—————————————┙
    |
    |
    |
    |              第二次commit之后
    | 当本次更新commit之后 会让Root的current指向RootFiber#①
    |
    |                                               Root
    |                                                 ↓
    |                        WorkInProgress#① ←→ RootFiber#①
    |                               ↓                 ↓
    |                             Ding#①   ←——————→  Ding#②
    |                               ↓                 ↓
    |                              ...               ...
    |
    |
    |----------------------------------------------------------------------------
    |
    |
    |              第三次更新commit之前
    | 同样从performWorkOnRoot开始调度Root
    | 先对RootFiber#①执行createWorkInProgress 里面发现它有alternate指向WorkInProgress#①
    |
    |                                               Root
    |                                                 ↓
    |                        WorkInProgress#① ←→ RootFiber#①
    |                               ↓                 ↓
    |                             Ding#①   ←——————→  Ding#②
    |                               ↓                 ↓
    |                              ...               ...
    |
    | 
    | 于是让本次的RootFiber的workInProgress继续指向WorkInProgress#①
    | 变成下边这样
    | 此时虽然在createWorkInProgress中会将workInProgress#①的child初始化成current.child(RootFiber#①)
    | 但是Ding#②的alternate仍然指向Ding#①
    |
    |                                               Root
    |                                                 ↓
    |                                           RootFiber#① ←→ WorkInProgress#①
    |                                                 ↓               │
    |                             Ding#①  ←——————→  Ding#②  ←—————————┙
    |                                                 ↓
    |                                                ...
    |
    |
    | 之后继续往下执行 会和第二次一样 发现RootFiber上没有更新
    | 于是执行bailoutOnAlreadyFinishedWork跳过本次RootFiber的更新
    | 但是在bailoutOnAlreadyFinishedWork中会同样会执行cloneChildFibers
    | 这个函数中也会对本次RootFiber的WorkInProgress#①的子节点Ding#②进行createWorkInProgress
    | 然后同样发现Ding#②有个alternate指向Ding#① 于是乎不创建新的fiber而是复用alternate
    |
    |
    |                                               Root
    |                                                 ↓
    |                                           RootFiber#① ←→ WorkInProgress#①
    |                                                 ↓               ↓
    |                                               Ding#②  ←————→  Ding#①
    |                                                 ↓               │
    |                                                ...  ←———————————┙
    |
    |
    |
    |           第三次commit之后
    |
    | 当执行完commit的第二个循环后 dom节点已经都被渲染好了
    | 于是让root.current = finishedWork
    | finishedWork就是本次更新使用的Root的WorkInProgress
    | 也就是WorkInProgress#① 
    |
    |
    |
    |                                                               Root
    |                                                                 ↓
    |                                           RootFiber#① ←→ WorkInProgress#①
    |                                                 ↓               ↓
    |                                               Ding#②  ←————→  Ding#①
    |                                                 ↓               ↓
    |                                                ...             ...
    |
    |
    |-------------------------------------------------------------------
    |
    | 之后的setState更新逻辑就都一样了
    | 也就是说 初次渲染的时候 除了Root会有个RootFiber以及有个对应的workInProgress作为RootFiber的alternate
    | 剩下的节点都是只有workInProgress没有alternate的 也就是没有current
    | 然后当commit完 也就是都把dom渲染到了浏览器上了 就会让root.current指向本次的workInProgress
    |
    | 之后当某个组件第一次执行了setState的时候 上一轮的workInProgress就会作为本次的current
    | 并且由于是该组件第一次执行setState 所以本组件仍然是没有alternate的
    | 不过在执行跳过没有更新的组件或节点的时候 可能会对该组件执行createWorkInProgress
    | 会创建一个本组件本次更新要用到的workInProgress
    | 这样他就有了alternate链接上一次的workInProgress和这次的workInProgress
    | 最后当commit完之后 会再次让root.current指向本次的workInProgress
    |
    | 之后再对该组件执行setState的话 这个组件就有了alternate了
    | 于是createWorkInProgress中会复用这个组件的alterante
    | 
    | 这样就相当于每次在执行setState时 本次和上次的workInProgress都会交换一次
    | 虽然这次会复用上一次的workInProgress来作为本次的workInProgress 但是属性都是本次新的属性
    | 只不过对于对象的引用地址是没变的
    | 所以当获取实例的 _reactInternalFiber 属性时 每次都是可以获取到的
    |
    |
    |
    */
    // 先获取对应的fiber
    let fiber = instance._reactInternalFiber
    let currentTime = requestCurrentTime()
    let expirationTime = computeExpirationForFiber(currentTime, fiber)
    
    /*
      createUpdate 就是这个东西
      return {
        expirationTime: expirationTime, // 更新的优先级
        tag: UpdateState, // 对应四种情况 0更新(update) 1替换(replace) 2强更(force) 3捕获(capture; 就是渲染时候如果出错了就被捕获了)
        payload: null, // setState传进来的参数 也就是新的state
        callback: null,
        next: null, // 下一个update
        nextEffect: null, // 
      };
    */
    let update = createUpdate(expirationTime)
    // 然后把update上挂上payload payload就是setState的第一个参数
    update.payload = payload
    enqueueUpdate(fiber, update)
    scheduleWork(fiber, expirationTime)
  },
```