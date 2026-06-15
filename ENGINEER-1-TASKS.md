# 👷 Engineer 1 — Azure DevOps Task Board
**Epic:** Core Architecture, Shared Components & Supplier Portal
**Branch:** `feature/epic-core-supplier`
**Sprint:** Sprint 1
**Area:** m3allem
**Assigned To:** Engineer 1

---

## How to Use This File
Each task below maps directly to a work item in Azure DevOps. Copy the **Title**, **Description**, **Files to Work On**, and **Acceptance Criteria** into the corresponding fields when creating the work item. Priority 1 = highest urgency.

---

---

## TASK-E1-01 · Bootstrap Core Module & Singleton Wiring

**Type:** Task | **Priority:** 1 | **Effort:** 3 pts | **State:** To Do

### What to Build
Configure `CoreModule` as the application-wide singleton module. Register the `JwtInterceptor` using Angular's `HTTP_INTERCEPTORS` multi-provider so it runs on every outgoing HTTP request. Ensure `CoreModule` is imported **once** in `AppModule` and throws an error if imported more than once (guard against re-import).

### Files to Work On
- `src/app/core/core.module.ts`
- `src/app/app-module.ts`

### Implementation Details
- Declare `CoreModule` with `providers: [{ provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }]`
- Add a re-import guard constructor: `constructor(@Optional() @SkipSelf() parentModule: CoreModule) { if (parentModule) throw new Error(...) }`
- Import `HttpClientModule` inside `CoreModule` (do NOT import it anywhere else)
- Import `CoreModule` in `AppModule`

### Acceptance Criteria
```
GIVEN the application starts
WHEN AppModule bootstraps
THEN CoreModule is loaded exactly once with HttpClientModule and JwtInterceptor registered globally

GIVEN a developer accidentally imports CoreModule in a feature module
WHEN Angular initializes
THEN an Error is thrown with message "CoreModule already loaded. Import only in AppModule."
```

---

## TASK-E1-02 · Implement AuthService (Login, Token Cache & Session State)

**Type:** Task | **Priority:** 1 | **Effort:** 5 pts | **State:** To Do

### What to Build
Build the `AuthService` singleton that handles all authentication logic:
- Call `POST /auth/login` with credentials and cache the returned JWT to `localStorage`
- Expose a reactive `currentUser$` BehaviorSubject so components can subscribe to the active user session
- Provide a `logout()` method that clears the token and resets the observable
- Provide a `getToken()` helper used by `JwtInterceptor`

### Files to Work On
- `src/app/core/services/auth.service.ts`

### Implementation Details
```typescript
// Shape of the service (do NOT copy blindly — implement fully)
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'm3allem_token';
  currentUser$ = new BehaviorSubject<User | null>(null);

  login(email: string, password: string): Observable<void>
  logout(): void
  getToken(): string | null
  isLoggedIn(): boolean
  hasRole(role: string): boolean   // used by guards
}
```
- On `login()` success: store token in `localStorage`, decode the JWT payload (or use the user object from response), push to `currentUser$`
- On app startup (constructor): attempt to restore session from `localStorage` token if still valid

### Acceptance Criteria
```
GIVEN a user submits valid credentials
WHEN login() is called
THEN POST /auth/login is called, the JWT is saved to localStorage under key 'm3allem_token',
     and currentUser$ emits the logged-in User object

GIVEN a user is logged in
WHEN logout() is called
THEN the token is removed from localStorage and currentUser$ emits null

GIVEN the app is refreshed with a token still in localStorage
WHEN AuthService initializes
THEN it restores the session and currentUser$ emits the cached User object (not null)

GIVEN hasRole('supplier') is called for a user whose role is 'client'
THEN it returns false
```

---

## TASK-E1-03 · Implement ApiService (Generic HTTP Wrapper)

**Type:** Task | **Priority:** 1 | **Effort:** 3 pts | **State:** To Do

### What to Build
Build a thin, typed wrapper around Angular's `HttpClient` that centralises the base URL and provides clean typed methods for `GET`, `POST`, `PUT`, and `DELETE`. All feature services (`InventoryService`, `EcommerceService`) must use `ApiService` — never `HttpClient` directly.

### Files to Work On
- `src/app/core/services/api.service.ts`

### Implementation Details
```typescript
@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = environment.apiUrl;   // e.g. 'https://api.m3allem.com/api'

  get<T>(endpoint: string): Observable<T>
  post<T>(endpoint: string, body: unknown): Observable<T>
  put<T>(endpoint: string, body: unknown): Observable<T>
  delete<T>(endpoint: string): Observable<T>
}
```
- Each method prepends `this.baseUrl + endpoint`
- Return the raw `Observable<T>` — let calling services handle `catchError`

### Acceptance Criteria
```
GIVEN any feature service calls apiService.get<Item[]>('/inventory')
THEN an HTTP GET request is made to environment.apiUrl + '/inventory'
     with the correct generic return type

GIVEN apiService.post<Order>('/orders', payload) is called
THEN an HTTP POST is made with the payload serialized as JSON in the body

GIVEN a 401 response is returned
THEN the Observable errors — error handling is the caller's responsibility
```

---

## TASK-E1-04 · Implement JwtInterceptor (Bearer Token Injection)

**Type:** Task | **Priority:** 1 | **Effort:** 2 pts | **State:** To Do

### What to Build
Implement the `JwtInterceptor` that intercepts **every** outgoing HTTP request, retrieves the JWT from `AuthService.getToken()`, and clones the request adding the `Authorization: Bearer <token>` header. If no token exists, the request passes through unmodified.

### Files to Work On
- `src/app/core/interceptors/jwt.interceptor.ts`

### Implementation Details
```typescript
@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.authService.getToken();
    if (token) {
      req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
    }
    return next.handle(req);
  }
}
```

### Acceptance Criteria
```
GIVEN a user is authenticated and has a token in localStorage
WHEN any HTTP request is dispatched via ApiService
THEN the outgoing request headers contain: Authorization: Bearer <token>

GIVEN no token exists in localStorage (user is not logged in)
WHEN an HTTP request is dispatched
THEN the request is forwarded without an Authorization header (no error thrown)
```

---

## TASK-E1-05 · Implement AuthGuard (Route Protection)

**Type:** Task | **Priority:** 1 | **Effort:** 2 pts | **State:** To Do

### What to Build
Implement `AuthGuard` (functional or class-based) that blocks navigation to any protected route for unauthenticated users and redirects them to `/auth/login`.

### Files to Work On
- `src/app/core/guards/auth.guard.ts`
- `src/app/app-routing.module.ts` (apply guard to protected routes)

### Implementation Details
- Check `AuthService.isLoggedIn()` — if `true`, allow navigation (`return true`)
- If `false`, call `router.navigate(['/auth/login'])` and return `false`

### Acceptance Criteria
```
GIVEN an unauthenticated user
WHEN they navigate directly to any protected route (e.g., /supplier-dashboard)
THEN they are redirected to /auth/login and cannot access the page

GIVEN an authenticated user
WHEN they navigate to a protected route
THEN navigation proceeds normally and the route renders
```

---

## TASK-E1-06 · Implement SupplierGuard (Role-Based Route Protection)

**Type:** Task | **Priority:** 1 | **Effort:** 2 pts | **State:** To Do

### What to Build
Implement `SupplierGuard` that extends authentication checking by also verifying the user has the `'supplier'` role. Non-supplier authenticated users (e.g., workers, clients) are redirected to `/ecommerce/storefront`.

### Files to Work On
- `src/app/core/guards/supplier.guard.ts`
- `src/app/app-routing.module.ts` (apply to supplier-dashboard routes)

### Implementation Details
- If `AuthService.hasRole('supplier')` returns `true` → allow
- If authenticated but wrong role → redirect to `/ecommerce/storefront`, return `false`
- If not authenticated at all → redirect to `/auth/login`, return `false`

### Acceptance Criteria
```
GIVEN an authenticated user with role 'client' or 'worker'
WHEN they navigate to /supplier-dashboard
THEN SupplierGuard blocks them and redirects to /ecommerce/storefront

GIVEN an unauthenticated user
WHEN they navigate to /supplier-dashboard
THEN SupplierGuard redirects to /auth/login

GIVEN an authenticated user with role 'supplier'
WHEN they navigate to /supplier-dashboard
THEN navigation proceeds and the dashboard renders
```

---

## TASK-E1-07 · Define Shared Data Models (User & Item Interfaces)

**Type:** Task | **Priority:** 1 | **Effort:** 1 pt | **State:** To Do

### What to Build
Define and export the two core TypeScript interfaces that act as the **shared contract** between Engineer 1 (auth/supplier) and Engineer 2 (storefront/worker). These interfaces must be finalized **before** any feature work begins so both engineers can code against stable types.

### Files to Work On
- `src/app/shared/models/user.model.ts`
- `src/app/shared/models/item.model.ts`

### Implementation Details
```typescript
// user.model.ts
export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'client' | 'worker' | 'supplier' | 'admin';
  phone?: string;
  createdAt: string;
}

// item.model.ts
export interface Item {
  _id: string;
  supplierId: string;
  title: string;
  description: string;
  price: number;
  stockQuantity: number;
  category: string;
  imageUrl?: string;
  status: 'active' | 'out-of-stock' | 'draft';
  createdAt: string;
}
```

### Acceptance Criteria
```
GIVEN any component or service imports User or Item from their respective model files
THEN TypeScript compiles without type errors

GIVEN a backend response is typed as User
THEN all fields (including optional ones) match the interface definition exactly

GIVEN role field is set to any value other than 'client' | 'worker' | 'supplier' | 'admin'
THEN TypeScript produces a compile-time type error
```

---

## TASK-E1-08 · Build AppButton Shared Component (`app-button`)

**Type:** Task | **Priority:** 2 | **Effort:** 3 pts | **State:** To Do

### What to Build
Create a premium, reusable button component that wraps the native `<button>` element with consistent styling, loading state support, and disabled state handling.

### Files to Work On
- `src/app/shared/components/button/button.component.ts`
- `src/app/shared/components/button/button.component.html`
- `src/app/shared/components/button/button.component.css`
- `src/app/shared/shared.module.ts` (declare & export component)

### Inputs / Outputs
```typescript
@Input() label: string = 'Submit';
@Input() type: 'button' | 'submit' | 'reset' = 'button';
@Input() variant: 'primary' | 'secondary' | 'danger' = 'primary';
@Input() isLoading: boolean = false;
@Input() disabled: boolean = false;
@Output() clicked = new EventEmitter<void>();
```

### Design Requirements
- Show a spinner icon (or CSS spinner) when `isLoading = true` and disable click events
- `primary` variant: gradient background (brand color), white text
- `secondary` variant: transparent background, brand border
- `danger` variant: red tones for destructive actions
- Smooth `transform: scale(0.97)` + opacity transition on hover/active

### Acceptance Criteria
```
GIVEN a developer adds <app-button label="Save" [isLoading]="true">
WHEN rendered in a browser
THEN the button shows a spinner, is visually disabled, and click events do not fire

GIVEN <app-button variant="danger" label="Delete">
THEN the button renders in red tones, distinct from the primary style

GIVEN [disabled]="true" is set
THEN the native button has the disabled HTML attribute and cursor changes to not-allowed

GIVEN the button is rendered in SharedModule consumers
THEN no extra imports are needed in the feature module
```

---

## TASK-E1-09 · Build AppInput Shared Component (`app-input`)

**Type:** Task | **Priority:** 2 | **Effort:** 3 pts | **State:** To Do

### What to Build
Create a reusable, form-friendly input component that supports `ControlValueAccessor` so it works seamlessly with Angular Reactive Forms (`formControlName`). Must display inline validation error messages.

### Files to Work On
- `src/app/shared/components/input/input.component.ts`
- `src/app/shared/components/input/input.component.html`
- `src/app/shared/components/input/input.component.css`
- `src/app/shared/shared.module.ts` (declare & export)

### Inputs / Outputs
```typescript
@Input() label: string = '';
@Input() placeholder: string = '';
@Input() type: 'text' | 'email' | 'password' | 'number' = 'text';
@Input() errorMessage: string = '';      // shown when control is invalid & touched
@Input() formControlName: string = '';   // works via ControlValueAccessor
```

### Design Requirements
- Label floats above the input on focus (floating label animation)
- Red bottom-border + error message shown when `touched && invalid`
- Green checkmark icon when `touched && valid`
- Smooth focus ring with brand color

### Acceptance Criteria
```
GIVEN a Reactive Form uses <app-input formControlName="email" label="Email">
WHEN the user focuses, types, then blurs leaving the field empty
THEN a red error message appears below the input

GIVEN the input has a valid value and the user blurs
THEN the input shows a green valid state indicator

GIVEN the developer does NOT wrap the component in a form
THEN no console errors are thrown (graceful fallback)
```

---

## TASK-E1-10 · Build AppSpinner Shared Component (`app-spinner`)

**Type:** Task | **Priority:** 2 | **Effort:** 1 pt | **State:** To Do

### What to Build
Create a lightweight, premium loading spinner component for use during async operations.

### Files to Work On
- `src/app/shared/components/spinner/spinner.component.ts`
- `src/app/shared/components/spinner/spinner.component.html`
- `src/app/shared/components/spinner/spinner.component.css`
- `src/app/shared/shared.module.ts` (declare & export)

### Inputs
```typescript
@Input() size: 'sm' | 'md' | 'lg' = 'md';   // controls width/height
@Input() color: string = 'var(--brand-primary)'; // CSS color string
```

### Design Requirements
- Pure CSS animated circular spinner (no external library)
- Smooth infinite rotation animation
- Centers itself in its parent container by default

### Acceptance Criteria
```
GIVEN <app-spinner size="lg"> is placed in a template
THEN a large rotating circular spinner appears on screen

GIVEN size="sm"
THEN the spinner is visually smaller than the default

GIVEN the spinner is rendered
THEN no layout shift occurs and it does not block surrounding content
```

---

## TASK-E1-11 · Wire SharedModule (Declare & Export All Shared Pieces)

**Type:** Task | **Priority:** 2 | **Effort:** 1 pt | **State:** To Do

### What to Build
Update `SharedModule` to properly declare all three UI components and export them so any feature module that imports `SharedModule` can use them without additional imports.

### Files to Work On
- `src/app/shared/shared.module.ts`

### Must Declare & Export
- `ButtonComponent`
- `InputComponent`
- `SpinnerComponent`

### Must Import
- `CommonModule`
- `ReactiveFormsModule`
- `FormsModule`

### Acceptance Criteria
```
GIVEN SupplierDashboardModule imports SharedModule
WHEN a template uses <app-button>, <app-input>, or <app-spinner>
THEN Angular compiles without "unknown element" errors

GIVEN SharedModule is imported by two different feature modules
THEN no duplicate declaration errors occur at runtime
```

---

## TASK-E1-12 · Implement InventoryService (HTTP Logic for Supplier Inventory)

**Type:** Task | **Priority:** 2 | **Effort:** 3 pts | **State:** To Do

### What to Build
Build the `InventoryService` that handles all HTTP calls related to the supplier's inventory. It must use `ApiService` (not `HttpClient` directly).

### Files to Work On
- `src/app/features/supplier-dashboard/services/inventory.service.ts`

### Methods Required
```typescript
@Injectable({ providedIn: 'root' })
export class InventoryService {
  getInventory(supplierId: string): Observable<Item[]>
  getItemById(itemId: string): Observable<Item>
  createItem(item: Partial<Item>): Observable<Item>
  updateItem(itemId: string, item: Partial<Item>): Observable<Item>
  deleteItem(itemId: string): Observable<void>
}
```

### Endpoint Mapping
| Method | Endpoint |
|---|---|
| `getInventory()` | `GET /inventory?supplierId=<id>` |
| `getItemById()` | `GET /inventory/:id` |
| `createItem()` | `POST /inventory` |
| `updateItem()` | `PUT /inventory/:id` |
| `deleteItem()` | `DELETE /inventory/:id` |

### Acceptance Criteria
```
GIVEN the supplier is authenticated and supplierId is available
WHEN getInventory(supplierId) is called
THEN a GET request is sent to /inventory?supplierId=<id> and returns Observable<Item[]>

GIVEN createItem(payload) is called with valid item data
THEN a POST to /inventory is made and the newly created Item is returned

GIVEN updateItem(id, changes) is called
THEN a PUT to /inventory/:id is made with the changes in the request body
```

---

## TASK-E1-13 · Build Inventory Page (Supplier Stock List View)

**Type:** Task | **Priority:** 2 | **Effort:** 5 pts | **State:** To Do

### What to Build
Implement the supplier's main inventory page that displays all products belonging to the logged-in supplier in a responsive table/card grid. Include action buttons for Edit and Delete on each row.

### Files to Work On
- `src/app/features/supplier-dashboard/pages/inventory/inventory.component.ts`
- `src/app/features/supplier-dashboard/pages/inventory/inventory.component.html`
- `src/app/features/supplier-dashboard/pages/inventory/inventory.component.css`

### Functional Requirements
1. On `ngOnInit`, fetch the supplier's ID from `AuthService.currentUser$` then call `InventoryService.getInventory(supplierId)`
2. Display `<app-spinner>` while loading
3. Render a table/grid with columns: **Title**, **Category**, **Price**, **Stock Quantity**, **Status** (badge), **Actions**
4. "Add Product" button routes to `../submit-item`
5. "Edit" button on each row routes to `../submit-item/:itemId`
6. "Delete" button opens a confirmation dialog (or `window.confirm`), then calls `deleteItem()` and refreshes the list

### Design Requirements
- Status badge: green for `active`, red for `out-of-stock`, grey for `draft`
- Table rows have hover highlight
- Empty state: show a friendly "No products yet. Add your first item!" message with an icon

### Acceptance Criteria
```
GIVEN a supplier navigates to /supplier-dashboard/inventory
THEN an HTTP GET to /inventory?supplierId=<id> is made and all their products appear in the table

GIVEN products are loading
THEN <app-spinner> is visible and the table is hidden

GIVEN no products exist for the supplier
THEN an empty-state message is shown (not a blank page or error)

GIVEN the supplier clicks "Edit" on a product row
THEN they are navigated to /supplier-dashboard/submit-item/:itemId

GIVEN the supplier clicks "Delete" and confirms
THEN the item is removed from the backend and disappears from the table without full page reload
```

---

## TASK-E1-14 · Build Submit-Item Page (Add / Edit Product Form)

**Type:** Task | **Priority:** 2 | **Effort:** 5 pts | **State:** To Do

### What to Build
Implement the reactive form page for creating a new product or editing an existing one. The same component handles both modes: if an `itemId` route param is present, it pre-fills the form (Edit mode); otherwise it renders a blank form (Create mode).

### Files to Work On
- `src/app/features/supplier-dashboard/pages/submit-item/submit-item.component.ts`
- `src/app/features/supplier-dashboard/pages/submit-item/submit-item.component.html`
- `src/app/features/supplier-dashboard/pages/submit-item/submit-item.component.css`

### Form Fields & Validation Rules
| Field | Control Name | Validators |
|---|---|---|
| Title | `title` | Required, minLength(3) |
| Description | `description` | Required |
| Price | `price` | Required, min(0) |
| Stock Quantity | `stockQuantity` | Required, min(0) |
| Category | `category` | Required |
| Image URL | `imageUrl` | Optional, pattern(URL) |
| Status | `status` | Required (dropdown: active/out-of-stock/draft) |

### Functional Requirements
1. Use `FormBuilder` to build a `FormGroup` with the controls above
2. **Edit mode**: if `ActivatedRoute.params` has `itemId`, call `getItemById(itemId)` and `patchValue()` the form
3. On submit: validate form, show `<app-spinner>` in the submit button, call `createItem()` or `updateItem()`
4. On success: navigate back to `../inventory`
5. On error: display an error banner (do not navigate away)
6. Use `<app-input>` and `<app-button>` components throughout

### Acceptance Criteria
```
GIVEN a supplier navigates to /supplier-dashboard/submit-item (no itemId)
THEN an empty form renders with all required fields

GIVEN a supplier navigates to /supplier-dashboard/submit-item/abc123
THEN the form is pre-populated with the data for item abc123

GIVEN the supplier submits the form with missing required fields
THEN all invalid fields are highlighted and no HTTP request is made

GIVEN the supplier submits a valid create form
THEN a POST to /inventory is made, and on success they are redirected to the inventory list

GIVEN the supplier submits a valid edit form
THEN a PUT to /inventory/:id is made, and on success they are redirected to the inventory list

GIVEN the API returns an error (e.g., 500)
THEN an error message banner appears and the user stays on the form page
```

---

## TASK-E1-15 · Configure SupplierDashboard Routing Module

**Type:** Task | **Priority:** 2 | **Effort:** 1 pt | **State:** To Do

### What to Build
Configure the lazy-loaded child routing for the Supplier Dashboard feature module so that routes resolve to the correct page components with the correct guards applied.

### Files to Work On
- `src/app/features/supplier-dashboard/supplier-dashboard-routing.module.ts`
- `src/app/app-routing.module.ts` (register lazy-load for supplier-dashboard)

### Required Routes
```typescript
// supplier-dashboard-routing.module.ts
const routes: Routes = [
  { path: '',         redirectTo: 'inventory', pathMatch: 'full' },
  { path: 'inventory',   component: InventoryComponent },
  { path: 'submit-item',    component: SubmitItemComponent },
  { path: 'submit-item/:itemId', component: SubmitItemComponent },
];

// app-routing.module.ts  — lazy-load entry
{
  path: 'supplier-dashboard',
  canActivate: [AuthGuard, SupplierGuard],
  loadChildren: () => import('./features/supplier-dashboard/supplier-dashboard.module')
    .then(m => m.SupplierDashboardModule)
}
```

### Acceptance Criteria
```
GIVEN a user navigates to /supplier-dashboard
THEN they are redirected to /supplier-dashboard/inventory

GIVEN an unauthenticated user hits /supplier-dashboard
THEN AuthGuard redirects to /auth/login (SupplierGuard is never reached)

GIVEN an authenticated non-supplier user hits /supplier-dashboard
THEN SupplierGuard redirects to /ecommerce/storefront

GIVEN the supplier-dashboard module is lazy-loaded
THEN running ng build produces a separate chunk for it (code-splitting works)
```

---

## TASK-E1-16 · Wire SupplierDashboardModule (Declare & Import Everything)

**Type:** Task | **Priority:** 2 | **Effort:** 1 pt | **State:** To Do

### What to Build
Finalize `SupplierDashboardModule` by declaring all supplier page components and importing the necessary Angular and shared modules.

### Files to Work On
- `src/app/features/supplier-dashboard/supplier-dashboard.module.ts`

### Must Declare
- `InventoryComponent`
- `SubmitItemComponent`

### Must Import
- `CommonModule`
- `ReactiveFormsModule`
- `RouterModule` (via `SupplierDashboardRoutingModule`)
- `SharedModule` (gives access to `app-button`, `app-input`, `app-spinner`)

### Acceptance Criteria
```
GIVEN the supplier-dashboard module is compiled
THEN ng build completes with 0 errors and 0 "unknown element" warnings

GIVEN InventoryComponent uses <app-button> and <app-spinner>
THEN they render correctly because SharedModule is imported in SupplierDashboardModule
```

---

## 📋 Summary Table

| Task ID | Title | Priority | Effort | Dependency |
|---|---|---|---|---|
| TASK-E1-01 | Bootstrap Core Module & Singleton Wiring | 1 | 3 pts | None |
| TASK-E1-02 | Implement AuthService | 1 | 5 pts | TASK-E1-01 |
| TASK-E1-03 | Implement ApiService | 1 | 3 pts | TASK-E1-01 |
| TASK-E1-04 | Implement JwtInterceptor | 1 | 2 pts | TASK-E1-02, TASK-E1-03 |
| TASK-E1-05 | Implement AuthGuard | 1 | 2 pts | TASK-E1-02 |
| TASK-E1-06 | Implement SupplierGuard | 1 | 2 pts | TASK-E1-02 |
| TASK-E1-07 | Define Shared Data Models | 1 | 1 pt | None |
| TASK-E1-08 | Build AppButton Component | 2 | 3 pts | TASK-E1-07 |
| TASK-E1-09 | Build AppInput Component | 2 | 3 pts | TASK-E1-07 |
| TASK-E1-10 | Build AppSpinner Component | 2 | 1 pt | None |
| TASK-E1-11 | Wire SharedModule | 2 | 1 pt | TASK-E1-08, E1-09, E1-10 |
| TASK-E1-12 | Implement InventoryService | 2 | 3 pts | TASK-E1-03, E1-07 |
| TASK-E1-13 | Build Inventory Page | 2 | 5 pts | TASK-E1-11, E1-12 |
| TASK-E1-14 | Build Submit-Item Page | 2 | 5 pts | TASK-E1-11, E1-12 |
| TASK-E1-15 | Configure Supplier Routing Module | 2 | 1 pt | TASK-E1-05, E1-06 |
| TASK-E1-16 | Wire SupplierDashboardModule | 2 | 1 pt | TASK-E1-11, E1-15 |

**Total Effort: ~41 story points**

---

## Definition of Done (Applies to ALL tasks)
- [ ] Code compiles with `ng build` — zero errors
- [ ] All acceptance criteria pass via manual testing
- [ ] No `any` types used without justification in a comment
- [ ] Component templates use `app-button`, `app-input`, `app-spinner` (not raw HTML equivalents)
- [ ] PR description includes which acceptance criteria were tested
- [ ] Branch `feature/epic-core-supplier` — PR targets `main`
