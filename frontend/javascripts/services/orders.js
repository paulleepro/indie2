const axios = require('axios');

window.OrdersService = (() => {

  function getOrder(orderId) {
    return axios.get(`/magento/orders/${orderId}`);
  }

  function getUserOrders(email) {
    return axios.get('/magento/orders', {params: {email}});
  }

  function getOrderShipping(order) {
  	if (
  		!order ||
  		!order.extension_attributes ||
  		!order.extension_attributes.shipping_assignments ||
  		!order.extension_attributes.shipping_assignments[0] ||
  		!order.extension_attributes.shipping_assignments[0].shipping ||
  		!order.extension_attributes.shipping_assignments[0].shipping.address
  	) {
  		return false;
  	}

  	return order.extension_attributes.shipping_assignments[0].shipping.address;
  }

  return {
    getOrder,
    getUserOrders,
    getOrderShipping,
  };

})();