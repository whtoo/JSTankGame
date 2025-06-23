module.exports = {
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
  },
  moduleFileExtensions: ['js', 'jsx'],
  // Comments about ES6 modules and Babel setup are still relevant.
  // babel-jest handles the transformation of test files and source files based on babel.config.json.

  // To handle static asset imports like images and CSS:
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/__mocks__/fileMock.js',
    '\\.(css|less)$': '<rootDir>/__mocks__/styleMock.js',
  },
  // Indicates whether each individual test should be reported during the run.
  verbose: true,
  // The test environment that will be used for testing.
  testEnvironment: 'jsdom', // Using jsdom to simulate a browser environment
};
