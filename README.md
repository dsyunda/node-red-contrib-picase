**node-red-contrib-picase**
=====================
Libreria para controlar los pines de la PiCase por medio de [Node-RED](https://nodered.org/ "Node-Red"), donde el funcionamiento lo realiza librerias de python como *[RPi.GPIO](https://pypi.org/project/RPi.GPIO/ "RPi.GPIO")* para controlar los pines digitales de la Raspberry,  *[smbus](https://pypi.org/project/smbus2/ "smbus")* para controlar los [MCP23017](https://www.microchip.com/en-us/product/mcp23017 "MCP23017") (expansores digitales) por medio de I2C y *[spidev](https://pypi.org/project/spidev/ "spidev")* para  controlar los expansores analogicos los cuales  son el [MCP3204](https://www.microchip.com/en-us/product/MCP3204 "MCP3204") (ADC de 12 bits) y [MCP4822](https://www.microchip.com/en-us/product/MCP4822 "MCP4822") (DAC de 12 bits) que se comunican por medio de SPI.

**Nota:** La versión de Python para el desarrollo y despliegue es la 3.

##### Características de los pines de la control PiCase

| Componente | Descripción                    |
| :---------------: | :---------------:|
| Entrada digitales      | Dispone de 8 entradas digitales TTL  a 5 VDC     |
| Salidas digitales    | Dispone de 8 salidas digitales a relé máximo a 125 VAC a 0.3 A o  24 VDC a 1 A  |
| Leds   | Dispone de 8 leds, 4 de color verde y 4 de color rojo    |
| Pulsadores   | Dispone de 8 pulsadores de color rojo    |
| Entradas analógicas   | Dispone de 2 entradas de tensión de 0 V a 10 V y 2 de corriente de 4 mA a 20 mA|
| Salidas analógicas   | Dispone de 2 salidas de tensión de 0 V a 10 V y 2 de corriente de 4 mA a 20 mA   |

## Instalación
Use el menú de Node-RED y realice la instalación por medio del *Manage palette*, o ejecute el siguiente comando en el directorio de Node-RED, normalmente es `~/.node-red`.

    	npm i @dsyunda/node-red-contrib-picase

Después de realizar la instalación del paquete, se debe ejecutar un archivo bash que nos va a dar permisos en el archivo *control.py* y también a crear y activar un servicio para poder ejecutar el archivo *I2C_SPI.py* cada vez que reiniciemos la PiCase.

Abra una nueva terminal y ejecute los siguientes comandos.

    cd ~/.node-red/node_modules/@dsyunda/node-red-contrib-picase
    sh config.sh

Después reiniciaremos la PiCase para aplicar los cambios. Cuando reinicie la PiCase ejecutaremos el siguiente comando en el terminal para corroborar de que el servicio se esté ejecutando con éxito.

    sudo systemctl status PiCase.service

## Uso
### Entradas digitales (DIs)
Genera un `msg.payload` con valores de 0 o 1 dependiendo del estado de la entrada.

**Nota:** el `msg.payload` envía valores tipo *number*.

**Advertencia:** las entradas digitales son TTL por lo que su tensión máxima recomendada son a *5 VDC*.

### Pulsadores (Buttons)
Genera un `msg.payload` con valores de 0 o 1 dependiendo del accionamiento del pulsador.

**Nota:** `msg.payload` envía valores tipo *number*.

### Leds (LEDs)
La entrada del nodo puede recibir `msg.payload` de 0 o 1 tipo *number, string o bool (true o false)*.

**Nota:** el valor inicial del pin cuando se realiza un `Deploy` es 0.

### Salidas digitales (DOs)
La entrada del nodo puede recibir `msg.payload` de 0 o 1 tipo *number, string o bool (true o false)*.

**Nota:** el valor inicial del pin cuando se realiza un `Deploy` es 0.

**Advertencia:** las salidas son a relé y soportan un tensión máxima de *125 VAC* a *0.3 A* o  *24 VDC* a *1 A*.

### Entradas analógicas (ADCs)
Genera un `msg.payload` con valores de 0 a 100 dependiendo de la lectura de entrada.

##### Notas 
- `msg.payload` envía valores tipo *number*.
- El rango de tensión de entrada es de 0 V a 10 V.
- El rango de corriente de entrada es de 4 mA a 20 mA.

### Salidas analógicas (DACs)
La entrada del nodo puede recibir `msg.payload` de 0 o 100 tipo *number o string*.

##### Notas 
- El valor inicial del pin cuando se realiza un `Deploy` es 0.
- El rango de tensión de salida es de 0 V a 10 V.
- El rango de corriente de salida es de 4 mA a 20 mA.
