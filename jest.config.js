export default {
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
  },
  moduleFileExtensions: ['js', 'jsx'],
  // Jest by default has some trouble with ES6 modules.
  // The following helps Jest understand ES6 modules.
  // This specific setup might need adjustment based on Babel config and project structure.
  // For Babel 7+ with ESM support, ensuring Babel compiles modules to CommonJS for Jest
  // or using experimental ESM support in Jest are options.
  // Babel-jest should handle this if babel.config.json is set up for CJS in test env.
  // Alternatively, Node's experimental ESM support can be enabled:
  // "test": "node --experimental-vm-modules node_modules/jest/bin/jest.js"
  // For now, relying on babel-jest and ensuring babel.config.json is appropriate.
  // If there are issues, we might need to adjust babel.config.json or this Jest config.

  // To handle `import tankbrigade from '../../resources/tankbrigade.png';`
  // We need a moduleNameMapper to stub these static assets.
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/__mocks__/fileMock.js',
    '\\.(css|less)$': '<rootDir>/__mocks__/styleMock.js',
  },
  // Indicates whether each individual test should be reported during the run.
  verbose: true,
  // The test environment that will be used for testing.
  testEnvironment: 'jsdom', // Using jsdom to simulate a browser environment for DOM-related tests
};
