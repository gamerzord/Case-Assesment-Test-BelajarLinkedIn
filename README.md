# Case-Assesment-Test-BelajarLinkedIn
REST API using Node.js &amp; Express.js for managing MySql

## Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySql with XAMPP
- **Authentication**: JWT
- **Password Hash**: bcryptjs
- **CORS**

## Database Structure
### 1. Users
```sql
CREATE TABLE users (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) UNIQUE NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Classes
```sql
CREATE TABLE classes (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `instructor` VARCHAR(255) NOT NULL,
  `duration_hours` INT DEFAULT 0,
  `max_students` INT DEFAULT 20,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. Enrollments
```sql
CREATE TABLE enrollments (
id INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT,
    `class_id` INT,
    `enrolled_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `unique_enrollment` (user_id, class_id),
    FOREIGN KEY (user_id) REFERENCES `users` (id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES `classes` (id) ON DELETE CASCADE
);
```

## ENDPOINT List and Example Request &amp; Response JSON
### 1. POST /register
Register user
#### Request:
```json
{
  "name": "Budi",
  "email": "budi@example.com",
  "password": "password123"
}
```
#### Response:
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "name": "Budi",
    "email": "budi@example.com"
  }
}
```

### 2. POST /login
Login user
#### Request:
```json
{
  "email": "budi@example.com",
  "password": "password123"
}
```
#### Response:
```json
{
    "message": "Login successful",
    "user": {
        "id": 1,
        "name": "Budi",
        "email": "budi@example.com",
        "token": "<jwt_token>>"
    }
}
```

### 3. GET /classes
Get all classes data
#### Response:
```json
{
  "message": "All Classes retrieved successfully",
  "classes": [
    {
      "id": 1,
      "title": "Node.js Basics",
      "description": "Belajar dasar Node.js",
      "instructor": "Ms Alice",
      "duration_hours": 2,
      "max_students": 30,
      "created_at": "2025-08-20T09:14:40.000Z",
      "enrolled_students": 0
    },
    {
       "id": 2,
       "title": "React.js",
       "description": "Belajar React untuk frontend",
       "instructor": "Mr Gagas",
       "duration_hours": 3,
       "max_students": 50,
       "created_at": "2025-08-20T09:14:40.000Z",
       "enrolled_students": 0
    }
  ]
}
```

### 4. GET/classes/:id
Get a specific classs details, for example /classes/2
#### Response:
```json
{
    "message": "Class details Retrieved successfully",
    "classes": [
        {
            "id": 2,
            "title": "React.js",
            "description": "Belajar React untuk frontend",
            "instructor": "Mr Gagas",
            "duration_hours": 3,
            "max_students": 50,
            "created_at": "2025-08-20T09:14:40.000Z",
            "enrolled_students": 0
        }
    ]
}
```

### 5. POST /classes (Admin Only)
Create classes and assign them to users
#### Request:
```json
{
  "title": "React.js",
  "description": "Belajar React untuk frontend",
  "instructor": "Mr Gagas",
  "duration_hours": "3",
  "max_students": 50
}
```
#### Response:
```json
{
    "message": "Class created successfully",
    "class": {
        "id": 2,
        "title": "React.js",
        "description": "Belajar React untuk frontend",
        "instructor": "Mr Gagas",
        "duration_hours": "3",
        "max_students": 50
    }
}
```

### 6. PUT /classes/:id (Admins Only)
Update/edit a certain class
#### Request:
```json
{
  "title": "React.js",
  "description": "Belajar React untuk frontend",
  "instructor": "Sir Rafan",
  "duration_hours": 2,
  "max_students": 50
}
```
#### Response:
```json
{"success":true,"message":"Class updated successfully"}
```

### 7. DELETE /classes/:id
Delete a class entirely
#### Response:
```json
{"success":true,"message":"Class deleted successfully"}
```

### 8. POST /enroll
Enroll to a class
#### Request:
```json
{
  "class_id": 2
}
```
#### Response:
```json
{"message":"Successfully enrolled in class","enrollment":{"id":1,"user_id":1,"class_id":2}}
```

### 9. GET /my-classes
get the class list of the user
#### Response:
```json
{"message":"Enrolled classes retrieved successfully","classes":[{"id":2,"title":"React.js","description":"Belajar React untuk frontend","instructor":"Sir Rafan","duration_hours":2,"max_students":50,"created_at":"2025-08-20T09:14:40.000Z","enrolled_at":"2025-08-20T09:34:30.000Z"}]}
```

### 10. DELETE /enroll/:class_id
Unenroll/delete user from class
#### Response:
```json
{"success":true,"message":"Successfuly unenrolled from class"}
```

### 11. GET /health
Server status check
#### Response:
```json
{"status":"OK","message":"Belajar LinkedIn API is running","timestamp":"2025-08-20T09:40:51.392Z"}
```

## Run and Test API
**1. Clone Repo**
```bash
git clone https://github.com/gamerzord/Case-Assesment-Test-BelajarLinkedIn.git
cd Case-Assesment-Test-BelajarLinkedIn
```

**2. Install Dependencies**
```bash
npm install
```

**3. Setup Database**  
Make sure XAMPP/MySql in general is installed, and build the database
```sql
CREATE DATABASE belajar_linkedin;
```

**4. Environment Config**  
Make sure to make .env file, heres all the variables.
```
PORT=
JWT_SECRET=

HOST=
DB_PORT=
DATABASE=
USER=
PASSWORD=
```

**5. Run it**  
Preferably use nodemon:
```bash
nodemon server
```
without nodemone:
```bash
node server.js
```
If nodemon installed locally:
```bash
npx nodemon server
```