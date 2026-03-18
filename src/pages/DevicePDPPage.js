// src/pages/DevicePDPPage.js
// ─────────────────────────────────────────────────────────────────────────────
// DEVICE PDP PAGE — Page Object for the Product Detail Page (PDP).
//
// When a user clicks a device on the gallery, they land here.
// This page shows: device name, images, price, storage/colour options,
// plan selection, and the "Add to cart" button.
//
// Spark NZ's PDP URL pattern:
//   /online/shop/products/iphone-17-group/?offerId=...&planId=...
// ─────────────────────────────────────────────────────────────────────────────

const BasePage = require("./BasePage");

class DevicePDPPage extends BasePage {
  constructor(page) {
    super(page);

    // ── Selectors ──────────────────────────────────────────────────────────

    // Device name/title at the top of the PDP
    // Spark uses h1 for the product title
    this.deviceTitle = "h1, [class*='product-name'], [class*='device-name']";

    // Product images carousel / main image
    this.productImage = "img[class*='product'], img[alt*='iPhone'], img[alt*='Samsung'], img[alt*='phone']";

    // Storage option buttons (e.g., 128GB, 256GB, 512GB)
    this.storageOptions = "[class*='storage'], [class*='capacity'], button:has-text('GB')";

    // Colour swatch buttons
    this.colourOptions = "[class*='colour'], [class*='color'], [class*='swatch']";

    // Plan cards shown on the PDP (monthly price plans)
    this.planCards = "[class*='plan-card'], [class*='plan'], [data-testid*='plan']";

    // The price display on the PDP
    this.priceDisplay = "[class*='price'], [class*='monthly'], h2, h3";

    // "Add to Cart" / "Get this deal" primary CTA button
    // Spark may use different button text — we handle multiple possibilities
    this.addToCartButton = [
      "button:has-text('Add to cart')",
      "button:has-text('Get this deal')",
      "button:has-text('Choose this plan')",
      "button:has-text('Add to bag')",
      "a:has-text('Add to cart')",
      "[data-testid*='add-to-cart']"
    ].join(", ");

    // The "View cart" / cart confirmation element after adding
    this.cartConfirmation = [
      "[class*='cart-notification']",
      "[class*='added-to-cart']",
      "button:has-text('View cart')",
      "a:has-text('View cart')",
      "[class*='basket']"
    ].join(", ");

    // Breadcrumb navigation
    this.breadcrumb = "[class*='breadcrumb'], nav[aria-label*='breadcrumb']";
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  /**
   * Wait for the PDP to fully load.
   * We wait for either the product title or the add-to-cart button.
   */
  async waitForPDPToLoad() {
    console.log("  ⏳ Waiting for PDP to load...");

    try {
      // Wait for the page URL to look like a product page
      await this.page.waitForURL("**/products/**", { timeout: 15000 });
    } catch {
      // URL might not match exactly — continue and check elements
    }

    // Wait for the main content to appear
    await this.page.waitForLoadState("domcontentloaded");
    console.log("  ✓ PDP loaded");
  }

  /**
   * Get the device title text from the PDP.
   * @returns {Promise<string>}
   */
  async getDeviceTitle() {
    try {
      await this.page.waitForSelector(this.deviceTitle, {
        state: "visible",
        timeout: 10000
      });
      const title = await this.page.textContent(this.deviceTitle);
      return title?.trim() || "";
    } catch {
      // If no specific title element found, return the page title
      return await this.getTitle();
    }
  }

  /**
   * Select a storage option by its label (e.g., "256GB").
   * @param {string} storage - e.g., "128GB", "256GB", "512GB"
   */
  async selectStorage(storage) {
    console.log(`  → Selecting storage: ${storage}`);

    const selector = `button:has-text('${storage}'), [aria-label*='${storage}'], label:has-text('${storage}')`;

    try {
      await this.page.waitForSelector(selector, { state: "visible", timeout: 5000 });
      await this.page.click(selector);
      console.log(`  ✓ Selected storage: ${storage}`);
    } catch {
      console.log(`  ⚠️  Storage option "${storage}" not found — skipping`);
    }
  }

  /**
   * Select a colour option by its label.
   * @param {string} colour - e.g., "Black", "White", "Blue"
   */
  async selectColour(colour) {
    console.log(`  → Selecting colour: ${colour}`);

    const selector = [
      `[aria-label*='${colour}']`,
      `button:has-text('${colour}')`,
      `[title*='${colour}']`,
      `img[alt*='${colour}']`
    ].join(", ");

    try {
      await this.page.waitForSelector(selector, { state: "visible", timeout: 5000 });
      await this.page.click(selector);
      console.log(`  ✓ Selected colour: ${colour}`);
    } catch {
      console.log(`  ⚠️  Colour "${colour}" not found — skipping`);
    }
  }

  /**
   * Select a plan by clicking its card.
   * Searches for plan cards containing the given plan name or price.
   * @param {string} planIdentifier - e.g., "$65", "75GB", "Endless"
   */
  async selectPlan(planIdentifier) {
    console.log(`  → Selecting plan matching: "${planIdentifier}"`);

    const selector = [
      `[class*='plan']:has-text('${planIdentifier}')`,
      `[data-testid*='plan']:has-text('${planIdentifier}')`,
      `button:has-text('${planIdentifier}')`,
      `label:has-text('${planIdentifier}')`
    ].join(", ");

    try {
      const planEl = await this.page.$(selector);
      if (planEl) {
        await planEl.scrollIntoViewIfNeeded();
        await planEl.click();
        console.log(`  ✓ Plan selected`);
      } else {
        console.log(`  ⚠️  Plan "${planIdentifier}" not found — skipping`);
      }
    } catch (e) {
      console.log(`  ⚠️  Plan selection skipped: ${e.message}`);
    }
  }

  /**
   * Click the "Add to Cart" (or equivalent) button.
   * Tries multiple selectors to handle different button labels.
   */
  async clickAddToCart() {
    console.log("  → Clicking Add to Cart...");

    const possibleButtons = [
      "button:has-text('Add to cart')",
      "button:has-text('Get this deal')",
      "button:has-text('Choose this plan')",
      "button:has-text('Add to bag')",
      "a:has-text('Add to cart')",
      "[data-testid*='add-to-cart']",
      "[class*='add-to-cart']"
    ];

    for (const btnSelector of possibleButtons) {
      try {
        const btn = await this.page.$(btnSelector);
        if (btn && (await btn.isVisible())) {
          await btn.scrollIntoViewIfNeeded();
          await btn.click();
          console.log(`  ✓ Clicked: "${btnSelector}"`);
          return;
        }
      } catch {
        // Try next button selector
      }
    }

    throw new Error(
      "❌ Could not find the Add to Cart button. " +
      "The button text may have changed — check the selectors in DevicePDPPage.js"
    );
  }

  /**
   * Check whether the Add to Cart button is present and visible.
   * @returns {Promise<boolean>}
   */
  async isAddToCartButtonVisible() {
    const buttons = [
      "button:has-text('Add to cart')",
      "button:has-text('Get this deal')",
      "button:has-text('Choose this plan')"
    ];

    for (const sel of buttons) {
      if (await this.isVisible(sel)) return true;
    }
    return false;
  }

  /**
   * Verify that the PDP is displaying the correct device.
   * @param {string} expectedName - Part of the device name to check
   * @returns {Promise<boolean>}
   */
  async verifyDeviceDisplayed(expectedName) {
    const title = await this.getDeviceTitle();
    const url = this.getCurrentUrl();

    const nameInTitle = title.toLowerCase().includes(expectedName.toLowerCase());
    const nameInUrl = url.toLowerCase().includes(
      expectedName.toLowerCase().replace(/\s+/g, "-")
    );

    console.log(`  ✓ PDP title: "${title}"`);
    console.log(`  ✓ PDP URL: ${url}`);

    return nameInTitle || nameInUrl;
  }
}

module.exports = DevicePDPPage;
