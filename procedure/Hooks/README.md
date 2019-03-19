```js
// useEffect 和 useLayoutEffect 的区别
// 主要就是useEffect给当前函数的fiber添加上了
// UpdateEffect | PassiveEffect这两个effectTag
// 而useLayoutEffect则是只给fiber添加 UpdateEffect
// 如果前后两次的值一样的话 就会给fiber添加 NoHookEffect

// 之后给本次的effect创建一个对应的独立的effect
// 然后会再创建一条componentUpdateQueue挂到这个函数fiber上
// 再然后commit阶段会执行commitLifeCycles

// commitLifeCycles中会先获取到上面创建的那条updateQueue
// 然后遍历这条链表 看每个effect上是否有unmount的标识
// 如果有就调用destroy对应的回调 destroy就是在useEffect中return的方法
// 然后再判断是否有mount的标识 如果有的话就调用create create就是useEffect
// 中传进来的那个方法
// 重点是unmount的标识和mount的标识 这俩都是commitLifeCycles的参数
// commitLifeCycles这个方法在不同地方被调用的时候 传进来的参数也不同

// 首先在commit阶段第一个循环中执行snapshot这个周期时
// 如果fiber是simpleMemoComponent类型的话会调用commitLifeCycles
// 这个时候unmount和mount对应的分别是unmountSnapshot和NoHookEffect
// 也就是说这种情况下不会执行任何的effect

// 然后是第二个循环 第二个循环中根据fiber的不同标识
// 有Update类型的会执行commitWork
// commitWork中对于simpleMemoComponent类型
// 会执行commitHookEffectList
// 这个时候传进去的unmount和mount分别对应 UnmountMutation 和 MountMuTation
// 所以这个时候对于useLayoutEffect会执行destroy而不会执行create的方法

// 最后第三个循环 会执行commitLifeCycles这个方法
// 这个时候执行的commitHookEffectList会传入UnmountLayout和MountLayout
// 由于最上面只有useLayoutEffect方法会有MountLayout标识
// 所以这个时候只会执行useLayoutEffect的create方法
// 所以说!!!!!!!useLayoutEffect和componentDidUpdate或componentDidMount更像
// 因为在处理ClassComponet时 componentDidUpdate和componentDidMount也是这个时间执行

// 所以在commit阶段 只会对useLayoutEffect进行一些处理执行
// 而useEffect 则会在一个叫做commitPassiveEffects的方法中执行
// commitPassiveEffects方法会在commit阶段执行完三个循环之后
// 会被作为callback给bind咯
// 进入这段逻辑的关键是有一个叫做rootWithPendingPassiveEffects的变量

// rootWithPendingPassiveEffects是谁呢
// 在执行useEffect时候 会给fiber挂上 PassiveEffect
// 而在commit阶段的第三个循环 也就是提交声明周期的那个方法中
// 会判断fiber上是否有Passive这个effectTag
// 如果有的话就让rootWithPendingPassiveEffects置为当前这个fiber

// 至于绑定的那个callback 会被bind上俩参数 一个root 一个firstEffect
// 之后会把这个callback作为参数传给Schedule_scheduleCallback
// 也就是Concurrent模式下会用到的那些异步方法
// 也就是说至少要等到所有的dom都被更新了之后 才会去执行到这个异步的方法
// 也就是这个commitPassiveEffects

// commitPassiveEffects方法中呢 会从firstEffect开始循环
// 然后找到所有带有Passive的fiber
// 然后对所有带有Passive的都执行commitPassiveHookEffects这个方法
// 这个方法中就执行了和useLayoutEffect一样的commitHookEffectList
// 并且执行两次 第一次unmount和mount对应的分别是UnmountPassive和NoHookEffect
// 也就是说第一次只执行useEffect的destroy方法
// 第二次执行则传进去的是NoHookEffect和MountPassive
// 也就是说第二次只执行useEffect对应的create的方法


// 所以useEffect和useLayoutEffect的区别就是
// useLayoutEffect会在当前commit阶段就执行destroy和create
// 而useEffect会以异步的方式 等到这次所有的渲染后完成之后才会执行destroy和create
// 换句话说 useEffect不会阻塞或影响dom的渲染
// 而useLayoutEffect如果在里头又执行了dom相关的操作或者useState之类的话
// 也是会阻塞或影响dom的渲染的 因为是完全以同步的过程去处理的

// useLayoutEffect几乎可以说是约等于componentDidMount和componentDidUpdate
// useEffect的性能要更高一点 因为直接放到异步中了


// 注意!!!!虽然说 在commit阶段 是在 SimpleMemoComponent的类型中
// 执行的commitHookEffectList
// 但是由于switch条件的特性
// FunctionComponent被写在了第一位 向下面这样:
/*
  switch(tag) {
    FunctionComponent:
    ForwardRef:
    MemoComponent:
    SimpleMemoComponent:
    xxx
  }
*/
// 也就是说 tag 不管是FunctionComponent类型
// 还是ForwardRef类型
// 亦或是MemoComponent类型
// 以及SimpleMemoComponent类型
// 最后都会走commitHookEffectList的逻辑




// useContext 就是直接return一个readContext
// 和ClassComponent中的一样

// useRef 就是内部获取(或创建)workInProgressHook之后
// 看它上面是不是有memoizedState 如果没有的话
// 直接创建一个 ref = {current: initialValue(这个就是传进来的参数)}
// 并workInProgressHook.memoizedState = ref
// 之后再执行到useRef之后 如果workInProgressHook上有memoizedState的话
// 那就直接获取这个memoizedState的值 也就是这个ref
// 所以其实不一定非得是ref 获取到的东西其实就是一个对象 有个current属性
// useRef就是单纯地记录一个对象而已

// useImperativeMethods这个hook 接收仨参数
// 第一个是ref 第二个是回调函数create 第三个是数组inputs
// 第二个和第三个参数和useEffect中的俩参数作用差不多
// 这个hook主要就是调用了
// useLayoutEffect(() => {
//   这里执行传进来的create获取一个返回值
//   然后判断ref是函数还是对象
//   如果是函数就把create返回值传进ref这个函数 如果不是函数
//   就把create的返回值作为ref这个对象的current属性上
// }, [inputs, ref, create])

// useCallback 内部也是先获取(或创建)对应的workInProgressHook
// 然后useCallback接收俩参数 一个callback 一个inputs
// 第一次让 workInProgressHook.memoizedState = [callback, inputs]
// 之后再执行useCallback的时候 会从workInProgressHook的memoizedState上
// 获取到上一次的[callback, inputs]
// 然后对上一次的inputs和本次传进来的inputs做浅对比
// 一样的话就把上一次的callback返回
// 不一样的话就用本次的俩参数 [newCallback, newInputs]
// 重新赋值给workInProgressHook.memoizedState
// 最后return callback

// useMemo 接收俩参数 第一个是一个函数 create 第二个是inputs
// 具体实现几乎和useCallback一样
// 只不过往workInProgressHook.memoizedState上存储的是[create(), inputs]
// 也就是说第一个值是传进来的函数的返回值
// 之后再执行useMemo时候如果create的返回值一样的话
// 就直接返回数组中的第一个也就是上一次的返回值
// 当create返回值不一样的时候就把本次的俩参数放在数组中存起来
// 最后返回 create() 的返回值
// 说白了 useMemo和useCallback的区别就是
// useMemo会执行传进去的方法 而useCallback会把传进来的方法保存起来
```