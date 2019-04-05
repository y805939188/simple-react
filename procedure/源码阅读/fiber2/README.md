# fiber数据结构

&emsp;&emsp;上一篇简单阐述了一下我自己理解的fiber以及fiber架构，那么这篇来说一说fiber这个数据结构上的具体属性。<br>

```js
function FiberNode(
  tag: WorkTag,
  pendingProps: mixed,
  key: null | string,
  mode: TypeOfMode,
) {
    this.tag = tag; // 标记不同组件类型 如classComponent表示class类组件 functionComponent表示函数类型组件 还有其他类型的在 ReactWorkTag.js 文件红可以看到 
    this.key = key; // react元素上的key 就是jsx上写的那个key
    this.elementType = null; // 表示fiber的真实类型 比如当前fiber对应的jsx是div 那这个属性就是 'div' 如果这个属性对应一个叫做 Test 的class类 那么这个属性就是 Test 本身
    this.type = null; // 表示fiber的真实类型 这个和elementType大部分情况下是一样的 在使用了懒加载之类的功能时可能会不一样
    this.stateNode = null; // 当前Fiber对应的实例 比如class组件 new完之后就挂在这个属性上
    this.return = null; // 父级Fiber 用来指向当前fiber的父fiber
    this.child = null; // 子级Fiber 指向自己的第一个子Fiber节点 也就是firstChildFiber
    this.sibling = null; // 兄弟节点 指向右边的兄弟节点
    /*
        可能您已经注意到了，fiber上有个属性叫child 但是却没有一个属性叫children
        但是我们的组件中肯定会存在一个父节点下有多个子节点的情况
        那为啥fiber中没有children属性呢~
        其实react中，采用的是“树”还有“链表”这两种数据结构
        这两种数据结构被合在一起使用了
        每个节点 有且仅有一个child属性指向他的firstChild
        每个节点 有且仅有一个sibling属性指向他的右边的兄弟节点
        比如说:
            <div>
                <h1></h1>
                <h2></h2>
                <MyComponent></MyComponet>
            </div>
        想上面这个jsx结构 就会形成一颗树和链表的树
        div
        ↓ (child)
        h1 ————————→ h2 ————————→ MyComponent ————————→ null    
            (sibling) .  (sibling)
        
        div.child → h1
        h1.sibling → h2
        h2.sibling → MyComponent       
    */
    
    
    this.index = 0; // 一般如果没有兄弟节点的话是0 当某个父节点下的子节点是数组类型的时候会给每个子节点一个index index和key要一起做diff
    this.ref = null; // 这个就是react元素上也就是jsx上写的ref
    this.pendingProps = pendingProps; // 新传进来的props
    this.memoizedProps = null; // 上次渲染完后的旧的props
    this.updateQueue = null; // 该fiber上的更新队列 执行一次setState就会忘这个属性上挂一个新的更新 这些更新以链表的形式存在
    this.memoizedState = null; // 旧的state 也表示当前页面上的你能看到的状态 不只是class组件有 function类型组件也可能有
    this.firstContextDependency = null; // 这个没啥b用 跟老版本的context有关 旧版本的context马上就要被废了

    /* ---------------------------------------------------- */
      这里的mode要用二进制表示 ReactTypeOfMode.js 文件中可以看到
      mode目前有4中 用来表示当前组件下的所有子组件要用处于一种什么状态
      比如concurrentMode就表示当前子节点们要异步进行更新
      strictMode就表示当前子节点们要处于严格模式
      this.mode = mode; // 位域 就是说使用二进制表示某个存储的信息
    /* ---------------------------------------------------- */
    // Effects
    this.effectTag = NoEffect; // 表示当前fiber要进行何种更新 ReactSideEffectTag.js 文件中可以看到全部更新类型 比如placement表示是新创建的节点 update表示属性可能有变化或者有生命周期之类的
    this.nextEffect = null; // 一条链表 指向下一个有更新的fiber
    this.firstEffect = null; // 子节点中所有有更新的节点中的第一个fiber
    this.lastEffect = null; // 子节点中所有有更新的节点中的最后一个fiber
    /*
        这个effect有必要好好解释一下
        effectTag表示当前这个fiber节点本身有何种更新 没有更新的话就是 NoEffect
        firstEffect 和 lastEffect都是链表
        从first指向last
        表示的是当前节点的子节点！注意是子节点不包括自身
        并且是所有有更新的子节点的链表
        也就是说 如果当前fiber下的某个子节点的effectTag是NoEffect的话
        那么这个子节点就不会被包括在这条链表上
    */

    this.expirationTime = NoWork; // 当前fiber的优先级 也可以说是过期时间
    this.childExpirationTime = NoWork; // 当前节点的所有子节点中的那个最大的优先级
    /*
        expirationTime 比较复杂 以后慢慢说 同步状态下几乎用不到
        也就是说如果不给组件包裹concurrent组件的话 几乎没太大用
    */

    this.alternate = null; // 指向当前fiber的上一个状态
    /*
        alternate指向当前fiber的上一个fiber
        啥意思呢，就是说
        初次渲染 当前jsx节点会有个fiber 假设名字叫 ding1
        然后setState一次会生成一个新的fiber 假设名字叫ding2
        那么ding1.alternate 就可能指向ding2 然后ding2.alternate就可能指向ding1
        他们是双向的
    */
}

```

&emsp;&emsp;react中通过 new FiberNode 这种方式创建一个新的fiber
react组件中的每一个jsx节点都对应一个fiber
不管是原生dom还是自定义的组件 函数组件 class组件或者说react自己提供的一些组件 都对应一个fiber。<br>
&emsp;&emsp;以上就是fiber这种数据结构的所有属性。
有些属性乍一看肯定不知道是用来干嘛的 没事儿，以后咱慢慢写~