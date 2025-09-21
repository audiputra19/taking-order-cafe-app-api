import { Request, Response } from "express";
import database from "../config/db";
import { RowDataPacket } from "mysql2";
import { Users } from "../interfaces/Users";
import bcrypt from "bcryptjs";
import { CustomRequest } from "../types/customRequest";
import { generateToken } from "../utils/jwt";

export const loginController = async (req: Request, res: Response) => {
    const {username, password} = req.body;

    try {
        if(username === '' || password === '') {
            return res.status(404).json({ message: 'Form harus diisi semua' });
        }

        const [rows] = await database.query<RowDataPacket[]>(
            `SELECT * FROM user_auth WHERE username = ?`, [username]
        );
        const user = rows[0] as Users;

        if(!user) return res.status(404).json({ message: 'Username atau password salah' });

        const isPasswordValid = bcrypt.compareSync(password, user.password);
        if(!isPasswordValid) return res.status(404).json({ message: 'Username atau password salah' });

        const token = generateToken({ 
            username: user.username, 
            nama: user.nama,
            hak_akses: user.hak_akses
        });

        res.status(200).json({ 
            data: {
              token
            },
            message: 'Login berhasil'  
        });
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });   
    }
}

export const me = (req: CustomRequest, res: Response) => res.status(200).json({ user: req.user });