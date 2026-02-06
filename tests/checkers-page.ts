import { expect, type Locator, type Page } from '@playwright/test';

export class CheckersPage {
  readonly page: Page;

  readonly relativeUrl: string = '/game/checkers';
  readonly darkSquareImgSrc: string = 'black.gif';
  readonly lightSquareImgSrc = 'gray.gif';
  readonly orangePieceImgSrc = 'you1.gif';
  readonly selectedOrangePieceImgSrc = 'you2.gif';
  readonly bluePieceImgSrc = 'me1.gif';
  readonly selectedBluePieceImgSrc = 'me2.gif';

  // element locators
  readonly checkersHeader: Locator;
  readonly messageElement: Locator;
  readonly restartLink: Locator;
  readonly rulesLink: Locator;
  readonly gameBoardElement: Locator;

  constructor(page: Page) {
    this.page = page;

    // static elements
    this.checkersHeader = page.getByRole('heading', { name: 'checkers' });
    this.messageElement = page.locator('#message');
    this.restartLink = page.getByRole('link', { name: 'restart' });
    this.rulesLink = page.getByRole('link', { name: 'rules' });

    this.gameBoardElement = page.locator('#board');
  }

  private async getImageAtCoordinates(
    col: number,
    row: number
  ): Promise<string | null> {
    const squareLocator = this.gameBoardElement.locator(
      `css=[name="space${col}${row}"]`
    );

    return await squareLocator.getAttribute('src');
  }

  private async waitForImageAtCoordinates(
    col: number,
    row: number,
    expectedSrc: string
  ) {
    const squareLocator = this.gameBoardElement.locator(
      `css=[name="space${col}${row}"]`
    );

    await expect(squareLocator).toHaveAttribute('src', expectedSrc);
  }

  /**
   * Checks that all dark squares are empty (i.e., have the correct background
   * image). This is used to verify that no pieces are illegally placed.
   */
  private async expectAllDarkSquaresAreEmpty() {
    for (let row = 0; row < 8; row++) {
      // even row - dark squares in odd colums
      // odd row - dark squares in even columns
      const darkSquareCols: number[] =
        row % 2 === 0 ? [1, 3, 5, 7] : [0, 2, 4, 6];

      for (const col of darkSquareCols) {
        // don't need to await expected attribute - dark squares can't change
        const imgSrc = await this.getImageAtCoordinates(col, row);
        expect(imgSrc).toBe(this.darkSquareImgSrc);
      }
    }
  }

  private async expectRowHasNoPieces(row: number) {
    // even row - light squares at even columns
    // odd row - light squares at odd columns
    const lightSquareCols: number[] =
      row % 2 === 0 ? [0, 2, 4, 6] : [1, 3, 5, 7];

    for (const col of lightSquareCols) {
      await this.waitForImageAtCoordinates(col, row, this.lightSquareImgSrc);
    }
  }

  async goto() {
    await this.page.goto(this.relativeUrl, {
      timeout: 15_000,
      waitUntil: 'domcontentloaded',
    });
  }

  /**
   * Waits for the checkers page to load by verifying the presence of key
   * elements and the initial message text. This ensures that the page is fully
   * loaded and ready for interaction before proceeding with further tests.
   */
  async waitForPage() {
    // wait for static elements
    await expect(this.checkersHeader).toBeVisible();
    await expect(this.restartLink).toBeVisible();
    await expect(this.rulesLink).toBeVisible();

    // wait for initial message
    await expect(this.messageElement).toBeVisible();
    await expect(this.messageElement).toContainText(
      'select an orange piece to move',
      { ignoreCase: true }
    );

    await expect(this.gameBoardElement).toBeVisible();
  }

  /**
   * The board is an 8x8 grid. Upon game start, there are 12 orange pieces
   * (us) and 12 blue pieces (opponent) in a certain formation. Coordinates
   * consist of (col, row), with (0, 0) starting in the bottom right corner.
   * With this system in mind, the initial state consists of 4 orange pieces
   * in rows 0, 1, and 2; and 4 blue pieces in rows 5, 6, and 7. Each square
   * in a row alternates between light and dark, with (0, 0) and (7, 7) both
   * being light.
   *
   * This function verifies that the current board state matches the expected
   * initial state described above, and that no pieces are currently selected.
   */
  async waitForInitialBoardState() {
    await this.expectAllDarkSquaresAreEmpty();

    for (const row of [0, 1, 2]) {
      const lightSquareCols: number[] =
        row % 2 === 0 ? [0, 2, 4, 6] : [1, 3, 5, 7];

      for (const col of lightSquareCols) {
        await this.waitForImageAtCoordinates(col, row, this.orangePieceImgSrc);
      }
    }

    await this.expectRowHasNoPieces(3);
    await this.expectRowHasNoPieces(4);

    for (const row of [5, 6, 7]) {
      const lightSquareCols: number[] =
        row % 2 === 0 ? [0, 2, 4, 6] : [1, 3, 5, 7];

      for (const col of lightSquareCols) {
        await this.waitForImageAtCoordinates(col, row, this.bluePieceImgSrc);
      }
    }
  }
}
