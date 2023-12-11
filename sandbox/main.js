// acceder a los datos del local storage

console.log(localStorage.getItem("nombre"));
console.log(localStorage.getItem("email"));
console.log(localStorage.getItem("contra"));
console.log(localStorage.getItem("admin"));

// mostramos los datos el usuario en el HTML
document.getElementById("nombre").innerHTML = localStorage.getItem("nombre");
document.getElementById("email").innerHTML = localStorage.getItem("email");

// si el usuario es administrador, mostramos el botón de administración
if (localStorage.getItem("admin") == "true") {
    document.getElementById("admin").style.display = "block";
}
else {
    document.getElementById("admin").style.display = "none";
}

