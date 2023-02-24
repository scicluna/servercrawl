//CLASS IMPORTS
import { Player } from "./classes/player.js"
import { Item } from "./classes/item.js"
import { routeRooms, routeTreasure, routeMonsters, generateTreasure, classedTreasure } from "./classes/route.js"

//Testing
console.log(routeRooms)
console.log(routeMonsters)
console.log(routeTreasure)

//DOM SELECTION
const contentArea = document.querySelector(".gamecontent")

//KEY GLOBAL VARIABLES
let pointer = 0 //keeps track of the current room

//Handle Inventory/Stats for Player
const hero = new Player("Hero", 20, 2, 0)

//handles game initialization
delve()

//Route Gameplay to Either Battle or Peace
function delve(){
    console.log(hero)
    contentArea.innerHTML = ''
    if (routeRooms.route()[pointer] == undefined) endScreen()
    if (routeRooms.route()[pointer]?.fight) fightStart()
    if (routeRooms.route()[pointer]?.peace) peaceStart()
}

//Handle Gameplay (Battle)
function fightStart(){
    generateFightDivs()
    generatePlayerFightCard()
    generateMonsterFightCard()
    updateHp()
    initTarget()
    initFightOptions()
}

//generate fight-sequence divs
function generateFightDivs(){
    const enemyDiv = document.createElement("div")
    enemyDiv.classList.add("enemyspace")
    contentArea.append(enemyDiv)

    const playerDiv = document.createElement("div")
    playerDiv.classList.add("playerspace")
    contentArea.append(playerDiv)
}

//handles the player's side of the fight
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

//handles the monster side of the fight
function generateMonsterFightCard(){
    const currentMonsters = routeMonsters.route()[pointer]
    
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

//handles the targetting mechanic
function initTarget(){
    const monsterSprites = document.querySelectorAll(".monsterSprite")

    monsterSprites.forEach(sprite=>{
        sprite.classList.remove("target")
        sprite.removeEventListener("click", newTarget)
    })

    for (let [i, monster] of routeMonsters.route()[pointer].entries()){
        if (monster.isAlive()) {
            monsterSprites[i].classList.add("target")
            break;
        }
    }
    
    monsterSprites.forEach((sprite, i)=>{
        if (!routeMonsters.route()[pointer][i].isAlive()) return
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

//turns on the buttons for the player options
function initFightOptions(){
    const playerOptions = document.querySelectorAll(".playerOption")
    
    playerOptions.forEach(option => {
        option.addEventListener("click", handleOption)
    })
}

//handles the fight option click
function handleOption(e){
    switch(e.target.innerText){
        case "ATK": handleAtk()
        break;
        case "ITM": handleItm()
        break;
        default: break;
    }
}

//Animation work later... for now just handles basic attacks
function handleAtk(){
    const monsterSprites = document.querySelectorAll(".monsterSprite")
    let target;
    monsterSprites.forEach((sprite,i)=>{
        if (sprite.classList.contains("target")){
            target = routeMonsters.route()[pointer][i]
        } 
    })
    hero.attackEnemy(target)
    updateHp()
    checkVictory()
    if (routeMonsters.route()[pointer] != null) monsterRetaliation()
}

//updates the hp bars for both the player and the monsters
function updateHp(){
    const monsterSprites = document.querySelectorAll(".monsterSprite")
    const monsterHealths = document.querySelectorAll(".monsterHealth")
    const playerHealth = document.querySelector(".playerHealth")
    const monsters = routeMonsters.route()[pointer]
    
    monsterHealths.forEach((health, i) => {
        if (monsters[i].isAlive()){
            health.innerText = `${monsters[i].hp}/${monsters[i].maxHp}`
            health.style.setProperty("--hpfill", `${(monsters[i].hp/monsters[i].maxHp)*100}%`)
        } else {
            health.innerText = `0/${monsters[i].maxHp}`
            health.style.setProperty("--hpfill", 0)
            if (monsterSprites[i].classList.contains("target")) initTarget()
        }
    })
    if (hero.isAlive()){
        playerHealth.innerText = `${hero.hp}/${hero.maxHp}`
        playerHealth.style.setProperty("--hpfill", `${(hero.hp/hero.maxHp)*100}%`)
    } else {
        playerHealth.innerText = `0/${hero.maxHp}`
        playerHealth.style.setProperty("--hpfill", 0)
    }
    
}

//checks for the current status of all of the monsters -- should probably use a method for the monster
function checkVictory(){
    const monsters = routeMonsters.route()[pointer]
    let deathCount = 0

    monsters.forEach(monster=>{
        if (monster.hp <= 0) deathCount++
    })
    if (deathCount == monsters.length) {
        console.log("VICTORY")
        lootRoom()
        pointer++
        delve()
    }
    if (hero.hp <= 0){
        console.log("DEFEAT")
    }
}

//Animation work later... but for now it handles basic monster retaliation
function monsterRetaliation(){
    const monsters = routeMonsters.route()[pointer]

    monsters.forEach(monster => {
        if (monster.isAlive()) monster.attack(hero)
    })
    updateHp()
    checkVictory()
}

//generates the item menu and gives them functionality
function handleItm(){
    const playerItem = document.querySelector(".playerItem")
    playerItem.removeEventListener("click", handleOption)

    if(document.querySelectorAll(".itemcontainer").length > 0) document.querySelectorAll(".itemcontainer").forEach(container=>container.remove())

    const itemContainer = document.createElement("div")
    itemContainer.classList.add("itemcontainer")


    hero.openInventory().forEach(item=>{
        const thing = document.createElement("div")
        thing.innerText = item?.name || `gp ${hero.gp}`
        thing.item = item
        thing.classList.add("thing")
        thing.addEventListener("click", itemOptions)
        itemContainer.appendChild(thing)
    })

    contentArea.append(itemContainer)
    playerItem.addEventListener("click", closeInventory)
}
//handles the closing of the item inventory
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
//handles the use of specifically healing items
function useHealingConsumable(item){
    if (hero.hp + parseInt(item.heal) < hero.maxHp) {
        hero.hp += parseInt(item.heal)
    } else hero.hp = hero.maxHp
    hero.consumeItem(item)
    updateHp()
    closeInventory()
    if (routeMonsters.route()[pointer] != null) monsterRetaliation()
}

//handles looting a room after a fight encounter -- just adding 1 gp per monster killed right now, but will probably be a more reasonable value eventually
function lootRoom(){
    routeTreasure.route()[pointer].forEach(treasure=>{
        hero.lootItem(treasure)
    })
    routeMonsters.route()[pointer].forEach(monster=>{
        hero.gp++
    })
}

//Handle Gameplay (Peace) 
function peaceStart(){
    initPeaceType()
}

//runs a peace function depending on its type
function initPeaceType(){
    const type = routeRooms.route()[pointer].peace.encounter.type
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

//initializes dialogue encounters
function initDialogue(){
    generateDescription()
    generateOptions()
    initOptions(handleDialogueOption)
}
//handles peace descriptions
function generateDescription(){
    const description = routeRooms.route()[pointer].peace.encounter.description
    
    const peaceBlock = document.createElement("div")
    peaceBlock.classList.add("peaceblock")

    const peaceDescription = document.createElement("div")
    peaceDescription.classList.add("peacedescription")
    peaceDescription.innerText = description

    peaceBlock.append(peaceDescription)
    contentArea.append(peaceBlock)
}
//handles peace options
function generateOptions(){
    const options = routeRooms.route()[pointer].peace.encounter.options

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
//initializes the peace options and passes in the appropriate onclick function
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

//handles shop option functionality
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

//handles event button functionality - JSON generator for this is still broken
function handleEvent(e){
    const event = routeRooms.route()[pointer].peace.encounter
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
//ADD MORE MONSTER VARIETY
//GIVE MONSTERS "SPECIAL" ATTACKS
//ITEM ACQUIRED MESSAGE
//PAUSE BETWEEN ROOMS (CAN CHECK INVENTORY AND STUFF) // "NEXT" CARD
//MORE OF EVERYTHING
//TWEEK NUMBERS
//FILE RESTRUCTURE (MORE JS FILES)
//BOSS FIGHT 