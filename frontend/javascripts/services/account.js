/* NOTES 
 *
 * il_u stands for indielee_user
 *
 */

const axios = require('axios');

window.AccountService = (() => {

  // email is not available when an account is created with it
  function checkEmailIfAvailable(email) {
    return axios.post('/magento/account/email-is-available', {email});
  }

  // generate customer auth token, then get customer profile
  function login(email, password) {
    return new Promise((resolve, reject) => {
      axios.post('/magento/account/authorize', {email, password})
        .then((res) => {
          window.dispatchEvent(new CustomEvent('login-update'));
          resolve(res);
        })
        .catch((err) => {
          console.error(err);
          logout();
          reject(err);
        });
    });
  }

  function clearLogin() {
    window.localStorage.removeItem('il_u');
  }

  function logout() {
    return new Promise((resolve, reject) => {
      clearLogin();

      axios.post('/magento/account/logout')
        .then((res) => {
          window.dispatchEvent(new CustomEvent('login-update'));
          resolve(res);
        })
        .catch((err) => {
          console.error("Logout failed.");
          alert("Something went wrong. Please try again.");
          reject(err);
        });
    });
  }

  function register(email, password, firstname, lastname) {
    return new Promise((resolve, reject) => {
      axios.post('/magento/account', {customer: {email, firstname, lastname}, password})
        .then((res) => {
          window.localStorage.setItem('il_u', JSON.stringify(res.data));
          window.dispatchEvent(new CustomEvent('registered'));
          window.dispatchEvent(new CustomEvent('login-update'));
          resolve(res);
        })
        .catch((err) => {
          console.error(err);
          if (!!err.response && err.response.status === 401) logout();
          reject(err);
        });
    });
  }

  function getUser() {
    const user = window.localStorage.getItem('il_u');
    return !!user ? JSON.parse(user) : null;
  }

  function getMagentoUser() {
    return new Promise((resolve, reject) => {
      axios.get('/magento/account/me')
        .then((res) => {
          window.localStorage.setItem('il_u', JSON.stringify(res.data));
          resolve(res);
        })
        .catch((err) => {
          if (!!err.response && [401, 400].includes(err.response.status)) logout();
          reject(err);
        });
    });
  }

  function updateUser(customer) {
    return new Promise((resolve, reject) => {
      axios.put('/magento/account/me', {customer})
        .then((res) => {
          window.localStorage.setItem('il_u', JSON.stringify(customer));
          window.dispatchEvent(new CustomEvent('user-updated'));
          resolve(res);
        })
        .catch((err) => {
          console.error(err);
          if (!!err.response && err.response.status === 401) logout();
          reject(err);
        })
    });
  }

  function deleteUserAddress(addressId) {
    return axios.delete(`/magento/account/addresses/${addressId}`);
  }

  function updateUserPassword(currentPassword, newPassword) {
    return axios.put('/magento/account/password', {currentPassword, newPassword});
  }

  function requestResetPassword(email) {
    return axios.post('/magento/account/request-reset-password', {email});
  }

  function resetPassword(email, password, token) {
    return axios.post('/magento/account/reset-password', {email, password, token});
  }

  function signupEmail(email) {
    // using ajax instead of axios to handle CORS
    $.ajax({
      type: "GET",
      url: 'https://indielee.us5.list-manage.com/subscribe/post-json?u=3128754535c6160da2515fed4&id=d25cb18157&c=?',
      crossDomain: true,
      data: 'EMAIL=' + email + '&status=subscribed',
      dataType: 'json',
      contentType: "application/json; charset=utf-8",
      error: (error) => {
        console.error('MailChimp error: ', error);
      }
    });
  }

  return {
    checkEmailIfAvailable,
    login,
    clearLogin,
    logout,
    register,
    getUser,
    getMagentoUser,
    updateUser,
    deleteUserAddress,
    updateUserPassword,
    requestResetPassword,
    resetPassword,
    signupEmail,
  };

})();