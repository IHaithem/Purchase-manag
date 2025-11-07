export declare const startExpirationCron: (timezone?: string) => void;
/**
 * Stop the expiration cron job
 */
export declare const stopExpirationCron: () => void;
/**
 * Run an immediate expiration check (for testing or initial run)
 */
export declare const runImmediateCheck: () => Promise<void>;
export declare const getCronStatus: () => {
    isRunning: boolean;
};
export declare const initializeExpirationMonitoring: (timezone?: string) => void;
//# sourceMappingURL=expirationMonitoring.controller.d.ts.map