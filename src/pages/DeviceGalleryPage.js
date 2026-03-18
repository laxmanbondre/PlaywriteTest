// src/pages/DeviceGalleryPage.js
// ─────────────────────────────────────────────────────────────────────────────
// DEVICE GALLERY PAGE — Page Object for the handset listing page.
// URL: https://www.spark.co.nz/online/shop/handsets/
//
// This class encapsulates:
//   1. All CSS selectors for elements on the gallery page
//   2. All actions a user can perform on this page
//   3. All assertions/verifications for this page
//
// Step definitions will call methods from this class, keeping test logic
// out of the feature files and step files clean and readable.
// ─────────────────────────────────────────────────────────────────────────────

const BasePage = require("./BasePage");

class DeviceGalleryPage extends BasePage {
  constructor(page) {
    super(page);

    // ── Selectors ──────────────────────────────────────────────────────────
    // Centralise all selectors here. If the site changes a class name,
    // you only need to update it in ONE place — not across many test files.

    // The URL path for this page
    this.pageUrl = "/online/shop/handsets/";

    // The heading that confirms we are on the gallery page
    this.pageHeading = "h1, h2";

    // Each product card in the gallery — links wrapping product images & names
    // Spark renders devices as anchor tags; we target the product link containers
    this.deviceCards = "a[href*='/online/shop/products/']";

    // The product name text inside each card
    this.deviceCardName = "a[href*='/online/shop/products/'] img";

    // Filter controls (Brand, Colour, etc.)
    this.filterSection = "section, [class*='filter'], [data-testid*='filter']";

    // Sort dropdown (e.g., "Featured first")
    this.sortDropdown = "select, [class*='sort'], button:has-text('Featured')";

    // Loading spinner (appears while products load)
    this.loadingSpinner = "[class*='loading'], [class*='spinner']";
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  /**
   * Navigate to the Device Gallery page.
   */
  async open() {
    await this.navigate(this.pageUrl);
    await this.waitForGalleryToLoad();
    await this.acceptCookiesIfPresent();
  }

  /**
   * Wait for at least one device card to be visible.
   * This confirms the gallery has loaded its products.
   */
  async waitForGalleryToLoad() {
    console.log("  ⏳ Waiting for device gallery to load...");
    await this.page.waitForSelector(this.deviceCards, {
      state: "visible",
      timeout: 30000
    });
    console.log("  ✓ Gallery loaded");
  }

  /**
   * Get all device cards currently visible on the page.
   * @returns {Promise<import('playwright').ElementHandle[]>}
   */
  async getAllDeviceCards() {
    return await this.page.$$(this.deviceCards);
  }

  /**
   * Get the count of device cards visible on the page.
   * @returns {Promise<number>}
   */
  async getDeviceCount() {
    const cards = await this.getAllDeviceCards();
    return cards.length;
  }

  /**
   * Click on a specific device by its name (case-insensitive partial match).
   * This navigates to the device's PDP (Product Detail Page).
   *
   * @param {string} deviceName - e.g., "iPhone 17", "Samsung Galaxy S26"
   */
  async clickDeviceByName(deviceName) {
    console.log(`  → Searching for device: "${deviceName}"`);

    // Find a link whose href contains a slug matching the device name
    // Playwright's :has-text() pseudo-class searches text content
    // We also try matching via the alt text of product images
    const selectors = [
      `a[href*='/online/shop/products/']:has(img[alt*='${deviceName}'])`,
      `a[href*='/online/shop/products/']:has-text('${deviceName}')`,
      `a[href*='${deviceName.toLowerCase().replace(/\s+/g, "-")}']`
    ];

    for (const selector of selectors) {
      try {
        const el = await this.page.$(selector);
        if (el && (await el.isVisible())) {
          console.log(`  ✓ Found device with selector: ${selector}`);
          await el.scrollIntoViewIfNeeded();
          await el.click();
          return;
        }
      } catch {
        // Try next selector
      }
    }

    throw new Error(
      `❌ Could not find device "${deviceName}" on the gallery page. ` +
      `Check the device name or update the selector.`
    );
  }

  /**
   * Click on the FIRST device card in the gallery.
   * Useful when you don't care which specific device is selected.
   */
  async clickFirstDevice() {
    console.log("  → Clicking first device in gallery");
    const cards = await this.getAllDeviceCards();

    if (cards.length === 0) {
      throw new Error("❌ No device cards found on the gallery page");
    }

    await cards[0].scrollIntoViewIfNeeded();
    await cards[0].click();
    console.log("  ✓ Clicked first device");
  }

  /**
   * Click on a device at a specific position (1-based index).
   * @param {number} position - 1 = first, 2 = second, etc.
   */
  async clickDeviceAtPosition(position) {
    console.log(`  → Clicking device at position ${position}`);
    const cards = await this.getAllDeviceCards();

    if (position > cards.length) {
      throw new Error(
        `❌ Position ${position} is out of range. Only ${cards.length} devices visible.`
      );
    }

    await cards[position - 1].scrollIntoViewIfNeeded();
    await cards[position - 1].click();
    console.log(`  ✓ Clicked device at position ${position}`);
  }

  // ── Assertions (Verifications) ────────────────────────────────────────────

  /**
   * Verify the gallery page is displayed.
   * @returns {Promise<boolean>}
   */
  async isGalleryPageDisplayed() {
    const url = this.getCurrentUrl();
    return url.includes("/shop/") || url.includes("handset");
  }

  /**
   * Verify that at least minCount devices are shown.
   * @param {number} minCount
   */
  async verifyMinimumDevicesShown(minCount = 1) {
    const count = await this.getDeviceCount();
    console.log(`  ✓ Found ${count} devices on the gallery page`);

    if (count < minCount) {
      throw new Error(
        `❌ Expected at least ${minCount} devices, but found ${count}`
      );
    }

    return count;
  }
}

module.exports = DeviceGalleryPage;
