import { Request, Response } from "express";

const BASE_URL = "https://emsifa.github.io/api-wilayah-indonesia/api";

export const getProvinces = async (req: Request, res: Response) => {
    try {
        const r = await fetch(`${BASE_URL}/provinces.json`);
        const data = await r.json();
        res.json(data);
    } catch (err) {
        console.error("PROVINCES ERROR:", err);
        res.status(500).json({ message: "Failed to load provinces" });
    }
}

export const getCities = async (req: Request, res: Response) => {
    try {
        const r = await fetch(`${BASE_URL}/regencies/${req.params.provinceId}.json`);
        res.json(await r.json());
    } catch (err) {
        console.error("CITIES ERROR:", err);
        res.status(500).json({ message: "Failed to load cities" });
    }
}

export const getDistrict = async (req: Request, res: Response) => {
    try {
        const r = await fetch(`${BASE_URL}/districts/${req.params.cityId}.json`);
        res.json(await r.json());
    } catch (err) {
        console.error("DISTRICTS ERROR:", err);
        res.status(500).json({ message: "Failed to load districts" });
    }
}

export const getVillages = async (req: Request, res: Response) => {
    try {
        const r = await fetch(`${BASE_URL}/villages/${req.params.districtId}.json`);
        res.json(await r.json());
    } catch (err) {
        console.error("VILLAGES ERROR:", err);
        res.status(500).json({ message: "Failed to load villages" });
    }
}