import { Request, Response } from "express";
import { MulterRequest } from "../types/multerRequest";
import moment from 'moment-timezone'
import database from "../config/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import multer from "multer";
import path from "path";
import fs from "fs";

// Pastikan folder uploads ada
// const uploadDir = path.join(__dirname, "../uploads");
// if (!fs.existsSync(uploadDir)) {
//     fs.mkdirSync(uploadDir);
// }
const uploadDir = path.join('/app/uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });


// Konfigurasi multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});

export const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // max 2MB
});

const createdAt = moment().tz('Asia/Jakarta').format("YYYY-MM-DD HH:mm:ss");

export const createProduct = async (req: MulterRequest, res: Response) => {
    const { nama, hpp, harga, kategori, deskripsi } = req.body;
    const file = (req).file;

    try {
        if (!file) {
            return res.status(400).json({ message: "Image is required" });
        }

        // const datePart = moment().tz('Asia/Jakarta').format("DDMMYY");

        // ambil id terakhir
        const [rows] = await database.query<RowDataPacket[]>(
            "SELECT id FROM products WHERE kategori = ? ORDER BY id DESC LIMIT 1",
            [kategori]
        );

        let newNumber = "001";
        if (rows.length > 0) {
            const lastId = rows[0].id; // misal "010925.003"
            const lastNumber = parseInt(lastId.split(".")[2]); // ambil "003"
            newNumber = String(lastNumber + 1).padStart(3, "0");
        }

        const kategoriFormatted = String(kategori).padStart(2, "0");    
        const newId = `ITEM.${kategoriFormatted}.${newNumber}`;

        const imageTitle = file.originalname;
        const imagePath = `/uploads/${file.filename}`;

        // Insert ke database
        await database.query<ResultSetHeader>(
            `INSERT INTO products (id, nama, hpp, harga, kategori, deskripsi, image_title, image_path, created_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [newId, nama, hpp, harga, kategori, deskripsi, imageTitle, imagePath, createdAt]
        );

        return res.status(201).json({
            message: "Produk berhasil disimpan"
        });
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Terjadi kesalahan pada server" })
    }
}

export const getProduct = async (req: Request, res: Response) => {
    try {
        const [rows] = await database.query(
            `SELECT * FROM products WHERE discontinue <> '1' ORDER BY created_at DESC`
        );
        return res.status(200).json(rows);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
};

export const getProductDiscontinue = async (req: Request, res: Response) => {
    try {
        const [rows] = await database.query(
            `SELECT * FROM products WHERE discontinue = '1' ORDER BY created_at DESC`
        );
        return res.status(200).json(rows);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
};

export const updateProduct = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { nama, hpp, harga, kategori, deskripsi, image_title, image_path: oldImage } = req.body;
    const file = req.file;

    try {

        // console.log("id: ", id);
        // console.log("nama: ", nama);
        // console.log("harga: ", harga);
        // console.log("kategori: ", kategori);
        // console.log("deskripsi: ", deskripsi);
        // console.log("image_title: ", image_title);
        // console.log("oldImage: ", oldImage);
        let newImagePath = oldImage;
        let newImageTitle = image_title;

        if (file) {
            // kalau ada file baru, update path
            newImageTitle = file.originalname;
            newImagePath = `/uploads/${file.filename}`;

            if (oldImage) {
                // Buang leading slash → jadi "uploads/xxxx.jpg"
                const cleanOldImage = oldImage.startsWith("/")
                ? oldImage.slice(1)
                : oldImage;

                const oldPath = path.join(process.cwd(), "src", cleanOldImage);

                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                    console.log(`Old image deleted: ${oldPath}`);
                } else {
                    console.log(`File not found: ${oldPath}`);
                }
            }
        }


        const sql = `
            UPDATE products 
            SET nama = ?, hpp = ?, harga = ?, kategori = ?, deskripsi = ?, image_title = ?, image_path = ? 
            WHERE id = ?
        `;
        await database.query<ResultSetHeader>(
            sql, 
            [nama, hpp, harga, kategori, deskripsi, newImageTitle, newImagePath, id]
        );

        res.status(201).json({ message: "Produk berhasil diupdate" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
};

export const discontinueProduct = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        await database.query<ResultSetHeader>(
            `UPDATE products SET discontinue = ?, dis_date = ? WHERE id = ?`,
            [1, createdAt, id]
        );

        res.status(200).json({ message: 'Produk telah discontinue' });
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
}

export const activateProduct = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        await database.query<ResultSetHeader>(
            `UPDATE products SET discontinue = ? WHERE id = ?`,
            [0, id]
        );

        res.status(200).json({ message: 'Produk kembali aktif' });
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
}