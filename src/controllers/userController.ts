import { Request, Response } from "express";
import database from "../config/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import bcrypt from 'bcryptjs';

export const createUser = async (req: Request, res: Response) => {
    const { outlet_id, nama, username, password, confirmPassword, hak_akses } = req.body;

    try {
        if (!outlet_id || !nama || !username || !password || !confirmPassword || !hak_akses) {
            return res.status(400).json({ message: "Semua form harus diisi!" });
        }

        if(password !== confirmPassword) {
            return res.status(400).json({ message: 'Konfirmasi password harus sama' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await database.query<ResultSetHeader>(
            `INSERT INTO profile_user (outlet_id, username, password, name, hak_akses)
            VALUES (?, ?, ?, ? ,?)`,
            [outlet_id, username, hashedPassword, nama, hak_akses]
        );

        res.status(200).json({ message: 'User berhasil diinput' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
}

export const getUser = async (req: Request, res: Response) => {
    const outlet_id = req.params.outlet_id;
    // console.log("outlet_id:", outlet_id)

    try {
        const [rows] = await database.query<RowDataPacket[]>(
            `SELECT * FROM profile_user WHERE hak_akses <> '1' AND outlet_id = ? ORDER BY username`,
            [outlet_id]
        );
        return res.status(200).json(rows);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    const { username, outlet_id } = req.body;
    // console.log(username)

    try {
        await database.query<ResultSetHeader>(
            `DELETE FROM profile_user WHERE username = ? AND outlet_id = ?`, [username, outlet_id]
        );

        res.status(200).json({ message: 'User berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
}