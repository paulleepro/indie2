'use strict';

const {h, render, Component} = require('preact');

const moment = require('moment');

const FieldsetInput = require('../Form/FieldsetInput.jsx');
const FieldsetButton = require('../Form/FieldsetButton.jsx');
const Modal = require('../UI/Modal.jsx');

class Order extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showModal: false,
      modalContent: null,
    };

    this.closeModal = this.closeModal.bind(this);
    this.openTrackingModal = this.openTrackingModal.bind(this);
    this.renderOrderItems = this.renderOrderItems.bind(this);
    this.renderOrderDetails = this.renderOrderDetails.bind(this);
    this.renderOrderActions = this.renderOrderActions.bind(this);
  }

  closeModal(content) {
    this.setState({showModal: false, modalContent: null});
  }

  openTrackingModal() {
    const {order} = this.props;

    const modalContent = (
      <div className="pa3 pa5-l">
        <h2 className="normal">Tracking History</h2>
        <div>
          
        </div>
      </div>
    );

    this.setState({showModal: true, modalContent});
  }

  renderOrderItems() {
    const {order} = this.props;

    return (
      <div className="w-50-l">
        {order.items.map((item, i) => {
          return (<span className="db f3 black ttu underline">{item.name}{(i !== order.items.length - 1 && order.items.length > 1) && ","}</span>);
        })}
        {this.renderOrderActions()}
      </div>
    );
  }

  renderOrderDetails() {
    const {order} = this.props;
    const shippingAddress = OrdersService.getOrderShipping(order);

    let orderStatus;
    if (!order.status) orderStatus = "N/A";
    else if (order.status === "fraud") orderStatus = "Order In Review";
    else orderStatus = order.status.replace(/_/g, " ");
    
    return (
      <div className="w-50-l pl4-l">
        <div className="flex flex-row">
          <p className="w-third mt0 pr3 b f5">Ordered:</p>
          <p className="mt0 f5">{moment(order.created_at).format('MM/DD/YY')}</p>
        </div>
        <div className="flex flex-row">
          <p className="w-third mt0 pr3 b f5">Total:</p>
          <p className="mt0 f5">{Utils.moneyFormat(order.grand_total)}</p>
        </div>
        <div className="flex flex-row">
          <p className="w-third mt0 pr3 b f5">Shipped to:</p>
          <p className="mt0 f5">
            <span className="db">{shippingAddress.firstname} {shippingAddress.lastname}</span>
            <span className="db">{shippingAddress.street.map((line, i) => line + " ")}</span>
            <span className="db">{shippingAddress.city}, {shippingAddress.region_code} {shippingAddress.postcode}</span>
          </p>
        </div>
        <div className="flex flex-row">
          <p className="w-third mt0 pr3 b f5">Order status:</p>
          <p className="mt0 f5 ttc">{orderStatus}</p>
        </div>
      </div>
    );
  }

  renderOrderActions() {
    const {order} = this.props;

    return (
      <div className="mt4 mb4 mb0-l">
        {/* Not part of Phase 1 */}
        {/*<button className="w-100 w-auto-l mr2 pa3 white b ttu bg-navy ba b--navy dim pointer" onClick={this.openTrackingModal}>Track</button>*/}
        <a className="dib w-100 w-auto-l pa3 navy b ttu link ba b--navy dim pointer" href={`mailto:customerservice@indielee.com?subject=Order%20#${order.increment_id}`}>Support</a>
      </div>
    );
  }

  render() {
    const {index, order, ordersCount} = this.props;
    const {showModal, modalContent} = this.state;

    return (
      <div className="order">
        <div className="mb3 mb4-l">
          <span className="dib w-50-l f6 navy b">Order #{order.increment_id}</span>
          <span className="dn dib-l w-50-l navy ttu tr">Order Details</span>
        </div>
        <div className="flex-l mb3-l">
          {this.renderOrderItems()}
          <div className="dn db-l br b--light-grey"></div>
          {this.renderOrderDetails()}
        </div>
        {index !== ordersCount - 1 && <div className="section__content--divider"></div>}

        {!!showModal && <Modal onClose={this.closeModal}>{modalContent}</Modal>}
      </div>
    );
  }
}

module.exports = Order;