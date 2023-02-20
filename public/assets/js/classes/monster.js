export class Monster{
    constructor(name, maxHp, atk, def, img){
        this.name = name
        this.maxHp = maxHp
        this.atk = atk
        this.def = def
        this.img = img
        this.reset()
    }

    reset(){
        this.hp = this.maxHp
    }

    attack(target){
        if (this.atk > target.def){
            target.hp -= this.atk 
        } else target.hp--
    }

    isAlive(){
        if (this.hp > 0) return true
        else return false
    }
}