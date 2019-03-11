```js
const MAX_SIGNED_31_BIT_INT = 1073741823 // (2**31) / 2 - 1
export const NoWork = 0
export const Never = 1
export const Sync = MAX_SIGNED_31_BIT_INT

const UNIT_SIZE = 10
const MAGIC_NUMBER_OFFSET = MAX_SIGNED_31_BIT_INT - 1

export function msToExpirationTime(ms) {
  /*
    (xxx | 0) 意思就是给 xxx 取整
  */
  return MAGIC_NUMBER_OFFSET - ((ms / UNIT_SIZE) | 0)
}

export function expirationTimeToMs(expirationTime) {
  // 用最大的单元减去还剩的单元得到目前执行到第多少次单元
  // 然后乘以尺寸 得到到目前为止对应的时间ms
  return (MAGIC_NUMBER_OFFSET - expirationTime) * UNIT_SIZE
}

// currentTime: 1073741822 - ((当前花费时间 / 10) | 0)
// 这个东西返回结果就相当于
// 1073741822 - ((((1073741822 - currentTime + 500) / 25) | 0) + 1) * 25
// 这个公式的意思吧 主要先看后边这串儿 (((xxx / 25) | 0) + 1) * 25
// xxx / 25 可以理解成这个xxx中有多少个25 可能是个整数 也可能带小数
// 然后给它 |0 了 意思就是取整 也就是说 把 xxx 分成 n 份 每份25 之后把不足25的最后一份扔掉
// 再然后 +1 加了一个1 相当于给 n-1 份变成正好的 n 份 并且每份都是25大小
// 最后 *25 还原成约等于原来 xxx 的大小 不过此时得到的数字可能比 xxx 稍大
// 所以说 两个差距在25以内的数字 最后得到的结果有可能是一样的
// react会把它们当成优先级一样去处理

// 比如把251分成11份每份25 最后第11份只有1个
// 然后把它扔掉 直接补一个25 变成11个25份
// 最后结果就是275个
// 再比如把255分成11份每份25 最后第11份只有5个
// 然后把它扔掉 直接补一个25 变成11个25份
// 最后结果还是275个

function ceiling(num, precision) {
  // 当react中执行了多个setState时
  // 每个setState之间的差距可能是非常小的
  // 如果不提供调整的话 最后expirationTime的结果会不一样
  // 结果不一样就意味着优先级不一样
  // 就可能会导致任务更新执行多次 从而性能下降

  // num 表示本次更新最多只能运行到第 num 个单元
  // precision 表示相差在 precision 单元之内的更新要被抹平

  // 举个例子
  // 第一次更新最多只能运行到第 155 个单元(num)
  // 第二次更新最多只能运行到第 155.3 个单元(num)
  // 希望相差在2个单元内的更新的优先级是一样的(precision)
  // 所以第一次更新就是 (155 / 2 | 0 + 1) * 2 = 156
  // 然后第二次更新就是 (155.3 / 2 | 0 + 1) * 2 = 156
  // 触发时间特别相近的两次更新最终能执行到的单元都是156
  // 这样就抹平了特别近的两次更新的优先级的差异
  // 要不两次优先级差别特别大的话 那就可能会多次执行更新操作
  return (((num / precision) | 0) + 1) * precision
}

// /*
//   低优先级: 将25ms内的连续两次更新的优先级当成一个
//     1073741822 - { [ ( 1073741822 - current + 500 ) / 25 ] | 0 } * 25
//   高优先级: 将10ms内的连续两次更新的优先级当成一个
//     1073741822 - { [ ( 1073741822 - current + 50 ) / 10 ] | 0 } * 10
// */

// 1073741822 - ((( (1073741822 - currentTime + expirationInMs / UNIT_SIZE) / (bucketSizeMs / UNIT_SIZE)) | 0) + 1) * (bucketSizeMs / UNIT_SIZE)
// currentTime代表react最多还能再处理多少单元
function computeExpirationBucket(currentTime, expirationInMs, bucketSizeMs) {
  return (
    MAGIC_NUMBER_OFFSET -
    ceiling(
      // expirationInMs / UNIT_SIZE 意思就是把本次render阶段的时间换算成react中的单元(unit)
      // MAGIC_NUMBER_OFFSET - currentTime 表示用react最大能处理的单元数 减去剩下还能再处理的单元数
      // 得到的结果代表当前已经花费的单元数 之后再加上本次render阶段要用掉的单元数
      // 所以MAGIC_NUMBER_OFFSET - currentTime + expirationInMs / UNIT_SIZE的意思就是
      // 算出最终本轮更新最终能执行到多少单元数

      // ceiling就是取一下整 将时间特别接近的两次更新的时间优先级变成一样的

      // 然后外层再用MAGIC_NUMBER_OFFSET减去ceiling得到的东西
      // 所以最后的意思
      // 我认为就是: 执行完本次更新 最少还能剩下多少单元

      // 举个例子
      // 比如说react能处理100个单元(MAGIC_NUMBER_OFFSET)
      // 程序到现在已经花费了10个单元了
      // 所以现在还剩90个单元能让我用(currentTime)
      // 然后每次更新我只让你最多能用掉5个单元(expirationInMs / UNIT_SIZE)
      // 所以用100 - 90 + 5 = 15
      // 所以得到的结果的意思就是
      // "现在程序已经运行了10个单元了 你这次更新最多只能运行到第15个单元 15个单元内 可以随便中断 超过15单元后 就不能中断了"
      // 之后取一下整 把相差特别近的两次更新之间差异给抹平
      // 再用 100 - 15 = 85
      // 结果的意思就是 执行完本次更新后 可能还剩下85个单元能干活
      // 然后最终得到的数字越大 说明本次的更新被触发的时间越靠前
      // 就越应该被先执行 也就是优先级更大
      
      // 以上只是个人理解
      MAGIC_NUMBER_OFFSET - currentTime + expirationInMs / UNIT_SIZE,
      // bucketSizeMs代表相差在xx毫秒内
      // 所以 bucketSizeMs / UNIT_SIZE 意思就是相差在 xx 个单元之内
      bucketSizeMs / UNIT_SIZE
    )
  )
}

// LOW_PRIORITY_EXPIRATION是说低优先级的更新的render阶段最多只给你5000ms的时间
export const LOW_PRIORITY_EXPIRATION = 5000
export const LOW_PRIORITY_BATCH_SIZE = 250

export function computeAsyncExpiration(currentTime) {
  return computeExpirationBucket(
    currentTime,
    LOW_PRIORITY_EXPIRATION,
    LOW_PRIORITY_BATCH_SIZE
  )
}

// HIGH_PRIORITY_EXPIRATION 是说本次更新的render阶段 最多只给你500ms的时间
export const HIGH_PRIORITY_EXPIRATION = 500 // react中生产环境变成150
export const HIGH_PRIORITY_BATCH_SIZE = 100

// currentTime: 1073741822 - ((当前花费时间 / 10) | 0)
// 1073741822 - (当前花费时间 / 10)
// 这个东西返回结果就相当于             dev环境50  ↓  prod环境15
// 1073741822 - (((1073741822 - currentTime + 50) / 10 | 0) + 1) * 10
// 这个公式的意思跟上面async的意思基本一样
// 就是差距在10以内的两个时间 有可能最后截止时间是一样的
export function computeInteractiveExpiration(currentTime) {
  return computeExpirationBucket(
    currentTime,
    HIGH_PRIORITY_EXPIRATION,
    HIGH_PRIORITY_BATCH_SIZE
  )
}

```