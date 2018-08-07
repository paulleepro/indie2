'use strict';

const {h, render, Component} = require('preact');

class FieldsetRadio extends Component {
	render() {
		// ...rest => required, etc.
		const {className, label, name, options, selected, onChange, required, ...rest} = this.props;

		return (
			<fieldset className={"mh0 pa0 bn" + (className ? " " + className : "")} {...rest}>
				{!!label && <span className="db mb3 f7 b ttu">{label}</span>}
				{options.map((option, i) => {
					return (
						<label className="db mb3 pointer dim">
							<input
								key={i}
								className="mr2 dark-gray pointer"
								name={name}
								type="radio"
								value={option.value}
								checked={!!selected && option.value === selected.value}
								onClick={e => onChange(option)} 
								required={required}
							/>
							{option.label}
						</label>
					);
				})}
			</fieldset>
		);
	}
}

module.exports = FieldsetRadio;