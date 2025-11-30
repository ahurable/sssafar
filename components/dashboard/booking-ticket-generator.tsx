'use client';

import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';

// Register Dana TTF font
Font.register({
  family: 'Dana',
  src: '/assets/font/tff/YekanBakhFaNum-SemiBold.ttf',
//   format: 'truetype',
});

// Create styles with optimized spacing
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 10,
    fontFamily: 'Dana',
    textAlign: 'right',
  },
  container: {
    flex: 1,
    border: '2px solid #172554',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottom: '1.5px solid #e2e8f0',
  },
  logo: {
    width: 60,
    height: 30,
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  headerTitle: {
    color: '#172554',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  headerSubtitle: {
    color: '#475569',
    fontSize: 10,
  },
  mainContent: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginBottom: 8,
    flex: 1,
  },
  leftColumn: {
    width: '58%',
  },
  rightColumn: {
    width: '40%',
  },
  section: {
    marginBottom: 8,
    padding: 10,
    border: '1.5px solid #172554',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#172554',
    textAlign: 'right',
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: 3,
  },
  row: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginBottom: 4,
    alignItems: 'flex-start',
  },
  label: {
    fontSize: 8,
    color: '#475569',
    fontWeight: 'bold',
    textAlign: 'right',
    width: '35%',
  },
  value: {
    fontSize: 8,
    color: '#1e293b',
    textAlign: 'right',
    width: '60%',
  },
  featuresSection: {
    marginBottom: 8,
    padding: 10,
    border: '1.5px solid #172554',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    flex: 1,
  },
  featuresGrid: {
    flexDirection: 'column',
    marginTop: 4,
  },
  featureItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 3,
    paddingRight: 4,
  },
  featureBullet: {
    color: '#059669',
    fontSize: 8,
    marginLeft: 4,
    width: 12,
    textAlign: 'center',
  },
  featureText: {
    fontSize: 7,
    color: '#374151',
    textAlign: 'right',
    flex: 1,
  },
  footer: {
    padding: 10,
    border: '1.5px solid #172554',
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    marginTop: 8,
  },
  priceRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  price: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#172554',
  },
  status: {
    fontSize: 9,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  barcode: {
    alignItems: 'center',
    marginTop: 6,
    padding: 6,
    border: '1.5px dashed #172554',
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  barcodeText: {
    fontSize: 7,
    color: '#172554',
    fontFamily: 'Courier',
    letterSpacing: 1,
  },
});

// Helper functions
const toPersianNumber = (num: number) => {
  const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/\d/g, (digit) => persianNumbers[parseInt(digit)]);
};

const formatPrice = (price: number) => {
  return toPersianNumber(price).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// CIP Ticket Component with corrected label/value positions
const CIPTicket = ({ booking, bookingInfo }: any) => (
  <Document>
    <Page 
      size="A4" 
      style={styles.page}
      orientation="landscape"
    >
      <View style={styles.container}>
        {/* Single Header */}
        <View style={styles.header}>
          <Image 
            style={styles.logo}
            src="/assets/images/logo.png"
          />
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>بلیط خدمات CIP</Text>
            <Text style={styles.headerSubtitle}>{bookingInfo.order?.airport}</Text>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Left Column */}
          <View style={styles.leftColumn}>
            {/* Passenger Information - Fixed label/value positions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>اطلاعات مسافر</Text>
              <View style={styles.row}>
                <Text style={styles.label}>نام کامل:</Text>
                <Text style={styles.value}>
                  {bookingInfo.traveler?.firstName} {bookingInfo.traveler?.lastName}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>ایمیل:</Text>
                <Text style={styles.value}>{bookingInfo.traveler?.email}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>شماره تماس:</Text>
                <Text style={styles.value}>{bookingInfo.traveler?.phoneNumber}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>کد رزرو:</Text>
                <Text style={styles.value}>{booking.bookingCode}</Text>
              </View>
            </View>

            {/* Service Details - Fixed label/value positions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>جزئیات خدمات</Text>
              <View style={styles.row}>
                <Text style={styles.label}>خدمات:</Text>
                <Text style={styles.value}>{bookingInfo.order?.service}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>تاریخ:</Text>
                <Text style={styles.value}>
                  {new Date(bookingInfo.order?.date).toLocaleDateString('fa-IR')}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>مدت زمان:</Text>
                <Text style={styles.value}>{bookingInfo.order?.duration}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>مسافران:</Text>
                <Text style={styles.value}>
                  {toPersianNumber(bookingInfo.order?.passengers || 0)} نفر
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>نوع سرویس:</Text>
                <Text style={styles.value}>
                  {bookingInfo.order?.serviceType === 'departure' ? 'خروج' : 'ورود'}
                </Text>
              </View>
            </View>
          </View>

          {/* Right Column */}
          <View style={styles.rightColumn}>
            <View style={styles.featuresSection}>
              <Text style={styles.sectionTitle}>خدمات شامل</Text>
              <View style={styles.featuresGrid}>
                {bookingInfo.order?.features?.map((feature: string, index: number) => (
                  <View key={index} style={styles.featureItem}>
                    <Text style={styles.featureBullet}>•</Text>
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
                {bookingInfo.order?.included?.map((include: string, index: number) => (
                  <View key={index} style={styles.featureItem}>
                    <Text style={styles.featureBullet}>✓</Text>
                    <Text style={styles.featureText}>{include}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Single Footer */}
        <View style={styles.footer}>
          <View style={styles.priceRow}>
            <Text style={styles.label}>مبلغ کل:</Text>
            <Text style={styles.price}>
              {formatPrice(bookingInfo.order?.price || 0)} {bookingInfo.order?.currency}
            </Text>
          </View>
          
          <View style={styles.statusRow}>
            <Text style={styles.label}>وضعیت:</Text>
            <Text 
              style={[
                styles.status, 
                { 
                  color: booking.status === 'CONFIRMED' ? '#059669' : '#d97706',
                  backgroundColor: booking.status === 'CONFIRMED' ? '#dcfce7' : '#fef3c7'
                }
              ]}
            >
              {booking.status === 'CONFIRMED' ? 'تایید شده' : 'در انتظار'}
            </Text>
          </View>
          
          <View style={styles.barcode}>
            <Text style={styles.barcodeText}>{booking.bookingCode}</Text>
          </View>
        </View>
      </View>
    </Page>
  </Document>
);

interface TicketGeneratorProps {
  booking: any;
  bookingType: string;
  children: React.ReactNode;
}

export function TicketGenerator({ booking, bookingType, children }: TicketGeneratorProps) {
  let bookingInfo;
  try {
    bookingInfo = typeof booking.bookingInformation === 'string' 
      ? JSON.parse(booking.bookingInformation)
      : booking.bookingInformation;
  } catch (error) {
    bookingInfo = {};
  }

  if (bookingType !== 'CIP') return null;

  return (
    <PDFDownloadLink
      document={<CIPTicket booking={booking} bookingInfo={bookingInfo} />}
      fileName={`بلیط-${booking.bookingCode}.pdf`}
      style={{
        textDecoration: 'none',
        color: 'inherit',
        display: 'contents'
      }}
    >
      {({ loading, error }) => {
        if (error) {
          console.error('PDF generation error:', error);
          return (
            <div className="h-8 w-8 flex items-center justify-center text-red-500">
              <span className="text-xs">خطا</span>
            </div>
          );
        }

        return loading ? (
          <div className="h-8 w-8 flex items-center justify-center">
            <span className="text-xs">...</span>
          </div>
        ) : (
          children
        );
      }}
    </PDFDownloadLink>
  );
}