import React from './my-react/react/react'
import ReactDOM from './my-react/react-dom/react-dom'

// function Ding5(props) {
//   return (
//     <div>{props.liubi}</div>
//   )
// }


// class Ding4 extends React.Component {
//   state = {
//     ding4: 1
//   }

//   handleClick2 = () => {
//     let ding4 = this.state.ding4
//     this.setState({
//       ding4: ++ding4
//     })
//   }
//   render() {
//     return (
//       <div>
//         <div onClick={this.handleClick2}>{this.state.ding4}</div>
//         <Ding5 liubi={'liubi'}></Ding5>
//       </div>
//     )
//   }
// }

// class Ding2 extends React.Component {
//   state = {
//     ding3: false
//   }
//   handleClickBtn = () => {
//     this.setState({
//       ding3: !this.state.ding3
//     })
//   }
//   render() {
//     return (
//       <div style={{color: 'red', width: '100px', height: '100px', backgroundColor: '#000'}}>
//         {this.props.hehe}
//         <button onClick={this.handleClickBtn}>
//           {this.state.ding3 ? '222' : '333'}
//         </button>
//         <Ding4></Ding4>
//       </div>
//     )
//   }
// }

// class Ding3 extends React.Component {
//   state = {
//     ding: true,
//     ding2: 666
//   }
//   handleClick1 = (event) => {
//     this.setState({
//       ding: !this.state.ding
//     })
//   }
//   render () {
//     return (
//       <div>
//         {this.state.ding ? '666' : '999'}
//         {/* <button onClick={this.handleClick1}>点我</button> */}
//         <Ding2 hehe={this.state.ding2}></Ding2>
//       </div>
//     )
//   }
// }

let Context = React.createContext({ding: 666})
// console.log(Context)

let Provider = Context.Provider
let Consumer = Context.Consumer

class Ding6 extends React.Component {
  state = {
    ding10: false
  }
  handleClickBtn2 = () => {
    this.setState({
      ding10: !this.state.ding10
    })
  }
  render() {
    return (
      <div>
        <button onClick={this.handleClickBtn2}>dian ji</button>
        <h2>{this.state.ding10 ? 11 : 22}</h2>
        <h1>{this.props.dingge}</h1>
      </div>
    )
  }
}

class Ding5 extends React.Component {
  render() {
    return (
      <Consumer>
        {
          (contextValue) => {
            return <Ding6 dingge={contextValue.ding}></Ding6>
          }
        }
      </Consumer>
    )
  }
}
class Ding4 extends React.Component {
  state = {ding: 1}
  handleClickBtn = () => {
    let ding = this.state.ding
    this.setState({
      ding: ++ding
    })
  }
  render() {
    return (
      <Provider value={{ding: this.state.ding}}>
        <Ding5></Ding5>
        <button onClick={this.handleClickBtn}>click me</button>
      </Provider>
    )
  }
}
ReactDOM.render(
  // <Ding3></Ding3>,
  <Ding4></Ding4>,
  document.querySelector('#app')
)