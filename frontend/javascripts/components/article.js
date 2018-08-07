(($, component) => {
    
    const articleComponent = {
        init() {
            this.elems = {
                articleBody: '.article__body',
                imageCol: '.article__imagesInner',
                textCol: '.article__textInner',
                aside: '.article__asideInner',
                images: '.article__image'
            }
            
            this.bindEvents();
        },

        bindEvents() {
            document.addEventListener('turbolinks:load', () => {
                // Init desktop sticky
                if ($(`*[data-component="${component}"]`).length) {
                    this.insertImagesToBody();
                    this.setStickyColumns();
                }
            });

            $(window).resize(() => {
                if ($(`*[data-component="${component}"]`).length) {
                    this.setStickyColumns();
                }
            });
        },

        setStickyColumns() {
            if (Utils.getWindowWidthEms() >= 60) {
                $(this.elems.imageCol).stick_in_parent();

                $(this.elems.textCol).stick_in_parent();

                $(this.elems.aside).stick_in_parent();
            } else {
                $(this.elems.imageCol).trigger("sticky_kit:detach");

                $(this.elems.textCol).trigger("sticky_kit:detach");

                $(this.elems.aside).trigger("sticky_kit:detach");
            }
        },

        insertImagesToBody() {
            $(this.elems.images).each((i,e) => {
                const $textParagraphs = $(`${this.elems.textCol} p`);

                if ($textParagraphs[i]) {
                    const img = `<img class="article__images db dn-l w-100 pv4" alt=${$(e).attr('alt')} src=${$(e).attr('src')}>`;

                    $(img).prependTo($textParagraphs[i]);
                }
            });
        }
    }

    articleComponent.init();

})(jQuery, 'article');