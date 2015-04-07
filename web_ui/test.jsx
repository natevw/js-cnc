var React = require('react')

class Hello extends React.Component {
  render() {
    return <div>Hello, {this.props.name}!</div>
  }
}

React.render(<Hello name="world"/>, document.getElementById('content'));