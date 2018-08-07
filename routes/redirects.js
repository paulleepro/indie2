const express = require('express');
const router = express.Router();

router.get('/about/*', function(req, res) {
  res.redirect(302, '/empower');
});

router.get('/about', function(req, res) {
  res.redirect(302, '/empower');
});

router.get('/as-seen-in/*', function(req, res) {
  res.redirect(302, '/ingredients'); // temp redirect to ingredients until beauty-articles live
});

router.get('/as-seen-in', function(req, res) {
  res.redirect(302, '/ingredients'); // temp redirect to ingredients until beauty-articles live
});

router.get('/author/*', function(req, res) {
  res.redirect(302, '/ingredients'); // temp redirect to ingredients until beauty-articles live
});

router.get('/author', function(req, res) {
  res.redirect(302, '/ingredients'); // temp redirect to ingredients until beauty-articles live
});

router.get('/blog/*', function(req, res) {
  res.redirect(302, '/ingredients'); // temp redirect to ingredients until beauty-articles live
});

router.get('/blog', function(req, res) {
  res.redirect(302, '/ingredients'); // temp redirect to ingredients until beauty-articles live
});

router.get('/category/*', function(req, res) {
  res.redirect(302, '/ingredients'); // temp redirect to ingredients until beauty-articles live
});

router.get('/category', function(req, res) {
  res.redirect(302, '/ingredients'); // temp redirect to ingredients until beauty-articles live
});

router.get('/diy-2/*', function(req, res) {
  res.redirect(302, '/ingredients'); // temp redirect to ingredients until beauty-articles live
});

router.get('/diy-2', function(req, res) {
  res.redirect(302, '/ingredients'); // temp redirect to ingredients until beauty-articles live
});

router.get('/events/*', function(req, res) {
  res.redirect(302, '/upcoming-events');
});

router.get('/events', function(req, res) {
  res.redirect(302, '/upcoming-events');
});

router.get('/get-in-touch/*', function(req, res) {
  res.redirect(302, '/contact');
});

router.get('/get-in-touch', function(req, res) {
  res.redirect(302, '/contact');
});

router.get('/instagram/*', function(req, res) {
  res.redirect(302, '/');
});

router.get('/instagram', function(req, res) {
  res.redirect(302, '/');
});

router.get('/learning-center/*', function(req, res) {
  res.redirect(302, '/ingredients'); // temp redirect to ingredients until beauty-articles live
});

router.get('/learning-center', function(req, res) {
  res.redirect(302, '/ingredients'); // temp redirect to ingredients until beauty-articles live
});

router.get('/nature/*', function(req, res) {
  res.redirect(302, '/ingredients'); // temp redirect to ingredients until beauty-articles live
});

router.get('/nature', function(req, res) {
  res.redirect(302, '/ingredients'); // temp redirect to ingredients until beauty-articles live
});

router.get('/news/*', function(req, res) {
  res.redirect(302, '/ingredients'); // temp redirect to ingredients until beauty-articles live
});

router.get('/news', function(req, res) {
  res.redirect(302, '/ingredients'); // temp redirect to ingredients until beauty-articles live
});

router.get('/publicitet/2013/08/glamour-indie-lee-blemish-lotion-bast-i-test', function(req, res) {
  res.redirect(302, '/ingredients'); // temp redirect to ingredients until beauty-articles live
});

router.get('/resources/faqs', function(req, res) {
  res.redirect(302, '/frequent-questions');
});

router.get('/resources/good-ingredients', function(req, res) {
  res.redirect(302, '/ingredients');
});

router.get('/resources/ingredients-to-avoid', function(req, res) {
  res.redirect(302, '/bad-ingredients');
});

router.get('/shipping-handling', function(req, res) {
  res.redirect(302, '/shipping-information');
});

router.get('/shop/all-new/grapefruit-citrus-nutrient-oil', function(req, res) {
  res.redirect(302, '/shop/products/grapefruit-citrus-nutrient-oil');
});

// router.get('/shop/all-new/indie-lee-gift-card', function(req, res) {
//   res.redirect(302, '/'); // waiting on gift cards to go live, then replace route
// });

router.get('/shop/all-new/jasmine-ylang-ylang-bath-soak', function(req, res) {
  res.redirect(302, '/shop/products/jasmine-ylang-ylang-bath-soak');
});

router.get('/shop/all-new/jasmine-ylang-ylang-nutrient-oil', function(req, res) {
  res.redirect(302, '/shop/products/jasmine-ylang-ylang-nutrient-oil');
});

router.get('/shop/all-new/brightening-cleanser', function(req, res) {
  res.redirect(302, '/shop/products/brightening-cleanser');
});

router.get('/shop/all-new/i-waken', function(req, res) {
  res.redirect(302, '/shop/products/i-waken-eye-serum');
});

router.get('/shop/all-new/coq-10-toner', function(req, res) {
  res.redirect(302, '/shop/products/coq-10-toner');
});

router.get('/shop/all-products/blemish-lotion', function(req, res) {
  res.redirect(302, '/shop/products/blemish-lotion');
});

router.get('/shop/all-products/blemish-stick', function(req, res) {
  res.redirect(302, '/shop/products/banish-stick');
});

router.get('/shop/all-products/banish-stick', function(req, res) {
  res.redirect(302, '/shop/products/banish-stick');
});

router.get('/shop/all-products/brightening-cleanser-169', function(req, res) {
  res.redirect(302, '/shop/products/brightening-cleanser');
});

router.get('/shop/all-products/brightening-cleanser-170', function(req, res) {
  res.redirect(302, '/shop/products/brightening-cleanser');
});

router.get('/shop/all-products/brightening-cleanser', function(req, res) {
  res.redirect(302, '/shop/products/brightening-cleanser');
});

router.get('/shop/all-products/calendula-eye-balm', function(req, res) {
  res.redirect(302, '/shop/products/calendula-eye-balm');
});

router.get('/shop/all-products/i-waken', function(req, res) {
  res.redirect(302, '/shop/products/i-waken-eye-serum');
});

router.get('/shop/all-products/clearing-mask', function(req, res) {
  res.redirect(302, '/shop/products/clearing-mask');
});

router.get('/shop/all-products/coconut-citrus-body-scrub', function(req, res) {
  res.redirect(302, '/shop/products/coconut-citrus-body-scrub');
});

router.get('/shop/all-products/coq-10-toner-167', function(req, res) {
  res.redirect(302, '/shop/products/coq-10-toner');
});

router.get('/shop/all-products/coq-10-toner-168', function(req, res) {
  res.redirect(302, '/shop/products/coq-10-toner');
});

router.get('/shop/all-products/coq-10-toner', function(req, res) {
  res.redirect(302, '/shop/products/coq-10-toner');
});

router.get('/shop/all-products/grapefruit-citrus-nutrient-oil', function(req, res) {
  res.redirect(302, '/shop/products/grapefruit-citrus-nutrient-oil');
});

// router.get('/shop/all-products/indie-lee-gift-card', function(req, res) {
//   res.redirect(302, '/'); // waiting on gift cards to go live, then replace route
// });

router.get('/shop/all-products/jasmine-ylang-ylang-bath-soak-98', function(req, res) {
  res.redirect(302, '/shop/products/jasmine-ylang-ylang-bath-soak');
});

router.get('/shop/all-products/jasmine-ylang-ylang-bath-soak-84', function(req, res) {
  res.redirect(302, '/shop/products/jasmine-ylang-ylang-bath-soak');
});

router.get('/shop/all-products/jasmine-ylang-ylang-nutrient-oil-97', function(req, res) {
  res.redirect(302, '/shop/products/jasmine-ylang-ylang-nutrient-oil');
});

router.get('/shop/all-products/jasmine-ylang-ylang-nutrient-oil-114', function(req, res) {
  res.redirect(302, '/shop/products/jasmine-ylang-ylang-nutrient-oil');
});

router.get('/shop/all-products/patchouli-sandalwood-moisturizing-oil', function(req, res) {
  res.redirect(302, '/shop/products/patchouli-sandalwood-moisturizing-oil');
});

router.get('/shop/all-products/rosehip-cleanser-165', function(req, res) {
  res.redirect(302, '/shop/products/rosehip-cleanser');
});

router.get('/shop/all-products/rosehip-cleanser-167', function(req, res) {
  res.redirect(302, '/shop/products/rosehip-cleanser');
});

router.get('/shop/all-products/rosehip-cleanser', function(req, res) {
  res.redirect(302, '/shop/products/rosehip-cleanser');
});

router.get('/shop/all-products/squalane-facial-cream', function(req, res) {
  res.redirect(302, '/shop/products/squalane-facial-cream');
});

router.get('/shop/all-products/squalane-facial-oil-travel', function(req, res) {
  res.redirect(302, '/shop/products/squalane-facial-oil');
});

router.get('/shop/all-products/squalane-facial-oil', function(req, res) {
  res.redirect(302, '/shop/products/squalane-facial-oil');
});

router.get('/shop/all-products/swiss-apple-facial-serum', function(req, res) {
  res.redirect(302, '/shop/products/swiss-apple-serum');
});

router.get('/shop/all-products/vanilla-citrus-moisturizing-oil', function(req, res) {
  res.redirect(302, '/shop/products/vanilla-citrus-moisturizing-oil');
});

router.get('/shop/balms/the-eye-balm', function(req, res) {
  res.redirect(302, '/shop/products/calendula-eye-balm');
});

router.get('/shop/body/coconut-citrus-body-scrub', function(req, res) {
  res.redirect(302, '/shop/products/coconut-citrus-body-scrub');
});

router.get('/shop/body/grapefruit-citrus-nutrient-oil', function(req, res) {
  res.redirect(302, '/shop/products/grapefruit-citrus-nutrient-oil');
});

// router.get('/shop/body/indie-lee-gift-card', function(req, res) {
//   res.redirect(302, '/'); // waiting on gift cards to go live, then replace route
// });

router.get('/shop/body/jasmine-ylang-ylang-bath-soak', function(req, res) {
  res.redirect(302, '/shop/products/jasmine-ylang-ylang-bath-soak');
});

router.get('/shop/body/jasmine-ylang-ylang-nutrient-oil-95', function(req, res) {
  res.redirect(302, '/shop/products/jasmine-ylang-ylang-nutrient-oil');
});

router.get('/shop/body/jasmine-ylang-ylang-nutrient-oil-102', function(req, res) {
  res.redirect(302, '/shop/products/jasmine-ylang-ylang-nutrient-oil');
});

router.get('/shop/body/patchouli-sandalwood-moisturizing-oil', function(req, res) {
  res.redirect(302, '/shop/products/patchouli-sandalwood-moisturizing-oil');
});

router.get('/shop/body/vanilla-citrus-moisturizing-oil', function(req, res) {
  res.redirect(302, '/shop/products/vanilla-citrus-moisturizing-oil');
});

router.get('/shop/face/blemish-lotion', function(req, res) {
  res.redirect(302, '/shop/products/blemish-lotion');
});

router.get('/shop/face/blemish-stick', function(req, res) {
  res.redirect(302, '/shop/products/banish-stick');
});

router.get('/shop/face/banish-stick', function(req, res) {
  res.redirect(302, '/shop/products/banish-stick');
});

router.get('/shop/face/brightening-cleanser-149', function(req, res) {
  res.redirect(302, '/shop/products/brightening-cleanser');
});

router.get('/shop/face/brightening-cleanser-150', function(req, res) {
  res.redirect(302, '/shop/products/brightening-cleanser');
});

router.get('/shop/face/brightening-cleanser', function(req, res) {
  res.redirect(302, '/shop/products/brightening-cleanser');
});

router.get('/shop/face/calendula-eye-balm', function(req, res) {
  res.redirect(302, '/shop/products/calendula-eye-balm');
});

router.get('/shop/face/i-waken', function(req, res) {
  res.redirect(302, '/shop/products/i-waken-eye-serum');
});

router.get('/shop/face/clearing-mask', function(req, res) {
  res.redirect(302, '/shop/products/clearing-mask');
});

router.get('/shop/face/coq-10-toner-147', function(req, res) {
  res.redirect(302, '/shop/products/coq-10-toner');
});

router.get('/shop/face/coq-10-toner-148', function(req, res) {
  res.redirect(302, '/shop/products/coq-10-toner');
});

router.get('/shop/face/coq-10-toner', function(req, res) {
  res.redirect(302, '/shop/products/coq-10-toner');
});

// router.get('/shop/face/indie-lee-gift-card', function(req, res) {
//   res.redirect(302, '/'); // waiting on gift cards to go live, then replace route
// });

router.get('/shop/face/rosehip-cleanser-145', function(req, res) {
  res.redirect(302, '/shop/products/rosehip-cleanser');
});

router.get('/shop/face/rosehip-cleanser-147', function(req, res) {
  res.redirect(302, '/shop/products/rosehip-cleanser');
});

router.get('/shop/face/rosehip-cleanser', function(req, res) {
  res.redirect(302, '/shop/products/rosehip-cleanser');
});

router.get('/shop/face/squalane-facial-cream', function(req, res) {
  res.redirect(302, '/shop/products/squalane-facial-cream');
});

router.get('/shop/face/squalane-facial-oil', function(req, res) {
  res.redirect(302, '/shop/products/squalane-facial-oil');
});

router.get('/shop/face/squalane-facial-oil-travel', function(req, res) {
  res.redirect(302, '/shop/products/squalane-facial-oil');
});

router.get('/shop/face/swiss-apple-facial-serum', function(req, res) {
  res.redirect(302, '/shop/products/swiss-apple-serum');
});

router.get('/shop/featured-products/coq-10-toner', function(req, res) {
  res.redirect(302, '/shop/products/coq-10-toner');
});

router.get('/shop/featured-products/brightening-cleanser', function(req, res) {
  res.redirect(302, '/shop/products/brightening-cleanser');
});

router.get('/shop/featured-products/grapefruit-citrus-nutrient-oil', function(req, res) {
  res.redirect(302, '/shop/products/grapefruit-citrus-nutrient-oil');
});

router.get('/shop/featured-products/squalane-facial-oil-travel', function(req, res) {
  res.redirect(302, '/shop/products/squalane-facial-oil');
});

router.get('/shop/featured-products/squalane-facial-oil', function(req, res) {
  res.redirect(302, '/shop/products/squalane-facial-oil');
});

router.get('/shop/featured-products/swiss-apple-facial-serum', function(req, res) {
  res.redirect(302, '/shop/products/swiss-apple-serum');
});

router.get('/shop/featured-products/i-waken', function(req, res) {
  res.redirect(302, '/shop/products/i-waken-eye-serum');
});

router.get('/shop/for-your-face/squalane-facial-oil', function(req, res) {
  res.redirect(302, '/shop/products/squalane-facial-oil');
});

router.get('/shop/for-your-face/the-blemish-lotion', function(req, res) {
  res.redirect(302, '/shop/products/blemish-lotion');
});

router.get('/shop/for-your-face/the-blemish-stick', function(req, res) {
  res.redirect(302, '/shop/products/banish-stick');
});

router.get('/shop/for-your-face/the-facial-serum', function(req, res) {
  res.redirect(302, '/shop/products/swiss-apple-serum');
});

// router.get('/shop/gift-cards/indie-lee-gift-card', function(req, res) {
//   res.redirect(302, '/'); // waiting on gift cards to go live, then replace route
// });

// router.get('/shop/kits/indie-lee-gift-card', function(req, res) {
//   res.redirect(302, '/'); // waiting on gift cards to go live, then replace route
// });

router.get('/shop/oils/vanilla-citrus-moisturizing-oil', function(req, res) {
  res.redirect(302, '/shop/products/vanilla-citrus-moisturizing-oil');
});

router.get('/shop/scrubs/the-body-scrub', function(req, res) {
  res.redirect(302, '/shop/products/coconut-citrus-body-scrub');
});

router.get('/shop/squalane-facial-cream', function(req, res) {
  res.redirect(302, '/shop/products/squalane-facial-cream');
});

router.get('/shop/squalane-facial-oil', function(req, res) {
  res.redirect(302, '/shop/products/squalane-facial-oil');
});

router.get('/shop/swiss-apple-facial-serum', function(req, res) {
  res.redirect(302, '/shop/products/swiss-apple-serum');
});

router.get('/shop/vanilla-citrus-moisturizing-oil', function(req, res) {
  res.redirect(302, '/shop/products/vanilla-citrus-moisturizing-oil');
});

router.get('/shop/rosehip-cleanser', function(req, res) {
  res.redirect(302, '/shop/products/rosehip-cleanser');
});

router.get('/shop/blemish-lotion', function(req, res) {
  res.redirect(302, '/shop/products/blemish-lotion');
});

router.get('/shop/blemish-stick', function(req, res) {
  res.redirect(302, '/shop/products/banish-stick');
});

router.get('/shop/brightening-cleanser', function(req, res) {
  res.redirect(302, '/shop/products/brightening-cleanser');
});

router.get('/shop/calendula-eye-balm', function(req, res) {
  res.redirect(302, '/shop/products/calendula-eye-balm');
});

router.get('/shop/clearing-mask', function(req, res) {
  res.redirect(302, '/shop/products/clearing-mask');
});

router.get('/shop/coconut-citrus-body-scrub', function(req, res) {
  res.redirect(302, '/shop/products/coconut-citrus-body-scrub');
});

router.get('/shop/coq-10-toner', function(req, res) {
  res.redirect(302, '/shop/products/coq-10-toner');
});

router.get('/shop/grapefruit-citrus-nutrient-oil', function(req, res) {
  res.redirect(302, '/shop/products/grapefruit-citrus-nutrient-oil');
});

router.get('/shop/jasmine-ylang-ylang-bath-soak', function(req, res) {
  res.redirect(302, '/shop/products/jasmine-ylang-ylang-bath-soak');
});

router.get('/shop/jasmine-ylang-ylang-nutrient-oil-128', function(req, res) {
  res.redirect(302, '/shop/products/jasmine-ylang-ylang-nutrient-oil');
});

router.get('/shop/jasmine-ylang-ylang-nutrient-oil-145', function(req, res) {
  res.redirect(302, '/shop/products/jasmine-ylang-ylang-nutrient-oil');
});

router.get('/shop/wholesale', function(req, res) {
  res.redirect(302, 'https://wholesale.indielee.com/');
});

router.get('/shop', function(req, res) {
  res.redirect(302, '/shop/ritual');
});

router.get('/resources/*', function(req, res) {
  res.redirect(302, '/ingredients'); // temp redirect to ingredients until beauty-articles live
});

router.get('/resources', function(req, res) {
  res.redirect(302, '/ingredients'); // temp redirect to ingredients until beauty-articles live
});

router.get('/stores/*', function(req, res) {
  res.redirect(302, '/stockists');
});

router.get('/stores', function(req, res) {
  res.redirect(302, '/stockists');
});

router.get('/tag/*', function(req, res) {
  res.redirect(302, '/ingredients'); // temp redirect to ingredients until beauty-articles live
});

router.get('/tag', function(req, res) {
  res.redirect(302, '/ingredients'); // temp redirect to ingredients until beauty-articles live
});

router.get('/uncategorized/*', function(req, res) {
  res.redirect(302, '/ingredients'); // temp redirect to ingredients until beauty-articles live
});

router.get('/uncategorized', function(req, res) {
  res.redirect(302, '/ingredients'); // temp redirect to ingredients until beauty-articles live
});

router.get('/wholesale-inquiries/*', function(req, res) {
  res.redirect(302, 'https://wholesale.indielee.com/');
});

router.get('/wholesale-inquiries', function(req, res) {
  res.redirect(302, 'https://wholesale.indielee.com/');
});

module.exports = router;