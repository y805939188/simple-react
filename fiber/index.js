let queue = h1Fiber
h1Fiber.nextFiber = h2Fiber

class MyClass extends React.Component {
  click = () => {
    this.setState({})
    this.setState({})
  }
  render() {
    return (
      <>
        <h1>666</h1>
        <div>
          <h2></h2>
          <h3></h3>
        </div>
        <span></span>
      </>
    )
  }
}
