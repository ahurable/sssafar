import { NextRequest, NextResponse } from 'next/server';
import { flightSessionService } from '@/lib/flight-session';

interface HotelDetailsRequest {
  SessionId: string;
  FareSourceCode: string;
  FixStayId: number | null;
  Nationality: string | null;
}

interface HotelDetailsResponse {
  Success: boolean;
  Error?: {
    Id: string;
    Message: string;
  };
  CheckIn: string;
  CheckOut: string;
  PricedItinerary: {
    FareSourceCode: string;
    Offer: string;
    Promotion: string;
    NonRefundable: boolean;
    HotelId: number;
    HotelPolicy: {
      BeginTime: string;
      EndTime: string;
      MinAge: string;
      CheckOutTime: string;
      Instructions: string;
      SpecialInstructions: string;
      MandatoryFee: string;
      OptionalFee: string;
      KnowBeforeYouGo: string;
      PaymentDetail: string;
      LicenseNumber: string;
      KeyCollectionInfo: string;
      InstructionsFa: string;
      SpecialInstructionsFa: string;
      ChildPolicyDescriptionFa: string;
      SingleWomanDescriptionFa: string;
      PetAttribiute: Array<{ name: string }>;
    };
    ExtraCharge: {
      Excluded: string;
      Included: string;
      MealplanDescription: string;
    };
    PaymentDeadline: string;
    Currency: string;
    AvailableRoom: number;
    PlainTextCancellationPolicy: string;
    NetRate: number;
    NetRateWithoutDiscount: number;
    ExtraBedRate: number;
    BaseRate: number;
    Rooms: Array<{
      RoomId: string;
      RoomMapId: string;
      Name: string;
      RoomMapName: string;
      AdultCount: number;
      ExtraBedCount: number;
      ChildCount: number;
      ChildAges: string[];
      MealType: string;
      SharingBedding: boolean;
      BedGroups: string;
      HotelRoomEarlyCheckin: {
        CheckInDateTime: string;
        CheckInAmount: number;
      };
      HotelRoomLateCheckout: {
        CheckOutDateTime: string;
        CheckOutAmount: number;
      };
    }>;
    Surcharges: Array<{
      Name: string;
      ChargeType: string;
      SupplierAmount: number;
      Amount: number;
      ExclusionType: number;
    }>;
    CancellationPolicies: Array<{
      Amount: number;
      FromDate: string;
    }>;
    Remarks: string[];
    RemarksFa: string[];
    Amenities: string[];
    IsReserveOffline: boolean;
    IsBlockout: boolean;
    IsMinStayNight: boolean;
    MinStayNight: number;
    IsMaxStayNight: boolean;
    MaxStayNight: number;
    IsFixStayNight: boolean;
    FixStayNight: number;
    IsBoardPrice: boolean;
    HotelRefundType: string;
    NationalityRule: {
      IsAll: boolean;
      NationalityCodes: string[];
      CurrencyCode: number;
    };
    OtherNationalities: any[];
    PricedItineraryTransfers: Array<{
      TransferType: number;
      ServiceType: number;
    }>;
    HotelPricedItineraryMetaDatas: Array<{
      Offer: string;
      Promotion: string;
      Amenities: string[];
      NetRate: number;
      SupplierNetRate: number;
      HotelPricedItineraryMetaDataRooms: Array<{
        ProviderRoomId: string;
        RoomName: string;
        MealType: string;
      }>;
    }>;
    IsFixStay: boolean;
    HotelPricedItineraryFixStayList: Array<{
      Id: number;
      From: string;
      To: string;
      Amount: number;
    }>;
    HotelLabels: string[];
  };
}

export async function POST(request: NextRequest) {
  try {
    const requestData: HotelDetailsRequest = await request.json();

    // Validate required fields
    const { FareSourceCode } = requestData;

    if (!FareSourceCode) {
      return NextResponse.json(
        { error: 'FareSourceCode is required' },
        { status: 400 }
      );
    }

    // Get session ID
    const sessionId = await flightSessionService.getSession();

    // Prepare the request for external API
    const externalRequest = {
      SessionId: sessionId,
      FareSourceCode: FareSourceCode,
      FixStayId: requestData.FixStayId || null,
      Nationality: requestData.Nationality || null
    };

    console.log('Sending request to hotel check rate API:', {
      url: 'https://apidemo.partocrs.com/api/Hotel/HotelCheckRate',
      data: externalRequest
    });

    // Call the external API
    const response = await fetch('https://apidemo.partocrs.com/api/Hotel/HotelCheckRate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(externalRequest)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('External API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      
      return NextResponse.json(
        { 
          error: 'External API request failed',
          details: errorText 
        },
        { status: response.status }
      );
    }

    const externalResponse: HotelDetailsResponse = await response.json();
    console.log(externalResponse)
    // Return the external API response
    return NextResponse.json({
      success: true,
      data: externalResponse,
      sessionId: sessionId
    });

  } catch (error) {
    console.error('Error in hotel details API:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}