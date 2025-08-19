const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const JWT_SECRET = process.env.JWT_SECRET;
let instance = null;
dotenv.config();

const pool = mysql.createPool({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    port: process.env.DB_PORT
})

pool.connect((err) => {
    if (err) {
        console.log(err.message);
    }
    console.log('db' + pool.state);
})


class Services {
    static getServicesInstance() {
        if (!Services.instance) {
            Services.instance = new Services();
        }
        return Services.instance;
    }
    
    async register(name, email, password) {
        try {
            if (!name || !email || !password) {
            throw new Error('Name, email, and password are required');
        }

        const [existingUser] = await pool.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (existingUser.length > 0) {
            throw new Error('User with this email already exists');
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const query = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
        const [result] = await pool.execute(query, [name, email, hashedPassword]);

        return {
            id: result.insertId,
            name,
            email
        };
    } catch (error) {
        console.error(error);
        throw error;
    }
}

    async login(email, password) {
        try {
            if (!email || !password) {
            throw new Error('Email and password are required');
        }

        const [result] = await pool.execute ('SELECT * FROM users WHERE email = ?',
        [email]
        );

        if (result.length === 0) {
            throw new Error('Email doesnt exist!');
        }
        
        const user = result[0];

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid Password!');
        }

        const token = jwt.sign({
            userId: user.id,
            email: user.email
        }, JWT_SECRET, {
            expiresIn: '24h'
        });

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            token
        };
    } catch (error) {
        console.error(error);
        throw error;
    }
}

    async classes() {
        try {
            const query = `
                SELECT classes.*, 
                       COUNT(enrollments.user_id) AS enrolled_students 
                FROM classes 
                LEFT JOIN enrollments ON classes.id = enrollments.class_id 
                GROUP BY classes.id 
                ORDER BY classes.created_at DESC;
            `;
            
            const [result] = await pool.query(query);
            return result;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}

module.exports = Services;