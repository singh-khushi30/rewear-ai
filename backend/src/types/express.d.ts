declare global {
  namespace Express {
    interface Request {
      requestId: string;
      accessToken?: string;
      user?: {
        id: string;
      };
    }
  }
}

export {};
