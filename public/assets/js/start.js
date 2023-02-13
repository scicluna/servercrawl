const startMenu = document.querySelector(".startmenu")

fetch('/admin').then(response=>response.json()).then(data=>{
    const admin = data.admin
    adminMenu(admin)
})

const adminMenu = (admin) => {
    if (!admin) return

    const newBtn = document.createElement('a')
    newBtn.classList.add("btn")
    newBtn.href = "./assets/pages/wizardslab.html"
    newBtn.innerText = "ADMIN"

    startMenu.appendChild(newBtn)
}

