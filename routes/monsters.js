//IMPORTS
const admin = require('../server')
const express = require("express")
const monsters = express.Router()
const fs = require("fs")
const monstersJSON = require('../db/monsters.json')

//simple get route to receive monstersJSON
monsters.get('/', (req, res)=>{
    console.log("Monsters are upon us!")
    res.json(monstersJSON)
})

//admin tool post route
monsters.post('/', (req, res)=>{
    //check for admin flag
    if (!admin) return
    //destructure variables
    const {name, atk, hp, def, img} = req.body
    //make sure all fields were filled out
    if (!name || !atk || !hp || !def || !img) return res.send("Cannot summon monster")

    const newMonster = 
    {
        id: monstersJSON.length, //.length instead of .length -1, because we haven't pushed it in yet
        monster: {
            name,
            atk,
            hp,
            def,
            img
        }
    }
    monstersJSON.push(newMonster)

    //update DB
    fs.writeFile("./db/monsters.json", JSON.stringify(monstersJSON, null, 4), (err)=>{
        if (err) throw err
       })
    res.json("A new monster has entered the dungeon")
})

//unimplemented delete route
monsters.delete('/:id', (req, res)=>{
    if(!admin) return

    let deleteIndex;
    monstersJSON.forEach((json, i)=>{
        if (req.params.id == json.id){
            deleteIndex = i
        }
    })
    if(deleteIndex === undefined) return res.send("ID does not exist")

    monstersJSON.splice(deleteIndex, 1)
    
    fs.writeFile("./db/monsters.json", JSON.stringify(monstersJSON, null, 4), (err)=>{
        if (err) throw err
       })
    
    res.send(monstersJSON)
})


module.exports = monsters