const express = require("express")
const app = express()
const PORT = process.env.port || 3001;
const apiRouter = require("./routes/index")
const admin = false

app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(express.static('public'))

app.get('/', (req, res) => {
    res.render('index')
})

app.use("/api", apiRouter)

app.listen(PORT, ()=>{
    console.log(`RUNNING ON http://localhost:${PORT}`)
})

module.exports = admin