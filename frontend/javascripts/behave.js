// global client side scripts here...

(($) => {

  const appController = {
    init() {
      this.state = {
        navOpen: false,
        subNavOpen: false,
        user: null,
      }

      this.elems = {
        header: '#header',
        nav: '#navigation',
        navToggle: '#header__navToggle',
        subNavToggle: '.navigation__subNavToggle',
        subNavClose: '.navigation__subNavClose',
        searchForm: '#navigation__searchForm',
        searchInput: '#navigation__searchInput',
        cartDrawerToggle: '#header__cartDrawerToggle',
        cartDrawer: '.cartDrawer',
        addToCart: '.cartAction__addToCart',
        addToCartSuccess: '#cartAction__addToCart--success',
        cartEmpty: 'header__cartDrawerToggle--empty',
        cartLarge: 'header__cartDrawerToggle--large',
        scrollToLink: '.scrollToLink',
        footerAccordionToggle: '.footer__navHeading',
        footerAccordionBody: '.footer__navLinkList',
        footerNewsletterForm: '#footer__newsletter--form',
        logoutLink: '#navigation__logout',
        videoPlayBtn: '.video__playBtn',
        cookieDisclaimer: '#cookieDisclaimer',
        cookieDisclaimerClose: '#cookieDisclaimer__close',
        cookieDisclaimerAccept: '#cookieDisclaimer__acceptButton',
        eventRsvpLink: '.eventRsvpLink',
      }

      this.bindEvents();
      this.setLocalStorage();
    },

    bindEvents() {
      // NOTE: Using turboBind click + touchstart causes nav callback to double-fire
      // using "touchstart" since it's mobile only
      Utils.turboBind('click', this.elems.navToggle, (e) => {
        e.stopPropagation();

        if (this.state.subNavOpen) {
          this.closeSubNav();
        } else if (this.state.navOpen) {
          this.closeNav();
        } else {
          this.closeCart();
          this.openNav();
        }
        
      });

      Utils.turboBind('click', this.elems.subNavToggle, (e) => {
        let $subnav = $(`#navigation__${$(e.currentTarget).attr('data-subnav-target')}Nav`);
        
        this.closeCart();

        if (!this.state.navOpen) this.openNav();

        if (!$subnav.hasClass('navigation__subNav--active')) {
          
          if (this.state.subNavOpen) this.closeSubNav();

          this.openSubNav($subnav, $(e.currentTarget));
        }
      });

      Utils.turboBind('click', this.elems.subNavClose, (e) => {
        this.closeSubNav();

        setTimeout(()=> {
          this.closeNav();
        }, 200);
      });

      Utils.turboBind('click', this.elems.cartDrawerToggle, (e) => {
        if (this.state.subNavOpen) this.closeSubNav();
        
        this.closeNav();

        // Make sure cart comes into view
        // If user has scrolled any amount down the page, cart is out of view
        $('html, body').animate({scrollTop: 0}, 200);

        // Preact Cart component will receive event
        window.dispatchEvent(new CustomEvent('cart-toggle'));
      });

      Utils.turboBind('click', this.elems.addToCart, (e) => {
        const $e = $(e.currentTarget);
        const text = $e.html();
        const $success = $(this.elems.addToCartSuccess);

        const item = {
          sku: $e.attr('data-item-sku'),
          name: $e.attr('data-item-name'),
          slug: $e.attr('data-item-slug'),
          variation: $e.attr('data-item-variation'),
          price: $e.attr('data-item-price'),
          image: $e.attr('data-item-image'),
          icon: $e.attr('data-item-icon'),
        };

        $e
          .attr('disabled', 'disabled')
          .addClass('disabled')
          .html('<div class="loading loading-small center"></div>');

        CartService.updateCart(item, $e.attr('data-item-quantity'), null, () => {
          $e
            .removeAttr('disabled')
            .removeClass('disabled')
            .html(text);

          $success
            .fadeIn(200, () => {
              setTimeout(() => $success.fadeOut(500), 2000);
            });
        });

        // gtm tagging on book form open
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({'event': 'add-to-cart-completed'});
      });

      Utils.turboBind('submit', this.elems.searchForm, (e) => {
        this.submitForm(e);
      });

      Utils.turboBind('click', this.elems.footerAccordionToggle, (e) => {
        const accordionBody = $(e.currentTarget).next(this.elems.footerAccordionBody);

        if (Utils.getWindowWidthEms() < 60) {
          if (accordionBody.attr('data-state') === 'closed') {
            this.openFooterAccordion(accordionBody);
          } else {
            this.closeFooterAccordion(accordionBody);
          }
        }
      });

      Utils.turboBind('click', this.elems.scrollToLink, (e) => {
        e.preventDefault();
        const $target = $(e.target),
              additionalOffset = $(e.target).attr("data-add-offset") || 0;

        $target.siblings(".scrollToLink").removeClass("scrollToLink--active");
        $target.addClass("scrollToLink--active");

        $('html, body').animate({
          scrollTop: $($target.attr("data-scroll-target")).offset().top - additionalOffset
        }, 500);
      });
  
      Utils.turboBind('click', this.elems.logoutLink, (e) => {
        AccountService.logout();
        CartService.flushCartData();
      });

      Utils.turboBind('click', this.elems.videoPlayBtn, (e) => {
        const $video = $(e.target).closest('.video__container').find('video'),
              $startScreen = $(e.target).closest('.video__container').find('.video__startScreen');

        $startScreen.toggleClass("dn");

        //pause all other videos, play this one
        $("video").each(function() {
          this.pause();
        });

        $video[0].play();
        $video[0].setAttribute("controls","controls") 
      });

      Utils.turboBind('submit', this.elems.footerNewsletterForm, this.captureNewsletterSubscribe.bind(this));

      Utils.turboBind('click', this.elems.cookieDisclaimerClose, this.hideCookieDisclaimer.bind(this));

      Utils.turboBind('click', this.elems.cookieDisclaimerAccept, this.acceptCookie.bind(this));

      Utils.turboBind('click', this.elems.eventRsvpLink, this.captureRsvpClick.bind(this));

      $(window).resize(() => {
        if (Utils.getWindowWidthEms() >= 60 && this.state.navOpen) {
          this.closeSubNav();
          this.closeNav();
        }
      });

      $(document).ready(() => {
        if (window.location.pathname.indexOf("checkout") < 0) {
          CartService.replaceCartWithMagento()
            .then(this.setCartIndicator.bind(this))
            .catch(err => console.error("Error while attempting to reset local cart with Magento cart", err));
        } else {
          this.setCartIndicator.bind(this)();
        }

        this.updateLogin.bind(this)();
      });

      document.addEventListener('turbolinks:load', () => {
        // reset header state
        this.state.navOpen = false;
        this.state.subNavOpen = false;
        this.closeCart();
        this.checkLogout();
        this.checkLoginOpen();
        this.checkCookieDisclaimer();
        AccountService.getMagentoUser().catch((err) => {});
      });

      // need to bind scope for named function
      window.addEventListener('cart-update', this.setCartIndicator.bind(this));
      window.addEventListener('login-update', this.updateLogin.bind(this));
      window.addEventListener('login-open', this.openLogin.bind(this));
      window.addEventListener('login-close', this.closeSubNav.bind(this));
    },

    setLocalStorage() {
      if (!window.localStorage) {
        window.localStorage = require('local-storage-fallback');
      }
    },

    openCart() {
      window.dispatchEvent(new CustomEvent('cart-toggle', { detail: { force: true } }));
    },

    closeCart() {
      window.dispatchEvent(new CustomEvent('cart-toggle', { detail: { force: false } }));
    },

    openNav() {
      $(this.elems.nav).addClass('navigation--open');
      $(this.elems.navToggle).addClass('header__navToggle--open');
      $(this.elems.header).attr('data-state', 'nav-open');
      this.state.navOpen = true;
    },

    closeNav() {
      $(this.elems.nav).removeClass('navigation--open');
      $(this.elems.navToggle).removeClass('header__navToggle--open');
      $(this.elems.header).attr('data-state', 'nav-closed');
      this.state.navOpen = false;
    },

    openSubNav($subnav, $targetNavToggle) {
      $(this.elems.subNavToggle).removeClass('header__desktopNavLink--focus');
      $subnav.addClass('navigation__subNav--active');
      $targetNavToggle.addClass('header__desktopNavLink--focus');
      $(this.elems.navToggle).addClass('header__navToggle--subNavOpen');
      this.state.subNavOpen = true;
    },

    closeSubNav() {
      $('.navigation__subNav--active').removeClass('navigation__subNav--active');
      $(this.elems.navToggle).removeClass('header__navToggle--subNavOpen');
      this.state.subNavOpen = false;
      window.dispatchEvent(new CustomEvent('subnav-close'));
    },

    openLogin() {
      if (Utils.getWindowWidthEms() > 60) {
        $('#login__toggle--desktop').click();
      } else {
        this.openNav();
        setTimeout(() => {
          $('#login__toggle--mobile').click();
        }, 350);
      }
    },

    submitForm(e) {
      let query = $(this.settings.searchInput).val();
      
      e.preventDefault();

      if (query.match(/[a-z]/i)) window.location = '/search?q=' + encodeURI(query);
    },

    openFooterAccordion(accordionBody) {
      accordionBody.css('height', accordionBody[0].scrollHeight);
      accordionBody.attr('data-state', 'open');
    },

    closeFooterAccordion(accordionBody) {
      accordionBody.css('height', '');
      accordionBody.attr('data-state', 'closed');
    },

    setCartIndicator() {
      const cartSize = CartService.getCartSize();
      const $cartToggle = $(this.elems.cartDrawerToggle);

      $cartToggle.removeClass(this.elems.cartLarge);

      if (cartSize === 0) {
        $cartToggle.empty();
        $cartToggle.addClass(this.elems.cartEmpty);
      } else {
        $cartToggle.text(cartSize.toString());
        $cartToggle.removeClass(this.elems.cartEmpty);

        if (cartSize > 99) $cartToggle.addClass(this.elems.cartLarge);
      }
    },

    updateLogin() {
      this.state.user = AccountService.getUser();
      
      Utils.render('menuLogin', this.state);
      Utils.render('headerLogin', this.state);
    },

    checkLogout() {
      if (window.location.search && window.location.search.includes("logout=true")) {
        // logout=true may come from a server redirect, so check to make sure local user data is cleared
        if (AccountService.getUser()) {
          CartService.flushCartData();
          AccountService.logout();
        }

        let newSearch = window.location.search.replace("logout=true&", "").replace("logout=true", "");
        if (newSearch === "?") newSearch = "";

        window.history.pushState({}, document.title, window.location.pathname + newSearch);
      }
    },

    checkLoginOpen() {
      if (window.location.search && window.location.search.includes("login=true")) {
        if (AccountService.getUser()) window.location.href = "/account";
        else $(document).ready(this.openLogin.bind(this));

        let newSearch = window.location.search.replace("login=true&", "").replace("login=true", "");
        if (newSearch === "?") newSearch = "";

        window.history.pushState({}, document.title, window.location.pathname + newSearch);
      }
    },

    captureNewsletterSubscribe() {
      // gtm tagging on book form open
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({'event': 'email-newsletter-registration-completed'});
    },

    checkCookieDisclaimer() {
      if (Utils.checkCookie('il_cd') === false) {
        setTimeout(this.showCookieDisclaimer.bind(this), 5000);
      }
    },
    
    showCookieDisclaimer() {
      $(this.elems.cookieDisclaimer).show(300);
    },

    hideCookieDisclaimer() {
      $(this.elems.cookieDisclaimer).hide(300);
    },

    acceptCookie() {
      Utils.setCookie('il_cd', true, 7300); // 20 years
      this.hideCookieDisclaimer();

      $(".subNav__email input[type='checkbox']").closest("fieldset").hide();
    },

    captureRsvpClick() {
      // gtm tagging on book form open
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({'event': 'event-spot-reserved'});
    }
  }

  appController.init();

})(jQuery);

