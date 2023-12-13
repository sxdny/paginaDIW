// Obtenemos los elementos del DOM

let infoUsuario = document.getElementById("infoUsuario");

// ocultamos el div de información del usuario
infoUsuario.style.display = "none";

let login = document.getElementById("login");
let logoutBTN = document.getElementById("logout");

// Elementos de la base de datos
let indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

// definimos la base de datos
var database = "usersDB";
const DB_VERSION = 1;

// nombre de la tabla
const DB_STORE_NAME = 'users';

// definimos la base de datos y su estado
var db;
var opened = false;

// ---------------------------------------------

// Eventos de los botones

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

function readData() {
    openCreateDb((db) => {
        readUsers(db);
    })
};

// función para leer los datos de la base de datos
function readUsers(db) {
    // abrimos una transacción de lectura
    var tx = db.transaction(DB_STORE_NAME, "readonly");
    var store = tx.objectStore(DB_STORE_NAME);

    // abrimos el cursor para recorrer los datos
    var req = store.openCursor();

    // creamos un array para almacenar los datos
    let users = [];

    req.onsuccess = (e) => {
        let cursor = e.target.result;

        if (cursor) {

            // comprobamos si el usuario está logueado
            if (cursor.value.logged) {

                // mostramos el div de información del usuario
                infoUsuario.style.display = "block";

                // mostramos la información del usuario
                infoUsuario.innerHTML = `<h2>Información del usuario</h2>
                <p>Nombre: ${cursor.value.nombre}</p>
                <p>Correo electrónico: ${cursor.value.email}</p>
                <p>Contraseña: ${cursor.value.contra}</p>
                <p>Administrador: ${cursor.value.admin}</p>
                <p>Avatar: ${cursor.value.avatar}</p>
                <p>Logueado: ${cursor.value.logged}</p>`;

                // ocultamos el botón de login
                login.style.display = "none";

                // añadimos la acción de lo al botón de lo
                lo.addEventListener("click", () => {

                    // abrimos la base de datos
                    openCreateDb((db) => {
                        var tx = db.transaction(DB_STORE_NAME, "readwrite");
                        var store = tx.objectStore(DB_STORE_NAME);

                        // abrimos el cursor
                        var req = store.openCursor();

                        let users = [];

                        req.onsuccess = (e) => {
                            let cursor = e.target.result;

                            if (cursor) {

                                // comprobamos el logged está a true
                                if (cursor.value.logged == true) {
                                    users.push(cursor.value);

                                    // llamamos a función lo para cambiar el estado de logged a false
                                    loUser(users[0]);
                                }
                                else {

                                }
                            }
                            else {
                                console.log("readUsers: users readed: " + users.length);

                                if (users.length == 0) {
                                    console.log("No hay ningún usuario logueado");
                                    // mostramos el div de inicio de sesión
                                    document.getElementById("bienvenida").style.display = "true";

                                    // ocultamos el div de administración
                                    document.getElementById("datosUsuario").style.display = "none";
                                }
                            }

                        };

                        req.onerror = (e) => {
                            console.log("readData: Error reading " + e.target.errorCode);
                        };

                    });

                    // recargar la página
                    window.location.reload();
                });
            }

            // almacenamos los datos en el array
            users.push(cursor.value);

            // ocultamos el botón de login
            cursor.continue();
        }
        else {
            // mostramos los datos
            console.log(users);

            if (users.length == 0) {
                // mostramos el botón de login
                login.style.display = "block";
            }
        }
    };

    req.onerror = (e) => {
        console.log("readUsers: error: " + e.target.errorCode);
    };
}

// función para cerrar la sesión de un usuario
function loUsers(user) {
    openCreateDb((db) => {
        lo(db, user);
    });
}

function lo(db, user) {
    // abrimos la treansacción
    var tx = db.transaction(DB_STORE_NAME, "readwrite");
    var store = tx.objectStore(DB_STORE_NAME);

    // acutalizamos el valor de logged a false
    user.logged = false;

    // actualizamos el usuario
    var req = store.put(user);

    req.onsuccess = (e) => {
        console.log("lo: user logged out");

        // recargamos la página
        window.location.reload();
    };

    req.onerror = (e) => {
        console.log("lo: error updating user " + e.target.errorCode);
    };
}

window.onload = () => {
    readData();
}