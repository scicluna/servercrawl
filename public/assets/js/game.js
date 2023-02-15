import { Player } from "./classes/player.js"
import { Monster } from "./classes/monster.js"
import { items } from "./classes/item.js"
const [potion, knife] = items

const contentArea = document.querySelector(".gamecontent")
const ROUTELENGTH = 10
let route; // going to create an array of objects that detail the rooms/encounters
let routeMonsters;
let pointer = 0

async function init(){
    await rooms()
    await monsters()
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
    const monsters = generateMonsters(ROUTELENGTH)
    const formattedMonsters = await jsonMonsters(monsters)
    const finalMonsters = classedMonsters(formattedMonsters)
    console.log(finalMonsters)
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
        if (monstergroup == null) return
        const monsterGroupWithClasses = monstergroup.map(monster=>{
                return new Monster(monster?.name, monster?.hp, monster?.atk, monster?.def, monster?.img)
        })
        return monsterGroupWithClasses
    })
    return classyMonsters
}

//Handle Treasure Generation (array of treasure objects snagged from the database... and converted to item class?)

//Handle Gameplay (Battle)

//Handle Gameplay (Peace) Dialogue

//Handle Gameplay (Peace) Shop

