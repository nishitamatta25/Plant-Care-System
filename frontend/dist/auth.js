// Authentication related functionality

// DOM Elements
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const logoutBtn = document.getElementById('logoutBtn');
const authSection = document.getElementById('auth');
const profileSection = document.getElementById('profile');
const userProfileInfo = document.getElementById('userProfileInfo');
const userFavorites = document.getElementById('userFavorites');
const authMessage = document.getElementById('authMessage');
const authTabs = document.querySelectorAll('.auth-tab');
const authForms = document.querySelectorAll('.auth-form');

// Check if user is logged in
function isLoggedIn() {
    return localStorage.getItem('token') !== null;
}

// Update UI based on authentication status
function updateAuthUI() {
    if (isLoggedIn()) {
        // User is logged in
        if (authSection) authSection.classList.add('hidden');
        if (profileSection) profileSection.classList.remove('hidden');
        if (logoutBtn) logoutBtn.classList.remove('hidden');

        // Add "My Profile" link to navigation if it doesn't exist
        const navList = document.querySelector('.main-nav ul');
        if (navList && !document.querySelector('a[href="#profile"]')) {
            const profileLi = document.createElement('li');
            const profileLink = document.createElement('a');
            profileLink.href = '#profile';
            profileLink.textContent = 'My Profile';
            profileLi.appendChild(profileLink);
            navList.appendChild(profileLi);
        }

        // Load user profile
        loadUserProfile();
    } else {
        // User is not logged in
        if (authSection) authSection.classList.remove('hidden');
        if (profileSection) profileSection.classList.add('hidden');
        if (logoutBtn) logoutBtn.classList.add('hidden');

        // Remove "My Profile" link from navigation
        const profileLink = document.querySelector('a[href="#profile"]');
        if (profileLink) {
            profileLink.parentElement.remove();
        }
    }
}

// Load user profile data
async function loadUserProfile() {
    try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('http://localhost:5000/api/users/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load profile');
        }

        const data = await response.json();

        // Display user info
        if (userProfileInfo) {
            userProfileInfo.innerHTML = `
          <h3>${data.name}</h3>
          <p>${data.email}</p>
        `;
        }

        // Display user favorites
        if (userFavorites && data.favoritePlants && data.favoritePlants.length > 0) {
            loadUserFavorites(data.favoritePlants);
        } else if (userFavorites) {
            userFavorites.innerHTML = '<p>You haven\'t added any favorite plants yet.</p>';
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        // If there's an error, user might be logged out or token expired
        if (error.message.includes('401')) {
            logout();
        }
    }
}

// Load user favorite plants
async function loadUserFavorites(favoriteIds) {
    try {
        const response = await fetch('http://localhost:5000/api/plants');

        if (!response.ok) {
            throw new Error(`Failed to fetch plants: ${response.status}`);
        }

        const plants = await response.json();
        const favoritePlants = plants.filter(plant => favoriteIds.includes(plant.id));

        if (userFavorites) {
            if (favoritePlants.length > 0) {
                userFavorites.innerHTML = '<h3>My Favorite Plants</h3><div class="favorites-grid"></div>';
                const favoritesGrid = userFavorites.querySelector('.favorites-grid');

                favoritePlants.forEach(plant => {
                    const plantCard = document.createElement('div');
                    plantCard.className = 'plant-card';
                    plantCard.innerHTML = `
            <img src="${plant.image}" alt="${plant.name}">
            <h3>${plant.name}</h3>
            <p class="scientific-name">${plant.scientificName}</p>
            <button class="btn outline-btn remove-favorite" data-id="${plant.id}">
              <i class="fas fa-heart-broken"></i> Remove
            </button>
          `;
                    favoritesGrid.appendChild(plantCard);
                });

                // Add event listeners to remove favorite buttons
                document.querySelectorAll('.remove-favorite').forEach(btn => {
                    btn.addEventListener('click', removeFavorite);
                });
            } else {
                userFavorites.innerHTML = '<p>You haven\'t added any favorite plants yet.</p>';
            }
        }
    } catch (error) {
        console.error('Error loading favorites:', error);
        if (userFavorites) {
            userFavorites.innerHTML = '<p>Error loading favorite plants. Please try again later.</p>';
        }
    }
}

// Register new user
async function register(event) {
    event.preventDefault();

    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Basic validation
    if (!username || !email || !password) {
        showAuthMessage('Please fill in all fields', 'error');
        return;
    }

    if (password !== confirmPassword) {
        showAuthMessage('Passwords do not match', 'error');
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/api/users/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: username,
                email,
                password
            })
        });

        const data = await response.json();

        if (response.ok) {
            // Store token and user info
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify({ name: username, email }));

            showAuthMessage('Registration successful! Redirecting to your profile...', 'success');

            // Update UI
            setTimeout(() => {
                updateAuthUI();
                window.location.hash = '#profile';
            }, 1500);
        } else {
            showAuthMessage(data.msg || 'Registration failed', 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showAuthMessage('An error occurred. Please try again later.', 'error');
    }
}

// Login user
async function login(event) {
    event.preventDefault();

    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    // Basic validation
    if (!username || !password) {
        showAuthMessage('Please enter both username and password', 'error');
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: username, // Uses the username field for email to match backend
                password
            })
        });

        const data = await response.json();

        if (response.ok) {
            // Store token and user info
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify({ email: username }));

            showAuthMessage('Login successful! Redirecting to your profile...', 'success');

            // Update UI
            setTimeout(() => {
                updateAuthUI();
                window.location.hash = '#profile';
            }, 1500);
        } else {
            showAuthMessage(data.msg || 'Login failed', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showAuthMessage('An error occurred. Please try again later.', 'error');
    }
}

// Logout user
async function logout() {
    try {
        const token = localStorage.getItem('token');
        if (token) {
            await fetch('http://localhost:5000/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        }
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        // Clear local storage regardless of server response
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Update UI
        updateAuthUI();
        window.location.hash = '#home';
    }
}

// Add plant to favorites
async function addToFavorites(plantId) {
    if (!isLoggedIn()) {
        showModal('Please log in to add plants to your favorites');
        window.location.hash = '#auth';
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/user/favorites', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                plantId
            })
        });

        const data = await response.json();

        if (data.success) {
            showModal('Plant added to favorites!');
        } else {
            showModal(data.message || 'Failed to add to favorites');
        }
    } catch (error) {
        console.error('Error adding to favorites:', error);
        showModal('An error occurred. Please try again later.');
    }
}

// Remove plant from favorites
async function removeFavorite(event) {
    const plantId = event.currentTarget.dataset.id;

    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/user/favorites', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                plantId
            })
        });

        const data = await response.json();

        if (data.success) {
            // Reload favorites
            loadUserProfile();
        } else {
            showModal(data.message || 'Failed to remove from favorites');
        }
    } catch (error) {
        console.error('Error removing from favorites:', error);
        showModal('An error occurred. Please try again later.');
    }
}

// Show authentication message
function showAuthMessage(message, type = 'info') {
    if (authMessage) {
        authMessage.textContent = message;
        authMessage.className = `auth-message ${type}`;
        authMessage.style.display = 'block';

        // Hide message after 5 seconds
        setTimeout(() => {
            authMessage.style.display = 'none';
        }, 5000);
    }
}

// Show modal message
function showModal(message) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
    <div class="modal-content">
      <span class="modal-close">&times;</span>
      <p>${message}</p>
    </div>
  `;

    document.body.appendChild(modal);

    // Close modal when clicking on X
    modal.querySelector('.modal-close').addEventListener('click', () => {
        modal.remove();
    });

    // Close modal when clicking outside
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.remove();
        }
    });

    // Auto-close after 3 seconds
    setTimeout(() => {
        if (document.body.contains(modal)) {
            modal.remove();
        }
    }, 3000);
}

// Switch between login and register forms
function switchAuthForm(event) {
    const tabId = event.target.dataset.tab;

    // Update active tab
    authTabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabId);
    });

    // Show selected form
    authForms.forEach(form => {
        form.classList.toggle('active', form.id === tabId);
    });
}

// Initialize auth UI
updateAuthUI();

// Register form submission
if (registerForm) {
    registerForm.addEventListener('submit', register);
}

// Login form submission
if (loginForm) {
    loginForm.addEventListener('submit', login);
}

// Logout button
if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
}

// Auth tabs
authTabs.forEach(tab => {
    tab.addEventListener('click', switchAuthForm);
});

// Add favorite buttons in plant details
document.querySelectorAll('.add-favorite').forEach(btn => {
    btn.addEventListener('click', (event) => {
        const plantId = event.currentTarget.dataset.id;
        addToFavorites(plantId);
    });
});