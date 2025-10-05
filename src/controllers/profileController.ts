import { Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import database from "../config/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";

const uploadDir = path.resolve(__dirname, "../uploads/logo");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, "company_logo" + ext);
    },
});

export const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // max 2MB
});

export const createCompanyProfileController = async (req: Request, res: Response) => {
    const { name, address } = req.body;
    const file = req.file;

    try {
        const [rows] = await database.query<RowDataPacket[]>("SELECT * FROM company_profile LIMIT 1");
        const oldData = rows[0];

        let imageTitle = oldData?.image_title || null;
        let imagePath = oldData?.image_path || null;

        if (file) {
            const oldFiles = fs.readdirSync(uploadDir).filter(f => f.startsWith("company_logo"));
            for (const old of oldFiles) {
                if (old !== file.filename) {
                fs.unlinkSync(path.join(uploadDir, old));
                }
            }

            imageTitle = file.originalname;
            imagePath = `/uploads/logo/${file.filename}`;
        }

        await database.query("DELETE FROM company_profile");

        await database.query<ResultSetHeader>(
            `INSERT INTO company_profile (name, address, image_title, image_path) 
             VALUES (?, ?, ?, ?)`,
            [name, address, imageTitle, imagePath]
        );

        res.status(200).json({
            message: "Data perusahaan berhasil diperbarui"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
}

export const getCompanyProfileController = async (req: Request, res: Response) => {

    try {
        const [rows] = await database.query<RowDataPacket[]>(
            `SELECT * FROM company_profile`
        );

        res.status(200).json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
}