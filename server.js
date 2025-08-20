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
        const { email, password } = request.body;
        const db = Services.getServicesInstance();

        const user = await db.login(email, password);

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
            message: 'All classes retrieved successfully',
            classes: result
        });
    } catch (error) {
        console.error('Error fetching classes:', error);
        response.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/classes/:id', async (request, response) => {
    try {
        const { id } = request.params;
        const db = Services.getServicesInstance(); 
        const details = await db.classesDetails(id);

        response.json({
            message: 'Class details Retrieved successfully',
            classes: details
        });
    } catch (error) {
        console.error('Error fetching class details:', error);
        response.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/classes', authenticateToken, async (request, response) => {
    try {
        const { title, description, instructor, duration_hours, max_students } = request.body;
        const db = Services.getServicesInstance();

        const newClass = await db.createClasses(title, description, instructor, duration_hours, max_students);

        response.status(201).json({
        message: 'Class created successfully',
        class: newClass
    });
    } catch (error) {
        console.error('Error creating class:', error);
        response.status(500).json({ error: 'Internal server error' });
    }
});

// update
app.put('/classes/:id', authenticateToken, async (request, response) => {
    try {
        const db = Services.getServicesInstance(); 
        const { id } = request.params;
        const updateData = request.body;

        const updated = await db.updateClasses(id, updateData);

        response.json(updated);
    } catch (error) {
        console.error('Error updating class:', error);
        response.status(500).json({ error: 'Internal server error' });
    }
});

// delete
app.delete('/classes/:id', authenticateToken, async (request, response) => {
    try {
        const db = Services.getServicesInstance(); 
        const { id } = request.params;

        const deleted = await db.deleteClasses(id);

        response.json(deleted);
    } catch (error) {
        console.error('Error deleting class:', error);
        response.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/enroll', authenticateToken, async (request, response) => {
    try {
        const { class_id } = request.body;
        const user_id = request.user.userId;
        const db = Services.getServicesInstance();

        const enrolled = await db.enroll(user_id, class_id);
        
        response.status(201).json({
            message: 'Successfully enrolled in class',
            enrollment: enrolled
        });
    } catch (error) {
        console.error('Error enrolling user:', error);
        response.status(500).json({ error: 'Internal server error' });
    }
})

app.get('/my-classes', authenticateToken, async (request, response) => {
    try {
        const user_id = request.user.userId;
        const db = Services.getServicesInstance(); 
        const myclass = await db.myClasses(user_id);

        response.json({
            message: 'Enrolled classes retrieved successfully',
            classes: myclass
        });
    } catch (error) {
        console.error('Error fetching classes:', error);
        response.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/enroll/:class_id', authenticateToken, async (request, response) => {
    try {       
        const db = Services.getServicesInstance(); 
        const { class_id } = request.params;
        const user_id = request.user.userId;

        const unenrolled = await db.deleteEnrollments(user_id, class_id);

        response.json(unenrolled);
    } catch (error) {
        console.error('Error unenrolling user:', error);
        response.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Belajar LinkedIn API is running',
    timestamp: new Date().toISOString()
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});