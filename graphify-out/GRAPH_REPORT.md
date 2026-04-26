# Graph Report - /home/shilpa/projects/ecommerce-backend  (2026-04-24)

## Corpus Check
- 74 files · ~25,797 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 190 nodes · 249 edges · 35 communities detected
- Extraction: 73% EXTRACTED · 27% INFERRED · 0% AMBIGUOUS · INFERRED: 66 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]

## God Nodes (most connected - your core abstractions)
1. `auditLog()` - 9 edges
2. `requirePermission()` - 7 edges
3. `getOrCreateCart()` - 6 edges
4. `signup()` - 5 edges
5. `signin()` - 5 edges
6. `refreshTokens()` - 5 edges
7. `signAccessToken()` - 4 edges
8. `signRefreshToken()` - 4 edges
9. `getProductsHandler()` - 4 edges
10. `getCart()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `hashPassword()` --calls--> `signup()`  [INFERRED]
  /home/shilpa/projects/ecommerce-backend/src/utils/hash.ts → /home/shilpa/projects/ecommerce-backend/src/modules/auth/auth.service.ts
- `requirePermission()` --calls--> `orderRoutes()`  [INFERRED]
  /home/shilpa/projects/ecommerce-backend/src/modules/admin/middleware/requirePermission.ts → /home/shilpa/projects/ecommerce-backend/src/modules/admin/orders/orders.routes.ts
- `comparePassword()` --calls--> `signin()`  [INFERRED]
  /home/shilpa/projects/ecommerce-backend/src/utils/hash.ts → /home/shilpa/projects/ecommerce-backend/src/modules/auth/auth.service.ts
- `verifyRefreshToken()` --calls--> `refreshTokens()`  [INFERRED]
  /home/shilpa/projects/ecommerce-backend/src/utils/jwt.ts → /home/shilpa/projects/ecommerce-backend/src/modules/auth/auth.service.ts
- `signupHandler()` --calls--> `signup()`  [INFERRED]
  /home/shilpa/projects/ecommerce-backend/src/modules/auth/auth.controller.ts → /home/shilpa/projects/ecommerce-backend/src/modules/auth/auth.service.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.13
Nodes (7): getAdminWithPermissions(), adminUserRoutes(), categoryRoutes(), materialRoutes(), productImageRoutes(), requirePermission(), verifyAdminJWT()

### Community 1 - "Community 1"
Cohesion: 0.16
Nodes (14): authenticate(), logoutHandler(), refreshHandler(), signinHandler(), signupHandler(), logout(), refreshTokens(), signin() (+6 more)

### Community 2 - "Community 2"
Cohesion: 0.19
Nodes (16): addToCartHandler(), applyPromoHandler(), clearCartHandler(), getCartHandler(), removeCartItemHandler(), removePromoHandler(), updateCartItemHandler(), addToCart() (+8 more)

### Community 3 - "Community 3"
Cohesion: 0.16
Nodes (12): getOrderByIdHandler(), getOrdersHandler(), placeOrderHandler(), updateOrderStatusHandler(), orderRoutes(), generateOrderNumber(), getAllOrders(), getOrderById() (+4 more)

### Community 4 - "Community 4"
Cohesion: 0.18
Nodes (13): auditLog(), refundOrderHandler(), createProductHandler(), deleteProductHandler(), getProductHandler(), toggleSoldOutHandler(), updateProductHandler(), productRoutes() (+5 more)

### Community 5 - "Community 5"
Cohesion: 0.21
Nodes (4): adminLoginHandler(), adminLogin(), comparePassword(), hashPassword()

### Community 6 - "Community 6"
Cohesion: 0.31
Nodes (6): createAdminUserHandler(), deactivateAdminUserHandler(), getAdminUsersHandler(), createAdminUser(), deactivateAdminUser(), getAllAdminUsers()

### Community 7 - "Community 7"
Cohesion: 0.27
Nodes (8): createPaymentOrderHandler(), refundPaymentHandler(), verifyPaymentHandler(), webhookHandler(), createPaymentOrder(), handleWebhook(), refundPayment(), verifyPayment()

### Community 8 - "Community 8"
Cohesion: 0.28
Nodes (7): getFiltersHandler(), getProductBySlugHandler(), getProductsHandler(), getAllProducts(), getFilterOptions(), getProductBySlug(), getProducts()

### Community 9 - "Community 9"
Cohesion: 0.4
Nodes (4): createReviewHandler(), getReviewsHandler(), createReview(), getReviews()

### Community 10 - "Community 10"
Cohesion: 0.4
Nodes (2): registerPlugins(), bootstrap()

### Community 11 - "Community 11"
Cohesion: 0.5
Nodes (0): 

### Community 12 - "Community 12"
Cohesion: 0.5
Nodes (2): getNewArrivalsHandler(), getNewArrivals()

### Community 13 - "Community 13"
Cohesion: 0.5
Nodes (2): getTopSellingHandler(), getTopSelling()

### Community 14 - "Community 14"
Cohesion: 1.0
Nodes (0): 

### Community 15 - "Community 15"
Cohesion: 1.0
Nodes (0): 

### Community 16 - "Community 16"
Cohesion: 1.0
Nodes (0): 

### Community 17 - "Community 17"
Cohesion: 1.0
Nodes (0): 

### Community 18 - "Community 18"
Cohesion: 1.0
Nodes (0): 

### Community 19 - "Community 19"
Cohesion: 1.0
Nodes (0): 

### Community 20 - "Community 20"
Cohesion: 1.0
Nodes (0): 

### Community 21 - "Community 21"
Cohesion: 1.0
Nodes (0): 

### Community 22 - "Community 22"
Cohesion: 1.0
Nodes (0): 

### Community 23 - "Community 23"
Cohesion: 1.0
Nodes (0): 

### Community 24 - "Community 24"
Cohesion: 1.0
Nodes (0): 

### Community 25 - "Community 25"
Cohesion: 1.0
Nodes (0): 

### Community 26 - "Community 26"
Cohesion: 1.0
Nodes (0): 

### Community 27 - "Community 27"
Cohesion: 1.0
Nodes (0): 

### Community 28 - "Community 28"
Cohesion: 1.0
Nodes (0): 

### Community 29 - "Community 29"
Cohesion: 1.0
Nodes (0): 

### Community 30 - "Community 30"
Cohesion: 1.0
Nodes (0): 

### Community 31 - "Community 31"
Cohesion: 1.0
Nodes (0): 

### Community 32 - "Community 32"
Cohesion: 1.0
Nodes (0): 

### Community 33 - "Community 33"
Cohesion: 1.0
Nodes (0): 

### Community 34 - "Community 34"
Cohesion: 1.0
Nodes (0): 

## Knowledge Gaps
- **Thin community `Community 14`** (2 nodes): `authRoutes()`, `auth.routes.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 15`** (2 nodes): `cartRoutes()`, `cart.routes.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 16`** (2 nodes): `newArrivals.routes.ts`, `newArrivalsRoutes()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 17`** (2 nodes): `topSelling.routes.ts`, `topSellingRoutes()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 18`** (2 nodes): `customerReviewRoutes()`, `customerReviews.routes.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 19`** (2 nodes): `order.routes.ts`, `orderRoutes()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 20`** (2 nodes): `payments.routes.ts`, `paymentRoutes()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 21`** (1 nodes): `razorpay.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 22`** (1 nodes): `redis.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 23`** (1 nodes): `supabase.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 24`** (1 nodes): `auth.schema.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 25`** (1 nodes): `products.schema.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 26`** (1 nodes): `cart.schema.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 27`** (1 nodes): `product-images.controller.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 28`** (1 nodes): `project-images.schema.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 29`** (1 nodes): `newArrivals.schema.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 30`** (1 nodes): `topSelling.schema.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 31`** (1 nodes): `customerReviews.schema.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 32`** (1 nodes): `orders.schema.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 33`** (1 nodes): `payments.schema.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 34`** (1 nodes): `fastify-multipart.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `comparePassword()` connect `Community 5` to `Community 1`?**
  _High betweenness centrality (0.065) - this node is a cross-community bridge._
- **Why does `signin()` connect `Community 1` to `Community 5`?**
  _High betweenness centrality (0.061) - this node is a cross-community bridge._
- **Are the 8 inferred relationships involving `auditLog()` (e.g. with `updateOrderStatusHandler()` and `refundOrderHandler()`) actually correct?**
  _`auditLog()` has 8 INFERRED edges - model-reasoned connections that need verification._
- **Are the 6 inferred relationships involving `requirePermission()` (e.g. with `orderRoutes()` and `productRoutes()`) actually correct?**
  _`requirePermission()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **Are the 4 inferred relationships involving `signup()` (e.g. with `signupHandler()` and `hashPassword()`) actually correct?**
  _`signup()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **Are the 4 inferred relationships involving `signin()` (e.g. with `signinHandler()` and `comparePassword()`) actually correct?**
  _`signin()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.13 - nodes in this community are weakly interconnected._