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

function checkAllBoxes() {
    var checkboxes = document.querySelectorAll('input[type=checkbox]');
    for (var i = 0; i < checkboxes.length; i++) {
        checkboxes[i].checked = true;
    }
}

function uncheckAllBoxes() {
    var checkboxes = document.querySelectorAll('input[type=checkbox]');
    for (var i = 0; i < checkboxes.length; i++) {
        checkboxes[i].checked = false;
    }
}

// dor debug/STYLEING
// document.getElementById('overpass-api-controls').getElementsByClassName('anchor')[0].onclick(2)

function getCheckboxvalue() {
    var array = [];
    var checkboxes = document.querySelectorAll('input[type=checkbox]:checked');

    for (var i = 0; i < checkboxes.length; i++) {
        array.push(checkboxes[i].activity);
    }
    array.concat();
}
