import { test as base } from '@playwright/test';
import { CheckersPage } from './checkers-page';

// extend base test by providing checkersPage fixture
// this new "test" can then be used in multiple spec files
export const test = base.extend<{ checkersPage: CheckersPage }>({
  checkersPage: async ({ page }, use) => {
    // set up fixture
    const checkersPage = new CheckersPage(page);
    await checkersPage.goto();
    await checkersPage.waitForPage();
    await checkersPage.waitForInitialBoardState();

    // use fixture value in the test
    await use(checkersPage);
  },
});

export { expect } from '@playwright/test';
