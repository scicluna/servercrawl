const admin = require('../server')
const express = require("express")
const rooms = express.Router()
const fs = require("fs")
const roomsJSON = require('../db/rooms.json')

rooms.get('/', (req, res)=>{
    console.log("You look around at the room")
    res.json(roomsJSON)
})

rooms.post('/', (req, res)=>{
    if (!admin) return
    const {roomName, battlePercent, background} = req.body

    if (!roomName || !battlePercent || !background) return res.send("The room is still incomplete")

    const newRoom = 
    {
        id: roomsJSON.length, //.length instead of .length -1, because we haven't pushed it in yet
        room: {
            roomName,
            battlePercent,
            background,
        }
    }
    roomsJSON.push(newRoom)

    fs.writeFile("./db/rooms.json", JSON.stringify(roomsJSON, null, 4), (err)=>{
        if (err) throw err
       })
    console.log("A new room exists to find")
    res.json(roomsJSON)
})

rooms.delete('/:id', (req, res)=>{
    if(!admin) return

    let deleteIndex;
    roomsJSON.forEach((json, i)=>{
        if (req.params.id == json.id){
            deleteIndex = i
        }
    })
    if(deleteIndex === undefined) return res.send("ID does not exist")

    roomsJSON.splice(deleteIndex, 1)
    
    fs.writeFile("./db/rooms.json", JSON.stringify(roomsJSON, null, 4), (err)=>{
        if (err) throw err
       })
    
    res.send(roomsJSON)
})

module.exports = rooms