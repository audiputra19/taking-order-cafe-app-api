import { Request, Response } from "express";
import database from "../config/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import bcrypt from 'bcryptjs';

export const createUser = async (req: Request, res: Response) => {
    const { nama, username, password, confirmPassword, hak_akses } = req.body;

    try {
        if(password !== confirmPassword) {
            return res.status(400).json({ message: 'Konfirmasi password harus sama' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await database.query<ResultSetHeader>(
            `INSERT INTO user_auth (username, password, nama, hak_akses)
            VALUES (?, ?, ? ,?)`,
            [username, hashedPassword, nama, hak_akses]
        );

        res.status(200).json({ message: 'User berhasil diinput' });
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
}

export const getUser = async (req: Request, res: Response) => {
    try {
        const [rows] = await database.query<RowDataPacket[]>(
            `SELECT * FROM user_auth ORDER BY username`
        );
        return res.status(200).json(rows);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    const { username } = req.params;
    // console.log(username)

    try {
        await database.query<ResultSetHeader>(
            `DELETE FROM user_auth WHERE username = ?`, [username]
        );

        res.status(200).json({ message: 'User berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
}