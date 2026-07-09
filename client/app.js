
/* ============================
   CONFIG + HELPERS
============================ */
const API_URL = 'http://localhost:5000/api';
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || 'null');
 
// Sends a fetch request with the JWT auth header attached automatically
function authFetch(url, options = {}) {
  options.headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers
  };
  return fetch(url, options).then(res =>
    res.json().then(data => ({ ok: res.ok, data }))
  );
}
 
function $(id) {
  return document.getElementById(id);
}
 
/* ============================
   NAVBAR (shared across pages)
============================ */
function renderNavbar() {
  const placeholder = $('navbar-placeholder');
  if (!placeholder) return;
 
  const isStaff = user && (user.role === 'organizer' || user.role === 'admin');
  const isAdmin = user && user.role === 'admin';
 
  placeholder.innerHTML = `
    <div class="navbar">
      <strong>EventHive</strong>
      <div>
        <a href="events.html">Events</a>
        ${token ? '<a href="my-bookings.html">My Bookings</a>' : ''}
        ${isStaff ? '<a href="create-event.html">Create Event</a><a href="my-events.html">My Events</a>' : ''}
        ${isAdmin ? '<a href="admin.html">Admin</a>' : ''}
        <a href="#" id="logoutLink">${token ? 'Logout' : 'Login'}</a>
      </div>
    </div>
  `;
 
  $('logoutLink').addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.clear();
    window.location.href = 'index.html';
  });
}
renderNavbar();
 
/* ============================
   LOGIN
============================ */
if ($('loginForm')) {
  $('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorMsg = $('errorMsg');
 
    const { ok, data } = await authFetch(`${API_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: $('email').value,
        password: $('password').value
      })
    });
 
    if (!ok) return errorMsg.textContent = data.error;
 
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    window.location.href = 'events.html';
  });
}
 
/* ============================
   REGISTER
============================ */
if ($('registerForm')) {
  $('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorMsg = $('errorMsg');
 
    const { ok, data } = await authFetch(`${API_URL}/auth/register`, {
      method: 'POST',
      body: JSON.stringify({
        name: $('name').value,
        email: $('email').value,
        password: $('password').value,
        role: $('role').value
      })
    });
 
    if (!ok) return errorMsg.textContent = data.error;
    window.location.href = 'index.html';
  });
}
 
/* ============================
   EVENTS LIST
============================ */
if ($('eventGrid')) {
  authFetch(`${API_URL}/events`).then(({ data: events }) => {
    events.forEach(event => {
      $('eventGrid').insertAdjacentHTML('beforeend', `
        <div class="event-card">
          <h3>${event.title}</h3>
          <p>${event.location}</p>
          <p>${new Date(event.date_time).toLocaleDateString()}</p>
          <p>${event.price} ETB</p>
          <a href="event.html?id=${event.id}">View Details</a>
        </div>
      `);
    });
  });
}
 
/* ============================
   EVENT DETAIL + BOOKING
============================ */
if ($('eventDetail')) {
  const eventId = new URLSearchParams(window.location.search).get('id');
 
  authFetch(`${API_URL}/events/${eventId}`).then(({ data: event }) => {
    $('eventDetail').innerHTML = `
      <h1>${event.title}</h1>
      <p>${event.description}</p>
      <p><strong>Location:</strong> ${event.location}</p>
      <p><strong>Date:</strong> ${new Date(event.date_time).toLocaleString()}</p>
      <p><strong>Price:</strong> ${event.price} ETB</p>
      ${token
        ? '<button id="bookBtn">Book Ticket</button>'
        : '<p>Please <a href="index.html">log in</a> to book this event.</p>'}
      <p class="error" id="bookMsg"></p>
    `;
 
    if ($('bookBtn')) {
      $('bookBtn').addEventListener('click', async () => {
        const { ok, data } = await authFetch(`${API_URL}/bookings`, {
          method: 'POST',
          body: JSON.stringify({ event_id: eventId })
        });
        $('bookMsg').style.color = ok ? '#2F6B5E' : '#C0392B';
        $('bookMsg').textContent = ok ? 'Booking successful!' : data.error;
      });
    }
  });
}
 
/* ============================
   MY BOOKINGS
============================ */
if ($('bookingGrid')) {
  if (!token) {
    $('bookingGrid').innerHTML = '<p>Please <a href="index.html">log in</a> to see your bookings.</p>';
  } else {
    authFetch(`${API_URL}/bookings/my-bookings`).then(({ data: bookings }) => {
      if (bookings.length === 0) {
        return $('bookingGrid').innerHTML = '<p>You have no bookings yet.</p>';
      }
      bookings.forEach(booking => {
        $('bookingGrid').insertAdjacentHTML('beforeend', `
          <div class="event-card">
            <h3>${booking.title}</h3>
            <p>${booking.location}</p>
            <p>${new Date(booking.date_time).toLocaleDateString()}</p>
            <p><strong>Status:</strong> ${booking.status}</p>
            <p><strong>Payment:</strong> ${booking.payment_status}</p>
          </div>
        `);
      });
    });
  }
}
 
/* CREATE EVENT */
if ($('createEventForm')) {
  $('createEventForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const createMsg = $('createMsg');
 
    const { ok, data } = await authFetch(`${API_URL}/events`, {
      method: 'POST',
      body: JSON.stringify({
        title: $('title').value,
        description: $('description').value,
        location: $('location').value,
        date_time: $('date_time').value,
        capacity: $('capacity').value,
        price: $('price').value
      })
    });
 
    if (!ok) {
      createMsg.style.color = '#C0392B';
      return createMsg.textContent = data.error;
    }
    window.location.href = 'events.html';
  });
}
 
/* MY EVENTS (organizer) + EDIT/CANCEL */
if ($('myEventsGrid')) {
  authFetch(`${API_URL}/events/my-events`).then(({ ok, data: events }) => {
    if (!ok) return $('myEventsGrid').innerHTML = `<p>${events.error}</p>`;
    if (events.length === 0) return $('myEventsGrid').innerHTML = '<p>You have not created any events yet.</p>';
 
    events.forEach(event => {
      const card = document.createElement('div');
      card.className = 'event-card';
      card.innerHTML = `
        <h3>${event.title}</h3>
        <p>${event.location}</p>
        <p>${new Date(event.date_time).toLocaleDateString()}</p>
        <p><strong>Status:</strong> <span class="status-${event.status}">${event.status}</span></p>
        ${event.status === 'cancelled' && event.cancellation_reason ? `<p><strong>Cancellation reason:</strong> ${event.cancellation_reason}</p>` : ''}
        <p><strong>Booked:</strong> ${event.bookedCount} / ${event.capacity}</p>
        ${event.status === 'active' ? `
          <button class="editBtn" data-id="${event.id}">Edit</button>
          <button class="cancelBtn" data-id="${event.id}">Cancel Event</button>
        ` : ''}
      `;
      $('myEventsGrid').appendChild(card);
 
      const editBtn = card.querySelector('.editBtn');
      if (editBtn) {
        editBtn.addEventListener('click', () => {
          $('editFormContainer').style.display = 'block';
          $('editId').value = event.id;
          $('editTitle').value = event.title;
          $('editDescription').value = event.description || '';
          $('editLocation').value = event.location;
          $('editDateTime').value = new Date(event.date_time).toISOString().slice(0, 16);
          $('editCapacity').value = event.capacity;
          $('editPrice').value = event.price;
          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        });
      }
    });
 
    document.querySelectorAll('.cancelBtn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const { ok } = await authFetch(`${API_URL}/events/${btn.dataset.id}/cancel`, { method: 'PATCH' });
        if (ok) location.reload();
      });
    });
  });
}
 
if ($('editEventForm')) {
  $('editEventForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const editMsg = $('editMsg');
 
    const { ok, data } = await authFetch(`${API_URL}/events/${$('editId').value}`, {
      method: 'PUT',
      body: JSON.stringify({
        title: $('editTitle').value,
        description: $('editDescription').value,
        location: $('editLocation').value,
        date_time: $('editDateTime').value,
        capacity: $('editCapacity').value,
        price: $('editPrice').value
      })
    });
 
    if (!ok) {
      editMsg.style.color = '#C0392B';
      return editMsg.textContent = data.error;
    }
 
    editMsg.style.color = '#2F6B5E';
    editMsg.textContent = 'Event updated successfully!';
    setTimeout(() => location.reload(), 1000);
  });
}

/* ADMIN PANEL */
if ($('adminEventsGrid')) {
  authFetch(`${API_URL}/events/admin/all`).then(({ ok, data: events }) => {
    if (!ok) return $('adminEventsGrid').innerHTML = `<p>${events.error}</p>`;

    events.forEach(event => {
      const card = document.createElement('div');
      card.className = 'event-card';
      card.innerHTML = `
        <h3>${event.title}</h3>
        <p>${event.location}</p>
        <p>${new Date(event.date_time).toLocaleDateString()}</p>
        <p><strong>Organizer:</strong> ${event.organizer_email}</p>
        <p><strong>Status:</strong> <span class="status-${event.status}">${event.status}</span></p>
        <p><strong>Booked:</strong> ${event.bookedCount} / ${event.capacity}</p>
        ${event.status === 'active' ? `<button class="adminCancelBtn" data-id="${event.id}">Cancel Event</button>` : ''}
      `;
      $('adminEventsGrid').appendChild(card);
    });

   document.querySelectorAll('.adminCancelBtn').forEach(btn => {
  btn.addEventListener('click', async () => {
    const reasonOptions = [
      'Event is not genuine / fraudulent',
      'Violates platform policies',
      'Inappropriate or harmful content',
      'Other'
    ];
    let reason = prompt(
      `Select a reason (type the number):\n${reasonOptions.map((r, i) => `${i + 1}. ${r}`).join('\n')}`
    );

    const index = parseInt(reason) - 1;
    if (index >= 0 && index < reasonOptions.length) {
      reason = reasonOptions[index];
      if (reason === 'Other') {
        reason = prompt('Please specify the reason:') || 'Other';
      }
    } else {
      reason = 'Not specified';
    }

    const { ok } = await authFetch(`${API_URL}/events/${btn.dataset.id}/cancel`, {
      method: 'PATCH',
      body: JSON.stringify({ reason })
    });
    if (ok) location.reload();
  });
});
  });
}