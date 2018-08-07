(($, component) => {
    
    const articlesComponent = {
        init() {
            this.elems = {
                articlesWrap: '.articles__wrap',
                loadMore: '.articlesAction__loadMore',
                loadMoreWrap: '.articles__loadMore',
                filtersSelect: '.articles__filtersSelect',
                articlesReset: '.articlesAction__reset'
            }

            this.state = {
                articleLimit: 10,
                selectedCategory: '',
                loadMoreClicks: 0,
                showFilters: false
            }
            
            this.bindEvents();
        },

        bindEvents() {
            Utils.turboBind('click', this.elems.loadMore, (e) => {
                this.loadMoreArticles(this.state.selectedCategory, (this.state.loadMoreClicks + 1) * (this.state.articleLimit));
            });

            Utils.turboBind('click', this.elems.articlesReset, (e) => {
                this.resetFilters();
            });

            Utils.turboBind('change', this.elems.filtersSelect, (e) => {
                if (e.currentTarget.value === 'Filter By') {
                    this.resetFilters();
                } else {
                    this.filterArticles(e.currentTarget.value);
                }
            });

            document.addEventListener('turbolinks:load', () => {
                if ($(`*[data-component="${component}"]`).length && (this.state.selectedCategory !== '' || this.loadMoreClicks !== 0)) {
                    this.resetFilters();
                }
            });
        },

        resetFilters() {
            $.get('/beauty-articles/fetch')
            .done((data) => {
                this.state.selectedCategory = '';
                this.state.loadMoreClicks = 0;
                data.showFilters = false;

                if (data.articles.length <= this.state.articleLimit) {
                    $(this.elems.loadMoreWrap).hide();
                } else {
                    $(this.elems.loadMoreWrap).show();
                }
    
                Utils.render(component, data);
            })
            .fail(() => {
                alert('There was an error loading the results, please refresh the page.');
            });
        },

        loadMoreArticles(category, skip) {
            $.get('/beauty-articles/fetch', {category: category, skip: skip})
            .done((data) => {

                if (data.articles.length <= this.state.articleLimit) {
                    $(this.elems.loadMoreWrap).hide();
                } else {
                    $(this.elems.loadMoreWrap).show();
                }
                // update load more state here so we confirm the request went through before updating
                this.state.loadMoreClicks = this.state.loadMoreClicks + 1;
                $(Handlebars.templates[component](data)).appendTo($(`[data-component="${component}"]`));
            })
            .fail(() => {
                alert('There was an error loading the results, please refresh the page.');
            });
        },

        filterArticles(category) {
            $.get('/beauty-articles/fetch', {category: category})
            .done((data) => {

                if (data.articles.length <= this.state.articleLimit) {
                    $(this.elems.loadMoreWrap).hide();
                } else {
                    $(this.elems.loadMoreWrap).show();
                }

                this.state.selectedCategory = category;
                this.state.loadMoreClicks = 0;
                data.showFilters = false;
                data.selectedCategory = this.state.selectedCategory;
                Utils.render(component, data);
            })
            .fail(() => {
                alert('There was an error loading the results, please refresh the page.');
            });
        }
    }

    articlesComponent.init();

})(jQuery, 'articles');