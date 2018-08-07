(($, controller) => {

  const routeController = {
    init() {
      this.elems ={
        subNav: `.history__subNav--inner`
      }

      this.state = {}
      
      this.bindEvents(this);
    },

    bindEvents(s) {
      document.addEventListener('turbolinks:load', () => {
        // Init desktop sticky
        if (Utils.getWindowWidthEms() > 60) {
          $(this.elems.subNav).sticky({topSpacing: 40, zIndex: 2});
        }
      });
    }
  }

  routeController.init();

})(jQuery, 'beauty-history');
