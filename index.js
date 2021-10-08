const express = require("express");
const app = express();
const cors = require('cors');
const multer = require('multer');
const router = require('./routes')
const cloudinary = require("multer-storage-cloudinary");
const upload = multer({ dest: 'uploads/' });

const port = process.env.PORT || 5050;

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use('/api', router)

app.get("/", (req, res)=>{
    res.json({
        message:"server running",
        serverTime: new Date()
    })
});
app.get('*', (req, res ) => {
    res.status(404).send("Page Not Found")
});

app.listen(port, ()=>{
    console.log(`Server running on port ${port}`)
})
