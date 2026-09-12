# Presupuesto familiar

> Seguridad actualizada: la administración de cada hogar depende exclusivamente del UID de la cuenta que lo creó. Después de actualizar la app, vuelve a publicar `firestore.rules` en Firebase para activar esta protección en el servidor.

Las reglas también validan la estructura de movimientos, deudas, metas, cuentas, cierres y conciliaciones. Se rechazan tipos inesperados, montos negativos o excesivos, fechas con formato inválido, textos desmesurados y campos no reconocidos. Las colecciones futuras quedan bloqueadas hasta recibir reglas explícitas.

Las compras a crédito, pagos, intereses y correcciones se guardan mediante transacciones: el movimiento y el saldo de la deuda se confirman juntos. Si cambia la conexión o dos teléfonos operan simultáneamente, Firestore reintenta con el saldo más reciente y evita actualizaciones perdidas.

En **Ajustes → Datos** se puede descargar un respaldo JSON completo y restaurarlo conservando identificadores y relaciones. La restauración valida el archivo, muestra una vista previa y permite combinar o reemplazar; restaurar queda reservado al administrador del hogar.

En **Ajustes → Cuenta y acceso** se muestra si la cuenta es anónima o está verificada. Una cuenta invitada puede vincularse con Google o correo sin perder su UID ni sus datos. También se puede reenviar la verificación, recuperar la contraseña desde el acceso, abandonar un hogar como miembro y transferir previamente la administración cuando corresponde.

Las eliminaciones normales pasan a una **papelera por 30 días** en vez de desaparecer inmediatamente. El administrador puede recuperar movimientos, deudas, metas, cuentas, cierres y conciliaciones. La vista **Actividad reciente** registra quién creó, editó, eliminó, recuperó o restauró información; los eventos de auditoría no se pueden editar ni borrar desde la app.

En **Ajustes → Movimientos recurrentes** se crean plantillas mensuales para sueldos, arriendo, servicios, colegio, seguros y suscripciones. Cada una define tipo, monto, categoría, persona, medio de pago, periodo inicial y día del ciclo. Al llegar la fecha se genera una sola vez; un identificador determinista evita duplicados aunque dos dispositivos procesen la plantilla simultáneamente.

Desde **Movimientos → Importar cartola** (también disponible en **Ajustes → Datos**) se aceptan archivos CSV, TXT, XLS y XLSX. La app permite asignar las columnas de fecha, glosa, cargo, abono o monto con signo, muestra una vista previa, sugiere categorías por comercio, permite corregirlas y excluye duplicados antes de guardar. Cada importación admite hasta 2.000 filas leídas y muestra hasta 300 para revisión individual.

Las correcciones realizadas en la vista previa pueden guardarse como **reglas de categorización aprendidas**. Se normaliza la glosa para ignorar números de operación y palabras bancarias comunes, se aplican las reglas compartidas antes que las sugerencias generales y se limita el hogar a 500 reglas. Todas pueden revisarse o eliminarse desde Ajustes.

La estimación de cierre separa los gastos fijos de los variables y reconoce las dos etapas del ciclo: concentración de pagos entre los días 1 y 8 y menor frecuencia desde el día 9. Para calcular el gasto variable restante usa el comportamiento de hasta tres ciclos anteriores en el mismo tramo; mientras avanza el ciclo lo combina con el ritmo real observado desde el día 9. Sin historial aplica una curva prudente y evita extrapolar el gasto alto inicial a todo el periodo. El resultado se muestra en Panel y Resumen.

En el Panel, la tarjeta **En qué se va el dinero** permite tocar la barra o las filas Esencial y Prescindible. Cada opción abre su total, cantidad de movimientos, ticket promedio, desglose por categoría y lista editable de operaciones.

Al cerrar un periodo, sus movimientos quedan bloqueados contra nuevas altas, ediciones, eliminaciones, recuperaciones desde la papelera e importaciones. Solo el administrador puede usar **Reabrir periodo**; al hacerlo se retiran el cierre y sus ajustes automáticos, se conservan en la papelera y la actividad deja trazabilidad de las eliminaciones.

Al crear o editar un movimiento, la app compara fecha, tipo, monto, concepto normalizado, persona y medio de pago con el historial. Si encuentra una coincidencia exacta advierte sobre el posible duplicado; un segundo toque en Guardar permite confirmar los casos legítimamente repetidos.

El Resumen incluye un comparativo del gasto actual contra el mismo día del ciclo anterior y contra el promedio, al mismo punto, de hasta seis ciclos anteriores con datos. Así no se compara un mes parcial con uno completo. También incorpora una tabla de variaciones comparables por categoría que permite abrir cada detalle.

El botón **Generar PDF**, disponible en Resumen y en Ajustes → Datos, crea un informe A4 con indicadores, cierre estimado, comparativo histórico, presupuesto por categoría, distribución por integrante, deudas y recomendaciones. En el diálogo de impresión del teléfono o computador se selecciona **Guardar como PDF**.

App web de una sola página para llevar el presupuesto del hogar en tiempo real, con estadísticas de comportamiento de compra, control de deudas y tarjetas, metas de ahorro y recomendaciones automáticas.

Sin build ni dependencias que compilar: se sube tal cual a GitHub Pages. La base de datos es Firebase (Authentication + Cloud Firestore), así que varios teléfonos ven el mismo libro al instante. Se instala como app en el teléfono, funciona sin conexión y avisa cuando un sobre se está agotando.

```
index.html          la app completa (HTML + CSS + JS)
manifest.json       datos de instalación como app
sw.js               service worker: offline y notificaciones
version.json        versión publicada y actualización mínima obligatoria
firestore.rules     reglas de seguridad de la base de datos
iconos/             iconos de la app
```

## Actualizaciones obligatorias

La app consulta `version.json` al abrirse, al recuperar conexión, al volver desde segundo plano y cada 15 minutos. Si la versión publicada es distinta y está marcada como obligatoria, bloquea el uso hasta que el service worker instale los archivos nuevos.

En cada publicación cambia coordinadamente `APP_VERSION` en `index.html`, `VERSION` en `sw.js` y `version`/`minVersion` en `version.json`. Usa `force: true` cuando todos los dispositivos deban actualizar inmediatamente.

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

Con estas reglas: solo los miembros de un hogar leen y escriben en él, y unirse exige conocer el código exacto de 8 caracteres.

**Borrado restringido.** Cualquier miembro puede registrar, corregir y borrar movimientos uno a uno —la operación del día a día—, pero eliminar deudas, metas o el hogar entero queda reservado exclusivamente a quien creó el hogar. La autorización utiliza el UID de Firebase y no depende de un correo escrito en el código.

La restricción vive en las reglas del servidor, no en la interfaz. Ocultar un botón no protege nada, porque cualquiera con la consola del navegador podría llamar a la API igualmente.

El borrado masivo de movimientos, además, exige escribir el código del hogar para confirmar, y ofrece descargar un respaldo en Excel antes. Quien no sea administrador ve en su lugar un botón que abre un correo dirigido al administrador, con los datos del hogar ya escritos.

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
- **Cálido** — cabecera slate `#2E353D`, lienzo hueso `#F1EFEA`, tarjetas blancas con esquinas de 12px y naranja `#D9782D` como acento: botones principales, pestaña activa y botón flotante. Los semánticos se apagan un punto para acompañar — verde `#2F7D3A`, rojo `#C2402D`, ámbar `#C88A1E`.
- **Oscuro** — paleta tipo GitHub Dark: lienzo `#0D1117`, tarjetas `#161B22` con filo de color en la cabecera, y los semánticos `#3FB950` positivo, `#F85149` negativo, `#D29922` atención, `#58A6FF` enlace. Los colores de categoría se aclaran automáticamente para mantener contraste sobre fondo negro.
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
- **Cuentas de ahorro** — Dónde vive el dinero ahorrado: cuenta del banco, depósito a plazo, fondo, efectivo guardado. Cada una con institución, tipo, titular (una persona o el hogar) y **saldo inicial configurable**, que es lo que había antes de empezar a registrar.

El botón **+** tiene ahora tres pestañas: *Gasto*, *Ingreso* y ***Ahorrar***. En Ahorrar eliges la cuenta de destino, si es aporte o retiro, el monto y **quién transfiere**. Un aporte no es un gasto —el dinero sigue siendo tuyo— pero **sale del disponible del mes de quien lo transfiere**: ya no puede gastarlo. Un retiro lo devuelve. La casilla *solo mueve la cuenta* sirve para intereses, comisiones y traspasos, que cambian el saldo sin tocar el presupuesto del mes.

Desde cada cuenta hay botones directos de *Aportar* y *Retirar*, y al tocarla se ve su historial completo con saldo inicial, total aportado, total retirado y cada movimiento.

**Composición del disponible** — Bajo la cifra grande del panel aparece de quién es ese saldo: *Ana $X · Luis $Y*. El arrastre del periodo anterior se reparte entre las personas, no se muestra como un bloque del hogar: el cierre guarda el saldo de cada una, así que se sabe a quién pertenece. Solo aparece *sin asignar* si hay movimientos atribuidos a alguien que no está en el hogar. Cada nombre se toca para ver sus movimientos del mes. El disponible de cada persona es su ingreso —registrado o estimado— menos sus gastos, menos lo que transfirió a ahorro, más lo que retiró.

**Metas** — botón *Editar*: objetivo, acumulado y fecha límite.

Eliminar está dentro de la propia ventana de edición y pide confirmación en dos pasos, así no se borra nada de un toque accidental en el teléfono.

## 12. Comportamiento de las ventanas

Las ventanas de registro y edición **no se cierran al hacer clic fuera**, para que un roce accidental no borre lo que llevas escrito. Se cierran solo con la **✕** de la esquina, el botón **Cancelar** o la tecla **Esc**.

---

## Qué incluye

**Resumen** — Un mini panel de una sola pantalla, primero en la barra lateral y accesible también con el botón **▦** de la cabecera. Sin detalle: seis tarjetas de KPI con su porcentaje y barra de avance —disponible sobre ingresos, gastado sobre presupuesto, ahorro y su tasa, avance del periodo, gasto prescindible y deuda con su carga sobre el ingreso—, un gráfico de líneas con el **acumulado día a día** de las seis categorías con más peso dentro del periodo en curso —así se ve cuál se dispara y en qué momento—, y el gasto por persona del periodo con el color de cada una.

Las tarjetas van siempre en dos columnas, tres filas, también en pantallas de 360px: con seis KPI, romper a una sola columna obligaría a desplazarse para leer el conjunto, que es justo lo que un resumen debe evitar. En el gráfico solo se rotulan seis días del eje y se marca el último punto de cada curva; con treinta puntos, las etiquetas y los círculos se pisarían.

**Panel** — Corte del mes en formato de cinta de sumadora: ingresos registrados, ingreso estimado, gastos, deuda pendiente y disponible. La etiqueta *base* señala cuál de los dos ingresos se está usando para calcular. Por omisión se toma el mayor de los dos: a mitad de mes manda la estimación, porque parte del sueldo aún no ha entrado, y al cerrar el mes se impone lo realmente recibido. En Ajustes se puede fijar a mano. Ritmo de gasto variable, proyección a fin de mes con su desglose, y cuánto puedes gastar por día para no pasarte. Sobres por categoría que cambian de verde a ámbar a rojo, y reparto entre gasto esencial y prescindible.

**Sub-sobres** — Cada sobre se divide por dentro sin multiplicar los sobres del panel: *Alimentación* puede separarse en supermercado, feria y carnicería. Se crean desde tres sitios, según dónde te haga falta:

- **Al registrar un gasto** — junto al selector de sub-sobre hay un botón *+ Nuevo*: escribes el nombre y queda creado y asignado en el mismo paso.
- **En Ajustes → Presupuesto por sobre** — cada categoría lleva una etiqueta *+ SUB* (o *3 SUB* si ya tiene) que abre su gestión.
- **En el panel** — al expandir un sobre, el enlace *+ Añadir sub-sobre*. Lo que no se clasifica se agrupa aparte como *Sin clasificar*, así la suma siempre cuadra con el total del sobre.

**Resumen expandible** — El panel muestra los seis sobres con más gasto y un enlace para ver el resto. Al tocar cualquiera se despliega en su sitio: reparto por sub-sobre con barras proporcionales, cuánto puso cada persona, y un botón para abrir la lista completa de movimientos. El resumen se mantiene corto y el detalle está a un toque.

**Sobres propios** — Además de las once categorías de serie, la familia puede crear las suyas desde *Panel → + Otro sobre* o desde Ajustes. Cada sobre nuevo declara su **tipo de gasto** (esencial o prescindible, lo que decide si entra en las recomendaciones de recorte) y su **frecuencia** (variable día a día, o fijo una vez al mes, lo que decide cómo se proyecta el cierre). Se le asigna color y presupuesto, y aparece en todas las vistas y estadísticas como una más. Al eliminar un sobre propio, sus movimientos pasan automáticamente a *Otros* en lugar de perderse.

**Movimientos** — Alta rápida con monto, categoría, medio de pago, persona y marca de esencial. Libro diario agrupado por fecha, con búsqueda por concepto y filtros por categoría y por persona. Cada fila se toca para editarla o eliminarla.

**Quién registra qué** — Cada movimiento guarda el identificador de la cuenta que lo creó (`uid`), no solo un nombre escrito a mano. El nombre puede cambiar; el identificador no. Eso permite distinguir dos cosas que no son lo mismo: **de quién es el gasto** (editable: puedes registrar una compra que hizo tu pareja) y **quién lo registró** (automático, se estampa al guardar). Al entrar por primera vez, cada persona queda inscrita en el hogar con su nombre, y todos ven los mismos nombres y colores.

**Por persona** — En Estadísticas, el desglose de cada integrante: cuánto gastó y qué porcentaje del total representa, cuánto ingresó, su aporte neto, número de compras, ticket promedio, qué proporción de su gasto es prescindible, en qué categoría gasta más y cuántos movimientos registró en el mes. Con una barra comparativa arriba y un color fijo por persona que se repite en todo el libro.

**Detalle al tocar** — El gráfico de anillo, las filas de la tabla de categorías, los sobres del panel y las tarjetas de cada persona se tocan para abrir el desglose: cada movimiento con su fecha, concepto, **quién lo hizo**, medio de pago (y tarjeta, si fue a crédito) y monto. Arriba, el total del grupo, cuántos movimientos son, el ticket promedio, qué porcentaje del gasto del mes representan y el reparto entre las dos personas. Desde ahí se toca cualquier movimiento para editarlo.

**Gráfico de ritmo** — Acumulado del periodo contra la línea de presupuesto. La curva de gasto lleva área sombreada, un punto en cada día y una marca hueca en el último dato: en los primeros días del periodo la línea queda pegada al eje y sin eso resulta invisible. Con un único día registrado se dibuja el punto, porque una polilínea de un solo vértice no pinta nada. Si el periodo aún no tiene gastos, lo dice en texto en vez de mostrar un gráfico vacío.

**Estadísticas** — Acumulado del mes contra la línea de presupuesto, reparto por categoría, comparativo de los últimos seis meses, gasto por día de la semana, ticket promedio, frecuencia de compra, medio de pago, gasto por miembro y conceptos más repetidos.

**Pagos de deuda** — Al registrar un gasto en la categoría `DEU` aparece el selector *¿A qué deuda se aplica?*, y el monto se resta del saldo de esa entidad. Funciona igual desde el botón **+** que desde *Registrar pago* de cada deuda: ambos caminos crean el mismo tipo de movimiento y aplican el descuento por la misma vía, así que no hay doble resta. Corregir el monto de un pago ajusta el saldo por la diferencia, y eliminarlo lo devuelve.

**Intereses rotativos** — Al editar una deuda, el saldo que escribes se compara con el que tenía y la diferencia se registra sola:

- **Si sube**, es lo que creció la deuda sin que compraras nada: intereses del rotativo, comisiones, seguros. Se anota como gasto del periodo en la categoría `DEU` y suma a la deuda, igual que una compra a crédito — cuenta como costo pero no baja el disponible, porque el dinero aún no ha salido.
- **Si baja**, es un pago que no se había anotado: se registra como tal y sí baja el disponible.
- **Si es un error de tecleo**, la casilla *solo corregir la cifra* cambia el número sin dejar rastro.

Mientras escribes, la ventana dice qué va a registrar. Los intereses se cuentan aparte de las compras en la lista de deudas y en el Excel, porque mezclarlos falsearía el aviso de *"cargas más de lo que pagas"*. Cuando pesan, el motor lo señala con su proyección anual.

**Deudas** — Tarjetas y préstamos con saldo, tasa y pago mensual. Calcula meses hasta liquidar e intereses totales, ordena por método avalancha (primero la tasa más alta) y simula qué pasa si abonas extra cada mes.

**Compras a crédito** — Al elegir *Crédito* como medio de pago aparece el selector *¿A qué tarjeta o deuda se carga?*, con **todas** las deudas registradas —no solo las tipadas como tarjeta: una línea de crédito o un "cuotas sin tarjeta" también reciben cargos—. Viene preseleccionada la primera, para que una compra no quede sin asignar por descuido; *Sin asignar a ninguna deuda* sigue estando como opción explícita al final. El monto se suma al saldo de esa deuda, y corregir o eliminar la compra lo devuelve.

Es el mismo criterio que en los pagos: el movimiento guarda a qué entidad apunta, y el saldo se mueve por una sola vía.

La app distingue **devengo** de **caja**, que es la única forma de que los números cuadren:

| | Cuenta en su sobre | Baja el disponible | Mueve la deuda |
|---|---|---|---|
| Compra con débito o efectivo | Sí | Sí | — |
| Compra con tarjeta de crédito | Sí | **No** | Sube |
| Pago de la tarjeta | **No** | Sí | Baja |
| Cuota de un préstamo | Sí (sobre DEU) | Sí | Baja |

Una compra a crédito consume presupuesto pero no saca dinero de la cuenta: sale cuando pagas la tarjeta. Si se restaran las dos cosas, el mismo gasto se descontaría dos veces del disponible. En un préstamo es distinto: no hay compras registradas detrás, así que la cuota **es** el gasto del mes.

Esta distinción alcanza también al arrastre entre periodos y al saldo teórico del cierre, que se calculan sobre movimientos de caja: son los que explican el saldo real del banco. Si corriges un movimiento (cambias el monto, lo pasas a otra tarjeta o a efectivo) o lo eliminas, el saldo se reajusta solo. Y si en un mes cargas más de lo que pagas, aparece una recomendación avisando de cuánto está creciendo la deuda.

**Cuentas de ahorro** — Dónde vive el dinero ahorrado: cuenta del banco, depósito a plazo, fondo, efectivo guardado. Cada una con institución, tipo, titular (una persona o el hogar) y **saldo inicial configurable**, que es lo que había antes de empezar a registrar.

El botón **+** tiene ahora tres pestañas: *Gasto*, *Ingreso* y ***Ahorrar***. En Ahorrar eliges la cuenta de destino, si es aporte o retiro, el monto y **quién transfiere**. Un aporte no es un gasto —el dinero sigue siendo tuyo— pero **sale del disponible del mes de quien lo transfiere**: ya no puede gastarlo. Un retiro lo devuelve. La casilla *solo mueve la cuenta* sirve para intereses, comisiones y traspasos, que cambian el saldo sin tocar el presupuesto del mes.

Desde cada cuenta hay botones directos de *Aportar* y *Retirar*, y al tocarla se ve su historial completo con saldo inicial, total aportado, total retirado y cada movimiento.

**Composición del disponible** — Bajo la cifra grande del panel aparece de quién es ese saldo: *Ana $X · Luis $Y*. El arrastre del periodo anterior se reparte entre las personas, no se muestra como un bloque del hogar: el cierre guarda el saldo de cada una, así que se sabe a quién pertenece. Solo aparece *sin asignar* si hay movimientos atribuidos a alguien que no está en el hogar. Cada nombre se toca para ver sus movimientos del mes. El disponible de cada persona es su ingreso —registrado o estimado— menos sus gastos, menos lo que transfirió a ahorro, más lo que retiró.

**Metas** — Objetivos con monto y fecha límite. Calcula cuánto necesitas apartar cada mes y cada semana, y lleva el progreso acumulado.

**Ahorro** — Encabeza con el **ahorro real del hogar**: lo que entró menos lo que salió, sumando a las dos personas, con su tasa sobre los ingresos, la proyección a fin de mes y el avance de la meta. Debajo, *quién aporta qué*: ingresos, gastos y tasa de ahorro de cada integrante. Y el histórico de seis meses.

Solo después vienen las **oportunidades detectadas**, que son otra cosa y así se explica en pantalla: no es lo que ahorras, sino cuánto más podrías ahorrar. El motor de recomendaciones trabaja sobre tus propios datos: sobres excedidos, ritmo de gasto por encima del presupuesto, compras hormiga, categorías en alza contra el mes anterior, suscripciones, patrones de día de la semana, carga de deuda sobre el ingreso y avance de metas. Cada recomendación viene con una cifra estimada de ahorro mensual.

**Ajustes** — Presupuesto por sobre (con sugerencia automática según el promedio de tus últimos tres meses), ingreso estimado por persona, meta de ahorro, moneda, miembros, código de sincronización y descarga del reporte.

**Reporte en Excel** — Un `.xlsx` con ocho hojas: *Resumen* del mes con la proyección y el presupuesto, *Movimientos* completos, *Por categoría* con presupuesto contra gasto y variación, *Por persona*, *Evolución* de los últimos seis meses, *Deudas* con meses hasta liquidar e intereses, *Metas*, y *Recomendaciones* con su cifra y si suma o no al ahorro potencial. Los importes llevan formato de moneda y los porcentajes formato de porcentaje, con anchos de columna ajustados: se puede armar una tabla dinámica sin tocar nada. La librería se descarga solo al pedir el reporte; sin conexión, la app cae a un CSV y avisa.

## Conciliar caja cuando quieras

En el panel hay un botón **Conciliar ahora**: eliges una fecha —hoy o cualquier día pasado—, anotas el saldo real de cada persona y la diferencia contra lo que la app calcula se registra como gasto hormiga en esa misma fecha. No cierra el periodo ni ancla el arrastre: es un punto de control.

**El *debería tener* es exactamente el disponible por persona que muestra el panel**: su parte del arrastre más sus movimientos de caja del periodo hasta esa fecha. No es un cálculo paralelo, es el mismo número — si fueran dos caminos distintos no tendrían por qué coincidir, y esa era justo la causa de que no cuadrara.

Después de conciliar, el disponible del panel pasa a ser el saldo que declaraste: el ajuste explica la diferencia y las dos cifras vuelven a ser la misma.

Si el ingreso estimado de una persona supera lo que ha entrado de verdad, la ventana lo avisa: el panel suma dinero que aún no ha llegado, y en la conciliación solo se cuenta lo recibido.

El cierre de un periodo pasado se fecha en su último día, no en el de hoy, para que los movimientos posteriores caigan en el periodo siguiente.

## Cerrar el periodo y cuadrar la caja

Al terminar un periodo —o en sus últimos dos días— el panel ofrece **cerrarlo**. Se anota el saldo **real** que tiene cada persona en sus cuentas de uso diario y la app lo compara con el **saldo teórico**:

```
saldo teórico = saldo real declarado en el cierre anterior
              + ingresos − gastos − aportes + retiros del periodo
```

La diferencia se registra como **gasto no registrado** (categoría `NRG`), o como ingreso no registrado si sobra dinero. Ahí es donde aparecen las compras hormiga que nunca se anotan: el café, las propinas, el efectivo suelto.

Detalles del diseño:

- **Cada cierre arranca del saldo declarado en el anterior**, no de un acumulado teórico, así que un error de un mes no se arrastra a los siguientes.
- **El saldo diario por gastar** es el presupuesto del periodo menos lo gastado a la fecha, dividido por los días que quedan. Los cargos fijos que aún no han llegado **no** se descuentan de esa cifra: se informan debajo como *comprometidos en fijos*, para que el número diario sea el que uno espera y no uno ya recortado sin avisar.
- **Los cargos fijos pendientes son solo los recurrentes.** En la proyección de cierre, un cargo se da por pendiente únicamente si aparece en al menos dos de los tres periodos anteriores: con uno solo no hay forma de distinguir un fijo de una compra puntual. Y se da por pagado si este periodo hay un gasto de su misma categoría cuyo concepto coincide, lo contiene o está contenido en él —*Arriendo* y *Arriendo casa* son lo mismo— o con un importe casi idéntico. La cifra es inspeccionable: se toca *+ fijos por pagar* en el desglose —siempre visible, atenuado cuando es cero— y se ve la lista con cuántos periodos lleva cada cargo.
- **Los ajustes generados por un cierre se excluyen del saldo teórico**: son una conclusión, no un movimiento real. Por eso volver a cerrar el mismo periodo da la misma diferencia y reemplaza el ajuste anterior en lugar de duplicarlo.
- **Un campo en blanco significa "no lo sé"**, no cero: esa persona queda fuera del cierre en vez de generar un ajuste inventado.
- **El primer cierre pide el saldo de partida.** Sin cierre anterior no hay línea base, así que se pregunta con cuánto empezó cada persona el periodo. Con ese dato la diferencia ya es real y se genera el ajuste igual que en cualquier otro cierre. Si se deja en blanco, el teórico da por hecho que partieron de cero y la diferencia saldrá inflada — la app lo advierte.
- **La diferencia va al gasto del periodo.** El ajuste se registra en la categoría `NRG`, que es un gasto como cualquier otro: entra en el total del periodo, en las estadísticas y en el reparto por persona. Así el gasto mostrado refleja lo que de verdad salió, no solo lo que se anotó.
- **Cerrar ancla el disponible.** A partir del cierre, el arrastre deja de acumularse desde estimaciones y parte de los saldos reales declarados. En la cinta se lee *saldo real al cierre de ago*, y el periodo cerrado muestra **Saldo cuadrado** con esa cifra en lugar de un disponible teórico. Es lo que hace que cerrar sirva de algo: la desviación acumulada se corta en cada cierre en vez de arrastrarse.

En la vista Ahorro aparece **Gasto hormiga detectado**: el histórico de estas diferencias por periodo, su promedio, la proyección anual y en cuántos cierres hubo fuga. Cuando la cifra es significativa, el motor de recomendaciones la señala. El Excel suma una hoja **Cierres** con el detalle por persona.

## Lo que sobra de un periodo

Lo que no se gasta no desaparece: sigue en la cuenta. Al cerrarse un periodo, su saldo pasa al siguiente como **remanente**, y se acumula. Aparece como primera línea del corte del mes —*viene del periodo anterior*— y entra en el disponible.

Al empezar un periodo con remanente positivo, el panel avisa y ofrece **apartarlo en una cuenta de ahorro** con un toque: se registra como aporte del día, sale del disponible corriente y entra al saldo de la cuenta. El aviso se puede ocultar y no vuelve en ese periodo.

El arrastre se cuenta desde el primer periodo con ingresos registrados, porque antes de eso los datos están incompletos y saldría falseado. En **Ajustes → Hogar** se puede desactivar para que cada periodo empiece de cero.

## Ciclo mensual configurable

Muchas familias no viven del 1 al 31 sino del día de pago al siguiente. En **Ajustes → Hogar** se elige el día en que empieza el ciclo (1 a 28). Con el día 10, el periodo va del 10 de agosto al 9 de septiembre, y el sueldo cae junto a los gastos que cubre.

Afecta a todo de forma coherente: qué movimientos entran en el periodo, los días transcurridos y restantes, el ritmo variable, la proyección de cierre, el gráfico de acumulado —que rotula los días reales del calendario, del 10 al 9—, la comparación con el periodo anterior, las alertas de sobre y el reporte en Excel. Las flechas de la cabecera navegan entre periodos, no entre meses naturales.

El valor por omisión es el día 1, que equivale al mes natural: si no lo cambias, nada se mueve de sitio.

## Clima

En la cabecera, junto a las flechas del periodo, hay un indicador con el icono del tiempo, el **nombre de la ubicación**, la temperatura y la **velocidad del viento en color** según su intensidad:

| km/h | Tramo | Color |
|---|---|---|
| menos de 12 | calma | neutro |
| 12 – 28 | brisa | verde |
| 29 – 49 | viento moderado | ámbar |
| 50 – 74 | viento fuerte | rojo |
| 75 o más | temporal | rojo invertido |

Es Beaufort resumido a cinco tramos con significado práctico: cuándo se puede tender ropa, cuándo hay que asegurar cosas fuera y cuándo conviene no salir. Los mismos colores se repiten en la columna de viento del pronóstico, con su leyenda al pie. Cada tema usa sus propios colores semánticos. Al tocarlo se abre el **pronóstico de 7 días**: máxima y mínima, lluvia acumulada en mm con barra proporcional, y racha máxima de viento.

- **Por GPS**: usa la ubicación del dispositivo. El nombre del lugar se resuelve a partir de las coordenadas y se guarda, así que en vez de *Mi ubicación* aparece *Antuco*, tanto en el chip como en el detalle, donde además se marca como *tu ubicación*. Si el permiso está denegado o no hay señal, recurre a la última posición conocida.
- **Ubicaciones fijas**: hasta cinco, buscando por nombre de ciudad. Se guardan en la configuración del hogar, así que las ven ambos.

Los datos vienen de [Open-Meteo](https://open-meteo.com), que no requiere clave de API ni registro. Se refrescan cada media hora.

**El icono nunca se vacía.** Al abrir la app se pinta al instante con la última lectura guardada, antes incluso de consultar la red. Si la petición falla o el GPS está denegado, conserva ese valor en vez de borrarlo: un dato de hace unas horas informa más que un hueco. En ese caso lleva un punto atenuado al lado y el título dice cuándo se obtuvo — *"Valdivia · lluvia · hace 5 h"*—, y la ventana del pronóstico lo repite bajo el nombre del lugar. Solo aparece el guion cuando nunca se ha llegado a obtener nada.

## Cabecera fija

La cabecera —título, clima, periodo y botón de menú— queda fija arriba: el menú ☰ está siempre a un toque sin tener que subir al principio de la página. Se usa `position:fixed` y no `sticky` porque, con `overflow-x:hidden` en el body, sticky deja de anclarse al viewport en varios navegadores móviles. El hueco bajo la cabecera se reserva midiendo su alto real, que cambia según el ancho de pantalla.

**El nombre del hogar es editable.** Aparece bajo el título y se toca para cambiarlo; también hay un campo en Ajustes → Sincronización. Es solo una etiqueta: el **código del hogar no cambia nunca**, así que nadie pierde la conexión al renombrarlo. La ventana lo recuerda mostrando el código al pie.

## Navegación

Las secciones viven en una **barra lateral**, no en una barra inferior:

- **Desde 960px de ancho** está siempre visible a la izquierda y el contenido se desplaza para dejarle sitio.
- **Por debajo** se comporta como un cajón: se abre con el botón **☰** de la cabecera y se cierra al elegir una sección, al tocar fuera, con Esc o con el botón atrás del móvil.

Frente a la barra inferior gana dos cosas: los nombres de sección se leen completos —caben las siete sin apretarse— y se recuperan unos 60px de alto útil en el móvil, que es donde más falta hacen.

## Botón atrás del móvil

Android manda el botón atrás al historial del navegador, así que por defecto la primera pulsación cerraría la app aunque tuvieras una ventana abierta. La app lleva su propio historial:

1. Si hay una ventana abierta, atrás la cierra —igual que la ✕, Cancelar o Esc, que están sincronizados con el mismo mecanismo—.
2. Si no hay ventana, vuelve a la pestaña anterior: Ahorro → Estadísticas → Movimientos → Panel.
3. Cuando ya no queda nada dentro de la app, avisa: *"Estás al principio · pulsa atrás otra vez para cerrar la app"*. Solo la segunda pulsación, dentro de los cuatro segundos siguientes, la cierra.

## Paleta de los gráficos

En los temas **cálido** y **oscuro** los once colores de categoría se armonizan al vuelo: se conserva el tono de cada uno pero se unifican saturación y luminosidad, para que la paleta se lea como una familia en vez de once colores sueltos compitiendo.

Unificarlo todo tendría un efecto secundario: educación y ocio, ambas ámbar con dos grados de diferencia, quedarían indistinguibles. Por eso las categorías se ordenan por tono y la luminosidad alterna en tres escalones, de modo que dos vecinas nunca caen en el mismo nivel. Funciona igual con los sobres propios que crees, sin tener que asignarles nada.

## Formato de los importes

Todos los importes se muestran como enteros con separador de miles, sin decimales: en un presupuesto doméstico los céntimos solo añaden ruido. **También los campos de captura**: se formatean mientras escribes, así que ves `211.000` en lugar de `211000` y no hay que contar ceros. El separador es el de tu configuración regional. Los campos usan teclado numérico y aceptan que pegues cifras con puntos, comas o signo de moneda: al leerlas se descarta todo lo que no sea dígito. La única excepción es la tasa anual de las deudas, que sí admite decimales porque un 42,5% no es lo mismo que un 42%.

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
