import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/context/AuthContext'
import { AppBootstrap } from '@/components/shared/AppBootstrap'

import { StorefrontLayout } from '@/layouts/StorefrontLayout'
import { AccountLayout } from '@/layouts/AccountLayout'
import { AdminLayout } from '@/layouts/AdminLayout'
import { RequireAuth, RequireAdmin, RedirectIfAuthed } from '@/routes/guards'

import HomePage from '@/pages/storefront/HomePage'
import ProductListPage from '@/pages/storefront/ProductListPage'
import ProductDetailPage from '@/pages/storefront/ProductDetailPage'
import CategoryPage from '@/pages/storefront/CategoryPage'
import CartPage from '@/pages/storefront/CartPage'
import CheckoutPage from '@/pages/storefront/CheckoutPage'
import OrderConfirmationPage from '@/pages/storefront/OrderConfirmationPage'
import { ShippingInfoPage, ReturnsPage, ContactPage, NotFoundPage } from '@/pages/storefront/StaticPages'

import LoginPage from '@/pages/auth/LoginPage'
import SignupPage from '@/pages/auth/SignupPage'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage'

import ProfilePage from '@/pages/account/ProfilePage'
import MyOrdersPage from '@/pages/account/MyOrdersPage'
import OrderDetailPage from '@/pages/account/OrderDetailPage'
import WishlistPage from '@/pages/account/WishlistPage'
import AddressesPage from '@/pages/account/AddressesPage'

import AdminDashboardPage from '@/pages/admin/AdminDashboardPage'
import AdminProductsPage from '@/pages/admin/AdminProductsPage'
import AdminProductFormPage from '@/pages/admin/AdminProductFormPage'
import AdminCategoriesPage from '@/pages/admin/AdminCategoriesPage'
import AdminOrdersPage from '@/pages/admin/AdminOrdersPage'
import AdminOrderDetailPage from '@/pages/admin/AdminOrderDetailPage'
import AdminCustomersPage from '@/pages/admin/AdminCustomersPage'
import AdminCustomerDetailPage from '@/pages/admin/AdminCustomerDetailPage'
import AdminReviewsPage from '@/pages/admin/AdminReviewsPage'
import AdminCouponsPage from '@/pages/admin/AdminCouponsPage'
import AdminInventoryPage from '@/pages/admin/AdminInventoryPage'
import AdminAnalyticsPage from '@/pages/admin/AdminAnalyticsPage'
import AdminSettingsPage from '@/pages/admin/AdminSettingsPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppBootstrap />
        <Toaster position="top-right" richColors closeButton />
        <Routes>
          {/* Storefront */}
          <Route element={<StorefrontLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductListPage />} />
            <Route path="/products/:slug" element={<ProductDetailPage />} />
            <Route path="/categories/:slug" element={<CategoryPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<RequireAuth><CheckoutPage /></RequireAuth>} />
            <Route path="/order-confirmation/:id" element={<RequireAuth><OrderConfirmationPage /></RequireAuth>} />
            <Route path="/shipping" element={<ShippingInfoPage />} />
            <Route path="/returns" element={<ReturnsPage />} />
            <Route path="/contact" element={<ContactPage />} />

            {/* Account */}
            <Route path="/account" element={<RequireAuth><AccountLayout /></RequireAuth>}>
              <Route index element={<ProfilePage />} />
              <Route path="orders" element={<MyOrdersPage />} />
              <Route path="orders/:id" element={<OrderDetailPage />} />
              <Route path="wishlist" element={<WishlistPage />} />
              <Route path="addresses" element={<AddressesPage />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Route>

          {/* Auth */}
          <Route path="/login" element={<RedirectIfAuthed><LoginPage /></RedirectIfAuthed>} />
          <Route path="/signup" element={<RedirectIfAuthed><SignupPage /></RedirectIfAuthed>} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Admin */}
          <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="products/new" element={<AdminProductFormPage />} />
            <Route path="products/:id/edit" element={<AdminProductFormPage />} />
            <Route path="categories" element={<AdminCategoriesPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="orders/:id" element={<AdminOrderDetailPage />} />
            <Route path="customers" element={<AdminCustomersPage />} />
            <Route path="customers/:id" element={<AdminCustomerDetailPage />} />
            <Route path="reviews" element={<AdminReviewsPage />} />
            <Route path="coupons" element={<AdminCouponsPage />} />
            <Route path="inventory" element={<AdminInventoryPage />} />
            <Route path="analytics" element={<AdminAnalyticsPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
