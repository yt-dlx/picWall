// server/index.ts
import cors from "cors";
import express from "express";
import { router } from "./routes";
const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
app.use("/api", router);
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
