# 17-18/03/2026

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

## CREACIÓN DE LOS MARKDOWN

En este paso se crearán todos los markdown con el texto e imagenes correspondientes
Por lo que primero se crea una carpeta llamada `md_pages` que contendra todos los markdown
Para este primer caso de creación de paginas web usaremos para el subrayado marron un compoenente
por lo que usaremos archivos `.mdx`
Para ello `npx astro add mdx` y aceptamos todo y en la carpeta `components` creamos un componente
para este fin.
Y instalar la extension de mdx en VS

- [] Crear Markdown de todas las páginas
- [] Asignar las variables en cada markdown como corresponde
- [] Comenzar con el proceso de automatización de creación de páginas a traves de una página madre
- [] Corrregir errores de markdown
- [] En vez de poner el nombre del archivo que todas las páginas se llamen Hotel Rural El Quintanal en `tituloPage`

Me quede en Hotel rural → queda hacer el enrutamiento y el formulario + validaciones
