const admin = require('../server')
const express = require("express")
const treasure = express.Router()
const fs = require("fs")
const treasureJSON = require('../db/treasure.json')

treasure.get('/', (req, res)=>{
    console.log("Something glimmers within the dungeon's darkness")
    res.json(treasureJSON)
})

treasure.post('/', (req, res)=>{
    if (!admin) return
    const {itemName, itemType, itemRarity, itemAtk, itemDef, itemDmg, itemHeal, itemStatus, value} = req.body

    if (!itemName || !itemType || !itemRarity) return res.send("Unidentifiable")

    const newTreasure = 
    {
        id: treasureJSON.length, //.length instead of .length -1, because we haven't pushed it in yet
        item: {
            itemName,
            itemType,
            itemRarity,
            itemAtk,
            itemDef,
            itemDmg,
            itemHeal,
            itemStatus,
            value
        }
    }
    treasureJSON.push(newTreasure)

    fs.writeFile("./db/treasure.json", JSON.stringify(treasureJSON, null, 4), (err)=>{
        if (err) throw err
       })
    res.json("There is now more treasure to find")
})

treasure.delete('/:id', (req, res)=>{
    if(!admin) return

    let deleteIndex;
    treasureJSON.forEach((json, i)=>{
        if (req.params.id == json.id){
            deleteIndex = i
        }
    })
    if(deleteIndex === undefined) return res.send("ID does not exist")

    treasureJSON.splice(deleteIndex, 1)
    
    fs.writeFile("./db/treasure.json", JSON.stringify(treasureJSON, null, 4), (err)=>{
        if (err) throw err
       })
    
    res.send(treasureJSON)
})

module.exports = treasure