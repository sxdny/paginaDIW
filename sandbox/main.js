// obtener el boton para cerrar sesión
let cerrarSesion = document.getElementById("cerrarSesion");

// añadir el evento click
cerrarSesion.addEventListener("click", () => {
    // borrar los datos del local storage
    localStorage.removeItem("nombre");
    localStorage.removeItem("email");
    localStorage.removeItem("contra");
    localStorage.removeItem("admin");

    // recargar la página
    window.location.reload();
});

// comprobar si hay un usuario guarda en el local storage
if (localStorage.getItem("nombre") == null) {
    // ocultamos el div de datos del usuario
    document.getElementById("datosUsuario").style.display = "none";
}
else {
    // ocultar el div de bienvenida
    document.getElementById("bienvenida").style.display = "none";
}

// acceder a los datos del local storage

console.log(localStorage.getItem("nombre"));
console.log(localStorage.getItem("email"));
console.log(localStorage.getItem("contra"));
console.log(localStorage.getItem("admin"));

// mostramos los datos el usuario en el HTML
document.getElementById("foto").src = localStorage.getItem("avatar");
document.getElementById("nombre").innerHTML = localStorage.getItem("nombre");
document.getElementById("email").innerHTML = localStorage.getItem("email");

// si el usuario es administrador, mostramos el botón de administración
if (localStorage.getItem("admin") == "true") {
    document.getElementById("admin").style.display = "block";
}
else {
    document.getElementById("admin").style.display = "none";
}

