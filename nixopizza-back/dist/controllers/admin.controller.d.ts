import { Request, Response } from "express";
export declare const getAllStaff: (req: Request, res: Response) => Promise<void>;
export declare const newStaffMember: (req: Request, res: Response) => Promise<void>;
export declare const updateStaff: (req: Request, res: Response) => Promise<void>;
export declare const getCategoryAnalytics: (req: Request, res: Response) => Promise<void>;
export declare const getMonthlySpendingAnalytics: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=admin.controller.d.ts.map