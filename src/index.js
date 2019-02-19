import React from './my-react/react/react'
import ReactDOM from './my-react/react-dom/react-dom'
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
  return <div>{props.ding}</div>
}
ReactDOM.render(
  // <div id="ding-ge">9999</div>,
  // <Ding myProp={'dinggewudi'}>dddddd</Ding>,
  <Ding ding="666"></Ding>,
  document.querySelector('#app')
)