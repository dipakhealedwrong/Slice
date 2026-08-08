

window.SliceAuth = (function () {
  const USERS_KEY = 'slice_users';
  const SESSION_KEY = 'slice_session_email';

  function hash(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
    }
    return h.toString(36);
  }

  function getUsers() {
    try { return JSON.parse(localStorage.getItem(USERS_KEY)) || {}; }
    catch (e) { return {}; }
  }

  function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  function normalizeEmail(email) {
    return String(email || '').trim().toLowerCase();
  }

  function seedTransactions() {
    const merchants = [
      { name: 'Blue Tokai Coffee', cat: '🍔 Food & Dining', amt: -420 },
      { name: 'Interest Credit', cat: '💰 Daily Interest', amt: 58.4 },
      { name: 'BigBasket', cat: '🛒 Groceries', amt: -1284 },
      { name: 'UPI to Rohit Sharma', cat: '💳 Transfers', amt: -2000 },
      { name: 'Amazon.in', cat: '🎬 Shopping', amt: -1899 },
      { name: 'Salary Credit', cat: '💵 Income', amt: 45000 },
      { name: 'IndiGo Airlines', cat: '✈️ Travel', amt: -6540 }
    ];
    return merchants.map((m, i) => ({
      id: 'txn_' + i,
      name: m.name,
      cat: m.cat,
      amt: m.amt,
      daysAgo: i
    }));
  }

  function signUp({ name, email, phone, password }) {
    const users = getUsers();
    const key = normalizeEmail(email);
    if (!name || !key || !phone || !password) {
      return { ok: false, error: 'Please fill in every field to continue.' };
    }
    if (users[key]) {
      return { ok: false, error: 'An account with this email already exists — log in instead.' };
    }
    users[key] = {
      name: name.trim(),
      email: key,
      phone: phone.trim(),
      passwordHash: hash(password),
      balance: 248920 + Math.floor(Math.random() * 60000),
      createdAt: Date.now(),
      transactions: seedTransactions()
    };
    saveUsers(users);
    setSession(key);
    return { ok: true, user: users[key] };
  }

  function logIn({ email, password }) {
    const users = getUsers();
    const key = normalizeEmail(email);
    const user = users[key];
    if (!user || user.passwordHash !== hash(password)) {
      return { ok: false, error: 'That email and password combination doesn\u2019t match our records.' };
    }
    setSession(key);
    return { ok: true, user };
  }

  function setSession(email) {
    localStorage.setItem(SESSION_KEY, email);
  }

  function getSession() {
    const email = localStorage.getItem(SESSION_KEY);
    if (!email) return null;
    const users = getUsers();
    return users[email] || null;
  }

  function updateCurrentUser(patch) {
    const email = localStorage.getItem(SESSION_KEY);
    if (!email) return null;
    const users = getUsers();
    if (!users[email]) return null;
    users[email] = Object.assign({}, users[email], patch);
    saveUsers(users);
    return users[email];
  }

  function logOut() {
    localStorage.removeItem(SESSION_KEY);
  }

  return { signUp, logIn, logOut, getSession, updateCurrentUser };
})();
