import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from './firebase';
import { collection, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import ViewModal from './components/ViewModal';

function SettlementPage() {
  const [orders, setOrders] = useState([]);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editOrder, setEditOrder] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'orders'));
        const ordersData = querySnapshot.docs
          .filter(doc => doc.id)
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
            status: doc.data().status || 'ongoing',
            jewelryDetails: doc.data().jewelryDetails || {}
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
    setEditOrder({
      id: order.id,
      clientName: order.clientName || '',
      productName: order.productName || '',
      jewelryType: order.jewelryType || '',
      price: order.price || '',
      currency: order.currency || 'USD',
      status: order.status || 'ongoing',
      jewelryDetails: {
        goldType: order.jewelryDetails?.goldType || '',
        goldColor: order.jewelryDetails?.goldColor || '',
        diamondType: order.jewelryDetails?.diamondType || '',
        diamondColors: order.jewelryDetails?.diamondColors?.join(', ') || '',
        diamondCertification: order.jewelryDetails?.diamondCertification || '',
        clarities: order.jewelryDetails?.clarities?.join(', ') || '',
        diamondSize: order.jewelryDetails?.diamondSize || '',
        shapes: order.jewelryDetails?.shapes?.join(', ') || '',
        ringSize: order.jewelryDetails?.ringSize || '',
        sizeUnit: order.jewelryDetails?.sizeUnit || '',
        fittingType: order.jewelryDetails?.fittingType || '',
        chainOption: order.jewelryDetails?.chainOption || '',
        jumping: order.jewelryDetails?.jumping || '',
        chainLength: order.jewelryDetails?.chainLength || '',
        braceletSize: order.jewelryDetails?.braceletSize || '',
        necklaceSize: order.jewelryDetails?.necklaceSize || ''
      }
    });
    setShowEditModal(true);
  };

  const handleView = (order) => {
    setSelectedOrder(order);
    setShowViewModal(true);
  };

  const handleDelete = async (orderId) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await deleteDoc(doc(db, 'orders', orderId));
        setOrders(orders.filter((order) => order.id !== orderId));
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
          order.id === orderId ? { ...order, status: 'completed' } : order
        )
      );
      alert('Order moved to completed!');
    } catch (error) {
      console.error('Error moving order:', error);
      alert('Failed to move order');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editOrder?.id) {
      alert('No order selected for editing');
      return;
    }

    const orderData = {
      clientName: editOrder.clientName,
      productName: editOrder.productName || null,
      jewelryType: editOrder.jewelryType || null,
      price: editOrder.price ? Number(editOrder.price) : null,
      currency: editOrder.currency || 'USD',
      status: editOrder.status || 'ongoing',
      jewelryDetails: {
        goldType: editOrder.jewelryDetails.goldType || null,
        goldColor: editOrder.jewelryDetails.goldColor || null,
        diamondType: editOrder.jewelryDetails.diamondType || null,
        diamondColors: editOrder.jewelryDetails.diamondColors ? editOrder.jewelryDetails.diamondColors.split(',').map(item => item.trim()) : null,
        diamondCertification: editOrder.jewelryDetails.diamondCertification || null,
        clarities: editOrder.jewelryDetails.clarities ? editOrder.jewelryDetails.clarities.split(',').map(item => item.trim()) : null,
        diamondSize: editOrder.jewelryDetails.diamondSize || null,
        shapes: editOrder.jewelryDetails.shapes ? editOrder.jewelryDetails.shapes.split(',').map(item => item.trim()) : null,
        ...(editOrder.jewelryType.toLowerCase() === 'ring' && {
          ringSize: editOrder.jewelryDetails.ringSize || null,
          sizeUnit: editOrder.jewelryDetails.sizeUnit || null
        }),
        ...(editOrder.jewelryType.toLowerCase() === 'earring' && {
          fittingType: editOrder.jewelryDetails.fittingType || null
        }),
        ...(editOrder.jewelryType.toLowerCase() === 'pendant' && {
          chainOption: editOrder.jewelryDetails.chainOption || null,
          ...(editOrder.jewelryDetails.chainOption === 'With Chain' && {
            jumping: editOrder.jewelryDetails.jumping || null,
            chainLength: editOrder.jewelryDetails.chainLength || null
          })
        }),
        ...(editOrder.jewelryType.toLowerCase() === 'bracelet' && {
          braceletSize: editOrder.jewelryDetails.braceletSize || null
        }),
        ...(editOrder.jewelryType.toLowerCase() === 'necklace' && {
          necklaceSize: editOrder.jewelryDetails.necklaceSize || null
        })
      }
    };

    try {
      const orderRef = doc(db, 'orders', editOrder.id);
      await updateDoc(orderRef, orderData);
      setOrders(
        orders.map((order) =>
          order.id === editOrder.id ? { ...order, ...orderData } : order
        )
      );
      alert('Order updated successfully!');
      setShowEditModal(false);
      setEditOrder(null);
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order');
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('jewelryDetails.')) {
      const field = name.split('.')[1];
      setEditOrder((prev) => ({
        ...prev,
        jewelryDetails: { ...prev.jewelryDetails, [field]: value }
      }));
    } else {
      setEditOrder((prev) => ({ ...prev, [name]: value }));
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
                <tr key={order.id} className="border-t border-gray-200">
                  {isOngoing && (
                    <td className="p-4">
                      <input
                        type="checkbox"
                        onChange={() => handleMoveToCompleted(order.id)}
                        className="h-5 w-5 text-indigo-600"
                      />
                    </td>
                  )}
                  <td className="p-4">{order.id}</td>
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
                        onClick={() => handleDelete(order.id)}
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

  const renderEditModal = () => {
    if (!showEditModal || !editOrder) return null;
    const normalizedJewelryType = editOrder.jewelryType.toLowerCase();

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-xl shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4">Edit Order</h2>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700">Client Name</label>
              <input
                type="text"
                name="clientName"
                value={editOrder.clientName}
                onChange={handleEditChange}
                placeholder="Enter client name"
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700">Product Name</label>
              <input
                type="text"
                name="productName"
                value={editOrder.productName}
                onChange={handleEditChange}
                placeholder="Enter product name (if applicable)"
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-gray-700">Jewelry Type</label>
              <select
                name="jewelryType"
                value={editOrder.jewelryType}
                onChange={handleEditChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Select Jewelry Type</option>
                <option value="ring">Ring</option>
                <option value="earring">Earring</option>
                <option value="pendant">Pendant</option>
                <option value="bracelet">Bracelet</option>
                <option value="necklace">Necklace</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700">Gold Type</label>
              <input
                type="text"
                name="jewelryDetails.goldType"
                value={editOrder.jewelryDetails.goldType}
                onChange={handleEditChange}
                placeholder="Enter gold type (e.g., 18K, 22K)"
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-gray-700">Gold Color</label>
              <input
                type="text"
                name="jewelryDetails.goldColor"
                value={editOrder.jewelryDetails.goldColor}
                onChange={handleEditChange}
                placeholder="Enter gold color (e.g., Yellow, White)"
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-gray-700">Diamond Type</label>
              <input
                type="text"
                name="jewelryDetails.diamondType"
                value={editOrder.jewelryDetails.diamondType}
                onChange={handleEditChange}
                placeholder="Enter diamond type"
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-gray-700">Diamond Colors</label>
              <input
                type="text"
                name="jewelryDetails.diamondColors"
                value={editOrder.jewelryDetails.diamondColors}
                onChange={handleEditChange}
                placeholder="Enter diamond colors (comma-separated)"
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-gray-700">Certification</label>
              <input
                type="text"
                name="jewelryDetails.diamondCertification"
                value={editOrder.jewelryDetails.diamondCertification}
                onChange={handleEditChange}
                placeholder="Enter certification (e.g., GIA, IGI)"
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-gray-700">Clarities</label>
              <input
                type="text"
                name="jewelryDetails.clarities"
                value={editOrder.jewelryDetails.clarities}
                onChange={handleEditChange}
                placeholder="Enter clarities (comma-separated)"
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-gray-700">Diamond Size</label>
              <input
                type="text"
                name="jewelryDetails.diamondSize"
                value={editOrder.jewelryDetails.diamondSize}
                onChange={handleEditChange}
                placeholder="Enter diamond size (e.g., 0.5 carat)"
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-gray-700">Shapes</label>
              <input
                type="text"
                name="jewelryDetails.shapes"
                value={editOrder.jewelryDetails.shapes}
                onChange={handleEditChange}
                placeholder="Enter shapes (comma-separated)"
                className="w-full p-2 border rounded"
              />
            </div>
            {normalizedJewelryType === 'ring' && (
              <>
                <div>
                  <label className="block text-gray-700">Ring Size</label>
                  <input
                    type="text"
                    name="jewelryDetails.ringSize"
                    value={editOrder.jewelryDetails.ringSize}
                    onChange={handleEditChange}
                    placeholder="Enter ring size (e.g., 7)"
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-gray-700">Size Unit</label>
                  <input
                    type="text"
                    name="jewelryDetails.sizeUnit"
                    value={editOrder.jewelryDetails.sizeUnit}
                    onChange={handleEditChange}
                    placeholder="Enter size unit (e.g., US, UK)"
                    className="w-full p-2 border rounded"
                  />
                </div>
              </>
            )}
            {normalizedJewelryType === 'earring' && (
              <div>
                <label className="block text-gray-700">Fitting Type</label>
                <input
                  type="text"
                  name="jewelryDetails.fittingType"
                  value={editOrder.jewelryDetails.fittingType}
                  onChange={handleEditChange}
                  placeholder="Enter fitting type (e.g., Stud, Hoop)"
                  className="w-full p-2 border rounded"
                />
              </div>
            )}
            {normalizedJewelryType === 'pendant' && (
              <>
                <div>
                  <label className="block text-gray-700">Chain Option</label>
                  <select
                    name="jewelryDetails.chainOption"
                    value={editOrder.jewelryDetails.chainOption}
                    onChange={handleEditChange}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select Chain Option</option>
                    <option value="With Chain">With Chain</option>
                    <option value="Without Chain">Without Chain</option>
                  </select>
                </div>
                {editOrder.jewelryDetails.chainOption === 'With Chain' && (
                  <>
                    <div>
                      <label className="block text-gray-700">Jumping</label>
                      <input
                        type="text"
                        name="jewelryDetails.jumping"
                        value={editOrder.jewelryDetails.jumping}
                        onChange={handleEditChange}
                        placeholder="Enter jumping details"
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700">Chain Length</label>
                      <input
                        type="text"
                        name="jewelryDetails.chainLength"
                        value={editOrder.jewelryDetails.chainLength}
                        onChange={handleEditChange}
                        placeholder="Enter chain length (e.g., 450 mm)"
                        className="w-full p-2 border rounded"
                      />
                    </div>
                  </>
                )}
              </>
            )}
            {normalizedJewelryType === 'bracelet' && (
              <div>
                <label className="block text-gray-700">Bracelet Size</label>
                <input
                  type="text"
                  name="jewelryDetails.braceletSize"
                  value={editOrder.jewelryDetails.braceletSize}
                  onChange={handleEditChange}
                  placeholder="Enter bracelet size (e.g., 7 inches)"
                  className="w-full p-2 border rounded"
                />
              </div>
            )}
            {normalizedJewelryType === 'necklace' && (
              <div>
                <label className="block text-gray-700">Necklace Size</label>
                <input
                  type="text"
                  name="jewelryDetails.necklaceSize"
                  value={editOrder.jewelryDetails.necklaceSize}
                  onChange={handleEditChange}
                  placeholder="Enter necklace size (e.g., 18 inches)"
                  className="w-full p-2 border rounded"
                />
              </div>
            )}
            <div>
              <label className="block text-gray-700">Price</label>
              <input
                type="number"
                name="price"
                value={editOrder.price}
                onChange={handleEditChange}
                placeholder="Enter price"
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-gray-700">Currency</label>
              <select
                name="currency"
                value={editOrder.currency}
                onChange={handleEditChange}
                className="w-full p-2 border rounded"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="INR">INR</option>
              </select>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

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
      {renderEditModal()}
      <footer className="mt-16 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} Jewelry Order System. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default SettlementPage;