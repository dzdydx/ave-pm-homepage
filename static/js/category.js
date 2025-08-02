// Category page JavaScript functionality
let currentCategoryId = null;
let currentCategoryName = null;
let videos = [];
let isGridView = false;
let galleryVideos = {};

// Extract category info from URL parameters
function getCategoryFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    currentCategoryId = urlParams.get('id');
    currentCategoryName = urlParams.get('name');
    
    if (!currentCategoryId || !currentCategoryName) {
        showError('Invalid category parameters');
        return false;
    }
    
    return true;
}

// Load videos for the current category
async function loadCategoryVideos() {
    try {
        // Show loading indicator
        document.getElementById('loadingIndicator').style.display = 'block';
        
        // Load video data from JSON
        const jsonResponse = await fetch('static/gallery_videos.json');
        galleryVideos = await jsonResponse.json();
        
        // Update page title and headers
        updateCategoryInfo();
        
        // Get videos for this category
        videos = findAvailableVideos();
        
        if (videos.length === 0) {
            showError('No videos found for this category');
            return;
        }
        
        // Update video count
        document.getElementById('videoCount').textContent = `${videos.length} videos available`;
        
        // Render videos in carousel
        renderCarousel();
        
        // Hide loading indicator
        document.getElementById('loadingIndicator').style.display = 'none';
        
    } catch (error) {
        console.error('Error loading category videos:', error);
        showError('Failed to load videos for this category');
    }
}

// Update category information in the UI
function updateCategoryInfo() {
    document.getElementById('categoryTitle').textContent = currentCategoryName;
    document.getElementById('categoryId').textContent = currentCategoryId;
    document.getElementById('breadcrumbCategory').textContent = currentCategoryName;
    document.title = `${currentCategoryName} - AVE-PM Dataset`;
}

// Find available videos for the category
function findAvailableVideos() {
    const availableVideos = [];
    
    // Get video IDs for this category from the JSON data
    const categoryVideoIds = galleryVideos[currentCategoryId];
    
    if (!categoryVideoIds || categoryVideoIds.length === 0) {
        console.log(`No videos found for category ${currentCategoryId}`);
        return availableVideos;
    }
    
    // Use all available videos, don't limit to 5
    const videosToShow = categoryVideoIds;
    
    // Check each video and create video objects
    for (const videoId of videosToShow) {
        const videoPath = `static/videos/${currentCategoryId}/${videoId}.mp4`;
        
        // Add all videos to the list, let the browser handle loading errors
        availableVideos.push({
            id: videoId,
            path: videoPath,
            title: `${currentCategoryName} - ${videoId}`,
            filename: `${videoId}.mp4`
        });
    }
    
    return availableVideos;
}

// Check if a video file exists
function checkVideoExists(videoPath) {
    return new Promise((resolve) => {
        const video = document.createElement('video');
        video.preload = 'metadata';
        
        const timeout = setTimeout(() => {
            resolve(false);
        }, 5000); // 5 second timeout
        
        video.onloadedmetadata = () => {
            clearTimeout(timeout);
            resolve(true);
        };
        
        video.onerror = () => {
            clearTimeout(timeout);
            resolve(false);
        };
        
        video.onabort = () => {
            clearTimeout(timeout);
            resolve(false);
        };
        
        try {
            video.src = videoPath;
        } catch (error) {
            clearTimeout(timeout);
            resolve(false);
        }
    });
}

// Render videos in carousel format
function renderCarousel() {
    const carousel = document.getElementById('category-carousel');
    
    const videosHTML = videos.map((video, index) => `
        <div class="item item-video${index + 1}">
            <video
                poster=""
                id="video${index + 1}"
                controls
                muted
                loop
                onloadstart="handleVideoLoad('${video.id}')"
                onerror="handleVideoError('${video.id}')"
            >
                <source src="${video.path}" type="video/mp4" />
                Your browser does not support the video tag.
            </video>
            <div class="video-caption">
                <p><strong>${video.title}</strong></p>
                <p class="video-info">File: ${video.filename}</p>
            </div>
        </div>
    `).join('');
    
    carousel.innerHTML = videosHTML;
    
    // Initialize carousel with multiple slides visible
    if (typeof bulmaCarousel !== 'undefined') {
        bulmaCarousel.attach('#category-carousel', {
            slidesToScroll: 1,
            slidesToShow: 3, // Show 3 videos at once on desktop
            infinite: true,
            pagination: true,
            navigation: true,
            autoplay: false,
            autoplaySpeed: 3000,
            breakpoints: [
                {
                    changePoint: 1200,
                    slidesToShow: 3,
                    slidesToScroll: 1
                },
                {
                    changePoint: 768,
                    slidesToShow: 2,
                    slidesToScroll: 1
                },
                {
                    changePoint: 480,
                    slidesToShow: 1,
                    slidesToScroll: 1
                }
            ]
        });
    }
}

// Render videos in grid format
function renderGrid() {
    const grid = document.getElementById('videoGrid');
    
    const videosHTML = videos.map((video, index) => `
        <div class="column is-one-fifth-desktop is-one-third-tablet is-half-mobile video-grid-item">
            <div class="video-card">
                <video
                    controls
                    muted
                    onloadstart="handleVideoLoad('${video.id}')"
                    onerror="handleVideoError('${video.id}')"
                >
                    <source src="${video.path}" type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
                <div class="video-card-content">
                    <div class="video-title">${video.title}</div>
                    <div class="video-info">File: ${video.filename}</div>
                </div>
            </div>
        </div>
    `).join('');
    
    grid.innerHTML = videosHTML;
}

// Toggle between carousel and grid view
function toggleView() {
    isGridView = !isGridView;
    
    const carouselSection = document.querySelector('.hero.is-small.is-light');
    const gridSection = document.getElementById('gridView');
    const toggleIcon = document.getElementById('viewToggleIcon');
    const toggleText = document.getElementById('viewToggleText');
    
    if (isGridView) {
        carouselSection.style.display = 'none';
        gridSection.style.display = 'block';
        toggleIcon.className = 'fas fa-film';
        toggleText.textContent = 'Carousel View';
        renderGrid();
    } else {
        carouselSection.style.display = 'block';
        gridSection.style.display = 'none';
        toggleIcon.className = 'fas fa-th';
        toggleText.textContent = 'Grid View';
    }
}

// Handle video loading
function handleVideoLoad(videoId) {
    console.log(`Video ${videoId} loaded successfully`);
}

// Handle video loading errors
function handleVideoError(videoId) {
    console.log(`Failed to load video ${videoId}`);
    // You could replace the video with a placeholder or show an error message
}

// Show error message
function showError(message) {
    document.getElementById('loadingIndicator').style.display = 'none';
    document.getElementById('errorMessage').style.display = 'block';
    document.getElementById('errorMessage').querySelector('.notification p').textContent = message;
}

// Function to pause all videos
function pauseAllVideos() {
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
        video.pause();
    });
}

// Setup carousel control logic - stop all videos when carousel changes
function setupCarouselVideoControl() {
    // Add event listener for when carousel is created/recreated
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                if (node.nodeType === 1 && node.classList && node.classList.contains('carousel')) {
                    attachCarouselEvents(node);
                }
            });
        });
    });
    
    // Start observing the container for carousel additions
    const container = document.getElementById('videos-container');
    if (container) {
        observer.observe(container, { childList: true, subtree: true });
        
        // Also attach to any existing carousels
        const existingCarousels = container.querySelectorAll('.carousel');
        existingCarousels.forEach(attachCarouselEvents);
    }
}

// Attach carousel events to pause videos on slide change
function attachCarouselEvents(carousel) {
    // Listen for various carousel events
    carousel.addEventListener('slide.bs.carousel', pauseAllVideos);
    carousel.addEventListener('slid.bs.carousel', pauseAllVideos);
    
    // For bulma-carousel events
    carousel.addEventListener('before:show', pauseAllVideos);
    carousel.addEventListener('after:show', pauseAllVideos);
    
    // Also listen for navigation clicks
    const navButtons = carousel.querySelectorAll('.carousel-nav-left, .carousel-nav-right, .carousel-pagination button');
    navButtons.forEach(button => {
        button.addEventListener('click', pauseAllVideos);
    });
    
    // Listen for touch/swipe events that might trigger carousel change
    let startX = null;
    carousel.addEventListener('touchstart', function(e) {
        startX = e.touches[0].clientX;
    });
    
    carousel.addEventListener('touchend', function(e) {
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

// Initialize page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (getCategoryFromURL()) {
        loadCategoryVideos();
    }
    
    // Setup carousel video control
    setupCarouselVideoControl();
});
