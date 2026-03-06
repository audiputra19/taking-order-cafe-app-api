import { Request, Response } from "express";
import database from "../config/db";
import { RowDataPacket } from "mysql2";
import moment from "moment-timezone";

export const TotalOrder = async (req: Request, res: Response) => {
    const { outlet_id, start_date, end_date } = req.body;

    try {
        const [current] = await database.query<RowDataPacket[]>(
            `SELECT COUNT(*) AS total_order
            FROM orders
            WHERE proses = 'done'
            AND outlet_id = ?
            AND DATE(created_at) BETWEEN ? AND ?`,
            [outlet_id, start_date, end_date]
        );

        res.json({
            current: current[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
};

export const OrderCanceled = async (req: Request, res: Response) => {
    const { outlet_id, start_date, end_date } = req.body;

    try {
        const [current] = await database.query<RowDataPacket[]>(
            `SELECT COUNT(*) AS total_order
            FROM orders
            WHERE proses = 'canceled'
            AND outlet_id = ?
            AND DATE(created_at) BETWEEN ? AND ?`,
            [outlet_id, start_date, end_date]
        );

        res.status(200).json({
            current: current[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
};

export const AverageOrder = async (req: Request, res: Response) => {
    const { outlet_id, start_date, end_date } = req.body;

    try {
        const start = moment.tz(start_date, "Asia/Jakarta").startOf("day");
        const end = moment.tz(end_date, "Asia/Jakarta").endOf("day");

        const monthDiff = end.diff(start, "months") + 1;

        const divider = monthDiff > 0 ? monthDiff : 1;

        const [current] = await database.query<RowDataPacket[]>(
            `SELECT COUNT(*) AS total_order
             FROM orders
             WHERE proses = 'done'
             AND outlet_id = ?
             AND DATE(created_at) BETWEEN ? AND ?`,
            [outlet_id, start_date, end_date]
        );

        res.status(200).json({
            current: {
                average: Math.round(current[0].total_order / divider)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
};

export const OrderTrend = async (req: Request, res: Response) => {
    const outlet_id = req.params.outlet_id;
    const start_date = req.params.start_date;
    const end_date = req.params.end_date;

    try {
        const [rows] = await database.query<RowDataPacket[]>(
            `SELECT DATE(orders.created_at) as createdAt, count(*) as qty
            FROM orders
            WHERE orders.proses = 'done'
            AND orders.outlet_id = ?
            AND DATE(orders.created_at) BETWEEN ? AND ?
            GROUP BY DATE(orders.created_at)
            ORDER BY createdAt`,
            [outlet_id, start_date, end_date]
        )

        res.status(200).json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
}

export const CategoryPerformance = async (req: Request, res: Response) => {
    const { outlet_id, start_date,end_date } = req.body;

    try {
        const [rows] = await database.query<RowDataPacket[]>(
            `SELECT products.kategori as category, MAX(categories.name) as name, SUM(order_items.qty) as qty
            FROM order_items
            INNER JOIN orders ON orders.order_id = order_items.order_id
            INNER JOIN products ON products.id = order_items.produk_id
            AND products.outlet_id = order_items.outlet_id
            INNER JOIN categories ON categories.id = products.kategori
            WHERE orders.proses = 'done'
            AND orders.outlet_id = ?
            AND DATE(orders.created_at) BETWEEN ? AND ?
            GROUP BY products.kategori
            ORDER BY SUM(order_items.qty) DESC
            LIMIT 5`,
            [outlet_id, start_date, end_date]
        )

        res.status(200).json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
}

export const BestSellingProducts = async (req: Request, res: Response) => {
    const { outlet_id, start_date, end_date } = req.body;

    try {
        const [rows] = await database.query<RowDataPacket[]>(
            `SELECT order_items.nama as name, SUM(order_items.qty) as qty
            FROM order_items
            INNER JOIN orders ON orders.order_id = order_items.order_id
            WHERE orders.proses = 'done'
            AND orders.outlet_id = ?
			AND DATE(orders.created_at) BETWEEN ? AND ?
			GROUP BY order_items.nama
            ORDER BY qty DESC
            LIMIT 5`,
            [outlet_id, start_date, end_date]
        )

        const data = rows.map(item => ({
            name: item.name,
            qty: Number(item.qty)
        }))

        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
}

export const LowestSellingProducts = async (req: Request, res: Response) => {
    const { outlet_id, start_date, end_date } = req.body;

    try {
        const [rows] = await database.query<RowDataPacket[]>(
            `SELECT order_items.nama as name, SUM(order_items.qty) as qty
            FROM order_items
            INNER JOIN orders ON orders.order_id = order_items.order_id
            WHERE orders.proses = 'done'
            AND orders.outlet_id = ?
			AND DATE(orders.created_at) BETWEEN ? AND ?
			GROUP BY order_items.nama
            ORDER BY qty
            LIMIT 5`,
            [outlet_id, start_date, end_date]
        )

        const data = rows.map(item => ({
            name: item.name,
            qty: Number(item.qty)
        }))

        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
}

export const AverageFulFillmentTime = async (req: Request, res: Response) => {
    const { outlet_id, start_date, end_date } = req.body;

    try {
        const [rows] = await database.query<RowDataPacket[]>(
            `SELECT 
                ROUND(AVG(TIMESTAMPDIFF(MINUTE, t.paid, t.acc_kasir))) AS acc_kasir,
				ROUND(AVG(TIMESTAMPDIFF(MINUTE, t.acc_kasir, t.acc_dapur))) AS acc_dapur,
				ROUND(AVG(TIMESTAMPDIFF(MINUTE, t.acc_dapur, t.ready))) AS ready,
				(ROUND(AVG(TIMESTAMPDIFF(MINUTE, t.paid, t.acc_kasir)))
				+ ROUND(AVG(TIMESTAMPDIFF(MINUTE, t.acc_kasir, t.acc_dapur)))
				+ ROUND(AVG(TIMESTAMPDIFF(MINUTE, t.acc_dapur, t.ready)))) AS total
            FROM orders o
            JOIN time_process t ON o.order_id = t.order_id
            WHERE t.ready IS NOT NULL
            AND o.outlet_id = ?
            AND DATE(o.created_at) BETWEEN ? AND ?`,
            [outlet_id, start_date, end_date]
        )

        const data = {
            acc_kasir: rows[0].acc_kasir,
            acc_dapur: rows[0].acc_dapur,
            ready: rows[0].ready,
            total: rows[0].total,
        }

        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
}

export const PeakOrderTime = async (req: Request, res: Response) => {
    const { outlet_id, start_date, end_date } = req.body;

    try {
    const [rows] = await database.query<RowDataPacket[]>(
            `SELECT 
                DATE_FORMAT(orders.created_at, '%h %p') AS category,
                COUNT(*) AS qty
            FROM orders
            WHERE proses = 'done'
            AND outlet_id = ?
            AND DATE(created_at) BETWEEN ? AND ?
            GROUP BY category
            ORDER BY qty DESC
            LIMIT 3`,
            [outlet_id, start_date, end_date]
        )

        res.status(200).json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
}

// REVENUE

export const TotalRevenue = async (req: Request, res: Response) => {
    const { outlet_id, start_date, end_date } = req.body;

    try {
        const [current] = await database.query<RowDataPacket[]>(
            `SELECT COALESCE(SUM(order_items.qty * order_items.harga), 0) as total_revenue
            FROM order_items
            INNER JOIN orders ON orders.order_id = order_items.order_id
            WHERE orders.proses = 'done'
            AND orders.outlet_id = ?
            AND DATE(orders.created_at) BETWEEN ? AND ?`,
            [outlet_id, start_date, end_date]
        );

        res.json({
            current: current[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
};

export const TotalProfit = async (req: Request, res: Response) => {
    const { outlet_id, start_date, end_date } = req.body;

    try {
        const [current] = await database.query<RowDataPacket[]>(
            `SELECT COALESCE(SUM((order_items.harga - products.hpp) * order_items.qty), 0) AS total_profit
            FROM order_items
            INNER JOIN orders ON orders.order_id = order_items.order_id
            INNER JOIN products ON products.id = order_items.produk_id
            AND products.outlet_id = order_items.outlet_id
            WHERE orders.proses = 'done'
            AND orders.outlet_id = ?
            AND DATE(orders.created_at) BETWEEN ? AND ?`,
            [outlet_id, start_date, end_date]
        );

        res.json({
            current: current[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
};

export const AverageOrderValue = async (req: Request, res: Response) => {
    const { outlet_id, start_date, end_date } = req.body;

    try {
        const [current] = await database.query<RowDataPacket[]>(
            `SELECT COALESCE(ROUND(SUM(order_items.qty * order_items.harga) 
                    / COUNT(DISTINCT orders.order_id)), 0) AS total
            FROM order_items
            INNER JOIN orders ON orders.order_id = order_items.order_id
            INNER JOIN products ON products.id = order_items.produk_id
            AND products.outlet_id = order_items.outlet_id
            WHERE orders.proses = 'done'
            AND orders.outlet_id = ?
            AND DATE(orders.created_at) BETWEEN ? AND ?`,
            [outlet_id, start_date, end_date]
        );

        res.json({
            current: current[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
};

export const RevenueByProduct = async (req: Request, res: Response) => {
    const { outlet_id, start_date, end_date } = req.body;

    try {
        const [rows] = await database.query<RowDataPacket[]>(
            `SELECT products.nama as category, COALESCE(SUM(order_items.harga * order_items.qty), 0) as qty
            FROM order_items
            INNER JOIN orders ON orders.order_id = order_items.order_id
            INNER JOIN products ON products.id = order_items.produk_id
            AND products.outlet_id = order_items.outlet_id
            WHERE orders.proses = 'done'
            AND orders.outlet_id = ?
            AND DATE(orders.created_at) BETWEEN ? AND ?
            GROUP BY products.nama
            ORDER BY qty DESC
            LIMIT 5`,
            [outlet_id, start_date, end_date]
        )

        res.status(200).json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
};

export const RevenueByCategory = async (req: Request, res: Response) => {
    const { outlet_id, start_date, end_date } = req.body;

    try {
        const [rows] = await database.query<RowDataPacket[]>(
            `SELECT products.kategori as category, MAX(categories.name) as name, COALESCE(SUM(order_items.harga * order_items.qty), 0) as qty
            FROM order_items
            INNER JOIN orders ON orders.order_id = order_items.order_id
            INNER JOIN products ON products.id = order_items.produk_id
            AND products.outlet_id = order_items.outlet_id
            INNER JOIN categories ON categories.id = products.kategori
            WHERE orders.proses = 'done'
            AND orders.outlet_id = ?
            AND DATE(orders.created_at) BETWEEN ? AND ?
            GROUP BY products.kategori
            ORDER BY qty DESC
            LIMIT 5`,
            [outlet_id, start_date, end_date]
        )

        res.status(200).json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
};

export const RevenueTrend = async (req: Request, res: Response) => {
    const outlet_id = req.params.outlet_id;
    const start_date = req.params.start_date;
    const end_date = req.params.end_date;

    try {
        const [rows] = await database.query<RowDataPacket[]>(
            `SELECT DATE(orders.created_at) as createdAt, 
                COALESCE(SUM(order_items.qty * order_items.harga), 0) as qty
            FROM orders
            INNER JOIN order_items ON order_items.order_id = orders.order_id
            WHERE orders.proses = 'done'
            AND orders.outlet_id = ?
            AND DATE(orders.created_at) BETWEEN ? AND ?
            GROUP BY DATE(orders.created_at)
            ORDER BY createdAt`,
            [outlet_id, start_date, end_date]
        )

        res.status(200).json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
}

export const TopPaymentMethod = async (req: Request, res: Response) => {
    const { outlet_id, start_date, end_date } = req.body;

    try {
        const [rows] = await database.query<RowDataPacket[]>(
            `SELECT orders.metode as name, COUNT(*) as qty
            FROM orders
            WHERE orders.proses = 'done'
            AND orders.outlet_id = ?
			AND DATE(orders.created_at) BETWEEN ? AND ?
			GROUP BY orders.metode
            ORDER BY qty DESC
            LIMIT 5`,
            [outlet_id, start_date, end_date]
        )

        const data = rows.map(item => ({
            name: item.name,
            qty: Number(item.qty)
        }))

        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
}