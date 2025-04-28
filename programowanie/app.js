const speedValue = document.getElementById("prd");
const distanceValue = document.getElementById("dystans");
const timeValue = document.getElementById("czas");
const bateryLevel = document.getElementById("bateria");
//zmienne
let prd = 0;
let dst = 0;
let time = 0
let batery = 0

const show = () => {
    speedValue.value = prd;
    distanceValue.value = dst;
    timeValue.value = time;
    bateryLevel.value = batery;
}

const update = () => {
    fetch('/dane')
        .then(response => response.json())
        .then(data => {
            prd = data.predkosc;
            dst = data.dystans;
            time = data.czas;
            batery = data.bateria;
            show();
        })
        .catch(err => console.error("Błąd pobierania danych:", err));
};

// aktualizuj dane sekunde
setInterval(update, 1000);