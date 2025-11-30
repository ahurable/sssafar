import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// Types
interface PaymentVerificationRequest {
  trackId: number;
  success: boolean;
  status: number;
  amount?: number;
  gateway: 'ZIBAL' | 'OTHER';
  orderId?: string;
  invoiceId?: string;
  userId?: string;
  panelId?: string;
}

interface PaymentVerificationResponse {
  success: boolean;
  verified: boolean;
  amount?: number;
  refNumber?: string;
  cardNumber?: string;
  message: string;
  error?: string;
  paymentType?: string;
  invoiceId?: string;
  userId?: string;
  alreadyProcessed?: boolean;
}

interface ZibalVerifyRequest {
  trackId: number;
  merchant: string;
}

interface ZibalVerifyResponse {
  result: number;
  amount: number;
  description?: string;
  cardNumber?: string;
  orderId?: string;
  message: string;
  status: number;
  refNumber?: string;
}

// Payment Gateway Configuration
const PAYMENT_GATEWAYS = {
  ZIBAL: {
    baseUrl: process.env.ZIBAL_BASE_URL || 'https://gateway.zibal.ir',
    verifyEndpoint: '/v1/verify',
    merchantId: process.env.ZIBAL_MERCHANT_ID
  }
} as const;

// Result Codes
const RESULT_CODES = {
  SUCCESS: 100,
  ALREADY_VERIFIED: 201,
  INVALID_MERCHANT: 102,
  INSUFFICIENT_FUNDS: 103,
  INVALID_TRACK_ID: 104,
  PAYMENT_FAILED: 105,
  SYSTEM_ERROR: 106,
  EXPIRED_TRACK_ID: 113,
  INVALID_AMOUNT: 111,
} as const;

export async function POST(request: NextRequest) {
  
  try {
    const verificationData: PaymentVerificationRequest = await request.json();
    // console.log(verificationData)
    // Validate required fields
    if (!verificationData.trackId) {
      return NextResponse.json(
        {
          success: false,
          verified: false,
          message: "شناسه تراکنش الزامی است",
          error: "MISSING_TRACK_ID"
        },
        { status: 400 }
      );
    }

    // console.log('Payment verification request:',
    //   verificationData
    // );

    // Check if transaction was already processed to avoid duplicates
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: verificationData.orderId
      }
    })

    if (!invoice) {
      return NextResponse.json({
        message: "صورت حساب کاربری شما یافت نشد"
      },{ status: 404 })
    }

    let verificationResult: PaymentVerificationResponse;

     
      // Route to appropriate gateway handler
      switch (verificationData.gateway) {
        case 'ZIBAL':
          verificationResult = await verifyZibalPayment(verificationData);
          break;
        
        default:
          return NextResponse.json(
            {
              success: false,
              verified: false,
              message: "درگاه پرداخت پشتیبانی نمی‌شود",
              error: "UNSUPPORTED_GATEWAY"
            },
            { status: 400 }
          );
      }

      // console.log(`[Zibal] Verification Results: ${verificationResult.verified}`)


      // If verification was successful, process the payment based on type
      if (verificationResult.verified) {
        await processSuccessfulPayment(verificationData, verificationResult, invoice.id, invoice.userId);
      } else if (!verificationResult.verified) {
        await processFailedPayment(verificationData, verificationResult, invoice.userId);
      }
    

    return NextResponse.json(verificationResult);

  } catch (error) {
    console.error('Error in payment verification:', error);
    
    return NextResponse.json(
      {
        success: false,
        verified: false,
        message: "خطای داخلی سرور در تایید پرداخت",
        error: "INTERNAL_SERVER_ERROR"
      },
      { status: 500 }
    );
  }
}

// Zibal Payment Verification
async function verifyZibalPayment(verificationData: PaymentVerificationRequest): Promise<PaymentVerificationResponse> {
  const gatewayConfig = PAYMENT_GATEWAYS.ZIBAL;
  
  if (!gatewayConfig.merchantId) {
    return {
      success: false,
      verified: false,
      message: "پیکربندی درگاه پرداخت انجام نشده است",
      error: "GATEWAY_NOT_CONFIGURED"
    };
  }

  try {
    const verifyRequest: ZibalVerifyRequest = {
      trackId: verificationData.trackId,
      merchant: gatewayConfig.merchantId
    };


    const verifyResponse = await fetch(`${gatewayConfig.baseUrl}${gatewayConfig.verifyEndpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(verifyRequest)
    });

    if (!verifyResponse.ok) {
      console.error('Zibal verify API error:', verifyResponse.status, verifyResponse.statusText);
      return {
        success: false,
        verified: false,
        message: "خطا در تایید پرداخت از درگاه",
        error: "GATEWAY_VERIFICATION_ERROR"
      };
    }

    const zibalResult: ZibalVerifyResponse = await verifyResponse.json();
    const invoice = await prisma.invoice.findUnique({
      where: { id: zibalResult.orderId},
      select: { state: true }
    })
    // console.log('Zibal verification response:', zibalResult);

    if (zibalResult.result === RESULT_CODES.SUCCESS) {
      return {
        success: true,
        verified: true,
        amount: zibalResult.amount / 10, // Convert to Tomans
        refNumber: zibalResult.refNumber,
        cardNumber: zibalResult.cardNumber,
        message: "پرداخت با موفقیت تایید شد",
        invoiceId: verificationData.invoiceId,
        
        userId: verificationData.userId
      };
    } else if (zibalResult.result === RESULT_CODES.ALREADY_VERIFIED) {
      return {
        success: true,
        verified: true,
        amount: zibalResult.amount / 10, // Convert to Tomans
        refNumber: zibalResult.refNumber,
        cardNumber: zibalResult.cardNumber,
        message: "پرداخت قبلاً تأیید شده است",
        // paymentType: verificationData.paymentType,
        invoiceId: verificationData.invoiceId,
        userId: verificationData.userId,
        alreadyProcessed: true
      };
    } else {
      const errorMessage = getZibalErrorMessage(zibalResult.result);
      
      return {
        success: false,
        verified: false,
        message: errorMessage,
        error: `VERIFICATION_FAILED_${zibalResult.result}`
      };
    }

  } catch (error) {
    console.error('Error in Zibal verification:', error);
    return {
      success: false,
      verified: false,
      message: "خطا در ارتباط با درگاه پرداخت",
      error: "GATEWAY_CONNECTION_ERROR"
    };
  }
}

// Process successful payment based on payment type
async function processSuccessfulPayment(
  verificationData: PaymentVerificationRequest, 
  verificationResult: PaymentVerificationResponse,
  invoiceId: string,
  userId: string
) {
  try {
    // console.log('Processing successful payment: ', {
      // paymentType: verificationData.paymentType,
    //   trackId: verificationData.trackId,
    //   amount: verificationResult.amount
    // });

    const invoice = await prisma.invoice.update({
      where: {
        id: invoiceId
      },
      data: {
        state: "PAID"
      },
      select: {
        kind: true
      }
    }) 

    if (!invoice) {
      return NextResponse.json({
        message: "خطا در دریافت صورت حساب"
      })
    }

    // Create transaction record
    await createTransactionRecord(verificationData, verificationResult, invoiceId);

    // Then process based on payment type
    switch (invoice.kind) {
      case 'CHARGE':
        await processCreditCharge(verificationData, verificationResult, invoiceId);
        break;
      
      case 'HOTEL':
        await processInvoicePayment(verificationData, verificationResult, invoiceId);
        // console.log('[Hotel] it\'s a hotel payment , proceeded')
        break;
      
      case 'FLIGHT':
        await bookFlight(invoiceId, userId);
        break;

      case 'ACTIVITY':
        await processActivityPayment(invoiceId, verificationData, verificationResult);
        break;

      case 'CIP':
        await processCipPayment(invoiceId, verificationData, verificationResult);
        break;

      default:
        console.warn('Unknown payment type: ', invoice.kind);
    }

    // console.log('Successfully processed payment for trackId:', verificationData.trackId);

  } catch (error) {
    console.error('Error processing successful payment:', error);
  }
}

async function bookFlight(invoiceId:string, userId:string) {
  const invoice = await prisma.invoice.findUnique({
    where: {
      id: invoiceId
    }
  })

  if (!invoice) {
    return NextResponse.json({
      message: "صورت حساب درخواستی پیدا نشد"
    }, { status: 404 })
  }

  if (!invoice.travelers) {
    return NextResponse.json({
      message: "در اینویس ارسالی مسافری وجود ندارد"
    }, { status: 400 })
  }
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://omosafer.ir"
  const requestData = {
    travelers: invoice.travelers,
    invoiceId: invoice.id,
    fareSourceCode: invoice.flightSourceCode,
    totalPrice: parseInt(invoice.amount),
    userId: userId
  };
  
  const response = await fetch(
    `${baseUrl}/api/flights/book`,
    {
      method: "POST",
      headers: {
        "Content-Type":"application/json"
      },
      body: JSON.stringify(requestData)
    }
  )

  const data = await response.json()

  // console.log("STRAIGHT PAYMENT FLIGHT BOOK RESPONSE: ", data)

  if (!response.ok) {
    return NextResponse.json({
      message: "خطایی رخ داد هنگام خرید بلیط"
    }, { status: 500 })
  }

  return NextResponse.json({
    message: "بلیط دریافت شد"
  }, { status: 200})

}

// Process failed payment
async function processFailedPayment(
  verificationData: PaymentVerificationRequest,
  verificationResult: PaymentVerificationResponse,
  userId: string
) {
  try {
    // Create failed transaction record
    // // console.log(verificationData)
    await prisma.userTransaction.create({
      data: {
        type: 'DEPOSIT', // Still DEPOSIT type but we'll mark it as failed in description
        amount: verificationResult.amount || 0,
        description: `FAILED - ${verificationResult.message} - trackId:${verificationData.trackId} - gateway:${verificationData.gateway}`,
        userId: userId || 'unknown'
      }
    });

  } catch (error) {
    console.error('Error processing failed payment:', error);
  }
}

// Create transaction record
async function createTransactionRecord(
  verificationData: PaymentVerificationRequest,
  verificationResult: PaymentVerificationResponse,
  invoiceId: string
) {

  const invoice = await prisma.invoice.findUnique({
    where: {
      id: invoiceId
    }
  })

  if (!invoice) {
    return NextResponse.json({
      message: "the invoice could not be found"
    }, { status: 400 })
  }

  await prisma.userTransaction.create({
    data: {
      type: 'DEPOSIT',
      amount: parseInt(invoice.amount),
      description: `شارژ اعتبار از طریق درگاه ${verificationData.gateway} - trackId:${verificationData.trackId} - ref:${verificationResult.refNumber || 'N/A'}`,
      userId: invoice.userId,
    }
  });
}

// Payment Type Handlers
async function processCreditCharge(
  verificationData: PaymentVerificationRequest,
  verificationResult: PaymentVerificationResponse,
  invoiceId: string
) {
  if (invoiceId) {
    // Update user's credit balance in PanelUser model
    // // console.log(`the process charge data : ${verificationData} & ${verificationResult}`)
    const invoice = await prisma.invoice.findUnique({
      where: {
        id: invoiceId
      }
    })

    if (!invoice) {
      return NextResponse.json({
        message: "صورت حساب شما پیدا نشد"
      }, { status: 404 })
    }

    const updateCredit = await prisma.credit.update({
      where: { userId: invoice.userId },
      data: {
        balance: {
          increment: parseInt(invoice.amount)
        }
      }
    });
    if (updateCredit) {
      await prisma.invoice.update({
        where: {
          id: verificationData.orderId
        },
        data: {
          state: "PAID"
        }
      })
    } else {
      await prisma.invoice.update({
        where: {
          id: verificationData.orderId
        },
        data: {
          state: "CANCELLED"
        }
      })
    }
    // console.log(`Added ${verificationResult.amount} credit to user ${verificationData.userId}`);
  }
}

async function processInvoicePayment(
  verificationData: PaymentVerificationRequest,
  verificationResult: PaymentVerificationResponse,
  invoiceId: string
) {
  try {
    // console.log(verificationData.invoiceId);
    
    if (invoiceId) {
      const invoice = await prisma.invoice.update({
        where: {
          id: invoiceId
        },
        data: {
          state: "PAID"
        }
      });

      // console.log(`[Hotel] the type of order is : ${typeof invoice.order}`);
      // console.log(`[Hotel] the type of travelers is : ${typeof invoice.travelers}`);
      
      if (!invoice.order) {
        // console.log('the order doesnt exists');
        return NextResponse.json({
          message: "اطلاعات سفارش یافت نشد"
        }, { status: 400 });
      }

      if (!invoice.travelers) {
        // console.log('the travelers doesnt exists');
        return NextResponse.json({
          message: "اطلاعات مسافران یافت نشد"
        }, { status: 400 });
      }

      // Both should be objects since they're stored the same way
      const orderData = invoice.order as any;
      const travelersData = invoice.travelers as any;

      // console.log('Order data:', orderData);
      // console.log('Travelers data:', travelersData);

      // Prepare booking request
      const requestForBook = {
        fareSourceCode: orderData.FareSourceCode || orderData.fareSourceCode,
        hotelId: orderData.HotelId || orderData.hotelId,
        travelers: travelersData,
        checkIn: orderData.CheckIn || orderData.checkIn,
        checkOut: orderData.CheckOut || orderData.checkOut,
        invoiceId: invoice.id,
        rooms: orderData.Rooms || orderData.rooms
      };

      // console.log('Sending booking request:', requestForBook);

      // Make booking request
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/hotels/book`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({...requestForBook, straightPayment: true})
      });

      const data = await response.json();
      // console.log(`[Hotel Payment Process] Booking response:`, data);
      
      if (response.ok) {
        return NextResponse.json({
          message: "عملیات رزرو با موفقیت انجام شد",
          bookingData: data
        });
      } else {
        console.error('Booking failed:', data);
        return NextResponse.json({
          message: "در انجام عملیات رزرو خطایی رخ داد",
          error: data
        }, { status: 500 });
      }
    }

    return NextResponse.json({
      message: "Invoice ID not provided"
    }, { status: 400 });

  } catch (error) {
    console.error('Error in processInvoicePayment:', error);
    return NextResponse.json({
      message: "خطای داخلی در پردازش پرداخت"
    }, { status: 500 });
  }
}

async function processCipPayment(
  invoiceId: string,
  verificationData: PaymentVerificationRequest,
  verificationResult: PaymentVerificationResponse
) {
  // Handle service-specific payment processing
  // console.log('Processing service payment:', verificationData);

  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/cip/reservations`, {
    method: 'POST',
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      invoiceId: invoiceId
    })
  })

  const data = await res.json()

  // console.log(data)

  if (res.ok) {
     return NextResponse.json({
        message: "عملیات رزرو با موفقیت انجام شد",
        bookingData: data
     });
  } else {
    return NextResponse.json({
      message: "خطا در پردازش عملیات رزرو"
    }, { status: 500 })
  }
}

async function processActivityPayment(
  invoiceId: string,
  verificationData: PaymentVerificationRequest,
  verificationResult: PaymentVerificationResponse
) {
  // Handle service-specific payment processing
  // console.log('Processing service payment:', verificationData);

  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/activities/booking`, {
    method: 'POST',
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      invoiceId: invoiceId
    })
  })

  const data = await res.json()

  // console.log(data)

  if (res.ok) {
     return NextResponse.json({
        message: "عملیات رزرو با موفقیت انجام شد",
        bookingData: data
     });
  } else {
    return NextResponse.json({
      message: "خطا در پردازش عملیات رزرو"
    }, { status: 500 })
  }
}

// Helper Functions
function getZibalErrorMessage(resultCode: number): string {
  const errorMessages: { [key: number]: string } = {
    102: "مرچنت کد درگاه پرداخت نامعتبر است",
    103: "مرچنت کد درگاه پرداخت فعال نیست",
    104: "کد تراکنش نامعتبر است",
    105: "تراکنش ناموفق بوده است",
    106: "خطای سیستمی رخ داده است",
    111: "مبلغ پرداخت نامعتبر است",
    112: "درخواست نامعتبر است",
    113: "کد تراکنش منقضی شده است",
    201: "تراکنش قبلا تایید شده است",
  };

  return errorMessages[resultCode] || "خطای ناشناخته از درگاه پرداخت";
}

// GET endpoint for payment callback (redirect from payment gateways)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const success = searchParams.get('success') === '1' || searchParams.get('success') === 'true';
  const trackId = searchParams.get('trackId');
  const status = searchParams.get('status');
  const orderId = searchParams.get('orderId');

  // console.log('Zibal callback received:', {
  //   success,
  //   trackId,
  //   status,
  //   orderId
  // });

  if (!trackId) {
    console.error('No trackId in callback');
    return NextResponse.redirect(new URL('/payment/failed', request.url));
  }

  try {
    const verificationData: PaymentVerificationRequest = {
      trackId: parseInt(trackId),
      success: success,
      status: parseInt(status || '0'),
      gateway: 'ZIBAL',
      orderId: orderId || undefined
    };

    // Verify the payment
    const verifyResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/zibal/payment/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(verificationData)
    });

    if (!verifyResponse.ok) {
      throw new Error(`Verification failed with status: ${verifyResponse.status}`);
    }

    const verifyResult = await verifyResponse.json();
    // console.log('Verification result:', verifyResult);

    // Redirect based on verification result
    if (verifyResult.verified) {
      return NextResponse.redirect(new URL(`/payment/success?trackId=${trackId}&amount=${verifyResult.amount || 0}&refNumber=${verifyResult.refNumber || ''}`, request.url));
    } else {
      return NextResponse.redirect(new URL(`/payment/failed?trackId=${trackId}&error=${verifyResult.error || 'UNKNOWN_ERROR'}`, request.url));
    }

  } catch (error) {
    console.error('Error in payment callback:', error);
    // Fallback redirect based on success parameter from Zibal
    if (success && status === '2') {
      return NextResponse.redirect(new URL(`/payment/success?trackId=${trackId}`, request.url));
    } else {
      return NextResponse.redirect(new URL(`/payment/failed?trackId=${trackId}`, request.url));
    }
  }
}