# Playwright BDD Cucumber Framework

A complete end-to-end test automation framework for the Spark NZ device shop,
built with **Playwright** + **Cucumber (BDD)** + **Page Object Model**.

---

## 📁 Project Structure

```
spark-playwright-bdd/
│
├── features/                        # BDD feature files (Gherkin)
│   ├── deviceGallery.feature        # Gallery page test scenarios
│   ├── devicePDP.feature            # Product Detail Page scenarios
│   ├── addToCartCheckout.feature    # End-to-end cart & checkout flow
│   │
│   └── step-definitions/            # Glue between Gherkin & Playwright
│       ├── gallerySteps.js          # Steps for gallery page actions
│       └── pdpAndCartSteps.js       # Steps for PDP, cart & checkout
│
├── src/
│   ├── pages/                       # Page Object Model classes
│   │   ├── BasePage.js              # Shared actions (click, type, navigate...)
│   │   ├── DeviceGalleryPage.js     # Gallery-specific actions & assertions
│   │   ├── DevicePDPPage.js         # PDP-specific actions & assertions
│   │   └── CartPage.js             # Cart & checkout actions & assertions
│   │
│   ├── hooks/
│   │   └── hooks.js                 # Browser lifecycle (open/close per scenario)
│   │
│   └── utils/
│       └── generateReport.js        # HTML report generator
│
├── test-data/
│   └── devices.js                   # Centralised test data (device names etc.)
│
├── reports/                         # Auto-created — test output goes here
│   ├── cucumber-report.json         # Raw test results (JSON)
│   └── html-report/                 # Beautiful HTML report (after npm run report)
│
├── .env                             # Environment variables (browser, URL, etc.)
├── cucumber.js                      # Cucumber configuration
└── package.json                     # npm dependencies & scripts
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher
  - Check: `node --version`
  - Download: https://nodejs.org/

### Step 1 — Install Dependencies

```bash
cd spark-playwright-bdd
npm install
```

### Step 2 — Install Playwright Browsers

```bash
npx playwright install chromium
# Or install all browsers:
npx playwright install
```

### Step 3 — Run Tests

```bash
# Run ALL tests (headless)
npm test

# Run tests with visible browser window (great for learning/debugging)
npm run test:headed

# Run only smoke tests
npm run test:smoke

# Run only gallery tests
npm run test:gallery

# Run only PDP tests
npm run test:pdp

# Run only cart/checkout tests
npm run test:cart
```

### Step 4 — View HTML Report

```bash
npm run report
```
Opens an HTML report in your browser showing pass/fail, screenshots, and timing.

---

## 🏗️ Architecture — Key Concepts

### 1. BDD (Behaviour Driven Development)

Tests are written in **Gherkin** — plain English in `.feature` files.

```gherkin
Scenario: Complete purchase flow
  Given I am on the Spark NZ device gallery page
  When I click on the first device in the gallery
  And I click Add to Cart on the PDP
  Then the device should be added to the cart
```

**Why BDD?**
- Non-technical stakeholders can read and write test scenarios
- Tests document business requirements
- Forces you to think about user behaviour, not implementation

---

### 2. Page Object Model (POM)

Each page has its own **class** that contains:
- **Selectors** — CSS paths to find elements on the page
- **Actions** — `clickAddToCart()`, `selectStorage()`, `clickFirstDevice()`
- **Assertions** — `verifyMinimumDevicesShown()`, `verifyCheckoutInitiated()`

**Why POM?**
- If a selector changes, update in ONE place (not 20 step files)
- Tests stay readable — steps call `pdp.clickAddToCart()` not 5 lines of Playwright code
- Easy to add new pages as the site grows

---

### 3. Hooks — Test Lifecycle

`src/hooks/hooks.js` manages the browser:

| Hook | When it runs | What it does |
|------|-------------|--------------|
| `BeforeAll` | Once before all tests | Launches the browser |
| `Before` | Before each scenario | Opens a fresh browser tab (isolated) |
| `After` | After each scenario | Takes screenshot if failed, closes tab |
| `AfterAll` | Once after all tests | Closes the browser |

---

### 4. Tags — Running Subsets of Tests

Tags let you run specific tests without running everything:

```gherkin
@smoke @gallery
Scenario: Gallery page displays mobile phones
```

```bash
npm run test:smoke     # runs @smoke scenarios
npm run test:gallery   # runs @gallery scenarios
```

---

## ⚙️ Configuration

Edit `.env` to change behaviour:

| Variable | Default | Description |
|----------|---------|-------------|
| `BASE_URL` | `https://www.spark.co.nz` | Site to test |
| `HEADLESS` | `true` | `false` = visible browser |
| `BROWSER` | `chromium` | `chromium`, `firefox`, or `webkit` |
| `DEFAULT_TIMEOUT` | `30000` | Max wait for elements (ms) |
| `SLOW_MO` | `0` | Slow down actions by N ms (debugging) |

---

## 🐛 Debugging Tips

### See the browser window
```bash
npm run test:headed
```

### Slow down actions (watch what's happening)
```
# In .env:
SLOW_MO=1000
HEADLESS=false
```

### Run only one scenario
Add `.only` is not available in Cucumber, instead use tags:
1. Add `@wip` tag to your scenario
2. Run: `npx cucumber-js --tags @wip`

### Check what selectors match
Open the browser DevTools (F12) → Console → type:
```javascript
document.querySelectorAll("a[href*='/online/shop/products/']").length
```

---

## 📝 Adding New Tests

### 1. Add a new scenario to a feature file

```gherkin
# In features/deviceGallery.feature
Scenario: Filter devices by brand
  Given I am on the Spark NZ device gallery page
  When I filter by brand "Apple"
  Then I should only see Apple devices
```

### 2. Run the tests — Cucumber will tell you what step definitions are missing

```bash
npm test
# Output: Undefined. Implement with the following snippet:
#   When('I filter by brand {string}', function (brand) { ... })
```

### 3. Add the step definition

```javascript
// In features/step-definitions/gallerySteps.js
When("I filter by brand {string}", async function (brand) {
  await this.galleryPage.filterByBrand(brand);
});
```

### 4. Add the method to the page object

```javascript
// In src/pages/DeviceGalleryPage.js
async filterByBrand(brand) {
  await this.click(`button:has-text('${brand}')`);
}
```

---

## 🔧 Selector Strategy

Selectors are CSS or Playwright-specific patterns that find elements.

| Selector Type | Example | Use When |
|--------------|---------|----------|
| Text match | `button:has-text('Add to cart')` | Button/link text is stable |
| CSS class | `[class*='cart-item']` | Partial class name match |
| Data attribute | `[data-testid='checkout-btn']` | Site has test IDs (most reliable!) |
| Contains | `a[href*='/products/']` | URL pattern match |
| Alt text | `img[alt*='iPhone']` | Images with alt text |

**Best to worst reliability:**
1. `data-testid` attributes (ask devs to add these!)
2. Semantic HTML (roles, labels)
3. Stable CSS classes
4. Text content
5. XPath (avoid — fragile)
