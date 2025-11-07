import ProductOrder, { IProductOrder } from "../models/productOrder.model";
import { Request, Response } from "express";
export declare const handleExpiredProduct: (product: IProductOrder) => Promise<void>;
export declare const processExpiredProducts: () => Promise<void>;
export declare const getProductsExpiringSoon: (req: Request, res: Response) => Promise<void>;
export default ProductOrder;
//# sourceMappingURL=productOrder.controller.d.ts.map