(($, controller) => {

  const routeController = {
    init() {
      this.elems ={
        faqToggle: `.faq__question`,
        desktopSubnav: `.faq__subNav--inner-desktop`,
        mobileDropdown: `#faq__mobileDropdown--select`
      }

      this.state = {
        routeId: `#${controller}-route`
      }
      
      this.bindEvents(this);
    },

    bindEvents(s) {
      Utils.turboBind('click', s.elems.faqToggle, function(e) {
        $(this).toggleClass("faq__question--open");
      });

      Utils.turboBind('change', s.elems.mobileDropdown, function(e) {
        e.preventDefault();

        const target = $(e.target).val();

        if (target != "") {
          $('html, body').animate({
            scrollTop: $(target).offset().top  - 50
          }, 500);         
        }
      });

      document.addEventListener('turbolinks:load', () => {
        // Init desktop sticky
        if (Utils.getWindowWidthEms() > 60) {
          $(s.elems.desktopSubnav).sticky({topSpacing: 40, bottomSpacing: $(".footer").outerHeight() + 75, zIndex: 2});
        }
      });
    }
  }

  routeController.init();

})(jQuery, 'faq');
