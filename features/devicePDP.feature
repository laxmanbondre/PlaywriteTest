# features/devicePDP.feature
# ─────────────────────────────────────────────────────────────────────────────
# DEVICE PDP (Product Detail Page) FEATURE FILE
#
# These scenarios test the product detail page that appears when a user
# clicks on a device from the gallery.
#
# The PDP typically contains:
#   - Device name and images
#   - Storage/colour variant selectors
#   - Plan selection options
#   - Price breakdown
#   - "Add to Cart" / "Get this deal" call-to-action button
# ─────────────────────────────────────────────────────────────────────────────

@pdp
Feature: Device Product Detail Page (PDP)
  As a customer
  I want to view detailed information about a specific device
  So that I can make an informed purchasing decision

  Background:
    # Navigate to gallery and select the first device before each scenario
    Given I am on the Spark NZ device gallery page
    And I click on the first device in the gallery
    And I should be on the device product detail page

  @smoke
  Scenario: Device detail page loads with key elements
    # Verify the PDP has loaded and shows the essential CTA button
    Then the Add to Cart button should be visible on the PDP

  Scenario: Device detail page shows device title
    # Verify the device name is displayed on the PDP
    Then the device title should be displayed on the PDP

  Scenario: User can navigate back to gallery from PDP
    # Verify the back navigation works (browser back or breadcrumb)
    When I navigate back to the gallery
    Then I should see at least 1 device listed on the gallery page

  Scenario: User can add device to cart from PDP
    # The core PDP action — adding the device to cart
    When I click Add to Cart on the PDP
    Then the device should be added to the cart
