'use strict';

const {h, render, Component} = require('preact');

class FieldsetCheckbox extends Component {
  constructor(props) {
    super(props);

    this.onChange = this.onChange.bind(this);
  }

  onChange(e) {
    this.props.onChange(!this.props.checked);
  }

  render() {
    const {className, label, checked, onChange, ...rest} = this.props;

    return (
      <fieldset className={"mh0 pa0 bn" + (className ? " " + className : "")}>
        <label className="db mb3 pointer dim">
          <input
            className="mr2 dark-gray pointer"
            type="checkbox"
            checked={checked}
            onChange={this.onChange} 
            {...rest}
          />
          {label}
        </label>
      </fieldset>
    );
  }
}

module.exports = FieldsetCheckbox;