# WalletMate Backend

A robust financial management backend system built with Spring Boot that handles user authentication, wallet management, and financial transactions.

## Tech Stack

- Java 17
- Spring Boot
- PostgreSQL
- Docker
- JWT Authentication

## Prerequisites

- Java 17 or higher
- Docker and Docker Compose
- Maven

## Quick Start

1. Clone the repository
2. Start the database:
```bash
docker-compose up -d
```

3. Run the application:
```bash
./mvnw spring-boot:run
```

The server will start on `http://localhost:8081`

## API Endpoints

### Authentication
- POST `/api/users/signup` - Register new user
- POST `/api/auth/login` - User login

### User Management
- GET `/api/users/all`

## Security

- JWT-based authentication
- Password encryption using BCrypt
- Role-based access control (ADMIN, USER)

## Testing

Run tests using:
```bash
./mvnw test
```

## Docker Support

Build and run the application using Docker:
```bash
docker-compose up --build
```

## Author

KABANOFESTO
