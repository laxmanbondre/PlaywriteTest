# features/deviceGallery.feature
# ─────────────────────────────────────────────────────────────────────────────
# DEVICE GALLERY FEATURE FILE
#
# Feature files are written in Gherkin syntax — plain English that describes
# WHAT the system should do, not HOW it does it.
#
# Structure of Gherkin:
#   Feature:    High-level description of the feature being tested
#   Background: Steps that run before EVERY scenario in this file
#   Scenario:   One test case (a user flow to verify)
#   Given:      Sets up the initial state ("I am on the gallery page")
#   When:       User performs an action ("I click a device")
#   Then:       Expected outcome ("I should see the device detail page")
#   And:        Continues a Given/When/Then block
#
# Tags (@gallery, @smoke) allow running specific subsets:
#   npm run test:gallery   → runs only scenarios tagged @gallery
#   npm run test:smoke     → runs only scenarios tagged @smoke
# ─────────────────────────────────────────────────────────────────────────────

@gallery
Feature: Device Gallery Page
  As a customer visiting the Spark NZ website
  I want to browse available mobile phones on the gallery page
  So that I can find a device that suits my needs

  Background:
    # Background steps run before EVERY scenario in this file.
    # This avoids repeating "Given I am on the gallery page" in every scenario.
    Given I am on the Spark NZ device gallery page

  @smoke
  Scenario: Gallery page displays mobile phones
    # Simplest possible smoke test — just verify the page loads with products
    Then I should see at least 1 device listed on the gallery page

  @smoke
  Scenario: Gallery shows multiple devices
    # Verify the gallery actually has a meaningful number of devices
    Then I should see at least 5 devices listed on the gallery page

  Scenario: Navigate to a device from the gallery
    # Verify that clicking a device card takes us to its product detail page
    When I click on the first device in the gallery
    Then I should be on the device product detail page

  Scenario: Navigate to a specific device by name
    # Verify we can find and click a specific named device
    When I click on the device named "iPhone 17"
    Then I should be on the device product detail page
