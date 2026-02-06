# Checkers - E2E Tests
## [Cole Dapprich](https://www.linkedin.com/in/cdsoft/)

This repository contains a detailed end-to-end test plan for a simple browser-based [checkers game](https://www.gamesforthebrain.com/game/checkers/). It also contains a skeleton test codebase in Playwright for Node.js and TypeScript, as well as a few test cases created within a 30-45 minute window.

### [E2E Test Plan](./TestPlan.md)

###### Created for a technical interview at a leading defense startup.

---

### Running E2E tests
After ensuring Node.js is installed, install Playwright and all dependencies with `npm ci`. Then install the latest Playwright browsers by running:
```shell
npx playwright install
```

After doing so, you can run tests via either the [VS Code extension](https://playwright.dev/docs/next/running-tests#run-tests-in-vs-code), or a variety of commands:
* `npx playwright test`
* `npx playwright test --ui`
* `npx playwright test --headed`

To specify browsers:
```shell
npx playwright test --project firefox --project [ANOTHER_BROWSER]
```

For more info, see the [Playwright docs](https://playwright.dev/docs/next/running-tests).
