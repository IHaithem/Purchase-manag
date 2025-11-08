import mongoose from "mongoose";
declare global {
    var __mongooseConn: Promise<typeof mongoose> | undefined;
}
export default function connectDB(): Promise<typeof mongoose>;
//# sourceMappingURL=database.d.ts.map