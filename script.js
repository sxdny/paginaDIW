// Elementos formulario registrarse.html

let hiddenId = document.getElementById("hiddenId");
let usuario = document.getElementById("usuario");
let correo = document.getElementById("correo");
let contra = document.getElementById("contra");
let contraConfirmar = document.getElementById("contraConfirmar");

// Obtenemos los avatares
let avatar1 = document.getElementById("avatar1");
let avatar2 = document.getElementById("avatar2");
let avatar3 = document.getElementById("avatar3");

// Obtenemos el p de mensaje
let mensaje = document.getElementById("mensaje");

// Obtenemos el botón de registrarse	
const REGISTRAR_BTN = document.getElementById("registrar");

// ---------------------------------------------

// Base de datos

let indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

// definimos la base de datos
var database = "usersDB";
const DB_VERSION = 1;

// nombre de la tabla
const DB_STORE_NAME = 'usuarios';

// definimos la base de datos y su estado
var db;
var opened = false;

// para almacenar el avatar
let rutaImagen = "";

// ---------------------------------------------

// Eventos de los botones

REGISTRAR_BTN.addEventListener('click', () => {
    // comprobar si los campos están vacíos
    if (usuario.value == "" || correo.value == "" || contra.value == "" || contraConfirmar.value == "") {
        mensaje.innerHTML = "Debes rellenar todos los campos";
        mensaje.style.color = "red";
        return;
    }

    // comprobar si las contraseñas coinciden
    if (contra.value != contraConfirmar.value) {
        document.getElementById("mensaje").innerHTML = "Las contraseñas no coinciden";
        mensaje.style.color = "red";
        return;
    }

    sendData();
});

// ---------------------------------------------

// Funciones

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

        // creamos el almacén de objetos
        var store = db.createObjectStore(DB_STORE_NAME, { keyPath: "id", autoIncrement: true });

        // definimos los campos de la tabla
        store.createIndex("usuario", "usuario", { unique: true });
        store.createIndex("correo", "correo", { unique: true });
        store.createIndex("contra", "contra", { unique: false });
        store.createIndex("avatar", "avatar", { unique: false });
        store.createIndex("admin", "admin", { unique: false });
        store.createIndex("logged", "logged", { unique: false });

        console.log("openCreateDb: Object store created");

    };

    req.onerror = (e) => {
        console.log("openCreateDb: Error opening database " + e);
    };
}

// función para enviar los datos a la base de datos
function sendData() {
    openCreateDb((db) => {
        insertUser(db);
    });
}

// función para insertar un usuario
function insertUser(db) {
    // abrimos la transacción
    var tx = db.transaction(DB_STORE_NAME, 'readwrite');
    var store = tx.objectStore(DB_STORE_NAME);

    // obtenemos el avatar
    rutaImagen = getAvatar();

    // encriptamos la contraseña
    var contraEncriptada = CryptoJS.AES.encrypt(contra.value, "contra").toString();

    // creamos el objeto
    var user = {
        usuario: usuario.value,
        correo: correo.value,
        contra: contraEncriptada,
        avatar: base64String,
        admin: false,
        logged: true
    };

    // añadimos el objeto a la base de datos
    var req = store.add(user);

    req.onsuccess = (e) => {
        console.log("sendData: User added to the database");
        window.location.href = "index.html";
    };

    req.onerror = (e) => {
        console.log("sendData: Error adding user to the database " + e);
        mensaje.innerHTML = "Error al registrar el usuario";
        mensaje.style.color = "red";
    };

    tx.oncomplete = () => {
        console.log("sendData: Transaction completed");
    };

    tx.onerror = (e) => {
        console.log("sendData: Transaction error " + e);
    };
}

// función para obtener el avatar seleccionado por el usuario
function getAvatar() {
    if (avatar1.checked) {
        return "img/avatar1.png";
    } else if (avatar2.checked) {
        return "img/avatar2.png";
    } else if (avatar3.checked) {
        return "img/avatar3.png";
    }
}