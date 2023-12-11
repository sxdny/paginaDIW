import { createRequire } from 'module';
const require = createRequire(import.meta.url);

let crypto = require('crypto');

// obtenemos los elemento del DOM

let idOculta = document.getElementById('idOculta');
let nombre = document.getElementById('nombre');
let email = document.getElementById('email');
let contra = document.getElementById('contrasena');
let admin = document.getElementById('admin');

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

// añadir evento al botón
REGISTRAR_BUTTON.addEventListener('click', sendData);

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

// función para leer la información de la base de datos
function readData() {
    openCreateDb((db) => {
        readUsers(db);
    })
};

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
        let cursor = e.target.result;
        if (cursor) {
            users.push(cursor.value);
            cursor.continue();
        }
        else {
            console.log("readUsers: users readed: " + users.length);
            // mostramos los usuarios en la tabla
            showUsers(users);
        }
    };

    req.onerror = (e) => {
        console.error("readUsers: error reading users", e.target.errorCode);
    };
}

// función para insertar un usuario en la base de datos
function insertUser(db) {

    // abrimos la transacción
    let tx = db.transaction(DB_STORE_NAME, 'readwrite');
    let store = tx.objectStore(DB_STORE_NAME);

    // añadimos el usuario
    let req = store.add({
        nombre: nombre.value,
        email: email.value,
        contra: contra.value,
        admin: admin.checked
    });

    req.onsuccess = (e) => {
        console.log("insertUser: user added");
        console.log(e.target.result);
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

// función par mostrar los usuarios en una lista
function showUsers(users) {
    let list = document.getElementById('listaUsuarios');
    list.innerHTML = "";

    for (let i = 0; i < users.length; i++) {
        let user = users[i];
        let li = document.createElement('li');
        li.innerHTML = user.nombre + " " + user.email + " " + user.contra + " " + user.admin;
        list.appendChild(li);
    }

    // añadir botones de editar y eliminar
    let lis = list.getElementsByTagName('li');
    for (let i = 0; i < lis.length; i++) {
        let li = lis[i];
        let editButton = document.createElement('button');
        editButton.innerHTML = "Editar";
        editButton.addEventListener('click', () => {
            formularioEditarUsuario(users[i]);
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
function editUser() {

    // abrimos la transacción
    let tx = db.transaction(DB_STORE_NAME, 'readwrite');
    let store = tx.objectStore(DB_STORE_NAME);

    // actualizamos el usuario

    let req = store.put({
        id: parseInt(idOculta.value),
        nombre: nombre.value,
        email: email.value,
        contra: contra.value,
        admin: admin.checked
    });

    req.onsuccess = (e) => {
        console.log("editUser: user updated");
        console.log(e.target.result);
    };

    req.onerror = (e) => {
        console.error("editUser: error updating user", e.target.errorCode);
    };

    tx.oncomplete = () => {
        console.log("editUser: tx completed");
        db.close();
        opened = false;
    };
}

// función para borrar un usuario de la base de datos
function borrarUsuario(id) {
    openCreateDb((db) => {
        // abrimos la transacción
        let tx = db.transaction(DB_STORE_NAME, 'readwrite');
        let store = tx.objectStore(DB_STORE_NAME);

        // borramos el usuario
        let req = store.delete(id);

        req.onsuccess = (e) => {
            console.log("borrarUsuario: user deleted");
            console.log(e.target.result);
        };

        req.onerror = (e) => {
            console.error("borrarUsuario: error deleting user", e.target.errorCode);
        };

        tx.oncomplete = () => {
            console.log("borrarUsuario: tx completed");
            db.close();
            opened = false;
        };
    });

    // recargar la página
    location.reload();
}

// función para mostrar el formulario de editar usuario
function formularioEditarUsuario(user) {
    idOculta.value = user.id;
    nombre.value = user.nombre;
    email.value = user.email;
    contra.value = user.contra;
    admin.checked = user.admin;

    // cambiar el texto del botón
    REGISTRAR_BUTTON.innerHTML = "Editar usuario";
    // cambiar la acción del botón
    REGISTRAR_BUTTON.removeEventListener('click', sendData);

    // imprimimos la función actual que tiene el botón

    REGISTRAR_BUTTON.onclick = editUser;

}


window.onload = function () {
    console.log(crypto.randomUUID())
    readData();
}