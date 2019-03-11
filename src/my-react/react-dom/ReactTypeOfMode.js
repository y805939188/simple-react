// 使用二进制是因为可以很好的融合以及剔除种类
// 比如 0b010 | 0b001 => 0b011
// |= 标识添加上这个类型
export const NoContext = 0b000 // 没有上下文的类型
export const ConcurrentMode = 0b001 // 使用低优先级的类型
export const StrictMode = 0b010 // 严格模式的类型
// export const ProfileMode = 0b100