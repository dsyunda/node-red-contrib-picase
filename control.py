#!/usr/bin/python3
import RPi.GPIO as GPIO
import sys
import os
from time import sleep

raw_input = input  # Python 3

bounce = 25
path = (os.path.dirname(os.path.abspath(__file__)))

if len(sys.argv) > 1:
    cmd = sys.argv[1].lower()
    GPIO.setmode(GPIO.BCM)# utilizamos la numeracion BCM de la placa
    GPIO.setwarnings(False)

    if cmd == "lout":
        des = int(sys.argv[2])
        
        def write_txt_led(data):
            with open(path+'/TXT_Files/Leds/led'+str(des)+'.txt', 'w') as bit:
                bit.write(str(data))
                
        write_txt_led(0)
        
        while True:
            try:
                data = raw_input()
                if 'close' in data:
                    write_txt_led(0)
                    sys.exit(0)
                data = int(data)
            except (EOFError, SystemExit):
                sys.exit(0)
            if data != 0:
                data = 1
            write_txt_led(data)

    elif cmd == "di":
        pin = int(sys.argv[2])
        
        def handle_callback(chan):
            sleep(bounce/1000.0)
            print(GPIO.input(chan))
            
        GPIO.setup(pin,GPIO.IN,GPIO.PUD_DOWN)
        GPIO.add_event_detect(pin, GPIO.BOTH, callback=handle_callback, bouncetime=bounce)

        sleep(0.1)
        print(GPIO.input(pin))

        while True:
            try:
                data = raw_input()
                if 'close' in data:
                    sys.exit(0)
            except (EOFError, SystemExit):
                GPIO.cleanup(pin)
                sys.exit(0)

    elif cmd == "s":
        des = int(sys.argv[2])
        datos = []
        
        def read_buttons():
            with open(path+'/TXT_Files/Buttons/buttons.txt') as archivo:
                for linea in archivo:
                    datos.append(linea.strip('\n'))
            button = 0
            for i in range(len(datos)):
                if i == des:
                    button = datos[i]
            datos.clear()
            sleep(0.004)
            return button
        
        pin_1 = read_buttons()
        print(pin_1)
                
        while True:
            try:
                pin_read = read_buttons()
                if pin_read != pin_1:
                    print(pin_read)
                pin_1 = pin_read
            except:
                sys.exit(0)
            
    elif cmd == "do":
        des = int(sys.argv[2])
        
        def write_txt_out(data):
            with open(path+'/TXT_Files/DOs/DO'+str(des)+'.txt', 'w') as bit:
                bit.write(str(data))
                
        write_txt_out(0)
        
        while True:
            try:
                data = raw_input()
                if 'close' in data:
                    write_txt_out(0)
                    sys.exit(0)
                data = int(data)
            except (EOFError, SystemExit):
                sys.exit(0)
            if data != 0:
                data = 1
            write_txt_out(data)
            
    elif cmd == "adc":
        des = sys.argv[2]
        prom = []
        S_K = 0
        alpha = 0.05
        mean = 0.0
        def read_adcs():
            with open(path+'/TXT_Files/ADC/adc'+des+'.txt') as archivo:
               dato = archivo.read()
            if not dato:
                dato = str(adc_1);
            adc = float(dato)
            return adc
        
        adc_1 = read_adcs()
        prom.append(adc_1)
        print(adc_1)
                
        while True:
            try:
                adc_read = read_adcs()
                if len(prom) < 10:
                    S_K = alpha*adc_read+(1-alpha)*S_K
                    prom.append(round(S_K, 1))
                else:
                    mean = round(sum(prom)/float(len(prom)), 1)
                    prom.clear()
                    
                if mean != adc_1:
                    print(mean)
                    sleep(0.2)
                adc_1 = mean
                
            except:
                sys.exit(0)
            
    elif cmd == "dac":
        des = sys.argv[2]
        
        def write_txt_dac(data):
            with open(path+'/TXT_Files/DACs/dac'+str(des)+'.txt', 'w') as bit:
                bit.write(data)  
        
        write_txt_dac('0')
        
        while True:
            try:
                data = raw_input()
                if 'close' in data:
                    write_txt_dac('0')
                    sys.exit(0)
            except (EOFError, SystemExit):
                data = '0'
                sys.exit(0)
            write_txt_dac(data)

else:
    print("Parametros Incorrectos - Revisar que se cumpla con los requerimientos y argumentos")