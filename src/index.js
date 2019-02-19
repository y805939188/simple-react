import React from './my-react/react/react'
import ReactDOM from './my-react/react-dom/react-dom'

// function Ding() {
//   return (
//     <div>
//       <h1>1</h1>
//       <h2>2</h2>
//       <h3>3</h3>
//     </div>
//   )
// }
// let a = Ding()
// console.log(a)
// debugger
// console.log(React.createElement(
//   'div',
//   null,
//   React.createElement('h1', null, 1),
//   React.createElement('h2', null, 2)
// ))


// console.log(React)
// console.log(<div id='dingye'>777</div>)
// class Ding extends React.Component {
//   static defaultProps = {
//     ding3: 123456
//   }
//   static getDerivedStateFromProps(nextProps, prevState) {
//     return nextProps
//   }
//   constructor(props) {
//     super(props)
//     this.state = {
//       ding1: 999,
//       ding2: props.myProp
//     }
//   }
//   render() {
//     return (
//       <div>{this.state.ding1}</div>
//     )
//   }
// }

function Ding(props) {
  return <div>
    <h1>{props.ding1}</h1>
    <h2>{props.ding2}</h2>
  </div>
}
ReactDOM.render(
  // <div id="ding-ge">9999</div>,
  // <Ding myProp={'dinggewudi'}>dddddd</Ding>,
  <Ding ding1="666" ding2="999"></Ding>,
  document.querySelector('#app')
)