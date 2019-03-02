```js
function scheduleWorkToRoot(fiber, expirationTime) {
  let root = null
  let alternate = fiber.alternate
  let parentNode = fiber.return
  // 检测如果当前这个fiber节点的优先级要是小于新的优先级的话
  // 就要更新这个节点的优先级 第一次渲染时候传进来的fiber是RootFiber 它的初始优先级是0
  // 要在这里赋值成最高优先级
  // 如果是setState的情况 这个组件可能已经存在一个优先级了 比如上次异步时候中断的时候
  // 也就是在浏览器非空闲时间又主动触发了一次该组件的更新 此时这个fiber就有可能有个expirationTime
  if (fiber.expirationTime < expirationTime) fiber.expirationTime = expirationTime
  // 保持alterante同步
  if (!!alternate && alternate.expirationTime < expirationTime) alternate.expirationTime = expirationTime

  // 如果当前这个节点的tag类型就已经是HostRoot了 说明它自己就是个FiberRoot 直接返回它的实例就好
  if (fiber.tag === HostRoot) return fiber.stateNode
  while (parentNode !== null) {
    // 这里就是要更新当前fiber以及它所有父节点包括爷爷 太爷爷节点等等的childExpirationTime
    // 这个childExpriationTime在之后更新时候会用来判断是否可以直接跳过更新 用作优化的
    // 然后alternate上面也要保持同步
    alternate = parentNode.alternate
    if (parentNode.childExpirationTime < expirationTime) parentNode.childExpirationTime = expirationTime
    if (alternate && alternate.childExpirationTime < expirationTime) alternate.childExpirationTime = expirationTime
    // 如果parentNode的tag类型就是HostRoot的话说明当前节点的父节点就是FiberRoot 直接返回实例就成
    if (parentNode.tag === HostRoot) return parentNode.stateNode
    parentNode = parentNode.return
  }
  // 如果都退出循环走到这步了还没找到root说明可能出bug了
  return null
}

```