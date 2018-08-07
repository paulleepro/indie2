(($, component) => {
    
    const modalComponent = {

        init() {
            this.elems = {

            }

            this.state = {
                componentId: component
            }

            this.bindEvents();
        },

        bindEvents() {
            Utils.turboBind('click', `.${this.state.componentId}__button`, () => {
                this.alertMe();
            });
        },

        alertMe() {
            alert(component);
        }
    }

    modalComponent.init();

})(jQuery, 'modal');