'use strict';

const {h, render, Component} = require('preact');

const FieldsetInput = require('../Form/FieldsetInput.jsx');

class Cart extends Component {
	constructor(props) {
		super(props);

		this.state = {
			open: false,
			cart: CartService.getCart(),
			cartSubtotal: CartService.getCartSubtotal(),
			cartUpdateLoading: false,
			couponCode: CartService.getCouponCode(),
			couponDiscount: CartService.getCouponDiscount(),
			couponLoading: false,
			couponSuccess: null,
			couponError: null,
		};

		this.toggleDrawer = this.toggleDrawer.bind(this);
		this.updateCart = this.updateCart.bind(this);
		this.toggleQuantity = this.toggleQuantity.bind(this);
		this.applyCoupon = this.applyCoupon.bind(this);
		this.removeCoupon = this.removeCoupon.bind(this);
		this.renderLineItem = this.renderLineItem.bind(this);
		this.renderCouponCell = this.renderCouponCell.bind(this);
		this.renderCart = this.renderCart.bind(this);
	}

	componentDidMount() {
		// cart toggle triggered at any point in the site
		window.addEventListener('cart-toggle', this.toggleDrawer);
		// if cart is updated from outside the cart drawer
		window.addEventListener('cart-update', this.updateCart);
	}

	toggleDrawer(e) {
		// `force` is used to force the drawer state instead of toggling
		this.setState({ open: (!e.detail || typeof e.detail.force === 'undefined') ? !this.state.open : e.detail.force }, () => {
			if (this.state.open) window.dispatchEvent(new CustomEvent('toggle-opened'));
			else window.dispatchEvent(new CustomEvent('toggle-closed'));
		});
	}

	updateCart(e) {
		this.setState({
			cart: CartService.getCart(),
			cartSubtotal: CartService.getCartSubtotal(),
			couponCode: CartService.getCouponCode(),
			couponDiscount: CartService.getCouponDiscount(),
		});
	}

	toggleQuantity(e, line) {
		this.setState({cartUpdateLoading: true});
		CartService.updateCart(line.item, null, e.target.value, () => this.setState({cartUpdateLoading: false}));
	}

	applyCoupon(e) {
		e.preventDefault();

		const {couponCode} = this.state;

		if (!couponCode || typeof couponCode !== "string" || !couponCode.length) {
			this.setState({couponError: "Please enter a coupon code to continue."});
			setTimeout(() => this.setState({couponError: null}), 3000);
			return;
		}

		this.setState({
			cartUpdateLoading: true,
			couponLoading: true,
			couponError: null,
		});

		CartService.applyMagentoCoupon(couponCode.trim())
			.then((res) => {
				this.setState({
					cartUpdateLoading: false,
					couponLoading: false,
					couponDiscount: CartService.getCouponDiscount(),
					cartSubtotal: CartService.getCartSubtotal(),
				});
			})
			.catch((err) => {
				this.setState({
					cartUpdateLoading: false,
					couponLoading: false, 
					couponError: Utils.getMagentoErrorMessage(err)
				});

				setTimeout(() => this.setState({couponError: null}), 3000);
			});
	}

	removeCoupon(e) {
		e.preventDefault();

		this.setState({
			cartUpdateLoading: true,
			couponLoading: true,
			couponError: null,
		});

		CartService.removeMagentoCoupon()
			.then((res) => {
				this.setState({
					cartSubtotal: CartService.getCartSubtotal(),
					cartUpdateLoading: false,
					couponCode: null,
					couponLoading: false,
					couponDiscount: null,
					couponSuccess: "Your coupon has been removed.",
				});

				setTimeout(() => this.setState({couponSuccess: null}), 3000);
			})
			.catch((err) => {
				this.setState({
					cartUpdateLoading: false,
					couponLoading: false,
					couponError: Utils.getMagentoErrorMessage(err)
				});

				setTimeout(() => this.setState({couponError: null}), 3000);
			});
	}

	renderLineItem(line) {
		return (
			<tr className="cartDrawer__line">
				<td className="v-mid pv3 pr3 bb b--white"><a className="white fw6 ttu link dim" href={`/shop/products/${line.item.slug}`}>{line.item.name}</a></td>
				<td className="v-mid pv3 pr3 bb b--white"><span className="ttu">{(line.item.variation || "")}</span></td>
				<td className="v-mid pv3 bb b--white">
					<select className="select" value={line.quantity} onChange={e => this.toggleQuantity(e, line)}>
						{new Array(20).fill().map((x, i) => {
							return <option key={i} value={i+1}>{i+1}</option>
						})}
						{/* Hacky way to show quantity in dropdown in case user clicks Add To Cart button beyond 20 quantity */}
						{(line.quantity > 20) && <option value={line.quantity}>{line.quantity}</option>}
					</select>
					<span className="cartDrawer__lineRemove dib mt2 mt0-l ml2 ml3-l pl1 pl0-l light-blue f7 f6-l b o-0 glow dim pointer" onClick={() => CartService.updateCart(line.item, null, 0)}>Remove</span>
				</td>
				<td className="v-mid pv3 bb b--white tr">{Utils.moneyFormat(line.quantity > 0 ? line.quantity * line.item.price : line.item.price)}</td>
			</tr>
		);
	}

	renderCouponCell(colSpan) {
		const {couponCode, couponLoading, couponSuccess, couponError} = this.state;

		return (
			<td className="pt4" colSpan={colSpan}>
				{couponLoading
					? <div className="loading loading-small center mt2 mb4"></div>
					: <FieldsetInput 
						value={couponCode} 
						className="mb4" 
						placeholder="Enter Code" 
						label="Apply a promo code"
						dark
						submitIcon
						onChange={e => this.setState({couponCode: e.target.value})} 
						onSubmit={this.applyCoupon} 
						onKeyDown={e => Utils.onKeyDown(e, () => this.applyCoupon(e))}
					/>
				}
				{!!couponSuccess && <p className="light-green">{couponSuccess}</p>}
				{!!couponError && <p className="red">{couponError}</p>}
			</td>
		);
	}

	renderCart() {
		const {open, cart, cartSubtotal, cartUpdateLoading, couponDiscount} = this.state;
		const couponDiscountExists = !!couponDiscount && couponDiscount != "null" && couponDiscount != "0" && couponDiscount != 0;

		return (
			<div className="cartDrawer__content pa3 pa4-l overflow-y-scroll">
				<table className="w-100 tl white collapse">
					{/* Accessibility */}
					<caption className="o-0">Your Cart</caption>
					<thead>
						<th className="pv2 pr3 bb b--white">Cart</th>
						<th className="pv2 pr3 bb b--white">Size</th>
						<th className="w3 w5-l pv2 bb b--white">Quantity</th>
						<th className="w3 w5-l pv2 bb b--white tr"><span className="cartDrawer__close w1 h1 dib bg-center contain dim pointer" onClick={this.toggleDrawer}></span></th>
					</thead>
					<tbody>
						{/* Map through a map */}
						{Utils.mapThroughMap(cart, line => this.renderLineItem(line))}
						{/* Each row has a separate mobile and desktop layout */}
						<tr className="cartDrawer__detailsRow dn">
							<td className="pt4" colspan="2"></td>
							{this.renderCouponCell(2)}
						</tr>
						<tr className="dn-l">
							{this.renderCouponCell(4)}
						</tr>
						{couponDiscountExists && <tr className="cartDrawer__detailsRow dn">
							<td className="pb4" colspan="2"></td>
							<td className="pb4">
								<span className="fw6">Discount Applied</span>
								<span className="light-blue pl2 f7 f6-l b o-0 glow dim pointer" onClick={this.removeCoupon}>Remove</span>
							</td>
							<td className="pb4 tr"><span className="f4 light-red">{Utils.moneyFormat(couponDiscount)}</span></td>
						</tr>}
						{couponDiscountExists && <tr className="dn-l">
							<td className="pb4 pr4" colspan="3">
								<span className="fw6">Discount Applied</span>
								<span className="light-blue pl2 f7 f6-l b o-0 glow dim pointer" onClick={this.removeCoupon}>Remove</span>
							</td>
							<td className="pb4 tr"><span className="f4 light-red">{Utils.moneyFormat(couponDiscount)}</span></td>
						</tr>}
						<tr className="cartDrawer__detailsRow dn">
							<td className="pb4" colspan="2"></td>
							<td className="pb4"><span className="fw6">Subtotal (Tax Excluded)</span></td>
							<td className="pb4 tr">
								{cartUpdateLoading
									? <div className="loading loading-small dib"></div>
									: <span className="f4">{Utils.moneyFormat(cartSubtotal)}</span>
								}
							</td>
						</tr>
						<tr className="dn-l">
							<td className="pb4 pr4" colspan="3"><span className="fw6">Subtotal (Tax Excluded)</span></td>
							<td className="pb4 tr">
								{cartUpdateLoading
									? <div className="loading loading-small dib"></div>
									: <span className="f4">{Utils.moneyFormat(cartSubtotal)}</span>
								}
							</td>
						</tr>
						<tr className="cartDrawer__detailsRow dn">
							<td colspan="2"></td>
							<td colspan="2">
								<a className="db pv3 navy tc ttu link bg-white dim pointer" href="/checkout" onClick={() => window.dispatchEvent(new CustomEvent('cart-toggle'))}>Checkout</a>
							</td>
						</tr>
						<tr className="dn-l">
							<td colspan="4">
								<a className="db pv3 navy tc ttu link bg-white dim pointer" href="/checkout" onClick={() => window.dispatchEvent(new CustomEvent('cart-toggle'))}>Checkout</a>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		);
	}

	render() {
		const {open, cart} = this.state;

		return (
			<div className={"cartDrawer relative z-1 bg-navy" + (open ? " cartDrawer--open" : "") + (!cart.size ? " cartDrawer--empty" : "")}>
				<div className="cartDrawer__inner overflow-hidden">
					{!cart.size
						? <div class="relative pa4">
								<p className="ma0 pr4 white tr">Your cart is empty.</p>
								<span class="cartDrawer__close absolute top-2 right-2 w1 h1 dib bg-center contain dim pointer" onClick={this.toggleDrawer}></span>
							</div>
						: this.renderCart()
					}
				</div>
			</div>
		);
	}
}

(($) => {
	$(document).ready(() => {
		render(<Cart />, document.getElementById("cartDrawer"));
	});
})(jQuery);