'use strict';

const {h, render, Component} = require('preact');

const FieldsetInput = require('../Form/FieldsetInput.jsx');
const FieldsetCheckbox = require('../Form/FieldsetCheckbox.jsx');
const FieldsetButton = require('../Form/FieldsetButton.jsx');

const isEmail = require('validator/lib/isEmail');
const {ERROR_MESSAGES} = require('../../constants.js');

const defaultState = {
  email: null,
  password1: null,
  password2: null,
  firstname: null,
  lastname: null,
  isEmailSubmitted: false,
  isEmailRegistered: false,
  isResetPasswordSelected: false,
  isLoading: false,
  emailError: null,
  loginError: null,
  registrationError: null,
  resetPasswordError: null,
};

class Login extends Component {
  constructor() {
    super();

    this.state = {...defaultState};

    this.reset = this.reset.bind(this);
    this.setClearError = this.setClearError.bind(this);
    this.login = this.login.bind(this);
    this.onEmailSubmit = this.onEmailSubmit.bind(this);
    this.onLoginSubmit = this.onLoginSubmit.bind(this);
    this.onRegistrationSubmit = this.onRegistrationSubmit.bind(this);
    this.onResetPasswordSubmit = this.onResetPasswordSubmit.bind(this);
    this.renderEmailForm = this.renderEmailForm.bind(this);
    this.renderLoginForm = this.renderLoginForm.bind(this);
    this.renderRegistrationForm = this.renderRegistrationForm.bind(this);
    this.renderResetPasswordForm = this.renderResetPasswordForm.bind(this);
  }

  componentDidMount() {
    window.addEventListener('subnav-close', this.reset);
  }

  reset() {
    this.setState(defaultState);
  }

  setClearError(key) {
    let obj = {};
    obj[key] = null;

    setTimeout(() => this.setState(obj), 5000);
  }

  updateCookieConsent(cookieAccepted) {
    if (cookieAccepted) Utils.setCookie('il_cd', true, 7300); // 20 years
    else Utils.deleteCookie('il_cd');
  }

  login() {
    const {email, password1} = this.state;

    this.setState({isLoading: true});

    AccountService.login(email.trim(), password1)
      .then((res) => {
        this.reset();

        AccountService.getMagentoUser()
          .then((result) => {
            window.dispatchEvent(new CustomEvent('login-close'));

            // true = should refresh page
            CartService.resetCartWithMagento(true)
              .then((res) => {
                window.location.reload();
              })
              .catch((err) => {
                window.location.reload();
              });
          })
          .catch((error) => {
            window.location.reload();
          });
      })
      .catch((err) => {
        this.setState({
          loginError: Utils.getMagentoErrorMessage(err),
          isLoading: false,
        });

        AccountService.logout();

        this.setClearError('loginError');
      });
  }

  onEmailSubmit(e) {
    e.preventDefault();

    if (!Utils.checkCookie('il_cd')) {
      this.setState({emailError: "Cookie consent is required for account usage."});
      this.setClearError('emailError');
      return;
    }

    this.setState({isLoading: true});

    AccountService.checkEmailIfAvailable(this.state.email)
      .then((res) => {
        // NOTE: data = false if email is already registered
        this.setState({
          isEmailSubmitted: true,
          isEmailRegistered: !res.data,
          isLoading: false,
        });
      })
      .catch((err) => {
        console.error("email error: ", err);
        
        this.setState({
          emailError: Utils.getMagentoErrorMessage(err),
          isLoading: false,
        });
        
        AccountService.logout();

        this.setClearError('emailError');
      });
  }

  onLoginSubmit(e) {
    e.preventDefault();
    this.login();
  }

  onRegistrationSubmit(e) {
    e.preventDefault();

    const {email, password1, password2, firstname, lastname} = this.state;

    if (!email || !password1 || !password2 || !firstname || !lastname) {
      this.setState({registrationError: ERROR_MESSAGES.formIncomplete});
      this.setClearError('registrationError');
      return;
    }

    if (!isEmail(email)) {
      this.setState({registrationError: ERROR_MESSAGES.emailInvalid});
      this.setClearError('registrationError');
      return;
    }

    if (password1 !== password2) {
      this.setState({registrationError: ERROR_MESSAGES.passwordMismatch});
      this.setClearError('registrationError');
      return;
    }

    if (!Utils.getPasswordValidator().validate(password1)) {
      this.setState({registrationError: ERROR_MESSAGES.passwordInvalid});
      this.setClearError('registrationError');
      return;
    }

    this.setState({isLoading: true});

    AccountService.register(email.trim(), password1, firstname.trim(), lastname.trim())
      .then((res) => {
        // gtm tagging on book form open
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({'event': 'account-created'});

        alert("You are now registered! Please check your email for confirmation.");

        this.login();
      })
      .catch((err) => {
        console.error("registration error: ", err);

        this.setState({
          registrationError: Utils.getMagentoErrorMessage(err),
          isLoading: false,
        });

        AccountService.logout();
        this.setClearError('registrationError');
      });
  }

  onResetPasswordSubmit(e) {
    e.preventDefault();

    const {email} = this.state;

    if (!email) {
      this.setState({resetPasswordError: "Please provide your email address to proceed."});
      this.setClearError('resetPasswordError');
      return;
    }

    if (!isEmail(email)) {
      this.setState({resetPasswordError: "Please check the format of your email address."});
      this.setClearError('resetPasswordError');
      return;
    }

    this.setState({isLoading: true});

    AccountService.requestResetPassword(email.trim())
      .then((res) => {
        alert("Thank you! Please check your email for instructions on resetting your password.");
        this.setState({isLoading: false});
      })
      .catch((err) => {
        console.error("reset password error: ", err);

        this.setState({
          resetPasswordError: Utils.getMagentoErrorMessage(err),
          isLoading: false,
        });

        this.setClearError('resetPasswordError');
      });
  }

  renderEmailForm() {
    const {email, emailError} = this.state;

    return (
      <div>
        <div>
          <p class="db light-blue ttu f6 pt4 pb3">Hi there</p>
          <p class="white f6 fw1">Please enter a valid email address</p>
        </div>
        <form ref={e => this.emailForm = e} class="subNav__email db pt4 pb3" onSubmit={this.onEmailSubmit}>
          <FieldsetInput className="mb4" value={email} type="email" placeholder="Enter email" onChange={e => this.setState({email: e.target.value})} dark required />
          {!Utils.checkCookie('il_cd') && <FieldsetCheckbox className="mb3 white" label="I agree to the usage of cookies on this website" onChange={this.updateCookieConsent} required />}
          {!!emailError && <p class="light-red">{emailError}</p>}
          <FieldsetButton type="submit" text="Continue" dark />
        </form>
      </div>
    );
  }

  renderLoginForm() {
    const {password1, loginError} = this.state;

    return (
      <div>
        <div>
          <p class="light-blue ttu f6 b">Welcome back</p>
          <p class="white f6 fw1">Please confirm your password.</p>
        </div>
        <form ref={e => this.loginForm = e} class="db pt4 pb3" onSubmit={this.onLoginSubmit}>
          <FieldsetInput className="mb4" value={password1} type="password" placeholder="Password" onChange={e => this.setState({password1: e.target.value})} dark required />
          {!!loginError && <p class="light-red">{loginError}</p>}
          <FieldsetButton className="dib" type="submit" text="Login" dark />
          <span className="ml4 white underline link dim pointer" onClick={() => this.setState({isResetPasswordSelected: true})}>Forgot your password?</span>
        </form>
      </div>
    );
  }

  renderRegistrationForm() {
    const {email, password1, password2, firstname, lastname, registrationError} = this.state; 

    return (
      <div>
        <div>
          <p class="light-blue ttu f6 b">Looks like you're new here</p>
          <p class="white f6 fw1">To create an account, fill out the following form.</p>
        </div>
        <form ref={e => this.registrationForm = e} class="db pt4 pb3" onSubmit={this.onRegistrationSubmit}>
          <FieldsetInput value={email} className="mb4" type="email" placeholder="Email Address" onChange={e => this.setState({email: e.target.value})} dark required />
          <FieldsetInput value={password1} className="mb2" type="password" placeholder="Password" onChange={e => this.setState({password1: e.target.value})} dark required />
          <span className="db white f6 fw1 mb4">Please check your password for the follow: Minimum 8 characters, 1 uppercase letter, 1 lowercase letter, 1 digit, 1 symbol, No spaces</span>
          <FieldsetInput value={password2} className="mb4" type="password" placeholder="Confirm Password" onChange={e => this.setState({password2: e.target.value})} dark required />
          <FieldsetInput value={firstname} className="fl-l w-50-l mb4 pr3-l" placeholder="First Name" onChange={e => this.setState({firstname: e.target.value})} dark required />
          <FieldsetInput value={lastname} className="fl-l w-50-l mb4 pl3-l" placeholder="Last Name" onChange={e => this.setState({lastname: e.target.value})} dark required />
          {!!registrationError && <p class="light-red">{registrationError}</p>}
          <FieldsetButton className="dib" type="submit" text="Create Account" dark />
          <span className="ml4 white underline link pointer dim" onClick={this.reset}>Already have an account?</span>
        </form>
      </div>
    );
  }

  renderResetPasswordForm() {
    const {email, resetPasswordError} = this.state;

    return (
      <div>
        <div>
          <p class="light-blue ttu f6 b">Reset Your Password</p>
          <p class="white f6 fw1">Submit your email address to reset your password.</p>
        </div>
        <form ref={e => this.resetPasswordForm = e} class="db pt4 pb3" onSubmit={this.onResetPasswordSubmit}>
          <FieldsetInput value={email} className="mb4" type="email" placeholder="Email Address" onChange={e => this.setState({email: e.target.value})} dark required />
          {!!resetPasswordError && <p class="light-red">{resetPasswordError}</p>}
          <FieldsetButton className="dib" type="submit" text="Submit" dark />
          <span className="ml4 white underline link pointer dim" onClick={() => this.setState({isResetPasswordSelected: false})}>Go back</span>
        </form>
      </div>
    );
  }

  renderLoading() {
    return (
      <div className="loading loading-small mt5 center"></div>
    );
  }

  render() {
    const {isEmailSubmitted, isEmailRegistered, isResetPasswordSelected, isLoading} = this.state;

    let render;

    if (isLoading) render = this.renderLoading;
    else if (!isEmailSubmitted) render = this.renderEmailForm;
    else if (isResetPasswordSelected) render = this.renderResetPasswordForm;
    else if (isEmailRegistered) render = this.renderLoginForm;
    else render = this.renderRegistrationForm;

    return (
      <div id="navigation__loginNav" class="navigation__subNav navigation__subNav--right-l fixed top-0 bottom-0 ph3 ph4-l pt4 pb5 z-3 bg-navy">
        <span class="navigation__subNavClose dn db-l absolute top-2 left-2 w1 h1 bg-center contain dim pointer"></span>
        <div class="navigation__subNavInner h-100 mt4 pt4 pb6 overflow-y-scroll">
          {render()}
        </div>
      </div>
    );
  }
}

(($) => {
  document.addEventListener('turbolinks:load', () => {
    render(<Login />, document.getElementById("navigationLogin"));
  });
})(jQuery);