const axios = require('axios');
const btoa = require('btoa');

class MagentoService {
  constructor() {
    this.client = axios.create({
      baseURL: process.env.MAGENTO_URL,
      headers: {
        'Authorization': 'Bearer ' + process.env.MAGENTO_ACCESS_TOKEN,
        'Content-Type': 'application/json'
      }
    });

    this.userClient = axios.create({
      baseURL: process.env.MAGENTO_URL,
      headers: {'Content-Type': 'application/json'}
    });
  }

  /* Catalog*/
  getCategories() {
    return this.client.get('categories');
  }

  getCategoryById(id) {
    return this.client.get(`categories/${id}`);
  }

  getProducts() {
    return this.client.get('products');
  }

  getProductBySku(sku) {
    return Promise.all([
      this.client.get(`products/${sku}`), 
      this.client.get(`iwdmultiinventory/source/listForProductBySku/${sku}`)
    ]);
  }

  /* Cart */
  getCart(token) {
    return this.userClient.get('carts/mine', {
      headers: {'Authorization': 'Bearer ' + token}
    });
  }

  getGuestCart(cartId) {
    return this.client.get(`guest-carts/${cartId}`);
  }

  createCart(token) {
    return this.userClient.post('carts/mine', null, {
      headers: {'Authorization': 'Bearer ' + token}
    });
  }

  createGuestCart() {
    return this.client.post('guest-carts');
  }

  addCartItem(token, cartItem) {
    return this.userClient.post('carts/mine/items', {cartItem}, {
      headers: {'Authorization': 'Bearer ' + token}
    });
  }

  addGuestCartItem(cartId, cartItem) {
    return this.client.post(`guest-carts/${cartId}/items`, {cartItem});
  }

  updateCartItem(token, cartItem) {
    return this.userClient.put(`carts/mine/items/${cartItem.itemId}`, {cartItem}, {
      headers: {'Authorization': 'Bearer ' + token}
    });
  }

  updateGuestCartItem(cartId, cartItem) {
    return this.client.put(`guest-carts/${cartId}/items/${cartItem.itemId}`, {cartItem});
  }

  removeCartItem(token, itemId) {
    return this.userClient.delete(`carts/mine/items/${itemId}`, {
      headers: {'Authorization': 'Bearer ' + token}
    });
  }

  removeGuestCartItem(cartId, itemId) {
    return this.client.delete(`guest-carts/${cartId}/items/${itemId}`);
  }

  getCartCoupon(token) {
    return this.userClient.get('carts/mine/coupons', {
      headers: {'Authorization': 'Bearer ' + token}
    });
  }

  getGuestCartCoupon(cartId) {
    return this.client.get(`guest-carts/${cartId}/coupons`);
  }

  putCartCoupon(token, couponCode) {
    return this.userClient.put(`carts/mine/coupons/${couponCode}`, null, {
      headers: {'Authorization': 'Bearer ' + token}
    });
  }

  putGuestCartCoupon(cartId, couponCode) {
    return this.client.put(`guest-carts/${cartId}/coupons/${couponCode}`);
  }

  removeCartCoupon(token) {
    return this.userClient.delete(`carts/mine/coupons`, {
      headers: {'Authorization': 'Bearer ' + token}
    });
  }

  removeGuestCartCoupon(cartId) {
    return this.client.delete(`guest-carts/${cartId}/coupons`);
  }

  getCartTotal(token) {
    return this.userClient.get('carts/mine/totals', {
      headers: {'Authorization': 'Bearer ' + token}
    });
  }

  getGuestCartTotal(cartId) {
    return this.client.get(`guest-carts/${cartId}/totals`);
  }

  /* Checkout */
  getCheckoutShippingOptions(token, address) {
    return this.userClient.post('carts/mine/estimate-shipping-methods', {address}, {
      headers: {'Authorization': 'Bearer ' + token}
    });
  }

  getGuestCheckoutShippingOptions(cartId, address) {
    return this.client.post(`guest-carts/${cartId}/estimate-shipping-methods`, {address});
  }

  postCheckoutShipping(token, addressInformation) {
    return this.userClient.post('carts/mine/shipping-information', {addressInformation}, {
      headers: {'Authorization': 'Bearer ' + token}
    });
  }

  postGuestCheckoutShipping(cartId, addressInformation) {
    return this.client.post(`guest-carts/${cartId}/shipping-information`, {addressInformation});
  }

  postCheckoutBilling(token, address) {
    return this.userClient.post('carts/mine/billing-address', {address}, {
      headers: {'Authorization': 'Bearer ' + token}
    });
  }

  postGuestCheckoutBilling(cartId, address) {
    return this.client.post(`guest-carts/${cartId}/billing-address`, {address});
  }

  postCheckout(payload) {
    return axios.post(process.env.MAGENTO_DOMAIN + "/capacity/process.php", payload, {
      headers: {
        'Authorization': 'Bearer ' + process.env.MAGENTO_ACCESS_TOKEN,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
  }

  /* Account */
  checkEmail(email) {
    return this.client.post('customers/isEmailAvailable', {customerEmail: email});
  }

  authorizeUser(email, password) {
    return this.client.post('integration/customer/token', {username: email, password});
  }

  createUser(user) {
    return this.client.post('customers', user);
  }

  getUser(token) {
    return this.userClient.get('customers/me', {
      headers: {'Authorization': 'Bearer ' + token}
    });
  }

  updateUser(token, user) {
    return this.userClient.put('customers/me', user, {
      headers: {'Authorization': 'Bearer ' + token}
    });
  }

  // Need to use app token for this endpoint
  deleteUserAddress(addressId) {
    return this.client.delete(`addresses/${addressId}`);
  }

  updateUserPassword(token, currentPassword, newPassword) {
    return this.userClient.put('customers/me/password', {currentPassword, newPassword}, {
      headers: {'Authorization': 'Bearer ' + token}
    });
  }

  requestUserPassword(email) {
    return this.client.put('customers/password', {email, template: 'email_reset'});
  }

  // Different endpoint than the rest
  checkResetPasswordToken(customerId, token) {
    return this.client.get(`${process.env.MAGENTO_DOMAIN}/rest/all/V1/customers/${customerId}/password/resetLinkToken/${token}`);
  }

  resetPassword(payload) {
    return this.client.post(`customers/resetPassword`, payload);
  }

  /* Orders */
  getOrder(orderId) {
    return this.client.get(`orders/${orderId}`);
  }
  
  getOrders(email) {
    return this.client.get('orders', {
      params: {
        'searchCriteria[filterGroups][0][filters][0][field]': 'customer_email',
        'searchCriteria[filterGroups][0][filters][0][value]': email
      }
    });
  }

  /* Options */
  getCountries() {
  	return this.client.get('directory/countries');
  }
}

module.exports = MagentoService;