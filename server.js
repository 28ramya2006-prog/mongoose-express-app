
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const app = express();

const port = process.env.PORT || 8000;
const mongoUri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME;

app.use(express.json());

// Schema
const movieSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    director: {
        type: String
    },
    category: {
        type: String,
        required: true
    },
    year: {
        type: Number,
        required: true
    }
});

// Model
const Movie = mongoose.model("Movie", movieSchema);

// 1. Create Movie
app.post("/api/v1/movies", async (req, res) => {
    try {
        const result = await Movie.create(req.body);

        res.status(201).json({
            message: "Movie created successfully",
            data: result
        });
    } catch (err) {
        console.error("Movie creation error:", err.message);

        res.status(500).json({
            message: "Movie creation failed",
            error: err.message
        });
    }
});

// 2. Read All Movies or Filter by Category
app.get("/api/v1/movies", async (req, res) => {
    try {
        const { category } = req.query;
        const query = category ? { category } : {};

        const result = await Movie.find(query);

        res.status(200).json({
            message: "Movies fetched successfully",
            data: result
        });
    } catch (err) {
        console.error("Movie fetch error:", err.message);

        res.status(500).json({
            message: "Movie fetch failed",
            error: err.message
        });
    }
});

// 3. Read Movie by ID
app.get("/api/v1/movies/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid movie ID"
            });
        }

        const result = await Movie.findById(id);

        if (!result) {
            return res.status(404).json({
                message: "Movie not found"
            });
        }

        res.status(200).json({
            message: "Movie details fetched successfully",
            data: result
        });
    } catch (err) {
        console.error("Movie fetch error:", err.message);

        res.status(500).json({
            message: "Movie fetch failed",
            error: err.message
        });
    }
});

// 4. Update Movie by ID
app.put("/api/v1/movies/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid movie ID"
            });
        }

        const result = await Movie.findByIdAndUpdate(
            id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!result) {
            return res.status(404).json({
                message: "Movie not found"
            });
        }

        res.status(200).json({
            message: "Movie details updated successfully",
            data: result
        });
    } catch (err) {
        console.error("Movie update error:", err.message);

        res.status(500).json({
            message: "Movie update failed",
            error: err.message
        });
    }
});

// 5. Delete Movie by ID
app.delete("/api/v1/movies/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid movie ID"
            });
        }

        const result = await Movie.findByIdAndDelete(id);

        if (!result) {
            return res.status(404).json({
                message: "Movie not found"
            });
        }

        res.status(200).json({
            message: "Movie details deleted successfully",
            data: result
        });
    } catch (err) {
        console.error("Movie deletion error:", err.message);

        res.status(500).json({
            message: "Movie deletion failed",
            error: err.message
        });
    }
});

// Connect to MongoDB and start server
async function startServer() {
    try {
        if (!mongoUri) {
            throw new Error("MONGO_URI is missing in .env");
        }

        await mongoose.connect(mongoUri, {
            dbName: dbName
        });

        console.log("Connected to MongoDB");

        app.listen(port, () => {
            console.log(`Server is running at http://localhost:${port}`);
        });
    } catch (err) {
        console.error("Server startup or MongoDB connection error:", err.message);
    }
}

startServer();
