const express = require("express");
const User = require("../schemas/Account");
const protect = require("../middlewares/authentication");
const authorize = require("../middlewares/authorization");

const router = express.Router();

router.get("/users", protect, authorize("admin"), async (req, res) => {
    try {
        const users = await User.find().select("-password");

        res.json({
            users
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

router.delete("/users/:id", protect, authorize("admin"), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        await User.findByIdAndDelete(req.params.id);

        res.json({
            message: "User deleted successfully"
        });

    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({
                message: "Invalid user ID"
            });
        }

        res.status(500).json({
            message: error.message
        });
    }
});

module.exports = router;