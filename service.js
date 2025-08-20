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

async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('Database connected successfully');
        connection.release();
    } catch (error) {
        console.error('Database connection failed:', error);
    }
}
testConnection();

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
            email,
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

    async classesDetails(id) {
        try {
            const [result] = await pool.execute(`SELECT classes.*,
                COUNT(enrollments.user_id) as enrolled_students
            FROM classes
            LEFT JOIN enrollments ON classes.id = enrollments.class_id
            WHERE classes.id = ?
            GROUP BY classes.id`, [id])

            if (result.length === 0) {
                throw new Error('Class not found')
            }

            return result;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async createClasses(title, description, instructor, duration_hours, max_students) {
        try {

            if (!title || !instructor) {
                throw new Error('Title and instructor are required');
            }

            const query = `INSERT INTO classes (title, description, instructor, duration_hours, max_students) 
            VALUES (?, ?, ?, ?, ?)`;

            const [result] = await pool.execute(query, [
                title,
                description,
                instructor,
                duration_hours,
                max_students
            ]);

            return {
                id: result.insertId,
                title,
                description,
                instructor,
                duration_hours,
                max_students
            };
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async updateClasses(id, { title, description, instructor, duration_hours, max_students }) {
        try {
            const [existingClasses] = await pool.execute('SELECT * FROM classes WHERE id = ?', [id])
            if (existingClasses.length === 0) {
                throw new Error('Class not found!')
            }

            const query = `UPDATE classes 
            SET title = ?, 
            description = ?, 
            instructor = ?, 
            duration_hours = ?, 
            max_students = ? 
            WHERE id = ?`;

            const [result] = await pool.execute(query, [
                title,
                description,
                instructor,
                duration_hours,
                max_students,
                id
            ]);

            return { 
                success: result.affectedRows > 0, 
                message: result.affectedRows > 0
                ? "Class updated successfully"
                : "No changes made"
             };
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async deleteClasses(id) {
        try {
            const [existingClasses] = await pool.execute('SELECT * FROM classes WHERE id = ?', [id])
            if (existingClasses.length === 0) {
                throw new Error('Class not found!')
            }

            await pool.execute('DELETE FROM classes WHERE id = ?', [id]);

            return {
                success: true,
                message: "Class Deleted Succesfully"
            };
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async enroll(user_id, class_id) {
        try{
            if (!class_id) {
                throw new Error('Class ID is required!');
            }
            
            const [classResult] = await pool.execute('SELECT * FROM classes WHERE id = ?', [class_id])
            if (classResult.length === 0) {
                throw new Error('Class not found!')
            }

            const classData = classResult[0];

            const [existingEnrollment] = await pool.execute('SELECT * FROM enrollments WHERE user_id = ? AND class_id = ?', [user_id, class_id]);
            if (existingEnrollment.length > 0) {
                throw new Error('Already enrolled in this class');
            }

            const [enrollmentCount] = await pool.execute('SELECT COUNT(*) as count FROM enrollments WHERE class_id = ?', [class_id]);
            
            const currentEnrollments = enrollmentCount[0].count;

            if (currentEnrollments >= classData.max_students) {
            throw new Error('Class is full');
        }
        

            const [result] = await pool.execute('INSERT INTO enrollments (user_id, class_id) VALUES (?, ?)', [user_id, class_id]);

            return {
                id: result.insertId,
                user_id,
                class_id
            };
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async myClasses(user_id) {
        try {
            const [result] = await pool.execute(`SELECT classes.*, enrollments.enrolled_at
                FROM classes
                JOIN enrollments ON classes.id = enrollments.class_id
                WHERE enrollments.user_id = ?
                ORDER BY enrollments.enrolled_at DESC`, [user_id]);

                return result;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async deleteEnrollments(user_id, class_id) {
        try {
            const [existingEnrollment] = await pool.execute('SELECT * FROM enrollments WHERE user_id = ? AND class_id = ?', [user_id, class_id]);
            if (existingEnrollment.length === 0) {
                throw new Error('Enrollments not found');
            }

            await pool.execute('DELETE FROM enrollments WHERE user_id = ? AND class_id = ?', [user_id, class_id]);

            return {
                success: true,
                message: "Successfuly unenrolled from class"
            };
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}

module.exports = Services;