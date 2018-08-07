'use strict';

const {h, render, Component} = require('preact');

class FieldsetSelect extends Component {
	render() {
		// plucked variables are required props
		// ...rest => defaultValue, required, etc.
		const {className, label, options, onChange, placeholder, ...rest} = this.props;
		const id = Math.random();

		return (
			<fieldset className={"fieldsetSelect relative mh0 pa0 bn" + (className ? " " + className : "")}>
				{!!label && <label className="absolute top-1 left-1 f7 b ttu z-1" htmlFor={id}>{label}</label>}
				<select 
					id={id} 
					className="w-100 h-100 pt3 ph3 br0 bg-white ba b--light-grey pointer"
					style={{backgroundImage: "url(/images/svg/arrow-down-dark.svg)"}}
					onChange={onChange} 
					{...rest}
				>
					<option className="fieldsetSelect__placeholder" value="" disabled>{placeholder || "Select option"}</option>
					{options.map(option => {
						if (typeof option === "string") return (<option value={option}>{option}</option>);
						else return (<option value={option.value}>{option.text}</option>)
					})}
				</select>
			</fieldset>
		);
	}
}

module.exports = FieldsetSelect;