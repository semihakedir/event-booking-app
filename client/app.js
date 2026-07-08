const API_URL = 'http://localhost:5000/api';

const loginForm = document.getElementById('loginForm');

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('errorMsg');

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        errorMsg.textContent = data.error;
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      window.location.href = 'events.html';

    } catch (err) {
      errorMsg.textContent = 'Something went wrong. Please try again.';
    }
  });
}
const eventGrid = document.getElementById('eventGrid');

if (eventGrid) {
  fetch(`${API_URL}/events`)
    .then(res => res.json())
    .then(events => {
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
    })
    .catch(err => console.error(err));
}

const logoutLink = document.getElementById('logoutLink');
if (logoutLink) {
  logoutLink.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
  });
}
const eventDetail = document.getElementById('eventDetail');

if (eventDetail) {
  const params = new URLSearchParams(window.location.search);
  const eventId = params.get('id');

  fetch(`${API_URL}/events/${eventId}`)
    .then(res => res.json())
    .then(event => {
      const token = localStorage.getItem('token');

      eventDetail.innerHTML =` 
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
          try {
            const response = await fetch(`${API_URL}/bookings`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization':` Bearer ${token}`
              },
              body: JSON.stringify({ event_id: eventId })
            });
            const data = await response.json();

            if (!response.ok) {
              bookMsg.style.color = '#C0392B';
              bookMsg.textContent = data.error;
              return;
            }

            bookMsg.style.color = '#2F6B5E';
            bookMsg.textContent = 'Booking successful!';
          } catch (err) {
            bookMsg.textContent = 'Something went wrong.';
          }
        });
      }
    });
}
const registerForm = document.getElementById('registerForm');

if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;
    const errorMsg = document.getElementById('errorMsg');

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      });

      const data = await response.json();

      if (!response.ok) {
        errorMsg.textContent = data.error;
        return;
      }

      window.location.href = 'index.html';

    } catch (err) {
      errorMsg.textContent = 'Something went wrong. Please try again.';
    }
  });
}
const bookingGrid = document.getElementById('bookingGrid');

if (bookingGrid) {
  const token = localStorage.getItem('token');

  if (!token) {
    bookingGrid.innerHTML = '<p>Please <a href="index.html">log in</a> to see your bookings.</p>';
  } else {
    fetch(`${API_URL}/bookings/my-bookings`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(bookings => {
        if (bookings.length === 0) {
          bookingGrid.innerHTML = '<p>You have no bookings yet.</p>';
          return;
        }
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
const createEventForm = document.getElementById('createEventForm');

if (createEventForm) {
  createEventForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    const createMsg = document.getElementById('createMsg');

    if (!token) {
      createMsg.textContent = 'Please log in as an organizer to create events.';
      return;
    }

    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const location = document.getElementById('location').value;
    const date_time = document.getElementById('date_time').value;
    const capacity = document.getElementById('capacity').value;
    const price = document.getElementById('price').value;

    try {
      const response = await fetch(`${API_URL}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization':` Bearer ${token}`
        },
        body: JSON.stringify({ title, description, location, date_time, capacity, price })
      });

      const data = await response.json();

      if (!response.ok) {
        createMsg.style.color = '#C0392B';
        createMsg.textContent = data.error;
        return;
      }

      window.location.href = 'events.html';

    } catch (err) {
      createMsg.textContent = 'Something went wrong.';
    }
  });
}