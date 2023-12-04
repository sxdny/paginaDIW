// obtener elementos del DOM

// datos del formulario
let hiddenId = document.getElementById('hiddenId');
let email = document.getElementById('email');
let username = document.getElementById('username');
let password = document.getElementById('password');


// botones de la página
const ADD_USER_BUTTON = document.getElementById('sendData');
ADD_USER_BUTTON.addEventListener('click', sendData);

// const EDIT_USER_BUTTON = document.getElementById('updateData');
// EDIT_USER_BUTTON.addEventListener('click', editUser);

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

// función para vaciar los datos del formulario
function clearFormInputs() {
    hiddenId.value = 0;
    username.value = '';
    password.value = '';
    email.value = '';
}

// función para añadir usuarioa a la base de datos
function addUser(db) {

    localStorage.setItem('id', hiddenId.value);

    let selectedAvatar = document.querySelector('input[type="radio"]:checked');
    console.log(selectedAvatar.value);

    // creamos el objeto con los datos del formulario
    let user = {
        username: username.value,
        password: password.value,
        email: email.value,
        avatar: selectedAvatar.value,
        logged: true
    }

    // creamos la transacción
    let transaction = db.transaction([DB_STORE_NAME], 'readwrite');
    let objectStore = transaction.objectStore(DB_STORE_NAME);

    let req = objectStore.add(user);

    req.onsuccess = () => {
        console.log("addUser: Data insertion successfully done. Id: " + req.result);
    };

    req.onerror = () => {
        console.error("addUser: error creating data", this.error);
    };
}


// función para editar un usuario
function editUserEvent(id) {
    // abrimos la base de datos
    openCreateDb((db) => {
        // creamos la transacción
        let transaction = db.transaction([DB_STORE_NAME], 'readwrite');
        let objectStore = transaction.objectStore(DB_STORE_NAME);

        let req = objectStore.get(id);

        req.onsuccess = () => {
            let user = req.result;

            console.table(user);

            // añadimos los datos al formulario
            hiddenId.value = user.id;
            username.value = user.username;
            password.value = user.password;
            email.value = user.email;

            // cambiamos el título
            TITULO.innerText = EDIT_USER;

            // cambiamos el botón
            ADD_USER_BUTTON.style.display = 'none';
            EDIT_USER_BUTTON.style.display = 'block';

        };

        req.onerror = () => {
            console.error("editUser: error reading data", this.error);
        };
    });
}

// función para editar un usuario
function editUser() {
    // creamos el objeto con los datos del formulario
    let user = {
        id: parseInt(hiddenId.value),
        username: username.value,
        password: password.value,
        email: email.value
    }

    console.table(user);

    // creamos la transacción
    let transaction = db.transaction(DB_STORE_NAME, 'readwrite');
    let objectStore = transaction.objectStore(DB_STORE_NAME);

    let req = objectStore.put(user);

    req.onsuccess = () => {
        console.log("editUser: Data insertion successfully done. Id: " + req.result);

        // // Operations we want to do after inserting data
        // readData();
        // clearFormInputs();
    };

    req.onerror = () => {
        console.error("editUser: error creating data", this.error);
    };
}

// función para borrar un usuario
function deleteUser(id) {
    // abrimos la base de datos
    openCreateDb((db) => {
        // creamos la transacción
        let transaction = db.transaction([DB_STORE_NAME], 'readwrite');
        let objectStore = transaction.objectStore(DB_STORE_NAME);

        let req = objectStore.delete(id);

        req.onsuccess = () => {
            console.log("deleteUser: Data deleted successfully done. Id: " + id);

            // Operations we want to do after inserting data
            readData();
        };

        req.onerror = () => {
            console.error("deleteUser: error deleting data", this.error);
        };
    });
}



window.onload = () => {
    // leemos los datos de la base de datos
    readData();
}





