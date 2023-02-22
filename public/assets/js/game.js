import { Player } from "./classes/player.js"
import { Monster } from "./classes/monster.js"
import { Item } from "./classes/item.js"

const contentArea = document.querySelector(".gamecontent")
const ROUTELENGTH = 10
let route; // going to create an array of objects that detail the rooms/encounters
let routeMonsters;
let routeTreasure;
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

//Handle Monster Generation
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
    routeTreasure = finalTreasure
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
    console.log(hero)
    contentArea.innerHTML = ''
    if (route[pointer] == undefined) endScreen()
    if (route[pointer]?.fight) fightStart()
    if (route[pointer]?.peace) peaceStart()
}

//Handle Gameplay (Battle)
function fightStart(){
    generateFightDivs()
    generatePlayerFightCard()
    updateHp()
    generateMonsterFightCard()
    initTarget()
    initFightOptions()
}

function generateFightDivs(){
    //Make enemy div
    const enemyDiv = document.createElement("div")
    enemyDiv.classList.add("enemyspace")
    contentArea.append(enemyDiv)
    //Make player div
    const playerDiv = document.createElement("div")
    playerDiv.classList.add("playerspace")
    contentArea.append(playerDiv)
}

function generatePlayerFightCard(){
    const playerCard = document.createElement("div")
    playerCard.classList.add("card")
    
    const playerSprite = document.createElement("img")
    playerSprite.src="../img/Hero.png"
    playerSprite.classList.add("playerSprite")
    
    const playerBody = document.createElement("div")
    playerBody.classList.add("card-body")

    const playerHealthShell = document.createElement ("div")
    playerHealthShell.classList.add("playerHealthShell")

    const playerHealth = document.createElement ("div")
    playerHealth.classList.add("playerHealth")
    playerHealth.innerText = `${hero.hp}/${hero.maxHp}`

    const playerOptions = document.createElement("div")
    playerOptions.classList.add("list-group")
    playerOptions.classList.add("playeroptions")

    const playerAttack = document.createElement("h3")
    playerAttack.classList.add("list-group-item")
    playerAttack.classList.add("playerAttack")
    playerAttack.classList.add("playerOption")
    playerAttack.innerText = "ATK"

    const playerItem = document.createElement("h3")
    playerItem.classList.add("list-group-item")
    playerItem.classList.add("playerItem")
    playerItem.classList.add("playerOption")
    playerItem.innerText = "ITM"

    playerOptions.append(playerAttack)
    playerOptions.append(playerItem)
    playerHealthShell.append(playerHealth)
    playerBody.append(playerHealthShell)
    playerBody.append(playerOptions)
    playerCard.append(playerSprite)
    playerCard.append(playerBody)
    document.querySelector(".playerspace").append(playerCard)
}

function generateMonsterFightCard(){
    const currentMonsters = routeMonsters[pointer]
    
    currentMonsters.forEach(monster=>{
        const monsterCard = document.createElement("div")
        monsterCard.classList.add("card")
        
        const monsterSprite = document.createElement("img")
        monsterSprite.src=`../img/${monster.img}`
        monsterSprite.classList.add("monsterSprite")

        const monsterHealthShell = document.createElement ("div")
        monsterHealthShell.classList.add("monsterHealthShell")

        const monsterHealth = document.createElement ("div")
        monsterHealth.classList.add("monsterHealth")
        monsterHealth.innerText = `${monster.hp}/${monster.maxHp}`

        monsterHealthShell.append(monsterHealth)
        monsterCard.append(monsterSprite)
        monsterCard.append(monsterHealthShell)
        document.querySelector(".enemyspace").append(monsterCard)
    })
}

function initTarget(){
    const monsterSprites = document.querySelectorAll(".monsterSprite")
    monsterSprites[0].classList.add("target")
    
    monsterSprites.forEach(sprite=>{
        sprite.addEventListener("click", newTarget)
    })
}

function newTarget(e){
    const monsterSprites = document.querySelectorAll(".monsterSprite")
    monsterSprites.forEach(sprite=>{
        sprite.classList.remove("target")
    })
    e.target.classList.add("target")
}

function initFightOptions(){
    const playerOptions = document.querySelectorAll(".playerOption")
    
    playerOptions.forEach(option => {
        option.addEventListener("click", handleOption)
    })
}

function handleOption(e){
    switch(e.target.innerText){
        case "ATK": handleAtk()
        break;

        case "ITM": handleItm()
        break;

        default: break;
    }
}

//Animation work later...
function handleAtk(){
    const monsterSprites = document.querySelectorAll(".monsterSprite")
    let target;
    monsterSprites.forEach((sprite,i)=>{
        if (sprite.classList.contains("target")){
            target = routeMonsters[pointer][i]
        } 
    })
    hero.attackEnemy(target)
    updateHp()
    checkVictory()
    if (routeMonsters[pointer] != null) monsterRetaliation()
}

function updateHp(){
    const monsterHealths = document.querySelectorAll(".monsterHealth")
    const playerHealth = document.querySelector(".playerHealth")
    const monsters = routeMonsters[pointer]
    
    monsterHealths.forEach((health, i) => {
        if (monsters[i].hp > 0){
            health.innerText = `${monsters[i].hp}/${monsters[i].maxHp}`
            health.style.setProperty("--hpfill", `${(monsters[i].hp/monsters[i].maxHp)*100}%`)
        } else {
            health.innerText = `0/${monsters[i].maxHp}`
            health.style.setProperty("--hpfill", 0)
        }
    })

    if (hero.hp > 0){
        playerHealth.innerText = `${hero.hp}/${hero.maxHp}`
        playerHealth.style.setProperty("--hpfill", `${(hero.hp/hero.maxHp)*100}%`)
    } else {
        playerHealth.innerText = `0/${hero.maxHp}`
        playerHealth.style.setProperty("--hpfill", 0)
    }
}

function checkVictory(){
    const monsters = routeMonsters[pointer]
    let deathCount = 0

    monsters.forEach(monster=>{
        if (monster.hp <= 0) deathCount++
    });

    if (deathCount == monsters.length) {
        console.log("VICTORY")
        pointer++
        lootRoom()
        delve()
    }

    if (hero.hp <= 0){
        console.log("DEFEAT")
    }
}

//Animation work later...
function monsterRetaliation(){
    const monsters = routeMonsters[pointer]

    monsters.forEach(monster => {
        if (monster.isAlive()) monster.attack(hero)
    })

    updateHp()
    checkVictory()
}

function handleItm(){
    const playerItem = document.querySelector(".playerItem")
    playerItem.removeEventListener("click", handleOption)

    if(document.querySelectorAll(".itemcontainer").length > 0) document.querySelectorAll(".itemcontainer").forEach(container=>container.remove())

    const itemContainer = document.createElement("div")
    itemContainer.classList.add("itemcontainer")

    const itemList = document.createElement("ul")
    itemList.classList.add("itemlist")

    hero.openInventory().forEach(item=>{
        const thing = document.createElement("li")
        thing.innerText = item?.name || `gp ${hero.gp}`
        thing.item = item
        thing.classList.add("thing")
        thing.addEventListener("click", itemOptions)
        itemList.appendChild(thing)
    })

    itemContainer.appendChild(itemList)
    contentArea.append(itemContainer)
    playerItem.addEventListener("click", closeInventory)
}

function closeInventory(){
    const playerItem = document.querySelector(".playerItem")
    if(document.querySelectorAll(".itemcontainer").length > 0) document.querySelectorAll(".itemcontainer").forEach(container=>container.remove())
    playerItem.removeEventListener("click", closeInventory)
    playerItem.addEventListener("click", handleOption)
}

//add more options and functions later, all handled near this block
function itemOptions(e){
    const item = e.target.item

    switch(item.type){
        case 'healingConsumable': useHealingConsumable(item)
        break;

        default: break;
    }
}

function useHealingConsumable(item){
    if (hero.hp + parseInt(item.heal) < hero.maxHp) {
        hero.hp += parseInt(item.heal)
    } else hero.hp = hero.maxHp
    hero.consumeItem(item)
    updateHp()
    closeItemMenu()
    if (routeMonsters[pointer] != null) monsterRetaliation()
}

function closeItemMenu(){
    const itemContainer = document.querySelector(".itemcontainer")
    itemContainer.remove()
}

function lootRoom(){
    if (routeTreasure[pointer] == null) return
    routeTreasure[pointer].forEach(treasure=>{
        hero.lootItem(treasure)
    })
    routeMonsters.forEach(monster=>{
        hero.gp++
    })
}

//Handle Gameplay (Peace) 
function peaceStart(){
    initPeaceType()
}

function initPeaceType(){
    const type = route[pointer].peace.encounter.type
    
    switch(type){
        case "dialogue": initDialogue()
        break;

        case "shop": initShop()
        break;

        case "event": initEvent()
        break;

        default: break;
    }
}

function initDialogue(){
    generateDescription()
    generateOptions()
    initOptions(handleDialogueOption)
}

function generateDescription(){
    const description = route[pointer].peace.encounter.description
    
    const peaceBlock = document.createElement("div")
    peaceBlock.classList.add("peaceblock")

    const peaceDescription = document.createElement("div")
    peaceDescription.classList.add("peacedescription")
    peaceDescription.innerText = description

    peaceBlock.append(peaceDescription)
    contentArea.append(peaceBlock)
}

function generateOptions(){
    const options = route[pointer].peace.encounter.options

    const optionsDiv = document.createElement("div")
    optionsDiv.classList.add("optionsdiv")

    options.forEach(option=>{
        const optionDiv = document.createElement("div")
        optionDiv.classList.add("optiondiv")
        optionDiv.innerText = option
        optionsDiv.append(optionDiv)
    })

    document.querySelector(".peaceblock").append(optionsDiv)
}

function initOptions(eventFunction){
    const options = document.querySelectorAll(".optiondiv")

    options.forEach(option=>{
        option.addEventListener("click", eventFunction)
    })
}

//Looting items somehow depending on dialogue option, but only if its an item. I don't know how to be honest. Maybe generate them in our treasure gen?
async function handleDialogueOption(e){
    const response = await fetch("/api/treasure")
    const treasureJson = await response.json()
    
    treasureJson.forEach(json=>{
        const jsI = json.item
        if(e.target.innerText.includes(jsI?.itemName)){
        hero.lootItem(new Item(jsI?.itemName, jsI?.itemType, jsI?.itemRarity, jsI?.itemAtk, jsI?.itemDef, jsI?.itemDmg, jsI?.itemHeal, jsI?.itemStatus))
        //add "you obtained a *" message here if they obtained an item for now, just console logging it
        console.log(`You have obtained a ${jsI.itemName}`)
        }
    })
    pointer++
    delve()
}

function initShop(){
    generateDescription()
    generateOptions()
    initOptions(handleShop)
}

async function handleShop(e){
    const response = await fetch("/api/treasure")
    const treasureJson = await response.json()

    treasureJson.forEach(json=>{
        const jsI = json.item
        if(e.target.innerText.includes(jsI?.itemName) && hero.gp >= jsI.value){
        hero.lootItem(new Item(jsI?.itemName, jsI?.itemType, jsI?.itemRarity, jsI?.itemAtk, jsI?.itemDef, jsI?.itemDmg, jsI?.itemHeal, jsI?.itemStatus, jsI?.value))
        //add "you obtained a *" message here if they obtained an item for now, just console logging it
        hero.gp -= jsI.value
        console.log(`You have obtained a ${jsI.itemName}`)
        }
        if (e.target.innerText.includes(jsI?.itemName) && hero.hp < jsI.value){
            console.log("NOT ENOUGH MONEY")
        }
    })
    pointer++
    delve()
}

//What to do... Basically events tied to basic functions that hurt, heal, or give loot or a combination. How do we make these events and tie em to encounters?
function initEvent(){
    generateDescription()
    generateOptions()
    initOptions(handleEvent)
}

function handleEvent(e){
    const event = route[pointer].peace.encounter
    const {options} = event // ["option 1", "option 2", ...]
    const {outcomes} = event // ["{dmg: 5}", "{heal: 5}""] // want to either deal damage or heal based on the object. // Must manually correct the JSON file for now
    
    options.forEach(async (option, i)=>{
        if(e.target.innerText == option){
            const {dmg=null, heal=null, lootQuality=null, lootQuantity=null} = outcomes[i] //All event attributes listed here  
            //All event attributes dealt with here
            if (dmg) hero.hp -= parseInt(dmg)
            if (heal) hero.hp += parseInt(heal)
            if (lootQuality && lootQuantity) {
                const generatedTreasure = await generateTreasure([{rarity: lootQuality, quantity: lootQuantity}])
                const finalTreasure = classedTreasure(generatedTreasure)
                hero.lootItem(finalTreasure)
            }
            hero.checkHp()
        }
    })
    pointer++
    delve()
}

function endScreen(){
    console.log("YOU WIN")
}


//TODO: 
//ADD END(WIN) CARD
//ADD DEFEAT CARD
//ADD BATTLE ANIMATIONS
//IMPLEMENT ALL ITEM TYPES AND CREATE TEST ITEMS FOR THEM
//MAJOR REFACTOR
//ADD MORE MONSTER VARIETY
//GIVE MONSTERS "SPECIAL" ATTACKS
//ITEM ACQUIRED MESSAGE
//PAUSE BETWEEN ROOMS (CAN CHECK INVENTORY AND STUFF) // "NEXT" CARD
//MORE OF EVERYTHING
//TWEEK NUMBERS
//FILE RESTRUCTURE (MORE JS FILES)
//BOSS FIGHT 