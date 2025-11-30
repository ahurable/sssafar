import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { bookingId, bookingType, bookingData, bookingInformation } = await request.json();

    if (!bookingId || !bookingType) {
      return NextResponse.json(
        { error: 'Booking ID and type are required' },
        { status: 400 }
      );
    }

    // Parse booking data
    let parsedBookingData;
    try {
      parsedBookingData = typeof bookingData === 'string' ? JSON.parse(bookingData) : bookingData;
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid booking data format' },
        { status: 400 }
      );
    }

    // Parse booking information
    let bookingInfo;
    try {
      bookingInfo = typeof bookingInformation === 'string' 
        ? JSON.parse(parsedBookingData.bookingInformation)
        : parsedBookingData.bookingInformation;
    } catch (error) {
      bookingInfo = {};
    }

    // Generate PDF based on booking type
    let pdfBuffer;
    switch (bookingType) {
      case 'CIP':
        pdfBuffer = await generateCIPTicket(parsedBookingData, bookingInfo);
        break;
      case 'HOTEL':
        pdfBuffer = await generateHotelTicket(parsedBookingData, bookingInfo);
        break;
      case 'FLIGHT':
        pdfBuffer = await generateFlightTicket(parsedBookingData, bookingInfo);
        break;
      default:
        return NextResponse.json(
          { error: 'Unsupported booking type' },
          { status: 400 }
        );
    }

    // Create response
    const response = new NextResponse(pdfBuffer);
    response.headers.set('Content-Type', 'application/pdf');
    response.headers.set(
      'Content-Disposition',
      `attachment; filename="ticket-${bookingId}.pdf"`
    );

    return response;

  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}

// CIP Ticket Generator using a simple PDF library
async function generateCIPTicket(booking: any, bookingInfo: any) {
  // For now, let's use a simple approach with html-pdf
  const htmlContent = generateCIPTicketHTML(booking, bookingInfo);
  
  // Convert HTML to PDF using a simple approach
  // In a real implementation, you might want to use a service like:
  // - puppeteer for server-side rendering
  // - a PDF generation service
  // - or implement with a proper PDF library
  
  // For now, return a simple text-based PDF
  return htmlContent;
}

function generateCIPTicketHTML(booking: any, bookingInfo: any) {
  return `
    <!DOCTYPE html>
    <html dir="rtl">
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          max-width: 400px;
        }
        .ticket {
          border: 2px solid #1e40af;
          border-radius: 10px;
          padding: 20px;
          background: white;
        }
        .header {
          background: #1e40af;
          color: white;
          padding: 15px;
          border-radius: 8px;
          text-align: center;
          margin-bottom: 20px;
        }
        .section {
          margin-bottom: 15px;
          padding: 15px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
        }
        .section-title {
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 10px;
          font-size: 14px;
        }
        .row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
        }
        .label {
          color: #6b7280;
          font-weight: bold;
          font-size: 10px;
        }
        .value {
          color: #374151;
          font-size: 10px;
        }
        .features {
          display: flex;
          flex-wrap: wrap;
          margin-top: 10px;
        }
        .feature {
          font-size: 8px;
          color: #059669;
          margin-left: 10px;
          margin-bottom: 5px;
        }
        .footer {
          margin-top: 20px;
          padding: 15px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
        }
        .barcode {
          text-align: center;
          margin-top: 10px;
          padding: 10px;
          border: 1px dashed #d1d5db;
          font-family: monospace;
        }
      </style>
    </head>
    <body>
      <div class="ticket">
        <div class="header">
          <h2>بلیط خدمات CIP</h2>
          <p>${bookingInfo.order?.airport || 'فرودگاه'}</p>
        </div>

        <div class="section">
          <div class="section-title">اطلاعات مسافر</div>
          <div class="row">
            <span class="label">نام کامل:</span>
            <span class="value">${bookingInfo.traveler?.firstName} ${bookingInfo.traveler?.lastName}</span>
          </div>
          <div class="row">
            <span class="label">ایمیل:</span>
            <span class="value">${bookingInfo.traveler?.email}</span>
          </div>
          <div class="row">
            <span class="label">شماره تماس:</span>
            <span class="value">${bookingInfo.traveler?.phoneNumber}</span>
          </div>
          <div class="row">
            <span class="label">کد رزرو:</span>
            <span class="value">${booking.bookingCode}</span>
          </div>
        </div>

        <div class="section">
          <div class="section-title">جزئیات خدمات</div>
          <div class="row">
            <span class="label">خدمات:</span>
            <span class="value">${bookingInfo.order?.service}</span>
          </div>
          <div class="row">
            <span class="label">تاریخ:</span>
            <span class="value">${new Date(bookingInfo.order?.date).toLocaleDateString('fa-IR')}</span>
          </div>
          <div class="row">
            <span class="label">مدت زمان:</span>
            <span class="value">${bookingInfo.order?.duration}</span>
          </div>
          <div class="row">
            <span class="label">مسافران:</span>
            <span class="value">${bookingInfo.order?.passengers} نفر</span>
          </div>
          <div class="row">
            <span class="label">نوع سرویس:</span>
            <span class="value">${bookingInfo.order?.serviceType === 'departure' ? 'خروج' : 'ورود'}</span>
          </div>
        </div>

        <div class="section">
          <div class="section-title">خدمات شامل</div>
          <div class="features">
            ${bookingInfo.order?.features?.map((feature: string) => 
              `<span class="feature">• ${feature}</span>`
            ).join('')}
          </div>
          <div class="features">
            ${bookingInfo.order?.included?.map((include: string) => 
              `<span class="feature">✓ ${include}</span>`
            ).join('')}
          </div>
        </div>

        <div class="footer">
          <div class="row">
            <span class="label">مبلغ کل:</span>
            <span class="value" style="color: #1e40af; font-weight: bold;">
              ${bookingInfo.order?.price?.toLocaleString('fa-IR')} ${bookingInfo.order?.currency}
            </span>
          </div>
          <div class="row">
            <span class="label">وضعیت:</span>
            <span class="value" style="color: ${booking.status === 'CONFIRMED' ? '#059669' : '#d97706'};">
              ${booking.status === 'CONFIRMED' ? 'تایید شده' : 'در انتظار'}
            </span>
          </div>
          
          <div class="barcode">
            ${booking.bookingCode}
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Simple PDF generator as fallback
function generateSimplePDF(booking: any, bookingInfo: any) {
  // This is a very basic PDF structure
  // In production, you'd want to use a proper PDF library
  const pdfContent = `
%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj

2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj

3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 400 600] /Contents 4 0 R >>
endobj

4 0 obj
<< /Length 200 >>
stream
BT
/F1 12 Tf
50 550 Td
(CIP Ticket - ${booking.bookingCode}) Tj
0 -20 Td
(Passenger: ${bookingInfo.traveler?.firstName} ${bookingInfo.traveler?.lastName}) Tj
0 -20 Td
(Service: ${bookingInfo.order?.service}) Tj
0 -20 Td
(Date: ${new Date(bookingInfo.order?.date).toLocaleDateString('fa-IR')}) Tj
0 -20 Td
(Status: ${booking.status}) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000234 00000 n 
trailer
<< /Size 5 /Root 1 0 R >>
startxref
484
%%EOF
  `;

  return Buffer.from(pdfContent);
}

// Placeholder functions for other booking types
async function generateHotelTicket(booking: any, bookingInfo: any) {
  return generateSimplePDF(booking, bookingInfo);
}

async function generateFlightTicket(booking: any, bookingInfo: any) {
  return generateSimplePDF(booking, bookingInfo);
}