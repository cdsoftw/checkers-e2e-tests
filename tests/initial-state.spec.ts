import { test } from '@playwright/test';
import { CheckersPage } from './checkers-page';

test('visiting checkers page should load initial game state', async ({
  page,
}) => {
  const checkersPage = new CheckersPage(page);
  console.log('Navigating to checkers page...');
  await checkersPage.goto();
  console.log('Page loaded, waiting for initial board state...');
  await checkersPage.waitForPage();
  await checkersPage.waitForInitialBoardState();
});
