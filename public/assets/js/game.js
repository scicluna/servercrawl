//CLASS IMPORTS
import { Player } from "./classes/player.js"
import { Item } from "./classes/item.js"
import { Monster } from "./classes/monster.js"
import { routeRooms, routeTreasure, routeMonsters, generateTreasure, classedTreasure } from "./classes/route.js"
import { playAnimation } from "./animations.js"

//Testing
console.log(routeRooms)
console.log(routeMonsters)
console.log(routeTreasure)

//DOM SELECTION
const contentArea = document.querySelector(".gamecontent")

//KEY GLOBAL VARIABLES
let pointer = 0 //keeps track of the current room

//Handle Inventory/Stats for Player
let hero = new Player("Hero", 20, 2, 0)

//handles game initialization
readyToDelve()

function readyToDelve(){
    contentArea.innerHTML = ''
    generateStatus()
    if (routeRooms.route()[pointer] == undefined) return endScreen("YOU HAVE BRAVED THE DUNGEON!\n CONGRATULATIONS!")

    const delveDiv = document.createElement("div")
    const delveTxt = document.createElement("h3")
    delveTxt.innerText = `Welcome to Room ${pointer+1}\nClick to delve deeper` 
    delveDiv.classList.add("delvediv")

    delveDiv.addEventListener("click", delve)
    delveDiv.append(delveTxt)
    contentArea.append(delveDiv)
}

//Route Gameplay to Either Battle or Peace
function delve(){
    console.log(hero)
    contentArea.innerHTML = ''
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
        monsterCard.classList.add("monstercard")
        
        const monsterSprite = document.createElement("div")
        monsterSprite.style.backgroundImage=`url(../img/${monster.img})`
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
    let targetSprite;
    monsterSprites.forEach((sprite,i)=>{
        if (sprite.classList.contains("target")){
            targetSprite = sprite
            target = routeMonsters.route()[pointer][i]
        } 
    })
    hero.attackEnemy(target)
    playAnimation(hero.checkBestWeapon(), targetSprite)
    updateHp()
    monsterRetaliation()
    checkVictory()
}

//updates the hp bars for both the player and the monsters
function updateHp(){
    const monsterSprites = document.querySelectorAll(".monsterSprite")
    const monsterHealths = document.querySelectorAll(".monsterHealth")
    const playerHealth = document.querySelector(".playerHealth")
    const monsters = routeMonsters.route()[pointer]
    
    if(!playerHealth) return

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
        setInterval(()=>{
            endScreen("YOU HAVE DIED!")
        }, 500)
        
    }
    
}

//checks for the current status of all of the monsters -- should probably use a method for the monster
function checkVictory(){
    const monsters = routeMonsters.route()[pointer]

    if (!monsters) return

    let deathCount = 0

    monsters.forEach(monster=>{
        if (monster.hp <= 0) deathCount++
    })
    if (deathCount == monsters.length) {
        console.log("VICTORY")
        lootRoom()
        pointer++
        readyToDelve()
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
    if (playerItem) playerItem.removeEventListener("click", handleOption)

    if(document.querySelectorAll(".itemcontainer").length > 0) document.querySelectorAll(".itemcontainer").forEach(container=>container.remove())

    const itemContainer = document.createElement("div")
    itemContainer.classList.add("itemcontainer")


    hero.openInventory().forEach(item=>{
        const thing = document.createElement("div")
        thing.innerText = item?.name || `gp ${hero.gp}`
        thing.item = item
        thing.classList.add("thing")
        if (playerItem) thing.addEventListener("click", itemOptions)
        itemContainer.appendChild(thing)
    })

    contentArea.append(itemContainer)
    if (playerItem) playerItem.addEventListener("click", closeInventory)
    else document.querySelector(".inventorybtn").addEventListener("click", closeInventory)
}
//handles the closing of the item inventory -- doubles for peacetime inventory closes. Super ugly code, i hate this.
function closeInventory(){
    const playerItem = document.querySelector(".playerItem")
    if(document.querySelectorAll(".itemcontainer").length > 0) document.querySelectorAll(".itemcontainer").forEach(container=>container.remove())
    if (playerItem) playerItem.removeEventListener("click", closeInventory)
    else document.querySelector(".inventorybtn").removeEventListener("click", closeInventory)
    if (playerItem) playerItem.addEventListener("click", handleOption)
    else document.querySelector(".inventorybtn").addEventListener("click", handleItm)
}
//add more options and functions later, all handled near this block
function itemOptions(e){
    const item = e.target.item

    switch(item.type){
        case 'healingConsumable': useHealingConsumable(item)
        break;
        case 'damageConsumable': useDamageConsumable(item)
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

function useDamageConsumable(item){
    const monsterSprites = document.querySelectorAll(".monsterSprite")
    const monsters = routeMonsters.route()[pointer]

    monsterSprites.forEach((monsterSprite, i) => {
        playAnimation(item, monsterSprite)
        monsters[i].hp -= parseInt(item.dmg)
    })
    hero.consumeItem(item)
    updateHp()
    closeInventory()
    if (routeMonsters.route()[pointer] != null) monsterRetaliation()
}

//handles looting a room after a fight encounter -- just adding 1 gp per monster killed right now, but will probably be a more reasonable value eventually
function lootRoom(){
    if (!routeTreasure.route()[pointer]) return

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
    generateStatus()
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

        const item = document.createElement("p")
        item.classList.add("shopitem")
        item.innerText = option

        optionDiv.append(item)
        optionsDiv.append(optionDiv)
    })
    document.querySelector(".peaceblock").append(optionsDiv)
}

function generateStatus(){
    const statusButton = document.createElement("button")
    statusButton.classList.add("statusbtn")
    statusButton.innerText = "STATUS"
    statusButton.addEventListener("click", addStatusMenu)
    contentArea.append(statusButton)

    const inventoryButton = document.createElement("button")
    inventoryButton.classList.add("inventorybtn")
    inventoryButton.innerText = "INVENTORY"
    inventoryButton.addEventListener("click", handleItm)
    contentArea.append(inventoryButton)
}

function addStatusMenu(){
    if (document.querySelector(".statusmenu")) return document.querySelector(".statusmenu").remove() //far superior to the inventory system
    const statusmenu = document.createElement("div")
    statusmenu.classList.add("statusmenu")

    const hp = document.createElement("div")
    hp.innerText = `Hp: ${hero.hp}/${hero.maxHp}`

    const atk = document.createElement("div")
    atk.innerText = `Attack: ${hero.totalAtk}`

    const def = document.createElement("div")
    def.innerText = `Defense: ${hero.totalDef}`

    const bestWeapon = document.createElement("div")
    bestWeapon.innerText = `Equipped Weapon: ${hero.checkBestWeapon()?.name || "nothing"}`  

    const bestArmor = document.createElement("div")
    bestArmor.innerText = `Equipped Armor: ${hero.checkBestArmor()?.name || "nothing"}`

    const roomCount = document.createElement("p")
    roomCount.innerText = `Room: ${pointer+1}`

    statusmenu.append(hp)
    statusmenu.append(atk)
    statusmenu.append(def)
    statusmenu.append(bestWeapon)
    statusmenu.append(bestArmor)
    statusmenu.append(roomCount)
    contentArea.append(statusmenu)
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
    if (!hero.isAlive()) endScreen("YOU HAVE DIED!")
    pointer++
    readyToDelve()
}

function initShop(){
    generateDescription()
    generateOptions()
    generateCosts()
    generateStatus()
    initOptions(handleShop)
}

function generateCosts(){
    const prices = routeRooms.route()[pointer].peace.encounter.outcomes
    const optionsDiv = document.querySelectorAll(".optiondiv")

    optionsDiv.forEach((option, i)=>{
        const priceCheck = document.createElement("p")
        priceCheck.classList.add("pricecheck")
        priceCheck.innerText = prices[i]?.price || ""

        option.append(priceCheck)
    })

    const currentWealth = document.createElement("h3")
    currentWealth.classList.add("currentwealth")
    currentWealth.innerText = `You have ${hero.gp} gp`

    contentArea.append(currentWealth)
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
        document.querySelector(".currentwealth").innerText = hero.gp
        console.log(`You have obtained a ${jsI.itemName}`)
        }
        if (e.target.innerText.includes(jsI?.itemName) && hero.hp < jsI.value){
            console.log("NOT ENOUGH MONEY")
        }
    })

    if (e.target.innerText == "exit"){
        pointer++
        readyToDelve()
    }

}

//What to do... Basically events tied to basic functions that hurt, heal, or give loot or a combination. How do we make these events and tie em to encounters?
function initEvent(){
    generateDescription()
    generateOptions()
    generateStatus()
    initOptions(handleEvent)
}

//handles event button functionality - JSON generator for this is still broken
function handleEvent(e){
    const event = routeRooms.route()[pointer].peace.encounter
    const {options} = event // ["option 1", "option 2", ...]
    const {outcomes} = event // ["{dmg: 5}", "{heal: 5}""] // want to either deal damage or heal based on the object. // Must manually correct the JSON file for now
    
    options.forEach(async (option, i)=>{
        if(e.target.innerText == option){
            const {dmg=null, heal=null, lootQuality=null, lootQuantity=null, monster=null} = outcomes[i] //All event attributes listed here  
            //All event attributes dealt with here
            if (dmg) hero.hp -= parseInt(dmg)
            if (heal) hero.hp += parseInt(heal)
            if (monster) {
                const response = await fetch("/api/monsters")
                const monsterjson = await response.json()
                
                let monsterSelection = []
                monsterjson.forEach(json => {
                if (json.monster.name == monster)
                    monsterSelection.push(json.monster)
                })

                const encounteredMonster =monsterSelection.map(monster=>{
                    return new Monster(monster.name, monster.hp, monster.atk, monster.def, monster.img, monster.special)
                })

                console.log(encounteredMonster)
                console.log(routeMonsters.route())
                if (!routeMonsters.route()[pointer]) return

                encounteredMonster.forEach(monster => {
                    routeMonsters.route()[pointer].splice(0, 0, monster)
                })


            }
            if (lootQuality && lootQuantity) {
                const generatedTreasure = await generateTreasure([{rarity: lootQuality, quantity: lootQuantity}])
                const finalTreasure = classedTreasure(generatedTreasure)
                hero.lootItem(finalTreasure)
            }
            if (!hero.isAlive()) endScreen("YOU HAVE DIED!")
        }
    })
    pointer++
    readyToDelve()
}

function endScreen(message){
    contentArea.innerHTML = ""
    const areaDiv = document.createElement("div")
    areaDiv.classList.add("endarea")

    const msg = document.createElement("div")
    msg.classList.add("endmessage")
    
    const bigText = document.createElement("h1")
    bigText.innerText = `${message}`

    const buttonDiv = document.createElement("div")
    buttonDiv.classList.add("endbuttons")

    const tryAgainBtn = document.createElement("button")
    tryAgainBtn.classList.add("endtryagainbutton")
    tryAgainBtn.innerText = "Play Again?"
    tryAgainBtn.addEventListener("click", gameReset)

    const backToTitleBtn = document.createElement("a")
    backToTitleBtn.classList.add("endbackbutton")
    backToTitleBtn.href = "/"
    backToTitleBtn.innerText = "Back"

    buttonDiv.append(tryAgainBtn)
    buttonDiv.append(backToTitleBtn)
    msg.append(bigText)
    msg.append(buttonDiv)
    areaDiv.append(msg)
    contentArea.append(areaDiv)
}

function gameReset(){location.reload()}

//TODO: 
//MORE OF EVERYTHING (4 entries for each encounter type, 4 monsters, 3 item types/5 items each, 3 more room configs) -- optional
