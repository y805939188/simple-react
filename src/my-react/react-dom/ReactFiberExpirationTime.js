const MAX_SIGNED_31_BIT_INT = 1073741823
export const NoWork = 0;
export const Never = 1;
export const Sync = MAX_SIGNED_31_BIT_INT;

const UNIT_SIZE = 10;
const MAGIC_NUMBER_OFFSET = MAX_SIGNED_31_BIT_INT - 1;

export function msToExpirationTime(ms) {
  /*
    (xxx | 0) 意思就是给 xxx 取整
  */
  return MAGIC_NUMBER_OFFSET - ((ms / UNIT_SIZE) | 0);
}

// export function expirationTimeToMs(expirationTime: ExpirationTime): number {
//   return (MAGIC_NUMBER_OFFSET - expirationTime) * UNIT_SIZE;
// }

// function ceiling(num: number, precision: number): number {
//   return (((num / precision) | 0) + 1) * precision;
// }

// // return computeExpirationBucket(
// //   currentTime,
// //   LOW_PRIORITY_EXPIRATION,
// //   LOW_PRIORITY_BATCH_SIZE,
// // );

// // return computeExpirationBucket(
// //   currentTime,
// //   HIGH_PRIORITY_EXPIRATION,
// //   HIGH_PRIORITY_BATCH_SIZE,
// // );

// /*
//   低优先级:
//     1073741822 - { [ ( 1073741822 - current + 500 ) / 25 ] | 0 } * 25
//   高优先级:
//     1073741822 - { [ ( 1073741822 - current + 50 ) / 10 ] | 0 } * 10
// */

// // 1073741822 - ((( (1073741822 - currentTime + expirationInMs / UNIT_SIZE) / (bucketSizeMs / UNIT_SIZE)) | 0) + 1) * (bucketSizeMs / UNIT_SIZE)
// function computeExpirationBucket(
//   currentTime,
//   expirationInMs,
//   bucketSizeMs,
// ): ExpirationTime {
//   return (
//     MAGIC_NUMBER_OFFSET -
//     ceiling(
//       MAGIC_NUMBER_OFFSET - currentTime + expirationInMs / UNIT_SIZE,
//       bucketSizeMs / UNIT_SIZE,
//     )
//   );
// }

// export const LOW_PRIORITY_EXPIRATION = 5000;
// export const LOW_PRIORITY_BATCH_SIZE = 250;

// // currentTime: 1073741822 - ((当前花费时间 / 10) | 0)
// // 这个东西返回结果就相当于
// // 1073741822 - ((((1073741822 - currentTime + 500) / 25) | 0) + 1) * 25
// // 这个公式的意思吧 主要先看后边这串儿 (((xxx / 25) | 0) + 1) * 25
// // xxx / 25 可以理解成这个xxx中有多少个25 可能是个整数 也可能带小数
// // 然后给它 |0 了 意思就是取整 也就是说 把 xxx 分成 n 份 每份25 之后把不足25的最后一份扔掉
// // 再然后 +1 加了一个1 相当于给 n-1 份变成正好的 n 份 并且每份都是25大小
// // 最后 *25 还原成约等于原来 xxx 的大小 不过此时得到的数字可能比 xxx 稍大
// // 所以说 两个差距在25以内的数字 最后得到的结果有可能是一样的
// // react会把它们当成优先级一样去处理

// // 比如把251分成11份每份25 最后第11份只有1个
// // 然后把它扔掉 直接补一个25 变成11个25份
// // 最后结果就是275个
// // 再比如把255分成11份每份25 最后第11份只有5个
// // 然后把它扔掉 直接补一个25 变成11个25份
// // 最后结果还是275个

// export function computeAsyncExpiration(
//   currentTime: ExpirationTime,
// ): ExpirationTime {
//   return computeExpirationBucket(
//     currentTime,
//     LOW_PRIORITY_EXPIRATION,
//     LOW_PRIORITY_BATCH_SIZE,
//   );
// }

// // We intentionally set a higher expiration time for interactive updates in
// // dev than in production.
// //
// // If the main thread is being blocked so long that you hit the expiration,
// // it's a problem that could be solved with better scheduling.
// //
// // People will be more likely to notice this and fix it with the long
// // expiration time in development.
// //
// // In production we opt for better UX at the risk of masking scheduling
// // problems, by expiring fast.
// export const HIGH_PRIORITY_EXPIRATION = __DEV__ ? 500 : 150;
// export const HIGH_PRIORITY_BATCH_SIZE = 100;

// // currentTime: 1073741822 - ((当前花费时间 / 10) | 0)
// // 1073741822 - (当前花费时间 / 10)
// // 这个东西返回结果就相当于             dev环境50  ↓  prod环境15
// // 1073741822 - (((1073741822 - currentTime + 50) / 10 | 0) + 1) * 10
// // 这个公式的意思跟上面async的意思基本一样
// // 就是差距在10以内的两个时间 有可能最后截止时间是一样的
// export function computeInteractiveExpiration(currentTime: ExpirationTime) {
//   return computeExpirationBucket(
//     currentTime,
//     HIGH_PRIORITY_EXPIRATION,
//     HIGH_PRIORITY_BATCH_SIZE,
//   );
// }

// // 所以这里的interactive和acync俩算法的意思 大致上就是
// // 对于优先级较低的任务 每个任务是25ms往上加的
// // 对于优先级较高的任务 每个任务是15ms往上加的

// // 之所以这么设定 是因为 当react中同时执行了多个setState时
// // 每个setState之间的差距可能是非常小的
// // 如果不提供调整的话 最后expirationTime的结果会不一样
// // 结果不一样就意味着优先级不一样
// // 就可能会导致任务更新执行多次 从而性能下降
