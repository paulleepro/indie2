const isEmail = require('validator/lib/isEmail');
const {ERROR_MESSAGES} = require('../../constants.js');

(($, controller) => {

  const routeController = {
    init() {
      this.elems = {
        form: '#resetPassword__form',
        email: '#resetPassword__form--email',
        password: '#resetPassword__form--password',
        password2: '#resetPassword__form--password2',
        resendForm: '#resetPassword__resendForm',
        resendEmail: '#resetPassword__resendForm--email',
        error: '.resetPassword__error',
      };
      
      this.setErrorMessage.bind(this);
      this.bindEvents.bind(this)();
    },

    bindEvents() {
      Utils.turboBind('submit', this.elems.form, this.submitForm.bind(this));
      Utils.turboBind('submit', this.elems.resendForm, this.resendLink.bind(this));
    },

    submitForm(e) {
      e.preventDefault();

      const $form = $(this.elems.form),
            email = $form.find(this.elems.email).val(),
            password = $form.find(this.elems.password).val(),
            password2 = $form.find(this.elems.password2).val(),
            urlParams = new URLSearchParams(window.location.search);

      if (!email || !password || !password2) {
        this.setErrorMessage(ERROR_MESSAGES.formIncomplete);
        return;
      }

      if (!isEmail(email)) {
        this.setErrorMessage(ERROR_MESSAGES.emailInvalid);
        return;
      }

      if (!Utils.getPasswordValidator().validate(password)) {
        this.setErrorMessage(ERROR_MESSAGES.passwordInvalid);
        return;
      }

      if (password !== password2) {
        this.setErrorMessage(ERROR_MESSAGES.passwordMismatch);
        return;
      }

      if (!urlParams.has('token')) {
        this.setErrorMessage("The request is incomplete. Please make sure to click the reset link provided in the email message.");
        return;
      }

      AccountService.checkEmailIfAvailable(email.trim())
        .then((res) => {
          // NOTE: data = false if email is already registered
          if (res.data) {
            this.setErrorMessage(ERROR_MESSAGES.emailNotRegistered);
          } else {
            AccountService.resetPassword(email.trim(), password, urlParams.get('token'))
              .then((res) => {
                alert("Your password has been reset successfully!");
                window.location.href = "/?login=true";
              })
              .catch((err) => {
                console.error(err);
                this.setErrorMessage(ERROR_MESSAGES.default);
              });
          }
        })
        .catch((err) => {
          console.error(err);
          this.setErrorMessage(ERROR_MESSAGES.default);
        });
    },

    resendLink(e) {
      e.preventDefault();

      const $form = $(this.elems.resendForm),
            email = $form.find(this.elems.resendEmail);

      if (!email) {
        this.setErrorMessage(ERROR_MESSAGES.formIncomplete);
        return;
      }

      if (!isEmail(email)) {
        this.setErrorMessage(ERROR_MESSAGES.emailInvalid);
        return;
      }

      AccountService.checkEmailIfAvailable(email.trim())
        .then((res) => {
          // NOTE: data = false if email is already registered
          if (!res.data) {
            this.setErrorMessage(ERROR_MESSAGES.emailNotRegistered);
          } else {
            AccountService.sendResetPassword(email.trim())
              .then((res) => {
                alert("Your reset password link has been sent! Please check your inbox.");
              })
              .catch((err) => {
                console.error(err);
                this.setErrorMessage(ERROR_MESSAGES.default);
              });
          }
        })
        .catch((err) => {
          console.error(err);
          this.setErrorMessage(ERROR_MESSAGES.default);
        });
    },

    setErrorMessage(message) {
      const $error = $(this.elems.error);

      $error.html(message).show();

      setTimeout(() => {
        $error.html("").hide();
      }, 5000);
    },
  }

  routeController.init();

})(jQuery, 'reset-password');
