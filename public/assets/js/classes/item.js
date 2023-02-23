export class Item{
    constructor(name, type, rarity, atk=null, def=null, dmg=null, heal=null, status=null){
        this.name = name
        this.type = type
        this.rarity = rarity
        this.atk = atk
        this.def = def
        this.dmg = dmg
        this.heal = heal
        this.status = status
    }

    //shows item type
    checkType(){return this.type}
}
