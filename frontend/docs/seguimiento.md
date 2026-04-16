# 17-20/03/2026

## PLANTEAMIENTO DE LAS PÁGINAS

Todas las páginas de esta web poseen el mismo esquema:

1. En el inicio tenemos el `Navigation`
2. Luego va un texto sobre la página
3. Se colocan fotografías
4. (Añadir) un Footer ya que la original no tiene

La unica diferencia es que la página `Fotos` no tiene texto es solo fotos.

### PRIMER PLANTEAMIENTO

Las páginas se crearan a través de un [tag].astro, un sistema de enrutamiento
que usara markdown para crear páginas, a la vez que mediante variables de markdown y frontmatter
se automatizara el Navigation.

El funcionamiento general y esperado es:

1. Se crea una página que recopilara toda la información de los markdown.
2. Esa página usando un Layout a través de una variable `categoria` creara
    un total de n páginas con un título diferente y no duplicado
3. Estas páginas creadas, se crean basandose en un LayaoutBase que contiene el `Navigation` y `Footer`
    además el layaout base es el que recibe el resto de variables para completementar la página con frontmatter
4. Por último el enrutamiento automático se creara en base a la variable `categoria` que recibira todos
    los valores existentes y los enviara al `Navigation` asi este creará n links para cada página

El objetivo final es crear una página madre que automáticamente detecte lo archivos markdown que comparten el
patron anteriormente mencionado, esta página madre creará el resto de páginas a partir de uan variable `categoria`
Y para acceder entre ellas con links el `Navigation` recibira usando `glob` y `frontmmatter` los n valores
de `categoria` y creara n links a esas páginas evitando duplicaciones y creando automatización de creación de páginas
y que estas se añadan al menú.

## DESARROLLO DEL NAVIGATION

En `src/components/navigation` son 3 componentes secundarios y un componente
principal que forman el navigation.
Funciona de manera que desde una página envia los parámetros `isContat` y `isHome`
de forma booleana, asi se marcan como que estamos en Home o Conatact o no

El navigation se adapta perfectamente cuando el tamaño de la pantalla se reduce a menos
de 768px o mayor a 481px.

La estrcutura del navigation es que se forma a partir de 2 partes, un bloque para los iconos
y otro bloque para los links. Y tiene un margen de 100 pixeles en top para que se pueda ver el titulo
ya que el titulo de página se encuntra en la propia fotografía de fondo
Cuando es para movil este margen desaparece y aparece una barra negra con un meno desplegable.

- [] Elegir tipografias
- [] Elegir tamaños de las letras
- [] Automatizar y enrutar los `<LinkNavigation>`
- [] Perfeccionar algunos detalles
- [] Optimizar los archivos css (revisión de estilos no usados)
- [] Mejorar accecibilidad del componente
- [] Arreglar minimización (Posible solución cambiar fondo en menores tamaños)

## DESARROLLO DEL LAYOUT PRINCIPAL

El layout a estas fechas tiene el `Navigation`.
Tambien contiene el `global.css` que contiene la configuración de la imagen de fonto y otras configuraciones.
Este layout recibe una imagen y la coloca como fondo mediante el `imageBack`
Y tambien recibe el `isHome, isConctact` del Navigation y recibe su propia variable que es `titulo_page`

Aunque este modelo es solo una base ya que con la automatización con markdown se espera recibir
todos los parametros como textos, imagen de fonto, fotos y variables

- [] Se espera que reciba los datos de los markdown y pase esos valores a donde corresonde.
- [] Preguntar cuando el fondo se hace más pequeño si conservar mi opción o conservar la versión antigua
- [] Recordar cambiar el logo svg por el de astro en el title de cada página.

IMPORTANTE: RECUERDA QUE LOS MD son para exportar el contenido a componontes NO para crear paginas
a partir de MD.

## CREACIÓN DE LOS MARKDOWN

En este paso se crearán todos los markdown con el texto e imagenes correspondientes
Por lo que primero se crea una carpeta llamada `md_pages` que contendra todos los markdown
Para este primer caso de creación de paginas web usaremos para el subrayado marron un compoenente
por lo que usaremos archivos `.mdx`
Para ello `npx astro add mdx` y aceptamos todo y en la carpeta `components` creamos un componente
para este fin.
Y instalar la extension de mdx en VS

- [x] Crear Markdown de todas las páginas
- [] Replantear estructura de las páginas que no siguen patrón.
- [] Asignar las variables en cada markdown como corresponde
- [] Comenzar con el proceso de automatización de creación de páginas a traves de una página madre
- [] Corrregir errores de markdown
- [] En vez de poner el nombre del archivo que todas las páginas se llamen Hotel Rural El Quintanal en `tituloPage`

Me quede en Hotel rural → queda hacer el enrutamiento y el formulario + validaciones

## FORMULARIO SES

En el caso del Titular:

|Nombre Parámetro|Tipo|Condición|
|---|---|---|
|nombre|String 50|Nombre de la persona|
|apellido1|String 50|Apellido e la persona de la persona|
|apellido2|String 50|Obligatorio si su tipod de documento es NIF|
|tipoDocumento|String 5|Obligatorio si la persona es mayor de edad (NIF, DNI,PASSPORT)|
|numeroDocumento|String 15|Obligatorio si la persona es mayor de edad (NIF, DNI,PASSPORT)|
|soporteDocumento|String 9|Obligatorio si es DNI o NIF|
|fechaNacimiento|Fecha: AAAA-MM-DD|Fecha de nacimiento|
|telefono o telefono2|String 20|Tiene que haber en caso de no haber correo|
|correo|String 250|Tiene que haber en caso de no haber telefono|
|direccion|Bloque|Apartado 4.1|
|direccion|string(100)|Direccion de la persona|
|codigoMunicipio|String(5)|Obligatorio si el pais es España, usar códigos de los municipios de la INE|
|nombreMunicipio|String(100)|Obligatorio cuando el pais no es España|
|codigoPostal|String(20)|Codigo Postal|
|pais|String(3)|Codigo del pais segund la norma ISO 3166-1 Alfa-3|

En el caso de los acompañantes:

|Nombre Parámetro|Tipo|Condición|
|---|---|---|
|nombre|String 50|Nombre de la persona|
|apellido|String 50|Primer apellido de la persona|
|apellido2|String 50|Obligatorio si su tipod de documento es NIF|
|tipoDocumento|String 5|Obligatorio si la persona es mayor de edad (NIF, NIE,PAS,OTRO)|
|numeroDocumento|String 15|Obligatorio si la persona es mayor de edad (NIF, NIE,PAS.OTRO)|
|soporteDocumento|String 9|Obligatorio si es NIF o NIE|
|fechaNacimiento|Fecha: AAAA-MM-DD|Fecha de nacimiento|
|parenteso|String(5)|Obligatorio si la persona es menor de edad(Tiene una lista de códigos, al ser menor de edad elegimos solo aquellos codigos que son de alguien menor de edad)|
|direccion|Bloque|Apartado 4.1|
|direccion|string(100)|Direccion de la persona|
|codigoMunicipio|String(5)|Obligatorio si el pais es España, usar códigos de los municipios de la INE|
|nombreMunicipio|String(100)|Obligatorio cuando el pais no es España|
|codigoPostal|String(20)|Codigo Postal|
|pais|String(3)|Codigo del pais segund la norma ISO 3166-1 Alfa-3|

Datos que crea el formulario o son generales:

|Nombre Parámetro|Tipo|Condición|
|---|---|---|
|rol|String 2|Valores de TI o VI (Para el parte tiene que ser VI). Lo indica el propio formulario|
|fechaContrato|Fecha: AAAA-MM-DD|La hora a la que se envia el formulario|
|fechaEntrada|Fecha:AAAA-MMDDT00:00:00.|El formulario tendra una opción para este dato|
|fechaSalida|Fecha:AAAA-MMDDT00:00:00.|El formulario tendra una opción para este dato|
|numPersonas|Number|Se crea por el número de entradas en el formulario|

### Condiciones antes de enviar

1. Contacto mínimo (Titular): Debe existir al menos un telefono o un correo.
2. Coherencia de fechas: La fechaSalida debe ser estrictamente igual o posterior a la fechaEntrada.
3. El numPersonas calculado dinámicamente debe coincidir exactamente con el Titular (1) + el número de Acompañantes añadidos.
4. Mayoría de edad del Titular: El Titular que firma/registra debe ser mayor de edad en el momento de la fechaContrato.
5. Completitud de Acompañantes: Si se añade un bloque de acompañante, no puede enviarse incompleto (debe cumplir todas sus validaciones individuales antes de procesar el envío total).

### 2. Lista de validaciones y lógica en los campos (Checklist)

**Validaciones de Formato y Longitud:**

- [ ] Validar que `nombre`, `apellido1` y `apellido2` no superen los 50 caracteres.
- [ ] Validar que el formato del `correo` sea correcto (regex).
- [ ] Validar formato del `telefono` (solo números, prefijos, longitud lógica según país).
- [ ] Validar que el `tipoDocumento` y `numeroDocumento` cumplan con el algoritmo correspondiente si es español (cálculo de la letra del DNI/NIE) o longitud general si es pasaporte.
- [ ] Validar que el código `pais` tenga exactamente 3 letras (ej. ESP, FRA) según la norma ISO 3166-1 Alfa-3.
- [ ] Validar fechas: Ninguna `fechaNacimiento` puede ser una fecha en el futuro.

**Comportamiento Dinámico (Activar/Desactivar/Requerir):**

- [ ] **Lógica de Edad:** Calcular dinámicamente la edad usando `fechaNacimiento`.
  - *Si es Mayor de edad:* Requerir `tipoDocumento` y `numeroDocumento`.
  - *Si es Menor de edad (Acompañante):* Ocultar/desactivar documentos y hacer obligatorio el campo `parentesco`.
- [ ] **Lógica de Documento (DNI/NIF):**
  - *Si `tipoDocumento` es 'NIF' o 'DNI':* Hacer obligatorio el `soporteDocumento` y el `apellido2`.
  - *Si es otro (ej. Pasaporte):* Desactivar o hacer opcionales `soporteDocumento` y `apellido2`.
- [ ] **Lógica de Ubicación (España vs Extranjero):**
  - *Si pais es 'ESP':* Hacer obligatorio `codigoMunicipio` (validar que sean 5 dígitos) y ocultar/desactivar `nombreMunicipio`.
  - *Si pais NO es 'ESP':* Hacer obligatorio `nombreMunicipio` y ocultar/desactivar `codigoMunicipio`.

### Proceso de creación del formulario

Para el formulario en React vamos a usar la libreria de React-Hook-forms
usando `npm install react-hook-form` que esta en su web oficial: <https://react-hook-form.com/get-started>

Para el campo de Codigo del pais vamos a isntalar una librearia llamada `i18n-iso-countries` con
`npm install i18n-iso-countries`

Mini guia:

~~~tsx
import countries from "i18n-iso-countries";
import es from "i18n-iso-countries/langs/es.json";

// Registramos el idioma español
countries.registerLocale(es);

// Obtenemos el objeto con todos los países en formato { "ESP": "España", "ARG": "Argentina"... }
const paisesObjeto = countries.getNames("es", { select: "official" });

// Lo convertimos a un array para poder usar .map()
const listaPaises = Object.entries(paisesObjeto).map(([codigo, nombre]) => ({
  codigo, //Este es para 2 letras es decir ES
  nombre,
}));

const listaPaises = Object.entries(paisesObjeto).map(([codigo2, nombre]) => ({
  codigo3: countries.alpha2ToAlpha3(codigo2), // Convierte "ES" -> "ESP" y en el select ponemos codigo3 en vez de codigo
  nombre,
}));

function Formulario() {
    const { register, handleSubmit } = useForm<IFormulario>();

    return (
        <select {...register("paisIso")}>
            <option value="">Selecciona un país...</option>
            {listaPaises.map((pais) => (
                <option key={pais.codigo} value={pais.codigo}>
                    {pais.nombre}
                </option>
            ))}
        </select>
    );
}
~~~

-[] Rescpecto a los 2000 y pico municipios hay una forma de hacer ese select, pero solo si es necesario.

Una vez ya tenemos toda la esturcutra creada, es decir los campos con todas sus opciones, interfaces de tipo
etc, etc, vamos a hacer que los campos cumplan validaciones es decir, ahora mismo en el campo telefono, puede entrar
cualquier telefono o en el correo puede entrar una sola letra, para validar cada campo Y desactivar y activar campos
siguiendo ciertas condiciones vamos a usar la biblicioteca Zod usando el comando: `npm install zod @hookform/resolvers`

## FORMULARIO SES 2

Objetivos:

- [] Añadir el option de los municipios en caso de ESP
- [] Mejorar el fechaSalida y fechaEntrada con `react-day-picker`
- [] Añadir estilos al formulario
- [] Conexión al Backend con Fetch
- [] Optimiazr isla de Formulario con React

## VERSION FINAL (CON LOS MUNICIPIOS)

Los municipios son sacados de este repositorio <https://github.com/codeforspain/ds-organizacion-administrativa>

### OPTIMIZACION DEL SELECT DE MUNICIPIOS

Se crea un elemento BuscadorMunicipios, para aligerar la carga y es un busador efectivo, para buscar municipios
asi se evita cargar 8100 municipios de un click.

## FOMRULARIO SES 3

- [] Arreglar la compatibilidad de telefono o correo. SI se manda el correo no es necesario el telefono
y si se manda el telefono y esta correcto, no es necesario el correo.

## SEMANA 3

- [] Hacer lo del day picker para ver las habiaciones reservas <https://react-day-picker-v7.netlify.app/docs/getting-started/>
- [] Interfaz user para rellenar el parte d eusers
- [] Interfaz adminsitrador
- [] Pedir a guillermo, que me pase su .venv

### PLANIFICACIÓN DE IDEAS

1. Un cliente accede a la página web, si quiere hacer una reserva tiene que registrarse o inciar sesión.
2. El cliente inicia sesión usando Lucia-Auth y ya puede acceder al formulario y al panel de SUS reservas
    - Entonces lo primero es hacer el sistema de Autenficación, que se conecte a un BD.
3. Al hacer la reserva solo rellena que Él va a hacer una reserva y se envia a la BD
    - Editar formulario y ajustarlo a solo el titular.
4. Cuando la reserva haya sido aprobada, puede ver en su panel de reservas las reservas pendientes, podra hacer reservas, cancelar reservas y rellenar el parte de viajeros de una reserva ya aceptada o cancelarla aunque la hayan aprovado.
    - Hacer panel de administración del cliente.
5. Al aprobar una reserva, puede rellenar el parte de viajeros, es decir se abre un nuevo formulario para el día del checkin
    - Hacer formulario del parte viajero
6. Hacer el calendario para ver las habitaciones libres, para que las reservas no tengan peros.
    - Hacer calendario react reservas.

Conclusión de cliente:

1. [x] Sistema de autentificación.
2. [] Formulario titular.
3. [] Panel de administración del cliente + opciones  sobre una reserva.
4. [] Formulario parte viajero.
5. [] Calendario de habitaciones ocupadas.

Para terminar ya hoy 16 de abril funciona, solo queda pendiente
En el navigation añadir:

- [] Mostrar en el navigation que la sesion esta en marcha
- [] Boton de cerrar sesión

## SEMANA 3,5

### CREACIÓN DEL PANEL DE USUARIO

En este punto se creara el panel de usaurio, para ello usaremos unas cuantas librerias de react,
cabe recalcar que solo se puede acceder al panel de usuario con la cookie inicada.
