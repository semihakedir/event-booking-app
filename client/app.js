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