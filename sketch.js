let data;
let margin = 60;
let chartW, chartH;
let continents = ["AMERICA", "EUROPA", "AFRICA", "ASIA", "OCEANIA"];
let hoveredVolcano = null;

function preload() {
  data = loadTable("assets/vulcani.csv", "csv", "header");
}

function setup() {
  createCanvas(windowWidth, windowHeight * 2);
  textFont("Futura");
  chartW = width * 0.9;
  chartH = 220; 
}

function draw() {
  background(30, 20, 15); // sfondo caldo scuro
  fill(255, 240, 230);
  textSize(26);
  textAlign(CENTER, CENTER);
  text("VULCANI NEL MONDO", width / 2, margin - 10);

// disegna legenda
drawLegend();


  // disegna i 5 riquadri verticali
  let startY = margin + 150;
  for (let i = 0; i < continents.length; i++) {
    let x = margin;
    let y = startY + i * (chartH + 60);
    drawContinentBox(continents[i], x, y, chartW, chartH);
  }

  if (hoveredVolcano) showVolcanoInfo(hoveredVolcano);

//resettare il vulcano
hoveredVolcano = null;
}

// disegna un singolo riquadro continente
function drawContinentBox(continent, x0, y0, w, h) {
  noFill();
  stroke(180, 120, 120);
  strokeWeight(1);
  rect(x0, y0, w, h);

  fill(255, 220, 200);
  noStroke();
  textSize(18);
  textAlign(LEFT, CENTER);
  text(continent, x0 + 10, y0 + 25);

  // raccogli coordinate valide
  let allLat = [];
  let allLon = [];
  for (let i = 0; i < data.getRowCount(); i++) {
    let lat = parseFloat(data.getString(i, "Latitude"));
    let lon = parseFloat(data.getString(i, "Longitude"));
    if (!isNaN(lat) && !isNaN(lon) && getContinent(lat, lon) === continent) {
      allLat.push(lat);
      allLon.push(lon);
    }
  }
  if (allLat.length === 0) return;

  let minLat = min(allLat);
  let maxLat = max(allLat);
  let minLon = min(allLon);
  let maxLon = max(allLon);

  // disegna i vulcani
  for (let i = 0; i < data.getRowCount(); i++) {
    let lat = parseFloat(data.getString(i, "Latitude"));
    let lon = parseFloat(data.getString(i, "Longitude"));
    let elev = parseFloat(data.getString(i, "Elevation (m)"));
    if (isNaN(lat) || isNaN(lon)) continue;
    if (getContinent(lat, lon) !== continent) continue;

    let x = map(lon, minLon, maxLon, x0 + 20, x0 + w - 20);
    let y = map(lat, minLat, maxLat, y0 + h - 20, y0 + 40);

    // colore dei puntini gradiente in base all'altitudine
    let t = map(elev, -6000, 7000, 0, 1);
    let col = lerpColor(color(245, 230, 220), color(255, 150, 150), constrain(t, 0, 1));
    col = lerpColor(col, color(200, 50, 50), constrain(t, 0, 1) * 0.5);

    //hoover colorarlo di rosso
    let d = dist(mouseX, mouseY, x, y);
    if (d < 6) {
      fill("red");
      hoveredVolcano = {
        x: x,
        y: y,
        continent: continent,
        row: i
      };
    } else {
      fill(col);
    }
    
   //costruzione puntini
    noStroke();
    ellipse(x, y, 6);
  }
}

// hoover box info vulcano
function showVolcanoInfo(v) {
  let i = v.row;
  let name = data.getString(i, "Volcano Name");
  let country = data.getString(i, "Country");
  let type = data.getString(i, "Type");
  let elev = data.getString(i, "Elevation (m)");
  let status = data.getString(i, "Status");
  let erup = data.getString(i, "Last Known Eruption");
  let lat = data.getString(i, "Latitude");
  let lon = data.getString(i, "Longitude");

  //per non sovrapporre le info al punto
  let infoX = v.x + 15;
  let infoY = v.y - 10;

 //creo il rettangolo per le informazioni
  fill(50, 200);
  stroke(200, 50, 50);
  strokeWeight(1);
  rect(infoX, infoY, 250, 130, 8);

//metto il testo dentro il box
  noStroke();
  fill(255, 245, 230);
  textSize(12);
  textAlign(LEFT, TOP);
  text(
    `${name}\n${country}\nType: ${type}\nElevation: ${elev} m\nStatus: ${status}\nLast eruption: ${erup}\nLat: ${lat}, Lon: ${lon}`,
    infoX + 10,
    infoY + 10
  );
}

// funzione per stimare continente (in base alla longitudine e latitudine)
function getContinent(lat, lon) {
  if (lon < -30) return "AMERICA";
  if (lat > 35 && lon >= -30 && lon <= 60) return "EUROPA";
  if (lat < 35 && lon >= -30 && lon <= 60) return "AFRICA";
  if (lon > 60 && lon <= 150) return "ASIA";
  if (lon > 110 && lat < 0) return "OCEANIA";
}

// legenda
function drawLegend() {
  let legendW = chartW * 0.6;
  let legendH = 30;
  let legendX = width / 2 - legendW / 2;
  let legendY = margin + 50; // più spazio dal titolo

  // riquadro
  noFill();
  stroke(200, 150, 150);
  strokeWeight(1);
  rect(legendX, legendY, legendW, legendH);

  // barra gradiente
  for (let i = 0; i <= legendW; i++) {
    let inter = i / legendW;
    let c = lerpColor(color(245, 230, 220), color(255, 150, 150), inter);
    c = lerpColor(c, color(200, 50, 50), inter * 0.5);
    stroke(c);
    line(legendX + i, legendY + 3, legendX + i, legendY + legendH - 3);
  }

  // etichette
  noStroke();
  fill("white");
  textSize(12);
  textAlign(LEFT, CENTER);
  text("-6000 m", legendX, legendY + legendH + 12);
  textAlign(RIGHT, CENTER);
  text("+7000 m", legendX + legendW, legendY + legendH + 12);
}
