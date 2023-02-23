//DOMS
const options = document.querySelectorAll(".optionbtn")
const formContainer = document.querySelector(".formcontainer")
const messageHolder = document.querySelector(".message")

//init our options menu
let pickedOption;
options.forEach(option=>{option.addEventListener("click", buildForm)})

//switch statement for our different forms
function buildForm(e){
    messageHolder.innerText=""
    pickedOption = e.target.innerText
    switch(pickedOption){
        case 'Fight Encounter': fightForm()
        break;
        case 'Peace Encounter': peaceForm()
        break;
        case 'Monster': monsterForm()
        break;
        case 'Room': roomForm()
        break;
        case 'Treasure': treasureForm()
        break;
        default: console.log("FORM ERROR")
    }
}

//creates form inputs
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

//creates submit btn
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

//handles our submission
function createEntry(e){
    e.preventDefault()
    //grab DOMS
    const inputs = document.querySelectorAll(".input")
    const inputlabels = document.querySelectorAll(".inputlabel")
    
    //create new object for DB
    const newEntry = {}
    inputlabels.forEach((label, i)=>{newEntry[label.innerText] = inputs[i].value})

    //build out our fetch path
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

    //handle our post request to the DB
    fetch(`/api/${path}`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(newEntry)
    })
    .then(response => response.json())
    .then((data) => {messageHolder.innerText = data})
    inputs.forEach(input=>{
        input.value=''
    })
}

//construct all of our forms using the above helper functions
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
    newFormInput("description")
    newFormInput("type")
    newFormInput("options")
    newFormInput("outcomes") // Defunct - doesn't work and requires manual fixing. 
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
    newFormInput("value")
    submitBtn()
}
