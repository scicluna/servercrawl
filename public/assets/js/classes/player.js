import { Item } from "./item.js"

export class Player{
    constructor(name, maxHp, atk, def){
        this.name = name
        this.maxHp = maxHp
        this.atk = atk
        this.def = def
        this.reset()
    }

    reset(){
        this.hp = this.maxHp
        this.level = 1
        this.inventory = [
            new Item("knife", "weapon", "common", 1),
            new Item("potion", "healingConsumable", "common", null, null, null, 10),
        ]
        this.totalAtk = this.atk
        this.totalDef = this.def
        this.optimizeEquipment()
    }

    openInventory(){
        return this.inventory
    }

    checkHp(){
        if (this.hp <= 0) return false
        return `${this.hp}/${this.maxHp}`
    }

    checkBestWeapon(){
        let bestWeapon;
        this.inventory.forEach(item=>{
            if(item.type === "weapon" && (item.atk > bestWeapon?.atk || bestWeapon == null)) bestWeapon = item   
        })
        return bestWeapon
    }

    checkBestArmor(){
        let bestArmor;
        this.inventory.forEach(item=>{
            if(item.type === "armor" && (item.def > bestArmor?.def || bestArmor == null)) bestArmor = item   
        })
        return bestArmor
    }

    optimizeEquipment(){
        const bestWeapon = this.checkBestWeapon()
        const bestArmor = this.checkBestArmor()

        this.totalAtk = this.atk + bestWeapon?.atk || this.atk
        this.totalDef = this.def + bestArmor?.def || this.def
    }

    lootItem(item){
        this.inventory = [...this.inventory, item]
    }

    consumeItem(item){
        this.inventory = this.inventory.filter(thing => thing != item)
    }

    attackEnemy(enemy){
        if (this.totalAtk < enemy.def){
            enemy.hp -= 1
        } else {
            enemy.hp -= this.totalAtk + enemy.def 
        }
    }


}