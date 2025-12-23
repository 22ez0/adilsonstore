# Mobile Phone E-Commerce Design Guidelines

## Design Approach
**Reference-Based Approach** drawing from Apple Store, Samsung Shop, and Shopify aesthetics. The phone e-commerce category demands premium visual presentation, clear product hierarchy, and frictionless purchasing flows.

## Typography System
- **Primary Font**: Inter (Google Fonts) - clean, modern, excellent at small sizes
- **Headings**: Inter Bold/Semibold, 32-48px (hero), 24-32px (sections), 18-20px (product cards)
- **Body Text**: Inter Regular, 16px base, 14px for specs/metadata
- **Pricing**: Inter Bold, 24-28px for primary prices, 16px for discounts

## Layout & Spacing
**Tailwind Spacing Units**: Consistently use 4, 6, 8, 12, 16, 24 for rhythm
- Section padding: py-16 to py-24
- Card padding: p-6
- Component gaps: gap-6 to gap-8
- Container: max-w-7xl with px-6

## Page Structure

### Hero Section (80vh)
Full-width immersive showcase with flagship phone imagery. Large hero image showing latest premium phone in dramatic lighting, slightly angled for depth. Overlay content (left-aligned or centered) with blurred background buttons (backdrop-blur-md, semi-transparent dark background).

### Product Grid Section
- Grid: 1 column (mobile), 2 columns (tablet), 3-4 columns (desktop)
- Each product card includes: High-quality phone image (front view, centered), model name, starting price prominently displayed, storage variants as pills/badges, quick "View Details" button
- Hover state: Subtle lift with shadow increase

### Featured Phones Carousel
Horizontal scroll showcasing 2-3 premium models with larger cards, includes mini spec highlights (camera MP, storage, display size)

### Storage & Color Selector
When viewing product details, display storage options as outlined rounded rectangles showing GB + price difference. Color swatches as circular buttons with actual phone colors.

### Filter Sidebar/Panel
- Price range slider
- Brand checkboxes
- Storage capacity options
- Feature filters (5G, camera specs, battery)
- Clear "Apply Filters" button

### Product Detail View
- Large image gallery (3-5 images): main view, back view, detail shots
- Right column: Model name, price (large), storage selector, color selector, key specs in clean list format, "Add to Cart" + "Buy with PIX" buttons stacked
- Specifications accordion below

### Shopping Cart Panel
Slide-in from right with backdrop overlay, list of items with thumbnail, quantity selector, subtotal, "Proceed to Checkout" button

### Checkout Flow
Multi-step (Contact > Payment > Review) with progress indicator, PIX payment option with QR code display area and copy-paste code field

### Trust Elements Section
- Free shipping badge
- Warranty information
- Secure payment icons
- Brazilian payment methods (PIX, Boleto, Credit Cards)

### Footer
Multi-column layout: Customer Service links, About Us, Product Categories, Contact info with WhatsApp integration, Payment method logos, Newsletter signup with email input

## Component Library

**Buttons**:
- Primary: Solid, rounded-lg, px-8 py-3, bold text
- Secondary: Outlined, same padding
- CTA over images: Backdrop blur with semi-transparent background

**Product Cards**: 
Border, rounded-xl, shadow-sm, transition-all, image with aspect-ratio-square, content padding p-6

**Badges**: 
Small rounded-full for "New", "Sale", "5G", colored with subtle backgrounds

**Price Display**:
Bold large text for current price, strikethrough smaller text for original price, percentage discount in accent badge

**Input Fields**:
Outlined style, rounded-lg, px-4 py-3, consistent focus states

## Images Required

1. **Hero Image**: Flagship phone (iPhone 15 Pro style or Samsung Galaxy S24 style) in premium dramatic lighting, slight 3D tilt, clean background with subtle gradient
2. **Product Grid Images**: Clean front-view phone renders on white/transparent background for each product (10-15 different models)
3. **Feature Images**: Lifestyle shots showing phones in use (photography, gaming, video calls) - 3-4 images
4. **Payment Icons**: PIX logo, major credit card logos, Boleto icon
5. **Trust Badges**: Delivery truck icon, warranty shield, secure payment lock

## Navigation
Sticky header with: Logo (left), Category menu (Smartphones, Accessories, Deals), Search bar (center-right), Cart icon with badge count, User account icon

## Mobile Responsiveness
Stack all grid layouts to single column, sticky "Add to Cart" bar at bottom on product pages, hamburger menu for navigation, simplified filters in modal overlay