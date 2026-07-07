const bcrypt = require('bcrypt');
const { createUser, findUserByEmail } = require('../models/userModel');

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name  ||!email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await createUser(name, email, passwordHash, role || 'attendee');

    res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { register };