(($, controller) => {

  const routeController = {
    init() {
      this.elems ={

      }

      this.state = {
        routeId: `#${controller}-route`
      }
      
      this.bindEvents(this.settings);
    },

    bindEvents(s) {
      Utils.turboBind('click', `${this.state.routeId} button`, () => {
        // this.alertMe();
      });
    }, 

    alertMe() {
      alert(controller);
    }
  }

  routeController.init();

})(jQuery, 'index');
