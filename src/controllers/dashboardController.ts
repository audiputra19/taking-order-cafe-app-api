import { Request, Response } from "express";
import database from "../config/db";
import { RowDataPacket } from "mysql2";
import moment from "moment-timezone";

export const TotalOrder = async (req: Request, res: Response) => {
    const { periode } = req.body;

    try {
        const createdAt = moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");

        let currentfilter = "";
        let previousfilter = "";
        let paramsCurrent: any[] = [];
        let paramsPrevious: any[] = [];

        if (periode === 1) {
            // Bulan ini
            currentfilter = `
                AND orders.created_at >= DATE_FORMAT(?, '%Y-%m-01')
                AND orders.created_at < DATE_FORMAT(DATE_ADD(?, INTERVAL 1 MONTH), '%Y-%m-01')
            `;
            paramsCurrent = [createdAt, createdAt];

            // Bulan lalu
            previousfilter = `
                AND orders.created_at >= DATE_SUB(DATE_FORMAT(?, '%Y-%m-01'), INTERVAL 1 MONTH)
                AND orders.created_at < DATE_FORMAT(?, '%Y-%m-01')
            `;
            paramsPrevious = [createdAt, createdAt];
        } else if (periode === 2) {
            // 3 bulan terakhir
            currentfilter = `
                AND orders.created_at >= DATE_SUB(DATE_FORMAT(?, '%Y-%m-01'), INTERVAL 2 MONTH)
                AND orders.created_at < DATE_ADD(DATE_FORMAT(?, '%Y-%m-01'), INTERVAL 1 MONTH)
            `;
            paramsCurrent = [createdAt, createdAt];

            // 3 bulan sebelum
            previousfilter = `
                AND orders.created_at >= DATE_SUB(DATE_FORMAT(?, '%Y-%m-01'), INTERVAL 5 MONTH)
                AND orders.created_at < DATE_SUB(DATE_FORMAT(?, '%Y-%m-01'), INTERVAL 2 MONTH)
            `;
            paramsPrevious = [createdAt, createdAt];
        } else {
            // Tahun ini
            currentfilter = `
                AND YEAR(created_at) = YEAR(?)
            `;
            paramsCurrent = [createdAt];

            // Tahun lalu
            previousfilter = `
                AND YEAR(created_at) = YEAR(?) - 1
            `;
            paramsPrevious = [createdAt];
        }

        const [current] = await database.query<RowDataPacket[]>(
            `SELECT COUNT(*) AS total_order
            FROM orders
            WHERE proses = 'done'
            ${currentfilter}`,
            paramsCurrent
        );

        // Tahun lalu
        const [previous] = await database.query<RowDataPacket[]>(
            `SELECT COUNT(*) AS total_order
            FROM orders
            WHERE proses = 'done'
            ${previousfilter}`,
            paramsPrevious
        );

        res.json({
            current: current[0],
            previous: previous[0],
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
};

export const OrderCanceled = async (req: Request, res: Response) => {
    const { periode } = req.body;

    try {
        const createdAt = moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");

        let currentfilter = "";
        let previousfilter = "";
        let paramsCurrent: any[] = [];
        let paramsPrevious: any[] = [];

        if (periode === 1) {
            // Bulan ini
            currentfilter = `
                AND orders.created_at >= DATE_FORMAT(?, '%Y-%m-01')
                AND orders.created_at < DATE_FORMAT(DATE_ADD(?, INTERVAL 1 MONTH), '%Y-%m-01')
            `;
            paramsCurrent = [createdAt, createdAt];

            // Bulan lalu
            previousfilter = `
                AND orders.created_at >= DATE_SUB(DATE_FORMAT(?, '%Y-%m-01'), INTERVAL 1 MONTH)
                AND orders.created_at < DATE_FORMAT(?, '%Y-%m-01')
            `;
            paramsPrevious = [createdAt, createdAt];
        } else if (periode === 2) {
            // 3 bulan terakhir
            currentfilter = `
                AND orders.created_at >= DATE_SUB(DATE_FORMAT(?, '%Y-%m-01'), INTERVAL 2 MONTH)
                AND orders.created_at < DATE_ADD(DATE_FORMAT(?, '%Y-%m-01'), INTERVAL 1 MONTH)
            `;
            paramsCurrent = [createdAt, createdAt];

            // 3 bulan sebelum
            previousfilter = `
                AND orders.created_at >= DATE_SUB(DATE_FORMAT(?, '%Y-%m-01'), INTERVAL 5 MONTH)
                AND orders.created_at < DATE_SUB(DATE_FORMAT(?, '%Y-%m-01'), INTERVAL 2 MONTH)
            `;
            paramsPrevious = [createdAt, createdAt];
        } else {
            // Tahun ini
            currentfilter = `
                AND YEAR(created_at) = YEAR(?)
            `;
            paramsCurrent = [createdAt];

            // Tahun lalu
            previousfilter = `
                AND YEAR(created_at) = YEAR(?) - 1
            `;
            paramsPrevious = [createdAt];
        }

        const [current] = await database.query<RowDataPacket[]>(
            `SELECT COUNT(*) AS total_order
            FROM orders
            WHERE proses = 'canceled'
            ${currentfilter}`,
            paramsCurrent
        );

        // Tahun lalu
        const [previous] = await database.query<RowDataPacket[]>(
            `SELECT COUNT(*) AS total_order
            FROM orders
            WHERE proses = 'canceled'
            ${previousfilter}`,
            paramsPrevious
        );

        res.status(200).json({
            current: current[0],
            previous: previous[0],
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
};

export const AverageOrder = async (req: Request, res: Response) => {
    const { periode } = req.body;

    try {
        const createdAt = moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");

        let currentfilter = "";
        let previousfilter = "";
        let divider = 1;
        let unit = "day";
        let paramsCurrent: any[] = [];
        let paramsPrevious: any[] = [];

        if (periode === 1) {
            currentfilter = `
                AND orders.created_at >= DATE_FORMAT(?, '%Y-%m-01')
                AND orders.created_at < DATE_FORMAT(DATE_ADD(?, INTERVAL 1 MONTH), '%Y-%m-01')
            `;
            paramsCurrent = [createdAt, createdAt];

            previousfilter = `
                AND orders.created_at >= DATE_SUB(DATE_FORMAT(?, '%Y-%m-01'), INTERVAL 1 MONTH)
                AND orders.created_at < DATE_FORMAT(?, '%Y-%m-01')
            `;
            paramsPrevious = [createdAt, createdAt];
            divider = 30;
            unit = "day";

        } else if (periode === 2) {
            // 3 bulan terakhir
            currentfilter = `
                AND orders.created_at >= DATE_SUB(DATE_FORMAT(?, '%Y-%m-01'), INTERVAL 2 MONTH)
                AND orders.created_at < DATE_ADD(DATE_FORMAT(?, '%Y-%m-01'), INTERVAL 1 MONTH)
            `;
            paramsCurrent = [createdAt, createdAt];

            // 3 bulan sebelum
            previousfilter = `
                AND orders.created_at >= DATE_SUB(DATE_FORMAT(?, '%Y-%m-01'), INTERVAL 5 MONTH)
                AND orders.created_at < DATE_SUB(DATE_FORMAT(?, '%Y-%m-01'), INTERVAL 2 MONTH)
            `;
            paramsPrevious = [createdAt, createdAt];
            divider = 3;
            unit = "month";

        } else {
            currentfilter = `
                AND YEAR(created_at) = YEAR(?)
            `;
            paramsCurrent = [createdAt];

            previousfilter = `
                AND YEAR(created_at) = YEAR(?) - 1
            `;
            paramsPrevious = [createdAt];
            divider = 12;
            unit = "month";
        }

        const [current] = await database.query<RowDataPacket[]>(
            `SELECT COUNT(*) AS total_order
             FROM orders
             WHERE proses = 'done'
             ${currentfilter}`,
             paramsCurrent
        );

        const [previous] = await database.query<RowDataPacket[]>(
            `SELECT COUNT(*) AS total_order
             FROM orders
             WHERE proses = 'done'
             ${previousfilter}`,
             paramsPrevious
        );

        res.status(200).json({
            current: {
                average: Math.round(current[0].total_order / divider),
                unit,
            },
            previous: {
                average: Math.round(previous[0].total_order / divider),
                unit,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
};

export const OrderTrend = async (req: Request, res: Response) => {

    try {
        const createdAt = moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");
        const [rows] = await database.query<RowDataPacket[]>(
            `SELECT orders.order_id as id, DATE(orders.created_at) as createdAt, count(*) as qty
            FROM orders
            WHERE proses = 'done'
            AND YEAR(orders.created_at) = YEAR(?)
            GROUP BY DATE(orders.created_at)
            ORDER BY orders.created_at`,
            [createdAt]
        )

        res.status(200).json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
}

export const CategoryPerformance = async (req: Request, res: Response) => {
    const { periode } = req.body;

    try {
        const createdAt = moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");
        let paramsCurrent: any[] = [];

        let currentfilter = "";
        if (periode === 1) {
            currentfilter = `
                AND orders.created_at >= DATE_FORMAT(?, '%Y-%m-01')
                AND orders.created_at < DATE_FORMAT(DATE_ADD(?, INTERVAL 1 MONTH), '%Y-%m-01')
            `;
            paramsCurrent = [createdAt, createdAt];
        } else if (periode === 2) {
            currentfilter = `
                AND orders.created_at >= DATE_SUB(?, INTERVAL 3 MONTH)
            `;
            paramsCurrent = [createdAt]
        } else {
            currentfilter = `
                AND YEAR(orders.created_at) = YEAR(?)
            `;
            paramsCurrent = [createdAt]
        }

        const [rows] = await database.query<RowDataPacket[]>(
            `SELECT products.kategori as category, SUM(order_items.qty) as qty
            FROM order_items
            INNER JOIN orders ON orders.order_id = order_items.order_id
            INNER JOIN products ON products.id = order_items.produk_id
            WHERE proses = 'done'
            ${currentfilter}
            GROUP BY products.kategori
            ORDER BY SUM(order_items.qty) DESC
            LIMIT 5`,
            paramsCurrent
        )

        res.status(200).json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
}

export const BestSellingProducts = async (req: Request, res: Response) => {
    const { periode } = req.body;

    try {
        const createdAt = moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");
        let paramsCurrent: any[] = [];

        let currentfilter = "";
        if (periode === 1) {
            currentfilter = `
                AND orders.created_at >= DATE_FORMAT(?, '%Y-%m-01')
                AND orders.created_at < DATE_FORMAT(DATE_ADD(?, INTERVAL 1 MONTH), '%Y-%m-01')
            `;
            paramsCurrent = [createdAt, createdAt];
        } else if (periode === 2) {
            currentfilter = `
                AND orders.created_at >= DATE_SUB(?, INTERVAL 3 MONTH)
            `;
            paramsCurrent = [createdAt];
        } else {
            currentfilter = `
                AND YEAR(orders.created_at) = YEAR(?)
            `;
            paramsCurrent = [createdAt];
        }

        const [rows] = await database.query<RowDataPacket[]>(
            `SELECT order_items.nama as name, SUM(order_items.qty) as qty
            FROM order_items
            INNER JOIN orders ON orders.order_id = order_items.order_id
            WHERE proses = 'done'
			${currentfilter}
			GROUP BY order_items.nama
            ORDER BY SUM(order_items.qty) DESC, orders.created_at
            LIMIT 5`,
            paramsCurrent
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
    const { periode } = req.body;

    try {
        const createdAt = moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");
        let paramsCurrent: any[] = [];

        let currentfilter = "";
        if (periode === 1) {
            currentfilter = `
                AND orders.created_at >= DATE_FORMAT(?, '%Y-%m-01')
                AND orders.created_at < DATE_FORMAT(DATE_ADD(?, INTERVAL 1 MONTH), '%Y-%m-01')
            `;
            paramsCurrent = [createdAt, createdAt];
        } else if (periode === 2) {
            currentfilter = `
                AND orders.created_at >= DATE_SUB(?, INTERVAL 3 MONTH)
            `;
            paramsCurrent = [createdAt];
        } else {
            currentfilter = `
                AND YEAR(orders.created_at) = YEAR(?)
            `;
            paramsCurrent = [createdAt];
        }

        const [rows] = await database.query<RowDataPacket[]>(
            `SELECT order_items.nama as name, SUM(order_items.qty) as qty
            FROM order_items
            INNER JOIN orders ON orders.order_id = order_items.order_id
            WHERE proses = 'done'
			${currentfilter}
			GROUP BY order_items.nama
            ORDER BY SUM(order_items.qty), orders.created_at
            LIMIT 5`,
            paramsCurrent
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
    const { periode } = req.body;

    try {
        const createdAt = moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");
        let paramsCurrent: any[] = [];

        let currentfilter = "";
        if (periode === 1) {
            currentfilter = `
                AND o.created_at >= DATE_FORMAT(?, '%Y-%m-01')
                AND o.created_at < DATE_FORMAT(DATE_ADD(?, INTERVAL 1 MONTH), '%Y-%m-01')
            `;
            paramsCurrent = [createdAt, createdAt];
        } else if (periode === 2) {
            currentfilter = `
                AND o.created_at >= DATE_SUB(?, INTERVAL 3 MONTH)
            `;
            paramsCurrent = [createdAt];
        } else {
            currentfilter = `
                AND YEAR(o.created_at) = YEAR(?)
            `;
            paramsCurrent = [createdAt];
        }

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
            ${currentfilter}`,
            paramsCurrent
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
    const { periode } = req.body;

    try {
        const createdAt = moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");
        let paramsCurrent: any[] = [];

        let currentfilter = "";
        if (periode === 1) {
            currentfilter = `
                AND orders.created_at >= DATE_FORMAT(?, '%Y-%m-01')
                AND orders.created_at < DATE_FORMAT(DATE_ADD(?, INTERVAL 1 MONTH), '%Y-%m-01')
            `;
            paramsCurrent = [createdAt, createdAt];
        } else if (periode === 2) {
            currentfilter = `
                AND orders.created_at >= DATE_SUB(?, INTERVAL 3 MONTH)
            `;
            paramsCurrent = [createdAt];
        } else {
            currentfilter = `
                AND YEAR(orders.created_at) = YEAR(?)
            `;
            paramsCurrent = [createdAt];
        }

        const [rows] = await database.query<RowDataPacket[]>(
            `SELECT 
                DATE_FORMAT(orders.created_at, '%h %p') AS category,
                COUNT(*) AS qty
            FROM orders
            WHERE proses = 'done'
            ${currentfilter}
            GROUP BY category
            ORDER BY qty DESC
            LIMIT 3`,
            paramsCurrent
        )

        res.status(200).json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
}

// REVENUE

export const TotalRevenue = async (req: Request, res: Response) => {
    const { periode } = req.body;

    try {
        const createdAt = moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");

        let currentfilter = "";
        let previousfilter = "";
        let paramsCurrent: any[] = [];
        let paramsPrevious: any[] = [];

        if (periode === 1) {
            // Bulan ini
            currentfilter = `
                AND orders.created_at >= DATE_FORMAT(?, '%Y-%m-01')
                AND orders.created_at < DATE_FORMAT(DATE_ADD(?, INTERVAL 1 MONTH), '%Y-%m-01')
            `;
            paramsCurrent = [createdAt, createdAt]

            // Bulan lalu
            previousfilter = `
                AND orders.created_at >= DATE_SUB(DATE_FORMAT(?, '%Y-%m-01'), INTERVAL 1 MONTH)
                AND orders.created_at < DATE_FORMAT(?, '%Y-%m-01')
            `;
            paramsPrevious = [createdAt, createdAt]
        } else if (periode === 2) {
            // 3 bulan terakhir
            currentfilter = `
                AND orders.created_at >= DATE_SUB(DATE_FORMAT(?, '%Y-%m-01'), INTERVAL 2 MONTH)
                AND orders.created_at < DATE_ADD(DATE_FORMAT(?, '%Y-%m-01'), INTERVAL 1 MONTH)
            `;
            paramsCurrent = [createdAt, createdAt];

            // 3 bulan sebelum
            previousfilter = `
                AND orders.created_at >= DATE_SUB(DATE_FORMAT(?, '%Y-%m-01'), INTERVAL 5 MONTH)
                AND orders.created_at < DATE_SUB(DATE_FORMAT(?, '%Y-%m-01'), INTERVAL 2 MONTH)
            `;
            paramsPrevious = [createdAt, createdAt];
        } else {
            // Tahun ini
            currentfilter = `
                AND YEAR(orders.created_at) = YEAR(?)
            `;
            paramsCurrent = [createdAt]

            // Tahun lalu
            previousfilter = `
                AND YEAR(orders.created_at) = YEAR(?) - 1
            `;
            paramsPrevious = [createdAt]
        }

        const [current] = await database.query<RowDataPacket[]>(
            `SELECT SUM(order_items.qty * order_items.harga) as total_revenue
            FROM order_items
            INNER JOIN orders ON orders.order_id = order_items.order_id
            WHERE orders.proses = 'done'
            ${currentfilter}`,
            paramsCurrent
        );

        // Tahun lalu
        const [previous] = await database.query<RowDataPacket[]>(
            `SELECT SUM(order_items.qty * order_items.harga) as total_revenue
            FROM order_items
            INNER JOIN orders ON orders.order_id = order_items.order_id
            WHERE orders.proses = 'done'
            ${previousfilter}`,
            paramsPrevious
        );

        res.json({
            current: current[0],
            previous: previous[0],
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
};

export const TotalProfit = async (req: Request, res: Response) => {
    const { periode } = req.body;

    try {
        const createdAt = moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");

        let currentfilter = "";
        let previousfilter = "";
        let paramsCurrent: any[] = [];
        let paramsPrevious: any[] = [];

        if (periode === 1) {
            // Bulan ini
            currentfilter = `
                AND orders.created_at >= DATE_FORMAT(?, '%Y-%m-01')
                AND orders.created_at < DATE_FORMAT(DATE_ADD(?, INTERVAL 1 MONTH), '%Y-%m-01')
            `;
            paramsCurrent = [createdAt, createdAt];

            // Bulan lalu
            previousfilter = `
                AND orders.created_at >= DATE_SUB(DATE_FORMAT(?, '%Y-%m-01'), INTERVAL 1 MONTH)
                AND orders.created_at < DATE_FORMAT(?, '%Y-%m-01')
            `;
            paramsPrevious = [createdAt, createdAt];
        } else if (periode === 2) {
            // 3 bulan terakhir
            currentfilter = `
                AND orders.created_at >= DATE_SUB(DATE_FORMAT(?, '%Y-%m-01'), INTERVAL 2 MONTH)
                AND orders.created_at < DATE_ADD(DATE_FORMAT(?, '%Y-%m-01'), INTERVAL 1 MONTH)
            `;
            paramsCurrent = [createdAt, createdAt];

            // 3 bulan sebelum
            previousfilter = `
                AND orders.created_at >= DATE_SUB(DATE_FORMAT(?, '%Y-%m-01'), INTERVAL 5 MONTH)
                AND orders.created_at < DATE_SUB(DATE_FORMAT(?, '%Y-%m-01'), INTERVAL 2 MONTH)
            `;
            paramsPrevious = [createdAt, createdAt];
        } else {
            // Tahun ini
            currentfilter = `
                AND YEAR(orders.created_at) = YEAR(?)
            `;
            paramsCurrent = [createdAt];

            // Tahun lalu
            previousfilter = `
                AND YEAR(orders.created_at) = YEAR(?) - 1
            `;
            paramsPrevious = [createdAt];
        }

        const [current] = await database.query<RowDataPacket[]>(
            `SELECT SUM((order_items.harga - products.hpp) * order_items.qty) AS total_profit
            FROM order_items
            INNER JOIN orders ON orders.order_id = order_items.order_id
            INNER JOIN products ON products.id = order_items.produk_id
            WHERE orders.proses = 'done'
            ${currentfilter}`,
            paramsCurrent
        );

        // Tahun lalu
        const [previous] = await database.query<RowDataPacket[]>(
            `SELECT SUM((order_items.harga - products.hpp) * order_items.qty) AS total_profit
            FROM order_items
            INNER JOIN orders ON orders.order_id = order_items.order_id
            INNER JOIN products ON products.id = order_items.produk_id
            WHERE orders.proses = 'done'
            ${previousfilter}`,
            paramsPrevious
        );

        res.json({
            current: current[0],
            previous: previous[0],
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
};

export const AverageOrderValue = async (req: Request, res: Response) => {
    const { periode } = req.body;

    try {
        const createdAt = moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");

        let currentfilter = "";
        let previousfilter = "";
        let paramsCurrent: any[] = [];
        let paramsPrevious: any[] = [];

        if (periode === 1) {
            // Bulan ini
            currentfilter = `
                AND orders.created_at >= DATE_FORMAT(?, '%Y-%m-01')
                AND orders.created_at < DATE_FORMAT(DATE_ADD(?, INTERVAL 1 MONTH), '%Y-%m-01')
            `;
            paramsCurrent = [createdAt, createdAt];

            // Bulan lalu
            previousfilter = `
                AND orders.created_at >= DATE_SUB(DATE_FORMAT(?, '%Y-%m-01'), INTERVAL 1 MONTH)
                AND orders.created_at < DATE_FORMAT(?, '%Y-%m-01')
            `;
            paramsPrevious = [createdAt, createdAt];
        } else if (periode === 2) {
            // 3 bulan terakhir
            currentfilter = `
                AND orders.created_at >= DATE_SUB(DATE_FORMAT(?, '%Y-%m-01'), INTERVAL 2 MONTH)
                AND orders.created_at < DATE_ADD(DATE_FORMAT(?, '%Y-%m-01'), INTERVAL 1 MONTH)
            `;
            paramsCurrent = [createdAt, createdAt];

            // 3 bulan sebelum
            previousfilter = `
                AND orders.created_at >= DATE_SUB(DATE_FORMAT(?, '%Y-%m-01'), INTERVAL 5 MONTH)
                AND orders.created_at < DATE_SUB(DATE_FORMAT(?, '%Y-%m-01'), INTERVAL 2 MONTH)
            `;
            paramsPrevious = [createdAt, createdAt];
        } else {
            // Tahun ini
            currentfilter = `
                AND YEAR(orders.created_at) = YEAR(?)
            `;
            paramsCurrent = [createdAt];

            // Tahun lalu
            previousfilter = `
                AND YEAR(orders.created_at) = YEAR(?) - 1
            `;
            paramsPrevious = [createdAt];
        }

        const [current] = await database.query<RowDataPacket[]>(
            `SELECT ROUND(SUM(order_items.qty * order_items.harga) 
                    / COUNT(DISTINCT orders.order_id)) AS total
            FROM order_items
            INNER JOIN orders ON orders.order_id = order_items.order_id
            INNER JOIN products ON products.id = order_items.produk_id
            WHERE orders.proses = 'done'
            ${currentfilter}`,
            paramsCurrent
        );

        // Tahun lalu
        const [previous] = await database.query<RowDataPacket[]>(
            `SELECT ROUND(SUM(order_items.qty * order_items.harga) 
                    / COUNT(DISTINCT orders.order_id)) AS total
            FROM order_items
            INNER JOIN orders ON orders.order_id = order_items.order_id
            INNER JOIN products ON products.id = order_items.produk_id
            WHERE orders.proses = 'done'
            ${previousfilter}`,
            paramsPrevious
        );

        res.json({
            current: current[0],
            previous: previous[0],
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
};

export const RevenueByProduct = async (req: Request, res: Response) => {
    const { periode } = req.body;

    try {
        const createdAt = moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");
        let paramsCurrent: any[] = [];

        let currentfilter = "";
        if (periode === 1) {
            currentfilter = `
                AND orders.created_at >= DATE_SUB(?, INTERVAL 1 MONTH)
            `;
            paramsCurrent = [createdAt];
        } else if (periode === 2) {
            currentfilter = `
                AND orders.created_at >= DATE_SUB(?, INTERVAL 3 MONTH)
            `;
            paramsCurrent = [createdAt];
        } else {
            currentfilter = `
                AND YEAR(orders.created_at) = YEAR(?)
            `;
            paramsCurrent = [createdAt];
        }

        const [rows] = await database.query<RowDataPacket[]>(
            `SELECT products.nama as category, SUM(order_items.harga * order_items.qty) as qty
            FROM order_items
            INNER JOIN orders ON orders.order_id = order_items.order_id
            INNER JOIN products ON products.id = order_items.produk_id
            WHERE proses = 'done'
            ${currentfilter}
            GROUP BY products.nama
            ORDER BY SUM(order_items.harga * order_items.qty) DESC
            LIMIT 5`,
            paramsCurrent
        )

        res.status(200).json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
};

export const RevenueByCategory = async (req: Request, res: Response) => {
    const { periode } = req.body;

    try {
        const createdAt = moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");
        let paramsCurrent: any[] = [];

        let currentfilter = "";
        if (periode === 1) {
            currentfilter = `
                AND orders.created_at >= DATE_SUB(?, INTERVAL 1 MONTH)
            `;
            paramsCurrent = [createdAt];
        } else if (periode === 2) {
            currentfilter = `
                AND orders.created_at >= DATE_SUB(?, INTERVAL 3 MONTH)
            `;
            paramsCurrent = [createdAt];
        } else {
            currentfilter = `
                AND YEAR(orders.created_at) = YEAR(?)
            `;
            paramsCurrent = [createdAt];
        }

        const [rows] = await database.query<RowDataPacket[]>(
            `SELECT products.kategori as category, SUM(order_items.harga * order_items.qty) as qty
            FROM order_items
            INNER JOIN orders ON orders.order_id = order_items.order_id
            INNER JOIN products ON products.id = order_items.produk_id
            WHERE proses = 'done'
            ${currentfilter}
            GROUP BY products.kategori
            ORDER BY SUM(order_items.harga * order_items.qty) DESC
            LIMIT 5`,
            paramsCurrent
        )

        res.status(200).json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
};

export const RevenueTrend = async (req: Request, res: Response) => {

    try {
        const createdAt = moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");

        const [rows] = await database.query<RowDataPacket[]>(
            `SELECT orders.order_id as id, DATE(orders.created_at) as createdAt, SUM(order_items.qty * order_items.harga) as qty
            FROM orders
            INNER JOIN order_items ON order_items.order_id = orders.order_id
            WHERE proses = 'done'
            AND YEAR(orders.created_at) = YEAR(?)
            GROUP BY DATE(orders.created_at)
            ORDER BY orders.created_at`,
            [createdAt]
        )

        res.status(200).json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
}

export const TopPaymentMethod = async (req: Request, res: Response) => {
    const { periode } = req.body;

    try {
        const createdAt = moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");
        let paramsCurrent: any[] = [];

        let currentfilter = "";
        if (periode === 1) {
            currentfilter = `
                AND orders.created_at >= DATE_FORMAT(?, '%Y-%m-01')
                AND orders.created_at < DATE_FORMAT(DATE_ADD(?, INTERVAL 1 MONTH), '%Y-%m-01')
            `;
            paramsCurrent = [createdAt, createdAt];
        } else if (periode === 2) {
            currentfilter = `
                AND orders.created_at >= DATE_SUB(?, INTERVAL 3 MONTH)
            `;
            paramsCurrent = [createdAt];
        } else {
            currentfilter = `
                AND YEAR(orders.created_at) = YEAR(?)
            `;
            paramsCurrent = [createdAt];
        }

        const [rows] = await database.query<RowDataPacket[]>(
            `SELECT orders.metode as name, COUNT(*) as qty
            FROM orders
            WHERE orders.proses = 'done'
			${currentfilter}
			GROUP BY orders.metode
            ORDER BY COUNT(*) DESC, orders.created_at
            LIMIT 5`,
            paramsCurrent
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