(($, component) => {
    
    const ingredientProductsSliderComponent = {

        init() {
            this.elems = {
                wrap: '.ingredientProductsSlider__wrap'
            }

            this.state = {/* Set state on turbolinks load when elems are present */}
            
            this.bindEvents();
        },

        bindEvents() {
            document.addEventListener('turbolinks:load', () => {
                if ($(`*[data-component="${component}"]`).length) {
                    this.state.ingredientSlug = $(this.elems.wrap).attr('data-ingredient-slug');
                    this.state.products = [];
                    this.state.ingredient = {name: $(this.elems.wrap).attr('data-ingredient-name')};

                    $.each(window.appData.products, (ind,obj) => {
                        if (obj.ingredients.filter(i => i.fields.slug == this.state.ingredientSlug).length) {
                            this.state.products.push(obj);
                        }
                    });
                    Utils.render(component, this.state);
                }
            });
        }
    }

    ingredientProductsSliderComponent.init();

})(jQuery, 'ingredientProductsSlider');