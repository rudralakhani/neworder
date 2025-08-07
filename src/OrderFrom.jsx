import React, { useState, useEffect } from 'react';
import RingForm from './components/RingForm';
import EarringForm from './components/EarringForm';
import PendantForm from './components/PendantForm';
import BraceletForm from './components/BraceletForm';
import NecklaceForm from './components/NecklaceForm';
import { useLocation } from 'react-router-dom';

function generateOrderId() {
  const lastId = localStorage.getItem('lastOrderId');
  const startId = lastId ? parseInt(lastId, 10) : 2499;
  const newId = startId + 1;
  localStorage.setItem('lastOrderId', newId.toString());
  return `LMU${newId}`;
}

const OrderForm = ({ onSubmit }) => {
  const { state } = useLocation();
  const initialOrder = state?.order || {};
  const isEdit = !!initialOrder.id;
  const [orderId, setOrderId] = useState(initialOrder.orderId || '');
  const [clientName, setClientName] = useState(initialOrder.clientName || '');
  const [file, setFile] = useState(null);
  const [price, setPrice] = useState(initialOrder.price || '');
  const [productName, setProductName] = useState(initialOrder.productName || '');
  const [quantity, setQuantity] = useState(initialOrder.quantity || '');
  const [jewelryType, setJewelryType] = useState(initialOrder.jewelryType || null);
  const [jewelryDetails, setJewelryDetails] = useState(initialOrder.jewelryDetails || {});
  const [currency, setCurrency] = useState(initialOrder.currency || 'INR');

  useEffect(() => {
    if (!isEdit) {
      setOrderId(generateOrderId());
    }
  }, [isEdit]);

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleJewelryTypeSelect = (type) => {
    setJewelryType(type);
    setJewelryDetails({});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const qty = parseInt(quantity);
    if (isNaN(qty) || qty < 1) {
      alert('Please enter a valid quantity (minimum 1)');
      return;
    }
    if (!file && (!productName || !price)) {
      alert('Please either upload a design file or enter product details');
      return;
    }
    if (price) {
      const priceValue = parseFloat(price);
      if (isNaN(priceValue) || priceValue <= 0) {
        alert('Please enter a valid price');
        return;
      }
    }
    const orderData = {
      orderId,
      clientName,
      file: file ? file.name : initialOrder.file || null,
      price,
      productName,
      quantity: qty,
      jewelryType,
      jewelryDetails,
      currency,
      status: initialOrder.status || 'ongoing',
      id: initialOrder.id || null,
      createdAt: initialOrder.createdAt || new Date().toISOString(),
    };
    onSubmit(orderData, isEdit);
  };

  const renderJewelryForm = () => {
    if (!jewelryType) return null;
    const commonProps = {
      details: jewelryDetails,
      setDetails: setJewelryDetails,
    };
    switch (jewelryType) {
      case 'Ring':
        return <RingForm {...commonProps} />;
      case 'EarRing':
        return <EarringForm {...commonProps} />;
      case 'Pendant':
        return <PendantForm {...commonProps} />;
      case 'Bracletes':
        return <BraceletForm {...commonProps} />;
      case 'Necklace':
        return <NecklaceForm {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-gray-700 font-medium mb-2">Order ID</label>
          <div className="flex items-center">
            <div className="flex-1 p-3 bg-gray-100 rounded-lg border border-gray-300">
              {orderId}
            </div>
            {!isEdit && (
              <button
                type="button"
                onClick={() => setOrderId(generateOrderId())}
                className="ml-3 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
              >
                Regenerate
              </button>
            )}
          </div>
          <p className="mt-1 text-sm text-gray-500">Automatically generated unique order ID</p>
        </div>
        <div className="md:col-span-2">
          <label className="block text-gray-700 font-medium mb-2">Client Name</label>
          <input
            type="text"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Enter client name"
            required
          />
        </div>
        <div className="md:col-span-2">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <label className="block text-gray-700 font-medium mb-2">Upload Design File</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-indigo-400 transition-colors relative">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept=".jpg,.jpeg"
                />
                <div className="flex flex-col items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 text-indigo-500 mb-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p className="text-gray-600">{file ? file.name : initialOrder.file || 'Click to upload or drag and drop'}</p>
                  <p className="text-sm text-gray-500 mt-1">JPG files only, up to 10MB</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="h-px w-16 bg-gray-300 md:h-16 md:w-px"></div>
              <div className="px-4 py-2 bg-gray-100 rounded-full text-gray-500">AND</div>
              <div className="h-px w-16 bg-gray-300 md:h-16 md:w-px"></div>
            </div>
            <div className="flex-1">
              <label className="block text-gray-700 font-medium mb-2">Enter Product Details</label>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Product Name</label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter product name"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Price</label>
                  <div className="flex">
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Enter price"
                    />
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="p-2.5 border border-l-0 border-gray-300 rounded-r-lg bg-white"
                    >
                      <option value="INR">₹ INR</option>
                      <option value="USD">$ USD</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-2">Quantity</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Enter quantity"
            min="1"
            required
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-gray-700 font-medium mb-2">Select Jewelry Type</label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {['Ring', 'EarRing', 'Pendant', 'Bracletes', 'Necklace'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => handleJewelryTypeSelect(type)}
                className={`p-4 rounded-lg border-2 font-medium transition-all ${
                  jewelryType === type
                    ? 'bg-green-100 border-green-500 text-green-700'
                    : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
        {jewelryType && (
          <div className="md:col-span-2 mt-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{jewelryType} Specifications</h3>
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
              {renderJewelryForm()}
            </div>
          </div>
        )}
        <div className="md:col-span-2 mt-6">
          <button
            type="submit"
            disabled={!jewelryType}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              jewelryType
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isEdit ? 'Update Order' : 'Place Order'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default OrderForm;