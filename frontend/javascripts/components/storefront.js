(($, component) => {
    
    const storefrontComponent = {
        init() {
            this.elems = {
                storefrontWrap: '.storefront__wrap',
                storefrontFilters: '.storefront__filters',
                segmentToggle: '.storefrontAction__segmentToggle',
                filtersToggle: '.storefrontAction__filtersToggle',
                filter: '.storefrontAction__filter'
            }

            this.state = {
                filtersOpen: false,
                appliedFilters: {
                    focus: 'All Focus',
                    ritual: 'All Rituals',
                    type: 'All Types'
                },
                appData: JSON.parse(JSON.stringify(window.appData))
            }

            this.subComponents = {
                storefrontSegments: 'storefrontSegments'
            }
            
            this.bindEvents();
        },

        bindEvents() {
            Utils.turboBind('click', this.elems.segmentToggle, (e) => {
                this.updateActiveSegment($(e.currentTarget).attr('data-segment'));
            });

            Utils.turboBind('click', this.elems.filtersToggle, (e) => {
                let $filtersToggle = $(e.currentTarget);
                let $filters = $(this.elems.storefrontFilters);

                if (!this.state.filtersOpen) {
                    this.openFilters($filtersToggle, $filters);
                } else {
                    this.closeFilters($filtersToggle, $filters);
                }
            });

            Utils.turboBind('click', this.elems.filter, (e) => {
                this.applyFilter(e);
            });

            document.addEventListener('turbolinks:load', () => {
                if ($(`*[data-component="${component}"]`).length) {
                    this.state.activeSegment = $(this.elems.storefrontWrap).attr('data-active-segment');
                }
            });
            
        },

        updateActiveSegment(segment) {
            this.state.activeSegment = segment;
            window.history.replaceState('' , segment, `/shop/${segment}`);
            $(this.elems.storefrontWrap).attr('data-active-segment', segment);
        },

        openFilters($filtersToggle, $filters) {
            $filters.css('height', 'auto');
            $filters.attr('data-state', 'open');
            $filtersToggle.attr('data-state', 'open');
            this.state.filtersOpen = true;
        },

        closeFilters($filtersToggle, $filters) {
            $filters.css('height', '0');
            $filters.attr('data-state', 'closed');
            $filtersToggle.attr('data-state', 'closed');
            this.state.filtersOpen = false;
        },

        applyFilter(e) {
            let $this = $(e.currentTarget);
            let $filterBlock = $this.closest('.storefront__filterBlock');
            let filterType = $filterBlock.attr('data-filter-type');
            let appliedFiltersState = this.state.appliedFilters;
            let appDataState = JSON.parse(JSON.stringify(window.appData));
            let focus = {};
            let ritual = {};

            appliedFiltersState[filterType] = $this.text();

            $filterBlock.find('.storefront__filterBlockFilter--active').removeClass('storefront__filterBlockFilter--active');
            $this.addClass('storefront__filterBlockFilter--active');

            // loop through master products list to find and insert
            // those that match the filter parameters
            for (let key in appDataState.products) {
                let prod = appDataState.products[key];
                // does this match universally applied filters
                if (prod.type.includes(appliedFiltersState.type) || appliedFiltersState.type.indexOf('All') > -1) {
                    // for each focus this product belongs to ->
                    prod.focus.forEach((e, i) => {
                        // then check if it matches the applied focus filter ->
                        if (e.fields.name === appliedFiltersState.focus || appliedFiltersState.focus.indexOf('All') > -1) {
                            // if it does for each ritual that the product belogs to
                            // add product to each ritual's products array
                            prod.ritual.forEach((el, idx) => {
                                // if ritual doesn't exist in new data create it
                                if (typeof ritual[el.fields.name.toLowerCase()] === 'undefined') {
                                    ritual[el.fields.name.toLowerCase()] = window.appData.segments.ritual[el.fields.name.toLowerCase()];
                                    // clear products array
                                    ritual[el.fields.name.toLowerCase()].products = [];
                                }
                                // add product to rituals products array
                                ritual[el.fields.name.toLowerCase()].products.push(prod);
                            });
                        }
                    });
                    // for each ritual this product belongs to ->
                    prod.ritual.forEach((e,i) => {
                        // then check if it matches the applied ritual filter ->
                        if (e.fields.name === appliedFiltersState.ritual || appliedFiltersState.ritual.indexOf('All') > -1) {
                            // if it does for each ritual that the product belogs to
                            // add product to each ritual's products array
                            prod.focus.forEach((el, idx) => {
                                // if ritual doesn't exist in new data create it
                                if (typeof focus[el.fields.name.toLowerCase()] === 'undefined') {
                                    focus[el.fields.name.toLowerCase()] = window.appData.segments.focus[el.fields.name.toLowerCase()];
                                    // clear products array
                                    focus[el.fields.name.toLowerCase()].products = [];
                                }
                                // add product to rituals products array
                                focus[el.fields.name.toLowerCase()].products.push(prod);
                            });
                        }
                    });
                }
            }

            // assign new data to the state
            this.state.appData.segments.focus = focus;
            this.state.appData.segments.ritual = ritual;
            // render the template with the new state data
            Utils.render(this.subComponents.storefrontSegments, this.state);
        }
    }

    

    storefrontComponent.init();

})(jQuery, 'storefront');