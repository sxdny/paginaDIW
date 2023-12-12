// obtener el boton para cerrar sesión
let cerrarSesion = document.getElementById("cerrarSesion");

let indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

// definimos la base de datos
var database = "usersDB";
const DB_VERSION = 1;

// nombre de la tabla
const DB_STORE_NAME = 'users';

// definimos la base de datos y su estado
var db;
var opened = false;

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

        console.log("openCreateDb: Object store indexes created");
    };

    req.onerror = (e) => {
        console.log("openCreateDb: Error opening database " + e.target.errorCode);
    };
}

function readData() {
    openCreateDb((db) => {
        readUsers(db);
    })
};

// función para leer la información de la base de datos del usuario que ha iniciado sesión

console.log(localStorage.getItem("email"));

function readData() {
    // abrimos la base de datos
    openCreateDb((db) => {
        // abrimos la transacción
        var transaction = db.transaction(DB_STORE_NAME, "readonly");
        console.log("readData: Transaction created");

        // abrimos el store
        var store = transaction.objectStore(DB_STORE_NAME);
        console.log("readData: Store opened");

        // leemos los datos del usuario que ha iniciado sesión
        var req = store.openCursor();

        let users = [];

        req.onsuccess = (e) => {
            
            let cursor = e.target.result;
            if (cursor) {
                if (cursor.value.email == localStorage.getItem("email")) {
                    users.push(cursor.value);
                    cursor.continue();
                }
            }
            else {
                console.log("readUsers: users readed: " + users.length);
            }

            // mostramos los datos del usuario
            document.getElementById("nombre").innerHTML = users[0].nombre;
            document.getElementById("email").innerHTML = users[0].email;
            // mostramos el avatar
            document.getElementById("foto").src = users[0].avatar;
            document.getElementById("foto").width = "100";

        };

        req.onerror = (e) => {
            console.log("readData: Error reading " + e.target.errorCode);
        };
    });
}

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


// si el usuario es administrador, mostramos el botón de administración
if (localStorage.getItem("admin") == "true") {
    document.getElementById("admin").style.display = "block";
}
else {
    document.getElementById("admin").style.display = "none";
}

window.onload = function () {
    // comprobar si hay un usuario guarda en el local storage
    if (localStorage.getItem("nombre") == null) {
        // ocultamos el div de datos del usuario
        document.getElementById("datosUsuario").style.display = "none";
    }
    else {
        // ocultar el div de bienvenida
        document.getElementById("bienvenida").style.display = "none";
        readData()
    }
}

