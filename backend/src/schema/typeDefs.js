const { gql } = require('apollo-server-express');

const typeDefs = gql`
  scalar Date

  enum Role {
    ADMIN
    EMPLOYEE
  }

  enum AttendanceStatus {
    PRESENT
    ABSENT
    LATE
    HALF_DAY
  }

  enum SortOrder {
    ASC
    DESC
  }

  type User {
    id: ID!
    username: String!
    email: String!
    role: Role!
    isActive: Boolean!
    lastLogin: Date
    createdAt: Date!
    updatedAt: Date!
  }

  type Attendance {
    id: ID!
    date: Date!
    status: AttendanceStatus!
    checkIn: Date
    checkOut: Date
    hoursWorked: Float
  }

  type ContactInfo {
    email: String
    phone: String
    address: String
  }

  type Employee {
    id: ID!
    employeeId: String!
    name: String!
    age: Int!
    class: String!
    subjects: [String!]!
    attendance: [Attendance!]!
    salary: Float
    department: String
    position: String
    hireDate: Date!
    contactInfo: ContactInfo
    isActive: Boolean!
    createdBy: User!
    updatedBy: User
    createdAt: Date!
    updatedAt: Date!
  }

  type EmployeeConnection {
    edges: [EmployeeEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type EmployeeEdge {
    node: Employee!
    cursor: String!
  }

  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  input LoginInput {
    username: String!
    password: String!
  }

  input RegisterInput {
    username: String!
    email: String!
    password: String!
    role: Role = EMPLOYEE
  }

  input ContactInfoInput {
    email: String
    phone: String
    address: String
  }

  input EmployeeInput {
    employeeId: String!
    name: String!
    age: Int!
    class: String!
    subjects: [String!]!
    salary: Float
    department: String
    position: String
    hireDate: Date
    contactInfo: ContactInfoInput
  }

  input UpdateEmployeeInput {
    name: String
    age: Int
    class: String
    subjects: [String!]
    salary: Float
    department: String
    position: String
    contactInfo: ContactInfoInput
    isActive: Boolean
  }

  input AttendanceInput {
    date: Date!
    status: AttendanceStatus!
    checkIn: Date
    checkOut: Date
    hoursWorked: Float
  }

  input EmployeeFilter {
    name: String
    class: String
    department: String
    isActive: Boolean
    ageMin: Int
    ageMax: Int
  }

  input EmployeeSort {
    field: String!
    order: SortOrder!
  }

  type Query {
    # Authentication
    me: User

    # Employee queries
    employees(
      filter: EmployeeFilter
      sort: EmployeeSort
      first: Int
      after: String
      last: Int
      before: String
    ): EmployeeConnection!

    employee(id: ID!): Employee

    employeeByEmployeeId(employeeId: String!): Employee

    # Statistics (Admin only)
    employeeStats: EmployeeStats

    # Search employees
    searchEmployees(query: String!, limit: Int = 10): [Employee!]!
  }

  type EmployeeStats {
    totalEmployees: Int!
    activeEmployees: Int!
    inactiveEmployees: Int!
    departmentCounts: [DepartmentCount!]!
    classCounts: [ClassCount!]!
    averageAge: Float!
  }

  type DepartmentCount {
    department: String!
    count: Int!
  }

  type ClassCount {
    class: String!
    count: Int!
  }

  type Mutation {
    # Authentication
    login(input: LoginInput!): AuthPayload!
    register(input: RegisterInput!): AuthPayload!

    # Employee mutations
    createEmployee(input: EmployeeInput!): Employee!
    updateEmployee(id: ID!, input: UpdateEmployeeInput!): Employee!
    deleteEmployee(id: ID!): Boolean!

    # Attendance mutations
    addAttendance(employeeId: ID!, input: AttendanceInput!): Employee!
    updateAttendance(employeeId: ID!, attendanceId: ID!, input: AttendanceInput!): Employee!
  }
`;

module.exports = typeDefs;