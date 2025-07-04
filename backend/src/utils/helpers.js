const { GraphQLScalarType } = require('graphql');
const { Kind } = require('graphql/language');

const DateType = new GraphQLScalarType({
  name: 'Date',
  serialize: (value) => value.toISOString(),
  parseValue: (value) => new Date(value),
  parseLiteral: (ast) => {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    return null;
  }
});

const formatError = (error) => {
  console.error('GraphQL Error:', error);
  
  // Don't expose internal errors in production
  if (process.env.NODE_ENV === 'production') {
    if (error.message.includes('duplicate key')) {
      return new Error('Duplicate entry found');
    }
    if (error.message.includes('validation')) {
      return new Error('Invalid input data');
    }
  }
  
  return error;
};

module.exports = {
  DateType,
  formatError
};