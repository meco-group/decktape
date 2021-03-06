function Reveal(page) {
    this.page = page;
}

Reveal.prototype = {

    getName: function () {
        return 'Reveal JS';
    },

    isActive: function () {
        return this.page.evaluate(function () {
            if (typeof Reveal === 'undefined')
                return false;

            if (!(typeof Reveal.isLastSlide === 'function')) {
                console.log('Reveal JS plugin isn\'t compatible with reveal.js version < 2.3.0');
                return false;
            }

            return true;
        });
    },

    configure: function () {
        var URI = require('URI');
        this.page.evaluate(function (fragments) {
            Reveal.configure({
                controls: false,
                progress: true,
                fragments: true,
                transition: 'none',
                slideNumber: true
            });
        // It seems passing 'fragments=true' in the URL query string does not take precedence
        // over globally configured 'fragments' and prevents from being able to toggle fragments
        // with ...?fragments=<true|false> so we work around that by parsing the page query string
        }, (URI(this.page.url).query(true)['fragments'] || 'false').toLowerCase() === 'true');
    },

    slideCount: function () {
        return this.page.evaluate(function () {
            // TODO: the getTotalSlides API does not report the number of slides accurately
            // as it does not take stacks and some index-less fragments into account
            // getTotalSlides API is only available starting reveal.js version 3.0.0
            return typeof Reveal.getTotalSlides === 'function' ? Reveal.getTotalSlides() : undefined;
        });
    },

    hasNextSlide: function () {
        // FIXME: does not work when there is a stack or some index-less fragments into account
        return this.page.evaluate(function () {
            return (!Reveal.isLastSlide() || Reveal.availableFragments().next);
        });
    },

    nextSlide: function () {
        this.page.evaluate(function () {
            Reveal.next();
        });
    },

    currentSlideIndex: function () {
        return this.page.evaluate(function () {
            var indices = Reveal.getIndices();
            var id = Reveal.getCurrentSlide().getAttribute('id');
            if (typeof id === 'string' && id.length)
                return '/' + id;
            else
                return '/' + indices.h + (indices.v > 0 ? '/' + indices.v : '');
        });
    }
};

exports.create = function (page) {
    return new Reveal(page);
};
