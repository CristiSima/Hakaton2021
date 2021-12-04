/* Set the width of the side navigation to 250px */
function openNav() {
    document.getElementById("overpass-api-controls").style.width = "150px";
    document.getElementById("overpass-api-controls").style.height = "auto";
    var checkList = document.getElementById('list1');
    checkList.getElementsByClassName('anchor')[0].onclick = function (evt) {
        if (checkList.classList.contains('visible'))
            checkList.classList.remove('visible');
        else
            checkList.classList.add('visible');
    }
}
openNav();
/* Set the width of the side navigation to 0 */
function closeNav() {
    document.getElementById("overpass-api-controls").style.width = "45px";
    document.getElementById("overpass-api-controls").style.height = "45px";
}

function toggleNav() {
    navSize = document.getElementById("overpass-api-controls").offsetWidth;
    if (navSize > 150) {
        return closeNav();
    }
    return openNav();
}

function getCheckboxvalue() {
    var array = [];
    var checkboxes = document.querySelectorAll('input[type=checkbox]:checked');

    for (var i = 0; i < checkboxes.length; i++) {
        array.push(checkboxes[i].activity);
    }
    array.concat();
}