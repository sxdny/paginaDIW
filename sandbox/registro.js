// obtenemos los elemento del DOM

let idOculta = document.getElementById('idOculta');
let nombre = document.getElementById('nombre');
let email = document.getElementById('email');
let contra = document.getElementById('contrasena');
let admin = document.getElementById('admin');
let avatar = document.getElementById('avatar');

// botones de la página
const REGISTRAR_BUTTON = document.getElementById('registrar');

let indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

// definimos la base de datos
var database = "usersDB";
const DB_VERSION = 1;

// nombre de la tabla
const DB_STORE_NAME = 'users';

// definimos la base de datos y su estado
var db;
var opened = false;
let base64String = "";

// añadir evento al botón
REGISTRAR_BUTTON.addEventListener('click', () => {
    // comprobar si los campos están vacíos
    if (nombre.value == "" || email.value == "" || contra.value == "") {
        document.getElementById("mensaje").innerHTML = "Debes rellenar todos los campos";
        document.getElementById("mensaje").style.color = "red";
        return;
    }

    sendData();
});

// función para abrir la base de datos
function openCreateDb(onDbCompleted) {
    if (opened) {
        db.close();
        opened = false;
    }

    // abrimos la base de datos y almacenamos el resultado de la operación
    var req = indexedDB.open(database, DB_VERSION);

    req.onsuccess = (e) => {
        db = req.result;
        console.log("openCreateDb: Databased opened: " + db);
        opened = true;

        // llamamos a la función que se pasa por parámetro
        onDbCompleted(db);
    };

    req.onupgradeneeded = () => {
        db = req.result;
        console.log("openCreateDb: upgrade needed " + db);

        // creamos el store
        let store = db.createObjectStore(DB_STORE_NAME, { keyPath: "id", autoIncrement: true });
        console.log("openCreateDb: Object store created");

        // definimos los campos de la tabla
        store.createIndex("nombre", "nombre", { unique: false });
        store.createIndex("email", "email", { unique: true });
        store.createIndex("contra", "contra", { unique: false });
        store.createIndex("admin", "admin", { unique: false });
        store.createIndex("avatar", "avatar", { unique: false });
        store.createIndex("logged", "logged", { unique: false });

        console.log("openCreateDb: Object store indexes created");
    };

    req.onerror = (e) => {
        console.log("openCreateDb: Error opening database " + e.target.errorCode);
    };
}

// función para enviar los datos a la base de datos
function sendData() {

    openCreateDb((db) => {
        if (idOculta.value == 0) {
            insertUser(db);
        }
        else {
            editUser(db);
        }
    });
}


// función para leer la imagen que selecciona el usuario

let reader = new FileReader();

function leerImagen(archivo) {
    // comprobar si el archivo es una imagen
    if (archivo.type && !archivo.type.startsWith('image/')) {
        console.log('File is not an image.', archivo.type, archivo);
        return;
    }

    // crear un objeto de tipo FileReader
    let reader = new FileReader();
    reader.addEventListener('load', (event) => {
        base64String = event.target.result;

        // mostrar la imagen
        document.getElementById("imagenAvatar").src = event.target.result;
    });
    reader.readAsDataURL(archivo);
}

// función para mostrar la imagen seleccionada por el usuario
function mostrarImagen() {
    // obtener el archivo seleccionado por el usuario
    let archivo = document.getElementById("avatar").files[0];
    leerImagen(archivo);
}

document.getElementById("imagenAvatar").style.display = "none";

// añadimos el evento change al input file
avatar.addEventListener('change', () => {
    document.getElementById("imagenAvatar").style.display = "block";
    mostrarImagen();
});

// función para insertar un usuario en la base de datos
function insertUser(db) {

    // abrimos la transacción
    let tx = db.transaction(DB_STORE_NAME, 'readwrite');
    let store = tx.objectStore(DB_STORE_NAME);

    let reader = new FileReader();
    reader.onloadend = () => {
        base64String = reader.result;
    }
    reader.readAsDataURL(avatar.files[0]);

    // encriptar la contraseña
    let contraEncriptada = CryptoJS.AES.encrypt(contra.value, "contra").toString();

    // añadimos el usuario
    let req = store.add({
        nombre: nombre.value,
        email: email.value,
        contra: contraEncriptada,
        admin: admin.checked,
        avatar: base64String,
        logged: true
    });

    req.onsuccess = (e) => {
        console.log("insertUser: user added");
        console.log(e.target.result);

        // redirigir a la página de inicio
        window.location.href = "main.html";
    };

    req.onerror = (e) => {
        console.error("insertUser: error adding user", e.target.errorCode);
    };

    tx.oncomplete = () => {
        console.log("insertUser: tx completed");
        db.close();
        opened = false;
    };
}
