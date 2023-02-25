const ROUTELENGTH = 10
import { Monster } from "./monster.js"
import { Item } from "./item.js"

class Route{
    constructor(type, routeArray){
        this.len = ROUTELENGTH
        this.type = type
        this.routeArray = routeArray
    }

    route(){
        return this.routeArray
    }
}

//ASYNC CREATION OF OUR ROUTES, THEN EXPORTED INTO OUR GAME.JS
//ALL BELOW ARE HELPER FUNCTIONS
export const routeRooms = new Route("rooms", await rooms()); // going to create an array of objects that detail the rooms/encounters
export const routeMonsters = new Route("monsters", await monsters()); // going to create an array of objects that detail the monsters encountered
export const routeTreasure = new Route("treasure", await treasure()); // going to create an array of objects that detail the random treasure drops


//Generate Rooms
async function rooms(){
    const rooms = await generateRooms(ROUTELENGTH)
    const encounteredRooms = randomEncounter(rooms) //creates an array of ious (promises)
    const finalRooms = await Promise.all(encounteredRooms) // resolves all of the promises
    return finalRooms
}
//pushes our json rooms into an array
async function generateRooms(num){
    const response = await fetch('/api/rooms')
    const roomJson = await response.json()

    const generatedRooms = []
    for (let i=0; i<num; i++){
        const randomNumber = rando(0, roomJson.length-1)
        const newRoom = roomJson[randomNumber]
        generatedRooms.push(newRoom)
    }
    return generatedRooms
}
//calculates random encounters within our rooms
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
//Allows me to add an encounter based on its type
async function addEncounter(room, type){
    const response = await fetch(`/api/encounters/${type}`)
    const json = await response.json()
    const randomIndex = rando(0, json.length-1)

    return {...room, [type]: json[randomIndex]} //async functions return promises
}

//Handle Monster Generation
export async function monsters(){
    const monsters = generateMonsters()
    const formattedMonsters = await jsonMonsters(monsters)
    const finalMonsters = classedMonsters(formattedMonsters)
    return finalMonsters
}
//Creates an array of monster names
function generateMonsters(){
    const generatedMonsters = []

    routeRooms.route().forEach(room=>{
        const monsters = room.fight?.encounter.monsters
        generatedMonsters.push(monsters)
    })
    return generatedMonsters
}
//Calls from the monsters api route and replaces the array of arrays of monster names into arrays of arrays of objects
async function jsonMonsters(monsters){
    const response = await fetch('/api/monsters')
    const monstersJson = await response.json()

    const mappedMonsters = monsters.map(monstergroup => {
        if (monstergroup == null) return null
        const groupedObjects = monstergroup.map(monster=>{
            let object;
            monstersJson.forEach(json => {
                if (json.monster.name === monster) object = json.monster
            })
            return object
        })
        return groupedObjects
    })
    return mappedMonsters
}
//Takes the individual monster objects and transforms them using our Monster class into an array of arrays of monster objects
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

//handles treasure generation
export async function treasure(){
    const treasureParams = generateTreasureParams()
    const generatedTreasure = await generateTreasure(treasureParams)
    const finalTreasure = classedTreasure(generatedTreasure)
    return finalTreasure
}

//takes the treasure paramaters from the room objects and creates an array of arrays of parameters
function generateTreasureParams(){
    const generatedTreasure = []
    routeRooms.route().forEach(room=>{
        const rarity = room.fight?.encounter.treasureRarity
        const quantity = room.fight?.encounter.treasureAmount

        if (rarity && quantity) {generatedTreasure.push({rarity, quantity})}
        else generatedTreasure.push(null)
    })
    return generatedTreasure
}

//fetches from the treasure api and uses the parameters to randomly select items based on those parameters
export async function generateTreasure(params){
    const response = await fetch('/api/treasure')
    const treasureJson = await response.json()

    const jsonItems = params.map(param=>{
        if (param == null) return null
        const {rarity, quantity} = param
        
        const potentialDrops = []
        treasureJson.forEach(json => {
            if (rarity == json.item.itemRarity){
                potentialDrops.push(json.item)
            }
        })
        const drops = []
        for (let i=0; i<quantity; i++){
            const randomNumber = rando(0, potentialDrops.length-1)
            drops.push(potentialDrops[randomNumber])
        }
        return drops
    }) 
    return jsonItems
}

//uses the item JSONS to build out Item class objects
export function classedTreasure(arrayOfArrays){
    const classedItems = arrayOfArrays.map(jsonarray=>{
        if(jsonarray == null) return null
        const classifedItems = jsonarray.map(json=>{
            return new Item(json?.itemName, json?.itemType, json?.itemRarity, json?.itemAtk, json?.itemDef, json?.itemDmg, json?.itemHeal, json?.itemStatus)
        })
        return classifedItems
    })
    return classedItems
}
