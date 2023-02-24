import { Item } from "./item.js"

export class Player{
    constructor(name, maxHp, atk, def){
        this.name = name
        this.maxHp = maxHp
        this.atk = atk
        this.def = def
        this.reset()
    }

    //non constructor derived properties
    reset(){
        this.hp = this.maxHp
        this.level = 1
        this.gp = 2
        this.inventory = [
            new Item("knife", "weapon", "common", 1),
            new Item("potion", "healingConsumable", "common", null, null, null, 10),
            {gp: this.gp}
        ]
        this.totalAtk = this.atk
        this.totalDef = this.def
        this.optimizeEquipment()
    }

    //displays current inventory
    openInventory(){return this.inventory}

    //checks hp total (will eventually return false and be used as an "isAlive" type function)
    checkHp(){
        if (this.hp <= 0) return console.log("YOU HAVE DIED")
        return `${this.hp}/${this.maxHp}`
    }

    //finds the best weapon in the player's inventory
    checkBestWeapon(){
        let bestWeapon;
        this.inventory.forEach(item=>{
            if(item.type === "weapon" && (item.atk > bestWeapon?.atk || bestWeapon == null)) bestWeapon = item   
        })
        return bestWeapon
    }

    //finds the best armor in the player's inventory
    checkBestArmor(){
        let bestArmor;
        this.inventory.forEach(item=>{
            if(item.type === "armor" && (item.def > bestArmor?.def || bestArmor == null)) bestArmor = item   
        })
        return bestArmor
    }

    //optimizes players equipment and sets totalAtk and totalDef
    optimizeEquipment(){
        const bestWeapon = this.checkBestWeapon()
        const bestArmor = this.checkBestArmor()
        this.totalAtk = this.atk + bestWeapon?.atk || this.atk
        this.totalDef = this.def + bestArmor?.def || this.def
    }

    //handles looting items
    lootItem(item){this.inventory = [...this.inventory, item].flat(Infinity)}

    //removes item from inventory
    consumeItem(item){this.inventory = this.inventory.filter(thing => thing != item)}

    //handles basic attacks
    attackEnemy(enemy){
        if (this.totalAtk < enemy.def){
            enemy.hp -= 1
        } else {
            enemy.hp -= this.totalAtk + enemy.def 
        }
    }

    isAlive(){
        if (this.hp > 0) return true
        else return false
    }
}