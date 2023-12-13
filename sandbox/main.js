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

// función para leer la información de la base de datos del usuario que ha iniciado sesión

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

                // comprobamos si logged está a true
                if (cursor.value.logged == true) {

                    console.log("readData: User logged in");
                    console.log(cursor.value);

                    // mostramos los datos del usuario en el div de datos del usuario
                    document.getElementById("nombre").innerHTML = cursor.value.nombre;
                    document.getElementById("email").innerHTML = cursor.value.email;
                    document.getElementById("foto").setAttribute("src", cursor.value.avatar);
                    document.getElementById("foto").style.width = "100px";

                    users.push(cursor.value);

                    // ocultamos el div de inicio de sesión
                    document.getElementById("bienvenida").style.display = "none";

                    // comprobar si el usuario es administrador
                    if (cursor.value.admin == true) {
                        // mostramos el div de administración
                        document.getElementById("admin").style.display = "true";
                    }
                    else {
                        // mostramos el div de usuario
                        document.getElementById("admin").style.display = "none";
                    }
                }
                else {
                    cursor.continue();
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
}

// añadir el evento click
cerrarSesion.addEventListener("click", () => {
    
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
                // comprobamos si logged está a true
                if (cursor.value.logged == true) {
                    users.push(cursor.value);

                    // llamamos a la función logout para cambiar el estado de logged a false
                    logout(users[0]);
                }
                else {
                    cursor.continue();
                }
            }
            else {
                console.log("readUsers: users readed: " + users.length);
            }
        };

        req.onerror = (e) => {
            console.log("readData: Error reading " + e.target.errorCode);
        };
    });

    // recargar la página
    window.location.reload();
});

// función para cambiar el estado de logged a false
function logout(user) {
    openCreateDb((db) => {
        loggedFalse(db, user);
    })
}

function loggedFalse(db, user) {
    // abrimos la transacción
    let tx = db.transaction(DB_STORE_NAME, 'readwrite');
    let store = tx.objectStore(DB_STORE_NAME);

    // actualizamos el estado de logged a false
    user.logged = false;

    // actualizamos el usuario
    let req = store.put(user);

    req.onsuccess = (e) => {
        console.log("loggedFalse: User logged out");

        // recargamos la página
        window.location.reload();
    };

    req.onerror = (e) => {
        console.log("loggedFalse: Error updating user " + e.target.errorCode);
    };
}


window.onload = () => {
    readData();
}

