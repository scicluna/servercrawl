//select DOMS
const startMenu = document.querySelector(".startmenu")

//fetch request to check for admin flag
fetch('/admin').then(response=>response.json()).then(data=>adminMenu(data.admin))

//if admin flag is on, create the button to access admin tools
const adminMenu = (admin) => {
    if (!admin) return
    const newBtn = document.createElement('a')
    newBtn.classList.add("btn")
    newBtn.href = "./assets/pages/wizardslab.html"
    newBtn.innerText = "ADMIN"
    startMenu.appendChild(newBtn)
}

