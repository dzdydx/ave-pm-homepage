// Gallery page JavaScript functionality
let categories = [];
let galleryVideos = {};

// Load categories and video data
async function loadCategories() {
    try {
        // Load category names from CSV
        const csvResponse = await fetch('static/class_name_mapping.csv');
        const csvText = await csvResponse.text();
        
        // Load video data from JSON
        const jsonResponse = await fetch('static/gallery_videos.json');
        galleryVideos = await jsonResponse.json();
        
        // Parse CSV
        const lines = csvText.trim().split('\n');
        const headers = lines[0].split(',');
        
        categories = lines.slice(1).map(line => {
            const values = line.split(',');
            const classId = parseInt(values[1]);
            return {
                class_name: values[0],
                class_id: classId,
                video_count: galleryVideos[classId] ? galleryVideos[classId].length : 0
            };
        });
        
        // Filter only categories that have videos
        categories = categories.filter(category => category.video_count > 0);
        
        // Sort by class_id
        categories.sort((a, b) => a.class_id - b.class_id);
        
        renderCategories(categories);
    } catch (error) {
        console.error('Error loading categories:', error);
        document.getElementById('categoryGrid').innerHTML = 
            '<div class="column is-full"><div class="notification is-danger">Failed to load categories</div></div>';
    }
}

// Render categories grid
function renderCategories(categoriesToRender) {
    const grid = document.getElementById('categoryGrid');
    
    if (categoriesToRender.length === 0) {
        grid.innerHTML = '<div class="column is-full"><div class="notification is-info">No categories found</div></div>';
        return;
    }
    
    const categoriesHTML = categoriesToRender.map(category => {
        const categoryName = category.class_name;
        const classId = category.class_id;
        
        return `
            <div class="column is-one-quarter-desktop is-half-tablet">
                <div class="category-card">
                    <div class="category-content">
                        <div class="category-title">${categoryName}</div>
                        <div class="category-id">Class ID: ${classId}</div>
                        <div class="video-count">${category.video_count} videos available</div>
                        <button class="button is-primary view-category-btn" onclick="viewCategory(${classId}, '${categoryName}')">
                            <span class="icon">
                                <i class="fas fa-play"></i>
                            </span>
                            <span>View Videos</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    grid.innerHTML = categoriesHTML;
}

// View category function
function viewCategory(classId, categoryName) {
    // Navigate to category page
    window.location.href = `category.html?id=${classId}&name=${encodeURIComponent(categoryName)}`;
}

// Search functionality
function searchCategories() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    if (!searchTerm) {
        renderCategories(categories);
        return;
    }
    
    const filteredCategories = categories.filter(category => 
        category.class_name.toLowerCase().includes(searchTerm)
    );
    
    renderCategories(filteredCategories);
}

// Add enter key support for search
document.addEventListener('DOMContentLoaded', function() {
    loadCategories();
    
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                searchCategories();
            }
        });
        
        // Real-time search
        searchInput.addEventListener('input', function() {
            searchCategories();
        });
    }
});
