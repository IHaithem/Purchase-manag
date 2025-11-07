import { Schema, Document } from "mongoose";
export interface ITask extends Document {
    taskNumber: string;
    staffId: Schema.Types.ObjectId;
    items: {
        productId: Schema.Types.ObjectId;
        quantity: number;
    }[];
    status: "pending" | "completed" | "canceled";
    deadline: Date;
    createdAt: Date;
    updatedAt: Date;
}
declare const Task: import("mongoose").Model<ITask, {}, {}, {}, Document<unknown, {}, ITask, {}> & ITask & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default Task;
//# sourceMappingURL=task.model.d.ts.map