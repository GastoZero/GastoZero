
import { Router } from "express"
import { Service } from "../models/Service.js"

const router = Router()

router.get("/", async (_req, res) => {
  const services = await Service.find()
    .select("id name category color plans -_id")
    .sort({ id: 1 })
    .lean()

  res.json(services)
})

export default router
