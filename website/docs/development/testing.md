---
sidebar_position: 3
---

# Testing

![duplistatus](//img/duplistatus_banner.png)

Testing procedures and best practices for duplistatus development.

## Overview

duplistatus uses a comprehensive testing strategy including unit tests, integration tests, and end-to-end tests.

## Test Structure

```
tests/
├── unit/                 # Unit tests
├── integration/          # Integration tests
├── e2e/                 # End-to-end tests
├── fixtures/            # Test data and fixtures
└── helpers/             # Test utilities and helpers
```

## Running Tests

### All Tests
```bash
pnpm test
```

### Unit Tests Only
```bash
pnpm test:unit
```

### Integration Tests Only
```bash
pnpm test:integration
```

### End-to-End Tests Only
```bash
pnpm test:e2e
```

### Watch Mode
```bash
pnpm test:watch
```

### Coverage Report
```bash
pnpm test:coverage
```

## Unit Testing

### Test Framework
- **Jest**: Test runner and assertion library
- **React Testing Library**: Component testing
- **MSW**: API mocking

### Example Unit Test
```javascript
import { render, screen } from '@testing-library/react';
import { ServerCard } from '../components/ServerCard';

describe('ServerCard', () => {
  it('displays server information correctly', () => {
    const server = {
      id: 1,
      name: 'test-server',
      alias: 'Test Server',
      status: 'success'
    };

    render(<ServerCard server={server} />);
    
    expect(screen.getByText('Test Server')).toBeInTheDocument();
    expect(screen.getByText('test-server')).toBeInTheDocument();
  });
});
```

### Testing Components
```javascript
import { render, fireEvent } from '@testing-library/react';
import { NotificationSettings } from '../components/NotificationSettings';

describe('NotificationSettings', () => {
  it('updates notification preferences', () => {
    const mockOnUpdate = jest.fn();
    render(<NotificationSettings onUpdate={mockOnUpdate} />);
    
    const toggle = screen.getByRole('checkbox');
    fireEvent.click(toggle);
    
    expect(mockOnUpdate).toHaveBeenCalledWith({ enabled: true });
  });
});
```

## Integration Testing

### API Testing
```javascript
import request from 'supertest';
import { app } from '../app';

describe('API Endpoints', () => {
  it('GET /api/servers returns server list', async () => {
    const response = await request(app)
      .get('/api/servers')
      .expect(200);
    
    expect(response.body.status).toBe('success');
    expect(Array.isArray(response.body.data)).toBe(true);
  });
});
```

### Database Testing
```javascript
import { Database } from '../lib/database';

describe('Database Operations', () => {
  beforeEach(async () => {
    await Database.initialize(':memory:');
  });

  afterEach(async () => {
    await Database.close();
  });

  it('creates and retrieves server', async () => {
    const server = await Database.createServer({
      name: 'test-server',
      alias: 'Test Server'
    });
    
    const retrieved = await Database.getServer(server.id);
    expect(retrieved.name).toBe('test-server');
  });
});
```

## End-to-End Testing

### Playwright Setup
```javascript
import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test('displays server information', async ({ page }) => {
    await page.goto('http://localhost:8666');
    
    await expect(page.locator('[data-testid="server-card"]')).toBeVisible();
    await expect(page.locator('text=Test Server')).toBeVisible();
  });
});
```

### User Workflows
```javascript
test.describe('User Workflows', () => {
  test('complete backup monitoring workflow', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('http://localhost:8666');
    
    // Check server status
    await expect(page.locator('[data-testid="server-status"]')).toBeVisible();
    
    // Navigate to server details
    await page.click('[data-testid="server-card"]');
    await expect(page.locator('[data-testid="server-details"]')).toBeVisible();
    
    // Check backup history
    await expect(page.locator('[data-testid="backup-history"]')).toBeVisible();
  });
});
```

## Test Data Management

### Fixtures
```javascript
// tests/fixtures/servers.js
export const mockServers = [
  {
    id: 1,
    name: 'server-01',
    alias: 'Production Server',
    status: 'success'
  },
  {
    id: 2,
    name: 'server-02',
    alias: 'Development Server',
    status: 'warning'
  }
];
```

### Mock Data
```javascript
// tests/mocks/api.js
import { rest } from 'msw';

export const handlers = [
  rest.get('/api/servers', (req, res, ctx) => {
    return res(
      ctx.json({
        status: 'success',
        data: mockServers
      })
    );
  })
];
```

## Test Configuration

### Jest Configuration
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts'
  ]
};
```

### Playwright Configuration
```javascript
// playwright.config.js
module.exports = {
  testDir: './tests/e2e',
  use: {
    baseURL: 'http://localhost:8666',
    trace: 'on-first-retry'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ]
};
```

## Testing Best Practices

### Test Organization
- Group related tests in describe blocks
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Keep tests focused and independent

### Mocking
- Mock external dependencies
- Use MSW for API mocking
- Mock time-dependent functions
- Avoid over-mocking

### Assertions
- Use specific assertions
- Test behavior, not implementation
- Include edge cases
- Test error conditions

### Performance
- Keep tests fast
- Use parallel execution
- Optimize test data
- Clean up resources

## Continuous Integration

### GitHub Actions
```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: pnpm install
      - run: pnpm test
      - run: pnpm test:coverage
```

### Test Reports
- Coverage reports in CI
- Test result summaries
- Performance benchmarks
- Flaky test detection

## Debugging Tests

### Debug Mode
```bash
# Debug Jest tests
node --inspect-brk node_modules/.bin/jest --runInBand

# Debug Playwright tests
npx playwright test --debug
```

### Test Logging
```javascript
// Enable debug logging
process.env.DEBUG = 'duplistatus:*';

// Use console.log for debugging
console.log('Test data:', testData);
```

### Common Issues
- **Async operations**: Use proper async/await
- **Timing issues**: Use waitFor and timeouts
- **State management**: Reset state between tests
- **Environment variables**: Set test environment

## Test Maintenance

### Regular Updates
- Update test dependencies
- Review and refactor tests
- Remove obsolete tests
- Update test documentation

### Quality Metrics
- Test coverage targets
- Test execution time
- Flaky test rate
- Test maintenance effort

## Getting Help

### Resources
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [MSW Documentation](https://mswjs.io/docs/)

### Community
- GitHub Issues for test-related questions
- Community discussions
- Code review feedback
- Pair programming sessions
