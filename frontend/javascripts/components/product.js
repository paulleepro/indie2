(($, component) => {
    
    const productComponent = {
        init() {
            this.elems = {
                productWrap: '.product__wrap',
                variant: '.product__variant',
                selectedVariant: '.product__variant--selected',
                productImage: '.product__image',
                addToCart: '.cartAction__addToCart',
                addToCartDisabled: '.cartAction__addToCart--disabled',
                viewTranscript: '.product__viewTranscript',
                transcript: '.product__videoTranscript'
            };

            this.state = {/* Set state on turbolinks load when elems are present */};
            
            this.bindEvents();
        },

        bindEvents() {
            Utils.turboBind('click', this.elems.variant, (e) => {
                const $target = $(e.currentTarget),
                      $container = $(this.elems.productImage);

                $(this.elems.variant).removeClass("product__variant--selected");
                $target.toggleClass("product__variant--selected");

                this.updateVariant($container,$target);
            });

            Utils.turboBind('click', this.elems.viewTranscript, () => {
                $(this.elems.transcript).toggle();
            });

            document.addEventListener('turbolinks:load', () => {
                if ($(`*[data-component="${component}"]`).length) {
                    this.state.productSlug = $(this.elems.productWrap).attr('data-product-slug');
                    this.state.selectedVariantSku = $(this.elems.selectedVariant).attr('data-variant-sku');
                    this.state.productPrice = $(this.elems.selectedVariant).attr('data-variant-price');
                    this.state.product = window.appData.products[this.state.productSlug];
                    this.state.selectedVariant = this.state.product.productVariants.find((variant) => { return variant.fields.sku === this.state.selectedVariantSku});

                    this.eeProductImpression({
                        id: this.state.selectedVariantSku,
                        name: this.state.product.name,
                        price: this.state.productPrice,
                        variant: this.state.selectedVariant ? this.state.selectedVariant.fields.variation : null
                    });
                }
            });
        },

        updateVariant($container,$target) {
            const imageUrl = $target.attr("data-variant-img");
            const sku = $target.attr("data-variant-sku");
            const variant = Utils.getProductVariant(sku);
            const price = $target.attr("data-variant-price");
            const stock = $target.attr("data-variant-stock");

            $container.fadeOut(250, () => {
                $container.css("background-image", "url('"+imageUrl+"')");
                $container.fadeIn(50);              
            });
            
            if (stock !== "false") {
                $(this.elems.addToCart).removeClass("dn").addClass("db");
                $(this.elems.addToCartDisabled).removeClass("db").addClass("dn");
                $(this.elems.addToCart).attr({
                    'data-item-sku': sku,
                    'data-item-image': imageUrl,
                    'data-item-price': price,
                    'data-item-variation': variant ? variant.variation : null,
                });
                $(this.elems.addToCart).html("Add To Your Cart – " + Utils.moneyFormat(price));
            } else {
                $(this.elems.addToCart).removeClass("db").addClass("dn");
                $(this.elems.addToCartDisabled).removeClass("dn").addClass("db");
            }

            this.eeProductImpression({
                id: sku,
                name: this.state.product.name,
                price: this.state.productPrice,
                variant: variant ? variant.variation : null
            });
        },

        eeProductImpression(product) {
            window.dataLayer.push({
                event: "EEproductView",
                ecommerce: {
                    detail: {
                        actionField: {},
                        products: [{
                            id: product.id,
                            name: product.name,
                            price: parseFloat(product.price),
                            variant: product.variant,
                            brand: 'Indie Lee',
                        }]
                    }
                }
            });
        }
    }

    productComponent.init();

})(jQuery, 'product');