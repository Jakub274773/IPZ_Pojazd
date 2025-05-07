from operator import indexOf
import RPi.GPIO as GPIO
import time
import requests
from rplidar import RPLidar
PORT_NAME = '/dev/ttyUSB0'



#zmienne i tablice
status = False
is_send = False
angles_table = [None] * 360

predkosc = 0
dystans = 0
czas = 0
bateria = 0
# z całego przejazdu
c_predkosc = 0
c_dystans = 0
c_czas = 0
c_bateria = 0


# Adres Twojego serwera Flask (zmień na IP serwera!)
SERVER_URL = "http://192.168.1.100:5000/aktualizuj"

def init():
    GPIO.setmode(GPIO.BCM)
    GPIO.setup(17, GPIO.OUT)
    GPIO.setup(22, GPIO.OUT)


def get_status():
    try:
        response = requests.get(SERVER_URL)
        if response.status_code == 200:
            dane = response.json()
            status = dane['status']
            print(f"Aktualny status: {status}")
            return status
        else:
            print("Błąd serwera:", response.status_code)
    except Exception as e:
        print("Błąd połączenia:", e)
    return None

### 1. Pobranie danych z LiDAR-a i zapis do tablicy ###
def get_lidar_array():
    lidar = RPLidar(PORT_NAME)

    try:
        print('Zbieranie danych...')
        for scan in lidar.iter_scans():

            for measurement in scan:
                quality, angle, distance = measurement
                angle_idx = int(round(angle)) % 360  # Zaokrąglamy kąt i zawijamy w 0–359
                angles_table[angle_idx] = distance  # Zapisujemy dystans dla danego kąta
                 # Teraz angles_table zawiera odległości dla kątów 0–359
    except:
        pass

    # except KeyboardInterrupt:
    #     print('Stop')
    # finally:
    #     lidar.stop()
    #     lidar.disconnect()


### 2. Funkcja decyzyjna — czy coś jest < 2m z przodu? ###
def is_obstacle_in_front():
    # front_angles = list(range(-30, 31))  # kąt -45° do +45° (czyli 330–360, 0–30)
    for angle in range(315,361):
        if angles_table[angle] < 2000:
            return True
    for angle in range(0, 45):
        if angles_table[angle] < 2000:
            return True
    return False


### 3. Główna funkcja decyzji nawigacyjnej ###
def decide_direction():
    obstacle = is_obstacle_in_front()

    if obstacle:
        # Tryb jazdy przy prawej ścianie (270 ± 15)
        average_dist = 0
        for angle in range(50, 120):
            average_dist += angles_table[angle]

        if average_dist > 1600:
            return "right"
        elif average_dist < 1400:
            return "left"
        else: return "forward"

    else:
        # Tryb omijania przeszkody — szukamy największej "dziury"
        avg_values = []

        for angle in range(320,361):
            value = angles_table[angle - 1] + angles_table[angle] + angles_table[angle + 1]
            avg_values.append(value)
        for angle in range(0,41):
            value = angles_table[angle - 1] + angles_table[angle] + angles_table[angle + 1]
            avg_values.append(value)

        index = indexOf(max(avg_values))
        if index < 40:
            return "left"
        elif index < 40:
            return "right"
        else: return "forward"

### 4. Sterowanie silnikami ###
def control_motors():
    direction = decide_direction()

    match direction:
        case "left":
            GPIO.output(17, GPIO.HIGH)
            GPIO.output(22, GPIO.HIGH)
            time.sleep(0.002)
            GPIO.output(17, GPIO.HIGH)
            GPIO.output(22, GPIO.LOW)
            time.sleep(0.001)
        case "right":
            GPIO.output(17, GPIO.HIGH)
            GPIO.output(22, GPIO.HIGH)
            time.sleep(0.002)
            GPIO.output(17, GPIO.LOW)
            GPIO.output(22, GPIO.HIGH)
            time.sleep(0.001)
        case "forward":
            GPIO.output(17, GPIO.HIGH)
            GPIO.output(22, GPIO.HIGH)
            time.sleep(0.003)


def send_data_local():
    dane = {
        "predkosc": f"{predkosc}",
        "dystans": f"{dystans}",
        "czas": f"{czas}",
        "bateria": f"{bateria}"
    }

    try:
        response = requests.post(SERVER_URL, json=dane)
        if response.status_code == 200:
            print("Dane wysłane pomyślnie!")
        else:
            print("Błąd serwera:", response.text)
    except Exception as e:
        print("Błąd połączenia:", e)

def send_data_global():
    global is_send
    if not is_send:
        #wysłać
        is_send = True


### Pętla główna ###
if __name__ == '__main__':
    try:
        init()
        while True:
            get_status()
            if status:
                get_lidar_array()
                control_motors()
                send_data_local()
            else:
                send_data_global()
    except KeyboardInterrupt:
        pass


