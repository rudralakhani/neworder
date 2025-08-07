const express = require('express');
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const cors = require('cors');

const app = express();

// Configure CORS with specific allowed origins
const allowedOrigins = [
  'http://localhost:5173',
  'https://neworder-tau.vercel.app'
];

// Enhanced CORS middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
});

// Explicit OPTIONS handler for all routes
app.options('*', (req, res) => {
  res.sendStatus(200);
});

app.use(express.json());

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER || 'luminluxedata@gmail.com',
    pass: process.env.GMAIL_PASS || 'jhpt dijp jipd xvjg'
  }
});


const generateContent = (data) => {
  const renderJewelryDetails = (details) => {
    if (!details) return [];
    let lines = [];
    lines.push(`Gold Type: ${details.goldType || 'N/A'}`);
    lines.push(`Gold Color: ${details.goldColor || 'N/A'}`);
    lines.push(`Diamond Type: ${details.diamondType || 'N/A'}`);
    lines.push(`Diamond Colors: ${details.diamondColors?.join(', ') || 'None'}`);
    lines.push(`Certification: ${details.diamondCertification || 'N/A'}`);
    lines.push(`Clarities: ${details.clarities?.join(', ') || 'None'}`);
    lines.push(`Diamond Size: ${details.diamondSize || 'N/A'}`);
    lines.push(`Shapes: ${details.shapes?.join(', ') || 'None'}`);
    lines.push(`Notes: ${details.notes || 'N/A'}`);

    switch (data.jewelryType) {
      case 'Ring':
        lines.push(`Ring Size: ${details.ringSize} (${details.sizeUnit})`);
        break;
      case 'EarRing':
        lines.push(`Fitting Type: ${details.fittingType || 'N/A'}`);
        break;
      case 'Bracletes':
        lines.push(`Bracelet Size: ${details.braceletSize} inches`);
        break;
      case 'Necklace':
        lines.push(`Necklace Size: ${details.necklaceSize} inches`);
        break;
      case 'Pendant':
        if (details.chainOption === 'With Chain') {
          lines.push(`Chain Option: ${details.chainOption}`);
          lines.push(`Jumping: ${details.jumping ? 'Yes' : 'No'}`);
          lines.push(`Chain Length: ${details.chainLength} mm`);
        } else {
          lines.push(`Chain Option: ${details.chainOption}`);
        }
        break;
      default:
        break;
    }
    return lines;
  };

  let content = [];
  content.push('Order Preview');
  content.push('');
  content.push('Order Information');
  content.push(`Order ID: ${data.orderId}`);
  content.push(`Client Name: ${data.clientName}`);
  content.push(`Quantity: ${data.quantity}`);
  content.push('');
  content.push('Product Information');
  if (data.file) {
    content.push(`Design File: ${data.file}`);
  } else {
    content.push(`Product Name: ${data.productName}`);
    content.push(`Price: ₹${data.price}`);
  }
  content.push(`Jewelry Type: ${data.jewelryType}`);
  content.push('');
  content.push('Jewelry Specifications');
  content.push(...renderJewelryDetails(data.jewelryDetails));

  return content;
};

app.post('/api/send-email', async (req, res) => {
  try {
    const orderData = req.body;
    const doc = new PDFDocument();
    let buffers = [];
    
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(buffers);

      const mailOptions = {
        from: process.env.GMAIL_USER || 'luminluxedata@gmail.com',
        to: 'dhruvdhameliya0045@gmail.com',
        subject: 'New Order',
        text: 'Please find the attached order details.',
        attachments: [{ 
          filename: 'order.pdf',
          content: pdfBuffer
        }]
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Email error:', error);
          return res.status(500).json({ error: `Error sending email: ${error.message}` });
        }
        console.log('Email sent:', info.response);
        res.json({ message: 'Email sent successfully' });
      });
    });

    const content = generateContent(orderData);
    content.forEach(line => doc.text(line));
    doc.end();
    
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/', (req, res) => {
  res.send('Jewelry Order API is running');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;