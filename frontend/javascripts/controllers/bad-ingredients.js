(($, controller) => {

  const routeController = {
    init() {
      this.elems ={
        boxToggle: `.dirtyIngredient__wrapper`
      }

      this.state = {
        routeId: `#${controller}-route`
      }
      
      this.bindEvents(this);
    },

    bindEvents(s) {
      Utils.turboBind('click', s.elems.boxToggle, function(e) {
        $(this).toggleClass("dirtyIngredient__wrapper--open");
      });
    }
  }

  routeController.init();

})(jQuery, 'bad-ingredients');
