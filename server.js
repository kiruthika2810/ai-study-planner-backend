const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const Task = require("./models/Task");
const User = require("./models/User");

const app = express();

/* ---------------- MIDDLEWARE ---------------- */

app.use(express.json());
app.use(cors());

/* ---------------- SWAGGER SETUP ---------------- */

const swaggerOptions = {
    definition: {
        openapi: "3.0.3",
        info: {
            title: "AI Study Planner API",
            version: "1.0.0",
            description: "Swagger documentation for the AI Study Planner backend"
        },
        servers: [
            {
                url: "http://localhost:5000"
            }
        ],
        components: {
            schemas: {
                Task: {
                    type: "object",
                    required: ["title", "subject", "topic", "studyDate", "duration"],
                    properties: {
                        title: { type: "string", example: "Study Mathematics" },
                        subject: { type: "string", example: "Math" },
                        topic: { type: "string", example: "Algebra" },
                        priority: {
                            type: "string",
                            enum: ["High", "Medium", "Low"],
                            example: "High"
                        },
                        studyDate: { type: "string", example: "2026-05-21" },
                        duration: { type: "number", example: 2 },
                        status: {
                            type: "string",
                            enum: ["Pending", "Completed"],
                            example: "Pending"
                        },
                        notes: { type: "string", example: "Focus on equations" }
                    }
                },
                User: {
                    type: "object",
                    required: ["name", "email", "password"],
                    properties: {
                        name: { type: "string", example: "Kiruthika" },
                        email: { type: "string", example: "user@example.com" },
                        password: { type: "string", example: "Password123!" },
                        college: { type: "string", example: "ABC College" },
                        department: { type: "string", example: "CSE" }
                    }
                }
            }
        }
    },
    apis: [__filename]
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @openapi
 * /:
 *   get:
 *     summary: Health check endpoint
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: Backend is running
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 */
app.get("/", (req, res) => {
    res.send("AI Study Planner Backend Running");
});

/* ---------------- DATABASE CONNECTION ---------------- */

mongoose
    .connect(
        "mongodb://kiruthikak2024_db_user:kiruthika281007@ac-yzhrevx-shard-00-00.umashc1.mongodb.net:27017,ac-yzhrevx-shard-00-01.umashc1.mongodb.net:27017,ac-yzhrevx-shard-00-02.umashc1.mongodb.net:27017/aiStudyPlanner?ssl=true&replicaSet=atlas-af77v9-shard-0&authSource=admin&appName=Cluster0"
    )
    .then(() => {
        console.log("MongoDB Connected");
    })
    .catch((err) => {
        console.log("Database Error");
        console.log(err);
    });

/**
 * @openapi
 * /create-task:
 *   post:
 *     summary: Create a new study task
 *     tags:
 *       - Tasks
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Task'
 *     responses:
 *       201:
 *         description: Task created successfully
 *       500:
 *         description: Server error
 */
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

/**
 * @openapi
 * /tasks:
 *   get:
 *     summary: Get all tasks
 *     tags:
 *       - Tasks
 *     responses:
 *       200:
 *         description: List of tasks
 *       500:
 *         description: Server error
 */
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

/**
 * @openapi
 * /task/{id}:
 *   get:
 *     summary: Get a task by ID
 *     tags:
 *       - Tasks
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task found
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 */
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

/**
 * @openapi
 * /update-task/{id}:
 *   put:
 *     summary: Update a task by ID
 *     tags:
 *       - Tasks
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Task'
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 */
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

/**
 * @openapi
 * /delete-task/{id}:
 *   delete:
 *     summary: Delete a task by ID
 *     tags:
 *       - Tasks
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 */
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

/**
 * @openapi
 * /signup:
 *   post:
 *     summary: Create a new user account
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: Signup successful
 *       400:
 *         description: User already exists
 *       500:
 *         description: Server error
 */
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

/**
 * @openapi
 * /login:
 *   post:
 *     summary: Login a user
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: Password123!
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid password
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: "User Not Found"
            });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

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
