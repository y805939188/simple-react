export const NoEffect = /*              */ 0b000000000000 // 这个说明没有更新
// export const PerformedWork = /*         */ 0b000000000001 // 这个好像没有啥用

export const Placement = /*             */ 0b000000000010 // 这个说明是新插入
export const Update = /*                */ 0b000000000100 // 这个说明是更新
export const PlacementAndUpdate = /*    */ 0b000000000110 // 这个可能是元素换位置了
export const Deletion = /*              */ 0b000000001000 // 这个是删除
export const ContentReset = /*          */ 0b000000010000 // 这个是文本内容重置
export const Callback = /*              */ 0b000000100000
// export const DidCapture = /*            */ 0b000001000000 // 这个是捕获错误
export const Ref = /*                   */ 0b000010000000 // 这个是当有新ref时使用的
export const Snapshot = /*              */ 0b000100000000 // 新周期
// export const Passive = /*               */ 0b001000000000

export const LifecycleEffectMask = /*   */ 0b001110100100 // 这个是把Passive、Update、Callback、Ref、Snapshot综合到一起了

// Union of all host effects
export const HostEffectMask = /*        */ 0b001111111111 // 这个是把所有的effect综合到一起了

export const Incomplete = /*            */ 0b010000000000
export const ShouldCapture = /*         */ 0b100000000000