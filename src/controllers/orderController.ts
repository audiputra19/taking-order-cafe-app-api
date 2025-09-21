import { Request, Response } from "express";
import database from "../config/db";
import { getIO } from "../socket";
import { RowDataPacket } from "mysql2";

export const getOrder = async (req: Request, res: Response) => {

    try {
        const [rows] = await database.query<RowDataPacket[]>(
            `SELECT * FROM orders WHERE proses <> 'done' AND status = 'paid' ORDER BY created_at DESC`
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
            `SELECT * FROM order_items WHERE order_id = ? ORDER BY nama`,
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
            `SELECT * FROM orders WHERE proses = 'done' AND status = 'paid' ORDER BY created_at DESC`
        );

        res.status(200).json(rows);
    } catch (error: any) {
        res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
}

export const acceptOrderByKasir = async (req: Request, res: Response) => {
    const { order_id } =  req.body;

    try {
        await database.query(
            `UPDATE orders SET proses = ? WHERE order_id = ?`,
            ["acc kasir", order_id]
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
        await database.query(
            `UPDATE orders SET proses = ? WHERE order_id = ?`,
            ["acc dapur", order_id]
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
        await database.query(
            `UPDATE orders SET proses = ? WHERE order_id = ?`,
            ["ready", order_id]
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