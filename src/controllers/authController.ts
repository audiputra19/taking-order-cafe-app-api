import { Request, Response } from "express";
import database from "../config/db";
import { RowDataPacket } from "mysql2";
import { Users } from "../interfaces/Users";
import bcrypt from "bcryptjs";
import { CustomRequest } from "../types/customRequest";
import { generateToken } from "../utils/jwt";

export const registerController = async (req: Request, res: Response) => {
    const {fullname, phone, email, cafeName, address, phoneCafe, province, city, district, village, 
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
            `SELECT company_id
            FROM company_profile
            WHERE company_id LIKE ?
            ORDER BY company_id DESC
            LIMIT 1`,
            [`%.${village.id}`]
        );

        let nextCompanyNumber = 1;

        if (rows.length > 0) {
            const lastCompanyId = rows[0].company_id; // contoh: 003.3173010005
            const lastNumber = parseInt(lastCompanyId.split('.')[0]); // 003 → 3
            nextCompanyNumber = lastNumber + 1;
        }

        const companyNumberStr = String(nextCompanyNumber).padStart(3, '0');
        const company_id = `${companyNumberStr}.${village.id}`;

        const outletNumberStr = '001';
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
        console.error(error)
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });   
    }
}

export const loginController = async (req: Request, res: Response) => {
    const {username, password} = req.body;

    try {
        if(username === '' || password === '') {
            return res.status(404).json({ message: 'Form harus diisi semua' });
        }

        const [rows] = await database.query<RowDataPacket[]>(
            `SELECT * FROM profile_user WHERE username = ?`, [username]
        );
        const user = rows[0] as Users;

        const [rows2] = await database.query<RowDataPacket[]>(
            `SELECT * FROM company_profile WHERE outlet_id = ?`, [user.outlet_id]
        );
        const company = rows2[0] as Users;

        if(!user) return res.status(404).json({ message: 'Username atau password salah' });

        const isPasswordValid = bcrypt.compareSync(password, user.password);
        if(!isPasswordValid) return res.status(404).json({ message: 'Username atau password salah' });

        const token = generateToken({ 
            company_id: company.company_id,
            outlet_id: user.outlet_id,
            username: user.username, 
            name: user.name,
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