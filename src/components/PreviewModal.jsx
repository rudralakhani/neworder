import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';

// Function to replace oklch colors with HEX equivalents
const replaceOklchColors = (element) => {
  const styles = window.getComputedStyle(element);
  if (styles.color.includes('oklch')) {
    element.style.color = '#1F2A44'; // Replace with HEX for text-gray-800
  }
  if (styles.backgroundColor.includes('oklch')) {
    element.style.backgroundColor = '#FFFFFF'; // Replace with HEX for bg-white
  }
  if (styles.borderColor.includes('oklch')) {
    element.style.borderColor = '#E5E7EB'; // Replace with HEX for border-gray-200
  }
  element.childNodes.forEach(child => {
    if (child.nodeType === 1) replaceOklchColors(child);
  });
};

const PreviewModal = ({ data, onConfirm, onCancel }) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const snapshotRef = useRef(null);

  const handleTakeSnapshot = () => {
    setIsCapturing(true);
    try {
      if (snapshotRef.current) {
        replaceOklchColors(snapshotRef.current);
        console.log('Snapshot data:', data); // Debug data

        // Ensure snapshotRef is off-screen but accessible
        const snapshotElement = snapshotRef.current;
        const originalDisplay = snapshotElement.style.display;
        const originalPosition = snapshotElement.style.position;
        const originalLeft = snapshotElement.style.left;
        snapshotElement.style.display = 'block';
        snapshotElement.style.position = 'absolute';
        snapshotElement.style.left = '-9999px';

        // Force reflow to ensure DOM is updated
        snapshotElement.offsetHeight;

        html2canvas(snapshotRef.current, {
          scale: 1,
          backgroundColor: '#ffffff',
          logging: true,
          useCORS: true,
          allowTaint: true, // Allow tainted canvases if external resources are involved
        }).then(canvas => {
          // Restore original styles
          snapshotElement.style.display = originalDisplay;
          snapshotElement.style.position = originalPosition;
          snapshotElement.style.left = originalLeft;

          // Check if canvas is valid
          if (!canvas || canvas.width === 0 || canvas.height === 0) {
            console.error('Invalid canvas generated', {
              canvasWidth: canvas ? canvas.width : 'null',
              canvasHeight: canvas ? canvas.height : 'null',
              snapshotRefInnerHTML: snapshotRef.current.innerHTML,
            });
            alert('Failed to capture snapshot: Invalid canvas.');
            setIsCapturing(false);
            return;
          }

          // Attempt toBlob
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `order_${data.orderId}.jpg`;
                link.click();
                window.URL.revokeObjectURL(url);
                setIsCapturing(false);
              } else {
                console.error('Blob is null or undefined');
                // Fallback to toDataURL
                const image = canvas.toDataURL('image/jpeg', 0.9);
                console.log('Fallback Data URL:', image);
                window.open(image); // Verify in new tab
                const link = document.createElement('a');
                link.href = image;
                link.download = `order_${data.orderId}.jpg`;
                link.click();
                setIsCapturing(false);
              }
            },
            'image/jpeg',
            0.9
          );
        }).catch(error => {
          console.error('html2canvas error:', error);
          alert('Failed to capture snapshot. Please try again.');
          setIsCapturing(false);
        });
      }
    } catch (error) {
      console.error('Snapshot error:', error);
      alert('Failed to capture snapshot. Please try again.');
      setIsCapturing(false);
    }
  };

  const renderJewelryDetails = () => {
    if (!data.jewelryDetails) return null;

    const details = data.jewelryDetails;
    const typeSpecificDetails = [];

    const commonDetails = [
      { label: 'Gold Type', value: details.goldType },
      { label: 'Gold Color', value: details.goldColor },
      { label: 'Diamond Type', value: details.diamondType },
      { label: 'Diamond Colors', value: details.diamondColors?.join(', ') || 'None' },
      { label: 'Certification', value: details.diamondCertification },
      { label: 'Clarities', value: details.clarities?.join(', ') || 'None' },
      { label: 'Diamond Size', value: details.diamondSize },
      { label: 'Shapes', value: details.shapes?.join(', ') || 'None' },
      { label: 'Notes', value: details.notes },
    ];

    switch (data.jewelryType) {
      case 'Ring':
        typeSpecificDetails.push({ label: 'Ring Size', value: `${details.ringSize} (${details.sizeUnit})` });
        break;
      case 'EarRing':
        typeSpecificDetails.push({ label: 'Fitting Type', value: details.fittingType });
        break;
      case 'Bracletes':
        typeSpecificDetails.push({ label: 'Bracelet Size', value: `${details.braceletSize} inches` });
        break;
      case 'Necklace':
        typeSpecificDetails.push({ label: 'Necklace Size', value: `${details.necklaceSize} inches` });
        break;
      case 'Pendant':
        if (details.chainOption === 'With Chain') {
          typeSpecificDetails.push(
            { label: 'Chain Option', value: details.chainOption },
            { label: 'Jumping', value: details.jumping ? 'Yes' : 'No' },
            { label: 'Chain Length', value: `${details.chainLength} mm` }
          );
        } else {
          typeSpecificDetails.push({ label: 'Chain Option', value: details.chainOption });
        }
        break;
      default:
        break;
    }

    return [...commonDetails, ...typeSpecificDetails].map((item, index) => (
      item.value && (
        <div key={index} className="flex border-b border-gray-200 py-2.5">
          <div className="w-1/3 font-medium text-gray-700">{item.label}:</div>
          <div className="w-2/3 text-gray-800">{item.value}</div>
        </div>
      )
    ));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Order Preview</h2>
          <p className="text-gray-600">Review your order before confirming</p>
        </div>

        {/* Off-screen div for snapshot capture (no hidden class) */}
        <div ref={snapshotRef} style={{ position: 'absolute', left: '-9999px' }}>
          <div className="p-6">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-800">Order Snapshot</h3>
            </div>
            <div className="mb-4">
              <div className="flex">
                <div className="w-1/3 font-bold text-gray-700">Order ID:</div>
                <div className="w-2/3 text-gray-800 font-medium">{data.orderId}</div>
              </div>
              <div className="flex">
                <div className="w-1/3 font-bold text-gray-700">Quantity:</div>
                <div className="w-2/3 text-gray-800 font-medium">{data.quantity}</div>
              </div>
              <div className="flex">
                <div className="w-1/3 font-bold text-gray-700">Jewelry Type:</div>
                <div className="w-2/3 text-gray-800 font-medium">{data.jewelryType}</div>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Jewelry Specifications</h3>
              <div className="divide-y divide-gray-200">
                {renderJewelryDetails()}
              </div>
            </div>
          </div>
        </div>

        {/* Visible preview content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-indigo-50 rounded-lg p-5">
              <h3 className="text-lg font-semibold text-indigo-800 mb-3">Order Information</h3>
              <div className="space-y-2">
                <div className="flex">
                  <div className="w-1/3 font-medium text-gray-700">Order ID:</div>
                  <div className="w-2/3 text-gray-800">{data.orderId}</div>
                </div>
                <div className="flex">
                  <div className="w-1/3 font-medium text-gray-700">Client Name:</div>
                  <div className="w-2/3 text-gray-800">{data.clientName}</div>
                </div>
                <div className="flex">
                  <div className="w-1/3 font-medium text-gray-700">Quantity:</div>
                  <div className="w-2/3 text-gray-800">{data.quantity}</div>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-5">
              <h3 className="text-lg font-semibold text-purple-800 mb-3">Product Information</h3>
              <div className="space-y-2">
                {data.file && (
                  <div className="flex">
                    <div className="w-1/3 font-medium text-gray-700">Design File:</div>
                    <div className="w-2/3 text-gray-800">{data.file}</div>
                  </div>
                )}
                {data.productName && (
                  <div className="flex">
                    <div className="w-1/3 font-medium text-gray-700">Product Name:</div>
                    <div className="w-2/3 text-gray-800">{data.productName}</div>
                  </div>
                )}
                {data.price && (
                  <div className="flex">
                    <div className="w-1/3 font-medium text-gray-700">Price:</div>
                    <div className="w-2/3 text-gray-800">
                      {data.currency === 'INR' ? '₹' : '$'}{data.price}
                    </div>
                  </div>
                )}
                <div className="flex">
                  <div className="w-1/3 font-medium text-gray-700">Jewelry Type:</div>
                  <div className="w-2/3 text-gray-800">{data.jewelryType}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Jewelry Specifications</h3>
            <div className="divide-y divide-gray-200">
              {renderJewelryDetails()}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Back to Edit
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Confirm Order
          </button>
          <button
            onClick={handleTakeSnapshot}
            disabled={isCapturing}
            className={`px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${isCapturing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isCapturing ? 'Capturing...' : 'Take Snapshot'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;
