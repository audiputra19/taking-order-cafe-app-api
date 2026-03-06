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
const productStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const outletId = req.body.outlet_id;
        const dir = path.join('/app/uploads', `outlet_${outletId}`, 'product');

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueName + path.extname(file.originalname));
    }
});

export const uploadProductImage = multer({
    storage: productStorage,
    limits: { fileSize: 2 * 1024 * 1024 }
});


const createdAt = moment().tz('Asia/Jakarta').format("YYYY-MM-DD HH:mm:ss");

export const createProduct = async (req: MulterRequest, res: Response) => {
    const { outlet_id, nama, hpp, harga, kategori, deskripsi } = req.body;
    const file = (req).file;
    // console.log("outlet_id:", req.body);

    try {
        if(!outlet_id) {
            return res.status(400).json({ message: "Outlet ID tidak boleh kosong!" });
        }

        if (!nama || !hpp || !harga || !kategori || !deskripsi) {
            return res.status(400).json({ message: "Semua form harus diisi!" });
        }

        if (!file) {
            return res.status(400).json({ message: "Gambar produk wajib diupload!" });
        }

        // const datePart = moment().tz('Asia/Jakarta').format("DDMMYY");

        // ambil id terakhir
        const kategoriFormatted = String(kategori).padStart(2, "0"); 
        const prefix = `${outlet_id}.${kategoriFormatted}.`;   
        const [rows] = await database.query<RowDataPacket[]>(
            "SELECT id FROM products WHERE id LIKE ? ORDER BY id DESC LIMIT 1",
            [`${prefix}%`]
        );

        let newNumber = "001";
        if (rows.length > 0) {
            const lastId = rows[0].id; // misal "010925.003"
            const lastNumber = parseInt(lastId.split(".")[4]); // ambil "003"
            newNumber = String(lastNumber + 1).padStart(3, "0");
        }

        const newId = `${outlet_id}.${kategoriFormatted}.${newNumber}`;

        const imageTitle = file.originalname;
        const imagePath = `/uploads/outlet_${outlet_id}/product/${file.filename}`;

        // Insert ke database
        await database.query<ResultSetHeader>(
            `INSERT INTO products (id, outlet_id, nama, hpp, harga, kategori, deskripsi, image_title, image_path, created_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [newId, outlet_id, nama, hpp, harga, kategori, deskripsi, imageTitle, imagePath, createdAt]
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
    const outlet_id = req.params.outlet_id;

    try {
        const [rows] = await database.query(
            `SELECT * FROM products WHERE discontinue <> '1' AND outlet_id = ? ORDER BY created_at DESC`,
            [outlet_id]
        );
        return res.status(200).json(rows);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
};

export const getProductDiscontinue = async (req: Request, res: Response) => {
    const outlet_id = req.params.outlet_id

    try {
        const [rows] = await database.query(
            `SELECT * FROM products WHERE discontinue = '1' AND outlet_id = ? ORDER BY created_at DESC`,
            [outlet_id]
        );
        return res.status(200).json(rows);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
};

export const updateProduct = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { outlet_id, nama, hpp, harga, kategori, deskripsi, image_title, image_path: oldImage } = req.body;
    const file = req.file;

    try {
        if (!id || !outlet_id) {
            return res.status(400).json({ message: "ID produk / outlet tidak ditemukan!" });
        }

        if (!nama || !hpp || !harga || !kategori || !deskripsi) {
            return res.status(400).json({ message: "Semua form harus diisi!" });
        }

        let newImageTitle = image_title;
        let newImagePath = oldImage;

        if (file) {
        newImageTitle = file.originalname;
        newImagePath = `/uploads/outlet_${outlet_id}/product/${file.filename}`;

        if (oldImage) {
            const oldPath = path.join('/app', oldImage); 
            // oldImage = "/uploads/outlet_1/product/xxx.jpg"

            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }
        }

        await database.query<ResultSetHeader>(
            `UPDATE products
            SET nama = ?, hpp = ?, harga = ?, kategori = ?, deskripsi = ?, image_title = ?, image_path = ?
            WHERE id = ? AND outlet_id = ?`,
            [nama, hpp, harga, kategori, deskripsi, newImageTitle, newImagePath, id, outlet_id]
        );

        res.status(200).json({ message: "Produk berhasil diupdate" });
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