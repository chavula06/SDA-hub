// Mobile Menu Toggle
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const navList = document.getElementById('navMenu');

mobileMenuToggle.setAttribute('aria-expanded', 'false');
mobileMenuToggle.addEventListener('click', () => {
    const isOpen = navList.classList.toggle('active');
    mobileMenuToggle.setAttribute('aria-expanded', String(isOpen));
    mobileMenuToggle.textContent = isOpen ? '✕' : '☰';
});

document.addEventListener('click', (event) => {
    const target = event.target;
    if (navList.classList.contains('active') && !navList.contains(target) && target !== mobileMenuToggle) {
        navList.classList.remove('active');
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
        mobileMenuToggle.textContent = '☰';
    }
});

// Dark Mode Toggle
const darkModeToggle = document.getElementById('darkModeToggle');
const body = document.body;

darkModeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    const isDark = body.classList.contains('dark-mode');
    darkModeToggle.textContent = isDark ? '☀️' : '🌙';
    localStorage.setItem('darkMode', isDark);
});

// Load dark mode preference
const savedDarkMode = localStorage.getItem('darkMode');
if (savedDarkMode === 'true') {
    body.classList.add('dark-mode');
    darkModeToggle.textContent = '☀️';
}

// Dynamic content containers
const CONTENT_KEY = 'sdaHubContent';
let pageContent = null;

const heroHeadlineEl = document.getElementById('heroHeadline');
const heroSubtextEl = document.getElementById('heroSubtext');
const heroImageEl = document.getElementById('heroImage');
const quickAccessGrid = document.getElementById('quickAccessGrid');
const sermonsGrid = document.getElementById('sermonsGrid');
const prayerRequestsGrid = document.getElementById('prayerRequestsGrid');
const eventsGrid = document.getElementById('eventsGrid');
const resourcesGrid = document.getElementById('resourcesGrid');
const donationMtn = document.getElementById('donationMtn');
const donationAirtel = document.getElementById('donationAirtel');
const bankNameEl = document.getElementById('bankName');
const bankAccountEl = document.getElementById('bankAccount');
const contactEmailEl = document.getElementById('contactEmail');
const contactPhoneEl = document.getElementById('contactPhone');
const contactWhatsappEl = document.getElementById('contactWhatsapp');
const contactLocationEl = document.getElementById('contactLocation');

const prayerForm = document.querySelector('.prayer-form form');
const prayerNameInput = document.getElementById('prayerName');
const prayerTextInput = document.getElementById('prayerText');

async function fetchPageContent() {
    const saved = localStorage.getItem(CONTENT_KEY);
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch (error) {
            console.warn('Saved content is invalid JSON. Falling back to default content.');
        }
    }

    const response = await fetch('content.json');
    if (!response.ok) {
        console.error('Unable to load content.json.');
        return null;
    }
    return await response.json();
}

function renderHero() {
    const hero = pageContent.site;
    heroHeadlineEl.textContent = hero.heroHeadline;
    heroSubtextEl.textContent = hero.heroText;
    heroImageEl.src = hero.heroImage;
    heroImageEl.alt = hero.title;
}

function renderQuickAccess() {
    quickAccessGrid.innerHTML = pageContent.quickAccess.map(item => `
        <div class="card">
            <div class="card-icon"><img src="${item.icon}" alt="${item.title} icon"></div>
            <h3>${item.title}</h3>
            <p>${item.description}</p>
        </div>
    `).join('');
}

function renderSermons() {
    sermonsGrid.innerHTML = pageContent.sermons.map(sermon => `
        <div class="sermon-card" data-title="${sermon.title}" data-speaker="${sermon.speaker}" data-date="${sermon.date}" data-audio="${sermon.audio || ''}">
            <img src="${sermon.image}" alt="Sermon thumbnail for ${sermon.title}" class="sermon-img">
            <div class="sermon-content">
                <h3>${sermon.title}</h3>
                <p class="sermon-speaker">${sermon.speaker}</p>
                <p class="sermon-date">${sermon.date}</p>
                <p class="sermon-summary">${sermon.summary}</p>
                <button class="play-btn" type="button">▶ Play</button>
            </div>
        </div>
    `).join('');

    attachSermonPlayHandlers();
    const firstCard = document.querySelector('.sermon-card');
    if (firstCard) {
        loadSermonAudio(firstCard);
    }
}

function renderPrayerRequests() {
    if (!pageContent.prayerRequests.length) {
        prayerRequestsGrid.innerHTML = '<p class="section-intro">No prayer requests yet. Share the first one below.</p>';
        return;
    }

    prayerRequestsGrid.innerHTML = pageContent.prayerRequests.map(request => `
        <div class="prayer-card">
            <h4>${request.name}</h4>
            <p>${request.text}</p>
            <button class="pray-btn">🙏 Prayed For (${request.count})</button>
        </div>
    `).join('');

    attachPrayerHandlers();
}

function renderEvents() {
    eventsGrid.innerHTML = pageContent.events.map(event => `
        <div class="event-card">
            <h3>${event.title}</h3>
            <p class="event-date">${event.date}</p>
            <p class="event-location">${event.location}</p>
            <p>${event.description}</p>
        </div>
    `).join('');
}

function renderResources() {
    resourcesGrid.innerHTML = pageContent.resources.map(resource => `
        <div class="resource-category">
            <h3>${resource.category}</h3>
            <ul>
                ${resource.items.map(item => `<li><a href="#">${item}</a></li>`).join('')}
            </ul>
        </div>
    `).join('');
}

function renderDonation() {
    donationMtn.textContent = pageContent.donation.mtn;
    donationAirtel.textContent = pageContent.donation.airtel;
    bankNameEl.textContent = pageContent.donation.bank.name;
    bankAccountEl.textContent = pageContent.donation.bank.account;
}

function renderContact() {
    contactEmailEl.href = `mailto:${pageContent.contact.email}`;
    contactEmailEl.textContent = pageContent.contact.email;
    contactPhoneEl.href = `tel:${pageContent.contact.phone}`;
    contactPhoneEl.textContent = pageContent.contact.phone;
    contactWhatsappEl.href = pageContent.contact.whatsapp;
    contactWhatsappEl.textContent = 'Chat with us on WhatsApp';
    contactLocationEl.innerHTML = pageContent.contact.location.replace(/\n/g, '<br>');
}

function attachSermonPlayHandlers() {
    const playButtons = document.querySelectorAll('.play-btn');
    playButtons.forEach(button => {
        button.addEventListener('click', () => {
            const card = button.closest('.sermon-card');
            if (card) {
                loadSermonAudio(card);
                audioPlayer.play().catch(() => {
                    // Playback may be blocked until user interacts.
                });
            }
        });
    });
}

function attachPrayerHandlers() {
    const prayerButtons = document.querySelectorAll('.pray-btn');
    prayerButtons.forEach(button => {
        button.addEventListener('click', () => {
            const currentText = button.textContent;
            const match = currentText.match(/(\d+)/);
            if (match) {
                const count = parseInt(match[1], 10) + 1;
                button.textContent = `🙏 Prayed For (${count})`;
            }
        });
    });
}

function addPrayerRequest(name, text) {
    pageContent.prayerRequests.unshift({
        name: name || 'Anonymous',
        text,
        count: 0
    });
    renderPrayerRequests();
}

prayerForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = prayerNameInput.value.trim();
    const prayerText = prayerTextInput.value.trim();

    if (prayerText) {
        addPrayerRequest(name, prayerText);
        prayerNameInput.value = '';
        prayerTextInput.value = '';
        const newRequest = prayerRequestsGrid.querySelector('.prayer-card');
        if (newRequest) {
            newRequest.scrollIntoView({ behavior: 'smooth' });
        }
    }
});

// Smooth Scrolling for Navigation Links
const navLinks = document.querySelectorAll('.nav-list a[href^="#"]');

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);

        if (targetSection) {
            const headerHeight = document.querySelector('.header').offsetHeight;
            const targetPosition = targetSection.offsetTop - headerHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }

        navList.classList.remove('active');
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
        mobileMenuToggle.textContent = '☰';
    });
});

// Intersection Observer for Fade-in Animation
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

const sections = document.querySelectorAll('section');
sections.forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(20px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(section);
});

function createToneAudioDataUrl(frequency) {
    const sampleRate = 44100;
    const duration = 1.5;
    const numSamples = Math.floor(sampleRate * duration);
    const buffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(buffer);

    function writeString(offset, string) {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    }

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + numSamples * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, numSamples * 2, true);

    let offset = 44;
    for (let i = 0; i < numSamples; i++) {
        const sample = Math.round(32767 * Math.sin(2 * Math.PI * frequency * (i / sampleRate)));
        view.setInt16(offset, sample, true);
        offset += 2;
    }

    let binary = '';
    const bytes = new Uint8Array(buffer);
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
        binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
    }

    return 'data:audio/wav;base64,' + window.btoa(binary);
}

const audioPlayer = document.getElementById('audioPlayer');
const audioTitle = document.getElementById('audioTitle');
const audioSpeaker = document.getElementById('audioSpeaker');

function loadSermonAudio(card) {
    const title = card.dataset.title;
    const speaker = card.dataset.speaker;
    const date = card.dataset.date;
    const audioSource = card.dataset.audio || '';
    const source = audioSource || (card.dataset.tone ? createToneAudioDataUrl(Number(card.dataset.tone)) : '');

    audioTitle.textContent = title;
    audioSpeaker.textContent = `${speaker} · ${date}`;
    audioPlayer.src = source;
    audioPlayer.load();
}

function renderPage() {
    renderHero();
    renderQuickAccess();
    renderSermons();
    renderPrayerRequests();
    renderEvents();
    renderResources();
    renderDonation();
    renderContact();
}

async function loadPageContent() {
    pageContent = await fetchPageContent();
    if (!pageContent) {
        return;
    }
    renderPage();
}

document.addEventListener('DOMContentLoaded', loadPageContent);
