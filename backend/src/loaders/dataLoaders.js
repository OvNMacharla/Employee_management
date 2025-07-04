const DataLoader = require('dataloader');
const Employee = require('../models/Employee');
const User = require('../models/User');

const createDataLoaders = () => {
  const employeeLoader = new DataLoader(async (ids) => {
    const employees = await Employee.find({ _id: { $in: ids } })
      .populate('createdBy updatedBy');
    
    // Return employees in the same order as requested IDs
    return ids.map(id => employees.find(emp => emp._id.toString() === id.toString()));
  });

  const userLoader = new DataLoader(async (ids) => {
    const users = await User.find({ _id: { $in: ids } });
    return ids.map(id => users.find(user => user._id.toString() === id.toString()));
  });

  return {
    employeeLoader,
    userLoader
  };
};

module.exports = createDataLoaders;