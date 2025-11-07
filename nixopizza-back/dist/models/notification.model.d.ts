export interface INotification {
    _id: string;
    type: "low_stock" | "budget_alert" | "expiry_warning" | "complited_task";
    title: string;
    message: string;
    isRead: boolean;
    recipientRole?: string;
    actionUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const Notification: import("mongoose").Model<INotification, {}, {}, {}, import("mongoose").Document<unknown, {}, INotification, {}> & INotification & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
export default Notification;
//# sourceMappingURL=notification.model.d.ts.map