export class Monster{
    constructor(name, maxHp, atk, def, img, special){
        this.name = name
        this.maxHp = parseInt(maxHp)
        this.atk = parseInt(atk)
        this.def = parseInt(def)
        this.img = img
        this.special = special
        this.reset()
    }

    //set to create non-constructor attributes
    reset(){
        this.hp = this.maxHp
    }

    attack(target){
        const rng = rando(0, 100)
        if (rng <= 5) this.specialAttack(target)
        else this.basicAttack(target)
    }


    //handles basic monster attacks
    basicAttack(target){
        if (this.atk > target.totalDef){
            target.hp = target.hp - this.atk + target.totalDef
        } else target.hp--
    }

    //checks if monster is dead or alive
    isAlive(){
        if (this.hp > 0) return true
        else return false
    }

    specialAttack(target){
        switch(this.special){
            case null: this.genericSpecial(target)
            break;
            default: this.basicAttack(target)
        }
    }

    genericSpecial(target){
        console.log("MONSTER SPECIAL")
        if (this.atk >= target.totalDef){
            target.hp = target.hp - (parseInt(this.atk) * 1.25) + target.totalDef
        } else target.hp--
    }
}


