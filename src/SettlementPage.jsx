import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from './firebase';
import { collection, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import ViewModal from './components/ViewModal';

function SettlementPage() {
  const [orders, setOrders] = useState([]);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'orders'));
        const ordersData = querySnapshot.docs
          .filter(doc => doc.id)
          .map((doc) => ({
            id: doc.id, // Firestore document ID, should match orderId
            ...doc.data(),
            status: doc.data().status || 'ongoing'
          }));
        setOrders(ordersData);
      } catch (error) {
        console.error('Error fetching orders:', error);
        alert('Failed to fetch orders');
      }
    };
    fetchOrders();
  }, []);

  const handleEdit = (order) => {
    navigate('/new-order', { state: { order: { ...order, id: order.orderId } } });
  };

  const handleView = (order) => {
    setSelectedOrder(order);
    setShowViewModal(true);
  };

  const handleDelete = async (orderId) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await deleteDoc(doc(db, 'orders', orderId));
        setOrders(orders.filter((order) => order.orderId !== orderId));
        alert('Order deleted successfully!');
      } catch (error) {
        console.error('Error deleting order:', error);
        alert('Failed to delete order');
      }
    }
  };

  const handleMoveToCompleted = async (orderId) => {
    try {
      console.log('Attempting to move order with ID:', orderId);
      if (!orderId) {
        console.error('Invalid order ID:', orderId);
        alert('Cannot move order: Invalid order ID');
        return;
      }
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status: 'completed' });
      setOrders(
        orders.map((order) =>
          order.orderId === orderId ? { ...order, status: 'completed' } : order
        )
      );
      alert('Order moved to completed!');
    } catch (error) {
      console.error('Error moving order:', error);
      alert('Failed to move order');
    }
  };

  const ongoingOrders = orders.filter((order) => order.status === 'ongoing');
  const completedOrders = orders.filter((order) => order.status === 'completed');

  const renderTable = (orders, title, isOngoing) => (
    <div className="mb-12 w-full">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">{title}</h2>
      {orders.length === 0 ? (
        <p className="text-gray-500">No {title.toLowerCase()} orders</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-xl shadow-lg">
            <thead>
              <tr className="bg-indigo-100 text-indigo-800">
                {isOngoing && <th className="p-4 text-left">Select</th>}
                <th className="p-4 text-left">Order ID</th>
                <th className="p-4 text-left">Client Name</th>
                <th className="p-4 text-left">Product</th>
                <th className="p-4 text-left">Price</th>
                {isOngoing && <th className="p-4 text-left">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.orderId} className="border-t border-gray-200">
                  {isOngoing && (
                    <td className="p-4">
                      <input
                        type="checkbox"
                        onChange={() => handleMoveToCompleted(order.orderId)}
                        className="h-5 w-5 text-indigo-600"
                      />
                    </td>
                  )}
                  <td className="p-4">{order.orderId}</td>
                  <td className="p-4">{order.clientName}</td>
                  <td className="p-4">{order.productName || order.jewelryType}</td>
                  <td className="p-4">
                    {order.price ? `${order.currency} ${order.price}` : 'N/A'}
                  </td>
                  {isOngoing && (
                    <td className="p-4 flex space-x-2">
                      <button
                        onClick={() => handleEdit(order)}
                        className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleView(order)}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDelete(order.orderId)}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto">
      <header className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-indigo-800 mb-2">
          Order Settlement
        </h1>
        <p className="text-gray-600">Manage ongoing and completed orders</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>{renderTable(ongoingOrders, 'Ongoing Orders', true)}</div>
        <div>{renderTable(completedOrders, 'Completed Orders', false)}</div>
      </div>
      {showViewModal && (
        <ViewModal
          data={selectedOrder}
          onClose={() => setShowViewModal(false)}
        />
      )}
      <footer className="mt-16 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} Jewelry Order System. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default SettlementPage;