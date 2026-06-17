// Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize dashboard
    initializeDashboard();
    loadData();
});

// Global variables
let currentPage = 'dashboard';
let isDarkMode = false;
let dashboardData = {
    sermons: [],
    resources: [],
    events: [],
    prayerRequests: [],
    gallery: [],
    donations: {},
    settings: {}
};

// Initialize dashboard
function initializeDashboard() {
    setupNavigation();
    setupDarkMode();
    setupForms();
    setupUploadBoxes();
    setupSearch();
}

// Navigation setup
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sidebarToggle = document.getElementById('sidebarToggle');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            switchPage(page);
        });
    });

    sidebarToggle.addEventListener('click', function() {
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.querySelector('.main-content');
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('sidebar-collapsed');
    });
}

// Switch pages
function switchPage(pageId) {
    // Update navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`[data-page="${pageId}"]`).classList.add('active');

    // Update page content
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');

    // Update page title
    const pageTitles = {
        'dashboard': 'Dashboard',
        'upload-sermon': 'Upload Sermon',
        'manage-resources': 'Manage Resources',
        'prayer-wall': 'Prayer Wall',
        'events': 'Events',
        'gallery': 'Gallery',
        'donations': 'Donations',
        'messages': 'Messages',
        'settings': 'Settings'
    };
    document.getElementById('pageTitle').textContent = pageTitles[pageId] || 'Dashboard';

    currentPage = pageId;
}

// Dark mode setup
function setupDarkMode() {
    const darkModeToggle = document.getElementById('darkModeToggle');

    // Load saved preference
    const savedDarkMode = localStorage.getItem('dashboardDarkMode');
    if (savedDarkMode === 'true') {
        document.body.classList.add('dark-mode');
        darkModeToggle.textContent = '☀️';
        isDarkMode = true;
    }

    darkModeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        isDarkMode = !isDarkMode;
        darkModeToggle.textContent = isDarkMode ? '☀️' : '🌙';
        localStorage.setItem('dashboardDarkMode', isDarkMode);
    });
}

// Form setup
function setupForms() {
    // Sermon upload form
    const sermonForm = document.getElementById('sermonForm');
    sermonForm.addEventListener('submit', function(e) {
        e.preventDefault();
        uploadSermon();
    });

    // Resource upload form
    const resourceForm = document.getElementById('resourceForm');
    resourceForm.addEventListener('submit', function(e) {
        e.preventDefault();
        uploadResource();
    });

    // Event form
    const eventForm = document.getElementById('eventForm');
    eventForm.addEventListener('submit', function(e) {
        e.preventDefault();
        addEvent();
    });

    // Donation form
    const donationForm = document.getElementById('donationForm');
    donationForm.addEventListener('submit', function(e) {
        e.preventDefault();
        updateDonations();
    });

    // Settings form
    const settingsForm = document.getElementById('settingsForm');
    settingsForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveSettings();
    });
}

// Upload boxes setup
function setupUploadBoxes() {
    // Audio upload box
    const audioUploadBox = document.getElementById('audioUploadBox');
    const sermonAudio = document.getElementById('sermonAudio');

    audioUploadBox.addEventListener('click', () => sermonAudio.click());
    audioUploadBox.addEventListener('dragover', handleDragOver);
    audioUploadBox.addEventListener('drop', (e) => handleFileDrop(e, sermonAudio));

    sermonAudio.addEventListener('change', function() {
        updateUploadBoxText(audioUploadBox, this.files);
    });

    // Resource upload box
    const resourceUploadBox = document.getElementById('resourceUploadBox');
    const resourceFile = document.getElementById('resourceFile');

    resourceUploadBox.addEventListener('click', () => resourceFile.click());
    resourceUploadBox.addEventListener('dragover', handleDragOver);
    resourceUploadBox.addEventListener('drop', (e) => handleFileDrop(e, resourceFile));

    resourceFile.addEventListener('change', function() {
        updateUploadBoxText(resourceUploadBox, this.files);
    });

    // Gallery upload box
    const galleryUploadBox = document.getElementById('galleryUploadBox');
    const galleryFiles = document.getElementById('galleryFiles');

    galleryUploadBox.addEventListener('click', () => galleryFiles.click());
    galleryUploadBox.addEventListener('dragover', handleDragOver);
    galleryUploadBox.addEventListener('drop', (e) => handleFileDrop(e, galleryFiles));

    galleryFiles.addEventListener('change', function() {
        uploadGalleryImages(this.files);
    });
}

// Search setup
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase();
        filterContent(query);
    });
}

// Upload functions
function uploadSermon() {
    const title = document.getElementById('sermonTitle').value;
    const speaker = document.getElementById('sermonSpeaker').value;
    const topic = document.getElementById('sermonTopic').value;
    const description = document.getElementById('sermonDescription').value;
    const thumbnail = document.getElementById('sermonThumbnail').files[0];
    const audio = document.getElementById('sermonAudio').files[0];

    if (!title || !speaker || !audio) {
        showNotification('Please fill in all required fields and select an audio file.', 'error');
        return;
    }

    const sermon = {
        id: Date.now(),
        title,
        speaker,
        topic,
        description,
        thumbnail: thumbnail ? URL.createObjectURL(thumbnail) : null,
        audio: URL.createObjectURL(audio),
        date: new Date().toISOString()
    };

    dashboardData.sermons.push(sermon);
    saveData();
    updateDashboardStats();
    showNotification('Sermon uploaded successfully!', 'success');

    // Reset form
    document.getElementById('sermonForm').reset();
    document.getElementById('audioUploadBox').innerHTML = `
        <p>Drag & drop audio file here or click to browse</p>
        <p>Supported: MP3, WAV</p>
        <input type="file" id="sermonAudio" accept="audio/*" hidden>
    `;
}

function uploadResource() {
    const title = document.getElementById('resourceTitle').value;
    const category = document.getElementById('resourceCategory').value;
    const description = document.getElementById('resourceDescription').value;
    const file = document.getElementById('resourceFile').files[0];

    if (!title || !category || !file) {
        showNotification('Please fill in all required fields and select a file.', 'error');
        return;
    }

    const resource = {
        id: Date.now(),
        title,
        category,
        description,
        file: URL.createObjectURL(file),
        fileName: file.name,
        date: new Date().toISOString()
    };

    dashboardData.resources.push(resource);
    saveData();
    updateDashboardStats();
    renderResources();
    showNotification('Resource uploaded successfully!', 'success');

    // Reset form
    document.getElementById('resourceForm').reset();
    document.getElementById('resourceUploadBox').innerHTML = `
        <p>Drag & drop file here or click to browse</p>
        <p>Supported: PDF, DOCX, TXT, Images</p>
        <input type="file" id="resourceFile" accept=".pdf,.docx,.txt,image/*" hidden>
    `;
}

function addEvent() {
    const title = document.getElementById('eventTitle').value;
    const date = document.getElementById('eventDate').value;
    const location = document.getElementById('eventLocation').value;
    const description = document.getElementById('eventDescription').value;
    const poster = document.getElementById('eventPoster').files[0];

    if (!title || !date || !location) {
        showNotification('Please fill in all required fields.', 'error');
        return;
    }

    const event = {
        id: Date.now(),
        title,
        date,
        location,
        description,
        poster: poster ? URL.createObjectURL(poster) : null
    };

    dashboardData.events.push(event);
    saveData();
    updateDashboardStats();
    renderEvents();
    showNotification('Event added successfully!', 'success');

    // Reset form
    document.getElementById('eventForm').reset();
}

function uploadGalleryImages(files) {
    Array.from(files).forEach(file => {
        const image = {
            id: Date.now(),
            src: URL.createObjectURL(file),
            name: file.name
        };
        dashboardData.gallery.push(image);
    });

    saveData();
    renderGallery();
    showNotification('Images uploaded successfully!', 'success');
}

function updateDonations() {
    dashboardData.donations = {
        mtn: document.getElementById('mtnNumber').value,
        airtel: document.getElementById('airtelNumber').value,
        bankName: document.getElementById('bankName').value,
        accountNumber: document.getElementById('accountNumber').value,
        message: document.getElementById('donationMessage').value
    };

    saveData();
    showNotification('Donation settings updated!', 'success');
}

function saveSettings() {
    dashboardData.settings = {
        siteTitle: document.getElementById('siteTitle').value,
        primaryColor: document.getElementById('primaryColor').value,
        secondaryColor: document.getElementById('secondaryColor').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        whatsapp: document.getElementById('whatsapp').value
    };

    saveData();
    showNotification('Settings saved!', 'success');
}

// Render functions
function renderResources() {
    const resourcesList = document.getElementById('resourcesList');
    resourcesList.innerHTML = dashboardData.resources.map(resource => `
        <div class="resource-item">
            <h3>${resource.title}</h3>
            <p><strong>Category:</strong> ${resource.category}</p>
            <p>${resource.description}</p>
            <p><strong>File:</strong> ${resource.fileName}</p>
            <button class="delete-btn" onclick="deleteResource(${resource.id})">Delete</button>
        </div>
    `).join('');
}

function renderEvents() {
    const eventsList = document.getElementById('eventsList');
    eventsList.innerHTML = dashboardData.events.map(event => `
        <div class="event-item">
            <h3>${event.title}</h3>
            <p><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
            <p><strong>Location:</strong> ${event.location}</p>
            <p>${event.description}</p>
            ${event.poster ? `<img src="${event.poster}" alt="${event.title}" style="max-width: 200px; margin-top: 1rem;">` : ''}
            <button class="delete-btn" onclick="deleteEvent(${event.id})">Delete</button>
        </div>
    `).join('');
}

function renderGallery() {
    const galleryGrid = document.getElementById('galleryGrid');
    galleryGrid.innerHTML = dashboardData.gallery.map(image => `
        <div class="gallery-item">
            <img src="${image.src}" alt="${image.name}">
            <button class="delete-btn" onclick="deleteGalleryImage(${image.id})">×</button>
        </div>
    `).join('');
}

// Delete functions
function deleteResource(id) {
    dashboardData.resources = dashboardData.resources.filter(r => r.id !== id);
    saveData();
    renderResources();
    updateDashboardStats();
    showNotification('Resource deleted!', 'success');
}

function deleteEvent(id) {
    dashboardData.events = dashboardData.events.filter(e => e.id !== id);
    saveData();
    renderEvents();
    updateDashboardStats();
    showNotification('Event deleted!', 'success');
}

function deleteGalleryImage(id) {
    dashboardData.gallery = dashboardData.gallery.filter(i => i.id !== id);
    saveData();
    renderGallery();
    showNotification('Image deleted!', 'success');
}

// Utility functions
function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.style.borderColor = '#2A7F6E';
}

function handleFileDrop(e, inputElement) {
    e.preventDefault();
    e.currentTarget.style.borderColor = '#D4A53A';
    const files = e.dataTransfer.files;
    inputElement.files = files;
    updateUploadBoxText(e.currentTarget, files);
}

function updateUploadBoxText(uploadBox, files) {
    if (files.length > 0) {
        uploadBox.innerHTML = `<p>${files.length} file(s) selected</p>`;
    }
}

function updateDashboardStats() {
    document.getElementById('totalSermons').textContent = dashboardData.sermons.length;
    document.getElementById('prayerRequests').textContent = dashboardData.prayerRequests.length;
    document.getElementById('upcomingEvents').textContent = dashboardData.events.length;
    document.getElementById('totalResources').textContent = dashboardData.resources.length;
}

function filterContent(query) {
    // Implement search filtering logic here
    console.log('Searching for:', query);
}

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.add('show');

    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

function saveData() {
    localStorage.setItem('dashboardData', JSON.stringify(dashboardData));
}

function loadData() {
    const saved = localStorage.getItem('dashboardData');
    if (saved) {
        dashboardData = JSON.parse(saved);
        updateDashboardStats();
        renderResources();
        renderEvents();
        renderGallery();

        // Load settings
        if (dashboardData.settings) {
            document.getElementById('siteTitle').value = dashboardData.settings.siteTitle || '';
            document.getElementById('primaryColor').value = dashboardData.settings.primaryColor || '#1F3A6F';
            document.getElementById('secondaryColor').value = dashboardData.settings.secondaryColor || '#2A7F6E';
            document.getElementById('email').value = dashboardData.settings.email || '';
            document.getElementById('phone').value = dashboardData.settings.phone || '';
            document.getElementById('whatsapp').value = dashboardData.settings.whatsapp || '';
        }

        // Load donations
        if (dashboardData.donations) {
            document.getElementById('mtnNumber').value = dashboardData.donations.mtn || '';
            document.getElementById('airtelNumber').value = dashboardData.donations.airtel || '';
            document.getElementById('bankName').value = dashboardData.donations.bankName || '';
            document.getElementById('accountNumber').value = dashboardData.donations.accountNumber || '';
            document.getElementById('donationMessage').value = dashboardData.donations.message || '';
        }
    }
}

// Quick action handlers
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('action-btn')) {
        const action = e.target.getAttribute('data-action');
        switch (action) {
            case 'upload-sermon':
                switchPage('upload-sermon');
                break;
            case 'add-event':
                switchPage('events');
                break;
            case 'upload-pdf':
                switchPage('manage-resources');
                document.getElementById('resourceCategory').value = 'bible-study';
                break;
            case 'add-prayer':
                switchPage('prayer-wall');
                break;
            case 'post-announcement':
                showNotification('Announcement feature coming soon!', 'info');
                break;
        }
    }
});