const express = require("express");
const mysql = require("mysql2/promise");

const app = express();

app.use(express.json());

let db;

async function connectDatabase() {

    if (!process.env.DB_HOST) {
        console.log("Database not configured");
        return;
    }

    db = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || "ordering",
        connectionLimit: 5
    });

    try {
        await db.query("SELECT 1");
        console.log("Database connected");
    } catch (error) {
        console.error("Database connection failed:", error.message);
    }
}

app.get("/health", (req, res) => {
    res.status(200).send("Backend healthy");
});

app.get("/api/products", async (req, res) => {

    if (db) {

        try {

            const [rows] = await db.query(
                "SELECT * FROM products"
            );

            return res.json(rows);

        } catch (error) {

            console.error(error);

        }
    }

    res.json([
        {
            id: 1,
            name: "Burger",
            price: 150
        },
        {
            id: 2,
            name: "Pizza",
            price: 250
        },
        {
            id: 3,
            name: "Biryani",
            price: 200
        }
    ]);
});

app.post("/api/orders", async (req, res) => {

    if (db) {

        try {

            const [result] = await db.query(
                "INSERT INTO orders (product_id, status) VALUES (?, ?)",
                [req.body.productId, "CONFIRMED"]
            );

            return res.json({
                message: "Order placed successfully",
                orderId: result.insertId
            });

        } catch (error) {

            console.error(error);

        }
    }

    res.json({
        message: "Order placed successfully",
        orderId: 1001
    });
});

const PORT = 8080;

app.listen(PORT, async () => {

    console.log(`Backend running on ${PORT}`);

    await connectDatabase();

});
