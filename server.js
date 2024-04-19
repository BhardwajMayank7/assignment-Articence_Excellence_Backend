const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");

const app = express();
const PORT = 3001;

mongoose
  .connect("mongodb://localhost:27017/csv_upload")
  .then(() => console.log("Connection to mongoose is successful"))
  .catch((err) => console.log("Connection to mongoose error:", err));

const Csv = mongoose.model("Csv", {
  Region: String,
  Country: String,
  "Item Type": String,
  "Fiscal Year": Number,
  "Sales Channel": String,
  "Order Priority": String,
  "Order Date": String,
  "Order ID": { type: Number, unique: true },
  "Ship Date": String,
  "Units Sold": Number,
  "Unit Price": Number,
  "Unit Cost": Number,
  "Total Revenue": Number,
  "Total Cost": Number,
  "Total Profit": Number,
  Email: String,
});

app.post("/uploads", async (req, res) => {
  try {
    const { path } = req.file;

    const stream = fs.createReadStream(path);
    const csvData = [];

    Csv.parseStream(stream, { headers: true })
      .on("data", async (row) => {
        csvData.push(row);
      })
      .on("end", async () => {
        try {
          await Csv.insertMany(csvData);
          res.json({ message: "File uploaded successfully" });
        } catch (error) {
          console.error("Error saving CSV data:", error);
          res.status(500).json({ error: "Internal server error" });
        }
      });
  } catch (error) {
    console.error("Error uploading the file: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
});
