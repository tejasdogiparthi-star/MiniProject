const authenticationRoutes = require("./api/authenticationRoutes");
const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./configuration/database");
const cookieParser = require("cookie-parser");
const jobPostRoutes = require("./api/jobPostRoutes");
const companyRoutes = require("./api/companyRoutes");
const jobApplicationRoutes = require("./api/jobApplicationRoutes");
const administratorRoutes = require("./api/administratorRoutes");
dotenv.config();

connectDB();

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authenticationRoutes);
app.use("/api/jobs", jobPostRoutes);
app.use("/api/employer", companyRoutes);
app.use("/api/applications", jobApplicationRoutes);
app.use("/api/admin", administratorRoutes);
app.get("/", (req, res) => {
    res.json({
        message: "Job Portal API is running"
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});