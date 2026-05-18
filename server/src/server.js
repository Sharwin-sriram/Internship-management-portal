import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./config/db.js";
import loginRoutes from "./routes/loginRoutes.js";
import envConfig from "./config/env.js";
import env from "./config/env.js";

const app = express();

// Connect to Database
connectDB();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", loginRoutes);

const PORT = envConfig.PORT || 3001;

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
  console.log(`Server running in ${envConfig.NODE_ENV} mode on port ${PORT}`);
});

export default app;
