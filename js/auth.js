var Auth = {
  currentUser: null,

  init: function() {
    this.currentUser = Utils.getStorage('user', null);
    this.updateNavbar();
  },

  getUsers: function() {
    return Utils.getStorage('users', []);
  },

  saveUsers: function(users) {
    Utils.setStorage('users', users);
  },

  generateId: function() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 6);
  },

  hashPassword: function(pw) {
    var hash = 0;
    for (var i = 0; i < pw.length; i++) {
      var ch = pw.charCodeAt(i);
      hash = ((hash << 5) - hash) + ch;
      hash |= 0;
    }
    return 'h_' + Math.abs(hash).toString(36);
  },

  validateEmail: function(email) {
    if (!email || !email.trim()) return 'Email is required';
    var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(email.trim())) return 'Please enter a valid email address';
    return null;
  },

  validatePassword: function(pw) {
    if (!pw) return 'Password is required';
    if (pw.length < 6) return 'Password must be at least 6 characters';
    return null;
  },

  validateName: function(name, label) {
    label = label || 'Name';
    if (!name || !name.trim()) return label + ' is required';
    if (name.trim().length < 2) return label + ' must be at least 2 characters';
    return null;
  },

  validatePhone: function(phone) {
    if (!phone || !phone.trim()) return null;
    var cleaned = phone.replace(/[\s\-\(\)\+]/g, '');
    if (!/^\d{7,15}$/.test(cleaned)) return 'Please enter a valid phone number';
    return null;
  },

  register: function(data) {
    var errors = {};
    var nameErr = this.validateName(data.firstName, 'First name');
    if (nameErr) errors.firstName = nameErr;
    var lastNameErr = this.validateName(data.lastName, 'Last name');
    if (lastNameErr) errors.lastName = lastNameErr;
    var emailErr = this.validateEmail(data.email);
    if (emailErr) errors.email = emailErr;
    var pwErr = this.validatePassword(data.password);
    if (pwErr) errors.password = pwErr;
    var phoneErr = this.validatePhone(data.phone);
    if (phoneErr) errors.phone = phoneErr;

    if (data.password !== data.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(errors).length > 0) {
      return { success: false, errors: errors };
    }

    var users = this.getUsers();
    var emailExists = users.some(function(u) {
      return u.email.toLowerCase() === data.email.trim().toLowerCase();
    });
    if (emailExists) {
      return { success: false, errors: { email: 'An account with this email already exists' } };
    }

    var user = {
      id: this.generateId(),
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      email: data.email.trim().toLowerCase(),
      password: this.hashPassword(data.password),
      phone: (data.phone || '').trim(),
      createdAt: new Date().toISOString()
    };

    users.push(user);
    this.saveUsers(users);

    var session = { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, phone: user.phone, createdAt: user.createdAt };
    this.currentUser = session;
    Utils.setStorage('user', session);

    return { success: true, user: session };
  },

  login: function(email, password) {
    var errors = {};
    var emailErr = this.validateEmail(email);
    if (emailErr) errors.email = emailErr;
    var pwErr = this.validatePassword(password);
    if (pwErr) errors.password = pwErr;

    if (Object.keys(errors).length > 0) {
      return { success: false, errors: errors };
    }

    var users = this.getUsers();
    var hashed = this.hashPassword(password);
    var user = users.find(function(u) {
      return u.email.toLowerCase() === email.trim().toLowerCase() && u.password === hashed;
    });

    if (!user) {
      return { success: false, errors: { email: 'Invalid email or password' } };
    }

    var session = { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, phone: user.phone, createdAt: user.createdAt };
    this.currentUser = session;
    Utils.setStorage('user', session);

    return { success: true, user: session };
  },

  logout: function() {
    this.currentUser = null;
    Utils.setStorage('user', null);
    Utils.showToast('Logged out successfully', 'info');
    var page = window.location.pathname.split('/').pop();
    if (page === 'profile.html' || page === 'bookings.html' || page === 'wishlist.html') {
      window.location.href = 'index.html';
    } else {
      this.updateNavbar();
    }
  },

  isLoggedIn: function() {
    return this.currentUser !== null;
  },

  getCurrentUser: function() {
    return this.currentUser;
  },

  getInitials: function() {
    if (!this.currentUser) return '';
    return (this.currentUser.firstName.charAt(0) + this.currentUser.lastName.charAt(0)).toUpperCase();
  },

  getFullName: function() {
    if (!this.currentUser) return '';
    return this.currentUser.firstName + ' ' + this.currentUser.lastName;
  },

  guard: function() {
    if (!this.isLoggedIn()) {
      Utils.showToast('Please log in to access this page', 'info');
      window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.href);
      return false;
    }
    return true;
  },

  updateProfile: function(data) {
    var errors = {};
    var nameErr = this.validateName(data.firstName, 'First name');
    if (nameErr) errors.firstName = nameErr;
    var lastNameErr = this.validateName(data.lastName, 'Last name');
    if (lastNameErr) errors.lastName = lastNameErr;
    var phoneErr = this.validatePhone(data.phone);
    if (phoneErr) errors.phone = phoneErr;

    if (Object.keys(errors).length > 0) {
      return { success: false, errors: errors };
    }

    var users = this.getUsers();
    var user = users.find(function(u) { return u.id === Auth.currentUser.id; });
    if (!user) return { success: false, errors: { email: 'User not found' } };

    user.firstName = data.firstName.trim();
    user.lastName = data.lastName.trim();
    user.phone = (data.phone || '').trim();
    this.saveUsers(users);

    var session = { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, phone: user.phone, createdAt: user.createdAt };
    this.currentUser = session;
    Utils.setStorage('user', session);

    return { success: true, user: session };
  },

  changePassword: function(currentPw, newPw) {
    var errors = {};
    if (!currentPw) errors.currentPassword = 'Current password is required';
    var newPwErr = this.validatePassword(newPw);
    if (newPwErr) errors.newPassword = newPwErr;
    if (currentPw === newPw) errors.newPassword = 'New password must be different';

    if (Object.keys(errors).length > 0) {
      return { success: false, errors: errors };
    }

    var users = this.getUsers();
    var user = users.find(function(u) { return u.id === Auth.currentUser.id; });
    if (!user) return { success: false, errors: { currentPassword: 'User not found' } };

    if (user.password !== this.hashPassword(currentPw)) {
      return { success: false, errors: { currentPassword: 'Current password is incorrect' } };
    }

    user.password = this.hashPassword(newPw);
    this.saveUsers(users);
    return { success: true };
  },

  updateNavbar: function() {
    var actions = document.querySelector('.navbar__actions');
    if (!actions) return;

    var themeToggle = actions.querySelector('.theme-toggle');
    var hamburger = actions.querySelector('.navbar__hamburger');

    var contactBtn = document.createElement('a');
    contactBtn.href = 'contact.html';
    contactBtn.className = 'btn btn--ghost';
    contactBtn.textContent = 'Contact Us';

    var page = window.location.pathname.split('/').pop() || 'index.html';
    var onLogin = page === 'login.html';
    var onRegister = page === 'register.html';

    actions.innerHTML = '';

    if (themeToggle) actions.appendChild(themeToggle);
    actions.appendChild(contactBtn);

    if (this.isLoggedIn()) {
      var initials = this.getInitials();
      var name = this.currentUser.firstName;

      var userDiv = document.createElement('div');
      userDiv.className = 'navbar__user';
      userDiv.id = 'navUser';
      userDiv.innerHTML =
        '<button class="navbar__user-btn" id="navUserBtn">' +
          '<span class="navbar__avatar">' + initials + '</span>' +
          '<span class="navbar__username">' + Utils.escapeHTML(name) + '</span>' +
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>' +
        '</button>' +
        '<div class="navbar__dropdown" id="navDropdown">' +
          '<div class="navbar__dropdown-header">' +
            '<span class="navbar__avatar navbar__avatar--lg">' + initials + '</span>' +
            '<div>' +
              '<div class="navbar__dropdown-name">' + Utils.escapeHTML(this.getFullName()) + '</div>' +
              '<div class="navbar__dropdown-email">' + Utils.escapeHTML(this.currentUser.email) + '</div>' +
            '</div>' +
          '</div>' +
          '<div class="navbar__dropdown-divider"></div>' +
          '<a href="profile.html" class="navbar__dropdown-item">' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' +
            'My Profile' +
          '</a>' +
          '<a href="bookings.html" class="navbar__dropdown-item">' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>' +
            'My Bookings' +
          '</a>' +
          '<a href="wishlist.html" class="navbar__dropdown-item">' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>' +
            'Wishlist' +
          '</a>' +
          '<div class="navbar__dropdown-divider"></div>' +
          '<button class="navbar__dropdown-item navbar__dropdown-item--danger" id="logoutBtn">' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>' +
            'Log out' +
          '</button>' +
        '</div>';
      actions.appendChild(userDiv);
    } else {
      if (!onLogin) {
        var loginBtn = document.createElement('a');
        loginBtn.href = 'login.html';
        loginBtn.className = 'btn btn--ghost';
        loginBtn.textContent = 'Log in';
        actions.appendChild(loginBtn);
      }
      if (!onRegister) {
        var signupBtn = document.createElement('a');
        signupBtn.href = 'register.html';
        signupBtn.className = 'btn btn--primary';
        signupBtn.textContent = 'Sign up';
        actions.appendChild(signupBtn);
      }
    }

    if (hamburger) actions.appendChild(hamburger);

    this.initDropdown();
    this.initMobileNav();
  },

  initDropdown: function() {
    var btn = document.getElementById('navUserBtn');
    var dropdown = document.getElementById('navDropdown');
    var logoutBtn = document.getElementById('logoutBtn');

    if (btn && dropdown) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        dropdown.classList.toggle('open');
      });
      document.addEventListener('click', function(e) {
        if (!dropdown.contains(e.target) && e.target !== btn) {
          dropdown.classList.remove('open');
        }
      });
    }

    if (logoutBtn) {
      logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        Auth.logout();
      });
    }
  },

  initMobileNav: function() {
    var ham = document.getElementById('hamburger');
    var links = document.getElementById('navLinks');
    if (!ham || !links) return;

    var mobileHeader = links.querySelector('.navbar__links-header');
    if (mobileHeader && this.isLoggedIn()) {
      var existingUserSection = mobileHeader.querySelector('.mobile-user-section');
      if (!existingUserSection) {
        var userSection = document.createElement('div');
        userSection.className = 'mobile-user-section';
        userSection.style.cssText = 'display:flex;align-items:center;gap:12px;padding:12px 14px;background:var(--primary-light);border-radius:var(--radius);margin-bottom:12px;';
        userSection.innerHTML =
          '<span class="navbar__avatar">' + this.getInitials() + '</span>' +
          '<div><div style="font-weight:700;font-size:14px;color:var(--text);">' + Utils.escapeHTML(this.getFullName()) + '</div>' +
          '<div style="font-size:12px;color:var(--text-muted);">' + Utils.escapeHTML(this.currentUser.email) + '</div></div>';
        var closeBtn = mobileHeader.querySelector('.navbar__close');
        if (closeBtn) {
          closeBtn.parentNode.insertBefore(userSection, closeBtn);
        }
      }
    }

    var existingAuthLinks = links.querySelector('.mobile-auth-links');
    if (existingAuthLinks) existingAuthLinks.remove();

    if (!this.isLoggedIn()) {
      var authDiv = document.createElement('div');
      authDiv.className = 'mobile-auth-links';
      authDiv.innerHTML =
        '<a href="login.html" class="btn btn--outline" style="flex:1;justify-content:center;">Log in</a>' +
        '<a href="register.html" class="btn btn--primary" style="flex:1;justify-content:center;">Sign up</a>';
      links.appendChild(authDiv);
    } else {
      var existingLogout = links.querySelector('.mobile-logout');
      if (!existingLogout) {
        var logoutDiv = document.createElement('div');
        logoutDiv.className = 'mobile-logout';
        logoutDiv.innerHTML = '<button class="btn btn--outline" style="width:100%;justify-content:center;" id="mobileLogoutBtn">Log out</button>';
        links.appendChild(logoutDiv);
        var mobLogout = document.getElementById('mobileLogoutBtn');
        if (mobLogout) {
          mobLogout.addEventListener('click', function() { Auth.logout(); });
        }
      }
    }
  }
};
