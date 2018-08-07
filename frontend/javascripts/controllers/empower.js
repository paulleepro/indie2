(($, controller) => {

  const routeController = {
    init() {
      this.elems ={
        slickSlider: `.empower__slickSlider`
      }

      this.state = {
        routeId: `#${controller}-route`
      }
      
      this.bindEvents(this);
    },

    bindEvents(s) {
      document.addEventListener('turbolinks:load', () => {
        $(s.elems.slickSlider).slick({
          arrows: false,
          dots: true,
          slidesToShow: 1,
          slidesToScroll: 1,
          centerPadding: '0px',
          centerMode: true
        });
      });
    }
  }

  routeController.init();

})(jQuery, 'empower');
