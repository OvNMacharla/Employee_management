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
