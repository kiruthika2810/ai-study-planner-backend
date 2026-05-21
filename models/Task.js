const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true
    },

    subject: {
        type: String,
        required: true
    },

    topic: {
        type: String,
        required: true
    },

    priority: {
        type: String,
        enum: ["High", "Medium", "Low"],
        default: "Medium"
    },

    studyDate: {
        type: String,
        required: true
    },

    duration: {
        type: Number,
        required: true
    },

    status: {
        type: String,
        enum: ["Pending", "Completed"],
        default: "Pending"
    },

    notes: {
        type: String
    }

});

module.exports = mongoose.model("Task", taskSchema);