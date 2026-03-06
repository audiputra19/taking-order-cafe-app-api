import { Request, Response } from "express";
import database from "../config/db";
import { RowDataPacket } from "mysql2";

export const AddDigitalPayment = async (req: Request, res: Response) => {
    const { outletID, serverKey, clientKey, isProduction } = req.body;

    try {
        if(serverKey === '' || clientKey === '') {
            res.status(404).json({ message: 'Form harus diisi semua' });
        }

        await database.query<RowDataPacket[]>(
            `INSERT INTO payment_settings
            (outlet_id, midtrans_server_key, midtrans_client_key, is_production)
            VALUES
            (?, ?, ?, ?)`,
            [outletID, serverKey, clientKey, isProduction]
        );

        res.status(200).json({ message: 'Digital payment berhasil diaktifkan' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
}