import { test } from '@playwright/test';
import { CheckersPage } from './checkers-page';

test('checkers page should load with initial game state', async ({ page }) => {
  // arrange
  const checkersPage = new CheckersPage(page);

  // act
  await checkersPage.goto();

  // assert
  await checkersPage.waitForPage();
  await checkersPage.waitForInitialBoardState();
});
