import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { sequelize } from "./src/config/db.js";
import orderRoutes from "./src/routes/orderRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// prefix API
app.use("/api/orders", orderRoutes);

const PORT = process.env.PORT || 5000;

// Sync database dan mulai server
sequelize.sync().then(() => {
  app.listen(PORT, () => console.log(`✅ Order Service running on port ${PORT}`));
});
