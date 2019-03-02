```js
 function commitAllHostEffects() {
  while (!!nextEffect) {
    let effectTag = nextEffect.effectTag
    // 如果有ContentReset的话
    // 说明有文本节点需要重置内容
    if (effectTag & Ref) {
      // 进入这里说明他的Ref更新了
      // 一般在更新完class组件或者更新完dom节点后可能会给个Ref
      let current = effectTag.alternate
      let currentRef = current ? current.ref : null
      if (currentRef !== null) {
        // 先获取上一轮的ref 如果有的话
        // 是函数给他传个null 是对象给他current属性置为null
        // 通过createRef创建的ref就会有current属性
        // 之后再提交生命周期时候会设置为新ref
        if (typeof currentRef === 'function') {
          currentRef(null)
        } else {
          currentRef.current = null
        }
      }
    }

    // 对于dom节点来讲主要需要执行的就是 Placement(新插入) Update(更新) Deletion(删除)
    // effectTag & (Placement | Update | Deletion) 意思就是
    // 等于括号里那几个中的某一个或某几个或没有 (xx | yy | zz) 就是获取这仨的集合
    let primaryEffectTag = effectTag & (Placement | Update | Deletion)
    if (primaryEffectTag === Placement) {
      // 进入这里说明只是一个新增的节点

      commitPlacement(nextEffect)
      // 这一步的 &= ~ 意思就是把Placement这个标志从effectTag中干掉
      nextEffect.effectTag &= ~Placement

    } else if (primaryEffectTag === PlacementAndUpdate) {
      // 进入这里说明又是新增又有修改
      // 比如说即是一个新的节点 而且还有一些生命周期之类的
      commitPlacement(nextEffect);
      // 然后把Placement给去掉
      nextEffect.effectTag &= ~Placement
      // 再调用commitWork进行更新的过程
      commitWork(nextEffect);
    } else if (primaryEffectTag === Update) {
      // 进入这里表示更新
      commitWork(nextEffect)
    } else if (primaryEffectTag === Deletion) {
      // 走到这儿表示删除
      commitDeletion(nextEffect)
      // 让这个被删除的节点的fiber从fiber树中脱离
      detachFiber(nextEffect)
    }
    nextEffect = nextEffect.nextEffect
  }
}

 
```