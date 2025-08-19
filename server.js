const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const Services = require('./service');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended : false }));

const PORT = process.env.PORT;
const JWT_SECRET = process.env.JWT_SECRET;


const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// create
app.post('/register', async (request, response) => {
    try {
        const { name, email, password } = request.body;
        const db = Services.getServicesInstance();

        const newUser = await db.register(name, email, password);

        response.status(201).json({
        message: 'User registered successfully',
        user: newUser
    });
    } catch (error) {
        console.error('Error registering user:', error);
        response.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/login', async (request, response) => {
    try {
        const { name, email, password } = request.body;
        const db = Services.getServicesInstance();

        const user = await db.login(name, email, password);

        response.status(201).json({
        message: 'Login successful',
        user
    });
    } catch (error) {
        console.error('Error logging in', error);
        response.status(500).json({ error: 'Internal server error' });
    }
});

// read
app.get('/classes', async (request, response) => {
    try {
        const db = Services.getServicesInstance(); 
        const result = await db.classes();

        response.json({
            message: 'All Classes Retrieved',
            classes: result
        });
    } catch (error) {
        console.error('Error fetching classes:', error);
        response.status(500).json({ error: 'Internal server error' });
    }
});

// update

// delete