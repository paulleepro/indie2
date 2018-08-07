'use strict';

const {h, render, Component} = require('preact');

class Modal extends Component {
	constructor(props) {
		super(props);

		this.onClickOutside = this.onClickOutside.bind(this);
	}

	componentDidMount() {
		$("body").toggleClass("overflow");
		setTimeout(() => $(this.modal).removeClass("o-0"), 1);
	}

	onClickOutside(e) {
		const {onClose} = this.props;

		if (!$(e.target).closest("modal-content").length) {
			$("body").toggleClass("overflow");
			$(this.modal).addClass("o-0");
			setTimeout(onClose, 200);
		}
	}

	render() {
		const {children} = this.props;

		return (
			<div ref={el => this.modal = el} className="modal fixed top-0 right-0 bottom-0 left-0 flex justify-center items-center z-3 overflow-hidden o-0" onClick={this.onClickOutside}>
				<div className="modal-content relative bg-white">
					<div className="modal-close absolute tc lh-title bg-navy br4 z-1 pointer dim">
						<span className="white b">x</span>
					</div>
					{children}
				</div>
			</div>
		);
	}
}

module.exports = Modal;