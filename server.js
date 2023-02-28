//IMPORTS
const express = require("express")
const app = express()
const PORT = process.env.PORT || 3001;
const apiRouter = require("./routes/index")
const admin = false

//boilerplate express
app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(express.static('public'))

//get our index.html at root
app.get('/', (req, res) => {res.render('index')})

//allows other routes to access the admin flag variable
app.get('/admin', (req,res) => {res.json({admin})})

//use our routers
app.use("/api", apiRouter)

app.listen(PORT, ()=>{console.log(`RUNNING ON http://localhost:${PORT}`)})

module.exports = admin