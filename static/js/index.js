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
    
    // Setup video control for carousel
    setupCarouselVideoControl(carousels);
    
    bulmaSlider.attach();
});

// Function to pause all videos
function pauseAllVideos() {
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
        video.pause();
    });
}

// Setup carousel control logic - stop all videos when carousel changes
function setupCarouselVideoControl(carousels) {
    if (carousels && carousels.length > 0) {
        carousels.forEach(carousel => {
            // Listen for bulma-carousel events
            carousel.on('before:show', pauseAllVideos);
            carousel.on('after:show', pauseAllVideos);
            
            // Get the carousel element and attach additional events
            const carouselElement = carousel.element;
            if (carouselElement) {
                // Listen for navigation clicks
                const navButtons = carouselElement.querySelectorAll('.carousel-nav-left, .carousel-nav-right, .carousel-pagination button');
                navButtons.forEach(button => {
                    button.addEventListener('click', pauseAllVideos);
                });
                
                // Listen for touch/swipe events that might trigger carousel change
                let startX = null;
                carouselElement.addEventListener('touchstart', function(e) {
                    startX = e.touches[0].clientX;
                });
                
                carouselElement.addEventListener('touchend', function(e) {
                    if (startX !== null) {
                        const endX = e.changedTouches[0].clientX;
                        const diff = Math.abs(startX - endX);
                        // If significant swipe detected, pause videos
                        if (diff > 50) {
                            setTimeout(pauseAllVideos, 100); // Small delay to ensure carousel has changed
                        }
                        startX = null;
                    }
                });
            }
        });
    }
}
