# 👷 Engineer 2 — Azure DevOps Task Board
**Epic:** Client Storefront, Shopping Cart & Worker Portal
**Branch:** `feature/epic-storefront-worker`
**Sprint:** Sprint 1
**Area:** m3allem
**Assigned To:** Engineer 2

---

## ⚠️ Before You Start — Contract-First Agreement

Engineer 2 depends on models and services owned by Engineer 1. Until Engineer 1's PR is merged into `main`, you will use **local mock data** inside your services. Follow these rules:

1. **Models** — Import `User` and `Item` from `src/app/shared/models/` directly. They are already defined. Do NOT redefine them.
2. **ApiService** — Until Engineer 1 merges, mock all HTTP calls by returning `of(mockData)` from `rxjs`. Replace with real `ApiService` calls after rebase.
3. **AuthService** — Mock `currentUser$` as `new BehaviorSubject<User | null>(mockUser)` locally inside your service for development. Replace after rebase.
4. **Rebase checkpoint** — When `feature/epic-core-supplier` is merged to `main`, run:
   ```bash
   git fetch origin
   git rebase origin/main
   ```
   Then remove all mock data and wire the real services.

---

## How to Use This File
Each task maps directly to one Azure DevOps work item. Copy the **Title**, **Description**, **Files to Work On**, and **Acceptance Criteria** into the work item form. Priority 1 = highest urgency.

---

---

## TASK-E2-01 · Implement EcommerceService (Product Fetch, Cart & Order Logic)

**Type:** Task | **Priority:** 1 | **Effort:** 5 pts | **State:** To Do

### What to Build
Build the central service for the storefront. It handles:
1. Fetching product listings (with optional search/category filter)
2. Fetching a single product by ID
3. Managing the in-memory shopping cart (add, remove, update quantity, clear)
4. Placing an order (calling the checkout endpoint)

This service is the **single source of truth** for cart state — components must never manage cart state locally.

### Files to Work On
- `src/app/features/ecommerce/services/ecommerce.service.ts`

### Implementation Details
```typescript
@Injectable({ providedIn: 'root' })
export class EcommerceService {
  // Cart state — reactive
  private cartItems$ = new BehaviorSubject<CartItem[]>([]);
  cart$ = this.cartItems$.asObservable();
  cartCount$ = this.cart$.pipe(map(items => items.reduce((sum, i) => sum + i.quantity, 0)));

  // Product fetching
  getProducts(search?: string, category?: string): Observable<Item[]>
  getProductById(id: string): Observable<Item>

  // Cart management
  addToCart(item: Item, quantity?: number): void
  removeFromCart(itemId: string): void
  updateQuantity(itemId: string, quantity: number): void
  clearCart(): void
  getCartTotal(): number   // sum of price * quantity

  // Checkout
  placeOrder(orderPayload: OrderPayload): Observable<OrderReceipt>
}

// Supporting interfaces (define in this file or a cart.model.ts)
export interface CartItem {
  item: Item;
  quantity: number;
}

export interface OrderPayload {
  items: CartItem[];
  shippingAddress: string;
  paymentMethod: string;
}

export interface OrderReceipt {
  orderId: string;
  totalAmount: number;
  estimatedDelivery: string;
  status: 'confirmed' | 'pending';
}
```

### Endpoint Mapping
| Method | Endpoint |
|---|---|
| `getProducts()` | `GET /items?search=<q>&category=<cat>` |
| `getProductById()` | `GET /items/:id` |
| `placeOrder()` | `POST /orders` |

### Mock Data (Phase 1 — before rebase)
```typescript
// Use this until ApiService is available:
private mockItems: Item[] = [
  { _id: '1', supplierId: 's1', title: 'Drill Bit Set', description: 'Professional grade', price: 149.99, stockQuantity: 50, category: 'Tools', status: 'active', createdAt: new Date().toISOString() },
  { _id: '2', supplierId: 's1', title: 'Hydraulic Jack', description: '3-ton capacity', price: 299.99, stockQuantity: 12, category: 'Equipment', status: 'active', createdAt: new Date().toISOString() },
  { _id: '3', supplierId: 's2', title: 'Spark Plug Set', description: 'NGK compatible', price: 49.99, stockQuantity: 200, category: 'Spare Parts', status: 'active', createdAt: new Date().toISOString() },
];
```

### Acceptance Criteria
```
GIVEN a component calls getProducts() with no arguments
THEN all available products are returned as Observable<Item[]>

GIVEN getProducts('drill', 'Tools') is called
THEN results are filtered to items matching search and category

GIVEN addToCart(item) is called
THEN cart$ emits a new array containing the item with quantity 1
AND cartCount$ increments by 1

GIVEN addToCart(item) is called for an item already in the cart
THEN the quantity of that item increments instead of creating a duplicate entry

GIVEN clearCart() is called after placing an order
THEN cart$ emits an empty array and cartCount$ emits 0

GIVEN placeOrder(payload) is called
THEN a POST to /orders is made and Observable<OrderReceipt> is returned
```

---

## TASK-E2-02 · Build Storefront Page (Product Catalog with Search & Filter)

**Type:** Task | **Priority:** 1 | **Effort:** 8 pts | **State:** To Do

### What to Build
Implement the main public-facing product catalog page. Users can browse all products in a responsive grid, search by keyword in real time, and filter by category. Clicking any product card navigates to the item detail page.

### Files to Work On
- `src/app/features/ecommerce/pages/storefront/storefront.component.ts`
- `src/app/features/ecommerce/pages/storefront/storefront.component.html`
- `src/app/features/ecommerce/pages/storefront/storefront.component.css`

### Functional Requirements
1. On `ngOnInit` call `EcommerceService.getProducts()` — show `<app-spinner>` while loading
2. Render products in a responsive **CSS grid** (3-col desktop, 2-col tablet, 1-col mobile)
3. **Search bar** (top of page): as the user types, filter the displayed products in real time using `debounceTime(300)` on a `FormControl` — **no page reload**
4. **Category filter**: horizontal chip/tab row with categories (`All`, `Tools`, `Equipment`, `Spare Parts`, `Hardware`). Active chip is highlighted. Filters the grid client-side
5. Clicking a product card → navigate to `/ecommerce/item-detail/:id`
6. Show a **cart badge** in the top-right corner showing `cartCount$` from `EcommerceService`
7. Each product card shows: image (or placeholder icon if no `imageUrl`), title, price, stock status badge, "Add to Cart" button

### Design Requirements
- Dark-themed page with card glassmorphism effect
- Product cards: subtle hover lift animation (`transform: translateY(-4px)` + shadow deepening)
- Stock status badge: green `active`, amber `low stock` (< 5), red `out-of-stock` — disable "Add to Cart" if out of stock
- Search bar: full-width with animated focus ring
- Category chips: pill-shaped, brand-colored active state
- Empty search state: friendly "No products found for '…'" illustration/text

### Acceptance Criteria
```
GIVEN a user visits /ecommerce/storefront
THEN all products load and display in a responsive grid with title, price, image, and stock badge

GIVEN the user types "drill" in the search bar
THEN only products with "drill" in their title or description are shown, without a page reload

GIVEN the user clicks the "Tools" category chip
THEN only products in the "Tools" category are displayed

GIVEN both a search term and a category filter are active
THEN only products matching BOTH criteria are shown

GIVEN a product has stockQuantity = 0
THEN the card shows an "Out of Stock" badge and the "Add to Cart" button is disabled

GIVEN the user clicks "Add to Cart" on a product card
THEN the item is added to the cart and the cart badge count increments immediately

GIVEN the user clicks a product card (not the button)
THEN they are navigated to /ecommerce/item-detail/:id
```

---

## TASK-E2-03 · Build Item Detail Page (Product Spec Sheet & Add-to-Cart Panel)

**Type:** Task | **Priority:** 1 | **Effort:** 5 pts | **State:** To Do

### What to Build
Implement the dedicated product detail page. It displays the full product spec sheet — description, price, stock level, category — and a panel to select quantity and add the product to the cart.

### Files to Work On
- `src/app/features/ecommerce/pages/item-detail/item-detail.component.ts`
- `src/app/features/ecommerce/pages/item-detail/item-detail.component.html`
- `src/app/features/ecommerce/pages/item-detail/item-detail.component.css`

### Functional Requirements
1. On `ngOnInit` read `itemId` from `ActivatedRoute.params`, call `EcommerceService.getProductById(itemId)`
2. Show `<app-spinner>` while loading; show an error banner if the request fails
3. Display:
   - Product image (large, with a branded placeholder if no `imageUrl`)
   - Title (`<h1>`)
   - Category badge
   - Price (formatted as `EGP 1,234.00`)
   - Stock availability badge (green / amber / red)
   - Full description paragraph
   - Supplier info (supplierId displayed as "Verified Supplier")
4. **Quantity selector**: `−` button, number display, `+` button. Min = 1, Max = `stockQuantity`
5. **"Add to Cart" button**: uses `<app-button>`. On click → `EcommerceService.addToCart(item, quantity)`, then show a brief success toast "Item added to cart!" for 2 seconds
6. **"Back to Store" link**: navigates back to `/ecommerce/storefront`

### Design Requirements
- Two-column layout: left = large product image, right = details + add-to-cart panel
- Sticky right panel on scroll (desktop)
- Quantity selector with premium rounded styling
- Toast notification: slides in from top-right, auto-dismisses after 2s

### Acceptance Criteria
```
GIVEN a user navigates to /ecommerce/item-detail/123
THEN a GET to /items/123 is made and all product details are displayed

GIVEN the product has no imageUrl
THEN a branded placeholder image/icon is shown (no broken image icon)

GIVEN the user sets quantity to 3 and clicks "Add to Cart"
THEN EcommerceService.addToCart(item, 3) is called and cartCount$ increases by 3

GIVEN the product stockQuantity is 0
THEN the "Add to Cart" button is disabled and shows "Out of Stock"

GIVEN the quantity selector is at 1
THEN the "−" button is disabled (cannot go below 1)

GIVEN the quantity selector is at stockQuantity
THEN the "+" button is disabled (cannot exceed available stock)

GIVEN "Add to Cart" is clicked
THEN a toast notification appears for 2 seconds then disappears automatically
```

---

## TASK-E2-04 · Build Cart Drawer Component (Flyout Cart Summary)

**Type:** Task | **Priority:** 1 | **Effort:** 5 pts | **State:** To Do

### What to Build
Build a slide-in cart drawer component that appears when the user clicks the cart icon in the navigation. It shows all cart items, allows quantity adjustment and item removal, displays the total, and has a "Proceed to Checkout" button.

### Files to Work On
- `src/app/features/ecommerce/pages/storefront/cart-drawer/cart-drawer.component.ts` *(new folder)*
- `src/app/features/ecommerce/pages/storefront/cart-drawer/cart-drawer.component.html`
- `src/app/features/ecommerce/pages/storefront/cart-drawer/cart-drawer.component.css`

### Inputs / Outputs
```typescript
@Input() isOpen: boolean = false;
@Output() closed = new EventEmitter<void>();
@Output() checkoutClicked = new EventEmitter<void>();
```

### Functional Requirements
1. Slides in from the **right side** of the screen when `isOpen = true`
2. Shows a semi-transparent dark overlay behind the drawer
3. Lists all cart items: thumbnail/icon, title, price × quantity, quantity `−/+` controls, remove `✕` button
4. Shows **Order Total** at the bottom
5. "Proceed to Checkout" button emits `checkoutClicked` event (parent navigates to `/ecommerce/checkout`)
6. Clicking the overlay or a close `✕` emits `closed` event
7. Empty cart state: icon + "Your cart is empty" + "Browse Products" link

### Design Requirements
- Drawer width: 400px desktop, 100vw mobile
- Smooth slide-in animation: `transform: translateX(100%)` → `translateX(0)` with `300ms ease`
- Backdrop: `rgba(0,0,0,0.6)` with fade-in animation
- Item rows: alternating subtle background, hover highlight
- Total row: large bold text, brand accent color

### Acceptance Criteria
```
GIVEN isOpen is set to true
THEN the drawer slides in from the right and the backdrop fades in

GIVEN the cart has 3 items
THEN all 3 items appear in the drawer with correct title, price, and quantity

GIVEN the user clicks "−" on a cart item with quantity 2
THEN quantity becomes 1 and the total updates immediately

GIVEN the user clicks "✕" on a cart item
THEN the item is removed and the list refreshes without full page reload

GIVEN the cart is empty
THEN the empty state message and "Browse Products" link are displayed

GIVEN the user clicks "Proceed to Checkout"
THEN the checkoutClicked event is emitted

GIVEN the user clicks the backdrop
THEN the drawer closes (closed event emitted)
```

---

## TASK-E2-05 · Build Checkout Page (Order Form & Invoice Modal)

**Type:** Task | **Priority:** 1 | **Effort:** 6 pts | **State:** To Do

### What to Build
Implement the checkout page where users review their cart, fill in a shipping form, and submit an order. On success, show an order invoice confirmation modal. On error, display an error banner without losing form data.

### Files to Work On
- `src/app/features/ecommerce/pages/checkout/checkout.component.ts` *(new folder)*
- `src/app/features/ecommerce/pages/checkout/checkout.component.html`
- `src/app/features/ecommerce/pages/checkout/checkout.component.css`
- `src/app/features/ecommerce/pages/checkout/order-confirmation-modal/order-confirmation-modal.component.ts` *(new)*
- `src/app/features/ecommerce/pages/checkout/order-confirmation-modal/order-confirmation-modal.component.html`
- `src/app/features/ecommerce/pages/checkout/order-confirmation-modal/order-confirmation-modal.component.css`

### Form Fields & Validation
| Field | Control Name | Validators |
|---|---|---|
| Full Name | `fullName` | Required, minLength(3) |
| Phone Number | `phone` | Required, pattern(`^\d{11}$`) |
| Shipping Address | `address` | Required, minLength(10) |
| City | `city` | Required |
| Payment Method | `paymentMethod` | Required (radio: Cash on Delivery / Card) |

### Functional Requirements
1. **Left panel**: checkout form built with `FormBuilder` using fields above; use `<app-input>` and `<app-button>`
2. **Right panel**: order summary — list of cart items (read from `EcommerceService.cart$`), subtotal, delivery fee (flat 50 EGP), **Grand Total**
3. On submit: validate form, show loading spinner in submit button, call `EcommerceService.placeOrder(payload)`
4. On success: `EcommerceService.clearCart()`, then show **Order Confirmation Modal** with the `OrderReceipt` data
5. Modal shows: Order ID, item list, grand total, estimated delivery — "Back to Home" button navigates to `/ecommerce/storefront`
6. On API error: show an error banner "Order failed. Please try again." and keep form intact
7. Guard: if cart is empty and user hits `/ecommerce/checkout` directly, redirect to `/ecommerce/storefront`

### Acceptance Criteria
```
GIVEN a user navigates to /ecommerce/checkout with items in cart
THEN the checkout form and cart summary are displayed

GIVEN the user submits the form with required fields missing
THEN all invalid fields are highlighted and no API call is made

GIVEN the user fills the form correctly and submits
THEN a POST to /orders is made with the correct payload, the submit button shows a spinner

GIVEN the order API returns success
THEN the cart is cleared and the Order Confirmation Modal appears with orderId and total

GIVEN the user clicks "Back to Home" in the confirmation modal
THEN they are navigated to /ecommerce/storefront

GIVEN the order API returns an error
THEN an error banner appears and the form data is preserved

GIVEN the cart is empty and the user navigates directly to /ecommerce/checkout
THEN they are redirected to /ecommerce/storefront
```

---

## TASK-E2-06 · Configure Ecommerce Routing Module

**Type:** Task | **Priority:** 1 | **Effort:** 2 pts | **State:** To Do

### What to Build
Configure the lazy-loaded child routing for the `EcommerceModule` so all storefront routes resolve correctly. Register the lazy-load entry in `app-routing.module.ts` (it is already there as a stub — just ensure it points to the correct components).

### Files to Work On
- `src/app/features/ecommerce/ecommerce-routing.module.ts`
- `src/app/app-routing.module.ts` *(verify — no new changes needed if already correct)*

### Required Routes
```typescript
const routes: Routes = [
  { path: '',            redirectTo: 'storefront', pathMatch: 'full' },
  { path: 'storefront',  component: StorefrontComponent },
  { path: 'item-detail/:id', component: ItemDetailComponent },
  { path: 'checkout',    component: CheckoutComponent },
];
```

### Acceptance Criteria
```
GIVEN a user navigates to /ecommerce
THEN they are redirected to /ecommerce/storefront

GIVEN a user navigates to /ecommerce/item-detail/abc
THEN the ItemDetailComponent renders with itemId = 'abc'

GIVEN a user navigates to /ecommerce/checkout
THEN the CheckoutComponent renders

GIVEN ng build is run
THEN the ecommerce module produces a separate lazy-loaded chunk (code splitting confirmed)
```

---

## TASK-E2-07 · Wire EcommerceModule (Declare & Import Everything)

**Type:** Task | **Priority:** 1 | **Effort:** 1 pt | **State:** To Do

### What to Build
Finalize `EcommerceModule` by declaring all page components and importing all required Angular and shared modules.

### Files to Work On
- `src/app/features/ecommerce/ecommerce.module.ts`

### Must Declare
- `StorefrontComponent`
- `ItemDetailComponent`
- `CartDrawerComponent`
- `CheckoutComponent`
- `OrderConfirmationModalComponent`

### Must Import
- `CommonModule`
- `ReactiveFormsModule`
- `RouterModule` (via `EcommerceRoutingModule`)
- `SharedModule` (provides `<app-button>`, `<app-input>`, `<app-spinner>`)

### Acceptance Criteria
```
GIVEN the ecommerce module is compiled
THEN ng build completes with 0 errors and 0 "unknown element" template warnings

GIVEN StorefrontComponent uses <app-button> and <app-spinner>
THEN they resolve correctly because SharedModule is imported
```

---

## TASK-E2-08 · Implement WorkerService (Job Feed & Status Update Logic)

**Type:** Task | **Priority:** 2 | **Effort:** 3 pts | **State:** To Do

### What to Build
Build the `WorkerService` that handles all HTTP calls for the worker portal. It fetches available gigs, the worker's active contracts, fetches individual job details, and posts status updates.

### Files to Work On
- `src/app/features/worker-portal/services/worker.service.ts`

### Methods Required
```typescript
@Injectable({ providedIn: 'root' })
export class WorkerService {
  getAvailableGigs(): Observable<Job[]>
  getActiveContracts(workerId: string): Observable<Job[]>
  getJobById(jobId: string): Observable<Job>
  updateJobStatus(jobId: string, status: JobStatus): Observable<Job>
}

// Define these interfaces in this file or a job.model.ts
export type JobStatus = 'available' | 'in-progress' | 'completed' | 'cancelled';

export interface Job {
  _id: string;
  title: string;
  description: string;
  clientName: string;
  clientPhone: string;
  address: string;
  scheduledDate: string;
  estimatedHours: number;
  payAmount: number;
  status: JobStatus;
  workerId?: string;
  checklist: ChecklistItem[];
  createdAt: string;
}

export interface ChecklistItem {
  task: string;
  completed: boolean;
}
```

### Endpoint Mapping
| Method | Endpoint |
|---|---|
| `getAvailableGigs()` | `GET /jobs?status=available` |
| `getActiveContracts()` | `GET /jobs?workerId=<id>&status=in-progress` |
| `getJobById()` | `GET /jobs/:id` |
| `updateJobStatus()` | `PUT /jobs/:id/status` with body `{ status }` |

### Mock Data (Phase 1 — before rebase)
```typescript
private mockJobs: Job[] = [
  { _id: 'j1', title: 'AC Unit Repair', description: 'Diagnose and fix residential AC', clientName: 'Ahmed Hassan', clientPhone: '01012345678', address: '12 Nasr City, Cairo', scheduledDate: '2026-06-20', estimatedHours: 3, payAmount: 350, status: 'available', checklist: [{ task: 'Inspect filters', completed: false }, { task: 'Check refrigerant', completed: false }], createdAt: new Date().toISOString() },
  { _id: 'j2', title: 'Electrical Panel Check', description: 'Full safety inspection', clientName: 'Sara Khalil', clientPhone: '01098765432', address: '5 Maadi, Cairo', scheduledDate: '2026-06-21', estimatedHours: 2, payAmount: 200, status: 'in-progress', workerId: 'w1', checklist: [{ task: 'Test circuits', completed: true }], createdAt: new Date().toISOString() },
];
```

### Acceptance Criteria
```
GIVEN getAvailableGigs() is called
THEN a GET to /jobs?status=available is made and Observable<Job[]> is returned

GIVEN getActiveContracts(workerId) is called
THEN a GET to /jobs?workerId=<id>&status=in-progress is made

GIVEN updateJobStatus('j1', 'in-progress') is called
THEN a PUT to /jobs/j1/status is made with body { status: 'in-progress' }

GIVEN the mock data phase is active
THEN the service returns mock data so the UI can be developed independently
```

---

## TASK-E2-09 · Build Worker Portal Home Page (Job Feed Dashboard)

**Type:** Task | **Priority:** 2 | **Effort:** 6 pts | **State:** To Do

### What to Build
Implement the worker's main dashboard page showing two columns side by side: "Available Gigs" on the left and "My Active Contracts" on the right. Workers can accept available gigs and see their active assignments.

### Files to Work On
- `src/app/features/worker-portal/pages/portal-home/portal-home.component.ts`
- `src/app/features/worker-portal/pages/portal-home/portal-home.component.html`
- `src/app/features/worker-portal/pages/portal-home/portal-home.component.css`

### Functional Requirements
1. On `ngOnInit`: call both `WorkerService.getAvailableGigs()` and `WorkerService.getActiveContracts(workerId)` in parallel using `forkJoin`
2. Show `<app-spinner>` while both calls are loading
3. **Left column — "Available Gigs"**: list of job cards with title, address, scheduled date, pay amount, estimated hours. Each card has a **"View Details"** button
4. **Right column — "My Active Contracts"**: list of active job cards with same info + status badge. Each card has **"View Contract"** button
5. Clicking "View Details" or "View Contract" → navigate to `/worker-portal/job-details/:id`
6. Empty state for each column: "No gigs available right now" / "No active contracts"
7. Job count badges: `Available (3)` / `Active (1)` shown in the column header

### Design Requirements
- Dark dashboard aesthetic with side-by-side card columns
- Status badge colors: `available` = blue, `in-progress` = amber, `completed` = green, `cancelled` = red
- Job cards: pay amount prominently displayed in brand accent color
- Subtle entrance animation for cards (staggered fade-in)
- Responsive: stacks to single column on mobile

### Acceptance Criteria
```
GIVEN an authenticated worker navigates to /worker-portal/portal-home
THEN both getAvailableGigs() and getActiveContracts() are called in parallel

GIVEN data is loading
THEN <app-spinner> is shown and columns are hidden

GIVEN 3 available gigs exist
THEN the left column shows 3 cards with title, pay, date, and "View Details" button

GIVEN the worker has 1 active contract
THEN the right column shows it with an "in-progress" status badge

GIVEN the worker clicks "View Contract" on an active job
THEN they navigate to /worker-portal/job-details/:id

GIVEN there are no available gigs
THEN the left column shows the empty state message (not blank)
```

---

## TASK-E2-10 · Build Job Details Page (Contract Breakdown & Status Actions)

**Type:** Task | **Priority:** 2 | **Effort:** 6 pts | **State:** To Do

### What to Build
Implement the full job details page. Workers can see all contract information, work through a task checklist, and update the job status (e.g., "Start Job" → `in-progress`, "Mark Complete" → `completed`).

### Files to Work On
- `src/app/features/worker-portal/pages/job-details/job-details.component.ts`
- `src/app/features/worker-portal/pages/job-details/job-details.component.html`
- `src/app/features/worker-portal/pages/job-details/job-details.component.css`

### Functional Requirements
1. On `ngOnInit`: read `jobId` from `ActivatedRoute.params`, call `WorkerService.getJobById(jobId)`
2. Show `<app-spinner>` while loading; show error banner on failure
3. **Display sections**:
   - **Header**: Job title, status badge, pay amount, scheduled date
   - **Client Info card**: client name, phone (tap-to-call link), address (link to maps)
   - **Job Description**: full description text
   - **Task Checklist**: interactive checkboxes — each checkbox item has the task text. Checking/unchecking is **visual only** (local state) unless you implement a save endpoint
   - **Time & Pay**: estimated hours, payment amount
4. **Action buttons** based on current status:
   - `available` → "Accept & Start Job" button → calls `updateJobStatus(id, 'in-progress')`, then refreshes
   - `in-progress` → "Mark as Completed" button → calls `updateJobStatus(id, 'completed')`, shows confirmation dialog first
   - `completed` → Read-only state, show "✅ Job Completed" banner
5. **"← Back to Dashboard"** link → navigate to `/worker-portal/portal-home`
6. Show `<app-spinner>` inside the action button while the status update is in-flight

### Design Requirements
- Full-width page with card sections separated by subtle dividers
- Client info card: icon + info layout (phone icon, map pin icon)
- Checklist: custom styled checkboxes with strikethrough text on completion
- Status badge in header updates immediately after successful status update
- Action button: full-width, prominent, brand-primary for "Start", success green for "Complete"

### Acceptance Criteria
```
GIVEN a worker navigates to /worker-portal/job-details/j1
THEN a GET to /jobs/j1 is made and all job info is displayed

GIVEN the job status is "available"
THEN only the "Accept & Start Job" button is visible

GIVEN the worker clicks "Accept & Start Job"
THEN a PUT to /jobs/j1/status with { status: 'in-progress' } is made,
     the status badge updates to "in-progress" and the button changes to "Mark as Completed"

GIVEN the worker clicks "Mark as Completed"
THEN a confirmation dialog appears before the API call is made

GIVEN the worker confirms completion
THEN a PUT to /jobs/j1/status with { status: 'completed' } is made,
     the page shows the "✅ Job Completed" banner and action buttons disappear

GIVEN the worker checks a checklist item
THEN the checkbox is ticked and the text gains a strikethrough style

GIVEN the API call fails
THEN an error banner appears and the status badge does NOT change
```

---

## TASK-E2-11 · Configure Worker Portal Routing Module

**Type:** Task | **Priority:** 2 | **Effort:** 1 pt | **State:** To Do

### What to Build
Configure the lazy-loaded child routing for `WorkerPortalModule`. Also add an `AuthGuard` to the `/worker-portal` route in `app-routing.module.ts` — workers must be logged in, but no role restriction is needed at the route level (the portal home handles role display).

### Files to Work On
- `src/app/features/worker-portal/worker-portal-routing.module.ts`
- `src/app/app-routing.module.ts` *(add `canActivate: [AuthGuard]` to the worker-portal route)*

### Required Routes
```typescript
// worker-portal-routing.module.ts
const routes: Routes = [
  { path: '',           redirectTo: 'portal-home', pathMatch: 'full' },
  { path: 'portal-home', component: PortalHomeComponent },
  { path: 'job-details/:id', component: JobDetailsComponent },
];

// app-routing.module.ts — update existing worker-portal entry
{
  path: 'worker-portal',
  canActivate: [AuthGuard],   // ADD THIS
  loadChildren: () => import('./features/worker-portal/worker-portal.module')
    .then(m => m.WorkerPortalModule)
}
```

### Acceptance Criteria
```
GIVEN a user navigates to /worker-portal
THEN they are redirected to /worker-portal/portal-home

GIVEN an unauthenticated user navigates to /worker-portal
THEN AuthGuard redirects to /auth/login

GIVEN a user navigates to /worker-portal/job-details/j1
THEN JobDetailsComponent renders with jobId = 'j1'
```

---

## TASK-E2-12 · Wire WorkerPortalModule (Declare & Import Everything)

**Type:** Task | **Priority:** 2 | **Effort:** 1 pt | **State:** To Do

### What to Build
Finalize `WorkerPortalModule` by declaring all components and importing the correct modules.

### Files to Work On
- `src/app/features/worker-portal/worker-portal.module.ts`

### Must Declare
- `PortalHomeComponent`
- `JobDetailsComponent`

### Must Import
- `CommonModule`
- `ReactiveFormsModule`
- `RouterModule` (via `WorkerPortalRoutingModule`)
- `SharedModule`

### Acceptance Criteria
```
GIVEN the worker-portal module is compiled
THEN ng build completes with 0 errors

GIVEN PortalHomeComponent uses <app-spinner> and <app-button>
THEN they resolve because SharedModule is imported
```

---

## TASK-E2-13 · Rebase & Replace Mock Data with Real Services

**Type:** Task | **Priority:** 3 | **Effort:** 3 pts | **State:** Blocked (waiting on Engineer 1 PR merge)

### What to Build
Once Engineer 1's `feature/epic-core-supplier` branch is merged into `main`, rebase this branch and replace all mock data / local BehaviorSubjects with real `ApiService` calls and the real `AuthService`.

### Files to Work On
- `src/app/features/ecommerce/services/ecommerce.service.ts`
- `src/app/features/worker-portal/services/worker.service.ts`

### Steps
```bash
# 1. Fetch and rebase
git fetch origin
git rebase origin/main

# 2. In ecommerce.service.ts
#    - Remove mockItems array
#    - Inject ApiService, replace of(mockItems) with this.apiService.get<Item[]>(...)

# 3. In worker.service.ts
#    - Remove mockJobs array
#    - Inject ApiService, replace of(mockJobs) with this.apiService.get<Job[]>(...)

# 4. In both services — inject real AuthService to get currentUser$ for workerId/supplierId

# 5. Build and verify
ng build
```

### Acceptance Criteria
```
GIVEN Engineer 1's PR is merged to main
WHEN this branch is rebased
THEN no mock data remains — all HTTP calls go through ApiService

GIVEN the app runs against the real API
THEN all storefront and worker portal features work end-to-end with live data

GIVEN ng build is run after rebase
THEN 0 compilation errors
```

---

## 📋 Summary Table

| Task ID | Title | Priority | Effort | Dependency |
|---|---|---|---|---|
| TASK-E2-01 | Implement EcommerceService | 1 | 5 pts | None (mock phase) |
| TASK-E2-02 | Build Storefront Page | 1 | 8 pts | TASK-E2-01 |
| TASK-E2-03 | Build Item Detail Page | 1 | 5 pts | TASK-E2-01 |
| TASK-E2-04 | Build Cart Drawer Component | 1 | 5 pts | TASK-E2-01 |
| TASK-E2-05 | Build Checkout Page & Invoice Modal | 1 | 6 pts | TASK-E2-01, E2-04 |
| TASK-E2-06 | Configure Ecommerce Routing | 1 | 2 pts | TASK-E2-02, E2-03, E2-05 |
| TASK-E2-07 | Wire EcommerceModule | 1 | 1 pt | TASK-E2-06 |
| TASK-E2-08 | Implement WorkerService | 2 | 3 pts | None (mock phase) |
| TASK-E2-09 | Build Worker Portal Home | 2 | 6 pts | TASK-E2-08 |
| TASK-E2-10 | Build Job Details Page | 2 | 6 pts | TASK-E2-08 |
| TASK-E2-11 | Configure Worker Portal Routing | 2 | 1 pt | TASK-E2-09, E2-10 |
| TASK-E2-12 | Wire WorkerPortalModule | 2 | 1 pt | TASK-E2-11 |
| TASK-E2-13 | Rebase & Replace Mock Data | 3 | 3 pts | **Blocked: E1 PR merge** |

**Total Effort: ~52 story points**

---

## 🔀 Branching & Integration Workflow

```
main  ──────────────────────────────────────────────► merge PR E2
         │
         ├── feature/epic-core-supplier  (Engineer 1)
         │         └── PR merged to main ────────────────┐
         │                                                │
         └── feature/epic-storefront-worker (Engineer 2) │
                   ├── Phase 1: mock data (Tasks 01–12)   │
                   └── Phase 2: rebase + wire (Task 13) ◄─┘
```

---

## Definition of Done (Applies to ALL tasks)
- [ ] Code compiles with `ng build` — zero errors
- [ ] All acceptance criteria pass via manual browser testing
- [ ] No `any` types used without a justifying comment
- [ ] Templates use `<app-button>`, `<app-input>`, `<app-spinner>` — no raw HTML equivalents
- [ ] Cart state always comes from `EcommerceService` — never from component-local variables
- [ ] PR description lists which acceptance criteria were manually tested
- [ ] Branch `feature/epic-storefront-worker` — PR targets `main`
