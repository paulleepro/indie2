'use strict';

const {h, render, Component} = require('preact');

const Section = require('../UI/Section.jsx');
const SectionNavigator = require('../UI/SectionNavigator.jsx');
const FieldsetInput = require('../Form/FieldsetInput.jsx');
const FieldsetButton = require('../Form/FieldsetButton.jsx');
const Order = require('./Order.jsx');
const Address = require('./Address.jsx');

const {ACCOUNT_SECTIONS, ERROR_MESSAGES} = require('../../constants.js');

class Account extends Component {
  constructor() {
    super();

    this.user = AccountService.getUser();

    this.state = {
      selectedSection: 0,
      email: this.user.email,
      firstname: this.user.firstname,
      lastname: this.user.lastname,
      currentPassword: null,
      password1: null,
      password2: null,
      toggleInformationEdit: false, 
      togglePasswordEdit: false,
      informationSubmitLoading: false,
      passwordSubmitLoading: false,
      ordersLoading: true,
      informationError: null,
      passwordError: null,
      ordersError: null,
      // quiz: null, // TODO: Get quiz if already taken
      orders: [],
      showAddAddress: false,
      countries: null,
      logoutLoading: false,
    };

    this.setSection = this.setSection.bind(this);
    this.logout = this.logout.bind(this);
    this.updateInformation = this.updateInformation.bind(this);
    this.updateUserPassword = this.updateUserPassword.bind(this);

    this.renderInformation = this.renderInformation.bind(this);
    this.renderOrderHistory = this.renderOrderHistory.bind(this);
    this.renderAddressBook = this.renderAddressBook.bind(this);
  }

  componentWillMount() {
  	OptionsService.getCountries().then(res => this.setState({countries: res}));

    OrdersService.getUserOrders(this.user.email)
      .then(res => this.setState({ordersLoading: false, orders: res.data.items}))
      .catch(err => this.setState({ordersLoading: false, ordersError: Utils.getMagentoErrorMessage(err)}));
  }

  setSection(i) {
    const section = ACCOUNT_SECTIONS[i];

    this.setState({selectedSection: i});

    $('html, body').animate({scrollTop: $(this[section.selector]).offset().top - 65}, 250);
  }

  logout() {
    this.setState({logoutLoading: true});

    AccountService.logout()
      .then(() => {
        CartService.flushCartData();
        this.setState({logoutLoading: false});
        window.location.reload();
      })
      .catch(() => {
        this.setState({logoutLoading: false});
        alert("Something went wrong. Please try again!");
      });
  }

  updateInformation(e) {
    !!e && e.preventDefault();

    if (!this.informationForm.checkValidity()) {
      this.informationFormSubmit.click();
      return;
    }

    const {email, firstname, lastname} = this.state;

    if (
      email === this.user.email &&
      firstname === this.user.firstname &&
      lastname === this.user.lastname
    ) {
      alert("Your information has not changed. Please provide a new email, first name or last name to continue.");
      return;
    }

    this.setState({informationSubmitLoading: true});

    AccountService.updateUser({...this.user, email, firstname, lastname})
      .then((res) => {
        this.setState({informationSubmitLoading: false, toggleInformationEdit: false});
        alert("Your information has been successfully updated!");
      })
      .catch((err) => {
        this.setState({informationSubmitLoading: false, informationError: Utils.getMagentoErrorMessage(err)});
      });
  }

  updateUserPassword(e) {
    !!e && e.preventDefault();

    if (!this.passwordForm.checkValidity()) {
      this.passwordFormSubmit.click();
      return;
    }

    const {currentPassword, password1, password2} = this.state;

    if (!currentPassword) {
      this.setState({passwordError: "Please enter your current password."});
      return;
    } else if (!password1 || !password2) {
      this.setState({passwordError: "Please enter your new password twice to confirm."});
      return;
    } else if (password1 !== password2) {
      this.setState({passwordError: ERROR_MESSAGES.passwordMismatch});
      return;
    } else if (!Utils.getPasswordValidator().validate(password1)) {
      this.setState({passwordError: ERROR_MESSAGES.passwordInvalid});
      return;
    }

    this.setState({passwordSubmitLoading: true});

    AccountService.updateUserPassword(currentPassword, password1)
      .then((res) => {
        this.setState({currentPassword: null, password1: null, password2: null, passwordError: null, togglePasswordEdit: false, passwordSubmitLoading: false});
        alert("Your password has been successfully updated!");
      })
      .catch((err) => {
        this.setState({passwordError: Utils.getMagentoErrorMessage(err), passwordSubmitLoading: false});
      });
  }

  // goToQuiz() {

  // }

  renderInformation() {
    const {
      email, 
      firstname, 
      lastname, 
      currentPassword, 
      password1, 
      password2, 
      // quiz, 
      toggleInformationEdit, 
      togglePasswordEdit, 
      informationSubmitLoading, 
      passwordSubmitLoading, 
      informationError,
      passwordError,
    } = this.state;

    return (
      <Section 
        title={ACCOUNT_SECTIONS[0].label}
        className="bg-offwhite bg-white-l"
        content={
            <div ref={el => this.information = el}>
              {toggleInformationEdit
                ? <div className="pv4 pl4-l bb-l b--light-grey-l">
                  <form ref={el => this.informationForm = el} className="mw30rem-l">
                    <span className="db mb3 navy f6 b">Personal Information</span>
                    <FieldsetInput className="mb2" label="First Name" value={firstname} onKeyDown={e => Utils.onKeyDown(e, this.updateInformation)} onChange={e => this.setState({firstname: e.target.value})} required />
                    <FieldsetInput className="mb2" label="Last Name" value={lastname} onKeyDown={e => Utils.onKeyDown(e, this.updateInformation)} onChange={e => this.setState({lastname: e.target.value})} required />
                    <FieldsetInput className="mb2" label="Email Address" type="email" value={email} onKeyDown={e => Utils.onKeyDown(e, this.updateInformation)} onChange={e => this.setState({email: e.target.value})} required />
                    {!!informationError && <p className="red">{informationError}</p>}
                    {!informationSubmitLoading
                      ? <div>
                        <FieldsetButton className="dib mt3" type="button" text="Save" onClick={this.updateInformation} />
                        <button ref={el => this.informationFormSubmit = el} hidden />
                        <span className="dib ml3 pa3 navy f5 link pointer dim" onClick={() => this.setState({email: null, firstname: null, lastname: null, toggleInformationEdit: false})}>Cancel</span>
                      </div>
                      : <div className="loading loading-small mv3"></div>
                    }
                  </form>
                </div>
                : <div className="relative pv4 pl4-l bb-l b--light-grey-l">
                  <span className="absolute top-4 right-0 navy link pointer dim" onClick={() => this.setState({toggleInformationEdit: true})}>Edit</span>
                  <span className="db mb3 navy f6 b">Personal Information</span>
                  <span className="db mb2">{firstname} {lastname}</span>
                  <span className="db">{email}</span>
                </div>
              }
              {togglePasswordEdit
                ? <div className="pv4 pl4-l bb-l b--light-grey-l">
                  <form ref={el => this.passwordForm = el} className="mw30rem-l">
                    <span className="db mb3 navy f6 b">Change Password</span>
                    <FieldsetInput className="mb2" label="Current Password" type="password" value={currentPassword} onKeyDown={e => Utils.onKeyDown(e, this.updateUserPassword)} onChange={e => this.setState({currentPassword: e.target.value})} required />
                    <FieldsetInput className="mb2" label="New Password" type="password" value={password1} onKeyDown={e => Utils.onKeyDown(e, this.updateUserPassword)} onChange={e => this.setState({password1: e.target.value})} required />
                    <FieldsetInput className="mb2" label="Confirm New Password" type="password" value={password2} onKeyDown={e => Utils.onKeyDown(e, this.updateUserPassword)} onChange={e => this.setState({password2: e.target.value})} required />
                    {!!passwordError && <p className="red">{passwordError}</p>}
                    {!passwordSubmitLoading
                      ? <div>
                        <FieldsetButton className="dib mt3" type="button" text="Save" onClick={this.updateUserPassword} />
                        <button ref={el => this.passwordFormSubmit = el} hidden />
                        <span className="dib ml3 pa3 navy f5 link pointer dim" onClick={() => this.setState({password1: null, password2: null, passwordError: null, togglePasswordEdit: false})}>Cancel</span>
                      </div>
                      : <div className="loading loading-small mv3"></div>
                    }
                  </form>
                </div>
                : <div className="relative pv4 pl4-l bb-l b--light-grey-l">
                  <span className="absolute top-4 right-0 navy link pointer dim" onClick={() => this.setState({togglePasswordEdit: true})}>Edit</span>
                  <span className="db mb3 navy f6 b">Password</span>
                  <span className="db">••••••••</span>
                </div>
              }
              {/* NOTE: Add back for next phase */}
              {/*
                <div className="pt4 pl4-l">
                  <span className="db mb3 navy f6 b">Skin Quiz Results</span>
                  {!!quiz
                    ? <div>TODO: Add quiz content here</div>
                    : <div>
                      <p className="mb4 silver f4">Looks like you haven't taken the quiz yet.</p>
                      <button className="w-100 w-auto-l pv3 ph5 white b ttu bg-navy bn pointer dim" onClick={this.goToQuiz}>Take the Quiz</button>
                    </div>
                  }
                </div>
              */}
              <div className="pt4 pl4-l">
                <span className="db mb3 navy f6 b">Help Center</span>
                <div>
                  <a className="dib w-100 w-auto-l mb3 mb0-l mr3-l pv3 ph4 white b ttu bg-navy ba b--navy link pointer dim" href={`mailto:customerservice@indielee.com?subject=Support%20Request&body=Account%20Email:%20${this.user.email}%0D%0A%0D%0AMessage:`}>General Support</a>
                  <a className="dib w-100 w-auto-l pv3 ph4 navy b ttu bg-white ba b--navy link pointer dim" href={`mailto:customerservice@indielee.com?subject=Account%20Removal%20Request&body=Account%20Email:%20${this.user.email}%0D%0A%0D%0AMessage:`}>Account Removal</a>
                </div>
              </div>
            </div>
        } 
      />
    );
  }

  renderOrderHistory() {
    const {ordersLoading, orders} = this.state;

    return (
      <Section 
        title={ACCOUNT_SECTIONS[1].label}
        className="bg-offwhite"
        content={ordersLoading
          ? <div className="loading loading-small mv3 ma4-l"></div>
          : <div ref={el => this.orderHistory = el} className="pt4 pl4-l">
            {!orders.length
              ? <div>
                <p className="mt0 mb4 silver f4">You have not placed any orders yet.</p>
                <a className="dib w-100 w-auto-l pv3 ph5 white b ttu link bg-navy bn pointer dim" href="/shop/ritual">Browse Products</a>
              </div>
              : orders.map((order, i) => (order.status !== "failed" && <Order index={i} order={order} ordersCount={orders.length} />))
            }
          </div>
        } 
      />
    );
  }

  renderAddressBook() {
    const {addresses} = this.user;
    const {showAddAddress, countries} = this.state;

    return (
      <Section 
        title={ACCOUNT_SECTIONS[2].label}
        className="bg-offwhite bg-white-l"
        content={
          <div ref={el => this.addressBook = el} className="pt4 pl4-l">
            {!addresses.length
              ? <p className="mt0 mb4 silver f4">You have not saved any addresses yet.</p>
              : addresses.map((address, i) => {
                return (
                  <Address 
                    key={i} 
                    index={i} 
                    address={address} 
                    addressesCount={addresses.length} 
                    countries={countries} 
                    onToggleEdit={() => this.setState({showAddAddress: false})} 
                  />
                );
              })
            }
            {!showAddAddress && <button className="w-100 w-auto-l mb4 mb0-l pv3 ph5 white b ttu bg-navy bn dim pointer" onClick={() => this.setState({showAddAddress: true})}>Add Address</button>}
            {showAddAddress && <Address countries={countries} isNew onCancel={() => this.setState({showAddAddress: false})} onNewSubmit={() => this.setState({showAddAddress: false})} />}
          </div>
        }
      />
    );
  }

  render() {
    const {selectedSection, logoutLoading} = this.state;

    return (
      <div className="account__wrapper">
        <div className="dn db-l pv4 pv5-l bg-offwhite">
          <h1 className="tc normal f1">Your Account</h1>
        </div>
        <div className="dn-l ph3 pv4 pv5-l">
          <h1 className="dib w-60 f2 ttu">Hi {this.state.firstname}.</h1>
          {logoutLoading
            ? <div className="loading loading-small"></div>
            : <span className="dib w-40 f4 ttu tr" onClick={this.logout}>Log out</span>
          }
        </div>
        <div className="account__body">
          <SectionNavigator 
            sections={ACCOUNT_SECTIONS} 
            selectedSection={selectedSection} 
            onSelected={this.setSection} 
            bottomContent={
              logoutLoading
                ? <div className="loading loading-small w-100 w-auto-l mt4 ml3"></div>
                : <button className="w-100 w-auto-l mt3 ml3 pv3 ph4 white b ttu bg-navy bn dim pointer" onClick={this.logout}>Log out</button>
            }
          />
          {this.renderInformation()}
          {this.renderOrderHistory()}
          {this.renderAddressBook()}
        </div>
      </div>
    );
  }
}

(($) => {
  // need to listen to turbolinks:load for every page nav
  // render account when navigating to /account
  document.addEventListener('turbolinks:load', () => {
    if (window.location.pathname.indexOf("account") >= 0) {
      render(<Account />, document.getElementById("account"));
    }
  });
})(jQuery);