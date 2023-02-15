class Item{
    constructor(id, name, type, atk=null, def=null, dmg=null, heal=null, status=null){
        this.id = id
        this.name = name
        this.type = type
        this.atk = atk
        this.def = def
        this.dmg = dmg
        this.heal = heal
        this.status = status
    }

    checkType(){
        return this.type
    }
}

const potion = new Item(0, "potion", "consumable", null, null, null, 10)
const knife = new Item(1, "knife", "weapon", 1)


export const items = [
    potion,
    knife
]
