# KuberPulse — Modern Mobile-First Personal Expense & Savings Intelligence

> **Production-grade personal expense management web application with explainable AI/algorithmic savings recommendations, automated monthly budget tracking, and Supabase PostgreSQL persistence.**

---

## 1. Project Overview & Aesthetic
KuberPulse is crafted around modern SaaS productivity aesthetics:
- **Palette**: Soft off-white canvas (`#F4F6F3`), crisp pure white cards (`#FFFFFF`), near-black typography (`#121417`), and energetic chartreuse/lime accents (`#D4F938`).
- **Typography**: Google Fonts *Plus Jakarta Sans* for headers and UI, and *JetBrains Mono* for tabular numeric figures.
- **Mobile-First UX**: Responsive touch interactions, bottom sheet modals on phones, bottom navigation bar with an elevated center (+) Add Expense button, collapsible desktop sidebar on larger displays, and zero horizontal scrolling.
- **Hero Feature**: **"WHERE CAN I SAVE?"** — A deterministic, explainable intelligence engine that calculates discretionary overspending, historical month-over-month surges, and provides actionable recommendations with potential monthly retention ranges.

---

## 2. Architecture & File Structure

```
├── .env.example                     # Environment template
├── .env                             # Local environment variables
├── index.html                       # HTML5 shell with meta tags & typography
├── package.json                     # Vite + React 19 + Supabase + Lucide
├── supabase/
│   └── schema.sql                   # Complete PostgreSQL schema, triggers & RLS policies
├── src/
│   ├── main.jsx                     # Application entry point
│   ├── App.jsx                      # Root container & modal host
│   ├── index.css                    # Unified stylesheet index
│   ├── styles/
│   │   ├── variables.css            # Design tokens, palette & radii
│   │   ├── base.css                 # Base resets, typography, scrollbars
│   │   ├── components.css           # Cards, buttons, pills, progress bars
│   │   ├── layout.css               # Desktop sidebar, mobile bottom nav, grids
│   │   └── animations.css           # Micro-interactions, bottom sheets, skeletons
│   ├── lib/
│   │   ├── supabase.js              # Supabase client with runtime fallback
│   │   ├── constants.js             # Categories, payment channels, currencies
│   │   └── mockData.js              # Realistic Indian Rupee (₹) seed dataset
│   ├── context/
│   │   ├── AuthContext.jsx          # Supabase Auth, persistent session & demo mode
│   │   └── ExpenseContext.jsx       # State management, calculations & CRUD
│   ├── services/
│   │   ├── expenseService.js        # Supabase CRUD + offline sandbox fallback
│   │   ├── incomeService.js         # Supabase income tracking + fallback
│   │   ├── budgetService.js         # Monthly & category budgets upsert
│   │   ├── categoryService.js       # Categories service
│   │   └── profileService.js        # User profile & preferences
│   ├── utils/
│   │   ├── formatters.js            # INR formatters, relative dates, percentages
│   │   ├── recommendationEngine.js  # "Where Can I Save?" intelligence logic
│   │   └── analyticsEngine.js       # Month-over-month deltas, cash flow, trends
│   ├── components/
│   │   ├── common/                  # AnimatedCounter, CategoryIcon, Toast
│   │   ├── layout/                  # Header, Sidebar, MobileBottomNav, Layout
│   │   ├── dashboard/               # FinancialOverview, SpendingChart, WhereCanISave,
│   │   │                            # CategoryBreakdown, BudgetProgress, MonthComparison,
│   │   │                            # SmartInsights, RecentTransactions
│   │   ├── expenses/                # ExpenseFormModal (Mobile Bottom Sheet)
│   │   ├── income/                  # IncomeFormModal
│   │   ├── budgets/                 # BudgetFormModal
│   │   └── savings/                 # SavingsDetailModal (Simulator & Drilldown)
│   └── pages/
│       ├── DashboardPage.jsx        # Complete financial dashboard
│       ├── ExpensesPage.jsx         # Search, filters, sorting, CSV export
│       ├── IncomePage.jsx           # Multi-stream income management
│       ├── AnalyticsPage.jsx        # Inflow vs outflow, discretionary ratios
│       ├── SavingsIntelligencePage.jsx # Full "Where Can I Save?" hub & simulator
│       ├── BudgetsPage.jsx          # Master & category budget limits
│       ├── ProfilePage.jsx          # Settings, currency, Supabase linker
│       └── AuthPage.jsx             # Sign in, Sign up, Password reset
```

---

## 3. Database Schema & Row-Level Security (RLS)

All database definitions are located in [`supabase/schema.sql`](file:///c:/Users/gumma/OneDrive/Desktop/daily%20expenses%20project/supabase/schema.sql).

### Tables:
1. **`profiles`**:
   - `id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE`
   - `full_name TEXT`, `email TEXT`, `avatar_url TEXT`
   - `currency TEXT DEFAULT 'INR'`
   - `monthly_savings_goal NUMERIC(12, 2) DEFAULT 5000.00`
   - Trigger `on_auth_user_created` creates a profile automatically on sign up.
2. **`categories`**:
   - `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
   - `user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE` (NULL for 11 default system categories)
   - `name TEXT`, `icon TEXT`, `color TEXT`, `type TEXT`, `is_discretionary BOOLEAN`
3. **`expenses`**:
   - `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
   - `user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL`
   - `category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL`
   - `amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0)`
   - `description TEXT NOT NULL`, `expense_date DATE DEFAULT CURRENT_DATE`
   - `payment_method TEXT CHECK (payment_method IN ('UPI', 'Card', 'Cash', 'NetBanking', 'Other'))`
   - `notes TEXT`
4. **`income`**:
   - `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
   - `user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL`
   - `amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0)`
   - `source TEXT NOT NULL`, `income_date DATE DEFAULT CURRENT_DATE`
5. **`budgets`**:
   - `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
   - `user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL`
   - `category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE` (NULL for overall master budget)
   - `amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0)`
   - `month INTEGER`, `year INTEGER`
   - Unique constraint: `UNIQUE (user_id, category_id, month, year)`

### Row-Level Security (RLS) Guarantee:
- Every table has `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`
- Policies enforce `auth.uid() = user_id` for SELECT, INSERT, UPDATE, and DELETE.
- User A can **never** query, mutate, or access User B's financial data.

---

## 4. "WHERE CAN I SAVE?" Intelligence Engine

Located in [`src/utils/recommendationEngine.js`](file:///c:/Users/gumma/OneDrive/Desktop/daily%20expenses%20project/src/utils/recommendationEngine.js):
1. **Deterministic Layer**:
   - Separates expenditures into **Discretionary** (Dining Out, Shopping, Entertainment, Travel, Salon) vs. **Essential** (Groceries, Utilities, Healthcare, Education, Fuel).
   - Compares current month spending against the previous month baseline and historical benchmarks.
   - Detects spending surges (`>= 15%` increase) and high discretionary concentrations (`>= 18%` of entire monthly budget).
2. **Explainable Rationale**:
   - Explains the exact arithmetic reason: *"You spent ₹5,699 this month compared to ₹2,800 last month. That is an extra ₹2,899 in discretionary spending."*
3. **Actionable Suggestions & Bounds**:
   - Estimates reasonable potential reductions (e.g. `₹1,450 – ₹2,464`) without claiming compulsory cuts.
   - Treats essential spikes (e.g. Healthcare) as informative notices rather than frivolous waste.
4. **Interactive Simulator**:
   - Users can drag a target reduction slider (5% to 50%) to immediately view monthly and annualized wealth accumulation figures.

---

## 5. Local Setup & Quick Start

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation
```bash
# Clone or navigate to the directory
cd "daily expenses project"

# Install dependencies
npm install

# Start development server
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 6. Supabase Cloud Configuration

1. Log into your Supabase Dashboard at `https://wndadtpiukiapijginbh.supabase.co`.
2. Go to **SQL Editor** > **New Query**, copy the contents of [`supabase/schema.sql`](file:///c:/Users/gumma/OneDrive/Desktop/daily%20expenses%20project/supabase/schema.sql), and click **Run**.
3. Copy your project's `anon` / `publishable` public API key from **Project Settings > API**.
4. Either paste it into `.env`:
   ```bash
   VITE_SUPABASE_URL=https://wndadtpiukiapijginbh.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_anon_key_here
   ```
   Or connect live directly inside the app under **Profile & Settings > Supabase Database Integration**!
