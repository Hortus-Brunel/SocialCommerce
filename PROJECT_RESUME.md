# SOCIALVERSE: COMPREHENSIVE PROJECT SPECIFICATION & RESUME

**Project Name:** SocialVerse  
**Domain:** AI-Powered Social Commerce Platform  
**Localization:** Cameroonian & Central African Markets (Currency: XAF / FCFA)  
**Version:** 2.0.0  

---

## 1. Executive Summary & Project Definition
**SocialVerse** is an advanced, fully localized social commerce platform designed to bridge the gap between traditional e-commerce and engaging social networking. Tailored specifically for the Central African economic landscape (with native support for FCFA/XAF transactions and mobile money gateways), the platform allows businesses to establish verified storefronts, publish catalogs, and interact directly with consumers through interactive feeds, real-time chat, live streaming promotions, group buying, and AI-driven product discovery.

---

## 2. Functional Requirements (FR)

### 2.1 User Management & Authentication
* **User Registration & Onboarding:** Standard user account creation with robust password complexity enforcement (minimum 8 characters, alphanumeric + special characters).
* **Role-Based Provisioning:** Three distinct user tiers: `Customer`, `Business`, and `Admin`.
* **Automated Business Store Creation:** When a user registers with the `business` role, the system automatically initializes a pending business storefront (`{Name}'s Store`).
* **Session Management:** Secure login with JWT authentication and optional "Remember Me" extended token expiry (30 days vs 1 day).

### 2.2 Business Storefront & Identity
* **Profile Management:** Store owners can customize their business name, description, category, contact info, banner images, and brand logos.
* **Verification System:** Multi-status business verification (`pending`, `verified`, `rejected`) allowing verified badges on social feeds.
* **Store Statistics:** Real-time analytics tracking follower counts, total product views, and sales metrics.

### 2.3 Product Catalog & Merchandising
* **Catalog Management:** Create, update, delete, and view products with high-resolution image galleries and thumbnails.
* **Pricing & Inventory:** Real-time inventory tracking and price display strictly formatted in XAF (FCFA).
* **Advanced Merchandising:** 
  * *Flash Sales:* Time-bound promotional pricing countdowns.
  * *Bulk Buying & Group Tiers:* Discounted unit pricing based on volume (e.g., 5% off for 11-50 units, up to 20% off for 500+ units).
  * *Group Buying:* Social sharing mechanisms where customers unlock discounted pricing by forming buying groups.

### 2.4 Social Networking & Community Interaction
* **Social Activity Feed:** Scrollable product discovery feed enabling immediate social engagement.
* **Follow Mechanism:** Users can follow/unfollow businesses, curating their personalized feed and increasing seller follower statistics.
* **Engagement Tools:** Likes/Bookmarks and multi-tiered Product Reviews & Comments (including verified purchase badges, helpful/unhelpful voting, and star rating distributions).
* **Referral & Loyalty Program:** Generation of unique referral tracking links (`SV-XXXXXX`) and point-based loyalty accrual on purchases.
* **Social Sharing:** Deep-linking integrations to share product cards natively to WhatsApp, Twitter, Facebook, and Telegram.

### 2.5 Real-Time Communication (Chat)
* **Direct Messaging:** Peer-to-peer real-time messaging between customers and businesses.
* **Chat History:** Persistent message threading with read/unread receipt tracking.

### 2.6 Order Processing & Payment Gateways
* **Shopping Cart & Wishlist:** Client-side persistence for shopping carts and user wishlists.
* **Multi-Gateway Payment Integration:**
  * *Mobile Money (MoMo):* Native direct integrations for MTN Mobile Money and Orange Money via USSD/PIN push requests.
  * *International Gateways:* Stripe credit/debit card processing and PayPal integration.
* **Order Lifecycle:** Trackable order statuses (`pending`, `confirmed`, `processing`, `shipped`, `delivered`, `cancelled`).

### 2.7 AI Assistant & Analytics Engine
* **Activity Tracking:** Continuous logging of user view and purchase histories.
* **Recommendation Engine:** Algorithmic calculation of user affinity scores across product categories to deliver personalized "For You" feeds.
* **Smart Search:** Real-time auto-suggest query completion.

---

## 3. Non-Functional Requirements (NFR)

### 3.1 Security & Compliance
* **Password Security:** Server-side bcrypt hashing (cost factor 10) for all stored credentials.
* **API Protection:** HTTP security headers enforced via `Helmet.js`, rate limiting (100 requests per 15 minutes per IP) to mitigate DDoS/brute-force attacks.
* **Endpoint Authentication:** All protected endpoints enforce bearer token validation via custom Express middleware.
* **SQL Injection Prevention:** Parameterized database queries utilizing `pg` connection pools.

### 3.2 Performance & Scalability
* **Asynchronous Processing:** Non-blocking I/O operations and connection pooling for PostgreSQL.
* **Optimized Indexing:** Strategic B-Tree indexes on foreign keys (`business_id`, `user_id`, `product_id`) and participant pairs (`sender_id`, `receiver_id`) to ensure rapid query execution at scale.

### 3.3 Localization & Usability
* **Currency Standard:** Uniform formatting using `fr-CM` locale specifications (`Intl.NumberFormat`).
* **Phone Number Formatting:** Strict regex validation supporting Cameroonian phone numbering schemes (`+237`, `6X`, `7X`, `2X`).

### 3.4 Reliability & Availability
* **Graceful Reconnection:** Socket.io client-side reconnection logic with automatic room re-entry upon network drops.

---

## 4. System Workflows & User Journeys

```
+-----------------------------------------------------------------------------------+
|                           CUSTOMER PURCHASING WORKFLOW                            |
+-----------------------------------------------------------------------------------+
[Browse AI Feed] ---> [Click Product Card] ---> [View Ratings & Bulk Tiers]
                                                       |
[MTN/Orange MoMo PIN Prompt] <--- [Select Gateway] <--- [Add to Cart / Buy Group]
        |
[Order Confirmed (DB & UI)] ---> [Socket.io Alert to Seller] ---> [Shipping Tracker]
```

### 4.1 Customer Journey
1. **Discovery:** User accesses the personalized Social Feed or AI Assistant page.
2. **Engagement:** User likes a product, reviews user comments, and adds item to Wishlist or Cart.
3. **Checkout Selection:** User proceeds to Checkout, selecting between Standard Delivery or Group Buy discount.
4. **Payment Execution:** User enters their MTN/Orange mobile number; system triggers a USSD push prompt on their mobile device.
5. **Confirmation:** WebSocket listener detects successful payment completion, transitioning order status and updating seller inventory.

### 4.2 Business / Seller Journey
1. **Onboarding:** Seller registers; system generates a pending store.
2. **Identity Setup:** Seller completes store profile, uploading branding assets to the media gallery.
3. **Catalog Creation:** Seller adds products with prices in XAF and configures optional Bulk Discount Tiers.
4. **Order Management:** Seller receives real-time WebSocket alerts for new orders, updating fulfillment statuses via the Business Dashboard.
5. **Customer Support:** Seller interacts with inquiring buyers directly through the real-time chat dashboard.

### 4.3 Admin Governance Workflow
1. **Platform Audit:** Admin accesses the Admin Dashboard to review total user signups, revenue velocity, and system health metrics.
2. **Business Verification:** Admin reviews pending store verification requests, validating tax/legal details before granting the verified social badge.
3. **User Moderation:** Admin holds capabilities to deactivate fraudulent customer or business accounts.

---

## 5. System Architecture

```
+-----------------------------------------------------------------------------------+
|                             HIGH-LEVEL ARCHITECTURE                               |
+-----------------------------------------------------------------------------------+
  +----------------------+      REST / JSON (HTTPS)      +-----------------------+
  |    Frontend App      | <---------------------------> |     Express.js API    |
  | (HTML5, Vanilla JS,  |                               |    (Node.js Server)   |
  |  CSS3, LocalStorage) | <---------------------------> |  Socket.io WebSocket  |
  +----------------------+       Bi-directional WSS      +-----------------------+
                                                                     |
                                                              Pool (pg driver)
                                                                     v
                                                         +-----------------------+
                                                         |  PostgreSQL Database  |
                                                         +-----------------------+
```

### 5.1 Presentation Layer (Frontend)
* **Structure:** Multi-page application structure utilizing HTML5 semantic tags.
* **Styling:** Custom Vanilla CSS3 design system emphasizing modern premium aesthetics (glassmorphism, subtle gradients, responsive grid layouts).
* **Logic & State:** Modular JavaScript design (`api.js`, `ecommerceFeatures.js`, `paymentHandler.js`). LocalStorage acts as the client-side data store for session tokens, user metadata, shopping carts, and offline wishlists.

### 5.2 Application Layer (Backend API & WebSockets)
* **Framework:** Express.js (v5.2.1) running on Node.js (v16+).
* **Networking:** Dual-protocol architecture running REST API requests on `/api/*` and WebSocket connections over the shared HTTP server instance.
* **Service Modules:** Dedicated controller/service layer isolation (e.g., `paymentService.js` handling payment gateway payload validation).

### 5.3 Data Persistence Layer
* **RDBMS:** PostgreSQL database maintaining strict relational integrity through cascaded deletion constraints.

---

## 6. Database Schema & Architecture

The database is structured to maintain absolute relational consistency between users, commercial entities, products, transactional records, and social interactions.

```
+----------------+      1:1      +------------------+      1:M      +---------------+
|     USERS      | ------------> |    BUSINESSES    | ------------> |   PRODUCTS    |
+----------------+               +------------------+               +---------------+
  |            |                   ^              |                   |           |
  | 1:M        | 1:M               | 1:M          | 1:M               | 1:M       | 1:M
  v            v                   |              v                   v           v
+-------+   +----------+           |        +-----------+         +-------+   +----------+
| ORDERS|   | MESSAGES |           |        |   MEDIA   |         | LIKES |   | COMMENTS |
+-------+   +----------+           |        +-----------+         +-------+   +----------+
  |                                |
  | 1:M                            | (Follower relation)
  v                                |
+-------------+                    |
| ORDER_ITEMS | <------------------+
+-------------+
```

### 6.1 Core Tables & Relationships
1. **`users`**: Central identity table storing authentication credentials, role definitions (`customer`, `business`, `admin`), profile avatars, and active statuses.
2. **`businesses`**: Linked via `owner_id` -> `users(id)`. Contains verification statuses, branding assets, geographical data (city, region in Cameroon), and follower aggregates.
3. **`products`**: Linked via `business_id` -> `businesses(id)`. Stores pricing (XAF), inventory counts, category taxonomies, JSONB multi-image arrays, and popularity counters (likes, views).
4. **`orders` & `order_items`**: `orders` tracks customer totals and shipping JSONB structures. `order_items` maintains line-item immutability (capturing unit prices and subtotals at the exact moment of purchase).
5. **`payments`**: Linked to `orders`. Records specific payment gateways (`MTN`, `ORANGE`), gateway transaction references, mobile numbers, and stateful processing statuses (`pending`, `completed`, `failed`).
6. **Social Tables (`likes`, `comments`, `follows`)**: Pivot tables mapping user interactions to products or businesses. Incorporates composite unique constraints (e.g., `UNIQUE(user_id, product_id)` in `likes`) to prevent redundant records.
7. **`media`**: Central repository for uploaded store banners, product showcase videos, and avatar pictures.
8. **`messages`**: Real-time chat repository mapping `sender_id` and `receiver_id` to message payloads with boolean read flags.

### 6.2 Database Optimizations
* **Foreign Key Constraints:** `ON DELETE CASCADE` enforced across user and business relationships to ensure automated cleanup of orphaned records.
* **Performance Indexing:** Explicit indexes created on high-frequency query paths (`idx_products_business`, `idx_orders_user`, `idx_likes_product`, `idx_comments_product`, `idx_follows_business`, `idx_payments_order`, `idx_messages_participants`).

---

## 7. Integrations & Payment Gateways

```
+-----------------------------------------------------------------------------------+
|                        MULTI-GATEWAY PAYMENT INTEGRATION                          |
+-----------------------------------------------------------------------------------+
                      +-----------------------------+
                      |     PaymentHandler (JS)     |
                      +-----------------------------+
                        /          |             \
       +------------------+ +---------------+ +-----------------+
       | MTN Mobile Money | |  Orange Money | |  Stripe Card    |
       |  (USSD Push PIN) | | (USSD Push PIN) | | (Intl Gateways) |
       +------------------+ +---------------+ +-----------------+
```

### 7.1 Local Mobile Money Gateways (MTN MoMo & Orange Money)
* **Protocol:** Backend simulates secure API handshakes with MTN MoMo API and Orange Money Web Payment APIs.
* **Execution:** Payload submission requires customer phone numbers. The backend initiates a payment request that pushes an instant USSD authorization prompt to the user's phone.
* **Verification:** Asynchronous status polling endpoint (`/api/payments/verify-payment`) confirms final settlement before dispatching inventory deduction commands.

### 7.2 International Gateways (Stripe & PayPal)
* **Stripe:** Full integration via `/create-payment-intent` returning secure client secrets and publishable keys for credit/debit card processing. Client-side Luhn algorithm validation prevents erroneous network requests.
* **PayPal:** Direct integration handling instant wallet-based checkout.

### 7.3 AI Analytics & Recommendation Integration
* **Data Ingestion:** Endpoint `/api/ai/track` captures raw user interaction streams (`view`, `like`, `cart`, `purchase`).
* **Algorithmic Sorting:** The recommendation engine executes dynamic SQL queries aggregating activity volume against catalog items to rank and return high-scoring personalized products.

---

## 8. Network Management & Real-Time Communication

### 8.1 WebSocket Architecture (Socket.io)
* **Server Setup:** Instance bound directly to the Express HTTP server with permissive CORS headers.
* **Room-Based Isolation:** Upon authentication, client sockets emit a `join` event with their unique `userId`. The server isolates WebSocket traffic into user-specific private rooms (`socket.join(userId.toString())`).
* **Event Dispatch:** Real-time events (order updates, incoming chat messages) are dispatched specifically to target rooms (`req.io.to(receiverId).emit(...)`).

### 8.2 REST API Networking
* **CORS Policy:** Strict cross-origin resource sharing configuration allowing dynamic methods (`GET`, `POST`, `PUT`, `DELETE`, `PATCH`) with credential transport enabled.
* **Rate Protection:** `express-rate-limit` shields API routes from abusive traffic spikes.

---

## 9. Authorization, Authentication & RBAC

```
+-----------------------------------------------------------------------------------+
|                        ROLE-BASED ACCESS CONTROL (RBAC)                           |
+-----------------------------------------------------------------------------------+
                                +---------------+
                                |  JWT Bearer   |
                                +---------------+
                                        |
            +---------------------------+---------------------------+
            |                           |                           |
            v                           v                           v
     [ Customer ]                 [ Business ]                 [ Admin ]
  - Browse Feed                - Manage Catalog             - Full Platform Audit
  - Order & Pay                - View Store Stats           - Verify Businesses
  - Review & Like              - Answer Customer Chats      - User Moderation
```

### 9.1 Authentication Mechanism
* **JSON Web Tokens (JWT):** Issued upon successful `/api/auth/login` or `/api/auth/register`. Payload encodes `{ id, role }`. Signed securely with `JWT_SECRET`.
* **Transport:** Client stores token in LocalStorage and attaches it to outgoing HTTP requests under the `Authorization: Bearer <token>` header.

### 9.2 Role-Based Access Control Matrix

| Permission / Feature Area | `Customer` | `Business` | `Admin` |
| :--- | :---: | :---: | :---: |
| **Browse Social Feed & Catalog** | ✅ | ✅ | ✅ |
| **Place Orders & Checkout** | ✅ | ✅ | ✅ |
| **Post Product Reviews & Likes** | ✅ | ✅ | ✅ |
| **Access Real-time Chat** | ✅ | ✅ | ✅ |
| **Create & Edit Store Profile** | ❌ | ✅ (Own Store) | ✅ (All Stores) |
| **Publish & Manage Products** | ❌ | ✅ (Own Catalog) | ✅ (All Catalogs) |
| **View Store Revenue Analytics** | ❌ | ✅ (Own Store) | ✅ (System-wide) |
| **Verify Pending Business Accounts** | ❌ | ❌ | ✅ |
| **Access System Health Dashboard** | ❌ | ❌ | ✅ |
| **Deactivate/Moderate Users** | ❌ | ❌ | ✅ |

### 9.3 Middleware Enforcement
Protected routes are wrapped in multi-stage middleware:
1. `verifyToken`: Validates JWT signature and expiry, attaching decoded user object to `req.user`.
2. `checkRole(['business', 'admin'])`: Inspects `req.user.role` against authorized arrays, rejecting unauthorized access with HTTP 403 Forbidden.

---

## 10. UI/UX Design System & Frontend Architecture

### 10.1 Frontend Design Tokens & Aesthetics
* **Color Palette:** Curated rich aesthetic inspired by premium modern social platforms. Deep slate/dark modes, vibrant accent gradients (Orange/Teal/Indigo) for interactive buttons, and soft glassmorphism backdrops (`backdrop-filter: blur(12px)`).
* **Typography:** Clean, highly readable modern sans-serif typography (e.g., *Inter*, *Outfit*, or system UI fonts) paired with structured font-weight hierarchies.
* **Micro-Animations:** Smooth hover scaling (`transform: translateY(-2px)`), fluid drawer transitions, and custom animated notification popups (`slideInUp`).

### 10.2 JavaScript Component Architecture
The frontend is constructed using modular, object-oriented JavaScript classes ensuring clean separation of concerns:
* **`APIClient` (`api.js`):** Centralized wrapper handling all HTTP fetch requests, automatic token injection, global error trapping, and automatic logout upon token expiration.
* **`WishlistManager` & `ReviewSystem` (`ecommerceFeatures.js`):** Encapsulates local shopping states, rating calculations, and social sharing links.
* **`PaymentHandler` (`paymentHandler.js`):** Encapsulates multi-step checkout flows, input formatting (card spaces, expiry slashes), and client-side validations.

---

## 11. Project Evolution: Current vs. Future Roadmap

```
+-----------------------------------------------------------------------------------+
|                            IMPLEMENTATION ROADMAP                                 |
+-----------------------------------------------------------------------------------+
[Phase 1: Completed]     ---> [Phase 2: In Progress]     ---> [Phase 3: Future]
- Core REST API               - Automated Payouts             - NLP Chatbot (AI)
- Local Payment Gateways      - Live Streaming Integration    - Multi-Vendor Logistics
- Real-Time Chat (WSS)        - Advanced Group Buying         - AI Image Try-On AR
```

### 11.1 Current Implementation (v2.0.0)
* Full end-to-end user authentication and automated business profile generation.
* Robust PostgreSQL schema running fully localized e-commerce pricing in XAF.
* Real-time peer-to-peer WebSocket messaging and active notification dispatch.
* Multi-method payment gateway simulation supporting MTN MoMo, Orange Money, Stripe, and PayPal.
* Algorithmic recommendation engine and social interaction models (likes, reviews, follows).

### 11.2 Future Implementation & Enhancements (v3.0+)
1. **Live Video Streaming Integration:** Transitioning the simulated live stream features into WebRTC / HLS streaming pipelines allowing sellers to broadcast real-time flash sales directly within the social feed.
2. **AI Chatbot & NLP Assistant:** Upgrading the AI Assistant from basic query auto-suggestions and activity scoring to a generative AI conversational assistant capable of answering customer product inquiries automatically based on catalog descriptions.
3. **Automated MoMo Payouts:** Implementing automated merchant settlement pipelines to disburse accumulated XAF balances directly to business owners' mobile money wallets on a weekly schedule.
4. **Multi-Vendor Logistics Integration:** Direct API integration with local Cameroonian delivery couriers (e.g., Yango Delivery, Campost) to provide real-time GPS tracking of shipped customer orders.
5. **AR Virtual Try-On:** Leveraging computer vision models to enable customers to preview fashion and cosmetic products directly through their mobile webcams.

---
*End of Specification Document.*
