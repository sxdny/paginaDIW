# To-Dos

Todas las cosas que tienen que estar hechas para la actividad de DIW:

### Gestión de usuarios

DONE
Hacer que los usuarios se puedan registrar en la web.
Tipos de usuarios:

- Administrador.
- Normal.

¿Cómo implementarlo?

En la página de registro, tiene que haber un **checkbox** para indicar si el usuario es o no adminitrador.

### Validador y contraseña.

EL VALIDADOR DE HTML BASTA
También, a la hora de registrarse, tendremos que **validar los datos introducidos.** (Mirar lo de DWEC)

No podremos almacenar la contraseña en texto plano, usaremos **CryptoJS ** para encriptarla (Mirar el enlace en el Classroom)

### Implementación con la página

Cuando el usuario se registre, este automáticamente iniciará sesión.

Dependiendo del tipo de usuario, lo redigiremos a una página u otra:

- Si es un usuario estándar, lo redigiremos a la página principal y mostraremos su nombre + avatar arriba.
- Si es un administrador, lo redirigemos a la página donde se muestran todos los usuarios junto a su información (menos la contraseña)

En ambos casos, tiene que haber un botón de **Cerrar Sesión**.

Al entrar en la página, tendremos que comprobar si hay un usuario con la sesión iniciada (para evitar que usuarios sin permisos entre a la URL página de gestión de usuarios).

### Acciones de los usuarios

Administrador:
- Editar usuarios.
- Resetear la contraseña.
- Borrar la cuenta del usuario.

Usuario estándar + Administrador:
- Editar el perfil del usuario (sus datos).
- Editar las preferencias del usuario (tema claro o oscuro).

Si el usuario **elimina su cuenta**, cerrará sesión automáticamente y si el usuario cambia de tema, este se tiene que aplicar.




