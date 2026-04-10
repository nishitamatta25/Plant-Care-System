const fs = require('fs');

const file = 'd:/Plant-Care-System/frontend/src/App.jsx';
let content = fs.readFileSync(file, 'utf8');

const target = `    {/*  Authentication Section  */}
    <section className="auth-section" id="auth">
        <div className="container">
            <h2 className="section-title">Account Access</h2>
            <p className="section-subtitle">Login or create an account to save your favorite plants</p>

            <div className="auth-container">
                <div className="auth-tabs">
                    <button className="auth-tab active" data-tab="loginForm">Login</button>
                    <button className="auth-tab" data-tab="registerForm">Register</button>
                </div>

                <div id="authMessage" className="auth-message" style={{ display: "none" }}></div>

                <form id="loginForm" className="auth-form active">
                    <div className="form-group">
                        <label htmlFor="loginUsername">Username</label>
                        <input type="text" id="loginUsername" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="loginPassword">Password</label>
                        <input type="password" id="loginPassword" required />
                    </div>
                    <button type="submit" className="btn primary-btn">Login</button>
                </form>

                <form id="registerForm" className="auth-form">
                    <div className="form-group">
                        <label htmlFor="registerUsername">Username</label>
                        <input type="text" id="registerUsername" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="registerEmail">Email</label>
                        <input type="email" id="registerEmail" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="registerPassword">Password</label>
                        <input type="password" id="registerPassword" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input type="password" id="confirmPassword" required />
                    </div>
                    <button type="submit" className="btn primary-btn">Register</button>
                </form>
            </div>
        </div>
    </section>

    {/*  User Profile Section  */}
    <section className="profile-section hidden" id="profile">
        <div className="container">
            <h2 className="section-title">My Profile</h2>

            <div className="profile-container">
                <div className="profile-info" id="userProfileInfo">
                    {/*  User info will be loaded dynamically  */}
                </div>

                <div className="user-favorites" id="userFavorites">
                    {/*  Favorites will be loaded dynamically  */}
                </div>

                <div className="profile-actions">
                    <button id="logoutBtn" className="btn outline-btn">
                        <i className="fas fa-sign-out-alt"></i> Logout
                    </button>
                </div>
            </div>
        </div>
    </section>`;

const replacement = `    {/*  Authentication Section  */}
    {!user && (
      <section className="auth-section" id="auth">
          <div className="container">
              <h2 className="section-title">Account Access</h2>
              <p className="section-subtitle">Login or create an account to save your favorite plants</p>

              <div className="auth-container">
                  <div className="auth-tabs">
                      <button type="button" className={\`auth-tab \${authMode === 'login' ? 'active' : ''}\`} onClick={() => setAuthMode('login')}>Login</button>
                      <button type="button" className={\`auth-tab \${authMode === 'register' ? 'active' : ''}\`} onClick={() => setAuthMode('register')}>Register</button>
                  </div>

                  {authMessage.text && (
                    <div className={\`auth-message \${authMessage.type}\`} style={{ display: "block" }}>{authMessage.text}</div>
                  )}

                  <form className={\`auth-form \${authMode === 'login' ? 'active' : ''}\`} onSubmit={handleLogin}>
                      <div className="form-group">
                          <label htmlFor="loginUsername">Email</label>
                          <input type="email" id="loginUsername" required />
                      </div>
                      <div className="form-group">
                          <label htmlFor="loginPassword">Password</label>
                          <input type="password" id="loginPassword" required />
                      </div>
                      <button type="submit" className="btn primary-btn">Login</button>
                  </form>

                  <form className={\`auth-form \${authMode === 'register' ? 'active' : ''}\`} onSubmit={handleRegister}>
                      <div className="form-group">
                          <label htmlFor="registerUsername">Username</label>
                          <input type="text" id="registerUsername" required />
                      </div>
                      <div className="form-group">
                          <label htmlFor="registerEmail">Email</label>
                          <input type="email" id="registerEmail" required />
                      </div>
                      <div className="form-group">
                          <label htmlFor="registerPassword">Password</label>
                          <input type="password" id="registerPassword" required />
                      </div>
                      <div className="form-group">
                          <label htmlFor="confirmPassword">Confirm Password</label>
                          <input type="password" id="confirmPassword" required />
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
    )}`;

// Normalize newlines in both content and target because Windows/Linux might mix \r\n and \n
const normalize = str => str.replace(/\r\n/g, '\n');
content = normalize(content);
const normalizedTarget = normalize(target);

if (content.includes(normalizedTarget)) {
    content = content.replace(normalizedTarget, replacement);
    fs.writeFileSync(file, content);
    console.log("Successfully replaced Auth Section!");
} else {
    console.error("Could not find the target string! Check the file visually.");
}
