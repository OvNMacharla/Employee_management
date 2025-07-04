const validateUserInput = (input) => {
  const errors = [];

  if (!input.username || input.username.length < 3) {
    errors.push('Username must be at least 3 characters long');
  }

  if (!input.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
    errors.push('Valid email is required');
  }

  if (!input.password || input.password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  return errors;
};

const validateEmployeeInput = (input) => {
  const errors = [];

  if (!input.employeeId || input.employeeId.length < 1) {
    errors.push('Employee ID is required');
  }

  if (!input.name || input.name.length < 2) {
    errors.push('Name must be at least 2 characters long');
  }

  if (!input.age || input.age < 18 || input.age > 100) {
    errors.push('Age must be between 18 and 100');
  }

  if (!input.class || input.class.length < 1) {
    errors.push('Class is required');
  }

  if (!input.subjects || input.subjects.length === 0) {
    errors.push('At least one subject is required');
  }

  return errors;
};

module.exports = {
  validateUserInput,
  validateEmployeeInput
};