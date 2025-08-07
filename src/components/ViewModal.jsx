import React from 'react';

function ViewModal({ data, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Order Details</h2>
        <div className="space-y-4">
          <div>
            <span className="font-medium text-gray-700">Order ID:</span> {data.orderId}
          </div>
          <div>
            <span className="font-medium text-gray-700">Client Name:</span> {data.clientName}
          </div>
          <div>
            <span className="font-medium text-gray-700">Product Name:</span> {data.productName || 'N/A'}
          </div>
          <div>
            <span className="font-medium text-gray-700">Jewelry Type:</span> {data.jewelryType || 'N/A'}
          </div>
          <div>
            <span className="font-medium text-gray-700">Price:</span> {data.price ? `${data.currency} ${data.price}` : 'N/A'}
          </div>
          <div>
            <span className="font-medium text-gray-700">Quantity:</span> {data.quantity}
          </div>
          <div>
            <span className="font-medium text-gray-700">Design File:</span> {data.file || 'None'}
          </div>
          <div>
            <span className="font-medium text-gray-700">Jewelry Details:</span>
            {Object.keys(data.jewelryDetails).length > 0 ? (
              <ul className="list-disc pl-5">
                {Object.entries(data.jewelryDetails).map(([key, value]) => (
                  <li key={key}>
                    {key}: {value}
                  </li>
                ))}
              </ul>
            ) : (
              'None'
            )}
          </div>
          <div>
            <span className="font-medium text-gray-700">Status:</span> {data.status}
          </div>
          <div>
            <span className="font-medium text-gray-700">Created At:</span>{' '}
            {new Date(data.createdAt).toLocaleString()}
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default ViewModal;