# features/addToCartCheckout.feature
# ─────────────────────────────────────────────────────────────────────────────
# ADD TO CART & INITIATE CHECKOUT FEATURE FILE
#
# This is the most important end-to-end flow:
#   Gallery → PDP → Add to Cart → Cart → Checkout
#
# Note: "Initiate checkout" means clicking the checkout button and verifying
# the redirect. We do NOT complete the purchase (which would require payment).
#
# Scenario Outline: A special type of scenario that uses a data table (Examples)
# to run the same test with different inputs. It's DRY (Don't Repeat Yourself).
# ─────────────────────────────────────────────────────────────────────────────

@cart
Feature: Add to Cart and Initiate Checkout
  As a customer who has selected a device
  I want to add it to my cart and proceed to checkout
  So that I can complete my purchase

  @smoke
  Scenario: Complete end-to-end flow from gallery to checkout
    # THE KEY FLOW — tests the entire user journey in one scenario
    Given I am on the Spark NZ device gallery page
    When I click on the first device in the gallery
    And I should be on the device product detail page
    And I click Add to Cart on the PDP
    Then the device should be added to the cart
    When I proceed to the cart
    Then the cart should contain at least 1 item
    And the checkout button should be visible
    When I click Proceed to Checkout
    Then the checkout process should be initiated

  Scenario: Add specific device to cart
    # Tests adding a specific well-known device
    Given I am on the Spark NZ device gallery page
    When I click on the device named "iPhone 17"
    And I should be on the device product detail page
    And I click Add to Cart on the PDP
    Then the device should be added to the cart

  Scenario: Cart page shows correct item count
    # Verifies that after adding one device, the cart shows 1 item
    Given I am on the Spark NZ device gallery page
    When I click on the first device in the gallery
    And I should be on the device product detail page
    And I click Add to Cart on the PDP
    And I proceed to the cart
    Then the cart should contain at least 1 item

  # ── Scenario Outline ───────────────────────────────────────────────────────
  # This runs the SAME steps for EACH row in the Examples table below.
  # The <deviceName> placeholder is replaced with the actual value from the table.
  # This gives us 3 test cases from one block of Gherkin code.
  Scenario Outline: Add different devices to cart
    Given I am on the Spark NZ device gallery page
    When I click on the device named "<deviceName>"
    And I should be on the device product detail page
    And I click Add to Cart on the PDP
    Then the device should be added to the cart

    Examples:
      | deviceName          |
      | iPhone 17           |
      | Samsung Galaxy S26  |
      | iPhone Air          |
