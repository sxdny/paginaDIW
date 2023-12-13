// leemos los elementos del formulario
let username = document.getElementById("username");
let password = document.getElementById("password");
let loginButton = document.getElementById("loginButton");
let infoUsuario = document.getElementById("infoUsuario");

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

                // comprobamos si el usuario y la contraseña coinciden con los datos de la base de datos

                // desenctiptamos la contraseña
                let contraDesencriptada = CryptoJS.AES.decrypt(cursor.value.contra, "contra").toString(CryptoJS.enc.Utf8);

                if (username.value == cursor.value.email && password.value == contraDesencriptada) {

                    users.push(cursor.value);
                    cursor.continue();

                    // borramos el mensaje de error
                    localStorage.removeItem("mensaje");

                    // llamamos a la función login para cambiar el estado de logged a true
                    login(users[0]);

                    // redirigimos a la página de inicio
                    window.location.href = "main.html";
                }
                else {
                    cursor.continue();
                    // guardar el mensaje en el localStorage
                    localStorage.setItem("mensaje", "Usuario o contraseña incorrectos");
                }
            }
            else {
                cursor.continue();
                console.log("readUsers: users readed: " + users.length);
                console.log(users);
            }

        };

        req.onerror = (e) => {
            console.log("readData: Error reading " + e.target.errorCode);
        };
    });
}

// función para cambiar el estado de logged a true
function login(user) {
    openCreateDb((db) => {
        loggedTrue(db, user);
    })
};

function loggedTrue(db, user) {
    // abrimos la transacción
    let tx = db.transaction(DB_STORE_NAME, 'readwrite');
    let store = tx.objectStore(DB_STORE_NAME);

    // cambiamos el estado de logged a true
    user.logged = true;

    // actualizamos el usuario
    let req = store.put(user);

    req.onsuccess = (e) => {
        console.log("loggedTrue: User logged");
    };

    req.onerror = (e) => {
        console.error("loggedTrue: Error logging user", e.target.errorCode);
    };

}

// cuando le de al botón, leemos los datos
loginButton.addEventListener("click", () => {
    console.log("loginButton: click");
    readData();
});

// función para mostrar el mensaje de error
function mostrarMensaje() {
    document.getElementById("mensaje").innerHTML = localStorage.getItem("mensaje");
    document.getElementById("mensaje").style.color = "red";
}

window.onload = () => {
    mostrarMensaje();
}