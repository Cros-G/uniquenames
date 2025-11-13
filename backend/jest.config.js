export default {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    '*.js',
    'prompts/*.js',
    'models/*.js',
    'controllers/*.js',
    '!jest.config.js',
    '!coverage/**'
  ],
  testMatch: [
    '**/tests/**/*.test.js'
  ],
  verbose: true,
  transform: {},
  maxWorkers: 1, // 串行运行测试，避免数据库冲突
};

