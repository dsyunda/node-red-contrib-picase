#!/usr/bin/python3
import smbus
import spidev
import RPi.GPIO as GPIO
import sys
import os

path = (os.path.dirname(os.path.abspath(__file__)))

#Configuracion SPI 
spi = spidev.SpiDev()
spi2 = spidev.SpiDev()
spi.open(0,0)
spi2.open(0,1)
spi.max_speed_hz = 10000
spi2.max_speed_hz = 10000
GPIO.setmode(GPIO.BCM)# utilizamos la numeracion BCM de la placa
GPIO.setwarnings(False)
ce_adc = 23
ce_dac_voltage = 27
ce_dac_current1 = 19
ce_dac_current2 = 20
GPIO.setup(ce_adc, GPIO.OUT, initial=GPIO.HIGH)#CE ADC
GPIO.setup(ce_dac_voltage, GPIO.OUT, initial=GPIO.HIGH)#CE DAC V
GPIO.setup(ce_dac_current1, GPIO.OUT, initial=GPIO.HIGH)#CE DAC OI 1
GPIO.setup(ce_dac_current2, GPIO.OUT, initial=GPIO.HIGH)#CE DAC OI 2

#Varibales I2C
buttons = []
leds = 0
digital_outs = 0
#Parametros DAC
dactx = [0, 0]
gain_factor = 1
maxdacvoltage = 2.048

#Canal I2C al cual estan conectados los MCP23017
channel = 1

#Direcciones de los MCP23017
address1 = 0x20 # Pulsadores y Leds
address2 = 0x21 # salidas digitales
#Registros de direccionamiento de los MCP23017
reg_config_IODIRA = 0x00
reg_config_IODIRB = 0x01
reg_GPIOA = 0x12
reg_GPIOB = 0x13

#Inicializamos la comunicación I2C
bus = smbus.SMBus(channel)

#Configuramos los puertos en entradas y salidas de los MCP23017
bus.write_byte_data(address1, reg_config_IODIRA, 0x00)#MCP23017-1
bus.write_byte_data(address1, reg_config_IODIRB, 0xff)#MCP23017-1
bus.write_byte_data(address2, reg_config_IODIRA, 0x00)#MCP23017-2

#Inicializamos salidas de los leds y digitales apagadas
bus.write_byte_data(address1, reg_GPIOA, 0x00)#MCP23017-1
bus.write_byte_data(address2, reg_GPIOA, 0xff)#MCP23017-2
        
#Lectura inicial del puerto de entrada de los pulsadores        
port_1 = bus.read_byte_data(address1, reg_GPIOB)
bus.close()

def write_txt_buttons(S0, S1, S2, S3, S4, S5, S6, S7):
    lista = [str(S0),"\n", str(S1),"\n", str(S2),"\n", str(S3),"\n", str(S4),"\n", str(S5),"\n", str(S6),"\n", str(S7),"\n"]
    with open(path+"/TXT_Files/Buttons/buttons.txt", 'w') as archivo:
        archivo.writelines(lista)

def read_txts_leds():
    leds= []
    for i in range(8):
        with open(path+'/TXT_Files/Leds/led'+str(i)+'.txt') as archivo:
            for linea in archivo:
                leds.append(linea.strip('\n'))
    leds = reversed(leds)#invierto el arreglo para que quede en formato bin
    num_str = ''.join(leds) #concatenar el arreglo
    num = int(num_str,2) #binario string a decimal
    return num

def read_txts_digital_outs():
    dos= []
    for i in range(8):
        with open(path+'/TXT_Files/DOs/DO'+str(i)+'.txt') as archivo:
            for linea in archivo:
                dos.append(linea.strip('\n'))
    dos = reversed(dos)#invierto el arreglo para que quede en formato bin
    num_str = ''.join(dos) #concatenar el arreglo
    num = int(num_str,2)  #binario string a decimal
    port_out = ~num & 0xff
    return port_out

def analogRead(CH):
    GPIO.output(ce_adc, False)
    adc = spi.xfer2([ 6 | (CH&4) >> 2, (CH&3)<<6, 0])
    data = ((adc[1] & 0x0F) << 8) + adc[2]
    GPIO.output(ce_adc,True)
    percentage = (data*100)/4095
    value = "{0:.1f}".format(percentage)#paso el porcentage a 1 coma decimal
    return float(value)

def write_txt_adc(data):
    analogValue = 0
    analogValue = analogRead(data)
    with open(path+'/TXT_Files/ADC/adc'+str(data)+'.txt', 'w') as bit:
        bit.write(str(analogValue))    
    
def read_txt_dac(file):
    dac = 0.0
    with open(path+'/TXT_Files/DACs/dac'+str(file)+'.txt') as archivo:
       data = archivo.read()
    if not data:
        data = '0.0';
    dac = (float(data)*2.047)/100
    return dac

def analogWrite(ce, voltage, channel):
    if (voltage >= 0.0) and (voltage < maxdacvoltage):
        GPIO.output(ce, False)
        rawval = (voltage / 2.048) * 4096 / gain_factor
        
        Dn = int(rawval)
        
        dactx[1] = (Dn & 0xff)

        if gain_factor == 1:
            dactx[0] = (((Dn >> 8) & 0xff) | (channel - 1) << 7 | 1 << 5 | 1 << 4)
        else:
            dactx[0] = (((Dn >> 8) & 0xff) | (channel - 1) << 7 |1 << 4)

        # Escribimos al MCP4822
        spi2.xfer2(dactx)
        GPIO.output(ce, True)
    else:
        raise ValueError('set_dac_voltage: voltage out of range')
    return Dn
print('inicializado')
while True:
    try:
        bus.open(channel)
        port_read = bus.read_byte_data(address1, reg_GPIOB)
        bus.close()
        
        if port_read != port_1:
            buttons = [((port_read & 1) >> 0), ((port_read & 2) >> 1), ((port_read & 4) >> 2), ((port_read & 8) >> 3), ((port_read & 16) >> 4), ((port_read & 32) >> 5), ((port_read & 64) >> 6), ((port_read & 128) >> 7)]
            write_txt_buttons(buttons[0], buttons[1], buttons[2], buttons[3], buttons[4], buttons[5], buttons[6], buttons[7])
        port_1 = port_read
        
        leds = read_txts_leds()
        digital_outs = read_txts_digital_outs()
        bus.open(channel)
        bus.write_byte_data(address1, reg_GPIOA, leds)
        bus.write_byte_data(address2, reg_GPIOA, digital_outs)
        bus.close()
        
        for i in range(4):
            write_txt_adc(i)
        
        VO1 = read_txt_dac(0)
        VO2 = read_txt_dac(1)
        OI1 = read_txt_dac(2)
        OI2 = read_txt_dac(3)
        analogWrite(ce_dac_voltage, VO1, 1)
        analogWrite(ce_dac_voltage, VO2, 2)
        analogWrite(ce_dac_current1, OI1, 2)
        analogWrite(ce_dac_current2, OI2, 2)
        
    except (EOFError, KeyboardInterrupt, SystemExit):
        bus.close()
        spi.close()
        spi2.close()
        print("\n"+"Finalizado")
        sys.exit(0)