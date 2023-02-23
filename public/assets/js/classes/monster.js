export class Monster{
    constructor(name, maxHp, atk, def, img){
        this.name = name
        this.maxHp = parseInt(maxHp)
        this.atk = parseInt(atk)
        this.def = parseInt(def)
        this.img = img
        this.reset()
    }

    //set to create non-constructor attributes
    reset(){
        this.hp = this.maxHp
    }

    //handles basic monster attacks
    attack(target){
        if (this.atk > target.def){
            target.hp -= this.atk 
        } else target.hp--
    }

    //checks if monster is dead or alive
    isAlive(){
        if (this.hp > 0) return true
        else return false
    }
}