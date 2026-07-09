EventHive — Event Booking & Ticketing Platform

EventHive is a full-stack event booking platform where organizers can create and manage events, attendees can browse and book tickets, and admins oversee the entire platform. Built as the final project for Web Programming II.

Features


Authentication — Register/login with hashed passwords (bcrypt) and JWT-based sessions
Authorization — Three roles (attendee, organizer, admin) with route-level and ownership-level access control
Event management — Organizers can create, edit, and cancel their own events (full CRUD)
Booking system — Attendees can book tickets; bookings track a simulated escrow-style payment lifecycle (held, then refunded if the event is cancelled)
Admin panel — Admins can view and cancel any event platform-wide, with a required cancellation reason
Automatic refunds — Cancelling an event automatically marks all its bookings as refunded and cancelled
Soft delete — Events are never hard-deleted; cancelled events are preserved with a status flag and reason, protecting booking history
Request logging — All API requests are logged via Morgan


Tech Stack


Backend: Node.js, Express.js
Database: PostgreSQL
Frontend: Vanilla HTML, CSS, and JavaScript (no framework)
Auth: JWT (jsonwebtoken), bcrypt
Other: cors, dotenv, morgan


Architecture

The backend follows the MVC pattern. Models live in server/models and handle all database queries. Controllers live in server/controllers and contain the request handling and business logic. Routes live in server/routes and define the API endpoints. Middleware lives in server/middleware and handles JWT verification and role-based authorization. The database connection setup lives in server/config. The client folder holds the frontend, a separate vanilla JavaScript app that consumes the API rather than being rendered server-side.

Database Schema

The full DDL is included in database.sql at the project root. It defines three tables. The users table stores id, name, email, password_hash, role, and created_at. The events table stores id, organizer_id as a foreign key to users, title, description, location, date_time, capacity, price, status, cancellation_reason, and created_at. The bookings table stores id, event_id as a foreign key to events, user_id as a foreign key to users, status, payment_status, amount_paid, and booked_at.

Setup and Run Instructions

Make sure Node.js and PostgreSQL are installed before starting.

First, clone the repository and move into the project folder.

git clone https://github.com/semihakedir/event-booking-app.git
cd event-booking-app

Next, install the dependencies.

npm install

Then set up the database. Open psql, create the database, connect to it, and run the DDL script.

psql -U postgres
CREATE DATABASE event_booking_db;
\c event_booking_db
\i database.sql

Create a .env file in the project root with the following variables, replacing the values with your own.

DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=event_booking_db
JWT_SECRET=your_secret_key
PORT=5000

Start the backend server.

node server/server.js

The API will run on http://localhost:5000.

Finally, run the frontend by opening client/index.html with a live server, such as the Live Server extension in VS Code, or by opening the file directly in a browser. Make sure the backend server is already running before using the frontend.

User Roles

Attendees can browse events, book tickets, and view their own bookings. Organizers can do everything an attendee can, plus create, edit, and cancel the events they created. Admins can do everything an organizer can, plus view and cancel any event on the platform, regardless of who created it.

The admin role cannot be selected during registration, since that would be a security risk. To make a user an admin, update their role directly in the database:

UPDATE users SET role = 'admin' WHERE email = 'youremail@example.com';

Extra Features Beyond Course Scope

This project goes beyond the required course concepts in a few ways. Authorization is not just role-based but also ownership-based, meaning organizers can only edit or cancel events they personally created, not events belonging to other organizers. Bookings track a simulated escrow-style payment lifecycle rather than a simple paid or unpaid flag. Events use a soft-delete pattern instead of being removed from the database, which preserves booking history and data integrity. Admins are required to provide a cancellation reason when cancelling an event, and that reason is shown to the affected organizer. Cancelling an event automatically triggers refunds for every booking tied to it, rather than requiring a separate manual step