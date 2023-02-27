//handles attack animations
export const playAnimation = (weapon, targetSprite) => {
    switch(weapon.name){
        case "knife": punctureAnimation(targetSprite)
        break;
        case "sword": slashAnimation(targetSprite)
        break;
        case "bomb": explosionAnimation(targetSprite)
        break;
        default: break;
    }
}

function slashAnimation(targetSprite){ //400ms
    const animationDiv = document.createElement("div")
    animationDiv.classList.add("knifeanimation")
    animationDiv.style.backgroundImage = "url(../img/slash.png)"

    targetSprite.append(animationDiv)

    setInterval(()=>{
        animationDiv.remove()
    }, 400)
}

function punctureAnimation(targetSprite){
    const animationDiv = document.createElement("div")
    animationDiv.classList.add("punctureanimation")

    targetSprite.append(animationDiv)

    setInterval(()=>{
        animationDiv.remove()
    }, 400)
}

function explosionAnimation(targetSprite){
    const animationDiv = document.createElement("div")
    animationDiv.classList.add("explosionanimation")

    targetSprite.append(animationDiv)

    setInterval(()=>{
        animationDiv.remove()
    }, 400)
}
//////ALL ANIMATIONS HERE
