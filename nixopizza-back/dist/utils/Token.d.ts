import { JwtPayload } from "jsonwebtoken";
import { Response } from "express";
export declare const generateTokens: (userId: string, isAdmin: boolean, res: Response) => string;
export declare const verifyToken: (token: string, secret: string) => string | JwtPayload;
//# sourceMappingURL=Token.d.ts.map