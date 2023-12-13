// mostramos los datos del localStorage en la consola
console.log(localStorage.getItem("nombre"));
console.log(localStorage.getItem("email"));
console.log(localStorage.getItem("contra"));
console.log(localStorage.getItem("admin"));


let indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

// definimos la base de datos
var database = "usersDB";
const DB_VERSION = 1;

// nombre de la tabla
const DB_STORE_NAME = 'users';

// definimos la base de datos y su estado
var db;
var opened = false;

// comprobar que el usuario que ha entrado en la página es administrador
if (localStorage.getItem("admin") == "false") {
    location.href = "main.html";
}

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

// función par mostrar los usuarios en una lista
function showUsers(users) {
    let list = document.getElementById('listaUsuarios');
    list.innerHTML = "";

    for (let i = 0; i < users.length; i++) {
        let user = users[i];
        // ponemos los datos del usuario en un li con inputs
        let li = document.createElement('li');

        let inputNombre = document.createElement('input');
        inputNombre.type = 'text';
        inputNombre.value = user.nombre;
        li.appendChild(inputNombre);

        let inputEmail = document.createElement('input');
        inputEmail.type = 'email';
        inputEmail.value = user.email;
        li.appendChild(inputEmail);

        let inputContra = document.createElement('input');
        inputContra.type = 'password';
        inputContra.value = user.contra;
        li.appendChild(inputContra);

        let inputAdmin = document.createElement('input');
        inputAdmin.type = 'checkbox';
        inputAdmin.checked = user.admin;
        li.appendChild(inputAdmin);

        let avatar = document.createElement('img');
        avatar.src = user.avatar;
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
            editUser(users[i]);
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

    // actualizamos el usuario

    let req = store.put({
        nombre: nombre.value,
        email: email.value,
        contra: contra.value,
        admin: admin.checked,
        avatar: avatar.value
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
                    location.href = "main.html";
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
    console.log(crypto.randomUUID())
    readData();
}