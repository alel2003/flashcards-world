module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleNameMapper: {
      '^@user/(.*)$': '<rootDir>/src/module/user/$1',
      '^@user$': '<rootDir>/src/module/user',
      
      '^@auth/(.*)$': '<rootDir>/src/module/auth/$1',
      '^@auth$': '<rootDir>/src/module/auth',
      
      '^@card/(.*)$': '<rootDir>/src/module/card/$1',
      '^@card$': '<rootDir>/src/module/card',
      
      '^@guards/(.*)$': '<rootDir>/src/common/guards/$1',
      '^@guards$': '<rootDir>/src/common/guards',
      
      '^@decorators/(.*)$': '<rootDir>/src/common/decorators/$1',
      '^@decorators$': '<rootDir>/src/common/decorators',

      '^src/(.*)$': '<rootDir>/src/$1'
    },
    moduleFileExtensions: ['ts', 'js', 'json'],
    transform: {
      '^.+\\.(ts|tsx)$': 'ts-jest',
    },
  };
  