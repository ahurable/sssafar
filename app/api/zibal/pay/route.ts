import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// Zibal API endpoints
const ZIBAL_BASE_URL = process.env.ZIBAL_BASE_URL || 'https://gateway.zibal.ir';
const ZIBAL_START_PAYMENT_ENDPOINT = '/v1/request';
const ZIBAL_VERIFY_PAYMENT_ENDPOINT = '/v1/verify';

// Types for Zibal requests and responses
interface ZibalStartPaymentRequest {
  merchant: string; // Your Zibal merchant ID
  amount: number; // Amount in Rials
  callbackUrl: string; // Callback URL for payment verification
  description?: string; // Payment description
  orderId?: string; // Your internal order ID
  mobile?: string; // User's mobile number
  paymentType?: string;
  // allowedCards?: string[]; // Optional: restrict allowed card types
  // percentMode?: number; // Optional: commission percentage mode
  // feeMode?: number; // Optional: fee mode
}

interface ZibalStartPaymentResponse {
  trackId: number; // Zibal track ID
  result: number; // Response code (100 for success)
  message: string; // Response message
  payLink?: string; // Payment link for redirect
}

interface ZibalVerifyRequest {
  trackId: number; // Zibal track ID from start payment
  merchant: string; // Your Zibal merchant ID
}

interface ZibalVerifyResponse {
  result: number; // Verification result code
  amount: number; // Paid amount in Rials
  description?: string; // Payment description
  cardNumber?: string; // Masked card number
  orderId?: string; // Your internal order ID
  message: string; // Response message
  status: number; // Payment status
  refNumber?: string; // Reference number
}

interface PaymentRequest {
  amount: number; // Amount in Tomans
  userId: string;
  userEmail?: string;
  userPhone?: string;
  description?: string;
  invoiceId?: string; // Optional: link to an invoice
  paymentType?: string;
}

interface PaymentResponse {
  success: boolean;
  paymentUrl?: string;
  trackId?: number;
  message: string;
  error?: string;
}

interface VerifyRequest {
  trackId: number;
  success: boolean; // From callback parameters
  status: number; // From callback parameters
  orderId?: string;
  paymentType?: string;
}

interface VerifyResponse {
  success: boolean;
  verified: boolean;
  amount?: number;
  refNumber?: string;
  cardNumber?: string;
  message: string;
  error?: string;
}

// Zibal result codes
const ZIBAL_RESULT_CODES = {
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
  const session = await getSession()

  if (!session) {
    return NextResponse.json({
        message: "ابتدا وارد حساب کاربری خود شوید"
    }, { status: 403})
  }

  const user = await prisma.user.findUnique({
    where: {
        id: session.userId
    },
    select: {
        phone: true,
        email: true
    }
  })

  if (!user || !user.phone) {
    return NextResponse.json({
        message: "شما باید شماره تلفن همراه خود را وارد و تایید نمایید"
    })
  }

  try {
    const paymentData: PaymentRequest = await request.json();

    // Validate required fields
    if (!paymentData.amount || paymentData.amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "مبلغ پرداخت نامعتبر است",
          error: "INVALID_AMOUNT"
        },
        { status: 400 }
      );
    }

    if (!session.userId) {
      return NextResponse.json(
        {
          success: false,
          message: "شناسه کاربر الزامی است",
          error: "MISSING_USER_ID"
        },
        { status: 400 }
      );
    }

    // Get Zibal merchant ID from environment variables
    const merchantId = process.env.ZIBAL_MERCHANT_ID;
    if (!merchantId) {
      console.error('ZIBAL_MERCHANT_ID is not configured');
      return NextResponse.json(
        {
          success: false,
          message: "پیکربندی درگاه پرداخت انجام نشده است",
          error: "GATEWAY_NOT_CONFIGURED"
        },
        { status: 500 }
      );
    }

    // Convert amount from Tomans to Rials (Zibal works with Rials)
    const amountInRials = paymentData.amount;

    // Create callback URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const callbackUrl = `${baseUrl}/api/zibal/payment/verify`;
    
    if (!paymentData.invoiceId) {
      console.log("invoice id is ", paymentData.invoiceId)
        const createInvoice = await prisma.invoice.create({
            data: {
                amount: paymentData.amount.toString(),
                state: "WAITING",
                kind: 'CHARGE',
                userId: session.userId,
                order: JSON.stringify({"نوع": "شارژ اعتبار کاربری"}),
                travelers: JSON.stringify({})
            }
        })

        const zibalRequest: ZibalStartPaymentRequest = {
          merchant: merchantId,
          amount: amountInRials,
          callbackUrl: callbackUrl,
          description: paymentData.description || `شارژ اعتبار به مبلغ ${paymentData.amount.toLocaleString('fa-IR')} تومان`,
          orderId: createInvoice.id,
          mobile: user.phone
        };


        console.log('Starting Zibal payment:', {
        amount: paymentData.amount,
        amountInRials,
        userId: session.userId,
        orderId: zibalRequest.orderId
        });

        // Call Zibal start payment API
        const startPaymentResponse = await fetch(`${ZIBAL_BASE_URL}${ZIBAL_START_PAYMENT_ENDPOINT}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(zibalRequest)
        });

        if (!startPaymentResponse.ok) {
        console.error('Zibal API error:', startPaymentResponse.status, startPaymentResponse.statusText);
        return NextResponse.json(
            {
            success: false,
            message: "خطا در ارتباط با درگاه پرداخت",
            error: "GATEWAY_CONNECTION_ERROR"
            },
            { status: 502 }
        );
        }

        const zibalResult: ZibalStartPaymentResponse = await startPaymentResponse.json();
        
        console.log('Zibal start payment response:', zibalResult);

        // Handle Zibal response
        if (zibalResult.result === ZIBAL_RESULT_CODES.SUCCESS) {
        // Store payment record in database (you should implement this)
        await storePaymentRecord({
            trackId: zibalResult.trackId,
            userId: paymentData.userId,
            amount: paymentData.amount,
            amountInRials,
            description: zibalRequest.description,
            orderId: zibalRequest.orderId,
            paymentType: zibalRequest.paymentType,
            status: 'PENDING',
            createdAt: new Date()
        });

        const paymentUrl = `${ZIBAL_BASE_URL}/start/${zibalResult.trackId}`;
        
        return NextResponse.json({
            success: true,
            paymentUrl: paymentUrl,
            trackId: zibalResult.trackId,
            message: "درگاه پرداخت با موفقیت ایجاد شد"
        } as PaymentResponse);

        } else {
        // Handle Zibal error codes
        const errorMessage = getZibalErrorMessage(zibalResult.result);
        
        return NextResponse.json(
            {
            success: false,
            message: errorMessage,
            error: `ZIBAL_ERROR_${zibalResult.result}`,
            zibalResult: zibalResult.result
            },
            { status: 400 }
        );
        }

    }

    // Prepare request for Zibal
    const zibalRequest: ZibalStartPaymentRequest = {
      merchant: merchantId,
      amount: amountInRials,
      callbackUrl: callbackUrl,
      description: paymentData.description || `شارژ اعتبار به مبلغ ${paymentData.amount.toLocaleString('fa-IR')} تومان`,
      orderId: paymentData.invoiceId,
      paymentType: paymentData.paymentType || "INVOICE_PAYMENT",
      mobile: user.phone
    };


    console.log('Starting Zibal payment:', {
      amount: paymentData.amount,
      amountInRials,
      userId: session.userId,
      orderId: zibalRequest.orderId,
      paymentType: zibalRequest.paymentType
    });

    // Call Zibal start payment API
    const startPaymentResponse = await fetch(`${ZIBAL_BASE_URL}${ZIBAL_START_PAYMENT_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(zibalRequest)
    });

    if (!startPaymentResponse.ok) {
      console.error('Zibal API error:', startPaymentResponse.status, startPaymentResponse.statusText);
      return NextResponse.json(
        {
          success: false,
          message: "خطا در ارتباط با درگاه پرداخت",
          error: "GATEWAY_CONNECTION_ERROR"
        },
        { status: 502 }
      );
    }

    const zibalResult: ZibalStartPaymentResponse = await startPaymentResponse.json();
    
    console.log('Zibal start payment response:', zibalResult);

    // Handle Zibal response
    if (zibalResult.result === ZIBAL_RESULT_CODES.SUCCESS) {
      // Store payment record in database (you should implement this)
      await storePaymentRecord({
        trackId: zibalResult.trackId,
        userId: paymentData.userId,
        amount: paymentData.amount,
        amountInRials,
        description: zibalRequest.description,
        orderId: zibalRequest.orderId,
        status: 'PENDING',
        paymentType: zibalRequest.paymentType,
        createdAt: new Date()
      });

      const paymentUrl = `${ZIBAL_BASE_URL}/start/${zibalResult.trackId}`;
      
      return NextResponse.json({
        success: true,
        paymentUrl: paymentUrl,
        trackId: zibalResult.trackId,
        message: "درگاه پرداخت با موفقیت ایجاد شد"
      } as PaymentResponse);

    } else {
      // Handle Zibal error codes
      const errorMessage = getZibalErrorMessage(zibalResult.result);
      
      return NextResponse.json(
        {
          success: false,
          message: errorMessage,
          error: `ZIBAL_ERROR_${zibalResult.result}`,
          zibalResult: zibalResult.result
        },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error in payment initiation:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: "خطای داخلی سرور",
        error: "INTERNAL_SERVER_ERROR"
      },
      { status: 500 }
    );
  }
}

// Verify payment endpoint
export async function PUT(request: NextRequest) {
  try {
    const verifyData: VerifyRequest = await request.json();

    // Validate required fields
    if (!verifyData.trackId) {
      return NextResponse.json(
        {
          success: false,
          message: "شناسه تراکنش الزامی است",
          error: "MISSING_TRACK_ID"
        },
        { status: 400 }
      );
    }

    // Get Zibal merchant ID from environment variables
    const merchantId = process.env.ZIBAL_MERCHANT_ID;
    if (!merchantId) {
      return NextResponse.json(
        {
          success: false,
          message: "پیکربندی درگاه پرداخت انجام نشده است",
          error: "GATEWAY_NOT_CONFIGURED"
        },
        { status: 500 }
      );
    }

    console.log('Verifying Zibal payment:', {
      trackId: verifyData.trackId,
      status: verifyData.status,
      success: verifyData.success
    });

    // Prepare verification request
    const verifyRequest: ZibalVerifyRequest = {
      trackId: verifyData.trackId,
      merchant: merchantId
    };

    // Call Zibal verify API
    const verifyResponse = await fetch(`${ZIBAL_BASE_URL}${ZIBAL_VERIFY_PAYMENT_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(verifyRequest)
    });

    if (!verifyResponse.ok) {
      console.error('Zibal verify API error:', verifyResponse.status, verifyResponse.statusText);
      return NextResponse.json(
        {
          success: false,
          message: "خطا در تایید پرداخت",
          error: "VERIFICATION_FAILED"
        },
        { status: 502 }
      );
    }

    const zibalVerifyResult: ZibalVerifyResponse = await verifyResponse.json();
    
    console.log('Zibal verify response:', zibalVerifyResult);

    // Handle verification result
    if (zibalVerifyResult.result === ZIBAL_RESULT_CODES.SUCCESS || 
        zibalVerifyResult.result === ZIBAL_RESULT_CODES.ALREADY_VERIFIED) {
      
      // Payment verified successfully
      // Update payment record in database (you should implement this)
      await updatePaymentRecord(verifyData.trackId, {
        status: 'SUCCESS',
        verifiedAt: new Date(),
        refNumber: zibalVerifyResult.refNumber,
        cardNumber: zibalVerifyResult.cardNumber,
        verifiedAmount: zibalVerifyResult.amount / 10 // Convert back to Tomans
      });

      // Add credit to user's account (you should implement this)
      await addUserCredit(verifyData.trackId);

      return NextResponse.json({
        success: true,
        verified: true,
        amount: zibalVerifyResult.amount / 10, // Convert to Tomans
        refNumber: zibalVerifyResult.refNumber,
        cardNumber: zibalVerifyResult.cardNumber,
        message: "پرداخت با موفقیت تایید شد"
      } as VerifyResponse);

    } else {
      // Payment verification failed
      const errorMessage = getZibalErrorMessage(zibalVerifyResult.result);
      
      // Update payment record as failed
      await updatePaymentRecord(verifyData.trackId, {
        status: 'FAILED',
        errorCode: zibalVerifyResult.result,
        errorMessage: errorMessage
      });

      return NextResponse.json(
        {
          success: false,
          verified: false,
          message: errorMessage,
          error: `VERIFICATION_FAILED_${zibalVerifyResult.result}`
        },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error in payment verification:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: "خطای داخلی سرور در تایید پرداخت",
        error: "INTERNAL_SERVER_ERROR"
      },
      { status: 500 }
    );
  }
}

// Helper function to get Zibal error messages
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

// Mock functions - Replace these with your actual database operations

async function  storePaymentRecord(paymentData: any) {
  // TODO: Implement database storage
  // Example: await db.payment.create({ data: paymentData });
  console.log('Storing payment record:', paymentData);
}

async function updatePaymentRecord(trackId: number, updateData: any) {
  // TODO: Implement database update
  // Example: await db.payment.update({ where: { trackId }, data: updateData });
  console.log('Updating payment record:', { trackId, ...updateData });
}

async function addUserCredit(trackId: number) {
  // TODO: Implement credit addition to user account
  // 1. Get payment record by trackId
  // 2. Get user ID from payment record
  // 3. Add credit amount to user's balance
  console.log('Adding credit for payment trackId:', trackId);
}

// GET endpoint for payment callback (redirect from Zibal)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const success = searchParams.get('success') === 'true';
  const trackId = searchParams.get('trackId');
  const status = searchParams.get('status');

  if (!trackId) {
    return NextResponse.redirect(new URL('/payment/failed', request.url));
  }

  // Redirect to appropriate page based on payment status
  if (success && status === '2') {
    // Payment was successful, redirect to success page
    return NextResponse.redirect(new URL(`/payment/success?trackId=${trackId}`, request.url));
  } else {
    // Payment failed or was cancelled
    return NextResponse.redirect(new URL(`/payment/failed?trackId=${trackId}`, request.url));
  }
}   