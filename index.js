const express = require("express");
const app = express();
const cors = require('cors');
const multer = require('multer');
const form = multer()
const jwt = require('jsonwebtoken')
const router = require('./routes/index')
    //const cloudinary = require("multer-storage-cloudinary");
    //const upload = multer({ dest: 'uploads/' });

const port = process.env.PORT || 5050;

app.use(cors());
app.use(form.array())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//app.use(upload.array())
app.use('/api/v1', router)

app.get("/", (req, res) => {
    res.json({
        message: "server running",
        serverTime: new Date()
    })
});
app.get('*', (req, res) => {
    res.status(404).send("Page Not Found")
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})