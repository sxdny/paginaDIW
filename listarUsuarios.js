// elementos de la base de datos

// indexedDB (para todos los navegadores)
let indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

// definimos la base de datos
var database = "usersDB";
const DB_VERSION = 1;

// definimos el nombre de la tabla (el store es como una tabla)
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

        // creamos los índices
        store.createIndex('username', 'username', { unique: false });
        console.log("openCreateDb: Index created on username");
        store.createIndex('password', 'password', { unique: false });
        console.log("openCreateDb: Index created on password");
        store.createIndex('email', 'email', { unique: false });
        console.log("openCreateDb: Index created on email");
    };

    req.onerror = function (e) {
        console.error("openCreateDb: error opening or creating DB:", e.target.errorCode);
    };
}

// función para enviar los datos a la base de datos
function sendData() {
    // abrimos la base de datos
    openCreateDb((db) => {
        if (hiddenId.value == 0) {
            addUser(db);
        }
        else {
            editUser(db);
        }
    })
}

// función para leer la información de la base de datos
function readData() {
    openCreateDb(function (db) {
        readUsers(db);
    });
}

// función que muestre los datos del usuario en la tabla del documento
function showDataInHTML() {
    // abrimos la base de datos
    openCreateDb((db) => {
        // abrimos la transacción
        let transaction = db.transaction(DB_STORE_NAME, 'readonly');
        let objectStore = transaction.objectStore(DB_STORE_NAME);

        // abrimos el cursor
        let req = objectStore.openCursor();
        let users = [];

        req.onsuccess = (e) => {
            let cursor = e.target.result;

            if (cursor) {
                // añadimos el usuario a la lista
                users.push(cursor.value);
                cursor.continue();
            } else {
                console.log("showDataInHTML: no more entries");
                console.log("Usuarios de la base de datos: ");
                console.table(users);

                // mostramos los datos en la tabla
                let table = document.getElementById('usersTable');
                let tbody = table.getElementsByTagName('tbody')[0];
                tbody.innerHTML = '';

                users.forEach((user) => {
                    let row = tbody.insertRow();

                    let idCell = row.insertCell();
                    let usernameCell = row.insertCell();
                    let passwordCell = row.insertCell();
                    let emailCell = row.insertCell();

                    idCell.innerHTML = user.id;
                    usernameCell.innerHTML = user.username;
                    passwordCell.innerHTML = user.password;
                    emailCell.innerHTML = user.email;
                });
            }
        };

        req.onerror = (e) => {
            console.error("showDataInHTML: error reading data:", e.target.errorCode);
        };

        transaction.oncomplete = () => {
            console.log("showDataInHTML: tx completed");
            db.close();
            opened = false;
        };
    });
}

// función para leer los usuarios de la base de datos
function readUsers(db) {
    let transaction = db.transaction(DB_STORE_NAME, 'readonly');
    let objectStore = transaction.objectStore(DB_STORE_NAME);

    // abrimos el cursor
    let req = objectStore.openCursor();
    let users = [];

    req.onsuccess = (e) => {
        let cursor = e.target.result;

        if (cursor) {
            // añadimos el usuario a la lista
            users.push(cursor.value);
            cursor.continue();
        } else {
            console.log("readUsers: no more entries");
            console.log("Usuarios de la base de datos: ");
            console.table(users);
            showDataInHTML();
        }
    };

    req.onerror = (e) => {
        console.error("readUsers: error reading data:", e.target.errorCode);
    };

    transaction.oncomplete = () => {
        console.log("readUsers: tx completed");
        db.close();
        opened = false;
    };

}




window.onload = () => {
    // leemos los datos de la base de datos
    readData();
}





