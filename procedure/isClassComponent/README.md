```js
 function isClassComponent(fn) {
  // 这个isReactComponent属性是在 extends React.Component 的时候
  // Component的prototype上带着的
  // 因为js里好像没有原生的特别好的直接区分class和函数的方法
  return fn.prototype && fn.prototype.isReactComponent
}
 
```