import express from "express";
import { db } from "../index.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = express.Router()

router.post("/register", async (req, res) => {
    const {username, password, role} = req.body
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await db.collection("users").insertOne({ username, password: hashedPassword, role })
    res.json(user)
})

router.post("/login", async (req, res) => {
    const {username, password} = req.body
    const user = await db.collection("users").findOne({username})
    if (!user) return res.status(401).json({message: "Wrong username or password"})
    const match = await bcrypt.compare(password, user.password)
    if (!match) return res.status(401).json({message: "Wrong username or password"})
    const token = jwt.sign({id: user._id, role: user.role }, process.env.JWT_SECRET, {expiresIn: "7d" })
    res.json({ token, role: user.role })
})

export default router;