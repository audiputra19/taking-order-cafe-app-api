import { Router } from "express";
import { AverageFulFillmentTime, AverageOrder, AverageOrderValue, BestSellingProducts, CategoryPerformance, LowestSellingProducts, OrderCanceled, OrderTrend, PeakOrderTime, RevenueByCategory, RevenueByProduct, RevenueTrend, TopPaymentMethod, TotalOrder, TotalProfit, TotalRevenue } from "../controllers/dashboardController";

const dashboardRouter = Router();

dashboardRouter.post("/total-order", TotalOrder);
dashboardRouter.post("/order-canceled", OrderCanceled);
dashboardRouter.post("/average-order", AverageOrder);
dashboardRouter.get("/order-trend", OrderTrend);
dashboardRouter.post("/category-performance", CategoryPerformance);
dashboardRouter.post("/best-selling-products", BestSellingProducts);
dashboardRouter.post("/lowest-selling-products", LowestSellingProducts);
dashboardRouter.post("/average-fulfillment-time", AverageFulFillmentTime);
dashboardRouter.post("/peak-order-time", PeakOrderTime);
// REVENUE
dashboardRouter.post("/total-revenue", TotalRevenue);
dashboardRouter.post("/total-profit", TotalProfit);
dashboardRouter.post("/average-order-value", AverageOrderValue);
dashboardRouter.post("/revenue-product", RevenueByProduct);
dashboardRouter.post("/revenue-category", RevenueByCategory);
dashboardRouter.get("/revenue-trend", RevenueTrend);
dashboardRouter.post("/top-payment-method", TopPaymentMethod);

export default dashboardRouter;