# Employee Management GraphQL API

A robust GraphQL API for employee management with role-based authentication, pagination, and performance optimizations.

## Features

- **Role-based Authentication**: Admin and Employee roles with different permissions
- **CRUD Operations**: Complete employee management with attendance tracking
- **Pagination**: Cursor-based pagination for efficient data loading
- **Performance Optimization**: DataLoader, indexes, query complexity analysis
- **Security**: Rate limiting, input validation, query depth limiting
- **Flexible Queries**: Advanced filtering, sorting, and search capabilities

## Installation

```bash
npm install
```

## Environment Setup

Create a `.env` file with the required environment variables (see .env example above).

## Running the Application

```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

- GraphQL Endpoint: `http://localhost:4000/graphql`
- GraphQL Playground: `http://localhost:4000/graphql` (development only)

## Authentication

### Register Admin User
```graphql
mutation {
  register(input: {
    username: "admin"
    email: "admin@company.com"
    password: "password123"
    role: ADMIN
  }) {
    token
    user {
      id
      username
      role
    }
  }
}
```

### Login
```graphql
mutation {
  login(input: {
    username: "admin"
    password: "password123"
  }) {
    token
    user {
      id
      username
      role
    }
  }
}
```

## Example Queries

### Get Employees with Pagination
```graphql
query {
  employees(
    first: 10
    filter: {
      isActive: true
      class: "Senior"
    }
    sort: {
      field: "name"
      order: ASC
    }
  ) {
    edges {
      node {
        id
        name
        employeeId
        class
        department
        subjects
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
    totalCount
  }
}
```

### Create Employee (Admin Only)
```graphql
mutation {
  createEmployee(input: {
    employeeId: "EMP001"
    name: "John Doe"
    age: 30
    class: "Senior"
    subjects: ["Mathematics", "Physics"]
    department: "Engineering"
    position: "Senior Developer"
    salary: 75000
    contactInfo: {
      email: "john.doe@company.com"
      phone: "+1234567890"
    }
  }) {
    id
    name
    employeeId
    class
    subjects
  }
}
```

### Add Attendance (Admin Only)
```graphql
mutation {
  addAttendance(
    employeeId: "employee_id_here"
    input: {
      date: "2024-01-15"
      status: PRESENT
      checkIn: "2024-01-15T09:00:00Z"
      checkOut: "2024-01-15T17:00:00Z"
      hoursWorked: 8
    }
  ) {
    id
    attendance {
      date
      status
      hoursWorked
    }
  }
}
```

### Get Employee Statistics (Admin Only)
```graphql
query {
  employeeStats {
    totalEmployees
    activeEmployees
    inactiveEmployees
    departmentCounts {
      department
      count
    }
    classCounts {
      class
      count
    }
    averageAge
  }
}
```

## Role-Based Access Control

### Admin Permissions
- Full CRUD operations on employees
- Access to all employee data (active/inactive)
- Attendance management
- Employee statistics
- User management

### Employee Permissions
- Read access to active employees only
- Limited filtering capabilities
- Cannot modify employee data
- Cannot access statistics

## Performance Optimizations

1. **Database Indexes**: Strategic indexing on frequently queried fields
2. **DataLoader**: Batching and caching for N+1 query prevention
3. **Query Complexity Analysis**: Prevents expensive queries
4. **Query Depth Limiting**: Prevents deeply nested queries
5. **Pagination**: Efficient cursor-based pagination
6. **Field-level Caching**: Cached computed fields

## Security Features

1. **JWT Authentication**: Secure token-based authentication
2. **Password Hashing**: bcrypt with salt rounds
3. **Rate Limiting**: IP-based request limiting
4. **Input Validation**: Comprehensive input sanitization
5. **Query Depth Limiting**: Prevents query depth attacks
6. **CORS Protection**: Configurable CORS policies

## Error Handling

The API includes comprehensive error handling:
- Authentication errors
- Authorization errors
- Validation errors
- Database errors
- Rate limiting errors

## Testing

Headers for authenticated requests:
```json
{
  "Authorization": "Bearer your-jwt-token-here"
}
```

## Production Considerations

1. Use environment variables for all sensitive data
2. Set up proper MongoDB indexes
3. Configure rate limiting based on your needs
4. Set up monitoring and logging
5. Use HTTPS in production
6. Consider implementing refresh tokens for better security
```

## Key Performance Optimizations Implemented

1. **Database Indexes**: Multiple indexes on frequently queried fields
2. **DataLoader**: Batching and caching to prevent N+1 queries
3. **Query Complexity Analysis**: Prevents expensive queries from overwhelming the server
4. **Query Depth Limiting**: Prevents deeply nested queries
5. **Cursor-based Pagination**: Efficient pagination for large datasets
6. **Connection Pooling**: MongoDB connection optimization
7. **Field-level Permissions**: Only load necessary data based on user role

## Security Features

1. **JWT Authentication**: Stateless authentication
2. **Role-based Access Control**: Admin vs Employee permissions
3. **Rate Limiting**: Prevents API abuse
4. **Input Validation**: Comprehensive validation
5. **Query Depth Limiting**: Prevents query depth attacks
6. **CORS Protection**: Configurable CORS policies
7. **Helmet Security**: Various security headers

This complete GraphQL API provides a robust foundation for employee management with proper authentication, authorization, performance optimization, and security measures.