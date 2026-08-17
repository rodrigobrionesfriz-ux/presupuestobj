# Presupuesto familiar

App web de una sola página para llevar el presupuesto del hogar en tiempo real, con estadísticas de comportamiento de compra, control de deudas y tarjetas, metas de ahorro y recomendaciones automáticas.

Sin build ni dependencias que compilar: se sube tal cual a GitHub Pages. La base de datos es Firebase (Authentication + Cloud Firestore), así que varios teléfonos ven el mismo libro al instante. Se instala como app en el teléfono, funciona sin conexión y avisa cuando un sobre se está agotando.

```
index.html          la app completa (HTML + CSS + JS)
manifest.json       datos de instalación como app
sw.js               service worker: offline y notificaciones
firestore.rules     reglas de seguridad de la base de datos
iconos/             iconos de la app
```

---

## 1. Crear el proyecto en Firebase

1. Entra a [console.firebase.google.com](https://console.firebase.google.com) y crea un proyecto.
2. **Authentication → Sign-in method**: activa **Google** (elige un correo de soporte del proyecto) y **Correo electrónico/contraseña**. Si quieres permitir el botón "Entrar sin cuenta", activa también **Anónimo**.
3. **Firestore Database → Crear base de datos** → modo producción → elige la región más cercana.
4. **Configuración del proyecto → Tus apps → Web (`</>`)**: registra la app y copia el objeto `firebaseConfig`.

## 2. Pegar tu configuración

**Ya está hecho**: `index.html` viene con la configuración del proyecto `presupuestofamiliar-c77a9`. Si algún día cambias de proyecto, sustituye el bloque `FIREBASE_CONFIG` al inicio del `<script type="module">`:

```js
const FIREBASE_CONFIG = {
  apiKey: "AIza...",
  authDomain: "mi-proyecto.firebaseapp.com",
  projectId: "mi-proyecto",
  storageBucket: "mi-proyecto.firebasestorage.app",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123"
};
```

Si dejas valores que empiecen por `TU_`, la app arranca en **modo local**: funciona completa pero los datos no salen de la pestaña.

> La `apiKey` de Firebase es pública por diseño: identifica el proyecto, no da acceso. Quien protege los datos son las reglas del paso 3, así que ese paso no es opcional.

## 3. Publicar las reglas de seguridad

Copia el contenido de `firestore.rules` en **Firestore Database → Reglas** y publica. Sin este paso, cualquiera con la URL del proyecto podría leer tus datos.

Con estas reglas: solo los miembros de un hogar leen y escriben en él, y unirse a un hogar exige conocer el código exacto de 8 caracteres.

## 4. Subir a GitHub Pages

```bash
git init
git add index.html manifest.json sw.js firestore.rules README.md iconos/
git commit -m "Presupuesto familiar"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/presupuesto-familiar.git
git push -u origin main
```

En el repo: **Settings → Pages → Source: Deploy from a branch → main / (root)**. En un minuto tendrás `https://TU-USUARIO.github.io/presupuesto-familiar/`.

Último paso en Firebase: **Authentication → Settings → Dominios autorizados** → añade `TU-USUARIO.github.io`. Sin esto el inicio de sesión falla.

## 5. Usarla en familia

Puedes entrar de tres formas: **Continuar con Google** (lo más cómodo en el teléfono, sin contraseñas que recordar), correo y contraseña, o sin cuenta en un solo dispositivo.

1. La primera persona entra y elige **Crear hogar nuevo**.
2. En **Ajustes → Sincronización** aparece el código del hogar (por ejemplo `K7M2QF9B`).
3. Las demás personas entran con **su propia cuenta de Google** y eligen **Ya tengo un código**.

Cada quien usa su cuenta: el hogar es lo compartido, no la sesión. Así los movimientos quedan atribuidos a quien los registra.

En la app instalada, el acceso con Google se abre en ventana emergente; si el navegador la bloquea, la app cae automáticamente a redirección de página completa y vuelve sola.

Todos ven los mismos movimientos en tiempo real, cada uno desde su teléfono.

## 6. Instalarla como app

En **Ajustes → Instalar en el teléfono**:

- **Android / Chrome / Edge**: el botón instala la app directamente.
- **iPhone / Safari**: botón Compartir → *Añadir a pantalla de inicio*. Safari no permite el botón automático.
- **Escritorio**: aparece un icono de instalación en la barra de direcciones.

Una vez instalada abre a pantalla completa, sin barra de navegador, y arranca aunque no haya señal: el service worker guarda la app y Firestore guarda los datos. Los movimientos registrados sin conexión se sincronizan solos al recuperarla.

Mantener el icono pulsado da acceso directo a *Registrar gasto* y *Ver estadísticas*.

## 7. Alertas de sobre

En **Ajustes → Alertas de sobre** pulsa *Activar alertas* y acepta el permiso del navegador. A partir de ahí recibes un aviso cuando:

- una categoría llega al **90%** de su presupuesto (con lo que queda y los días que faltan de mes),
- una categoría **supera** su presupuesto,
- el ritmo de gasto proyecta cerrar el mes **más de un 15% por encima** del presupuesto.

Cada aviso se envía una sola vez por categoría y por mes, así que no se vuelve ruido. Al tocarlo se abre la app en la vista correspondiente.

Las alertas se calculan en el dispositivo: no hace falta servidor ni Cloud Messaging. Eso significa que llegan cuando la app está abierta o en segundo plano reciente. En iPhone solo funcionan si la app está instalada en la pantalla de inicio (requisito de Safari desde iOS 16.4).

## 8. Temas

El botón **◐** de la cabecera va rotando entre cuatro temas, y la elección se recuerda en cada dispositivo (también se eligen en Ajustes → Apariencia):

- **Papel de contabilidad** — fondo verde claro con rayado de libro contable.
- **Claro** — fondo limpio sin rayado y bordes remarcados en tono oscuro, con mayor contraste. Se lee mejor a plena luz.
- **SAP Fiori** — paleta corporativa de SAP: shell `#354A5F`, azul de marca `#0A6ED1` para las acciones y los colores semánticos de Fiori aplicados con su significado real: `#107E3E` positivo cuando el sobre va bien, `#E9730C` crítico al acercarse al límite, `#BB0000` negativo al excederlo y `#6A6D70` neutro. Tarjetas con esquinas de 8px y sombra suave, botones con el estilo *emphasized* y *transparent* de Fiori.
- **Femenino** — ciruela profunda `#3B2230`, granate `#A8385A`, oro viejo `#C9A227`, salvia y lavanda sobre fondo rosa empolvado, con los títulos en la serif Fraunces y la cabecera en degradado. Todos los pares de color cumplen contraste WCAG AA para texto.

## 9. Tipografía

En **Ajustes → Tipografía** se elige entre tres familias, con una muestra en vivo para comparar:

- **Inter** (por defecto) — diseñada específicamente para pantalla, con alta legibilidad en tamaños pequeños.
- **Roboto** — la del sistema Android, familiar y algo más estrecha.
- **Original** — Bricolage Grotesque en los títulos y Karla en el texto, el emparejamiento con el que nació la app.

Las cifras van siempre en una monoespaciada de ancho fijo (IBM Plex Mono, o Roboto Mono si eliges Roboto) para que las columnas de números queden alineadas. La elección se guarda por dispositivo, igual que el tema.

## 10. Fondo personal

En **Ajustes → Fondo personal** cada persona puede subir una foto que aparece como marca de agua bajo la barra superior, con un control de intensidad del 4% al 40%. La imagen se reduce a 900px y se comprime en el propio teléfono antes de guardarse, y se difumina arriba y abajo para no estorbar la lectura.

Es personal, no del hogar: se guarda en el perfil de cada usuario (`usuarios/{uid}`), así que tu pareja ve la suya y tú la tuya, y la tuya te sigue si entras desde otro dispositivo.

## 11. Corregir registros

Todo lo que se registra se puede corregir después:

- **Movimientos** — toca cualquier fila del libro para abrirla. Puedes cambiar monto, categoría, si es esencial, concepto, fecha, medio de pago, miembro, e incluso convertir un gasto en ingreso. Útil cuando algo quedó mal asignado: cambiar la categoría recalcula al instante los sobres, las estadísticas y las recomendaciones.
- **Deudas** — botón *Editar*: saldo, tasa, pago mensual y tipo. También la deuda inicial, que es la referencia de la barra de avance.
- **Metas** — botón *Editar*: objetivo, acumulado y fecha límite.

Eliminar está dentro de la propia ventana de edición y pide confirmación en dos pasos, así no se borra nada de un toque accidental en el teléfono.

## 12. Comportamiento de las ventanas

Las ventanas de registro y edición **no se cierran al hacer clic fuera**, para que un roce accidental no borre lo que llevas escrito. Se cierran solo con la **✕** de la esquina, el botón **Cancelar** o la tecla **Esc**.

---

## Qué incluye

**Panel** — Corte del mes en formato de cinta de sumadora: ingresos registrados, ingreso estimado, gastos, deuda pendiente y disponible. La etiqueta *base* señala cuál de los dos ingresos se está usando para calcular. Por omisión se toma el mayor de los dos: a mitad de mes manda la estimación, porque parte del sueldo aún no ha entrado, y al cerrar el mes se impone lo realmente recibido. En Ajustes se puede fijar a mano. Ritmo de gasto variable, proyección a fin de mes con su desglose, y cuánto puedes gastar por día para no pasarte. Sobres por categoría que cambian de verde a ámbar a rojo, y reparto entre gasto esencial y prescindible.

**Sobres propios** — Además de las once categorías de serie, la familia puede crear las suyas desde *Panel → + Otro sobre* o desde Ajustes. Cada sobre nuevo declara su **tipo de gasto** (esencial o prescindible, lo que decide si entra en las recomendaciones de recorte) y su **frecuencia** (variable día a día, o fijo una vez al mes, lo que decide cómo se proyecta el cierre). Se le asigna color y presupuesto, y aparece en todas las vistas y estadísticas como una más. Al eliminar un sobre propio, sus movimientos pasan automáticamente a *Otros* en lugar de perderse.

**Movimientos** — Alta rápida con monto, categoría, medio de pago, persona y marca de esencial. Libro diario agrupado por fecha, con búsqueda por concepto y filtros por categoría y por persona. Cada fila se toca para editarla o eliminarla.

**Quién registra qué** — Cada movimiento guarda el identificador de la cuenta que lo creó (`uid`), no solo un nombre escrito a mano. El nombre puede cambiar; el identificador no. Eso permite distinguir dos cosas que no son lo mismo: **de quién es el gasto** (editable: puedes registrar una compra que hizo tu pareja) y **quién lo registró** (automático, se estampa al guardar). Al entrar por primera vez, cada persona queda inscrita en el hogar con su nombre, y todos ven los mismos nombres y colores.

**Por persona** — En Estadísticas, el desglose de cada integrante: cuánto gastó y qué porcentaje del total representa, cuánto ingresó, su aporte neto, número de compras, ticket promedio, qué proporción de su gasto es prescindible, en qué categoría gasta más y cuántos movimientos registró en el mes. Con una barra comparativa arriba y un color fijo por persona que se repite en todo el libro.

**Estadísticas** — Acumulado del mes contra la línea de presupuesto, reparto por categoría, comparativo de los últimos seis meses, gasto por día de la semana, ticket promedio, frecuencia de compra, medio de pago, gasto por miembro y conceptos más repetidos.

**Deudas** — Tarjetas y préstamos con saldo, tasa y pago mensual. Calcula meses hasta liquidar e intereses totales, ordena por método avalancha (primero la tasa más alta) y simula qué pasa si abonas extra cada mes.

**Compras a crédito** — Al elegir *Crédito* como medio de pago aparece el selector de tarjeta, y el monto se suma solo al saldo de esa tarjeta. El criterio contable es el de devengo: la compra cuenta como gasto del mes en que la haces, y el pago posterior de la tarjeta solo baja la deuda, sin volver a contar como gasto — por eso esa casilla viene desmarcada cuando la tarjeta ya tiene compras registradas. Si corriges un movimiento (cambias el monto, lo pasas a otra tarjeta o a efectivo) o lo eliminas, el saldo se reajusta solo. Y si en un mes cargas más de lo que pagas, aparece una recomendación avisando de cuánto está creciendo la deuda.

**Metas** — Objetivos con monto y fecha límite. Calcula cuánto necesitas apartar cada mes y cada semana, y lleva el progreso acumulado.

**Ahorro** — Motor de recomendaciones sobre tus propios datos: sobres excedidos, ritmo de gasto por encima del presupuesto, compras hormiga, categorías en alza contra el mes anterior, suscripciones, patrones de día de la semana, carga de deuda sobre el ingreso y avance de metas. Cada recomendación viene con una cifra estimada de ahorro mensual.

**Ajustes** — Presupuesto por sobre (con sugerencia automática según el promedio de tus últimos tres meses), ingreso, meta de ahorro, moneda, miembros, código de sincronización y exportación a CSV.

## Estructura de datos

```
usuarios/{uid}                     → { hogarId, nombre, fondo, fondoOpacidad }
hogares/{codigo}                   → { nombre, config, presupuestos, miembrosUid[] }
hogares/{codigo}/movimientos/{id}  → { tipo, monto, categoria, fecha, metodo, tarjetaId, miembro, nota, esencial }
hogares/{codigo}/deudas/{id}       → { nombre, tipo, saldo, original, tasaAnual, pagoMensual }
hogares/{codigo}/metas/{id}        → { nombre, objetivo, ahorrado, fechaLimite }
```

Firestore guarda una copia local en el navegador, así que la app abre y registra movimientos sin conexión y sincroniza al recuperarla.

## Costo

Con el plan gratuito de Firebase (Spark) una familia va sobrada: el límite es de 50.000 lecturas y 20.000 escrituras diarias, y un hogar típico registra unas decenas de operaciones al día.
