const options = document.querySelectorAll(".optionbtn")
const formContainer = document.querySelector(".formcontainer")
const messageHolder = document.querySelector(".message")
let pickedOption;

options.forEach(option=>{
    option.addEventListener("click", buildForm)
})

function buildForm(e){
    messageHolder.innerText=""
    pickedOption = e.target.innerText
    switch(pickedOption){
        case 'Fight Encounter': fightForm()
        break;

        case 'Peace Encounter': peaceForm()
        break;l
    
        case 'Monster': monsterForm()
        break;

        case 'Room': roomForm()
        break;

        case 'Treasure': treasureForm()
        break;

        default: console.log("FORM ERROR")
    }
}

function newFormInput(fieldName){
    const newDiv = document.createElement("div")
    const newInput = document.createElement("input")
    const newLabel = document.createElement("p")

    newDiv.classList.add("inputcontainer")
    newInput.classList.add("input")
    newLabel.classList.add("inputlabel")

    newLabel.innerText = fieldName
    newInput.dataset.type = fieldName

    newDiv.appendChild(newInput)
    newDiv.appendChild(newLabel)
    formContainer.appendChild(newDiv)
}

function submitBtn(){
    const newDiv = document.createElement("div")
    const newBtn = document.createElement("button")

    newDiv.classList.add("inputcontainer")
    newBtn.classList.add("submitbtn")
    newBtn.classList.add("btn")
    newBtn.classList.add("btn-secondary")

    newBtn.innerText = "SUBMIT"
    newBtn.addEventListener("click", createEntry)

    newDiv.appendChild(newBtn)
    formContainer.appendChild(newDiv)
}

function createEntry(e){
    e.preventDefault()
    const inputs = document.querySelectorAll(".input")
    const inputlabels = document.querySelectorAll(".inputlabel")

    const labels = []
    inputlabels.forEach(label=>{
        labels.push(label.innerText)
    })

    const inputvalues = []
    inputs.forEach(input=>{
        let processedValue = input.value
        if(input.value.includes(",")) processedValue = input.value.split(",")
        inputvalues.push(processedValue)
    })

    const newEntry = {}
    labels.forEach((label, i)=>{
        newEntry[label] = inputvalues[i]
    })

    let path;
    switch(pickedOption){
        case 'Fight Encounter': path = 'encounters/fight'
        break;

        case 'Peace Encounter': path = 'encounters/peace'
        break;
    
        case 'Monster': path = 'monsters'
        break;

        case 'Room': path = 'rooms'
        break;

        case 'Treasure': path = 'treasure'
        break;

        default: console.log("PATH ERROR")
    }

    fetch(`/api/${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEntry),
      })
        .then((response) => response.json())
        .then((data) => {
            messageHolder.innerText = data
        })


    inputs.forEach(input=>{
        input.value=''
    })
}

function fightForm(){
    formContainer.innerHTML = ''
    newFormInput("name")
    newFormInput("monsters")
    newFormInput("treasureRarity")
    newFormInput("treasureAmount")
    submitBtn()
}

function peaceForm(){
    formContainer.innerHTML = ''
    newFormInput("name")
    newFormInput("type")
    newFormInput("options")
    newFormInput("shopInventory")
    newFormInput("description")
    submitBtn()
}

function monsterForm(){
    formContainer.innerHTML = ''
    newFormInput("name")
    newFormInput("hp")
    newFormInput("atk")
    newFormInput("def")
    newFormInput("img")
    submitBtn()
}

function roomForm(){
    formContainer.innerHTML = ''
    newFormInput("roomName")
    newFormInput("battlePercent")
    newFormInput("background")
    submitBtn()
}

function treasureForm(){
    formContainer.innerHTML = ''
    newFormInput("itemName")
    newFormInput("itemType")
    newFormInput("itemRarity")
    newFormInput("itemAtk")
    newFormInput("itemDef")
    newFormInput("itemDmg")
    newFormInput("itemHeal")
    newFormInput("itemStatus")
    submitBtn()
}
