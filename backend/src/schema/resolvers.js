const { AuthenticationError, ForbiddenError, UserInputError } = require('apollo-server-express');
const User = require('../models/User');
const Employee = require('../models/Employee');
const { generateToken } = require('../config/auth');
const { validateEmployeeInput, validateUserInput } = require('../utils/validation');

const resolvers = {
  Query: {
    me: async (_, __, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');
      return user;
    },

    employees: async (_, { filter, sort, first, after, last, before }, { user, dataloaders }) => {
      if (!user) throw new AuthenticationError('Not authenticated');

      // Build query
      let query = {};
      
      if (filter) {
        if (filter.name) {
          query.name = { $regex: filter.name, $options: 'i' };
        }
        if (filter.class) {
          query.class = filter.class;
        }
        if (filter.department) {
          query.department = filter.department;
        }
        if (filter.isActive !== undefined) {
          query.isActive = filter.isActive;
        }
        if (filter.ageMin || filter.ageMax) {
          query.age = {};
          if (filter.ageMin) query.age.$gte = filter.ageMin;
          if (filter.ageMax) query.age.$lte = filter.ageMax;
        }
      }

      // Role-based filtering
      if (user.role === 'EMPLOYEE') {
        // Employees can only see active employees
        query.isActive = true;
      }

      // Build sort
      let sortObj = { createdAt: -1 };
      if (sort) {
        sortObj = { [sort.field]: sort.order === 'ASC' ? 1 : -1 };
      }

      // Pagination logic
      const limit = first || last || 10;
      const maxLimit = 100;
      const actualLimit = Math.min(limit, maxLimit);

      let employees;
      let hasNextPage = false;
      let hasPreviousPage = false;

      if (after) {
        const afterEmployee = await Employee.findById(after);
        if (afterEmployee) {
          query._id = { $gt: afterEmployee._id };
        }
      }

      if (before) {
        const beforeEmployee = await Employee.findById(before);
        if (beforeEmployee) {
          query._id = { $lt: beforeEmployee._id };
        }
      }

      employees = await Employee.find(query)
        .sort(sortObj)
        .limit(actualLimit + 1)
        .populate('createdBy updatedBy');

      if (employees.length > actualLimit) {
        hasNextPage = true;
        employees = employees.slice(0, actualLimit);
      }

      const totalCount = await Employee.countDocuments(query);

      return {
        edges: employees.map(employee => ({
          node: employee,
          cursor: employee._id.toString()
        })),
        pageInfo: {
          hasNextPage,
          hasPreviousPage,
          startCursor: employees.length > 0 ? employees[0]._id.toString() : null,
          endCursor: employees.length > 0 ? employees[employees.length - 1]._id.toString() : null
        },
        totalCount
      };
    },

    employee: async (_, { id }, { user, dataloaders }) => {
      if (!user) throw new AuthenticationError('Not authenticated');

      const employee = await dataloaders.employeeLoader.load(id);
      if (!employee) throw new UserInputError('Employee not found');

      // Role-based access
      if (user.role === 'EMPLOYEE' && !employee.isActive) {
        throw new ForbiddenError('Access denied');
      }

      return employee;
    },

    employeeByEmployeeId: async (_, { employeeId }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');

      const employee = await Employee.findOne({ employeeId }).populate('createdBy updatedBy');
      if (!employee) throw new UserInputError('Employee not found');

      if (user.role === 'EMPLOYEE' && !employee.isActive) {
        throw new ForbiddenError('Access denied');
      }

      return employee;
    },

    employeeStats: async (_, __, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');
      if (user.role !== 'ADMIN') throw new ForbiddenError('Admin access required');

      const [
        totalEmployees,
        activeEmployees,
        inactiveEmployees,
        departmentStats,
        classStats,
        ageStats
      ] = await Promise.all([
        Employee.countDocuments(),
        Employee.countDocuments({ isActive: true }),
        Employee.countDocuments({ isActive: false }),
        Employee.aggregate([
          { $group: { _id: '$department', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ]),
        Employee.aggregate([
          { $group: { _id: '$class', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ]),
        Employee.aggregate([
          { $group: { _id: null, averageAge: { $avg: '$age' } } }
        ])
      ]);

      return {
        totalEmployees,
        activeEmployees,
        inactiveEmployees,
        departmentCounts: departmentStats.map(stat => ({
          department: stat._id || 'Unknown',
          count: stat.count
        })),
        classCounts: classStats.map(stat => ({
          class: stat._id || 'Unknown',
          count: stat.count
        })),
        averageAge: ageStats[0]?.averageAge || 0
      };
    },

    searchEmployees: async (_, { query, limit }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');

      const searchQuery = {
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { employeeId: { $regex: query, $options: 'i' } },
          { department: { $regex: query, $options: 'i' } },
          { class: { $regex: query, $options: 'i' } }
        ]
      };

      if (user.role === 'EMPLOYEE') {
        searchQuery.isActive = true;
      }

      return await Employee.find(searchQuery)
        .limit(limit)
        .populate('createdBy updatedBy');
    }
  },

  Mutation: {
    login: async (_, { input }) => {
      const { username, password } = input;
      
      const user = await User.findOne({ 
        $or: [{ username }, { email: username }] 
      });

      if (!user || !user.isActive) {
        throw new AuthenticationError('Invalid credentials');
      }

      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        throw new AuthenticationError('Invalid credentials');
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      const token = generateToken({ 
        userId: user._id, 
        role: user.role 
      });

      return {
        token,
        user
      };
    },

    register: async (_, { input }) => {
      const { username, email, password, role } = input;
      
      // Validate input
      const validationErrors = validateUserInput(input);
      if (validationErrors.length > 0) {
        throw new UserInputError('Validation failed', { validationErrors });
      }

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ username }, { email }]
      });

      if (existingUser) {
        throw new UserInputError('User already exists');
      }

      const user = new User({
        username,
        email,
        password,
        role
      });

      await user.save();

      const token = generateToken({ 
        userId: user._id, 
        role: user.role 
      });

      return {
        token,
        user
      };
    },

    createEmployee: async (_, { input }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');
      if (user.role !== 'ADMIN') throw new ForbiddenError('Admin access required');

      // Validate input
      const validationErrors = validateEmployeeInput(input);
      if (validationErrors.length > 0) {
        throw new UserInputError('Validation failed', { validationErrors });
      }

      // Check if employee ID already exists
      const existingEmployee = await Employee.findOne({ 
        employeeId: input.employeeId 
      });

      if (existingEmployee) {
        throw new UserInputError('Employee ID already exists');
      }

      const employee = new Employee({
        ...input,
        createdBy: user._id
      });

      await employee.save();
      await employee.populate('createdBy updatedBy');

      return employee;
    },

    updateEmployee: async (_, { id, input }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');
      if (user.role !== 'ADMIN') throw new ForbiddenError('Admin access required');

      const employee = await Employee.findById(id);
      if (!employee) throw new UserInputError('Employee not found');

      // Update fields
      Object.assign(employee, input);
      employee.updatedBy = user._id;

      await employee.save();
      await employee.populate('createdBy updatedBy');

      return employee;
    },

    deleteEmployee: async (_, { id }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');
      if (user.role !== 'ADMIN') throw new ForbiddenError('Admin access required');

      const employee = await Employee.findById(id);
      if (!employee) throw new UserInputError('Employee not found');

      await Employee.findByIdAndDelete(id);
      return true;
    },

    addAttendance: async (_, { employeeId, input }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');
      if (user.role !== 'ADMIN') throw new ForbiddenError('Admin access required');

      const employee = await Employee.findById(employeeId);
      if (!employee) throw new UserInputError('Employee not found');

      employee.attendance.push(input);
      employee.updatedBy = user._id;

      await employee.save();
      await employee.populate('createdBy updatedBy');

      return employee;
    },

    updateAttendance: async (_, { employeeId, attendanceId, input }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');
      if (user.role !== 'ADMIN') throw new ForbiddenError('Admin access required');

      const employee = await Employee.findById(employeeId);
      if (!employee) throw new UserInputError('Employee not found');

      const attendance = employee.attendance.id(attendanceId);
      if (!attendance) throw new UserInputError('Attendance record not found');

      Object.assign(attendance, input);
      employee.updatedBy = user._id;

      await employee.save();
      await employee.populate('createdBy updatedBy');

      return employee;
    }
  }
};

module.exports = resolvers;