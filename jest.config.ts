/* cspell:ignore lcov */
/* eslint-disable import/no-default-export */

import type { Config } from '@jest/types'

const configuration: Config.InitialOptions = {
  cacheDirectory: '<rootDir>/.cache/jest',
  coveragePathIgnorePatterns: ['/__fixtures__/', '/node_modules/', '/test/'],
  coverageProvider: 'babel',
  coverageReporters: ['lcov', 'text', 'text-summary'],
  injectGlobals: true,
  logHeapUsage: true,
  restoreMocks: false,
  roots: ['<rootDir>/src'],
  testEnvironment: 'node',
}

export default configuration
