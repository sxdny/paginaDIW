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
        store.createIndex("usuario", "usuario", { unique: true });
        store.createIndex("correo", "correo", { unique: true });
        store.createIndex("contra", "contra", { unique: false });
        store.createIndex("avatar", "avatar", { unique: false });
        store.createIndex("admin", "admin", { unique: false });
        store.createIndex("logged", "logged", { unique: false });

        console.log("openCreateDb: Object store indexes created");
    };

    req.onerror = (e) => {
        console.log("openCreateDb: Error opening database " + e.target.errorCode);
    };
}

// función para leer la información de la base de datos
function readData() {
    openCreateDb((db) => {
        readUsers(db);
    })
};

let flagUsuario = false;

// función para comprobar si el usuario está logueado y es administrador
function saberSiAdmin() {
    openCreateDb((db) => {
        let tx = db.transaction(DB_STORE_NAME, 'readonly');
        let store = tx.objectStore(DB_STORE_NAME);

        // obtenemos el cursor
        let req = store.openCursor();

        req.onsuccess = (e) => {
            let cursor = e.target.result;

            if (cursor) {
                // comprobamos si el usuario está logueado y si es admin
                if (cursor.value.logged && cursor.value.admin) {
                    console.log("saberSiAdmin: user found");

                    flagUsuario = true;
                }

                cursor.continue();
            }
            else {
                console.log("saberSiAdmin: user not found");
            }
        }

        req.onerror = (e) => {
            console.error("saberSiAdmin: error reading users", e.target.errorCode);
        };
    });
}

// función para leer los usuarios de la base de datos
function readUsers(db) {
    // abrimos la transacción
    let tx = db.transaction(DB_STORE_NAME, 'readonly');
    let store = tx.objectStore(DB_STORE_NAME);

    // obtenemos el cursor
    let req = store.openCursor();

    // definimos el array de usuarios
    let users = [];

    // función para recorrer los usuarios
    req.onsuccess = (e) => {

        // comprobar que el usuario que está logueado es administrador

        if (flagUsuario) {
            let cursor = e.target.result;

            if (cursor) {
                users.push(cursor.value);
                cursor.continue();
            }
            else {
                console.log("readUsers: user not found");
                // mostramos los usuarios en la tabla
                showUsers(users);
            }

            if (users.length == 0) {
                console.log("readUsers: no users");
                location.href = "../index.html";
            }
        }
        else {
            console.log("No eres administrador");
            location.href = "../index.html";
        }
    }

    req.onerror = (e) => {
        console.error("readUsers: error reading users", e.target.errorCode);
    };
};


// función par mostrar los usuarios en una lista
function showUsers(users) {
    let list = document.getElementById('listaUsuarios');
    list.innerHTML = "";

    for (let i = 0; i < users.length; i++) {
        let user = users[i];
        // ponemos los datos del usuario en un li con inputs
        let li = document.createElement('li');

        // ponerle un id al li
        li.id = user.id;

        let inputNombre = document.createElement('input');
        inputNombre.type = 'text';
        inputNombre.value = user.usuario;
        li.appendChild(inputNombre);

        let inputEmail = document.createElement('input');
        inputEmail.type = 'email';
        inputEmail.value = user.correo;
        li.appendChild(inputEmail);

        let inputAdmin = document.createElement('input');
        inputAdmin.type = 'checkbox';
        inputAdmin.checked = user.admin;
        li.appendChild(inputAdmin);

        let avatar = document.createElement('img');
        let src = "../" + user.avatar;
        avatar.src = src;
        avatar.style.width = "50px";
        avatar.style.height = "50px";
        li.appendChild(avatar);

        list.appendChild(li);

    }

    // añadir botones de editar y eliminar
    let lis = list.getElementsByTagName('li');
    for (let i = 0; i < lis.length; i++) {
        let li = lis[i];
        let editButton = document.createElement('button');
        editButton.innerHTML = "Editar";
        editButton.addEventListener('click', () => {
            editUser(users[i].id);
        });

        li.appendChild(editButton);

        let deleteButton = document.createElement('button');
        deleteButton.innerHTML = "Eliminar";
        deleteButton.addEventListener('click', () => {
            borrarUsuario(users[i].id);
        });

        li.appendChild(deleteButton);
    }
}

// función para editar un usuario en la base de datos
function editUser(id) {

    // abrimos la transacción
    let tx = db.transaction(DB_STORE_NAME, 'readwrite');
    let store = tx.objectStore(DB_STORE_NAME);

    // actualizamos el usuario de acuerdo a su id
    var req = store.get(id);

    req.onsuccess = (e) => {
        let user = e.target.result;

        // obtenemos el li del usuario
        let li = document.getElementById(id);

        // obtenemos los inputs del usuario
        let inputs = li.getElementsByTagName('input');

        // actualizamos los datos del usuario
        user.usuario = inputs[0].value;
        user.correo = inputs[1].value;
        user.admin = inputs[2].checked;

        // actualizamos el usuario
        store.put(user);

        console.log("editUser: user updated");
    }

    req.onerror = (e) => {
        console.error("editUser: error updating user", e.target.errorCode);
    }

    // recargar la página
    location.reload();
}

// función para borrar un usuario de la base de datos
function borrarUsuario(id) {
    openCreateDb((db) => {

        // abrimos la transacción
        let tx = db.transaction(DB_STORE_NAME, 'readwrite');
        let store = tx.objectStore(DB_STORE_NAME);

        // leemos los datos del usuario que ha iniciado sesión
        var req = store.openCursor();

        // borramos el usuario
        store.delete(id);

        req.onsuccess = (e) => {

            let cursor = e.target.result;

            if (cursor) {
                // comprobamos si logged está a true
                if (cursor.value.logged == true && cursor.value.id == id) {
                    // redirigir a la página de inicio
                    location.href = "../index.html";
                }
                cursor.continue();
            }
            else {
                console.log("readData: User not found");
            }
        }

    });

    // recargar la página
    location.reload();
}

window.onload = function () {
    saberSiAdmin();
    readData();
}