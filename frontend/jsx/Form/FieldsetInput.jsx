'use strict';

const {h, render, Component} = require('preact');

class FieldsetInput extends Component {
	constructor(props) {
		super(props);

		this.state = {
			showLabel: false
		};

		this.onFocus = this.onFocus.bind(this);
		this.onBlur = this.onBlur.bind(this);
		this.generateFieldsetClassnames = this.generateFieldsetClassnames.bind(this);
		this.generateInputClassnames = this.generateInputClassnames.bind(this);
	}

	onFocus(e) {
		const {label, onFocus} = this.props;

		if (!label) this.setState({showLabel: true});
		if (!!onFocus) onFocus(e);
	}

	onBlur(e) {
		const {label, onBlur} = this.props;

		if (!label) this.setState({showLabel: false});
		if (!!onBlur) onBlur(e);
	}

	generateFieldsetClassnames() {
		const {className, label, dark} = this.props;

		let fieldsetClassnames = "relative mh0 pa0 bn" + (dark ? " fieldsetInputDark" : " fieldsetInput");
		
		if (label) fieldsetClassnames += " h3";
		if (className) fieldsetClassnames += " " + className;

		return fieldsetClassnames;
	}

	generateInputClassnames() {
		const {label, dark} = this.props;
		const {showLabel} = this.state;

		let classnames = "w-100 h-100 ph3 ba b--light-grey";
		if (dark) classnames = "w-100 pt4 pb3 bg-navy white underline-input input-reset"
		if (label) classnames += " pt3";

		return classnames;
	}

	render() {
		// plucked variables are required props
		// ...rest => defaultValue, required, etc.
		const {label, type, onChange, onFocus, onBlur, className, placeholder, dark, submitIcon, onSubmit, ...rest} = this.props;
		const {showLabel} = this.state;
		const id = Math.random();

		return (
			<fieldset className={this.generateFieldsetClassnames()}>
				{!!label 
					? <label className={"absolute f7 b ttu z-1 " + (dark ? "top-0 left-0" : "top-1 left-1")} htmlFor={id}>{label}</label>
					: <label className={"absolute left-0 f7 white b ttu z-1 transition-all" + (showLabel ? " o-1 top-0" : " o-0 top-2")} htmlFor={id}>{placeholder}</label>
				}
				<input 
					id={id} 
					className={this.generateInputClassnames()}
					type={type || "text"} 
					onChange={onChange} 
					onFocus={this.onFocus}
					onBlur={this.onBlur}
					placeholder={showLabel ? "" : (placeholder || "Enter value")}
					{...rest}
				/>
				{(!!submitIcon && !!onSubmit) && 
					<button 
						className="fieldsetInputDark__submit absolute right-0 bottom-0 ph3 bn bg-navy pointer dim" 
						type="submit" 
						aria-label="Submit promo code"
						onClick={onSubmit}
					></button>
				}
			</fieldset>
		);
	}
}

module.exports = FieldsetInput;