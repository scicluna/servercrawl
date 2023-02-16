import { Player } from "./classes/player.js"
import { Monster } from "./classes/monster.js"
import { Item } from "./classes/item.js"

const contentArea = document.querySelector(".gamecontent")
const ROUTELENGTH = 10
let route; // going to create an array of objects that detail the rooms/encounters
let routeMonsters;
let pointer = 0

async function init(){
    await rooms()
    await monsters()
    await treasure()
    delve()
}
init()


//Generate Rooms
async function rooms(){
    const rooms = await generateRooms(ROUTELENGTH)
    const encounteredRooms = randomEncounter(rooms) //creates an array of ious (promises)
    const finalRooms = await Promise.all(encounteredRooms) // resolves all of the promises
    route = finalRooms
    console.log(route)
}

async function generateRooms(num){
    const generatedRooms = []
    const response = await fetch('/api/rooms')
    const roomJson = await response.json()
    for (let i=0; i<num; i++){
        const randomNumber = rando(0, roomJson.length-1)
        const newRoom = roomJson[randomNumber]
        generatedRooms.push(newRoom)
    }
    return generatedRooms
}

function randomEncounter(rooms){
    const roomsWithEncounters = rooms.map(room=>{
        const randomEncounter = rando(0, 100)
        if (randomEncounter <= parseInt(room.room.battlePercent)) {
            return addEncounter(room, "fight")
        } else{
            return addEncounter(room, "peace")
        }
    })
    return roomsWithEncounters
}

async function addEncounter(room, type){
    const response = await fetch(`/api/encounters/${type}`)
    const json = await response.json()
    const randomIndex = rando(0, json.length-1)

    return {...room, [type]: json[randomIndex]} //async functions return promises
}

//Handle Inventory/Stats for Player
const hero = new Player("Hero", 20, 2, 0)

//Handle Monster Generation (array of monster objects based on peace/fight from route and snagged from the database... and converted to monster class?)
async function monsters(){
    const monsters = generateMonsters()
    const formattedMonsters = await jsonMonsters(monsters)
    const finalMonsters = classedMonsters(formattedMonsters)
    routeMonsters = finalMonsters
    console.log(routeMonsters)
}

function generateMonsters(){
    const generatedMonsters = []
    route.forEach(room=>{
        const monsters = room.fight?.encounter.monsters
        generatedMonsters.push(monsters)
    })
    return generatedMonsters
}

async function jsonMonsters(monsters){ //transform arrays of strings into arrays of monster objects
    const response = await fetch('/api/monsters')
    const monstersJson = await response.json()

    const mappedMonsters = monsters.map(monstergroup => {
        if (monstergroup == null) return null
        const groupedObjects = monstergroup.map(monster=>{
            let object;
            monstersJson.forEach(json => {
                if (json.monster.name === monster){
                    object = json.monster
                }
            })
            return object
        })
        return groupedObjects
    })
    return mappedMonsters
}

function classedMonsters(monsterarray){
    const classyMonsters = monsterarray.map(monstergroup=>{
        if (monstergroup == null) return null
        const monsterGroupWithClasses = monstergroup.map(monster=>{
            return new Monster(monster?.name, monster?.hp, monster?.atk, monster?.def, monster?.img)
        })
        return monsterGroupWithClasses
    })
    return classyMonsters
}

//Handle Treasure Generation (array of treasure objects snagged from the database... and converted to item class?)
async function treasure(){
    const treasureParams = generateTreasureParams()
    const generatedTreasure = await generateTreasure(treasureParams)
    const finalTreasure = classedTreasure(generatedTreasure)

    console.log(finalTreasure)
}

function generateTreasureParams(){
    const generatedTreasure = []
    route.forEach(room=>{
        const rarity = room.fight?.encounter.treasureRarity
        const quantity = room.fight?.encounter.treasureAmount
        if (rarity && quantity) {generatedTreasure.push({rarity, quantity})}
        else generatedTreasure.push(null)
    })
    return generatedTreasure
}

async function generateTreasure(params){
    const response = await fetch('/api/treasure')
    const treasureJson = await response.json()

    const jsonItems = params.map(param=>{
        if (param == null) return null
        const {rarity, quantity} = param
        const drops = []
        for (let i=0; i<quantity; i++){
            treasureJson.forEach(json => {
                if (rarity == json.item.itemRarity){
                    drops.push(json.item)
                }
            })
        }
        return drops
    })
    return jsonItems
}

function classedTreasure(arrayOfArrays){
    const classedItems = arrayOfArrays.map(jsonarray=>{
        if(jsonarray == null) return null
        const classifedItems = jsonarray.map(json=>{
            return new Item(json?.itemName, json?.itemType, json?.itemRarity, json?.itemAtk, json?.itemDef, json?.itemDmg, json?.itemHeal, json?.itemStatus)
        })
        return classifedItems
    })
    return classedItems
}
//Route Gameplay to Either Battle or Peace
function delve(){
    if (route[pointer].fight) fightStart()
    if (route[pointer].peace) peaceStart()
}

//Handle Gameplay (Battle)
function fightStart(){
    generateFightUi()
}

function generateFightUi(){
    
}

//Handle Gameplay (Peace) 
function peaceStart(){
    console.log("peace")
}
