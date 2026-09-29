const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },

        email: {
            type: String,
            required: true,
            unique: true
        },

        password: {
            type: String,
            required: true
        },

        role: {
            type: String,
            enum: ["jobseeker", "employer", "admin"],
            default: "jobseeker"
        },

        profile: {
            phone: String,
            skills: [String],
            experience: String
        }
    },
    {
        timestamps: true
    }
);

module.exports =
    mongoose.models.User || mongoose.model("User", userSchema);