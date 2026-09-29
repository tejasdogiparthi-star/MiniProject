const express = require("express");
const Job = require("../schemas/Jobpost");
const protect = require("../middlewares/authentication");
const authorize = require("../middlewares/authorization");

const router = express.Router();

router.get("/jobs", protect, authorize("employer"), async (req, res) => {
    try {
        const jobs = await Job.find({
            employer: req.user.id
        });

        res.json({
            jobs
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

module.exports = router;