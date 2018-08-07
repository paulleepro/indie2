(($, component) => {
    
    const upcomingEventsComponent = {
        init() {
            this.elems = {
                filterSelect: '.upcomingEvents__filterSelect',
                sortSelect: '.upcomingEvents__filterSelect--sort',
                seriesSelect: '.upcomingEvents__filterSelect--series'
            }

            this.state = {
                selectedSort: '',
                selectedSeries: ''
            }
            
            this.bindEvents();
        },

        bindEvents() {
            Utils.turboBind('change', this.elems.filterSelect, (e) => {
                this.state.selectedSort = $(this.elems.sortSelect).val();
                this.state.selectedSeries = $(this.elems.seriesSelect).val();

                if (this.state.selectedSort == '' && this.state.selectedSeries == '') {
                    this.resetFilters();
                } else {
                    this.filterEvents();
                }
            });

            document.addEventListener('turbolinks:load', () => {
                if ($(`*[data-component="${component}"]`).length) {
                    if (this.state.selectedSort == '' && this.state.selectedSeries == '') {
                        this.resetFilters();
                    }
                }
            });
        },

        resetFilters() {
            $.get('/upcoming-events/fetch')
                .done((data) => {
                    this.state.selectedSort = '';
                    this.state.selectedSeries = '';

                    Utils.render(component, data);
                })
                .fail(() => {
                    alert('There was an error loading the results, please refresh the page.');
                });
        },

        filterEvents() {
            $.get('/upcoming-events/fetch', {series: this.state.selectedSeries, sort: this.state.selectedSort})
                .done((data) => {
                    Utils.render(component, data);
                })
                .fail(() => {
                    alert('There was an error loading the results, please refresh the page.');
                });
        }
    }

    upcomingEventsComponent.init();

})(jQuery, 'upcomingEvents');