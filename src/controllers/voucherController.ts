import { Request, Response } from "express";
import database from "../config/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";

export const createVoucher = async (req: Request, res: Response) => {
    const {outlet_id, nama, min_belanja, persen, due_date} = req.body;

    try {
        if(!outlet_id) {
            return res.status(400).json({ message: "Outlet ID tidak boleh kosong!" });
        }

        if (!nama || !min_belanja || !persen || !due_date) {
            return res.status(400).json({ message: "Semua form harus diisi!" });
        }

        const [rows] = await database.query<RowDataPacket[]>(
            "SELECT id_voucher as id FROM voucher ORDER BY id_voucher DESC LIMIT 1"
        );

        let newNumber = "001";
        if (rows.length > 0) {
            const lastId = rows[0].id; // misal "010925.003"
            const lastNumber = parseInt(lastId.split(".")[1]); // ambil "003"
            newNumber = String(lastNumber + 1).padStart(3, "0");
        }    
        const newId = `VOUCHER.${newNumber}`;

        await database.query<ResultSetHeader>(
            `INSERT INTO voucher (id_voucher, outlet_id, nama, min_belanja, persen, due_date)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [newId, outlet_id, nama, min_belanja, persen, due_date]
        );

        res.status(200).json({ message: 'Voucher berhasil diinput' });
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
}

export const getVoucher = async (req: Request, res: Response) => {
    const outlet_id = req.params.outlet_id;

    try {
        const [rows] = await database.query<RowDataPacket[]>(
            `SELECT * FROM voucher WHERE outlet_id = ? ORDER BY nama`,
            [outlet_id]
        );

        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
}

export const updateVoucher = async (req: Request, res: Response) => {
    const {outlet_id, nama, min_belanja, persen, due_date} = req.body;
    const {id} = req.params;

    try {
        if(!outlet_id) {
            return res.status(400).json({ message: "Outlet ID tidak boleh kosong!" });
        }

        if (!id) {
            return res.status(400).json({ message: "ID voucher tidak ditemukan!" });
        }

        if (!nama || !min_belanja || !persen || !due_date) {
            return res.status(400).json({ message: "Semua form harus diisi!" });
        }

        await database.query<ResultSetHeader>(
            `UPDATE voucher 
            SET nama = ?, min_belanja = ?, persen = ?, due_date = ? 
            WHERE id_voucher = ? AND outlet_id = ?`,
            [nama, min_belanja, persen, due_date, id, outlet_id]
        );

        res.status(200).json({ message: 'Voucher berhasil diupdate' });
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
}

export const deleteVoucher = async (req: Request, res: Response) => {
    const {id} = req.params;

    try {

        await database.query<ResultSetHeader>(
            `DELETE FROM voucher WHERE id_voucher = ?`, [id]
        );

        res.status(200).json({ message: 'Voucher berhasil dihapus' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
}