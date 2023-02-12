const admin = require('../server')
const express = require("express")
const monsters = express.Router()
const fs = require("fs")
const monstersJSON = require('../db/monsters.json')

monsters.get('/', (req, res)=>{
    console.log("Monsters are upon us!")
    res.json(monstersJSON)
})

monsters.post('/', (req, res)=>{
    if (!admin) return
    const {name, attacks, hp, armor, img} = req.body

    if (!name || !attacks || !hp || !armor || !img) return res.send("Cannot summon monster")

    const newMonster = 
    {
        id: monstersJSON.length, //.length instead of .length -1, because we haven't pushed it in yet
        monster: {
            name,
            attacks,
            hp,
            armor,
            img
        }
    }
    monstersJSON.push(newMonster)

    fs.writeFile("./db/monsters.json", JSON.stringify(monstersJSON, null, 4), (err)=>{
        if (err) throw err
       })
    console.log("A new monster has entered the dungeon")
    res.json(monstersJSON)
})

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