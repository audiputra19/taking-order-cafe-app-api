import { Request, Response } from "express";
import database from "../config/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";

export const addCategory = async (req: Request, res: Response) => {
    const { outlet_id, name } = req.body;

    try {
        const [rows] = await database.query<RowDataPacket[]>(
            `SELECT id 
             FROM categories 
             WHERE outlet_id = ? 
             ORDER BY id DESC 
             LIMIT 1`,
            [outlet_id]
        );

        let newId = "C001";

        if (rows.length > 0) {
            const lastId = rows[0].id;
            const number = parseInt(lastId.substring(1));
            const nextNumber = number + 1;

            newId = "C" + nextNumber.toString().padStart(3, "0");
        }

        await database.query<ResultSetHeader>(
            `INSERT INTO categories (id, outlet_id, name)
             VALUES (?, ?, ?)`,
            [newId, outlet_id, name]
        );

        res.status(200).json({ message: 'Kategori berhasil ditambahkan' });
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Terjadi kesalahan pada server" })
    }
}

export const getCategory = async (req: Request, res: Response) => {
    const { outlet_id } = req.params;

    try {
        const [rows] = await database.query<RowDataPacket[]>(
            `SELECT 
                c.id,
                c.name,
                c.outlet_id,
                c.discontinue,
                c.is_drink,
                COUNT(DISTINCT o.order_id) AS qty
            FROM categories c
            LEFT JOIN products p ON p.kategori = c.id
            LEFT JOIN order_items o ON o.produk_id = p.id AND o.outlet_id = c.outlet_id
            WHERE c.outlet_id = ?
            AND c.discontinue <> '1'
            GROUP BY c.id, c.name`,
            [outlet_id]
        );

        res.status(200).json(rows.map(row => ({
            ...row,
            has_order: row.qty > 0
        })));
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Terjadi kesalahan pada server" })
    }
}

export const getDiscontinueCategory = async (req: Request, res: Response) => {
    const { outlet_id } = req.params;

    try {
        const [rows] = await database.query<RowDataPacket[]>(
            `SELECT *
            FROM categories
            WHERE outlet_id = ?
            AND discontinue = '1'`,
            [outlet_id]
        );

        res.status(200).json(rows);
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Terjadi kesalahan pada server" })
    }
}

export const deleteCategory = async (req: Request, res: Response) => {
    const { id, outlet_id } = req.body;

    try {
        await database.query<ResultSetHeader>(
            `DELETE FROM categories WHERE id = ? AND outlet_id = ?`, 
            [id, outlet_id]
        );

        res.status(200).json({ message: 'Kategori telah dihapus' });
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
}

export const discontinueCategory = async (req: Request, res: Response) => {
    const { id, outlet_id } = req.body;

    try {
        await database.query<ResultSetHeader>(
            `UPDATE categories SET discontinue = ? WHERE id = ? AND outlet_id = ?`, 
            [1, id, outlet_id]
        );

        res.status(200).json({ message: 'Kategori telah discontinue' });
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
}

export const activateCategory = async (req: Request, res: Response) => {
    const { id, outlet_id } = req.body;

    try {
        await database.query<ResultSetHeader>(
            `UPDATE categories SET discontinue = ? WHERE id = ? AND outlet_id = ?`, 
            [0, id, outlet_id]
        );

        res.status(200).json({ message: 'Kategori telah diaktifkan' });
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
}

export const updateCategory = async (req: Request, res: Response) => {
    const { id, outlet_id, checked } = req.body;

    try {
        await database.query<ResultSetHeader>(
            `UPDATE categories SET is_drink = ? WHERE id = ? AND outlet_id = ?`, 
            [checked, id, outlet_id]
        );

        res.status(200).json({ message: 'Kategori berhasil diupdate' });
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
}