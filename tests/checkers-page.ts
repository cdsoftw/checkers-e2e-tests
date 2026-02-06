import { expect, type Locator, type Page } from '@playwright/test';

export class CheckersPage {
  readonly page: Page;
  private readonly relativeUrl: string = '/game/checkers';

  // constants
  readonly lightSquareImgSrc: string = 'gray.gif';
  readonly darkSquareImgSrc: string = 'black.gif';
  readonly orangePieceImgSrc: string = 'you1.gif';
  readonly selectedOrangePieceImgSrc: string = 'you2.gif';
  readonly bluePieceImgSrc: string = 'me1.gif';
  readonly selectedBluePieceImgSrc: string = 'me2.gif';
  readonly initialPieceCount: number = 12; // (for each color)

  // locators
  readonly checkersHeader: Locator;
  readonly messageElement: Locator;
  readonly restartLink: Locator;
  readonly rulesLink: Locator;
  readonly gameBoardElement: Locator;

  constructor(page: Page) {
    this.page = page;

    this.checkersHeader = page
      .getByRole('heading')
      .filter({ hasText: 'checkers' });

    this.messageElement = page.locator('#message');
    this.restartLink = page.getByRole('link', { name: 'restart' });
    this.rulesLink = page.getByRole('link', { name: 'rules' });
    this.gameBoardElement = page.locator('#board');
  }

  /** helper functions **/

  async waitForImageAtCoordinates(
    col: number,
    row: number,
    expectedSrc: string
  ) {
    const squareLocator = this.gameBoardElement.locator(
      `css=[name="space${col}${row}"]`
    );

    await expect(squareLocator).toHaveAttribute('src', new RegExp(expectedSrc));
  }

  getLocatorByImageSrc(imageSrc: string): Locator {
    return this.gameBoardElement.locator(`css=[src*="${imageSrc}"]`);
  }

  private async waitForMessageText(expectedText: string) {
    await expect(this.messageElement).toBeVisible();
    await expect(this.messageElement).toContainText(expectedText, {
      ignoreCase: true,
    });
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
        await this.waitForImageAtCoordinates(col, row, this.darkSquareImgSrc);
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

  async clickSquareAtCoordinates(col: number, row: number) {
    const squareLocator = this.gameBoardElement.locator(
      `css=[name="space${col}${row}"]`
    );

    await squareLocator.click();
  }

  /** test methods **/

  async goto() {
    console.log('Navigating to Checkers page...');

    await this.page.goto(this.relativeUrl, {
      timeout: 15_000,
      waitUntil: 'domcontentloaded',
    });

    console.log(`Current URL: ${this.page.url()}`);
  }

  /**
   * Waits for the checkers page to load by verifying the presence of key
   * elements and the initial message text. This ensures that the page is fully
   * loaded and ready for interaction before proceeding with further tests.
   */
  async waitForPage() {
    console.log('Waiting for Checkers page to load...');

    // wait for static elements
    await expect(this.checkersHeader).toBeVisible();
    await expect(this.restartLink).toBeVisible();
    await expect(this.rulesLink).toBeVisible();

    // game board and piece counts
    await expect(this.gameBoardElement).toBeVisible();
    await expect(this.getLocatorByImageSrc(this.orangePieceImgSrc)).toHaveCount(
      this.initialPieceCount
    );
    await expect(this.getLocatorByImageSrc(this.bluePieceImgSrc)).toHaveCount(
      this.initialPieceCount
    );

    // wait for initial message
    await this.waitForMessageText('select an orange piece to move');

    console.log('Page loaded.');
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
    console.log('Waiting for initial game board state...');
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

  /**
   * Moves a piece from one square to another by clicking the appropriate
   * squares in sequence and waiting for the expected changes to occur.
   * This function assumes that the move being made is valid (i.e., it's
   * the player's turn, the endPos is forwards + diagonal, etc.).
   * @param startPos object containing (col, row) coords of desired piece
   * @param endPos object containing (col, row) coords for the new location
   */
  async makeValidMove(
    startPos: { col: number; row: number },
    endPos: { col: number; row: number }
  ) {
    console.log(
      `Moving piece from space${startPos.col}${startPos.row} to ` +
        `space${endPos.col}${endPos.row})...`
    );

    // ensure starting square contains our piece
    await this.waitForImageAtCoordinates(
      startPos.col,
      startPos.row,
      this.orangePieceImgSrc
    );

    // and that ending square is empty + not dark
    await this.waitForImageAtCoordinates(
      endPos.col,
      endPos.row,
      this.lightSquareImgSrc
    );

    // click initial square and wait for piece to be selected
    await this.clickSquareAtCoordinates(startPos.col, startPos.row);
    await this.waitForImageAtCoordinates(
      startPos.col,
      startPos.row,
      this.selectedOrangePieceImgSrc
    );

    // click new square and wait for piece to move
    await this.clickSquareAtCoordinates(endPos.col, endPos.row);
    await this.waitForImageAtCoordinates(
      endPos.col,
      endPos.row,
      this.selectedOrangePieceImgSrc
    );

    // not waiting for piece to be deselected because opponent moves
    // immediately after, so they could capture it before the assertion

    // old square should now be empty
    // TODO: might need to remove this - sometimes causes synchronization flake
    // by being too late to find selected blue piece (move already completed)
    await this.waitForImageAtCoordinates(
      startPos.col,
      startPos.row,
      this.lightSquareImgSrc
    );
  }

  /**
   * Waits for the opponent's turn to complete - first, by waiting for the
   * selected version of the blue piece to both appear and disappear (takes
   * 1-2 seconds), and then for the regular piece to reappear. Finally, we
   * wait for the message text to signify that it's our turn.
   * @param bluePieceCount the count of blue pieces after the previous move.
   * Defaults to 12 (initial count).
   */
  async waitForOpponentMove(bluePieceCount: number = this.initialPieceCount) {
    console.log('Waiting for opponent to move...');

    // opponent selects piece
    // (only present for 1-2 seconds)
    await expect(
      this.getLocatorByImageSrc(this.selectedBluePieceImgSrc)
    ).toBeVisible();

    // move is complete when selected piece disappears
    await expect(
      this.getLocatorByImageSrc(this.selectedBluePieceImgSrc)
    ).not.toBeVisible();

    // count of regular blue pieces returns to expected value
    await expect(this.getLocatorByImageSrc(this.bluePieceImgSrc)).toHaveCount(
      bluePieceCount
    );

    // wait for message to signify that it's our turn again
    await this.waitForMessageText('make a move');

    // (somewhat) confirms opponent move was legal
    await this.expectAllDarkSquaresAreEmpty();

    console.log('Opponent move is complete.');
  }
}
