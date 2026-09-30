-- ==========================================================
-- KuberPulse Database Schema & Row-Level Security (RLS)
-- Supabase PostgreSQL Migration Script
-- ==========================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------
-- 1. PROFILES TABLE
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    avatar_url TEXT,
    currency TEXT NOT NULL DEFAULT 'INR',
    monthly_savings_goal NUMERIC(12, 2) DEFAULT 5000.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger to automatically create a profile record when a new user signs up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, avatar_url, currency, monthly_savings_goal)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
        'INR',
        5000.00
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ----------------------------------------------------------
-- 2. CATEGORIES TABLE
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL for global system defaults
    name TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT 'Tag',
    color TEXT NOT NULL DEFAULT '#17181C',
    type TEXT NOT NULL DEFAULT 'expense' CHECK (type IN ('expense', 'income')),
    is_discretionary BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed Default System Categories (user_id is NULL)
INSERT INTO public.categories (name, icon, color, type, is_discretionary, user_id)
VALUES
    ('Food & Dining', 'Utensils', '#FF6B6B', 'expense', true, NULL),
    ('Groceries', 'ShoppingCart', '#4ECDC4', 'expense', false, NULL),
    ('Transportation', 'Car', '#45B7D1', 'expense', false, NULL),
    ('Shopping & Apparel', 'ShoppingBag', '#FFA07A', 'expense', true, NULL),
    ('Entertainment & OTT', 'Film', '#9B59B6', 'expense', true, NULL),
    ('Bills & Utilities', 'Receipt', '#3498DB', 'expense', false, NULL),
    ('Healthcare & Meds', 'HeartPulse', '#E74C3C', 'expense', false, NULL),
    ('Education & Books', 'GraduationCap', '#1ABC9C', 'expense', false, NULL),
    ('Travel & Vacations', 'Plane', '#F39C12', 'expense', true, NULL),
    ('Personal Care', 'Sparkles', '#E056FD', 'expense', true, NULL),
    ('Miscellaneous', 'MoreHorizontal', '#95A5A6', 'expense', true, NULL)
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------
-- 3. EXPENSES TABLE
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    description TEXT NOT NULL,
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method TEXT NOT NULL DEFAULT 'UPI' CHECK (payment_method IN ('UPI', 'Card', 'Cash', 'NetBanking', 'Other')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------
-- 4. INCOME TABLE
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.income (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    source TEXT NOT NULL,
    income_date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------
-- 5. BUDGETS TABLE
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE, -- NULL for total monthly budget
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INTEGER NOT NULL CHECK (year >= 2020),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_budget_per_month UNIQUE (user_id, category_id, month, year)
);

-- ----------------------------------------------------------
-- 6. PERFORMANCE INDEXES
-- ----------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON public.expenses (user_id, expense_date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON public.expenses (user_id, category_id);
CREATE INDEX IF NOT EXISTS idx_income_user_date ON public.income (user_id, income_date DESC);
CREATE INDEX IF NOT EXISTS idx_budgets_user_period ON public.budgets (user_id, year, month);

-- ----------------------------------------------------------
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.income ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Categories Policies
-- Everyone can select default categories (user_id IS NULL) or their own custom categories
DROP POLICY IF EXISTS "Users can read default and own categories" ON public.categories;
CREATE POLICY "Users can read default and own categories"
    ON public.categories FOR SELECT
    USING (user_id IS NULL OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own categories" ON public.categories;
CREATE POLICY "Users can insert their own categories"
    ON public.categories FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own categories" ON public.categories;
CREATE POLICY "Users can update their own categories"
    ON public.categories FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own categories" ON public.categories;
CREATE POLICY "Users can delete their own categories"
    ON public.categories FOR DELETE
    USING (auth.uid() = user_id);

-- Expenses Policies
DROP POLICY IF EXISTS "Users can read own expenses" ON public.expenses;
CREATE POLICY "Users can read own expenses"
    ON public.expenses FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own expenses" ON public.expenses;
CREATE POLICY "Users can insert own expenses"
    ON public.expenses FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own expenses" ON public.expenses;
CREATE POLICY "Users can update own expenses"
    ON public.expenses FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own expenses" ON public.expenses;
CREATE POLICY "Users can delete own expenses"
    ON public.expenses FOR DELETE
    USING (auth.uid() = user_id);

-- Income Policies
DROP POLICY IF EXISTS "Users can read own income" ON public.income;
CREATE POLICY "Users can read own income"
    ON public.income FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own income" ON public.income;
CREATE POLICY "Users can insert own income"
    ON public.income FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own income" ON public.income;
CREATE POLICY "Users can update own income"
    ON public.income FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own income" ON public.income;
CREATE POLICY "Users can delete own income"
    ON public.income FOR DELETE
    USING (auth.uid() = user_id);

-- Budgets Policies
DROP POLICY IF EXISTS "Users can read own budgets" ON public.budgets;
CREATE POLICY "Users can read own budgets"
    ON public.budgets FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own budgets" ON public.budgets;
CREATE POLICY "Users can insert own budgets"
    ON public.budgets FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own budgets" ON public.budgets;
CREATE POLICY "Users can update own budgets"
    ON public.budgets FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own budgets" ON public.budgets;
CREATE POLICY "Users can delete own budgets"
    ON public.budgets FOR DELETE
    USING (auth.uid() = user_id);
