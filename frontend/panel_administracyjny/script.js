let header_nav = document.getElementById('nav_header')
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('l_uczniow').style.display = 'none'
})
document.getElementById('lista_uczniow').addEventListener('click', () => {
    document.getElementById('strona_glowna').style.display = 'none'
    document.getElementById('l_uczniow').style.display = 'block'
    header_nav.innerHTML = 'Lista uczniów'
})
function show(element) {
    document.getElementById('panel').style.display = 'flex'
    document.getElementById('panel_header').innerHTML = element.previousElementSibling.innerText
}
function close_panel() {
    document.getElementById('panel').style.display = 'none'
}
let date = new Date()
document.getElementById('kalendarz').addEventListener('click', () => {
    let element = document.getElementById('kalendarz_background')
    let styl = window.getComputedStyle(element)
    let style = styl.getPropertyValue('display')
    if(style === 'flex') {
        document.getElementById('kalendarz_background').style.display = 'none'
    }
    else if(style === 'none') {
        document.getElementById('kalendarz_background').style.display = 'flex'
        change_month(0)
        generate_calendar()
    }
})
let kalendarz = document.getElementById('kalendarz_content')
const getDays = (year, month) => {
    return new Date(year, month, 0).getDate()
}
function change_month(change) {
    date = new Date(date.getFullYear(), date.getMonth() + change, 1) // Set day to 1 to avoid skipping months
    let date_next = new Date(date.getFullYear(), date.getMonth() + 1, 1)
    let date_back = new Date(date.getFullYear(), date.getMonth() - 1, 1)
    document.getElementById('miesiac_nast').innerHTML = date_next.toLocaleString('default', {month : 'long' , year : 'numeric'}) + `<img src="arrow_forward.svg" alt="dalej">`
    document.getElementById('miesiac_przed').innerHTML = `<img src="arrow_back.svg" alt="wstecz">` + date_back.toLocaleString('default', {month : 'long' , year : 'numeric'})
    generate_calendar()
}
let dni = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Niedz']
function generate_calendar() {
    let year = date.getFullYear()
    let currentMonth = date.getMonth()
    let firstDay = new Date(year, currentMonth, 1)
    let lastDay = new Date(year, currentMonth, 0)
    kalendarz.innerHTML = ''
    document.getElementById('kalendarz_dni').innerHTML = ''
    document.getElementById('current_date').innerHTML = firstDay.toLocaleString('default', { month: 'long' }) + ' ' + firstDay.getFullYear()

    let weekcount = 0

    kalendarz.innerHTML += `<div class="week"></div>`
    if (document.getElementsByClassName('week')[weekcount].children.length < 7) {
        for (let i = document.getElementsByClassName('week')[weekcount].children.length; i < 6; i++) {
            document.getElementsByClassName('week')[weekcount].innerHTML += `<button class="day empty"></button>`
        }
    }
    for (let i = 0; i < getDays(date.getFullYear(), date.getMonth() + 1) + firstDay.getDay(); i++) {
        if (i < 7) {
            document.getElementById('kalendarz_dni').innerHTML += `<div>` + dni[i] + `</div>`
        }
        if ((firstDay.getDay() + i) % 7 === ((firstDay.getDay()) + 1) % 7){
            kalendarz.innerHTML += `<div class="week"></div>`
            weekcount++
        }
        let week = document.getElementsByClassName('week')[weekcount]
        console.log(i - firstDay.getDay() + 1)
        if (i < firstDay.getDay()) {
            week.innerHTML += `<button class="day empty"></button>`
        } else if (i > lastDay.getDay() && i > lastDay.getDate() + 10) {
            week.innerHTML += `<button class="day empty"></button>`
        } else {
            week.innerHTML += `<button class="day">${i - firstDay.getDay() + 1}</button>`
        }
    }
    if (document.getElementsByClassName('week')[weekcount].children.length < 7) {
        for (let i = document.getElementsByClassName('week')[weekcount].children.length; i < 7; i++) {
            document.getElementsByClassName('week')[weekcount].innerHTML += `<button class="day empty"></button>`

        }
    }
    for(let i = 0 ; i < document.getElementsByClassName('week').length; i++) {
        const week = document.getElementsByClassName('week')[i]
        const divs = Array.from(week.querySelectorAll('button.day.empty'))
        if(divs.length === 7) {
            document.getElementsByClassName('week')[i].remove()
        }
    }
}