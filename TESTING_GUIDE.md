# Wahi Fashion End-to-End Testing Guide

Use this guide to test the website from a shopper's first visit through payment and order confirmation. Please test on both mobile and desktop if possible.

When something looks wrong, note:

- The page you were on
- What you clicked or typed
- What you expected to happen
- What actually happened
- A screenshot, if possible

## Before You Start

- Use a fresh browser session where possible.
- Have at least one test email address ready.
- Have a Kenyan phone number ready for checkout and SasaPay testing.
- Add notes for any confusing wording, missing feedback, slow loading, or buttons that do not respond.

## 1. Landing Page

Start on the home page.

Check that:

- The page loads without broken images or layout issues.
- The main navigation is easy to understand.
- Collection, category, new arrival, and featured product sections are visible.
- Product links and category links take you to the expected pages.
- The experience works well on a phone screen.

## 2. Account Creation

Go to `Join Wahi` or `/auth/register`.

Test:

- Creating an account with first name, last name, email, phone, password, and password confirmation.
- Submitting with empty fields.
- Entering an invalid email address.
- Entering passwords that do not match.
- Showing and hiding the password.
- Google sign-in, if available in the test environment.

Expected result:

- The form should clearly explain missing or incorrect details.
- A successful registration should show a success message or ask you to confirm your email.

## 3. Login

Go to `/auth/login`.

Test:

- Logging in with a valid account.
- Trying a wrong password.
- Trying an invalid email format.
- Using `Forgot password?`.
- Using `Continue as Guest` after adding items to the bag.

Expected result:

- Successful login returns you to the website.
- Failed login shows a clear error.
- Guest checkout should remain possible.

## 4. Shop And Product Browsing

Go to `/shop`.

Test:

- Browsing all products.
- Opening a product detail page.
- Switching between grid and list views.
- Sorting by available options such as newest, price, rating, or bestseller.
- Searching, if search is available from the navigation.

Check that:

- Product names, prices, images, badges, sizes, and colors display correctly.
- Sold-out products cannot be added to the bag.
- Product pages show image gallery, product details, variants, and related products.

## 5. Filters

On the shop page, test filters on desktop and mobile.

Test:

- Category filters.
- Price range.
- Size filters.
- Color filters.
- Badge filters such as new, sale, bestseller, and limited.
- `In stock only`.
- Resetting filters.

Expected result:

- The product list should update after each filter change.
- Mobile filters should open and close cleanly.
- Reset should remove all selected filters.

## 6. Quick Add

On a product card, use `Quick Add`.

Test:

- Opening the quick add panel.
- Choosing a color.
- Choosing a size.
- Adding the item to the bag.
- Adding the same item more than once.

Expected result:

- The product should show `Added To Bag`.
- The bag count should increase.
- The selected size and color should appear correctly in the bag.

## 7. Wishlist

Use the heart icon on product cards or product pages.

Test:

- Adding a product to the wishlist.
- Removing a product from the wishlist.
- Visiting `/wishlist`.
- Logging in, then checking whether wishlist items are still available.

Expected result:

- The heart should clearly show saved or unsaved state.
- The wishlist page should show saved products or a helpful empty state.

## 8. Bag / Cart

Open the bag from the navigation or go to `/cart`.

Test:

- Viewing selected items.
- Increasing and decreasing quantity.
- Removing an item.
- Opening the full bag page.
- Moving from bag to checkout.

Expected result:

- Item image, name, size, color, quantity, and price should be correct.
- Subtotal should update when quantity changes.
- Empty bag should show a clear message and a link back to shop.

## 9. Checkout Overview

Checkout has four steps:

1. Delivery
2. Payment
3. Review
4. Confirmed

Before testing checkout, add at least one in-stock product to the bag.

Check that:

- You cannot checkout with an empty bag.
- The checkout steps are clear.
- You can move back to earlier steps when allowed.
- Errors explain what needs to be fixed.

## 10. Checkout Delivery Details

Checkout asks for:

- Full name
- Email
- Phone number
- Delivery method
- Delivery location, if using delivery
- Building, estate, or street address, if using delivery
- Optional extra notes such as landmark or gate instructions

### Standard Delivery

Choose `Standard Delivery`.

Test:

- Fill name, email, and phone.
- Search for a location and select one from the suggestions.
- Confirm that county and town fill automatically.
- Enter building, estate, or street address.
- Add optional delivery notes.
- Continue to payment.

Expected result:

- The site should not accept typed location text unless a suggestion is selected.
- County and town should be read-only after location selection.
- The order summary should show delivery fee once the location is accepted.

### Rider Delivery

This applies when the delivery location is inside the rider delivery distance.

Expected result:

- The review step should show `Rider delivery`.
- Delivery fee should be shown unless the rules make it free.
- Payment options may include SasaPay prepaid and M-Pesa on delivery, depending on admin settings.

### Parcel Delivery

This applies when the delivery location is outside the rider delivery distance.

Expected result:

- Checkout should switch to parcel delivery.
- Delivery fee may show as `To Be Confirmed`.
- Payment should be prepaid only.
- The confirmation page should explain that a store attendant will contact the customer to arrange parcel dispatch.

### Pickup From Store

Choose `Pickup from Store`.

Test:

- Fill name, email, and phone.
- Confirm pickup address, contact phone, opening hours, and collection window are shown.
- Continue to payment.

Expected result:

- No customer delivery address should be required.
- Pickup should be prepaid only.
- Confirmation should show pickup details and collection window.

## 11. Payment And SasaPay

At payment, choose the available payment option.

Test:

- SasaPay / M-Pesa prepaid.
- M-Pesa on delivery, if shown for rider delivery.
- Returning from SasaPay after successful payment.
- Returning or retrying after failed payment, if test credentials allow.

Expected result:

- For prepaid M-Pesa, the site should open the secure SasaPay checkout page.
- The customer enters the M-Pesa number on the SasaPay page, not on Wahi checkout.
- After payment, the customer should return to Wahi confirmation.
- The confirmation page should show order number, delivery or pickup details, payment status, order status, and total.
- If payment fails, the page should offer a clear retry option when available.

## 12. Review And Place Order

On the review step, check:

- Items, sizes, colors, quantities, and prices.
- Delivery or pickup details.
- Payment method.
- Delivery fee and total.
- Any messages about parcel delivery or manual fee confirmation.

Test:

- Editing delivery details.
- Editing payment method.
- Placing the order.

Expected result:

- The order should not be placed until required details are valid.
- After placing the order, the bag should clear.
- Confirmation should show a unique order number.

## 13. Admin Dashboard Access

Go to `/admin`.

Test:

- Trying to open admin while logged out.
- Logging in with a staff account.
- Logging in with a non-staff account.
- Checking which sections are visible for owner vs attendant roles.

Expected result:

- Logged-out users should be sent to login.
- Non-staff users should not see admin controls.
- Staff should only see sections they are allowed to access.

## 14. Admin Dashboard Sections

### Dashboard

Check:

- Awaiting payment count.
- Fulfillment queue count.
- Low stock count.
- Payment issue count.
- Recent paid orders.
- Payment attention list.
- Low-stock watchlist.
- Quick action links.

### Orders

Test:

- Searching by order number, customer, or guest email.
- Filtering by order status.
- Filtering by payment status.
- Filtering by delivery mode.
- Opening an order detail page.
- Updating order status, payment status, or internal notes if your role allows it.

### Payments

Test:

- Searching by order, reference, checkout ID, or transaction code.
- Filtering by initiated, pending, paid, and failed.
- Opening a payment detail page.
- Checking that SasaPay records connect back to the correct order.

### Customers

Test:

- Searching by email, name, or phone.
- Opening a customer detail page.
- Checking profile details, recent orders, and wishlist items.

### Catalog

If your role can manage catalog:

- Create a category.
- Create a product with name, category, price, description, and image.
- Edit product name, category, price, description, and images.
- Add a variant with color, size, and stock.
- Save stock on a variant.

If your role is read-only:

- Confirm that product details are visible but editing is disabled.

### Inventory

Test:

- Searching by product, SKU, color, or size.
- Filtering low stock only.
- Updating stock quantity.
- Confirming the storefront respects updated stock.

### Settings

Owner-only section.

Test:

- Viewing and saving shop name, address, coordinates, rider radius, parcel switch radius, fees, and delivery timelines.
- Turning rider pay on delivery on or off.
- Turning parcel manual fee confirmation on or off.
- Creating and editing pickup locations.
- Activating or deactivating pickup locations.

After changing settings, repeat checkout to confirm the customer experience changes correctly.

### Staff

Owner-only section.

Test:

- Adding staff by email or Supabase user ID.
- Choosing Owner or Attendant role.
- Activating and deactivating staff.
- Changing a staff member's role.
- Confirming deactivated staff cannot access admin.

## 15. Final Checks

For every full test order, confirm:

- The customer can move from landing page to shop, bag, checkout, payment, and confirmation.
- Prices and totals are correct.
- Delivery mode matches the selected location or pickup choice.
- SasaPay return flow works.
- Admin dashboard shows the new order and payment state.
- Mobile layout is usable from start to finish.
