const express = require("express")
const router = express.Router()
const encounters = require("./encounters")
const monsters = require("./monsters")
const rooms = require("./rooms")
const treasure = require("./treasure")

router.get('/', (req, res)=>{
    res.send("Oh, a clever dungeoneer aren't you? There's nothing here.")
})

router.post('/', (req, res)=> {
    res.send("The dungeon is closed to the likes of you.")
})

router.use('/encounters', encounters)
router.use('/monsters', monsters)
router.use('/rooms', rooms)
router.use('/treasure', treasure)

module.exports = router