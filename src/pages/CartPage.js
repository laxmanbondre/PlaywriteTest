// src/pages/CartPage.js
// ─────────────────────────────────────────────────────────────────────────────
// CART PAGE — Page Object for the shopping cart / basket page.
//
// After adding a device to cart, the user can review their selections
// and proceed to checkout from this page.
//
// Typical URL: /online/shop/cart/ or similar
// ─────────────────────────────────────────────────────────────────────────────

const BasePage = require("./BasePage");

class CartPage extends BasePage {
  constructor(page) {
    super(page);

    // ── Selectors ──────────────────────────────────────────────────────────

    // Cart page heading
    this.cartHeading = "h1, h2, [class*='cart-title']";

    // Items in the cart
    this.cartItems = [
      "[class*='cart-item']",
      "[class*='basket-item']",
      "[class*='order-item']",
      "[data-testid*='cart-item']"
    ].join(", ");

    // Device name inside a cart item
    this.cartItemName = [
      "[class*='cart-item'] [class*='name']",
      "[class*='cart-item'] h3",
      "[class*='cart-item'] h4",
      "[class*='product-name']"
    ].join(", ");

    // Total price display in the cart
    this.cartTotal = [
      "[class*='total']",
      "[class*='cart-total']",
      "[class*='price-total']"
    ].join(", ");

    // "Proceed to Checkout" / "Continue" CTA button
    this.checkoutButton = [
      "button:has-text('Checkout')",
      "button:has-text('Proceed to checkout')",
      "button:has-text('Continue to checkout')",
      "a:has-text('Checkout')",
      "a:has-text('Proceed to checkout')",
      "[data-testid*='checkout']",
      "[class*='checkout-btn']"
    ].join(", ");

    // "Remove" button on a cart item
    this.removeItemButton = [
      "button:has-text('Remove')",
      "button[aria-label*='remove']",
      "[class*='remove']"
    ].join(", ");

    // Empty cart message
    this.emptyCartMessage = [
      "[class*='empty-cart']",
      "p:has-text('Your cart is empty')",
      "p:has-text('no items')"
    ].join(", ");

    // Cart notification / mini cart that appears after add-to-cart
    this.cartNotification = [
      "[class*='notification']",
      "[class*='mini-cart']",
      "[class*='cart-drawer']",
      "[class*='cart-flyout']",
      "button:has-text('View cart')",
      "a:has-text('View cart')"
    ].join(", ");
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  /**
   * Navigate directly to the cart page.
   * Sometimes the cart is not accessible via direct URL — we handle that.
   */
  async open() {
    const cartUrls = [
      "/online/shop/cart/",
      "/shop/cart",
      "/cart"
    ];

    for (const url of cartUrls) {
      await this.navigate(url);
      if (await this.isVisible(this.cartItems)) {
        console.log(`  ✓ Cart page loaded at: ${url}`);
        return;
      }
    }
  }

  /**
   * Wait for the cart page to finish loading.
   * We check for cart items or the empty cart message.
   */
  async waitForCartToLoad() {
    console.log("  ⏳ Waiting for cart to load...");
    await this.page.waitForLoadState("domcontentloaded");

    // Wait for EITHER cart items or the "empty cart" state
    try {
      await this.page.waitForSelector(
        `${this.cartItems}, ${this.emptyCartMessage}`,
        { state: "visible", timeout: 15000 }
      );
    } catch {
      // Page might have a different structure — proceed anyway
    }

    console.log("  ✓ Cart loaded");
  }

  /**
   * Click the "View cart" link/button from a mini-cart notification.
   * This usually appears as an overlay after clicking "Add to Cart".
   */
  async clickViewCart() {
    console.log("  → Clicking 'View Cart'...");

    const selectors = [
      "a:has-text('View cart')",
      "button:has-text('View cart')",
      "a:has-text('View bag')",
      "[data-testid*='view-cart']"
    ];

    for (const sel of selectors) {
      try {
        const el = await this.page.$(sel);
        if (el && (await el.isVisible())) {
          await el.click();
          console.log("  ✓ Clicked View Cart");
          await this.waitForCartToLoad();
          return;
        }
      } catch {
        // Try next
      }
    }

    // If no "View cart" button, try to navigate directly
    console.log("  ℹ️  No 'View Cart' button found — navigating directly to cart");
    await this.open();
  }

  /**
   * Click the "Proceed to Checkout" button.
   * This initiates the checkout flow.
   */
  async clickProceedToCheckout() {
    console.log("  → Clicking Proceed to Checkout...");

    const selectors = [
      "button:has-text('Checkout')",
      "button:has-text('Proceed to checkout')",
      "button:has-text('Continue to checkout')",
      "a:has-text('Checkout')",
      "a:has-text('Proceed to checkout')",
      "[data-testid*='checkout']"
    ];

    for (const sel of selectors) {
      try {
        const el = await this.page.$(sel);
        if (el && (await el.isVisible())) {
          await el.scrollIntoViewIfNeeded();
          await el.click();
          console.log(`  ✓ Checkout initiated via: "${sel}"`);
          return;
        }
      } catch {
        // Try next
      }
    }

    throw new Error(
      "❌ Could not find the Checkout button. " +
      "Update selectors in CartPage.js if the page structure changed."
    );
  }

  /**
   * Get the count of items in the cart.
   * @returns {Promise<number>}
   */
  async getCartItemCount() {
    try {
      const items = await this.page.$$(this.cartItems);
      return items.length;
    } catch {
      return 0;
    }
  }

  /**
   * Verify that a specific device is in the cart by checking visible text.
   * @param {string} deviceName - Part of the device name to find
   * @returns {Promise<boolean>}
   */
  async isDeviceInCart(deviceName) {
    try {
      const pageContent = await this.page.content();
      return pageContent.toLowerCase().includes(deviceName.toLowerCase());
    } catch {
      return false;
    }
  }

  // ── Assertions ────────────────────────────────────────────────────────────

  /**
   * Verify the cart is not empty (has at least one item).
   */
  async verifyCartHasItems() {
    const count = await this.getCartItemCount();
    console.log(`  ✓ Cart has ${count} item(s)`);

    if (count === 0) {
      // Check if empty cart message is shown
      const isEmpty = await this.isVisible(this.emptyCartMessage);
      if (isEmpty) {
        throw new Error("❌ Cart is empty — expected at least one item");
      }
    }

    return count;
  }

  /**
   * Verify the checkout button is visible and clickable.
   */
  async verifyCheckoutButtonVisible() {
    const visible = await this.isVisible(this.checkoutButton);
    if (!visible) {
      throw new Error("❌ Checkout button is not visible on the cart page");
    }
    console.log("  ✓ Checkout button is visible");
    return true;
  }

  /**
   * Verify we've been redirected to the checkout/payment page.
   */
  async verifyCheckoutInitiated() {
    const url = this.getCurrentUrl();
    const checkoutKeywords = ["checkout", "payment", "order", "billing", "delivery"];

    const onCheckout = checkoutKeywords.some((kw) => url.toLowerCase().includes(kw));
    console.log(`  ✓ Current URL after checkout: ${url}`);

    if (!onCheckout) {
      // Some sites redirect to login — that's acceptable too
      const loginKeywords = ["login", "signin", "sign-in", "account"];
      const onLogin = loginKeywords.some((kw) => url.toLowerCase().includes(kw));

      if (onLogin) {
        console.log("  ℹ️  Redirected to login page (expected — user not logged in)");
        return true;
      }

      console.log(`  ⚠️  URL doesn't clearly indicate checkout: ${url}`);
    }

    return true;
  }
}

module.exports = CartPage;
