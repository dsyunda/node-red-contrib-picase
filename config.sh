#!/bin/bash

sudo chmod 777 control.py
echo "Nuevo permiso para control.py ejecutado con exito"

sudo cp config/PiCase.service /lib/systemd/system/PiCase.service
sudo chmod 644 /lib/systemd/system/PiCase.service
sudo systemctl daemon-reload
sudo systemctl enable PiCase.service
rm -r config

echo "Servicio creado con exito"

exit