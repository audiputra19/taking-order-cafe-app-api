import { Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import database from "../config/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";

// const uploadDir = path.resolve(__dirname, "../uploads/logo");

// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }
const companyStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const outletId = req.body.outlet_id;
    const dir = path.join('/app/uploads', `outlet_${outletId}`, 'logo');

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, 'company_logo' + path.extname(file.originalname));
  }
});

export const uploadCompanyLogo = multer({
  storage: companyStorage,
  limits: { fileSize: 2 * 1024 * 1024 }
});

export const createCompanyProfileController = async (req: Request, res: Response) => {
    const { outlet_id, name, address, phone } = req.body;
    const file = req.file;

    try {
        if (file) {
            const imageTitle = file.originalname;
            const imagePath = `/uploads/outlet_${outlet_id}/logo/${file.filename}`;

            await database.query(
                `UPDATE company_profile 
                SET name = ?, address = ?, phone = ?, image_title = ?, image_path = ?
                WHERE outlet_id = ?`,
                [name, address, phone, imageTitle, imagePath, outlet_id]
            );
        } else {
            await database.query(
                `UPDATE company_profile 
                SET name = ?, address = ?, phone = ?
                WHERE outlet_id = ?`,
                [name, address, phone, outlet_id]
            );
        }

        res.status(200).json({ message: "Profil perusahaan berhasil diupdate" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
};

export const getCompanyProfileController = async (req: Request, res: Response) => {
    const outlet_id = req.params.outlet_id;

    try {
        const [rows] = await database.query<RowDataPacket[]>(
            `SELECT * FROM company_profile WHERE outlet_id = ?`, [outlet_id]
        );

        res.status(200).json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
}

export const customizeCompanyProfileController = async (req: Request, res: Response) => {
    const { outlet_id, primary_color } = req.body;

    try {
        await database.query(
            `UPDATE company_profile 
            SET primary_color = ?
            WHERE outlet_id = ?`,
            [primary_color, outlet_id]
        );

        res.status(200).json({ message: "Profil perusahaan berhasil dikustomisasi" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
};