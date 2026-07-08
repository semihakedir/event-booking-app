const API_URL = 'http://localhost:5000/api';
const token = localStorage.getItem('token');

// Helper: fetch with auth header included automatically
function authFetch(url, options = {}) {
  options.headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers
  };
  return fetch(url, options).then(res => res.json().then(data => ({ ok: res.ok, data })));
}

// SHARED NAVBAR
function renderNavbar() {
  const placeholder = document.getElementById('navbar-placeholder');
  if (!placeholder) return;

  const user = JSON.parse(localStorage.getItem('user') || 'null');

  placeholder.innerHTML = `
    <div class="navbar">
      <strong>EventHive</strong>
      <div>
        <a href="events.html">Events</a>
        ${token ? '<a href="my-bookings.html">My Bookings</a>' : ''}
        ${user && (user.role === 'organizer' || user.role === 'admin') ? '<a href="create-event.html">Create Event</a><a href="my-events.html">My Events</a>' : ''}
        ${user && user.role === 'admin' ? '<a href="admin.html">Admin</a>' : ''}
        <a href="#" id="logoutLink">${token ? 'Logout' : 'Login'}</a>
      </div>
    </div>
  `;

  document.getElementById('logoutLink').addEventListener('click', (e) => {
    e.preventDefault();
    if (token) {
      localStorage.clear();
      window.location.href = 'index.html';
    } else {
      window.location.href = 'index.html';
    }
  });
}

renderNavbar();

// LOGIN
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('errorMsg');

    const { ok, data } = await authFetch(`${API_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    if (!ok) return errorMsg.textContent = data.error;

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    window.location.href = 'events.html';
  });
}

// REGISTER
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;
    const errorMsg = document.getElementById('errorMsg');

    const { ok, data } = await authFetch(`${API_URL}/auth/register`, {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role })
    });

    if (!ok) return errorMsg.textContent = data.error;
    window.location.href = 'index.html';
  });
}

// EVENTS LIST
const eventGrid = document.getElementById('eventGrid');
if (eventGrid) {
  authFetch(`${API_URL}/events`).then(({ data: events }) => {
    events.forEach(event => {
      const card = document.createElement('div');
      card.className = 'event-card';
      card.innerHTML = `
        <h3>${event.title}</h3>
        <p>${event.location}</p>
        <p>${new Date(event.date_time).toLocaleDateString()}</p>
        <p>${event.price} ETB</p>
        <a href="event.html?id=${event.id}">View Details</a>
      `;
      eventGrid.appendChild(card);
    });
  });
}

// EVENT DETAIL + BOOKING
const eventDetail = document.getElementById('eventDetail');
if (eventDetail) {
  const eventId = new URLSearchParams(window.location.search).get('id');

  authFetch(`${API_URL}/events/${eventId}`).then(({ data: event }) => {
    eventDetail.innerHTML = `
      <h1>${event.title}</h1>
      <p>${event.description}</p>
      <p><strong>Location:</strong> ${event.location}</p>
      <p><strong>Date:</strong> ${new Date(event.date_time).toLocaleString()}</p>
      <p><strong>Price:</strong> ${event.price} ETB</p>
      ${token ? '<button id="bookBtn">Book Ticket</button>' : '<p>Please <a href="index.html">log in</a> to book this event.</p>'}
      <p class="error" id="bookMsg"></p>
    `;

    const bookBtn = document.getElementById('bookBtn');
    if (bookBtn) {
      bookBtn.addEventListener('click', async () => {
        const bookMsg = document.getElementById('bookMsg');
        const { ok, data } = await authFetch(`${API_URL}/bookings`, {
          method: 'POST',
          body: JSON.stringify({ event_id: eventId })
        });
        bookMsg.style.color = ok ? '#2F6B5E' : '#C0392B';
        bookMsg.textContent = ok ? 'Booking successful!' : data.error;
      });
    }
  });
}

// MY BOOKINGS
const bookingGrid = document.getElementById('bookingGrid');
if (bookingGrid) {
  if (!token) {
    bookingGrid.innerHTML = '<p>Please <a href="index.html">log in</a> to see your bookings.</p>';
  } else {
    authFetch(`${API_URL}/bookings/my-bookings`).then(({ data: bookings }) => {
      if (bookings.length === 0) return bookingGrid.innerHTML = '<p>You have no bookings yet.</p>';
      bookings.forEach(booking => {
        const card = document.createElement('div');
        card.className = 'event-card';
        card.innerHTML = `
          <h3>${booking.title}</h3>
          <p>${booking.location}</p>
          <p>${new Date(booking.date_time).toLocaleDateString()}</p>
          <p><strong>Status:</strong> ${booking.status}</p>
          <p><strong>Payment:</strong> ${booking.payment_status}</p>
        `;
        bookingGrid.appendChild(card);
      });
    });
  }
}

// CREATE EVENT
const createEventForm = document.getElementById('createEventForm');
if (createEventForm) {
  createEventForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const createMsg = document.getElementById('createMsg');

    if (!token) return createMsg.textContent = 'Please log in as an organizer to create events.';

    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const location = document.getElementById('location').value;
    const date_time = document.getElementById('date_time').value;
    const capacity = document.getElementById('capacity').value;
    const price = document.getElementById('price').value;

    const { ok, data } = await authFetch(`${API_URL}/events`, {
      method: 'POST',
      body: JSON.stringify({ title, description, location, date_time, capacity, price })
    });

    if (!ok) {
      createMsg.style.color = '#C0392B';
      return createMsg.textContent = data.error;
    }
    window.location.href = 'events.html';
  });
}

// MY EVENTS (organizer)
const myEventsGrid = document.getElementById('myEventsGrid');
if (myEventsGrid) {
  authFetch(`${API_URL}/events/my-events`).then(({ ok, data: events }) => {
    if (!ok) return myEventsGrid.innerHTML = `<p>${events.error}</p>`;
    if (events.length === 0) return myEventsGrid.innerHTML = '<p>You have not created any events yet.</p>';

    events.forEach(event => {
      const card = document.createElement('div');
      card.className = 'event-card';
      card.innerHTML = `
        <h3>${event.title}</h3>
        <p>${event.location}</p>
        <p>${new Date(event.date_time).toLocaleDateString()}</p>
        <p><strong>Status:</strong> ${event.status}</p>
       ${event.status === 'active'
  ? `
      <button class="editBtn" data-id="${event.id}">Edit</button>
      <button class="cancelBtn" data-id="${event.id}">Cancel Event</button>`
  : ''
}
      `;
      myEventsGrid.appendChild(card);
      const editBtn = card.querySelector('.editBtn');

if (editBtn) {
  editBtn.addEventListener('click', () => {
    document.getElementById('editFormContainer').style.display = 'block';

    document.getElementById('editId').value = event.id;
    document.getElementById('editTitle').value = event.title;
    document.getElementById('editDescription').value = event.description || '';
    document.getElementById('editLocation').value = event.location;
    document.getElementById('editDateTime').value =
      new Date(event.date_time).toISOString().slice(0, 16);
    document.getElementById('editCapacity').value = event.capacity;
    document.getElementById('editPrice').value = event.price;

    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth'
    });
  });
}
    });

    document.querySelectorAll('.cancelBtn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const { ok } = await authFetch(`${API_URL}/events/${id}/cancel`, { method: 'PATCH' });
        if (ok) location.reload();
      });
    });
  });
}
const editEventForm = document.getElementById('editEventForm');

if (editEventForm) {
  editEventForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('editId').value;

    const title = document.getElementById('editTitle').value;
    const description = document.getElementById('editDescription').value;
    const location = document.getElementById('editLocation').value;
    const date_time = document.getElementById('editDateTime').value;
    const capacity = document.getElementById('editCapacity').value;
    const price = document.getElementById('editPrice').value;

    const { ok, data } = await authFetch(`${API_URL}/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        title,
        description,
        location,
        date_time,
        capacity,
        price
      })
    });

    const editMsg = document.getElementById('editMsg');

    if (!ok) {
      editMsg.style.color = '#C0392B';
      editMsg.textContent = data.error;
      return;
    }

    editMsg.style.color = '#2F6B5E';
    editMsg.textContent = 'Event updated successfully!';

    setTimeout(() => {
      location.reload();
    }, 1000);
  });
}