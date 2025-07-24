const express = require('express');
const nodemailer = require('nodemailer');
const htmlPdf = require('html-pdf');
const cors = require('cors');

const app = express();

// Allow CORS for frontend running on http://localhost:5173
app.use(cors({ origin: ['http://localhost:5173', 'https://neworder-tau.vercel.app'] }));
app.use(express.json());

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'luminluxedata@gmail.com',
    pass: 'jhpt dijp jipd xvjg', // Replace with your Gmail app password
  },
});

const generateHtml = (data) => {
  const renderJewelryDetailsHtml = (details) => {
    if (!details) return '';
    let html = '';
    html += `<p><span class="label">Gold Type:</span> ${details.goldType || 'N/A'}</p>`;
    html += `<p><span class="label">Gold Color:</span> ${details.goldColor || 'N/A'}</p>`;
    html += `<p><span class="label">Diamond Type:</span> ${details.diamondType || 'N/A'}</p>`;
    html += `<p><span class="label">Diamond Colors:</span> ${details.diamondColors?.join(', ') || 'None'}</p>`;
    html += `<p><span class="label">Certification:</span> ${details.diamondCertification || 'N/A'}</p>`;
    html += `<p><span class="label">Clarities:</span> ${details.clarities?.join(', ') || 'None'}</p>`;
    html += `<p><span class="label">Diamond Size:</span> ${details.diamondSize || 'N/A'}</p>`;
    html += `<p><span class="label">Shapes:</span> ${details.shapes?.join(', ') || 'None'}</p>`;
    html += `<p><span class="label">Notes:</span> ${details.notes || 'N/A'}</p>`;

    switch (data.jewelryType) {
      case 'Ring':
        html += `<p><span class="label">Ring Size:</span> ${details.ringSize} (${details.sizeUnit})</p>`;
        break;
      case 'EarRing':
        html += `<p><span class="label">Fitting Type:</span> ${details.fittingType || 'N/A'}</p>`;
        break;
      case 'Bracletes':
        html += `<p><span class="label">Bracelet Size:</span> ${details.braceletSize} inches</p>`;
        break;
      case 'Necklace':
        html += `<p><span class="label">Necklace Size:</span> ${details.necklaceSize} inches</p>`;
        break;
      case 'Pendant':
        if (details.chainOption === 'With Chain') {
          html += `<p><span class="label">Chain Option:</span> ${details.chainOption}</p>`;
          html += `<p><span class="label">Jumping:</span> ${details.jumping ? 'Yes' : 'No'}</p>`;
          html += `<p><span class="label">Chain Length:</span> ${details.chainLength} mm</p>`;
        } else {
          html += `<p><span class="label">Chain Option:</span> ${details.chainOption}</p>`;
        }
        break;
      default:
        break;
    }
    return html;
  };

  return `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          .container { max-width: 800px; margin: 0 auto; padding: 20px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          .box { background: #f0f0f0; padding: 15px; border-radius: 8px; }
          .label { font-weight: bold; }
          .section { margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Order Preview</h1>
          <div class="grid">
            <div class="box">
              <h2>Order Information</h2>
              <p><span class="label">Order ID:</span> ${data.orderId}</p>
              <p><span class="label">Client Name:</span> ${data.clientName}</p>
              <p><span class="label">Quantity:</span> ${data.quantity}</p>
            </div>
            <div class="box">
              <h2>Product Information</h2>
              ${data.file ? `<p><span class="label">Design File:</span> ${data.file}</p>` : `
                <p><span class="label">Product Name:</span> ${data.productName}</p>
                <p><span class="label">Price:</span> ₹${data.price}</p>
              `}
              <p><span class="label">Jewelry Type:</span> ${data.jewelryType}</p>
            </div>
          </div>
          <div class="section">
            <h2>Jewelry Specifications</h2>
            ${renderJewelryDetailsHtml(data.jewelryDetails)}
          </div>
        </div>
      </body>
    </html>
  `;
};

app.post('/send-email', async (req, res) => {
  const orderData = req.body;

  const html = generateHtml(orderData);

  htmlPdf.create(html).toBuffer((err, buffer) => {
    if (err) {
      return res.status(500).send('Error generating PDF');
    }

    const mailOptions = {
      from: 'luminluxedata@gmail.com',
      to: 'lakhanirudra9109@gmail.com',
      subject: 'New Order',
      text: 'Please find the attached order details.',
      attachments: [
        {
          filename: 'order.pdf',
          content: buffer,
        },
      ],
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).send('Error sending email');
      }
      res.send('Email sent successfully');
    });
  });
});

app.listen(3001, () => {
  console.log('Server running on port 3001');
});