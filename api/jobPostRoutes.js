const express = require("express");
const Job = require("../schemas/Jobpost");
const Application = require("../schemas/JobApplication");
const protect = require("../middlewares/authentication");
const authorize = require("../middlewares/authorization");

const router = express.Router();

router.post("/", protect, authorize("employer"), async (req, res) => {
    try {
        const { title, description, skills, salary, location } = req.body;

        const job = await Job.create({
            title,
            description,
            skills,
            salary,
            location,
            employer: req.user.id
        });

        res.status(201).json({
            message: "Job created successfully",
            job
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

router.get("/", async (req, res) => {
    try {
        const jobs = await Job.find().populate(
            "employer",
            "name email"
        );

        res.json({
            jobs
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const job = await Job.findById(req.params.id).populate(
            "employer",
            "name email"
        );

        if (!job) {
            return res.status(404).json({
                message: "Job not found"
            });
        }

        res.json({
            job
        });

    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({
                message: "Invalid job ID"
            });
        }

        res.status(500).json({
            message: error.message
        });
    }
});
router.put("/:id", protect, authorize("employer"), async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({
                message: "Job not found"
            });
        }

        // Check if this employer owns the job
        if (job.employer.toString() !== req.user.id) {
            return res.status(403).json({
                message: "You can update only your own jobs"
            });
        }

        const { title, description, skills, salary, location } = req.body;

        job.title = title || job.title;
        job.description = description || job.description;
        job.skills = skills || job.skills;
        job.salary = salary || job.salary;
        job.location = location || job.location;

        await job.save();

        res.json({
            message: "Job updated successfully",
            job
        });

    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({
                message: "Invalid job ID"
            });
        }

        res.status(500).json({
            message: error.message
        });
    }
});
router.delete("/:id", protect, authorize("employer"), async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({
                message: "Job not found"
            });
        }

        if (job.employer.toString() !== req.user.id) {
            return res.status(403).json({
                message: "You can delete only your own jobs"
            });
        }

        await job.deleteOne();

        res.json({
            message: "Job deleted successfully"
        });

    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({
                message: "Invalid job ID"
            });
        }

        res.status(500).json({
            message: error.message
        });
    }
});
router.post("/:id/apply", protect, authorize("jobseeker"), async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({
                message: "Job not found"
            });
        }

        const existingApplication = await Application.findOne({
            job: req.params.id,
            applicant: req.user.id
        });

        if (existingApplication) {
            return res.status(400).json({
                message: "You have already applied for this job"
            });
        }

        const application = await Application.create({
            job: req.params.id,
            applicant: req.user.id,
            resume: req.body.resume
        });

        res.status(201).json({
            message: "Job application submitted successfully",
            application
        });

    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({
                message: "Invalid job ID"
            });
        }

        res.status(500).json({
            message: error.message
        });
    }
});
module.exports = router;