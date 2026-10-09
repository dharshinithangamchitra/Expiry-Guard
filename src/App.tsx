import React, { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { useAppStore, Product } from './store';
import { MOCK_PRODUCTS, MOCK_NOTIFICATIONS } from './data/mockData';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { BottomNav } from './components/layout/BottomNav';
import { AuthPage } from './components/auth/AuthPage';

// Pages
import { Dashboard } from './components/pages/Dashboard';
import { ProductsPage } from './components/pages/ProductsPage';
import { AddProductPage } from './components/pages/AddProductPage';
import { ProductDetail } from './components/pages/ProductDetail';
import { CalendarPage } from './components/pages/CalendarPage';
import { NotificationsPage } from './components/pages/NotificationsPage';
import { ReportsPage } from './components/pages/ReportsPage';
import { SettingsPage } from './components/pages/SettingsPage';

export const App: React.FC = () => {
  const {
    user,
    isAuthenticated,
    products,
    setProducts,
    notifications,
    setNotifications,
    currentPage,
    setCurrentPage,
    sidebarOpen,
  } = useAppStore();

  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Initialize mock products if empty
  useEffect(() => {
    if (products.length === 0) {
      setProducts(MOCK_PRODUCTS);
    }
    if (notifications.length === 0) {
      setNotifications(MOCK_NOTIFICATIONS);
    }
  }, []);

  // Display Login / Register screen first when user is not authenticated
  if (!isAuthenticated || !user) {
    return (
      <>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#0F172A',
              color: '#FFFFFF',
              fontSize: '0.875rem',
              borderRadius: '12px',
              padding: '12px 18px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
            },
          }}
        />
        <AuthPage />
      </>
    );
  }

  const handlePageChange = (page: string) => {
    if (page === 'add-product') {
      setEditingProduct(null);
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProductSelect = (id: string) => {
    setSelectedProductId(id);
    setCurrentPage('product-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setCurrentPage('add-product');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard
            onPageChange={handlePageChange}
            onProductSelect={handleProductSelect}
          />
        );
      case 'products':
        return (
          <ProductsPage
            onPageChange={handlePageChange}
            onProductSelect={handleProductSelect}
          />
        );
      case 'expiring':
        return (
          <ProductsPage
            onPageChange={handlePageChange}
            onProductSelect={handleProductSelect}
            filterStatus="expiring-soon"
          />
        );
      case 'expired':
        return (
          <ProductsPage
            onPageChange={handlePageChange}
            onProductSelect={handleProductSelect}
            filterStatus="expired-products"
          />
        );
      case 'calendar':
        return <CalendarPage onProductSelect={handleProductSelect} />;
      case 'notifications':
        return <NotificationsPage onProductSelect={handleProductSelect} />;
      case 'reports':
        return <ReportsPage />;
      case 'settings':
        return <SettingsPage />;
      case 'add-product':
        return (
          <AddProductPage
            onBack={() => handlePageChange('products')}
            editProduct={editingProduct}
          />
        );
      case 'product-detail':
        return (
          <ProductDetail
            productId={selectedProductId || (products[0]?.id ?? '')}
            onBack={() => handlePageChange('products')}
            onEdit={handleEditProduct}
          />
        );
      default:
        return (
          <Dashboard
            onPageChange={handlePageChange}
            onProductSelect={handleProductSelect}
          />
        );
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#F8FAFC' }}>
      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#0F172A',
            color: '#FFFFFF',
            fontSize: '0.875rem',
            borderRadius: '12px',
            padding: '12px 18px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#FFFFFF',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#FFFFFF',
            },
          },
        }}
      />

      {/* Persistent Sidebar */}
      <Sidebar onPageChange={handlePageChange} />

      {/* Main Layout Area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          marginLeft: sidebarOpen ? 260 : 0,
          transition: 'margin-left 0.25s ease',
          paddingBottom: 72, // for mobile bottom nav
        }}
        className="main-layout-container"
      >
        <TopBar onPageChange={handlePageChange} />

        <main style={{ flex: 1, padding: '24px 20px', maxWidth: 1400, width: '100%', margin: '0 auto' }}>
          {renderContent()}
        </main>
      </div>

      {/* Bottom Nav for Mobile */}
      <div className="lg:hidden">
        <BottomNav onPageChange={handlePageChange} />
      </div>
    </div>
  );
};

export default App;
