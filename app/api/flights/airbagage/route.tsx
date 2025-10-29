// pages/api/flights/search.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { flightSessionService } from '@/lib/flight-session';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const sessionId = await flightSessionService.getSession();
    
    // Make request to third-party API with the session
    const flightResponse = await fetch('https://apidemo.partocrs.com/api/Air/AirBaggages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        
      }),
    });

    // Handle session expiration
    if (flightResponse.status === 401) {
      // Force refresh and retry
      const newSessionId = await flightSessionService.forceRefresh();
      
      const retryResponse = await fetch('https://apidemo.partocrs.com/api/Air/AirBaggages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${newSessionId}`,
        },
        body: JSON.stringify(req.body),
      });

      if (!retryResponse.ok) {
        throw new Error('Request failed after session refresh');
      }

      const data = await retryResponse.json();
      return res.status(200).json(data);
    }

    if (!flightResponse.ok) {
      throw new Error('Request failed');
    }

    const data = await flightResponse.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Flight search error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}