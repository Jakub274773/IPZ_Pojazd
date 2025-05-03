const runTable = document.querySelector('table');

const speedValue = document.getElementById("prd");
const distanceValue = document.getElementById("dystans");
const timeValue = document.getElementById("czas");
const bateryLevel = document.getElementById("bateria");

const startBtn = document.querySelector("button");

const imie = document.getElementById("imie");
const nazwisko = document.getElementById("nazwisko");
const subBtn = document.querySelector(".uzytkownicy button");
const usertable = document.querySelector(".uzytkownicy table");

function zmienStatus() {
    fetch('/toggle', {
            method: 'POST'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Błąd: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Nowy status:', data.status);
            // Aktualizacja UI, jeśli masz np. <div id="statusBox"></div>
            const statusBox = document.getElementById('statusBox');
            if (statusBox) {
                statusBox.textContent = `Status: ${data.status ? 'Włączony' : 'Wyłączony'}`;
            }
        })
        .catch(error => {
            console.error('Błąd podczas przełączania:', error);
        });
}


function pobierzPrzejazdy() {
    fetch('/przejazdy')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Błąd: ${response.status}`);
            }
            return response.json();
        })
        .then(przejazdy => {

            runTable.innerHTML = '';

            // Nagłówek tabeli
            const head = document.createElement('tr');
            const thId = document.createElement('th');
            const thPredkosc = document.createElement('th');
            const thDystans = document.createElement('th');
            const thCzas = document.createElement('th');
            const thBateria = document.createElement('th');

            thId.textContent = 'ID';
            thPredkosc.textContent = 'Średnia prędkość (km/h)';
            thDystans.textContent = 'Dystans (km)';
            thCzas.textContent = 'Czas';
            thBateria.textContent = 'Bateria (%)';

            head.appendChild(thId);
            head.appendChild(thPredkosc);
            head.appendChild(thDystans);
            head.appendChild(thCzas);
            head.appendChild(thBateria);
            tabela.appendChild(head);

            // Wstawiamy dane przejazdów
            przejazdy.forEach(item => {
                const row = document.createElement('tr');
                const tdId = document.createElement('td');
                const tdPredkosc = document.createElement('td');
                const tdDystans = document.createElement('td');
                const tdCzas = document.createElement('td');
                const tdBateria = document.createElement('td');

                tdId.textContent = item.id;
                tdPredkosc.textContent = item.srednia_predkosc;
                tdDystans.textContent = item.dystans;
                tdCzas.textContent = item.czas;
                tdBateria.textContent = item.bateria;

                row.appendChild(tdId);
                row.appendChild(tdPredkosc);
                row.appendChild(tdDystans);
                row.appendChild(tdCzas);
                row.appendChild(tdBateria);
                tabela.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Błąd podczas pobierania przejazdów:', error);
        });
}

//do dodawania użytkowników
function dodajUzytkownika(imie, nazwisko) {
    fetch('/uzytkownicy', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                imie: imie,
                nazwisko: nazwisko
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Błąd: ${response.status}`);
            }
            return response.json();
        })
        .then(dane => {
            console.log('Użytkownik został dodany:', dane);
        })
        .catch(error => {
            console.error('Wystąpił błąd:', error);
        });
}

function pobierzUzytkownikow() {
    fetch('/uzytkownicy')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Błąd: ${response.status}`);
            }
            return response.json();
        })
        .then(znalezione => {

            usertable.innerHTML = "";
            const head = document.createElement("tr");
            const idTable = document.createElement("th");
            const imieTable = document.createElement("th");
            const nazwiskoTable = document.createElement("th");
            idTable.textContent = "Id";
            imieTable.textContent = "Imię";
            nazwiskoTable.textContent = "Nazwisko";
            head.appendChild(idTable);
            head.appendChild(imieTable);
            head.appendChild(nazwiskoTable);
            usertable.appendChild(head);

            znalezione.forEach(item => {
                const line = document.createElement('tr');
                const itemId = document.createElement('td');
                const itemImie = document.createElement('td');
                const itemNazwisko = document.createElement('td');
                itemId.textContent = item.id;
                itemImie.textContent = item.imie;
                itemNazwisko.textContent = item.nazwisko;
                line.appendChild(itemId);
                line.appendChild(itemImie);
                line.appendChild(itemNazwisko);
                usertable.appendChild(line);
            });
        })
        .catch(error => {
            console.error('Błąd podczas pobierania użytkowników:', error);
        });
}

pobierzPrzejazdy();
pobierzUzytkownikow();

subBtn.addEventListener("click", (e) => {

    e.preventDefault();
    dodajUzytkownika(imie, nazwisko);
    imie.value = "";
    nazwisko.value = "";
    console.log('działa');
    pobierzUzytkownikow()
})

startBtn.addEventListener("click", zmienStatus);

const update = () => {
    fetch('/dane')
        .then(response => response.json())
        .then(data => {
            speedValue.value = prd;
            distanceValue.value = dst;
            timeValue.value = time;
            bateryLevel.value = batery;
        })
        .catch(err => console.error("Błąd pobierania danych:", err));
};

// aktualizuj dane sekunde
setInterval(update, 2000);