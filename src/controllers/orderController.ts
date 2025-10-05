import { Request, Response } from "express";
import database from "../config/db";
import { getIO } from "../socket";
import { RowDataPacket } from "mysql2";
import moment from "moment-timezone";

export const getOrder = async (req: Request, res: Response) => {

    try {
        const [rows] = await database.query<RowDataPacket[]>(
            `SELECT * 
            FROM orders 
            WHERE (proses <> 'done' 
            AND status = 'paid')
            OR (status = 'unpaid' AND metode = 'cash') 
            ORDER BY created_at DESC`
        );

        res.status(200).json(rows);
    } catch (error: any) {
        res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
}

export const getOrderById = async (req: Request, res: Response) => {
    const { id } = req.params;
    
    try {
        const [rows] = await database.query<RowDataPacket[]>(
            `SELECT order_items.order_id, order_items.nama, order_items.harga, order_items.qty, 
                orders.created_at
            FROM order_items 
            INNER JOIN orders ON orders.order_id = order_items.order_id
            WHERE order_items.order_id = ? 
            ORDER BY order_items.nama`,
            [id]
        );

        res.status(200).json(rows);
    } catch (error: any) {
        res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
}

export const getOrderComplete = async (req: Request, res: Response) => {

    try {
        const [rows] = await database.query<RowDataPacket[]>(
            `SELECT * FROM orders WHERE (proses = 'done' OR proses = 'canceled') ORDER BY created_at DESC`
        );

        res.status(200).json(rows);
    } catch (error: any) {
        res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
}

export const paidOrderByKasir = async (req: Request, res: Response) => {
    const { order_id } =  req.body;

    try {
        const createdAt = moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");

        await database.query(
            `UPDATE orders SET status = ? WHERE order_id = ?`,
            ["paid", order_id]
        );

        await database.query(
            `INSERT INTO time_process (order_id, paid)
             VALUES (?, ?)`,
            [order_id, createdAt]
        );
       
        getIO().emit("order:update");

        res.status(200).json({ message: "Pesanan sudah dibayar" });
    } catch (error: any) {
        res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
}

export const cancelOrderByKasir = async (req: Request, res: Response) => {
    const { order_id } =  req.body;

    try {
        const createdAt = moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");

        await database.query(
            `UPDATE orders SET status = ?, proses = ? WHERE order_id = ?`,
            ["canceled", "canceled", order_id]
        );

        await database.query(
            `INSERT INTO time_process (order_id, cancel)
             VALUES (?, ?)`,
            [order_id, createdAt]
        );
       
        getIO().emit("order:cancel", { order_id });

        res.status(200).json({ message: "Pesanan dibatalkan" });
    } catch (error: any) {
        res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
}

export const acceptOrderByKasir = async (req: Request, res: Response) => {
    const { order_id } =  req.body;

    try {
        const createdAt = moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");

        await database.query(
            `UPDATE orders SET proses = ? WHERE order_id = ?`,
            ["acc kasir", order_id]
        );

        await database.query(
            `UPDATE time_process SET acc_kasir = ? WHERE order_id = ?`,
            [createdAt, order_id]
        );
       
        getIO().emit("order:update");

        res.status(200).json({ message: "Pesanan sudah diacc kasir" });
    } catch (error: any) {
        res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
}

export const acceptOrderByDapur = async (req: Request, res: Response) => {
    const { order_id } =  req.body;

    try {
        const createdAt = moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");

        await database.query(
            `UPDATE orders SET proses = ? WHERE order_id = ?`,
            ["acc dapur", order_id]
        );

        await database.query(
            `UPDATE time_process SET acc_dapur = ? WHERE order_id = ?`,
            [createdAt, order_id]
        );
       
        getIO().emit("order:update");

        res.status(200).json({ message: "Pesanan sudah diacc dapur" });
    } catch (error: any) {
        res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
}

export const readyOrder = async (req: Request, res: Response) => {
    const { order_id } = req.body;

    try {
        const createdAt = moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");

        await database.query(
            `UPDATE orders SET proses = ? WHERE order_id = ?`,
            ["ready", order_id]
        );

        await database.query(
            `UPDATE time_process SET ready = ? WHERE order_id = ?`,
            [createdAt, order_id]
        );

        getIO().emit("order:update");

        res.status(200).json({ message: "Pesanan siap disajikan" });
    } catch (error: any) {
        res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
}

export const finishOrder = async (req: Request, res: Response) => {
    const { order_id } = req.body;

    try {
        await database.query(
            `UPDATE orders SET proses = ? WHERE order_id = ?`,
            ["done", order_id]
        );

        getIO().emit("order:update");

        res.status(200).json({ message: "Pesanan selesai" });
    } catch (error: any) {
        res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
}