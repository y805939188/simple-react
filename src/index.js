import React from './my-react/react/react'
import ReactDOM from './my-react/react-dom/react-dom'

let Context = React.createContext({ding: 666})

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
  componentDidMount() {
    console.log(this.btnRef)
  }
  render() {
    return (
      <Provider value={{ding: this.state.ding}}>
        <Ding5></Ding5>
        <button ref={(ele) => {this.btnRef = ele}} onClick={this.handleClickBtn}>click me</button>
      </Provider>
    )
  }
}

class Ding7 extends React.Component {
  // ref两种用法
  // 其实还一种直接写string的
  // 不过那种做起来太费事儿
  constructor(props) {
    super(props)
    this.ref3 = React.createRef()
  }

  componentDidMount() {
    console.log(this.ref2)
    console.log(this.ref3)
  }
  render() {
    return (
      <div>
        <h2 ref={ele => (this.ref2 = ele)}>h2</h2>
        <h3 ref={this.ref3}>h3</h3>
      </div>
    )
  }
}

class Ding10 extends React.Component {
  render() {
    return (
      <div>
        <h1>h1</h1>
        <h2>h2</h2>
      </div>
    )
  }
}

ReactDOM.render(
  // <Ding3></Ding3>,
  <Ding4></Ding4>,
  // <Ding7></Ding7>,
  // <Ding10></Ding10>,
  document.querySelector('#app')
)