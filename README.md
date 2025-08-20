# Case-Assesment-Test-BelajarLinkedIn
REST API using Node.js &amp; Express.js for managing MySql

## Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySql
- **Authentication**: JWT
- **Password Hash**: bcryptjs
- **CORS**

## Database Structure
```sql
CREATE TABLE `classes` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `instructor` varchar(255) NOT NULL,
  `duration_hours` int(11) DEFAULT 0,
  `max_students` int(11) DEFAULT 20,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
);
```