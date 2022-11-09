## Changelog
Todos los cambios de versiones en este proyecto se documentarán en este archivo.

El formato se basa en [Keep a Changelog](https://keepachangelog.com/en/1.0.0/ "Keep a Changelog").

## [1.0.3] - 2022-11-04
### Changed
- Se realizaron cambios en el archivo picase-control.js para los estados de algunos nodos.
- Se corrigió el error de detener la ejecución del nodo **DIs** al momento de realizar `Deploy` sin seleccionar un tipo de entrada en el archivo picase-control.js.

### Fixed
- Las salidas digitales ahora inician apagadas al ejecutar I2C_SPI.py.

## [1.0.2] - 2022-09-10

### Added
- Cambios en el archivo package.json, donde en la descripción se especifica que la librería es para Node-RED y que la versión de Node-RED debe ser igual o superior a la 2.2.2.
- Cambios en el titulo del archivo README, se cambió de node-red-picase a node-red-contrib-picase.

## [1.0.1] - 2022-09-09

### Changed
- Cambios de los comandos de instalación del archivo README.
- Cambios de la ruta del servicio en el archivo PiCase.service.
 
## [1.0.0] - 2022-09-09

### Added
 - Primera versión publicada en npm.