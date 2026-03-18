// src/pages/BasePage.js
// ─────────────────────────────────────────────────────────────────────────────
// BASE PAGE — The parent class for all Page Object classes.
//
// The Page Object Model (POM) pattern separates:
//   - WHERE elements are (selectors) → defined in each Page class
//   - WHAT actions to perform       → defined as methods in each Page class
//   - WHAT to verify                → called from step definitions
//
// BasePage holds common reusable actions (click, type, wait, navigate, etc.)
// that every page will need. All other pages extend this class.
// ─────────────────────────────────────────────────────────────────────────────

class BasePage {
  /**
   * @param {import('playwright').Page} page - The Playwright page instance
   */
  constructor(page) {
    this.page = page;
  }

  // ── Navigation ────────────────────────────────────────────────────────────

  /**
   * Navigate to a URL. If a relative path is given, BASE_URL is prepended.
   * @param {string} url - Full URL or path like "/online/shop/handsets/"
   */
  async navigate(url) {
    const fullUrl = url.startsWith("http")
      ? url
      : `${process.env.BASE_URL || "https://www.spark.co.nz"}${url}`;

    console.log(`  → Navigating to: ${fullUrl}`);
    await this.page.goto(fullUrl, { waitUntil: "domcontentloaded" });
  }

  // ── Element Interactions ──────────────────────────────────────────────────

  /**
   * Click an element identified by a CSS/XPath selector.
   * Waits for the element to be visible before clicking.
   */
  async click(selector) {
    await this.page.waitForSelector(selector, { state: "visible" });
    await this.page.click(selector);
  }

  /**
   * Type text into an input field, clearing it first.
   */
  async type(selector, text) {
    await this.page.waitForSelector(selector, { state: "visible" });
    await this.page.fill(selector, text);
  }

  /**
   * Get the text content of an element.
   * @returns {Promise<string>}
   */
  async getText(selector) {
    await this.page.waitForSelector(selector, { state: "visible" });
    return await this.page.textContent(selector);
  }

  /**
   * Check if an element is visible on the page.
   * @returns {Promise<boolean>}
   */
  async isVisible(selector) {
    try {
      await this.page.waitForSelector(selector, { state: "visible", timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Wait for a specific element to appear on the page.
   */
  async waitForElement(selector, timeout = 30000) {
    await this.page.waitForSelector(selector, { state: "visible", timeout });
  }

  /**
   * Wait for the page URL to contain a specific string.
   * Useful after navigating to confirm the right page loaded.
   */
  async waitForUrl(urlPart, timeout = 30000) {
    await this.page.waitForURL(`**${urlPart}**`, { timeout });
  }

  /**
   * Scroll the page down by a given number of pixels.
   * Useful when elements are below the fold.
   */
  async scrollDown(pixels = 500) {
    await this.page.evaluate((px) => window.scrollBy(0, px), pixels);
  }

  /**
   * Scroll an element into view and click it.
   * Useful for buttons that are not in the viewport.
   */
  async scrollAndClick(selector) {
    const element = await this.page.waitForSelector(selector);
    await element.scrollIntoViewIfNeeded();
    await element.click();
  }

  /**
   * Get the current page URL.
   * @returns {string}
   */
  getCurrentUrl() {
    return this.page.url();
  }

  /**
   * Get the page title.
   * @returns {Promise<string>}
   */
  async getTitle() {
    return await this.page.title();
  }

  /**
   * Wait for network to settle (no pending requests for 500ms).
   * Useful after button clicks that trigger API calls.
   */
  async waitForNetworkIdle(timeout = 15000) {
    await this.page.waitForLoadState("networkidle", { timeout });
  }

  /**
   * Accept a cookie consent banner if it's present.
   * Many sites show these on first visit.
   */
  async acceptCookiesIfPresent() {
    const cookieSelectors = [
      "button:has-text('Accept')",
      "button:has-text('Accept all')",
      "button:has-text('I agree')",
      "[data-testid='cookie-accept']",
      "#onetrust-accept-btn-handler"
    ];

    for (const selector of cookieSelectors) {
      try {
        const el = await this.page.$(selector);
        if (el && (await el.isVisible())) {
          await el.click();
          console.log("  ✓ Cookie banner dismissed");
          return;
        }
      } catch {
        // Selector didn't match — try next one
      }
    }
  }
}

module.exports = BasePage;
