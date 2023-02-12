const express = require("express")
const router = express.Router()
const encounters = require("./encounters")

router.get('/', (req, res)=>{
    res.send("Oh, a clever dungeoneer aren't you? There's nothing here.")
})

router.post('/', (req, res)=> {
    res.send("The dungeon is closed to the likes of you.")
})

router.use('/encounters', encounters)
// router.use('/monsters', monstersJSON)
// router.use('/rooms', roomsJSON)
// router.use('/treasure', treasureJSON)

module.exports = router