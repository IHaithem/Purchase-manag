// Augment the global Express namespace so `req.user` is available across the app.
// Using the global `Express` namespace is a reliable way to extend the Request
// interface regardless of the installed express/@types package differences.
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        isAdmin: boolean;
      };
    }
  }
}

export {};
