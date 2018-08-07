(($, component) => {
    
    const ingredientOverlayComponent = {

        init() { 
            this.elems = {
                showIngredientOverlay: '.ingredientOverlay__show',
                closeIngredientOverlay: '.ingredientOverlay__close',
                ingredientOverlayWrapper: '.ingredientOverlay__wrapper' 
            }
            
            this.bindEvents(this);
        },

        bindEvents(s) {
            Utils.turboBind('click', s.elems.showIngredientOverlay, function(e) {
                const slug = $(this).attr("data-target");

                s.fetchIngredient(slug);
                $(s.elems.ingredientOverlayWrapper).addClass("ingredientOverlay__wrapper--open");
            });

            Utils.turboBind('click', s.elems.closeIngredientOverlay, function(e) {
                $(s.elems.ingredientOverlayWrapper).removeClass("ingredientOverlay__wrapper--open");
                Utils.render(component, {ingredient: null});
            });

            document.addEventListener('turbolinks:load', () => {
                if ($(`*[data-component="${component}"]`).length) {
                    Utils.render(component, this.state);
                }
            });
        },
        
        fetchIngredient(slug) {
            $.get('/ingredients/fetch/'+slug)
                .done((data) => {
                    Utils.render(component, data);
                })
                .fail(() => {
                    alert('There was an error loading the ingredient, please refresh the page.');
                });
        }
    }

    ingredientOverlayComponent.init();

})(jQuery, 'ingredientOverlay');