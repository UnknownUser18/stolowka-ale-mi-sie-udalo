let header_nav = document.getElementById('nav_header')
console.log(header_nav)
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('l_uczniow').style.display = 'none'
})
document.getElementById('lista_uczniow').addEventListener('click', () => {
    document.getElementById('strona_glowna').style.display = 'none'
    document.getElementById('l_uczniow').style.display = 'block'
    header_nav.innerHTML = 'Lista uczniów'
})
function show(element) {
    console.log(element.previousElementSibling)
    header_nav.innerHTML = element.previousElementSibling.innerText
    document.getElementById('kalendarz_header').innerHTML = element.previousElementSibling.innerText
}
document.getElementById('kalendarz').addEventListener('click', () => {
    console.log(document.getElementById('nav_header').innerHTML)
    if(header_nav.innerHTML !== 'Strona Główna' && header_nav.innerHTML !== 'Lista uczniów') {
        let element = document.getElementById('kalendarz_background')
        let styl = window.getComputedStyle(element)
        let style = styl.getPropertyValue('display')
        if(style === 'flex') {
            document.getElementById('kalendarz_background').style.display = 'none'
        }
        else if(style === 'none') {
            document.getElementById('kalendarz_background').style.display = 'flex'
            generate_calendar()
        }
    }
})
let kalendarz = document.getElementById('kalendarz_content')
const getDays = (year, month) => {
    return new Date(year, month, 0).getDate()
}
// console.log(firstDay.getDay()) //returns 0-6 (0 is sunday)
// console.log(lastDay.getDay()) //returns 0-6 (0 is sunday)
let currentMonth = 0
function change_month(change) {
    currentMonth += change
    generate_calendar()
}
let dni = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Niedz']
function generate_calendar() {
    let date = new Date()
    let firstDay = new Date(date.getFullYear(), date.getMonth() + currentMonth, 1)
    let lastDay = new Date(date.getFullYear(), date.getMonth() + currentMonth, 0)

    kalendarz.innerHTML = ''
    document.getElementById('kalendarz_dni').innerHTML = ''
    document.getElementById('current_date').innerHTML = firstDay.toLocaleString('default', { month: 'long' }) + ' ' + firstDay.getFullYear()

    let weekcount = 0

    kalendarz.innerHTML += `<div class="week"></div>`
    if (document.getElementsByClassName('week')[weekcount].children.length < 7) {
        for (let i = document.getElementsByClassName('week')[weekcount].children.length; i < 6; i++) {
            document.getElementsByClassName('week')[weekcount].innerHTML += `<div class="day"></div>`
        }
    }
    for (let i = 0; i < getDays(date.getFullYear(), date.getMonth() + 1) + firstDay.getDay(); i++) {
        if (i < 7) {
            document.getElementById('kalendarz_dni').innerHTML += `<div>` + dni[i] + `</div>`
        }

        if ((firstDay.getDay() + i) % 7 === (firstDay.getDay()) + 1) {
            kalendarz.innerHTML += `<div class="week"></div>`
            weekcount++
        }

        let week = document.getElementsByClassName('week')[weekcount]
        if (i < firstDay.getDay()) {
            week.innerHTML += `<div class="day"></div>`
        } else if (i > lastDay.getDay() && i > lastDay.getDate() + 1) {
            week.innerHTML += `<div class="day"></div>`
        } else {
            week.innerHTML += `<button class="day">${i - firstDay.getDay() + 1}</button>`
        }
    }
    if (document.getElementsByClassName('week')[weekcount].children.length < 7) {
        for (let i = document.getElementsByClassName('week')[weekcount].children.length; i < 7; i++) {

            document.getElementsByClassName('week')[weekcount].innerHTML += `<div class="day"></div>`

        }
    }
    let divs = []
    let week = document.getElementsByClassName('week')[0]
    week.querySelectorAll('div').forEach((div) => {
        divs.push(div)
    })
    if(divs.length === 7) {
        document.getElementsByClassName('week')[0].remove()
    }
}