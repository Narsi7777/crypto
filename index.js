const schedule=require("node-schedule")
const fetchCryptoData=require("./fetchData")

const connectDB=require("./db")
const Crypto=require("./models/Crypto");
const express=require("express")
const app=express()
const cors = require('cors');
app.use(cors());

connectDB()
schedule.scheduleJob("0 */2 * * *",async()=>{
    console.log("Fetching data...");
    try {
        await fetchCryptoData();
        console.log("Data fetched successfullyyyyyy");
    } catch (error) {
        console.error("Error fetching data:", error.message);
    }
})

app.get("/stats", async (req, res) => {
    try {
        const { coin } = req.query;
        console.log("Received coin:", coin);

        if (!coin || !["bitcoin", "matic-network", "ethereum"].includes(coin)) {
            return res.status(400).json({
                error: "Invalid or coin is missing. Valid options are: bitcoin, matic-network, ethereum."
            });
        }
        const latestData = await Crypto.findOne({ coin }).sort({ timestamp: -1 });
        console.log("Latest data:", latestData);
        if (!latestData) {
            return res.status(404).json({ error: "No data found for the requested coin." });
        }
        res.json({
            price: latestData.price,
            marketCap: latestData.marketCap,
            "24hChange": latestData.changefor24hours
        });
    } catch (error) {
        console.log("Error in /stats API:", error); 
        res.status(500).json({ error: "Internal server error." });
    }
});


app.get("/deviation", async (req, res) => {
    try {
        const { coin } = req.query;
        if (!coin || !["bitcoin", "matic-network", "ethereum"].includes(coin)) {
            return res.status(400).json({
                error: "Invalid or missing 'coin' parameter. Valid options: 'bitcoin', 'matic-network', 'ethereum'."
            });
        }
        const records = await Crypto.find({ coin }).sort({ timestamp: -1 }).limit(100);
        if (records.length === 0) {
            return res.status(404).json({ error: "No data found for the requested coin." });
        }
        const prices = records.map((record) => record.price);
        const mean = prices.reduce((sum, price) => sum + price, 0) / prices.length;
        const variance = prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / prices.length;
        const standardDeviation = Math.sqrt(variance);
        res.json({ deviation: parseFloat(standardDeviation.toFixed(2)) });
    } catch (error) {
        console.error("Error in /deviation API:", error.message);
        res.status(500).json({ error: "Internal server error." });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});