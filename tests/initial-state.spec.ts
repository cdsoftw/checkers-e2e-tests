import { test } from '@playwright/test';
import { CheckersPage } from './checkers-page';

test('checkers page should load with initial game state', async ({ page }) => {
  const checkersPage = new CheckersPage(page);
  await checkersPage.goto();
  await checkersPage.waitForPage();
  await checkersPage.waitForInitialBoardState();
});
