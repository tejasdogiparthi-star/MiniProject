const express = require("express");
const Application = require("../schemas/JobApplication");
const Job = require("../schemas/Jobpost");
const protect = require("../middlewares/authentication");
const authorize = require("../middlewares/authorization");

const router = express.Router();

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

router.get("/my", protect, authorize("jobseeker"), async (req, res) => {
    try {
        const applications = await Application.find({
            applicant: req.user.id
        }).populate("job", "title description skills salary location");

        res.json({
            applications
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});
router.get("/employer", protect, authorize("employer"), async (req, res) => {
    try {
        const applications = await Application.find()
            .populate({
                path: "job",
                match: { employer: req.user.id },
                select: "title description salary location"
            })
            .populate("applicant", "name email");

        const filteredApplications = applications.filter(
            application => application.job !== null
        );

        res.json({
            applications: filteredApplications
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});
router.put("/:id/status", protect, authorize("employer"), async (req, res) => {
    try {
        const application = await Application.findById(req.params.id)
            .populate("job");

        if (!application) {
            return res.status(404).json({
                message: "Application not found"
            });
        }

        // Make sure this application belongs to one of the employer's jobs
        if (application.job.employer.toString() !== req.user.id) {
            return res.status(403).json({
                message: "You can update applications only for your own jobs"
            });
        }

        const { status } = req.body;

        const allowedStatuses = [
            "applied",
            "shortlisted",
            "rejected",
            "selected"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid application status"
            });
        }

        application.status = status;

        await application.save();

        res.json({
            message: "Application status updated successfully",
            application
        });

    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({
                message: "Invalid application ID"
            });
        }

        res.status(500).json({
            message: error.message
        });
    }
});
module.exports = router;