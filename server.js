const express = require("express")
const fs = require("fs")
const app = express()
const PORT = process.env.port || 3001;

app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(express.static('public'))

app.get('/', (req, res) => {
    res.render('index')
})

app.listen(PORT, ()=>{
    console.log(`RUNNING ON http://localhost:${PORT}`)
})