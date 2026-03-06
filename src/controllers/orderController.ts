import { Request, Response } from "express";
import database from "../config/db";
import { getIO } from "../socket";
import { RowDataPacket } from "mysql2";
import moment from "moment-timezone";

export const getOrder = async (req: Request, res: Response) => {
    const { outlet_id } = req.body;

    try {
        const [rows] = await database.query<RowDataPacket[]>(
            `SELECT *
            FROM orders
            WHERE outlet_id = ?
            AND (
            (proses <> 'done' AND status = 'paid')
            OR (status = 'unpaid' AND metode = 'cash')
            )
            ORDER BY created_at DESC`,
            [outlet_id]
        );

        res.status(200).json(rows);
    } catch (error: any) {
        res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
}

export const getOrderById = async (req: Request, res: Response) => {
    const { id, outlet_id } = req.body;
    
    try {
        const [rows] = await database.query<RowDataPacket[]>(
            `SELECT order_items.order_id, order_items.nama, order_items.harga, order_items.qty, 
                orders.created_at, orders.voucher, orders.diskon, orders.status, order_items.catatan, 
                order_items.tipe
            FROM order_items 
            INNER JOIN orders ON orders.order_id = order_items.order_id
            WHERE order_items.order_id = ?
            AND order_items.outlet_id = ? 
            ORDER BY order_items.nama`,
            [id, outlet_id]
        );

        res.status(200).json(rows);
    } catch (error: any) {
        res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
}

export const getOrderComplete = async (req: Request, res: Response) => {
    const sortBy = req.params.sortBy ?? "byYear";
    const year = req.params.year ? Number(req.params.year) : 0;
    const month = req.params.month ? Number(req.params.month) : 0;
    const dateFrom = req.params.dateFrom ?? "";
    const dateTo = req.params.dateTo ?? "";
    const process = req.params.process ?? "all";
    const outlet_id = req.params.outlet_id ?? "";

    try {
        const sql = `
            SELECT *
            FROM orders
            WHERE
                (
                    (? = 'byYear'
                        AND (? = 0 OR YEAR(created_at) = ?)
                        AND (? = 0 OR MONTH(created_at) = ?)
                    )
                    OR
                    (? = 'byPeriode'
                        AND DATE(created_at) BETWEEN ? AND ?
                    )
                )
                AND (
                    (? = 'all' AND (proses = 'done' OR proses = 'canceled'))
                    OR 
                    (? != 'all' AND proses = ?)
                )
                AND outlet_id = ?
            ORDER BY created_at DESC
        `;

        const params = [
            // sort by year
            sortBy,
            year, year,
            month, month,

            // sort by periode
            sortBy,
            dateFrom,
            dateTo,

            // process
            process,
            process, process,

            // outlet
            outlet_id
        ];

        const [rows] = await database.query<RowDataPacket[]>(sql, params);

        res.status(200).json(rows);
    } catch (error: any) {
        res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
};

export const paidOrderByKasir = async (req: Request, res: Response) => {
    const { order_id, outlet_id } =  req.body;

    try {
        const createdAt = moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");

        await database.query(
            `UPDATE orders SET status = ? WHERE order_id = ? AND outlet_id = ?`,
            ["paid", order_id, outlet_id]
        );

        await database.query(
            `INSERT INTO time_process (order_id, outlet_id, paid)
             VALUES (?, ?, ?)`,
            [order_id, outlet_id, createdAt]
        );
       
        getIO().emit("order:update");

        res.status(200).json({ message: "Pesanan sudah dibayar" });
    } catch (error: any) {
        res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
}

export const cancelOrderByKasir = async (req: Request, res: Response) => {
    const { order_id, outlet_id } =  req.body;

    try {
        const createdAt = moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");

        await database.query(
            `UPDATE orders SET status = ?, proses = ? WHERE order_id = ? AND outlet_id = ?`,
            ["canceled", "canceled", order_id, outlet_id]
        );

        await database.query(
            `INSERT INTO time_process (order_id, outlet_id, cancel)
             VALUES (?, ?, ?)`,
            [order_id, outlet_id, createdAt]
        );
       
        getIO().emit("order:update");
        getIO().emit("order:cancel", { order_id, outlet_id });

        res.status(200).json({ message: "Pesanan dibatalkan" });
    } catch (error: any) {
        res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
}

export const acceptOrderByKasir = async (req: Request, res: Response) => {
    const { order_id, outlet_id } =  req.body;

    try {
        const createdAt = moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");

        await database.query(
            `UPDATE orders SET proses = ? WHERE order_id = ? AND outlet_id = ?`,
            ["acc kasir", order_id, outlet_id]
        );

        await database.query(
            `UPDATE time_process SET acc_kasir = ? WHERE order_id = ? AND outlet_id = ?`,
            [createdAt, order_id, outlet_id]
        );
       
        try {
            getIO().emit("order:update");
        } catch (socketError) {
            console.warn("Socket emit failed (ignored):", socketError);
        }

        res.status(200).json({ message: "Pesanan sudah diacc kasir" });
    } catch (error: any) {
        console.error("acceptOrderByKasir ERROR:", error);
        res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
}

export const acceptOrderByDapur = async (req: Request, res: Response) => {
    const { order_id, outlet_id } =  req.body;

    try {
        const createdAt = moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");

        await database.query(
            `UPDATE orders SET proses = ? WHERE order_id = ? AND outlet_id = ?`,
            ["acc dapur", order_id, outlet_id]
        );

        await database.query(
            `UPDATE time_process SET acc_dapur = ? WHERE order_id = ? AND outlet_id = ?`,
            [createdAt, order_id, outlet_id]
        );
       
        try {
            getIO().emit("order:update");
        } catch (socketError) {
            console.warn("Socket emit failed (ignored):", socketError);
        }

        res.status(200).json({ message: "Pesanan sudah diacc dapur" });
    } catch (error: any) {
        console.error("acceptOrderByDapur ERROR:", error);
        res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
}

export const readyOrder = async (req: Request, res: Response) => {
    const { order_id, outlet_id } = req.body;

    try {
        const createdAt = moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");

        await database.query(
            `UPDATE orders SET proses = ? WHERE order_id = ? AND outlet_id = ?`,
            ["ready", order_id, outlet_id]
        );

        await database.query(
            `UPDATE time_process SET ready = ? WHERE order_id = ? AND outlet_id = ?`,
            [createdAt, order_id, outlet_id]
        );

        try {
            getIO().emit("order:update", {
                order_id,
                proses: "ready",
            });
        } catch (socketError) {
            console.warn("Socket emit failed (ignored):", socketError);
        }

        res.status(200).json({ message: "Pesanan siap disajikan" });
    } catch (error: any) {
        console.error("acceptOrderByDapur ERROR:", error);
        res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
}

export const finishOrder = async (req: Request, res: Response) => {
    const { order_id, outlet_id } = req.body;

    try {
        const createdAt = moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");

        await database.query(
            `UPDATE orders SET proses = ? WHERE order_id = ? AND outlet_id = ?`,
            ["done", order_id, outlet_id]
        );

        await database.query(
            `UPDATE time_process SET done = ? WHERE order_id = ? AND outlet_id = ?`,
            [createdAt, order_id, outlet_id]
        );

        try {
            getIO().emit("order:update");
        } catch (socketError) {
            console.warn("Socket emit failed (ignored):", socketError);
        }

        res.status(200).json({ message: "Pesanan selesai" });
    } catch (error: any) {
        console.error("finishOrder ERROR:", error);
        res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
}