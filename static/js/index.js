window.HELP_IMPROVE_VIDEOJS = false;

$(document).ready(function() {
    // Check for click events on the navbar burger icon

    var options = {
        slidesToScroll: 1,
        slidesToShow: 3,
        loop: true,
        infinite: true,
        autoplay: true,
        autoplaySpeed: 8000,
        pagination: false,
        navigation: true,
        navigationKeys: true,
        breakpoints: [
            {
                changePoint: 1344, // 3 * 448px
                slidesToShow: 3,
                slidesToScroll: 1
            },
            {
                changePoint: 896, // 2 * 448px
                slidesToShow: 2,
                slidesToScroll: 1
            },
            {
                changePoint: 448, // 1 * 448px
                slidesToShow: 1,
                slidesToScroll: 1
            }
        ]
    }

    // Initialize all div with carousel class
    var carousels = bulmaCarousel.attach('.carousel', options);
    
    bulmaSlider.attach();
})
