(($, component) => {
    
    const searchComponent = {

        init() {
            this.elems = {
                loader: '.search__loader',
                form: '.search__form',
                input: '.search__input'
            }

            this.state = {
                componentId: component
            }

            this.subComponents = {
                searchResults: 'searchResults'
            }

            this.queryTimer;

            this.bindEvents();
        },

        bindEvents() {
            Utils.turboBind('submit', this.elems.form, (e) => {
                e.preventDefault();
                clearTimeout(this.queryTimer);
                this.search($(this.elems.input).val());
            });

            Utils.turboBind('keyup', this.elems.input, (e) => {
                clearTimeout(this.queryTimer);

                if (e.which !== 13) { // 13 is enter / submit
                    this.queryTimer = setTimeout(() => {
                        this.search($(e.currentTarget).val());
                    }, 2000);
                }
            });
        },

        search(query) {
            $(this.elems.loader).show();

            $.ajax({
                url: "/search/query",
                method: "GET",
                headers: {
                  'Content-Type':'application/json'
                },
                data: {searchTerms: query}
            })
            .done((data) => {
                $(this.elems.loader).hide();
                Utils.render(this.subComponents.searchResults, data);
            })
            .fail((error) => {
                $(this.elems.loader).hide();
                console.error(error);
            });
        }
    }

    searchComponent.init();

})(jQuery, 'search');   