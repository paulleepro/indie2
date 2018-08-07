'use strict';

const {h, render, Component} = require('preact');
const {round, filter} = require('lodash');

class MobileToggleButton extends Component {
  constructor(props) {
    super(props);

    this.state = {
      name: props.name,
      active: props.active
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({active: nextProps.active});  
  }

  render() {
    const {name, active} = this.state;

    return (
      <div 
        className={
          "storeLocator__mobileToggle storeLocator__mobileToggle--list" + 
          (active ? " storeLocator__mobileToggle--active" : "") + 
          " fl w-50 tc pointer"
        } 
        onClick={e=>this.props.onClick(name)
      }>
        <span className="dib w-100 pv3 ttu tracked">{name}</span>
      </div>
    );
  }
}

module.exports = MobileToggleButton;