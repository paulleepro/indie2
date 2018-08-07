'use strict';

const {h, render, Component} = require('preact');

class FieldsetButton extends Component {
	render() {
		const {className, text, type, onClick, disabled, dark} = this.props;

		let classnames = "w-100 w-auto-l pv3 ph5 white b ttu bg-navy bn dim pointer";
		if (dark) classnames = "w-100 w-auto-l pv3 ph4 white hover-navy ba b--white bg-navy hover-bg-white pointer link";

		if (disabled) classnames += " disabled";

		return (
			<fieldset className={"mh0 pa0 bn" + (className ? " " + className : "")}>
				<button className={classnames} type={type || ""} onClick={onClick} disabled={disabled}>{text}</button>
			</fieldset>
		);
	}
}

module.exports = FieldsetButton;