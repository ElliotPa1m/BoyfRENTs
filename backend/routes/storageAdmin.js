import express from "express"
import multer from "multer"
import { db } from "../index.js"
import { protect, adminOnly } from "../middleware/authMiddleware.js"
import { uploadProductImage, removeProductImage } from "../integrations/storageAdapter.js"
import { indexProducts } from "../integrations/searchAdapter.js"

const router = express.Router()

const MAX_SIZE = 4 * 1024 * 1024
const ALLOWED_TYPES = ["image/jpeg", "image/png"]

const upload = multer({limits: {fileSize: MAX_SIZE}})

function receiveImage(req, res, next) {
    upload.single("image")(req, res, function (err) {
        if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
            res.status(400).json({error: `The image is too large. Max ${MAX_SIZE/(1024 * 1024)} MB.`})
            return
        } else if (err) {
            res.status(400).json({error: `Could not read the file. Send ONE image file in the field "image"`})
            return
        }
        next()
    })
}

router.post("/products/:sku/image", protect, adminOnly, receiveImage, async (req, res) => {
    const sku = typeof req.params.sku === 'string' ? req.params.sku : ''
    if (!sku) {
        res.status(400).json({error: "Invalid sku"})
        return
    }

    if (!req.file) {
        res.status(400).json({error: `Missing image. Send the image file in the field "image"`})
        return
    }

    if (!ALLOWED_TYPES.includes(req.file.mimetype)) {
        res.status(400).json({error: `The file is not a JPEG or PNG image`})
        return
    }

    const product = await db.collection("products").findOne({sku})
    if (!product) {
        return res.status(404).json({error: "No such product"})
    }

    const oldImagePath = product.imagePath

    let image
    try {
        image = await uploadProductImage(product.sku, {
            buffer: req.file.buffer,
            mimeType: req.file.mimetype
        })
    } catch (err) {
        console.error(err)
        return res.status(502).json({error: "The image service is not responding. Try again later."})
    }

    try {
        await db.collection("products").updateOne(
            {_id: product._id},
            {$set: {imagePath: image.path, imageUrl: image.url}}
        )
    } catch (err) {
        console.error(err)
        try {await removeProductImage(image.path)} catch (e) {console.error(e)}
        return res.status(500).json({error: "Could not save the image on the product"})
    }
    
    if (oldImagePath) {
        try {
            await removeProductImage(oldImagePath)
        } catch (err) {
            console.error(err)
        }
    }

    let searchIndexUpdated = true
    try {
        const updated = await db.collection("products").findOne({_id: product._id})
        await indexProducts([updated])
    } catch (err) {
        console.error(err)
        searchIndexUpdated = false
    }

    res.status(201).json({path: image.path, url: image.url, searchIndexUpdated})
})

export default router;