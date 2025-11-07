import { Model, Document } from "mongoose";
interface MonthlyData {
    months: string[];
    counts: number[];
}
interface ExtraFilter {
    [key: string]: any;
}
export declare const generateMonthlyData: <T extends Document>(model: Model<T>, monthsBack?: number, cache?: Record<string, MonthlyData>, extraFilter?: ExtraFilter) => Promise<MonthlyData>;
export declare const generateCumulativeMonthlyData: <T extends Document>(model: Model<T>, monthsBack?: number, cache?: Record<string, MonthlyData>, extraFilter?: ExtraFilter) => Promise<MonthlyData>;
export {};
//# sourceMappingURL=Analytics.d.ts.map