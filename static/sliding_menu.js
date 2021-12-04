/* Set the width of the side navigation to 250px */
function initNav() {
    var checkList = document.getElementById('overpass-api-controls');
    checkList.getElementsByClassName('anchor')[0].onclick = function (evt) {
        if (checkList.classList.contains('visible'))
            checkList.classList.remove('visible');
        else
            checkList.classList.add('visible');
    }
}
initNav();

// dor debug/STYLEING
// document.getElementById('overpass-api-controls').getElementsByClassName('anchor')[0].onclick(2)
