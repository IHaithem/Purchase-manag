import { Router } from "express";
import {
  createCategory,
  deleteCategory,
  getCategoriesByFilter,
  updateCategory,
} from "../controllers/category.controller";
import { upload } from "../middlewares/Multer";

// Using upload() for backward compatibility; we ignore the folder name now.
const categoryRouter = Router();

categoryRouter.get("/", getCategoriesByFilter);
categoryRouter.post("/", upload().single("image"), createCategory);
categoryRouter.put("/:categoryId", upload().single("image"), updateCategory);
categoryRouter.delete("/:categoryId", deleteCategory);

export default categoryRouter;