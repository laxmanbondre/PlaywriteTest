// test-data/devices.js
// ─────────────────────────────────────────────────────────────────────────────
// TEST DATA FILE
//
// Centralising test data here means:
//   - If device names change on the site, update here → all tests stay in sync
//   - Easy to add/remove devices from test runs
//   - Non-technical team members can update test data without touching code
// ─────────────────────────────────────────────────────────────────────────────

module.exports = {
  // Devices to test in the gallery flow
  featuredDevices: [
    "iPhone 17",
    "iPhone 17 Pro",
    "Samsung Galaxy S26",
    "Samsung Galaxy S26 Ultra 5G"
  ],

  // Budget-tier devices
  budgetDevices: [
    "iPhone 16e",
    "motorola razr 60"
  ],

  // A single device to use in smoke tests (choose one that's always in stock)
  defaultTestDevice: "iPhone 17",

  // The gallery page URL path
  galleryUrl: "/online/shop/handsets/",

  // Base URL
  baseUrl: "https://www.spark.co.nz"
};
