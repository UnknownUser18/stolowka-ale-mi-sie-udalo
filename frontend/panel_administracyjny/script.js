document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('l_uczniow').style.display = 'none'
})
document.getElementById('lista_uczniow').addEventListener('click', () => {
    document.getElementById('strona_glowna').style.display = 'none'
    document.getElementById('l_uczniow').style.display = 'block'
    document.getElementById('nav_header').innerHTML = 'Lista uczniów'
})
document.querySelector('.uczen > button').addEventListener('click', () => {
    document.getElementById('nav_header').innerHTML = document.querySelector('.uczen > span').innerHTML
})