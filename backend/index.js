const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb+srv://yasar:123@cluster0.jcd7o.mongodb.net/passkey?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => {
    console.log("Connected to DB");
  })
  .catch((error) => {
    console.error("Failed to connect:", error);
  });

app.post("/sendemail", async (req, res) => {
  const msg = req.body.msg;
  const emailList = req.body.emailList;

  console.log("Message:", msg);
  console.log("Email List:", emailList);

  // Create model
  const Credentials = mongoose.model("Credentials", {}, "bulkmail");

  try {
    const data = await Credentials.find();

    // Ensure we have credentials
    if (data.length === 0) {
      return res.status(500).send("No credentials found.");
    }

    const { user, pass } = data[0].toJSON();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user,
        pass, // Ensure this is correct, especially if using App Passwords
      },
    });

    // Check if emailList is an array and has elements
    if (!Array.isArray(emailList) || emailList.length === 0) {
      return res.status(400).send("Email list is required.");
    }

    let sentCount = 0;
    let errorCount = 0; // Track errors for reporting

    for (const email of emailList) {
      if (!email) continue; // Skip empty emails
      try {
        await transporter.sendMail({
          from: user, // Use the user from credentials
          to: email,
          subject: "A Bulkmail from Mail",
          text: msg,
        });
        console.log(`Email sent to ${email}`);
        sentCount++;
      } catch (err) {
        console.error(`Error sending email to ${email}:`, err.message);
        errorCount++;
      }
    }

    res.send({ success: true, sentCount, errorCount }); // Report results
  } catch (err) {
    console.error("Error finding credentials:", err.message);
    res.status(500).send("An error occurred while sending emails.");
  }
});

// Start the server
app.listen(5000, () => {
  console.log("Server started on port 5000");
});
