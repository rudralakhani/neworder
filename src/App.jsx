import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './MainPage';
import OrderForm from './components/OrderForm';
import SettlementPage from './SettlementPage';
import PreviewModal from './components/PreviewModal';
import { db } from './firebase';
import { collection, setDoc, updateDoc, doc } from 'firebase/firestore';

function App() {
  const [showPreview, setShowPreview] = useState(false);
  const [orderData, setOrderData] = useState(null);

  const handleSubmit = async (data) => {
    // Remove id from orderData to prevent storing it as a field
    const { id, ...cleanedOrderData } = data;
    setOrderData({ ...cleanedOrderData, status: cleanedOrderData.status || 'ongoing' });
    setShowPreview(true);
  };

  const handleConfirm = async () => {
    try {
      const orderWithTimestamp = {
        ...orderData,
        createdAt: new Date().toISOString(),
      };
      // If editing an existing order (orderData.id exists from navigation state)
      if (orderData.id) {
        const orderRef = doc(db, 'orders', orderData.id);
        await updateDoc(orderRef, orderWithTimestamp);
        alert('Order updated successfully!');
      } else {
        // Use setDoc to set the document ID to orderData.orderId
        const orderRef = doc(db, 'orders', orderData.orderId);
        await setDoc(orderRef, orderWithTimestamp);
        alert('Order saved successfully!');
      }
      setShowPreview(false);
    } catch (error) {
      console.error('Error saving/updating order:', error);
      alert(`Failed to save/update order: ${error.message}`);
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4">
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route
            path="/new-order"
            element={
              <div className="max-w-4xl mx-auto">
                <header className="text-center mb-10">
                  <h1 className="text-3xl md:text-4xl font-bold text-indigo-800 mb-2">
                    Jewelry Order Management
                  </h1>
                  <p className="text-gray-600">Create and manage custom jewelry orders</p>
                </header>
                <OrderForm onSubmit={handleSubmit} />
                {showPreview && (
                  <PreviewModal
                    data={orderData}
                    onConfirm={handleConfirm}
                    onCancel={() => setShowPreview(false)}
                  />
                )}
                <footer className="mt-16 text-center text-gray-500 text-sm">
                  <p>© {new Date().getFullYear()} Jewelry Order System. All rights reserved.</p>
                </footer>
              </div>
            }
          />
          <Route path="/settlement" element={<SettlementPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;