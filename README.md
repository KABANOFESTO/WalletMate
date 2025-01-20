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
cd walletmate
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

### Budget Endpoints
- POST `/api/budgets` - Create a new budget
- GET `/api/budgets/user/{userId}` - Get all budgets for a user
- GET `/api/budgets/category/{categoryId}` - Get budgets for a category
- GET `/api/budgets/{id}` - Get a single budget by ID
- PUT `/api/budgets/{budgetId}` - Update a budget
- GET `/api/budgets/user/{userId}/subcategory/{subcategoryId}` - Get budgets for a subcategory
- GET `/api/budgets/user/{userId}/category/{categoryId}` - Get budgets for a category
- DELETE `/api/budgets/{id}` - Delete a budget
- GET `/api/budgets/status/{userId}` - Get budget status

### Category Endpoints
- POST `/api/categories` - Create a new category
- POST `/api/categories/{categoryId}/subcategories` - Create a new subcategory
- GET `/api/categories/user/{userId}` - Get all categories for a user
- GET `/api/categories/{categoryId}/subcategories` - Get all subcategories for a category
- GET `/api/categories/{id}` - Get a single category by ID
- PUT `/api/categories/{categoryId}` - Update a category
- DELETE `/api/categories/{categoryId}` - Delete a category
- DELETE `/api/categories/subcategories/{subcategoryId}` - Delete a subcategory

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
