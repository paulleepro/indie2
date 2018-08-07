'use strict';

const {h, render, Component} = require('preact');

const axios = require('axios');

const flow = require('lodash/fp/flow');
const find = require('lodash/find');
const map = require('lodash/fp/map');
const sortBy = require('lodash/fp/sortBy');
const validateCreditCard = require('card-validator');

const {CHECKOUT_SECTIONS, CREDIT_CARD_TYPES, ORDER_STATUSES} = require('../../constants.js');

const Section = require('../UI/Section.jsx');
const SectionNavigator = require('../UI/SectionNavigator.jsx');
const FieldsetInput = require('../Form/FieldsetInput.jsx');
const FieldsetSelect = require('../Form/FieldsetSelect.jsx');
const FieldsetCheckbox = require('../Form/FieldsetCheckbox.jsx');
const FieldsetRadio = require('../Form/FieldsetRadio.jsx');
const FieldsetButton = require('../Form/FieldsetButton.jsx');

class Checkout extends Component {
  constructor(props) {
    super(props);

    this.user = AccountService.getUser();

    // prefill shipping and billing if user is logged in
    let defaultShipping, defaultBilling, shippingAsBilling = true;

    if (this.user && this.user.addresses.length) {
      defaultShipping = find(this.user.addresses, address => address.default_shipping);
      defaultBilling = find(this.user.addresses, address => address.default_billing);

      if (defaultShipping && defaultBilling) shippingAsBilling = defaultShipping.id === defaultBilling.id;
      else if (defaultShipping) shippingAsBilling = true;
      else if (defaultBilling) shippingAsBilling = false;
      else shippingAsBilling = true;

      if (defaultShipping) this.defaultShipping = true;
    }

    this.state = {
      cart: CartService.getCart(),
      cartSize: CartService.getCartSize(),
      cartSubtotal: CartService.getCartSubtotal(),
      couponCode: CartService.getCouponCode(),
      couponDiscount: CartService.getCouponDiscount(),
      shippingTotal: 0,
      taxTotal: 0,
      grandTotal: 0,
      selectedSection: 0,
      sectionNavigatorVisible: true,
      yourInformationValid: !!this.user ? (!!this.user.email && !!this.user.firstname && !!this.user.lastname) : false,
      shippingInformationValid: !!defaultShipping,
      shippingMethodValid: false,
      paymentInformationValid: false,
      email: !!this.user ? this.user.email : null,
      firstname: !!this.user ? this.user.firstname : null,
      lastname: !!this.user ? this.user.lastname : null,
      defaultShipping: defaultShipping,
      shippingFirstname: !!defaultShipping ? defaultShipping.firstname : null,
      shippingLastname: !!defaultShipping ? defaultShipping.lastname : null, 
      shippingAddress1: !!defaultShipping ? defaultShipping.street[0] : null,
      shippingAddress2: !!defaultShipping ? defaultShipping.street[1] : null,
      shippingCity: !!defaultShipping ? defaultShipping.city : null,
      shippingCountryId: !!defaultShipping ? defaultShipping.country_id : null,
      shippingRegionId: !!defaultShipping ? defaultShipping.region_id : null,
      shippingPostcode: !!defaultShipping ? defaultShipping.postcode : null,
      shippingPhoneNumber: !!defaultShipping ? defaultShipping.telephone : null,
      shippingOptionsLoading: false,
      shippingOptions: [],
      shippingMethod: null,
      paymentFirstname: null,
      paymentLastname: null, 
      paymentCardType: 'visa',
      paymentCardNumber: null,
      paymentCardExpMonth: null,
      paymentCardExpYear: null,
      paymentCardCvv: null,
      paymentLoading: false,
      paymentCardInfoError: [],
      billingFirstname: !!defaultBilling ? defaultBilling.firstname : null,
      billingLastname: !!defaultBilling ? defaultBilling.lastname : null, 
      billingAddress1: !!defaultBilling ? defaultBilling.street[0] : null,
      billingAddress2: !!defaultBilling ? defaultBilling.street[1] : null,
      billingCity: !!defaultBilling ? defaultBilling.city : null,
      billingCountryId: !!defaultBilling ? defaultBilling.country_id : null, 
      billingRegionId: !!defaultBilling ? defaultBilling.region_id : null,
      billingPostcode: !!defaultBilling ? defaultBilling.postcode : null,
      billingPhoneNumber: !!defaultBilling ? defaultBilling.telephone : null,
      shippingAsBilling,
      optInUpdates: false,
      optInTerms: false,
      orderLoading: false,
      orderId: null,
      orderConfirmation: null,
      orderError: null,
      countries: [],
    };

    this.setSection = this.setSection.bind(this);
    this.selectAddress = this.selectAddress.bind(this);
    this.setShipping = this.setShipping.bind(this);

    this.validateYourInformation = this.validateYourInformation.bind(this);
    this.validateShippingInformation = this.validateShippingInformation.bind(this);
    this.validatePaymentInformation = this.validatePaymentInformation.bind(this);

    this.processCheckout = this.processCheckout.bind(this);

    this.renderYourInformation = this.renderYourInformation.bind(this);
    this.renderShippingInformation = this.renderShippingInformation.bind(this);
    this.renderShippingMethods = this.renderShippingMethods.bind(this);
    this.renderPaymentInformation = this.renderPaymentInformation.bind(this);
    this.renderReviewOrder = this.renderReviewOrder.bind(this);
    this.renderTotal = this.renderTotal.bind(this);
    this.renderConfirmation = this.renderConfirmation.bind(this);
  }

  componentDidMount() {
    OptionsService.getCountries().then(res => this.setState({countries: res})).catch((err) => {});

    CartService.getMagentoCart()
      .then((cartData) => {
        if (this.state.defaultShipping) this.getShippingOptions(this.state.defaultShipping);
      })
      .catch((err) => {
        this.setState({shippingOptionsLoading: false});

        // if user used to be logged in but token expired, go back home
        if (err && err.response && err.response.status === 401) {
          console.error("Cart access not allowed", err);
          window.history.pushState({}, document.title, window.location.origin);
          window.location.reload();
        }
      });
    
    if (this.user) {
      window.dataLayer.push({
        event:"EEcheckout",
        ecommerce: {
          checkout: {
            actionField: {
              step: 1,
              option: "Personal Information"
            },
            products: Utils.mapThroughMap(this.state.cart, (line) => {
              return {
                id: line.item.sku,
                name: line.item.name,
                price: parseFloat(line.item.price),
                variant: line.item.variation,
                brand: "Indie Lee",
                quantity: line.quantity
              };
            })
          }
        }
      });
    }

    if (this.defaultShipping) {
      window.dataLayer.push({
        event:"EEcheckout",
        ecommerce: {
          checkout: {
            actionField: {
              step: 2,
              option: "Shipping Address"
            }
          }
        }
      });
    }

    // if cart is updated via cart drawer on checkout page, update state with new data
    window.addEventListener('cart-update', () => {
      if (!this.state.orderId && window.location.pathname.indexOf("checkout") >= 0) {
        const cart = CartService.getCart();

        this.setState({
          cart: CartService.getCart(),
          cartSize: CartService.getCartSize(),
          cartSubtotal: CartService.getCartSubtotal(),
          couponCode: CartService.getCouponCode(),
          couponDiscount: CartService.getCouponDiscount(),
        });

        if (this.state.shippingInformationValid) {
          const streets = [this.state.shippingAddress1];
          if (!!this.state.shippingAddress2) streets.push(this.state.shippingAddress2);

          this.getShippingOptions({
            region: {id: this.state.shippingRegionId},
            country_id: this.state.shippingCountryId,
            street: streets,
            telephone: this.state.shippingPhoneNumber,
            postcode: this.state.shippingPostcode,
            city: this.state.shippingCity,
          }, () => {
            // only run if shipping information is valid, and shipping method was selected
            if (this.state.shippingMethodValid && this.state.shippingMethod) {
              this.setShipping({value: this.state.shippingMethod.method_code});
            }
          });
        }
      }
    });

    window.addEventListener('toggle-opened', () => this.setState({sectionNavigatorVisible: false}));
    window.addEventListener('toggle-closed', () => this.setState({sectionNavigatorVisible: true}));
  }

  setSection(i) {
    const section = CHECKOUT_SECTIONS[i];
    const prevSection = this.state.selectedSection;

    this.setState({selectedSection: i});

    if (!Utils.isTouchDevice() || (Utils.isTouchDevice() && prevSection !== i)) {
      $('html, body').animate({scrollTop: $(this[section.selector]).offset().top - 65}, 250);
    }
  }

  openCart(e) {
    // prevent scrollToSection from triggering
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent('cart-toggle', {detail: {force: true}}));
    $('html, body').animate({scrollTop: 0}, 200);
  }

  // used for both shipping and billing selections
  selectAddress(type, address) {
    const addressObj = JSON.parse(address);

    let state = {};
    // use this to force user to get new shipping methods
    if (type === 'shipping') state.shippingInformationValid = false;

    state[type + 'Firstname'] = addressObj.firstname;
    state[type + 'Lastname'] = addressObj.lastname;
    state[type + 'Address1'] = addressObj.street[0];
    state[type + 'Address2'] = addressObj.street[1];
    state[type + 'City'] = addressObj.city;
    state[type + 'CountryId'] = addressObj.country_id;
    state[type + 'RegionId'] = addressObj.region_id;
    state[type + 'Postcode'] = addressObj.postcode;
    state[type + 'PhoneNumber'] = addressObj.telephone;

    this.setState(state);

    if (type === 'shipping') {
      window.dataLayer.push({
        event:"EEcheckout",
        ecommerce: {
          checkout: {
            actionField: {
              step: 2,
              option: "Shipping Address"
            }
          }
        }
      });
    }
  }

  getShippingOptions(address, cb) {
    this.setState({shippingOptionsLoading: true});

    const payload = {
      id: address.id,
      region_id: address.region.id,
      country_id: address.country_id,
      street: address.street,
      telephone: address.telephone,
      postcode: address.postcode,
      city: address.city,
      firstname: address.firstname,
      lastname: address.lastname,
    };

    CheckoutService.getMagentoShippingOptions(payload)
      .then((res) => {
        this.setState({shippingOptionsLoading: false, shippingOptions: res.data}, () => {
          !!cb && cb();
        });
      })
      .catch((err) => {
        this.setState({shippingOptionsLoading: false});
        console.error("getMagentoShippingOptions err: ", err);
      });
  }

  // NOTE: This is called when a shipping method is selected
  // It will set both shipping address and selected method to the Magento cart
  setShipping(shippingOption) {
    const selectedMethod = find(this.state.shippingOptions, option => option.method_code === shippingOption.value);

    if (!selectedMethod) {
      this.setState({
        shippingTotal: 0,
        taxTotal: 0,
        grandTotal: 0,
        shippingMethodValid: false,
        shippingMethod: null,
      });
    } else {
      const streets = [this.state.shippingAddress1];
      if (this.state.shippingAddress2) streets.push(this.state.shippingAddress2);

      const payload = {
        shipping_address: {
          firstname: this.state.shippingFirstname,
          lastname: this.state.shippingLastname,
          email: this.state.email,
          street: streets,
          city: this.state.shippingCity,
          country_id: this.state.shippingCountryId,
          region_id: this.state.shippingRegionId,
          telephone: this.state.shippingPhoneNumber,
          postcode: this.state.shippingPostcode,
        },
        shipping_method_code: selectedMethod.method_code,
        shipping_carrier_code: selectedMethod.carrier_code,
      };

      CheckoutService.setMagentoShipping(payload)
        .then((res) => {
          this.setState({
            shippingTotal: res.data.totals.base_shipping_amount, 
            taxTotal: res.data.totals.base_tax_amount, 
            grandTotal: res.data.totals.base_grand_total
          });

          window.dataLayer.push({
            event:"EEcheckout",
            ecommerce: {
              checkout: {
                actionField: {
                  step: 3,
                  option: selectedMethod.method_title
                }
              }
            }
          });
        })
        .catch((err) => {});

      this.setSection(3);
      this.setState({shippingMethodValid: true, shippingMethod: selectedMethod});
    }
  }

  validateYourInformation(e) {
    if (e) e.preventDefault();

    if (!this[CHECKOUT_SECTIONS[0].selector].checkValidity()) {
      this[CHECKOUT_SECTIONS[0].selector + "-submit"].click();
      return;
    }

    this.setSection(1);
    this.setState({
      yourInformationValid: true,
      orderError: null,
    });

    // gtm tagging on book form open
    window.dataLayer.push({'event': 'personal-info-completed'});
    window.dataLayer.push({
      event:"EEcheckout",
      ecommerce: {
        checkout: {
          actionField: {
            step: 1,
            option: "Personal Information"
          },
          products: Utils.mapThroughMap(this.state.cart, (line) => {
            return {
              id: line.item.sku,
              name: line.item.name,
              price: parseFloat(line.item.price),
              variant: line.item.variation,
              brand: "Indie Lee",
              quantity: line.quantity
            };
          })
        }
      }
    });
  }

  // NOTE: Shipping address is set to Magento cart when shipping method is selected
  validateShippingInformation(e) {
    if (e) e.preventDefault();

    if (!this[CHECKOUT_SECTIONS[1].selector].checkValidity()) {
      this[CHECKOUT_SECTIONS[1].selector + "-submit"].click();
      return;
    }

    this.setSection(2);
    this.setState({
      shippingInformationValid: true,
      orderError: null,
    });

    const streets = [this.state.shippingAddress1];
    if (!!this.state.shippingAddress2) streets.push(this.state.shippingAddress2);

    // NOTE: Just need this info to get available shipping methods
    this.getShippingOptions({
      region: {id: this.state.shippingRegionId},
      country_id: this.state.shippingCountryId,
      street: streets,
      telephone: this.state.shippingPhoneNumber,
      postcode: this.state.shippingPostcode,
      city: this.state.shippingCity,
    });

    // gtm tagging on book form open
    window.dataLayer.push({'event': 'shipping-info-added'});
    window.dataLayer.push({
      event:"EEcheckout",
      ecommerce: {
        checkout: {
          actionField: {
            step: 2,
            option: "Shipping Address"
          },
          products: Utils.mapThroughMap(this.state.cart, (line) => {
            return {
              id: line.item.sku,
              name: line.item.name,
              price: parseFloat(line.item.price),
              variant: line.item.variation,
              brand: "Indie Lee",
              quantity: line.quantity
            };
          })
        }
      }
    });
  }

  validateShippingMethod(e) {
    if (e) e.preventDefault();

    if (!this[CHECKOUT_SECTIONS[2].selector].checkValidity()) {
      this[CHECKOUT_SECTIONS[2].selector + "-submit"].click();
      return;
    }

    this.setState({orderError: null});

    // gtm tagging on book form open
    window.dataLayer.push({'event': 'shipping-method-selected'});
  }

  validatePaymentInformation(e) {
    let numberValidation;

    if (this.state.paymentCardNumber) {
      numberValidation = validateCreditCard.number(this.state.paymentCardNumber);

      if (numberValidation.card && this.state.paymentCardType !== numberValidation.card.type) {
        this.setState({paymentCardType: numberValidation.card.type});
      }
    }
    
    this.setState({paymentCardInfoError: []});

    if (!this[CHECKOUT_SECTIONS[3].selector].checkValidity()) {
      this[CHECKOUT_SECTIONS[3].selector + "-submit"].click();
      return;
    }

    if (!numberValidation.isValid) {
      this.setState({paymentCardInfoError: [...this.state.paymentCardInfoError, 'Invalid card number. Please try again.']});
    }

    if (numberValidation.card.code.size !== this.state.paymentCardCvv.length) {
      this.setState({paymentCardInfoError: [...this.state.paymentCardInfoError, `Invalid ccv number. Number must be ${numberValidation.card.code.size} digits.`]});
    }

    if (this.state.paymentCardExpMonth.length !== 2) {
      this.setState({paymentCardInfoError: [...this.state.paymentCardInfoError, 'Month must be 2 digits long']});
    }

    if (this.state.paymentCardExpYear.length !== 4) {
      this.setState({paymentCardInfoError: [...this.state.paymentCardInfoError, 'Year must be 4 digits long']});
    }

    if(this.state.paymentCardInfoError.length) {
      return;
    }

    let streets = [],
        billingAddress;

    if (!this.state.shippingAsBilling) {
      streets = [this.state.billingAddress1];
      if (this.state.billingAddress2) streets.push(this.state.billingAddress2);

      billingAddress = {
        firstname: this.state.billingFirstname,
        lastname: this.state.billingLastname,
        email: this.state.email,
        street: streets,
        city: this.state.billingCity,
        country_id: this.state.billingCountryId,
        region_id: this.state.billingRegionId,
        telephone: this.state.billingPhoneNumber,
        postcode: this.state.billingPostcode,
      };
    } else {
      streets = [this.state.shippingAddress1];
      if (this.state.shippingAddress2) streets.push(this.state.shippingAddress2);

      billingAddress = {
        firstname: this.state.shippingFirstname,
        lastname: this.state.shippingLastname,
        email: this.state.email,
        street: streets,
        city: this.state.shippingCity,
        country_id: this.state.shippingCountryId,
        region_id: this.state.shippingRegionId,
        telephone: this.state.shippingPhoneNumber,
        postcode: this.state.shippingPostcode,
      };
    }

    CheckoutService.setMagentoBilling(billingAddress);

    this.setSection(4);
    this.setState({
      paymentLoading: false, 
      paymentInformationValid: true,
      orderError: null
    });

    // gtm tagging on book form open
    window.dataLayer.push({'event': 'payment-info-entered'});
    window.dataLayer.push({
      event:"EEcheckout",
      ecommerce: {
        checkout: {
          actionField: {
            step: 4,
            option: "Payment Method"
          }
        }
      }
    });
  }

  processCheckout(e) {
    !!e && e.preventDefault();

    if (!this[CHECKOUT_SECTIONS[5].selector].checkValidity()) {
      this[CHECKOUT_SECTIONS[5].selector + "-submit"].click();
      return;
    }

    if (!this.state.optInTerms) {
      alert("Please accept the Terms & Conditions before proceeding.");
      return;
    }

    this.setState({
      orderLoading: true,
      orderError: null,
    });

    const {paymentCardNumber, grandTotal, taxTotal, shippingTotal, couponCode} = this.state;
    const last4 = paymentCardNumber.slice(paymentCardNumber.length - 4, paymentCardNumber.length);
    const now = new Date();

    if (this.state.optInUpdates) {
      AccountService.signupEmail(this.state.email);
      // gtm tagging on book form open
      window.dataLayer.push({'event': 'email-newsletter-registration-completed'});
    }

    axios.get("https://api.ipify.org?format=json")
      .then((res) => {
        const payload = {
          cart_id: CartService.getCartId(),
          cc_type: this.state.paymentCardType,
          cc_owner: this.state.paymentFirstname + " " + this.state.paymentLastname,
          cc_number: paymentCardNumber,
          cc_cid: this.state.paymentCardCvv,
          cc_exp_month: this.state.paymentCardExpMonth,
          cc_exp_year: this.state.paymentCardExpYear,
          x_customer_ip: res.data.ip,
        };

        CheckoutService.createOrder(payload)
          .then((createOrderRes) => {
            const orderId = createOrderRes.data.order_id;
            const orderIncrementId = createOrderRes.data.order_increment_id;
            const orderStatus = createOrderRes.data.order_status;
            const orderMessage = createOrderRes.data.order_status_message || createOrderRes.data; // this is in case data doesn't come back as object - could be coming back as string error message
            const orderStatusData = ORDER_STATUSES.find(s => s.value === orderStatus);

            if (orderStatusData && orderStatusData.isSuccessful) {
              OrdersService.getOrder(orderId)
                .then((getOrderRes) => {
                  // need to wait for cartId to be set for check in componentDidMount
                  this.setState({
                    orderId,
                    orderIncrementId,
                    orderLoading: false, 
                    orderConfirmation: getOrderRes.data
                  }, CartService.flushCartData);

                  // gtm tagging on book form open
                  window.dataLayer.push({'event': 'purchase-completed'});
                  window.dataLayer.push({
                    event: "EEtransaction",
                    ecommerce: {
                      purchase: {
                        actionField:  {
                          id: orderIncrementId,
                          affiliation: "B2C Storefront",
                          revenue: grandTotal,
                          tax: taxTotal,
                          shipping: shippingTotal,
                          coupon: couponCode
                        },
                        products: Utils.mapThroughMap(this.state.cart, (line) => {
                          return {
                            id: line.item.sku,
                            name: line.item.name,
                            price: parseFloat(line.item.price),
                            variant: line.item.variation,
                            brand: "Indie Lee",
                            quantity: line.quantity
                          };
                        })
                      }
                    }
                  });
                })
                .catch((err) => {
                  console.error("get order error:", err);
                  this.setState({
                    orderLoading: false, 
                    orderError: Utils.getMagentoErrorMessage(err)
                  });
                });
            } else {
              this.setState({
                orderLoading: false, 
                orderError: orderMessage
              });
            }
          })
          .catch((err) => {
            this.setState({
              orderLoading: false, 
              orderError: Utils.getMagentoErrorMessage(err)
            });
          });
      })
      .catch((err) => {
        console.error(err);
        this.setState({
          orderLoading: false, 
          orderError: Utils.getMagentoErrorMessage(err)
        });
      });
  }

  renderYourInformation() {
    const {email, firstname, lastname, orderConfirmation} = this.state;

    return (
      <Section 
        className={!!orderConfirmation && 'o-50'}
        title={CHECKOUT_SECTIONS[0].label} 
        content={
          <form ref={el => this[CHECKOUT_SECTIONS[0].selector] = el} className="mw30rem-l pt4 pl4-l">
            <FieldsetInput className="mb2" label="Email Address" type="email" value={email} onClick={e => this.setSection(0)} onKeyDown={e => Utils.onKeyDown(e, this.validateYourInformation)} onChange={e => this.setState({email: e.target.value})} required />
            <FieldsetInput className="mb2" label="First Name" value={firstname} onClick={e => this.setSection(0)} onKeyDown={e => Utils.onKeyDown(e, this.validateYourInformation)} onChange={e => this.setState({firstname: e.target.value})} required />
            <FieldsetInput className="mb4" label="Last Name" value={lastname} onClick={e => this.setSection(0)} onKeyDown={e => Utils.onKeyDown(e, this.validateYourInformation)} onChange={e => this.setState({lastname: e.target.value})} required />
            {!this.user && <p className="f5">Have an account? <span className="navy underline pointer dim" onClick={() => window.dispatchEvent(new CustomEvent('login-open'))}>Login now</span></p>}
            <FieldsetButton className="mb4 mb0-l" type="button" text="Continue to shipping" onClick={this.validateYourInformation} />
            <button ref={el => this[CHECKOUT_SECTIONS[0].selector + "-submit"] = el} hidden />
          </form>
        } 
      />
    );
  }

  renderShippingInformation() {
    const {
      shippingFirstname,
      shippingLastname,
      shippingAddress1, 
      shippingAddress2, 
      shippingCity, 
      shippingCountryId, 
      shippingRegionId, 
      shippingPostcode, 
      shippingPhoneNumber, 
      yourInformationValid, 
      shippingOptions,
      shippingMethod,
      countries,
      orderConfirmation,
    } = this.state;

    const disabled = !yourInformationValid;

    // If loading async, wait for countries to be ready
    if (!countries) return <div className="loading loading-small mt4"></div>;

    // Prep list of countries for the dropdown selector
    const countriesList = flow(
      map(country => { return {value: country.two_letter_abbreviation, text: country.full_name_locale}; }),
      sortBy(country => country.text)
    )(countries);

    const country = !!shippingCountryId 
      ? find(countries, c => c.two_letter_abbreviation == shippingCountryId) 
      : null;

    const availableRegions = (!!country && !!country.available_regions) 
      ? flow(
        map(region => { return {value: region.id, text: region.name}; }),
        sortBy(region => region.text)
      )(country.available_regions)
      : [{value: null, text: "-"}];

    const addressBook = (!this.user || !this.user.addresses.length)
      ? []
      : this.user.addresses.map((address) => {
        return {
          value: JSON.stringify(address),
          text: `${address.street[0]} ${(address.street[1] || "")} ${address.city}, ${address.region.region_code} ${address.postcode}`
        };
      });

    return (
      <Section
        className={"bg-offwhite" + (!!orderConfirmation ? " o-50" : "")}
        title={CHECKOUT_SECTIONS[1].label}
        content={
          <form ref={el => this[CHECKOUT_SECTIONS[1].selector] = el} className={"mw30rem-l pt4 pl4-l" + (disabled ? " checkout--invalid" : "")}>
            {!!addressBook.length &&
              <FieldsetSelect className="mb2 cf" label="Select From Address Book" options={addressBook} onClick={e => this.setSection(1)} onKeyDown={e => Utils.onKeyDown(e, this.validateShippingInformation)} onChange={e => this.selectAddress('shipping', e.target.value)} required />
            }
            <FieldsetInput className="fl w-50 pr2 mb2" label="First Name" value={shippingFirstname} onClick={e => this.setSection(1)} onKeyDown={e => Utils.onKeyDown(e, this.validateShippingInformation)} onChange={e => this.setState({shippingFirstname: e.target.value})} required disabled={disabled} />
            <FieldsetInput className="fl w-50 mb2" label="Last Name" value={shippingLastname} onClick={e => this.setSection(1)} onKeyDown={e => Utils.onKeyDown(e, this.validateShippingInformation)} onChange={e => this.setState({shippingLastname: e.target.value})} required disabled={disabled} />
            <FieldsetInput className="mb2" label="Shipping Address" value={shippingAddress1} onClick={e => this.setSection(1)} onKeyDown={e => Utils.onKeyDown(e, this.validateShippingInformation)} onChange={e => this.setState({shippingAddress1: e.target.value})} required disabled={disabled} />
            <FieldsetInput className="mb2" label="Apt / Floor / Suite" value={shippingAddress2} onClick={e => this.setSection(1)} onKeyDown={e => Utils.onKeyDown(e, this.validateShippingInformation)} onChange={e => this.setState({shippingAddress2: e.target.value})} disabled={disabled} />
            <FieldsetInput className="fl w-50 mb2 pr2" label="City" value={shippingCity} onClick={e => this.setSection(1)} onKeyDown={e => Utils.onKeyDown(e, this.validateShippingInformation)} onChange={e => this.setState({shippingCity: e.target.value})} required disabled={disabled} />
            <FieldsetInput className="fl w-50 mb2" label="Post Code" value={shippingPostcode} onClick={e => this.setSection(1)} onKeyDown={e => Utils.onKeyDown(e, this.validateShippingInformation)} onChange={e => this.setState({shippingPostcode: e.target.value})} required disabled={disabled} />
            <FieldsetSelect className={"fl mb2 cf" + (!!country && !country.available_regions ? " w-100" : " w-50 pr2")} label="Country" value={shippingCountryId} options={countriesList} onClick={e => this.setSection(1)} onKeyDown={e => Utils.onKeyDown(e, this.validateShippingInformation)} onChange={e => this.setState({shippingCountryId: e.target.value})} required />
            {(!!country && !country.available_regions) 
              ? null
              : <FieldsetSelect className="fl w-50 mb2 cf" label={!!country && country.two_letter_abbreviation === "US" ? "State" : "Region"} value={shippingRegionId} options={availableRegions} onClick={e => this.setSection(1)} onKeyDown={e => Utils.onKeyDown(e, this.validateShippingInformation)} onChange={e => this.setState({shippingRegionId: e.target.value})} required />
            }
            <FieldsetInput className="mb4" label="Phone Number" type="tel" value={shippingPhoneNumber} onClick={e => this.setSection(1)} onKeyDown={e => Utils.onKeyDown(e, this.validateShippingInformation)} onChange={e => this.setState({shippingPhoneNumber: e.target.value})} required disabled={disabled} /> 
            <FieldsetButton className="mb4 mb0-l" type="button" text="Continue to shipping method" onClick={this.validateShippingInformation} disabled={disabled} />
            <button ref={el => this[CHECKOUT_SECTIONS[1].selector + "-submit"] = el} hidden disabled={disabled} />
          </form>
        }
      />
    );
  }

  renderShippingMethods() {
    const {shippingOptionsLoading, shippingOptions, shippingMethod, yourInformationValid, shippingInformationValid, orderConfirmation} = this.state;
    const disabled = !yourInformationValid || !shippingInformationValid;
    const options = shippingOptions.map((option) => { return {value: option.method_code, label: `${option.method_title} - ${Utils.moneyFormat(option.amount)}`}; });

    let content;

    if (shippingOptionsLoading) content = <div ref={el => this[CHECKOUT_SECTIONS[2].selector] = el} className={"loading loading-small center ml4-l mt4 mb3" + (disabled ? " checkout--invalid" : "")}></div>;
    else if (!shippingOptions.length) content = <p ref={el => this[CHECKOUT_SECTIONS[2].selector] = el} className={"mt4 pl4-l mb3 f5" + (disabled ? " checkout--invalid" : "")}>No shipping options available.</p>;
    else content = 
      <form ref={el => this[CHECKOUT_SECTIONS[2].selector] = el} className={"mw30rem-l pt4 pl4-l" + (disabled ? " checkout--invalid" : "")}>
        <FieldsetRadio className="mb3" label="Select Preferred Shipping Method" name="shippingOption" options={options} onKeyDown={e => Utils.onKeyDown(e, this.validateShippingMethod)} onChange={this.setShipping} selected={shippingMethod && {value: shippingMethod.method_code}} required disabled={disabled} />
        <FieldsetButton className="mb4 mb0-l" type="button" text="Continue to payment" onClick={this.validateShippingMethod} disabled={disabled} />
        <button ref={el => this[CHECKOUT_SECTIONS[2].selector + "-submit"] = el} hidden disabled={disabled} />
      </form>;

    return (
      <Section
        className={!!orderConfirmation && 'o-50'}
        title={CHECKOUT_SECTIONS[2].label}
        content={content}
      />
    );
  }

  renderPaymentInformation() {
    const {
      yourInformationValid, 
      shippingInformationValid, 
      shippingMethodValid,
      billingFirstname, 
      billingLastname,
      billingAddress1,
      billingAddress2,
      billingCity,
      billingCountryId,
      billingRegionId,
      billingPostcode,
      billingPhoneNumber,
      shippingAsBilling,
      countries,
      orderConfirmation,
      paymentCardInfoError
    } = this.state;

    const disabled = !yourInformationValid || !shippingInformationValid || !shippingMethodValid;

    // Prep list of countries for the dropdown selector
    const countriesList = flow(
      map(country => { return {value: country.two_letter_abbreviation, text: country.full_name_locale}; }),
      sortBy(country => country.text)
    )(countries);

    const country = !!billingCountryId 
      ? find(countries, c => c.two_letter_abbreviation == billingCountryId) 
      : null;

    const availableRegions = (!!country && !!country.available_regions) 
      ? flow(
        map(region => { return {value: region.id, text: region.name}; }),
        sortBy(region => region.text)
      )(country.available_regions)
      : [{value: null, text: "-"}];

    const addressBook = (!this.user || !this.user.addresses.length)
      ? []
      : this.user.addresses.map((address) => {
        return {
          value: JSON.stringify(address),
          text: `${address.street[0]} ${(address.street[1] || "")} ${address.city}, ${address.region.region_code} ${address.postcode}`
        };
      });

    return (
      <Section
        className={"bg-offwhite" + (!!orderConfirmation ? " o-50" : "")}
        title={CHECKOUT_SECTIONS[3].label}
        content={
          <form ref={el => this[CHECKOUT_SECTIONS[3].selector] = el} className={"mw30rem-l pt4 pl4-l" + (disabled ? " checkout--invalid" : "")}>
            <FieldsetInput className="fl w-50 pr2 mb2" label="First Name" onClick={e => this.setSection(3)} onKeyDown={e => Utils.onKeyDown(e, this.validatePaymentInformation)} onChange={e => this.setState({paymentFirstname: e.target.value})} required disabled={disabled} />
            <FieldsetInput className="fl w-50 mb2" label="Last Name" onClick={e => this.setSection(3)} onKeyDown={e => Utils.onKeyDown(e, this.validatePaymentInformation)} onChange={e => this.setState({paymentLastname: e.target.value})} required disabled={disabled} />
            <FieldsetSelect className="mb2" label="Credit Card Type" options={CREDIT_CARD_TYPES} value={this.state.paymentCardType} onClick={e => this.setSection(3)} onKeyDown={e => Utils.onKeyDown(e, this.validatePaymentInformation)} onChange={e => this.setState({paymentCardType: e.target.value})} required disabled={disabled} />
            <FieldsetInput className="mb2" label="Credit Card Number" type="number" onClick={e => this.setSection(3)} onKeyDown={e => Utils.onKeyDown(e, this.validatePaymentInformation, true)} onChange={e => this.setState({paymentCardNumber: e.target.value})} required disabled={disabled} />
            <FieldsetInput className="fl w-50 pr2 mb2" label="Exp. Month" type="number" placeholder="MM" min={1} max={12} maxLength={2} minLength={2} onClick={e => this.setSection(3)} onKeyDown={e => Utils.onKeyDown(e, this.validatePaymentInformation, true)} onChange={e => this.setState({paymentCardExpMonth: e.target.value})} required disabled={disabled} />
            <FieldsetInput className="fl w-50 mb2" label="Exp. Year" type="number" placeholder="YYYY" min={(new Date()).getFullYear()} minLength={4} maxLength={4} onClick={e => this.setSection(3)} onKeyDown={e => Utils.onKeyDown(e, this.validatePaymentInformation, true)} onChange={e => this.setState({paymentCardExpYear: e.target.value})} required disabled={disabled} />
            <FieldsetInput className="fl w-50 pr2 mb2" label="CCV" type="number" onClick={e => this.setSection(3)} onKeyDown={e => Utils.onKeyDown(e, this.validatePaymentInformation, true)} onChange={e => this.setState({paymentCardCvv: e.target.value})} required disabled={disabled} />
            <div className="cf mb3"></div>
            {!!paymentCardInfoError.length &&
              <div className="mb3">
                <span className="dark-red">Please review the following errors:</span>
                <ul>
                  {paymentCardInfoError.map((error, i) => <li key={i} className="red">{error}</li>)}
                </ul>
              </div>
            }
            <FieldsetCheckbox className="mb3" label="Use Shipping Address as Billing Address" onClick={e => this.setSection(3)} onKeyDown={e => Utils.onKeyDown(e, this.validatePaymentInformation)} onChange={shippingAsBilling => this.setState({shippingAsBilling})} checked={shippingAsBilling} />
            {!shippingAsBilling && 
              <div>
                {!!addressBook.length &&
                  <FieldsetSelect className="mb2 cf" label="Select From Address Book" options={addressBook} onClick={e => this.setSection(3)} onKeyDown={e => Utils.onKeyDown(e, this.validatePaymentInformation)} onChange={e => this.selectAddress('billing', e.target.value)} required />
                }
                <FieldsetInput className="fl w-50 pr2 mb2" label="First Name" value={billingFirstname} onClick={e => this.setSection(3)} onKeyDown={e => Utils.onKeyDown(e, this.validatePaymentInformation)} onChange={e => this.setState({billingFirstname: e.target.value})} required disabled={disabled} />
                <FieldsetInput className="fl w-50 mb2" label="Last Name" value={billingLastname} onClick={e => this.setSection(3)} onKeyDown={e => Utils.onKeyDown(e, this.validatePaymentInformation)} onChange={e => this.setState({billingLastname: e.target.value})} required disabled={disabled} />
                <FieldsetInput className="mb2" label="Billing Address" value={billingAddress1} onClick={e => this.setSection(3)} onKeyDown={e => Utils.onKeyDown(e, this.validatePaymentInformation)} onChange={e => this.setState({billingAddress1: e.target.value})} required disabled={disabled} />
                <FieldsetInput className="mb2" label="Apt / Floor / Suite" value={billingAddress2} onClick={e => this.setSection(3)} onKeyDown={e => Utils.onKeyDown(e, this.validatePaymentInformation)} onChange={e => this.setState({billingAddress2: e.target.value})} disabled={disabled} />
                <FieldsetInput className="fl-l w-60-l pr2-l mb2" label="City" value={billingCity} onClick={e => this.setSection(3)} onKeyDown={e => Utils.onKeyDown(e, this.validatePaymentInformation)} onChange={e => this.setState({billingCity: e.target.value})} required disabled={disabled} />
                <FieldsetInput className="fl-l w-40-l mb2"label="Post Code" value={billingPostcode} onClick={e => this.setSection(3)} onKeyDown={e => Utils.onKeyDown(e, this.validatePaymentInformation)} onChange={e => this.setState({billingPostcode: e.target.value})} required disabled={disabled} />
                <FieldsetSelect className={"fl mb2 cf" + (!!country && !country.available_regions ? " w-100" : " w-50 pr2")} label="Country" value={billingCountryId} options={countriesList} onClick={e => this.setSection(3)} onKeyDown={e => Utils.onKeyDown(e, this.validatePaymentInformation)} onChange={e => this.setState({billingCountryId: e.target.value})} required />
                {(!!country && !country.available_regions) 
                  ? null
                  : <FieldsetSelect className="fl w-50 mb2 cf" label={!!country && country.two_letter_abbreviation === "US" ? "State" : "Region"} value={billingRegionId} options={availableRegions} onClick={e => this.setSection(3)} onKeyDown={e => Utils.onKeyDown(e, this.validatePaymentInformation)} onChange={e => this.setState({billingRegionId: e.target.value})} required />
                }
                <FieldsetInput className="mb2" label="Phone Number" type="tel" value={billingPhoneNumber} onClick={e => this.setSection(3)} onKeyDown={e => Utils.onKeyDown(e, this.validatePaymentInformation)} onChange={e => this.setState({billingPhoneNumber: e.target.value})} required disabled={disabled} />
                <div className="mb3 cf"></div>
              </div>
            }
            <FieldsetButton className="mb4 mb0-l" type="button" text="Review Order" onClick={this.validatePaymentInformation} onKeyDown={e => Utils.onKeyDown(e, this.validatePaymentInformation)} disabled={disabled} />
            <button ref={el => this[CHECKOUT_SECTIONS[3].selector + "-submit"] = el} hidden disabled={disabled} />
          </form>
        }
      />
    );
  }

  renderReviewOrder() {
    const {
      cart, 
      cartSize, 
      cartSubtotal, 
      couponCode, 
      couponDiscount, 
      shippingTotal, 
      taxTotal, 
      shippingMethod, 
      orderConfirmation
    } = this.state;

    const couponDiscountExists = !!couponDiscount && couponDiscount != "null" && couponDiscount != "0" && couponDiscount != 0;

    return (
      <Section
        className={!!orderConfirmation && "o-50"}
        title={CHECKOUT_SECTIONS[4].label}
        content={
          <div className="relative" ref={el => this[CHECKOUT_SECTIONS[4].selector] = el} onClick={() => this.setSection(4)}>
            <span className="absolute top-0 right-0 navy b pointer dim" onClick={this.openCart}>Edit</span>
            <h3 className="mt4 mb0 pl4-l f6 navy">Items In Cart</h3>
            {cartSize > 0 && <div className="flex flex-wrap mw6-l pv3 pl4-l">
              {Utils.mapThroughMap(cart, (line, i) => {
                return (
                  <div key={i} className={"w-50 mb3 " + (i === 0 || i % 2 === 0 ? "pr2-l" : "pl2-l")}>
                    <a className="checkout__lineItem--content relative db pv4 link black dim" href={`/shop/products/${line.item.slug}`} target="_blank" rel="noopener">
                      <div className="aspect-ratio--1x1 contain bg-center" style={{backgroundImage: `url('${line.item.image}?w=800')`}}></div>
                      <h2 className="mt3 mb0 ph3 f5 b tc">{line.quantity}x {line.item.name}</h2>
                      <div className="mv2 ph3 f5 tc">
                        {!!line.item.variation && <span>{line.item.variation} | </span>}
                        <span>{Utils.moneyFormat(line.item.price)}</span>
                      </div>
                    </a>
                  </div>
                );
              })}
            </div>}
            <div className={cartSize > 0 && "bt b--light-grey"}>
              {!!couponDiscountExists && <div className="flex justify-between pv4 pv3-l pl4-l bb b--light-grey">
                <span className="f5 b normal-l navy">Discount Applied ({couponCode})</span>
                <span className="f5 light-red">{Utils.moneyFormat(couponDiscount)}</span>
              </div>}
              <div className="flex justify-between pv4 pv3-l pl4-l bb b--light-grey">
                <span className="f5 b normal-l navy">Subtotal (Tax Excluded)</span>
                <span className="f5 navy">{Utils.moneyFormat(cartSubtotal)}</span>
              </div>
              <div className="flex justify-between pv4 pv3-l pl4-l bb b--light-grey">
                <span className="f5 b normal-l navy">Shipping{!!shippingMethod && ` (${shippingMethod.method_title})`}</span>
                <span className="f5 navy">{Utils.moneyFormat(shippingTotal)}</span>
              </div>
              <div className="flex justify-between pv4 pv3-l pl4-l bb b--light-grey">
                <span className="f5 b normal-l navy">Taxes</span>
                <span className="f5 navy">{Utils.moneyFormat(taxTotal)}</span>
              </div>
            </div>
          </div>
        }
      />
    );
  }

  renderTotal() {
    const {grandTotal, yourInformationValid, shippingInformationValid, paymentInformationValid, optInUpdates, optInTerms, orderLoading, orderError, orderConfirmation} = this.state;
    const disabled = !yourInformationValid || !shippingInformationValid || !paymentInformationValid;

    return (
      <div className={"flex ph3 pb3 ph5-l pb5-l" + (!!orderConfirmation ? " o-50" : "")}>
        <div className="w-100 w-70-l ml-auto pl4-l">
          <div className="flex justify-between mb4 pt4 pt0-l">
            <span className="db navy f4 b">Total</span>
            <span className="db navy f3 f4-l">{Utils.moneyFormat(grandTotal)}</span>
          </div>
          <form ref={el => this[CHECKOUT_SECTIONS[5].selector] = el} className={"mb3" + (disabled ? " checkout--invalid" : "")}>
            <FieldsetCheckbox label="I would like to receive updates from Indie Lee about products, stories, and events." onKeyDown={e => Utils.onKeyDown(e, this.processCheckout)} onChange={optInUpdates => this.setState({optInUpdates})} checked={optInUpdates} disabled={disabled} />
            <FieldsetCheckbox className="mb4" label={<span>I accept the <a href="/terms-conditions" target="_blank" rel="noopener">terms and conditions</a> of Indie Lee</span>} onKeyDown={e => Utils.onKeyDown(e, this.processCheckout)} onChange={optInTerms => this.setState({optInTerms})} checked={optInTerms} disabled={disabled} required />
            {orderLoading 
              ? <div className="loading loading-small mb4 mb0-l"></div>
              : <FieldsetButton className="mb4 mb0-l" type="button" text="Complete Purchase" onClick={this.processCheckout} disabled={!!orderConfirmation} />
            }
            <button ref={el => this[CHECKOUT_SECTIONS[5].selector + "-submit"] = el} hidden disabled={!optInTerms} />
          </form>
          {!!orderError && <p className="f5 red">{orderError}</p>}
        </div>
      </div>
    );
  }

  renderConfirmation() {
    const {orderConfirmation, orderIncrementId} = this.state;

    return (
      <Section
        className="bg-offwhite"
        title={CHECKOUT_SECTIONS[6].label}
        content={
          <div ref={el => this[CHECKOUT_SECTIONS[6].selector] = el} className="pt4 pl4-l" onClick={() => this.setSection(6)}>
            <p class="mt0 mb4 navy f4"><span class="b">Your Order:</span><span>{orderIncrementId}</span></p>
            <p className="mt0 mb4 dark-gray f4">Thank you for your purchase! We look forward to your next visit. Don’t hesitate to contact us with questions about your purchase.</p>
            <p className="mb4 navy f5">Have you read about the New Indie Lee?</p>
            <a className="dib w-100 w-auto-l pv3 ph5 white b ttu link bg-navy bn pointer dim" href="/beauty-articles/an-evolution-introducing-the-new-indie-lee">READ MORE</a>
          </div>
        }
      />
    );
  }

  render() {
    const {selectedSection, sectionNavigatorVisible, cartSize, cartSubtotal, orderConfirmation} = this.state;

    return (
      <div className="checkout">
        <div className="flex pa3 ph4-l bg-navy">
          <div className="flex items-center">
            <span className="f6 white">Cart</span>
            <span className={"header__cartDrawerToggle dib ml2 navy tc b ba br-100 bg-white pointer" + (cartSize > 99 ? " header__cartDrawerToggle--large" : "")}>{cartSize}</span>
          </div>
          <div className="flex items-center ml-auto">
            <span className="white">{Utils.moneyFormat(cartSubtotal)}</span>
          </div>
        </div>
        <div>
          {sectionNavigatorVisible && <SectionNavigator sections={CHECKOUT_SECTIONS} selectedSection={selectedSection} onSelected={this.setSection} />}
          {this.renderYourInformation()}
          {this.renderShippingInformation()}
          {this.renderShippingMethods()}
          {this.renderPaymentInformation()}
          {this.renderReviewOrder()}
          {this.renderTotal()}
          {!!orderConfirmation && this.renderConfirmation()}
        </div>
      </div>
    );
  }
}

(() => {
  // need to listen to turbolinks:load for every page nav
  // render checkout when navigating to /checkout
  document.addEventListener('turbolinks:load', () => {
    if (window.location.pathname.indexOf("checkout") >= 0) {
      CartService.replaceCartWithMagento()
        .then(res => {})
        .catch(err => {});

      render(<Checkout />, document.getElementById("checkout"));
    }
  });
})();