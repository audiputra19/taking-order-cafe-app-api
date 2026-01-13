import { Request, Response } from "express";
import database from "../config/db";
import { RowDataPacket } from "mysql2";
import bcrypt from "bcryptjs";

export const AddOutletController = async (req: Request, res: Response) => {
    const {company_id, fullname, phone, email, cafeName, address, phoneCafe, province, city, district, village, 
        postalCode, username, password, confirmPassword} = req.body; 

    try {
        if(fullname === '' || phone === '' || email === '' || cafeName === '' || address === '' ||
            phoneCafe === '' || province === '' || city === '' || district === '' || village === '' ||
            postalCode === '' || username === '' || password === '' || confirmPassword === ''
        ) {
            return res.status(404).json({ message: 'Form harus diisi semua' });
        }

        if(password !== confirmPassword) {
            return res.status(400).json({ message: "Konfirmasi password tidak cocok" });
        }

        const [rows] = await database.query<RowDataPacket[]>(
            `SELECT outlet_id 
            FROM company_profile
            WHERE company_id = ?
            ORDER BY outlet_id DESC
            LIMIT 1`,
            [company_id]
        );

        let nextOutletNumber = 1;

        if (rows.length > 0) {
            const lastOutletId = rows[0].outlet_id; // contoh: 003.3173010005
            const lastNumber = parseInt(lastOutletId.split('.')[0]); // 003 → 3
            nextOutletNumber = lastNumber + 1;
        }

        const outletNumberStr = String(nextOutletNumber).padStart(3, '0');
        const outlet_id = `${company_id}.${outletNumberStr}`;
        
        await database.query<RowDataPacket[]>(
            `INSERT INTO company_profile 
            (company_id, outlet_id, name, address, phone, province, city, district, village, postalCode)
            VALUES
            (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
            [company_id, outlet_id, cafeName, address, phoneCafe, province.name, city.name, district.name, village.name, postalCode]
        );

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await database.query<RowDataPacket[]>(
            `INSERT INTO profile_user 
            (outlet_id, name, phone, email, username, password, hak_akses)
            VALUES
            (?, ?, ?, ?, ?, ?, ?)`, 
            [outlet_id, fullname, phone, email, username, hashedPassword, 1]
        );

        res.status(200).json({ message: 'Registrasi Berhasil' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Terjadi kesalahan pada server" })
    }
}

export const GetOutletController = async (req: Request, res: Response) => {
    const company_id = req.params.company_id;

    try {
        const [rows] = await database.query<RowDataPacket[]>(
            `SELECT * 
            FROM company_profile
            WHERE company_id = ?`,
            [company_id]
        );

        res.status(200).json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Terjadi kesalahan pada server" })
    }
}