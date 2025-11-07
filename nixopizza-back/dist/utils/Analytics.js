"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCumulativeMonthlyData = exports.generateMonthlyData = void 0;
const generateMonthlyData = async (model, monthsBack = 6, cache = {}, extraFilter = {}) => {
    const results = {
        months: [],
        counts: [],
    };
    const cacheKey = `${monthsBack}-${JSON.stringify(extraFilter)}`;
    if (cache[cacheKey])
        return cache[cacheKey];
    try {
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - (monthsBack - 1), 1);
        const monthlyCounts = await model.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate },
                    ...extraFilter, // Add additional filtering like { status: "delivered" }
                },
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                    },
                    count: { $sum: 1 },
                },
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } },
        ]);
        const currentDate = new Date();
        for (let i = monthsBack - 1; i >= 0; i--) {
            const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            const monthYear = monthDate.toLocaleString("default", {
                month: "short",
                year: "numeric",
            });
            const match = monthlyCounts.find((data) => data._id.year === monthDate.getFullYear() &&
                data._id.month === monthDate.getMonth() + 1);
            results.months.push(monthYear);
            results.counts.push(match ? match.count : 0);
        }
        cache[cacheKey] = results;
        return results;
    }
    catch (error) {
        console.error("Error generating monthly data:", error);
        throw new Error("Failed to generate monthly data.");
    }
};
exports.generateMonthlyData = generateMonthlyData;
const generateCumulativeMonthlyData = async (model, monthsBack = 6, cache = {}, extraFilter = {}) => {
    const results = {
        months: [],
        counts: [],
    };
    const cacheKey = `cumulative-${monthsBack}-${JSON.stringify(extraFilter)}`;
    if (cache[cacheKey])
        return cache[cacheKey];
    try {
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - (monthsBack - 1), 1);
        const monthlyCounts = await model.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate },
                    ...extraFilter,
                },
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                    },
                    count: { $sum: 1 },
                },
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } },
        ]);
        const currentDate = new Date();
        let cumulativeCount = 0;
        for (let i = monthsBack - 1; i >= 0; i--) {
            const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            const monthYear = monthDate.toLocaleString("default", {
                month: "short",
                year: "numeric",
            });
            const match = monthlyCounts.find((data) => data._id.year === monthDate.getFullYear() &&
                data._id.month === monthDate.getMonth() + 1);
            cumulativeCount += match ? match.count : 0;
            results.months.push(monthYear);
            results.counts.push(cumulativeCount);
        }
        cache[cacheKey] = results;
        return results;
    }
    catch (error) {
        console.error("Error generating cumulative monthly data:", error);
        throw new Error("Failed to generate cumulative monthly data.");
    }
};
exports.generateCumulativeMonthlyData = generateCumulativeMonthlyData;
//# sourceMappingURL=Analytics.js.map