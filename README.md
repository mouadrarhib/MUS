
<div align="center">
  <a href="https://github.com/your-username/MUS">
    <img src="MUS-frontend/src/assets/images/logo.png" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">MUS - Management University System</h3>

  <p align="center">
    A full-stack web application for managing university-related activities.
    <br />
    <a href="https://github.com/your-username/MUS"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://github.com/your-username/MUS/issues">Report Bug</a>
    ·
    <a href="https://github.com/your-username/MUS/issues">Request Feature</a>
  </p>
</div>

[![Build Status](https://github.com/your-username/MUS/actions/workflows/ci.yml/badge.svg)](https://github.com/your-username/MUS/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Table of Contents

- [About The Project](#about-the-project)
- [Features](#features)
- [Built With](#built-with)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## About The Project

**MUS (Management University System)** is a comprehensive, full-stack application designed to streamline university management. It provides a robust platform for students and administrators to manage courses, user roles, and other academic activities. The system features a secure RESTful API backend and a modern, responsive frontend.

---

## Features

- **Authentication**: Secure user registration and login with JWT-based authentication.
- **Role-Based Access Control**: Different roles for administrators and students with distinct permissions.
- **Course Management**: Admins can create, update, and delete courses.
- **User Management**: Admins can view and manage user accounts.
- **Admin Dashboard**: A centralized dashboard for administrators to get an overview of the system.
- **Responsive Design**: A user-friendly interface that works on both desktop and mobile devices.

---

## Built With

This project is built with a modern technology stack:

**Backend**
*   [Node.js](https://nodejs.org/)
*   [Express.js](https://expressjs.com/)
*   [PostgreSQL](https://www.postgresql.org/)
*   [Sequelize](https://sequelize.org/)
*   [JWT](https://jwt.io/)

**Frontend**
*   [React](https://reactjs.org/)
*   [Vite](https://vitejs.dev/)
*   [Material-UI](https://mui.com/)
*   [Axios](https://axios-http.com/)
*   [React Router](https://reactrouter.com/)

**DevOps**
*   [Docker](https://www.docker.com/)
*   [GitHub Actions](https://github.com/features/actions)

---

## Getting Started

You can run the project using Docker (recommended) or set up the development environments locally.

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18.x or later)
- [npm](https://www.npmjs.com/)
- [Docker](https://www.docker.com/get-started) & [Docker Compose](https://docs.docker.com/compose/install/) (for Docker-based setup)
- A running [PostgreSQL](https://www.postgresql.org/) instance (for local setup)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/MUS.git
    cd MUS
    ```

#### 1. Running with Docker (Recommended)

This is the simplest way to get the entire application running.

1.  **Environment Variables:** The backend service requires environment variables. Create a `.env` file in the `MUS-backend` directory by copying the example:
    ```bash
    cp MUS-backend/.env.example MUS-backend/.env
    ```
    *You may need to create the `.env.example` file first or fill out the `.env` file manually as described in the **Environment Variables** section below.*

2.  **Run Docker Compose:**
    ```bash
    docker-compose up -d --build
    ```
    - The frontend will be available at `http://localhost:5173`.
    - The backend will be available at `http://localhost:3000`.

#### 2. Running Locally (Without Docker)

This requires setting up the frontend, backend, and database separately.

1.  **Setup the Database:**
    - Ensure you have a PostgreSQL server running.
    - Create a new database.
    - Execute the DDL script `Database/database_DDL.sql` to create the necessary tables.

2.  **Setup the Backend:**
    - Navigate to the backend directory: `cd MUS-backend`
    - Install dependencies: `npm install`
    - Create a `.env` file and fill it with your database and JWT credentials (see **Environment Variables** section).
    - Run the development server: `npm run dev`
    - The backend server will start on `http://localhost:3000` (or as configured).

3.  **Setup the Frontend:**
    - Navigate to the frontend directory: `cd MUS-frontend`
    - Install dependencies: `npm install`
    - Run the development server: `npm run dev`
    - The frontend development server will start on `http://localhost:5173`.

### Environment Variables

The backend requires the following environment variables. Create a `.env` file in `MUS-backend/` with the following content:

| Variable         | Description                                | Default         | Example                               |
| ---------------- | ------------------------------------------ | --------------- | ------------------------------------- |
| `PGHOST`         | Database host                              | `localhost`     | `db` (if using Docker)                |
| `PGPORT`         | Database port                              | `5432`          | `5432`                                |
| `PGUSER`         | Database username                          | `postgres`      | `myuser`                              |
| `PGPASSWORD`     | Database password                          | `password`      | `supersecret`                         |
| `PGDATABASE`     | Database name                              | `mus_db`        | `university_db`                       |
| `PGSSLMODE`      | DB SSL mode                                | `disable`       | `require`                             |
| `JWT_SECRET`     | Secret key for signing JWTs                | `change_me`     | `a-very-strong-and-secret-key`        |
| `JWT_EXPIRES_IN` | JWT expiration time                        | `1h`            | `24h`                                 |

---

## API Documentation

The backend API is documented using Swagger. Once the backend is running, you can access the interactive API documentation at:

`http://localhost:3000/api-docs/`

---

## Project Structure

```
.
├── MUS-backend/      # Node.js/Express Backend
├── MUS-frontend/     # React/Vite Frontend
├── Database/         # SQL Database Scripts
├── .github/          # CI/CD Workflows
├── docker-compose.yml # Docker orchestration
└── README.md
```

---

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

Please read `CONTRIBUTING.md` for details on our code of conduct, and the process for submitting pull requests to us.

---

## License

Distributed under the MIT License. See `LICENSE` for more information.

---

## Contact

Your Name - [@your_twitter](https://twitter.com/your_twitter) - email@example.com

Project Link: [https://github.com/your-username/MUS](https://github.com/your-username/MUS)
