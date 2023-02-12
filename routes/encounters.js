const admin = require("../server")
const express = require("express")
const encounters = express.Router()
const fs = require("fs")
const encountersfightJSON = require("../db/encountersfight.json")
const encounterspeaceJSON = require("../db/encounterspeace.json")


//When encounters is fetched. Grab the encounters json
encounters.get('/fight', (req,res)=>{
    res.json(encountersfightJSON)
})
encounters.get('/peace', (req,res) => {
    res.json(encounterspeaceJSON)
})

//Posting tools to generate the server
encounters.post('/fight', (req, res)=>{
    if (!admin) return
    const {name, monsters, treasureType, treasureAmount} = req.body

    if (!name || !monsters || !treasureType || !treasureAmount) return res.send("Insufficient")

    const newFight = 
    {
        id: encountersfightJSON.length, //.length instead of .length -1, because we haven't pushed it in yet
        encounter: {
            name,
            monsters,
            treasureType,
            treasureAmount
        }
    }
    encountersfightJSON.push(newFight)

    fs.writeFile("./db/encountersfight.json", JSON.stringify(encountersfightJSON, null, 4), (err)=>{
        if (err) throw err
       })
    res.json(encountersfightJSON)
})

encounters.post('/peace', (req, res)=>{
    if (!admin) return
    const {name, type, options, shopInventory, description} = req.body

    if (!name || !type || !description) return res.send("Not enough")

    const newPeace =
    {
        id: encounterspeaceJSON.length,
        encounter: {
            name,
            type,
            options,
            shopInventory,
            description
        }
    }
    encounterspeaceJSON.push(newPeace)

    console.log(encounterspeaceJSON)

    fs.writeFile("./db/encounterspeace.json", JSON.stringify(encounterspeaceJSON, null, 4), (err)=>{
        if (err) throw err
       })
    res.json(encounterspeaceJSON)
})

encounters.delete('/fight/:id', (req, res) =>{
    if (!admin) return

    let deleteIndex;
    encountersfightJSON.forEach((json, i)=>{
        if (req.params.id == json.id){
            deleteIndex = i
        }
    })
    if(deleteIndex === undefined) return res.send("ID does not exist")

    encountersfightJSON.splice(deleteIndex, 1)
    
    fs.writeFile("./db/encountersfight.json", JSON.stringify(encountersfightJSON, null, 4), (err)=>{
        if (err) throw err
       })
    
    res.send(encountersfightJSON)
})

encounters.delete('/peace/:id', (req, res) =>{
    if (!admin) return

    let deleteIndex;
    encounterspeaceJSON.forEach((json, i)=>{
        if (req.params.id == json.id){
            deleteIndex = i
        }
    })
    if(deleteIndex === undefined) return res.send("ID does not exist")

    console.log(deleteIndex)

    encounterspeaceJSON.splice(deleteIndex, 1)
    
    fs.writeFile("./db/encounterspeace.json", JSON.stringify(encounterspeaceJSON, null, 4), (err)=>{
        if (err) throw err
       })
    
    res.send(encounterspeaceJSON)
})


module.exports = encounters