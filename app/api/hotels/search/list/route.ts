import { NextRequest, NextResponse } from 'next/server';
import { flightSessionService } from '@/lib/flight-session';

interface HotelSearchRequest {
  checkIn: string;
  checkOut: string;
  cityId: number;
  cityType: string;
  guests: number;
  rooms: number;
  childAges?: number[];
  nationality?: string;
  hotelId?: number | null;
  hotelIdList?: number[] | null;
  regionCode?: string | null;
  countryCode?: string | null;
}

export async function POST(request: NextRequest) {
  try {
    const requestData: HotelSearchRequest = await request.json();
    console.log(requestData)
    // Validate required fields
    const { checkIn, checkOut, cityId } = requestData;

    if (!checkIn || !checkOut || !cityId) {
      return NextResponse.json(
        { error: 'checkIn, checkOut, and cityId are required' },
        { status: 400 }
      );
    }

    // Get session ID
    const sessionId = await flightSessionService.getSession();

    // Prepare occupancies array (one occupancy per room)
    const occupancies = Array.from({ length: requestData.rooms || 1 }, (_, index) => ({
      AdultCount: index === 0 ? requestData.guests : 0, // All adults in first room, or distribute as needed
      ChildCount: requestData.childAges?.length || 0,
      ChildAges: requestData.childAges || []
    }));

    // Adjust adult distribution if needed
    if (requestData.rooms > 1) {
      // Distribute adults across rooms (simplified logic)
      const adultsPerRoom = Math.floor((requestData.guests || 2) / requestData.rooms);
      occupancies.forEach((occupancy, index) => {
        if (index === requestData.rooms - 1) {
          // Last room gets remaining adults
          occupancy.AdultCount = (requestData.guests || 2) - (adultsPerRoom * (requestData.rooms - 1));
        } else {
          occupancy.AdultCount = adultsPerRoom;
        }
      });
    }

    // console.log(checkIn)

    const externalRequest = {
      SessionId: sessionId,
      CheckIn: `${checkIn}T00:00:00.0000000+03:30`,
      CheckOut: `${checkOut}T00:00:00.0000000+03:30`,
      NationalityId: requestData.nationality || "US",
      HotelId: requestData.hotelId || null,
      HotelIdList: requestData.hotelIdList || null,
      CityId: cityId,
      RegionCode: requestData.regionCode || null,
      CountryCode: requestData.cityType =="domestic" && "IR" || null,
      Occupancies: occupancies,
      IsAccommodation: false
    };

    console.log('Sending hotel availability request:', externalRequest);

    const response = await fetch('https://apidemo.partocrs.com/api/Hotel/HotelAvailability', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(externalRequest)
    });

    if (!response.ok) {
      throw new Error(`External API responded with status: ${response.status}`);
    }

    const externalResponse = await response.json();
    // const hotelIds = externalResponse.PricedItineraries.map((hotel:any) => hotel.id)

   
    // console.log(externalResponse)

    return NextResponse.json({
      success: true,
      data: externalResponse,
      sessionId: sessionId,
      request: externalRequest
    });

  } catch (error) {
    console.error('Error in hotel search API:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export const PUT =  async ( request: NextRequest ) => {


   const sessionId = await flightSessionService.getSession()
   

   const requestData: HotelSearchRequest = await request.json();

    // Validate required fields
    const { checkIn, checkOut, cityId, hotelId } = requestData;

    if (!checkIn || !checkOut || !cityId) {
      return NextResponse.json(
        { error: 'checkIn, checkOut, and cityId are required' },
        { status: 400 }
      );
    }

    const occupancies = Array.from({ length: requestData.rooms || 1 }, (_, index) => ({
      AdultCount: index === 0 ? requestData.guests || 2 : 0, // All adults in first room, or distribute as needed
      ChildCount: requestData.childAges?.length || 0,
      ChildAges: requestData.childAges || []
    }));

    // Adjust adult distribution if needed
    if (requestData.rooms > 1) {
      // Distribute adults across rooms (simplified logic)
      const adultsPerRoom = Math.floor((requestData.guests || 2) / requestData.rooms);
      occupancies.forEach((occupancy, index) => {
        if (index === requestData.rooms - 1) {
          // Last room gets remaining adults
          occupancy.AdultCount = (requestData.guests || 2) - (adultsPerRoom * (requestData.rooms - 1));
        } else {
          occupancy.AdultCount = adultsPerRoom;
        }
      });
    }

    console.log(`before : ${requestData.hotelIdList}`)

    if (requestData.hotelIdList && requestData.hotelIdList.length > 0) {
        const hotels = []
        // console.log(`afterer: ${requestData.hotelIdList}`)
        // Make individual requests for each hotel ID
        for (const _hotelId of requestData.hotelIdList) {
          console.log(hotelId)
            const _request = {
                SessionId: sessionId,
                CheckIn: `${checkIn}`,
                CheckOut: `${checkOut}`,
                NationalityId: requestData.nationality || "US",
                HotelId: _hotelId, // Use individual hotel ID
                HotelIdList: null, // Set to null when using HotelId
                CityId: null, // Set to null when using HotelId
                RegionCode: requestData.regionCode || null,
                CountryCode: requestData.countryCode || null,
                Occupancies: occupancies,
                IsAccommodation: false
            };
            
            console.log(`Request for hotel ${hotelId}:`, _request)
            
            try {
                const hotelsWithFareSourceCode = await fetch(
                    'https://apidemo.partocrs.com/api/Hotel/HotelAvailability',
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(_request)
                    }
                )

                const data = await hotelsWithFareSourceCode.json()

                if (hotelsWithFareSourceCode.ok && data.Success) {
                    // Add all PricedItineraries from this hotel to the hotels array
                    if (data.PricedItineraries && data.PricedItineraries.length > 0) {
                        hotels.push(...data.PricedItineraries)
                    }
                } else {
                    console.error(`Error for hotel ${hotelId}:`, data)
                }
            } catch (error) {
                console.error(`Request failed for hotel ${hotelId}:`, error)
            }
        }

        console.log("All hotels combined:", hotels)
        return NextResponse.json(hotels, { status: 200 })
    } 

    if (hotelId && hotelId != 0) {
      const _request = {
              SessionId: sessionId,
              CheckIn: `${checkIn}`,
              CheckOut: `${checkOut}`,
              NationalityId: requestData.nationality || "US",
              HotelId: hotelId, // Use individual hotel ID
              HotelIdList: null, // Set to null when using HotelId
              CityId: null, // Set to null when using HotelId
              RegionCode: requestData.regionCode || null,
              CountryCode: requestData.countryCode || null,
              Occupancies: occupancies,
              IsAccommodation: false
          };
          console.log(_request)
       try {
            const hotels = []
            const hotelsWithFareSourceCode = await fetch(
                'https://apidemo.partocrs.com/api/Hotel/HotelAvailability',
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(_request)
                }
            )

            const data = await hotelsWithFareSourceCode.json()

            if (hotelsWithFareSourceCode.ok && data.Success) {
                // Add all PricedItineraries from this hotel to the hotels array
                if (data.PricedItineraries && data.PricedItineraries.length > 0) {
                    hotels.push(...data.PricedItineraries)
                }
            } else {
                console.error(`Error for hotel ${hotelId}:`, data)
            }
            
        return NextResponse.json(hotels, { status: 200 })
        } catch (error) {
            console.error(`Request failed for hotel ${hotelId}:`, error)
        }
        
    }

    // return NextResponse.json(hotels, {status:200})

  } 

   
    

    // return NextResponse.json({
    //   success: false,
    //   data: null,
    //   sessionId: sessionId,
    //   request: null
    // })
