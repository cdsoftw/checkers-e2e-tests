import { test } from '@playwright/test';
import { CheckersPage } from './checkers-page';

test('visiting checkers page should load initial game state', async ({
  page,
}) => {
  const checkersPage = new CheckersPage(page);
  await checkersPage.goto();
  await checkersPage.waitForPage();
  console.log('Page loaded.');
  await checkersPage.waitForInitialBoardState();
});
