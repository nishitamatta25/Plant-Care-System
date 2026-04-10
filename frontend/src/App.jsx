import { useEffect, useState } from 'react';

function App() {
  const [authMode, setAuthMode] = useState('login');
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch(e) { return null; }
  });
  const [authMessage, setAuthMessage] = useState({ text: '', type: '' });
  const [favoritePlants, setFavoritePlants] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
        fetch('http://localhost:5000/api/users/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        }).then(r => {
            if(r.ok) return r.json();
            throw new Error('Not auth');
        }).then(data => {
            setUser({ name: data.name, email: data.email });
            setFavoritePlants(data.favoritePlants || []);
        }).catch(() => handleLogout());
    }
  }, []);

  const handleLogout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setFavoritePlants([]);
      window.location.hash = '#home';
  };

  const handleNavClick = (e) => {
      e.preventDefault();
      const targetId = e.currentTarget.getAttribute('href');
      
      // Handle mobile menu close if open
      const nav = document.querySelector('.main-nav');
      if (nav && nav.classList.contains('active')) {
          nav.classList.remove('active');
      }
      
      if (targetId && targetId !== '#') {
          const targetElement = document.querySelector(targetId);
          if (targetElement) {
              window.scrollTo({
                  top: targetElement.offsetTop - 80,
                  behavior: 'smooth'
              });
          }
      }
  };

  const showMessage = (text, type = 'info') => {
      setAuthMessage({ text, type });
      setTimeout(() => setAuthMessage({ text: '', type: '' }), 5000);
  };

  const handleLogin = async (e) => {
      e.preventDefault();
      const email = e.target.loginUsername.value;
      const password = e.target.loginPassword.value;
      try {
          const res = await fetch('http://localhost:5000/api/users/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password })
          });
          const data = await res.json();
          if (res.ok) {
              localStorage.setItem('token', data.token);
              localStorage.setItem('user', JSON.stringify({ name: email, email }));
              setUser({ name: email, email });
              showMessage('Login successful!', 'success');
              window.location.hash = '#profile';
          } else {
              showMessage(data.msg || 'Login failed', 'error');
          }
      } catch (err) {
          showMessage('Error logging in', 'error');
      }
  };

  const handleRegister = async (e) => {
      e.preventDefault();
      const username = e.target.registerUsername.value;
      const email = e.target.registerEmail.value;
      const confirm = e.target.confirmPassword.value;
      const password = e.target.registerPassword.value;

      if(password !== confirm) return showMessage('Passwords mismatch', 'error');

      try {
          const res = await fetch('http://localhost:5000/api/users/register', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name: username, email, password })
          });
          const data = await res.json();
          if (res.ok) {
              localStorage.setItem('token', data.token);
              localStorage.setItem('user', JSON.stringify({ name: username, email }));
              setUser({ name: username, email });
              showMessage('Registration successful!', 'success');
              window.location.hash = '#profile';
          } else {
              showMessage(data.msg || 'Registration failed', 'error');
          }
      } catch (err) {
          showMessage('Error registering', 'error');
      }
  };

  useEffect(() => {
    // Dynamically load legacy scripts to preserve 100% functionality
    const loadScript = (src) => {
      return new Promise((resolve) => {
        // Only load if not already present
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve();
          return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.async = false;
        script.onload = resolve;
        document.body.appendChild(script);
      });
    };
    
    // Check if the script exists to avoid double attaching on HMR
    if (!window.legacyScriptsLoaded) {
      const loadDeps = async () => {
        await loadScript('https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js');
        await loadScript('/script.js');
        // Do not load auth.js since we migrated auth to react state
        window.legacyScriptsLoaded = true;
      };
      loadDeps();
    }
  }, []);

  return (
    <>
      
    <header className="main-header">
        <div className="container">
            <div className="logo">
                <i className="fas fa-leaf"></i>
                <span>MediGrow</span>
            </div>
            <nav className="main-nav">
                <ul>
                    <li><a href="#home" className="active" onClick={handleNavClick}>Home</a></li>
                    <li><a href="#plants" onClick={handleNavClick}>Plant Library</a></li>
                    <li><a href="#scanner" onClick={handleNavClick}>Plant Scanner</a></li>
                    <li><a href="#weather" onClick={handleNavClick}>Weather Guide</a></li>
                    <li><a href="#forum" onClick={handleNavClick}>Community</a></li>
                    <li><a href="#about" onClick={handleNavClick}>About</a></li>
                    {user ? (
                        <li><a href="#profile" onClick={handleNavClick}>My Profile</a></li>
                    ) : (
                        <li><a href="#auth" onClick={handleNavClick}>Login/Register</a></li>
                    )}
                </ul>
            </nav>
            <button className="mobile-menu-btn">
                <i className="fas fa-bars"></i>
            </button>
        </div>
    </header>

    <main>
        {/*  Hero Section  */}
        <section className="hero" id="home">
            <div className="container">
                <div className="hero-content">
                    <h1>Grow Your Own Medicinal Garden</h1>
                    <p>Discover how to cultivate healing plants at home with our comprehensive guides and smart tools
                    </p>
                    <div className="hero-buttons">
                        <a href="#scanner" className="btn primary-btn">Identify Plants</a>
                        <a href="#plants" className="btn outline-btn">Explore Plants</a>
                    </div>
                </div>
                <div className="hero-image">
                    <img src="https://images.unsplash.com/photo-1585320806297-9794b3e4eeae" alt="Medicinal plants" />
                </div>
            </div>
        </section>

        {/*  Features Section  */}
        <section className="features">
            <div className="container">
                <h2 className="section-title">Why Grow Medicinal Plants?</h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <i className="fas fa-heartbeat"></i>
                        <h3>Natural Remedies</h3>
                        <p>Access to safe, natural treatments for common ailments right from your garden</p>
                    </div>
                    <div className="feature-card">
                        <i className="fas fa-seedling"></i>
                        <h3>Sustainable Living</h3>
                        <p>Reduce your reliance on commercial medicines and lower your carbon footprint</p>
                    </div>
                    <div className="feature-card">
                        <i className="fas fa-dollar-sign"></i>
                        <h3>Cost Effective</h3>
                        <p>Save money by growing your own medicinal herbs instead of buying them</p>
                    </div>
                    <div className="feature-card">
                        <i className="fas fa-brain"></i>
                        <h3>Therapeutic Benefits</h3>
                        <p>Gardening itself has proven mental health benefits and reduces stress</p>
                    </div>
                </div>
            </div>
        </section>

        {/*  Plant Scanner Section  */}
        <section className="scanner-section" id="scanner">
            <div className="container">
                <h2 className="section-title">Plant Identification Scanner</h2>
                <p className="section-subtitle">Identify medicinal plants and get care instructions instantly</p>

                <div className="scanner-container">
                    <div className="scanner-box">
                        <div className="scanner-view" id="scannerView">
                            <video id="scannerVideo" autoPlay playsInline></video>
                            <canvas id="scannerCanvas" style={{ display: "none" }}></canvas>
                            <div className="scanner-overlay">
                                <div className="scan-box">
                                    <div className="scan-line"></div>
                                </div>
                                <p>Align plant within the frame</p>
                            </div>
                        </div>
                        <div className="scanner-controls">
                            <button id="startScanner" className="btn primary-btn">
                                <i className="fas fa-camera"></i> Start Scanner
                            </button>
                            <button id="captureImage" className="btn secondary-btn" disabled>
                                <i className="fas fa-camera-retro"></i> Capture
                            </button>
                            <input type="file" id="uploadImage" accept="image/*" style={{ display: "none" }} />
                            <button id="uploadBtn" className="btn outline-btn">
                                <i className="fas fa-upload"></i> Upload Image
                            </button>
                        </div>
                    </div>

                    <div className="results-box" id="resultsBox">
                        <div className="scan-status"></div>
                        <div className="loading-spinner" id="loadingSpinner"></div>
                        <div className="placeholder-content">
                            <i className="fas fa-leaf"></i>
                            <h3>Plant Identification Results</h3>
                            <p>Scan or upload an image to see plant details</p>
                        </div>
                        <div className="plant-results" id="plantResults" style={{ display: "none" }}></div>
                    </div>
                </div>
            </div>
        </section>

        {/*  Plant Library Section  */}
        <section className="plant-library" id="plants">
            <div className="container">
                <h2 className="section-title">Medicinal Plant Library</h2>
                <p className="section-subtitle">Explore plants you can grow at home for health benefits</p>

                <div className="plant-filter">
                    <input type="text" id="plantSearch" placeholder="Search plants..." />
                    <select id="benefitFilter">
                        <option value="">Filter by health benefit</option>
                        <option value="digestive">Digestive Health</option>
                        <option value="respiratory">Respiratory Health</option>
                        <option value="immune">Immune Boosting</option>
                        <option value="pain">Pain Relief</option>
                        <option value="stress">Stress Relief</option>
                        <option value="skin">Skin Health</option>
                    </select>
                    <select id="difficultyFilter">
                        <option value="">Filter by difficulty</option>
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                    </select>
                </div>

                <div className="plants-grid" id="plantsGrid">
                    {/*  Plants will be loaded dynamically from JavaScript  */}
                </div>

                <div className="view-all">
                    <button id="loadMorePlants" className="btn outline-btn">Load More Plants</button>
                </div>
            </div>
        </section>

        {/*  Weather Guide Section  */}
        <section className="weather-guide" id="weather">
            <div className="container">
                <h2 className="section-title">Weather-Based Growing Guide</h2>
                <p className="section-subtitle">Get personalized advice based on your local weather conditions</p>

                <div className="weather-container">
                    <div className="weather-card">
                        <div className="weather-header">
                            <h3>Your Local Growing Conditions</h3>
                            <button id="getLocation" className="btn primary-btn small-btn">
                                <i className="fas fa-location-arrow"></i> Use My Location
                            </button>
                        </div>
                        <div className="weather-display">
                            <div className="weather-info" id="weatherInfo">
                                <div className="weather-icon">
                                    <i className="wi wi-day-sunny"></i>
                                </div>
                                <div className="weather-details">
                                    <p>Allow location access to view personalized growing advice</p>
                                    <p>Based on your current weather conditions</p>
                                </div>
                            </div>
                            <div className="weather-plants" id="weatherPlants">
                                <h4>Recommended Plants for Current Conditions:</h4>
                                <div className="weather-plants-list"></div>
                            </div>
                        </div>
                    </div>

                    <div className="weather-tips">
                        <h3>Seasonal Growing Tips</h3>
                        <div className="tips-container" id="seasonalTips">
                            {/*  Tips will be loaded based on season  */}
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/*  Kitchen Gardening Section  */}
        <section className="kitchen-gardening">
            <div className="container">
                <h2 className="section-title">Kitchen Gardening Guides</h2>
                <p className="section-subtitle">Step-by-step instructions for creating your medicinal herb garden</p>

                <div className="guides-tabs">
                    <div className="tab-buttons">
                        <button className="tab-btn active" data-tab="beginner">Beginner's Guide</button>
                        <button className="tab-btn" data-tab="containers">Container Gardening</button>
                        <button className="tab-btn" data-tab="indoor">Indoor Herb Garden</button>
                        <button className="tab-btn" data-tab="harvesting">Harvesting & Storage</button>
                    </div>

                    <div className="tab-content active" id="beginner">
                        <h3>Starting Your Medicinal Herb Garden</h3>
                        <div className="guide-steps">
                            <div className="guide-step">
                                <div className="step-number">1</div>
                                <div className="step-content">
                                    <h4>Choose Your Location</h4>
                                    <p>Most medicinal herbs need at least 6 hours of sunlight per day. Select a spot
                                        with good drainage and access to water.</p>
                                    <img
                                        src="https://i.postimg.cc/MH4Sqxp0/Whats-App-Image-2025-04-21-at-10-21-11-086cd771-a.jpg" />
                                </div>
                            </div>
                            <div className="guide-step">
                                <div className="step-number">2</div>
                                <div className="step-content">
                                    <h4>Start with Easy Plants</h4>
                                    <p>Begin with hardy, easy-to-grow herbs like peppermint, chamomile, and lemon balm
                                        that are forgiving for beginners.</p>
                                    <img src="https://i.postimg.cc/Wz9M4WBw/easy.jpg" />
                                </div>
                            </div>
                            <div className="guide-step">
                                <div className="step-number">3</div>
                                <div className="step-content">
                                    <h4>Prepare Your Soil</h4>
                                    <p>Medicinal herbs thrive in well-draining soil. Mix garden soil with compost and
                                        sand if needed for better drainage.</p>
                                    <img src="https://i.postimg.cc/WbCkfkTz/sp.jpg" alt="Soil preparation" />
                                </div>
                            </div>
                            <div className="guide-step">
                                <div className="step-number">4</div>
                                <div className="step-content">
                                    <h4>Planting & Spacing</h4>
                                    <p>Follow spacing guidelines for each plant. Some herbs spread aggressively and need
                                        containment.</p>
                                    <img src="https://i.postimg.cc/BnZnpZ1b/Whats-App-Image-2025-04-21-plant-spacing.jpg"
                                        alt="Plant spacing" />
                                </div>
                            </div>
                            <div className="guide-step">
                                <div className="step-number">5</div>
                                <div className="step-content">
                                    <h4>Regular Care</h4>
                                    <p>Water when soil feels dry, prune regularly to encourage growth, and watch for
                                        pests.</p>
                                    <img src="https://i.postimg.cc/xCNCmsNP/Whats-App-Image-soil-prep.jpg"
                                        alt="Garden care" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="tab-content" id="containers">
                        {/*  Container gardening content  */}
                    </div>

                    <div className="tab-content" id="indoor">
                        {/*  Indoor gardening content  */}
                    </div>

                    <div className="tab-content" id="harvesting">
                        {/*  Harvesting content  */}
                    </div>
                </div>
            </div>
        </section>

        {/*  Community Forum Section  */}
        <section className="community-forum" id="forum">
            <div className="container">
                <h2 className="section-title">Community Forum</h2>
                <p className="section-subtitle">Connect with other medicinal plant enthusiasts</p>

                <div className="forum-container">
                    <div className="forum-topics">
                        <h3>Popular Discussion Topics</h3>
                        <div className="topics-list">
                            <div className="topic-card">
                                <div className="topic-header">
                                    <h4>Natural Cold Remedies</h4>
                                    <span className="topic-stats">24 posts</span>
                                </div>
                                <p className="topic-desc">Share your favorite herbal remedies for cold and flu season</p>
                                <div className="topic-meta">
                                    <span className="topic-author"><i className="fas fa-user"></i> herbal_guru</span>
                                    <span className="topic-date"><i className="far fa-clock"></i> 2 days ago</span>
                                </div>
                            </div>
                            <div className="topic-card">
                                <div className="topic-header">
                                    <h4>Pest Control Solutions</h4>
                                    <span className="topic-stats">18 posts</span>
                                </div>
                                <p className="topic-desc">Natural ways to protect your medicinal plants from pests</p>
                                <div className="topic-meta">
                                    <span className="topic-author"><i className="fas fa-user"></i> organic_gardener</span>
                                    <span className="topic-date"><i className="far fa-clock"></i> 5 days ago</span>
                                </div>
                            </div>
                            <div className="topic-card">
                                <div className="topic-header">
                                    <h4>Drying & Storing Herbs</h4>
                                    <span className="topic-stats">32 posts</span>
                                </div>
                                <p className="topic-desc">Best methods for preserving your medicinal herbs</p>
                                <div className="topic-meta">
                                    <span className="topic-author"><i className="fas fa-user"></i> herb_preserver</span>
                                    <span className="topic-date"><i className="far fa-clock"></i> 1 week ago</span>
                                </div>
                            </div>
                        </div>
                        <a href="#" className="btn outline-btn">View All Topics</a>
                    </div>

                    <div className="forum-join">
                        <h3>Join the Conversation</h3>
                        <p>Connect with a community of home gardeners growing medicinal plants</p>
                        <form className="forum-signup">
                            <input type="text" placeholder="Your Name" />
                            <input type="email" placeholder="Email Address" />
                            <button type="submit" className="btn primary-btn">Create Account</button>
                        </form>
                        <div className="forum-benefits">
                            <div className="benefit-item">
                                <i className="fas fa-check-circle"></i>
                                <span>Ask questions and get expert advice</span>
                            </div>
                            <div className="benefit-item">
                                <i className="fas fa-check-circle"></i>
                                <span>Share your growing experiences</span>
                            </div>
                            <div className="benefit-item">
                                <i className="fas fa-check-circle"></i>
                                <span>Learn from other gardeners</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/*  Newsletter Section  */}
        <section className="newsletter">
            <div className="container">
                <div className="newsletter-content">
                    <h2>Get Monthly Growing Tips</h2>
                    <p>Subscribe to our newsletter for seasonal advice, new plant profiles, and exclusive content</p>
                </div>
                <form className="newsletter-form">
                    <input type="email" placeholder="Your email address" />
                    <button type="submit" className="btn primary-btn">Subscribe</button>
                </form>
            </div>
        </section>
    </main>

    <footer className="main-footer">
        <div className="container">
            <div className="footer-grid">
                <div className="footer-about">
                    <div className="logo">
                        <i className="fas fa-leaf"></i>
                        <span>MediGrow</span>
                    </div>
                    <p>Empowering you to grow your own natural remedies and live a healthier life through home
                        gardening.</p>
                    <div className="social-links">
                        <a href="#"><i className="fab fa-facebook-f"></i></a>
                        <a href="#"><i className="fab fa-instagram"></i></a>
                        <a href="#"><i className="fab fa-pinterest-p"></i></a>
                        <a href="#"><i className="fab fa-youtube"></i></a>
                    </div>
                </div>
                <div className="footer-links">
                    <h3>Quick Links</h3>
                    <ul>
                        <li><a href="#home">Home</a></li>
                        <li><a href="#plants">Plant Library</a></li>
                        <li><a href="#scanner">Plant Scanner</a></li>
                        <li><a href="#weather">Weather Guide</a></li>
                        <li><a href="#forum">Community</a></li>
                    </ul>
                </div>
                <div className="footer-contact">
                    <h3>Contact Us</h3>
                    <ul>
                        <li><i className="fas fa-envelope"></i> hello@medigrow.com</li>
                        <li><i className="fas fa-phone"></i> 1234567</li>
                        <li><i className="fas fa-map-marker-alt"></i> chitkara uiversity</li>
                    </ul>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; 2025 MediGrow. All rights reserved.</p>
                <div className="footer-legal">
                    <a href="#">Privacy Policy</a>
                    <a href="#">Terms of Service</a>
                    <a href="#">Disclaimer</a>
                </div>
            </div>
        </div>
    </footer>

    {/*  Plant Details Modal  */}
    <div className="modal" id="plantModal" style={{ display: "none" }}>
        <div className="modal-content">
            <button className="modal-close">&times;</button>
            <div className="modal-body" id="modalPlantContent">
                {/*  Plant details will be loaded here  */}
            </div>
        </div>
    </div>

    {/*  Authentication Section  */}
    {!user && (
      <section className="auth-section" id="auth">
          <div className="container">
              <h2 className="section-title">Account Access</h2>
              <p className="section-subtitle">Login or create an account to save your favorite plants</p>

              <div className="auth-container">
                  <div className="auth-tabs">
                      <button type="button" className={`auth-tab ${authMode === 'login' ? 'active' : ''}`} onClick={() => setAuthMode('login')}>Login</button>
                      <button type="button" className={`auth-tab ${authMode === 'register' ? 'active' : ''}`} onClick={() => setAuthMode('register')}>Register</button>
                  </div>

                  {authMessage.text && (
                    <div className={`auth-message ${authMessage.type}`} style={{ display: "block" }}>{authMessage.text}</div>
                  )}

                  <form className={`auth-form ${authMode === 'login' ? 'active' : ''}`} onSubmit={handleLogin}>
                      <div className="form-group">
                          <label htmlFor="loginUsername">Email</label>
                          <input type="email" id="loginUsername" name="loginUsername" required />
                      </div>
                      <div className="form-group">
                          <label htmlFor="loginPassword">Password</label>
                          <input type="password" id="loginPassword" name="loginPassword" required />
                      </div>
                      <button type="submit" className="btn primary-btn">Login</button>
                  </form>

                  <form className={`auth-form ${authMode === 'register' ? 'active' : ''}`} onSubmit={handleRegister}>
                      <div className="form-group">
                          <label htmlFor="registerUsername">Username</label>
                          <input type="text" id="registerUsername" name="registerUsername" required />
                      </div>
                      <div className="form-group">
                          <label htmlFor="registerEmail">Email</label>
                          <input type="email" id="registerEmail" name="registerEmail" required />
                      </div>
                      <div className="form-group">
                          <label htmlFor="registerPassword">Password</label>
                          <input type="password" id="registerPassword" name="registerPassword" required />
                      </div>
                      <div className="form-group">
                          <label htmlFor="confirmPassword">Confirm Password</label>
                          <input type="password" id="confirmPassword" name="confirmPassword" required />
                      </div>
                      <button type="submit" className="btn primary-btn">Register</button>
                  </form>
              </div>
          </div>
      </section>
    )}

    {/*  User Profile Section  */}
    {user && (
      <section className="profile-section" id="profile">
          <div className="container">
              <h2 className="section-title">My Profile</h2>

              <div className="profile-container">
                  <div className="profile-info">
                      <h3>{user.name}</h3>
                      <p>{user.email}</p>
                  </div>

                  <div className="user-favorites">
                      {favoritePlants.length > 0 ? (
                          <>
                              <h3>My Favorite Plants</h3>
                              <div className="favorites-grid">
                                  {favoritePlants.map((plant, idx) => (
                                      <div className="plant-card" key={idx}>
                                          <img src={plant.image} alt={plant.name} />
                                          <h3>{plant.name}</h3>
                                          <p className="scientific-name">{plant.scientificName}</p>
                                      </div>
                                  ))}
                              </div>
                          </>
                      ) : (
                          <p>You haven't added any favorite plants yet.</p>
                      )}
                  </div>

                  <div className="profile-actions">
                      <button className="btn outline-btn" onClick={handleLogout}>
                          <i className="fas fa-sign-out-alt"></i> Logout
                      </button>
                  </div>
              </div>
          </div>
      </section>
    )}

    
    </>
  );
}

export default App;