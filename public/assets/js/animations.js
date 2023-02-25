//handles attack animations
export const playAnimation = (weapon, targetCard) => {
    switch(weapon.name){
        case "knife": slashAnimation(targetCard)
        break;

        default: break;
    }
}

function slashAnimation(targetCard){
    console.log(targetCard) // target sprite is the literal HTML element
    const animationDiv = document.createElement("img")
    animationDiv.classList.add("knifeanimation")
    animationDiv.src = "../img/slash.png"

    targetCard.append(animationDiv)
    
    setInterval(()=>{
        animationDiv.remove()
    }, 1000)
}
