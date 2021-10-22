const express = require("express");
const app = express();
const cors = require('cors');
const multer = require('multer');
const form = multer()
const jwt = require('jsonwebtoken')
const router = require('./routes/index')
const passport = require('./middlewares/passport')
// const session = require('cookie-session')
    //const cloudinary = require("multer-storage-cloudinary");
    //const upload = multer({ dest: 'uploads/' });

const port = process.env.PORT || 5050;

// app.use(session({
//     name : "kas-E-cookie",
//     keys : ["secretAja", "secretkedua"]
// }))
app.use(passport.initialize())
// app.use(passport.session())


app.use(cors());
app.use(form.array())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//app.use(upload.array())
app.use('/api/v1', router)

app.get("/", (req, res) => {
    res.json({
        message: "server running in",
        serverTime: new Date()
    })
});
app.get('*', (req, res) => {
    res.status(404).send("Page Not Found")
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})