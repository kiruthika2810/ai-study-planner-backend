const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Task = require("./models/Task");
const User = require("./models/User");

const app = express();

/* ---------------- MIDDLEWARE ---------------- */

app.use(express.json());
app.use(cors());

/* ---------------- DATABASE CONNECTION ---------------- */

mongoose.connect(
    "mongodb://kiruthikak2024_db_user:kiruthika281007@ac-yzhrevx-shard-00-00.umashc1.mongodb.net:27017,ac-yzhrevx-shard-00-01.umashc1.mongodb.net:27017,ac-yzhrevx-shard-00-02.umashc1.mongodb.net:27017/aiStudyPlanner?ssl=true&replicaSet=atlas-af77v9-shard-0&authSource=admin&appName=Cluster0"
)
.then(() => {

    console.log("MongoDB Connected");

})
.catch((err) => {

    console.log("Database Error");
    console.log(err);

});

/* ---------------- TEST ROUTE ---------------- */

app.get("/", (req, res) => {

    res.send("AI Study Planner Backend Running");

});

/* ---------------- CREATE TASK API ---------------- */

app.post("/create-task", async (req, res) => {

    try {

        const {
            title,
            subject,
            topic,
            priority,
            studyDate,
            duration,
            status,
            notes
        } = req.body;

        const newTask = new Task({

            title,
            subject,
            topic,
            priority,
            studyDate,
            duration,
            status,
            notes

        });

        const savedTask = await newTask.save();

        res.status(201).json({

            message: "Task Created Successfully",
            task: savedTask

        });

    } catch (error) {

        console.log(error);

        res.status(500).json({

            message: error.message

        });

    }

});

/* ---------------- GET ALL TASKS API ---------------- */

app.get("/tasks", async (req, res) => {

    try {

        const tasks = await Task.find();

        res.status(200).json(tasks);

    } catch (error) {

        console.log(error);

        res.status(500).json({

            message: error.message

        });

    }

});

/* ---------------- GET SINGLE TASK API ---------------- */

app.get("/task/:id", async (req, res) => {

    try {

        const task = await Task.findById(req.params.id);

        if (!task) {

            return res.status(404).json({

                message: "Task Not Found"

            });

        }

        res.status(200).json(task);

    } catch (error) {

        console.log(error);

        res.status(500).json({

            message: error.message

        });

    }

});

/* ---------------- UPDATE TASK API ---------------- */

app.put("/update-task/:id", async (req, res) => {

    try {

        const updatedTask = await Task.findByIdAndUpdate(

            req.params.id,
            req.body,
            { new: true }

        );

        if (!updatedTask) {

            return res.status(404).json({

                message: "Task Not Found"

            });

        }

        res.status(200).json({

            message: "Task Updated Successfully",
            task: updatedTask

        });

    } catch (error) {

        console.log(error);

        res.status(500).json({

            message: error.message

        });

    }

});

/* ---------------- DELETE TASK API ---------------- */

app.delete("/delete-task/:id", async (req, res) => {

    try {

        const deletedTask = await Task.findByIdAndDelete(req.params.id);

        if (!deletedTask) {

            return res.status(404).json({

                message: "Task Not Found"

            });

        }

        res.status(200).json({

            message: "Task Deleted Successfully"

        });

    } catch (error) {

        console.log(error);

        res.status(500).json({

            message: error.message

        });

    }

});

/* ---------------- SIGNUP API ---------------- */

/* ---------------- SIGNUP API ---------------- */

app.post("/signup", async (req, res) => {

    try {

        const {
            name,
            email,
            password,
            college,
            department
        } = req.body;

        const existingUser = await User.findOne({ email });

        if (existingUser) {

            return res.status(400).json({

                message: "User Already Exists"

            });

        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({

            name,
            email,
            password: hashedPassword,
            college,
            department

        });

        const savedUser = await newUser.save();

        res.status(201).json({

            message: "Signup Successful",
            user: savedUser

        });

    } catch (error) {

        console.log(error);

        res.status(500).json({

            message: error.message

        });

    }

});

/* ---------------- LOGIN API ---------------- */

/* ---------------- LOGIN API ---------------- */

app.post("/login", async (req, res) => {

    try {

        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {

            return res.status(404).json({

                message: "User Not Found"

            });

        }

        const isPasswordCorrect = await bcrypt.compare(

            password,
            user.password

        );

        if (!isPasswordCorrect) {

            return res.status(401).json({

                message: "Invalid Password"

            });

        }

        const token = jwt.sign(

            {
                id: user._id,
                email: user.email
            },

            "SECRET_KEY",

            {
                expiresIn: "7d"
            }

        );

        res.status(200).json({

            message: "Login Successful",
            token,
            user

        });

    } catch (error) {

        console.log(error);

        res.status(500).json({

            message: error.message

        });

    }

});

/* ---------------- SERVER ---------------- */

const PORT = 5000;

app.listen(PORT, () => {

    console.log(`Server Running On Port ${PORT}`);

});