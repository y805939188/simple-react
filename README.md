# Simple React

##### 简介 : 简化版的react,  虽然不能真的用在项目里, 但是可以作为React源码的阅读笔记看~
##### 已完成 : fiber架构, setState, ContextAPI, RefAPI

##### 正在进行 : Concurrent异步渲染

<br/>


# React调用流程
  [redux-saga](./redux)
  
```mermaid
graph LR
    start[开始] --> input[输入A,B,C]
    input --> conditionA{A是否大于B}
    conditionA -- YES --> conditionC{A是否大于C}
    conditionA -- NO --> conditionB{B是否大于C}
    conditionC -- YES --> printA[输出A]
    conditionC -- NO --> printC[输出C]
    conditionB -- YES --> printB[输出B]
    conditionB -- NO --> printC[输出C]
    printA --> stop[结束]
    printC --> stop
    printB --> stop
 ```
