// lib/flight-session-service.ts
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { prisma } from './prisma';

interface SessionData {
  sessionId: string;
  expiresAt: Date;
  isRefreshing: boolean;
}

class FlightSessionService {
  private session: SessionData | null = null;
  private refreshPromise: Promise<string> | null = null;
  // private logsDir = path.join(process.cwd(), 'partologs');

  constructor() {
    // Ensure logs directory exists
    // if (!fs.existsSync(this.logsDir)) {
    //   fs.mkdirSync(this.logsDir, { recursive: true });
    // }
  }

  // private logToFile(filename: string, message: string, data?: any) {
  //   const timestamp = new Date().toISOString();
  //   const logEntry = {
  //     timestamp,
  //     message,
  //     ...(data && { data })
  //   };

  //   const logLine = JSON.stringify(logEntry) + '\n';
    
  //   fs.appendFileSync(
  //     path.join(this.logsDir, filename),
  //     logLine,
  //     { encoding: 'utf8' }
  //   );
  // }

  // private logRequest(message: string, data?: any) {
  //   this.logToFile('request.log', message, data);
  // }

  // private logResponse(message: string, data?: any) {
  //   this.logToFile('response.log', message, data);
  // }

  async getSession(): Promise<string> {
    // If we have a valid session, return it
    if (this.session && new Date() < this.session.expiresAt) {
      return this.session.sessionId;
    }

    // If refresh is already in progress, wait for it
    if (this.refreshPromise) {
      return await this.refreshPromise;
    }

    const latestSessionId = await prisma.partoSessionId.findFirst({
      select: {
        session: true,
        expiresAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (latestSessionId && latestSessionId.session && new Date() < latestSessionId.expiresAt)
      return latestSessionId.session

    // Otherwise, get a new session
    return this.refreshSession();
  }

  private async refreshSession(): Promise<string> {
    try {
      this.refreshPromise = this.authenticateWithThirdParty();
      const sessionId = await this.refreshPromise;
      
      // Set expiration to 15 minutes as per documentation
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
      
      this.session = {
        sessionId,
        expiresAt,
        isRefreshing: false
      };

      // this.logResponse('Session created successfully', {
      //   expiresAt: expiresAt.toISOString()
      // });
      return sessionId;
    } catch (error) {
      this.session = null;
      throw error;
    } finally {
      this.refreshPromise = null;
    }
  }

  private hashPassword(password: string): string {
    // Create SHA-512 hash - ensure proper encoding
    const hash = crypto.createHash('SHA512');
    
    // Important: Use the exact same encoding the API expects
    // Try different encodings if needed
    hash.update(password, 'utf-8');
    
    return hash.digest('hex').toUpperCase();
  }

  private async authenticateWithThirdParty(): Promise<string> {
    // Validate environment variables first
    this.validateCredentials();

    const hashedPassword = this.hashPassword(process.env.FLIGHT_API_PASSWORD!);

    const requestBody = {
      OfficeId: process.env.OFFICE_ID,
      UserName: process.env.FLIGHT_API_USERNAME,
      Password: hashedPassword,
    };
    console.log(requestBody)
    // this.logRequest('Authentication Request', {
    //   OfficeId: requestBody.OfficeId,
    //   UserName: requestBody.UserName,
    //   Password: hashedPassword, // Log only first 10 chars for security
    // });

    const response = await fetch('https://apidemo.partocrs.com/api/Authenticate/CreateSession', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    // this.logResponse('Authentication Response', data);

    

    if (!response.ok) {
      // this.logResponse('HTTP Error', {
      //   status: response.status,
      //   statusText: response.statusText
      // });
      throw new Error(`Authentication failed: ${response.status} ${response.statusText}`);
    }

    if (!data.Success) {
      const errorMsg = data.Error?.Message || 'Unknown authentication error';
      // this.logResponse('API Error', {
      //   error: errorMsg
      // });
      throw new Error(`Authentication failed: ${errorMsg}`);
    }

    if (!data.SessionId) {
      // this.logResponse('No sessionId received', data);
      throw new Error('No sessionId received in authentication response');
    }

    await prisma.partoSessionId.create({
      data: {
        session: data.SessionId,
        expiresAt : new Date(Date.now() + 15 * 60 * 1000)
      }
    })

    return data.SessionId;
  }

  private validateCredentials(): void {
    const requiredEnvVars = {
      OFFICE_ID: process.env.OFFICE_ID,
      FLIGHT_API_USERNAME: process.env.FLIGHT_API_USERNAME,
      FLIGHT_API_PASSWORD: process.env.FLIGHT_API_PASSWORD,
    };

    const missing = Object.entries(requiredEnvVars)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missing.length > 0) {
      // this.logRequest('Credentials validation failed', {
        // missingVariables: missing
      // });
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    // this.logRequest('Credentials validation passed');
  }

  // Force refresh if needed (e.g., after receiving auth error)
  async forceRefresh(): Promise<string> {
    // this.logRequest('Forcing session refresh');
    this.session = null;
    return this.refreshSession();
  }

  // Utility to check session status
  getSessionStatus() {
    if (!this.session) {
      return { hasSession: false };
    }

    const now = new Date();
    const expiresIn = this.session.expiresAt.getTime() - now.getTime();
    
    return {
      hasSession: true,
      isValid: now < this.session.expiresAt,
      expiresIn: Math.max(0, expiresIn),
      expiresAt: this.session.expiresAt.toISOString()
    };
  }
}

// Singleton instance
export const flightSessionService = new FlightSessionService();