const cities = [
  { country: 'Korea', countryZh: '韓國', city: 'Seoul', cityZh: '首爾', flag: '🇰🇷', lat: 37.5665, lon: 126.9780 },
  { country: 'Taiwan', countryZh: '台灣', city: 'Taipei', cityZh: '台北', flag: '🇹🇼', lat: 25.0330, lon: 121.5654 },
  { country: 'Australia', countryZh: '澳洲', city: 'Sydney', cityZh: '雪梨', flag: '🇦🇺', lat: -33.8688, lon: 151.2093 },
  { country: 'Japan', countryZh: '日本', city: 'Tokyo', cityZh: '東京', flag: '🇯🇵', lat: 35.6762, lon: 139.6503 },
  { country: 'France', countryZh: '法國', city: 'Paris', cityZh: '巴黎', flag: '🇫🇷', lat: 48.8566, lon: 2.3522 },
  { country: 'the USA', countryZh: '美國', city: 'New York', cityZh: '紐約', flag: '🇺🇸', lat: 40.7128, lon: -74.0060 },
  { country: 'Vietnam', countryZh: '越南', city: 'Hanoi', cityZh: '河內', flag: '🇻🇳', lat: 21.0278, lon: 105.8342 },
  { country: 'the UK', countryZh: '英國', city: 'London', cityZh: '倫敦', flag: '🇬🇧', lat: 51.5072, lon: -0.1276 },
  { country: 'Spain', countryZh: '西班牙', city: 'Madrid', cityZh: '馬德里', flag: '🇪🇸', lat: 40.4168, lon: -3.7038 },
  { country: 'India', countryZh: '印度', city: 'New Delhi', cityZh: '新德里', flag: '🇮🇳', lat: 28.6139, lon: 77.2090 },
  { country: 'Singapore', countryZh: '新加坡', city: 'Singapore', cityZh: '新加坡', flag: '🇸🇬', lat: 1.3521, lon: 103.8198 },
  { country: 'Canada', countryZh: '加拿大', city: 'Vancouver', cityZh: '溫哥華', flag: '🇨🇦', lat: 49.2827, lon: -123.1207 },
  { country: 'Mexico', countryZh: '墨西哥', city: 'Mexico City', cityZh: '墨西哥城', flag: '🇲🇽', lat: 19.4326, lon: -99.1332 },
  { country: 'Brazil', countryZh: '巴西', city: 'Rio de Janeiro', cityZh: '里約熱內盧', flag: '🇧🇷', lat: -22.9068, lon: -43.1729 },
  { country: 'Italy', countryZh: '義大利', city: 'Rome', cityZh: '羅馬', flag: '🇮🇹', lat: 41.9028, lon: 12.4964 },
  { country: 'China', countryZh: '中國', city: 'Beijing', cityZh: '北京', flag: '🇨🇳', lat: 39.9042, lon: 116.4074 },
  { country: 'Malaysia', countryZh: '馬來西亞', city: 'Kuala Lumpur', cityZh: '吉隆坡', flag: '🇲🇾', lat: 3.1390, lon: 101.6869 },
  { country: 'Kenya', countryZh: '肯亞', city: 'Nairobi', cityZh: '奈洛比', flag: '🇰🇪', lat: -1.2921, lon: 36.8219 }
];

const weatherCodes = {
  0: ['☀️', 'Sunny'], 1: ['🌤️', 'Mostly sunny'], 2: ['⛅', 'Partly cloudy'], 3: ['☁️', 'Cloudy'],
  45: ['🌫️', 'Foggy'], 48: ['🌫️', 'Foggy'], 51: ['🌦️', 'Light drizzle'], 53: ['🌦️', 'Drizzly'],
  55: ['🌧️', 'Heavy drizzle'], 61: ['🌧️', 'Light rain'], 63: ['🌧️', 'Rainy'], 65: ['🌧️', 'Heavy rain'],
  71: ['🌨️', 'Light snow'], 73: ['❄️', 'Snowy'], 75: ['❄️', 'Heavy snow'], 80: ['🌦️', 'Rain showers'],
  81: ['🌧️', 'Rain showers'], 82: ['⛈️', 'Heavy showers'], 95: ['⛈️', 'Thunderstorms'], 96: ['⛈️', 'Thunderstorms'], 99: ['⛈️', 'Thunderstorms']
};
const packingItems = [
  { id: 'tshirt', icon: '👕', label: 'T-shirt' }, { id: 'coat', icon: '🧥', label: 'Coat' },
  { id: 'umbrella', icon: '☂️', label: 'Umbrella' }, { id: 'boots', icon: '🥾', label: 'Boots' },
  { id: 'hat', icon: '🧢', label: 'Sun hat' }, { id: 'bottle', icon: '🧴', label: 'Water' },
  { id: 'scarf', icon: '🧣', label: 'Scarf' }, { id: 'camera', icon: '📷', label: 'Camera' }
];

let selectedIndex = 1;
let mapLanguage = 'en';
let latestWeather = { temp: 24, min: 21, max: 28, code: 2 };
let soundOn = true;
const visited = new Set(JSON.parse(localStorage.getItem('little-world-visited') || '[]'));
const selectedPack = new Set();

const $ = (id) => document.getElementById(id);
const select = $('citySelect');
const grid = $('countryGrid');

function temperatureFeeling(temp) {
  if (temp >= 30) return 'hot';
  if (temp >= 22) return 'warm';
  if (temp >= 14) return 'cool';
  return 'cold';
}

function weatherSentence(place, label, temp) {
  return `${place.city}. It is ${label.toLowerCase()} and ${temperatureFeeling(temp)}. It is ${temp} degrees.`;
}

function mapPosition(place) {
  return { x: ((place.lon + 180) / 360) * 100, y: ((90 - place.lat) / 180) * 100 };
}
function mapTopCss(y) { return `${y}%`; }

let mapZoom = 1;
let mapPan = { x: 0, y: 0 };
let dragStart = null;

function applyMapTransform() {
  const canvas = $('mapCanvas');
  const maxX = canvas.clientWidth * (mapZoom - 1) / 2;
  const maxY = canvas.clientHeight * (mapZoom - 1) / 2;
  mapPan.x = Math.max(-maxX, Math.min(maxX, mapPan.x));
  mapPan.y = Math.max(-maxY, Math.min(maxY, mapPan.y));
  canvas.style.transform = `translate(${mapPan.x}px, ${mapPan.y}px) scale(${mapZoom})`;
  $('zoomReset').textContent = `${Math.round(mapZoom * 100)}%`;
}

function setMapZoom(nextZoom, focus) {
  const previous = mapZoom;
  mapZoom = Math.max(1, Math.min(2.5, nextZoom));
  if (focus && mapZoom > 1) {
    const canvas = $('mapCanvas');
    mapPan.x = (50 - focus.x) / 100 * canvas.clientWidth * mapZoom;
    mapPan.y = (50 - focus.y) / 100 * canvas.clientHeight * mapZoom;
  } else if (mapZoom === 1) {
    mapPan = { x: 0, y: 0 };
  } else if (previous > 0) {
    mapPan.x *= mapZoom / previous;
    mapPan.y *= mapZoom / previous;
  }
  applyMapTransform();
}

function buildDestinationControls() {
  cities.forEach((place, index) => {
    select.add(new Option(`${place.city} — ${place.country}`, index));
    const card = document.createElement('button');
    card.className = 'country-card';
    card.type = 'button';
    card.dataset.index = index;
    card.innerHTML = `<span class="flag">${place.flag}</span><strong>${place.country}</strong><small>${place.city}</small><span class="card-zh">${place.countryZh} · ${place.cityZh}</span>`;
    card.addEventListener('click', () => chooseCity(index, true));
    grid.appendChild(card);

    const position = mapPosition(place);
    const pin = document.createElement('button');
    pin.type = 'button';
    pin.className = `map-pin${index === 1 ? ' home' : ''}`;
    pin.dataset.index = index;
    pin.style.left = `${position.x}%`;
    pin.style.top = `${position.y}%`;
    pin.setAttribute('aria-label', `Fly to ${place.city}, ${place.country}`);
    pin.addEventListener('click', () => chooseCity(index, true));
    pin.addEventListener('dblclick', event => { event.preventDefault(); setMapZoom(2, position); });
    const label = document.createElement('span');
    label.className = 'map-pin-label';
    label.dataset.index = index;
    label.style.left = `${position.x}%`;
    label.style.top = `${position.y}%`;
    label.textContent = place.city;
    $('mapMarkers').append(pin, label);
  });
  select.value = selectedIndex;
}

function distanceFromTaiwan(place) {
  const taiwan = cities[1];
  const toRad = value => value * Math.PI / 180;
  const dLat = toRad(place.lat - taiwan.lat), dLon = toRad(place.lon - taiwan.lon);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(taiwan.lat)) * Math.cos(toRad(place.lat)) * Math.sin(dLon / 2) ** 2;
  return Math.round(6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function refreshMapLabels() {
  document.querySelectorAll('.map-pin-label').forEach((label, index) => {
    label.textContent = mapLanguage === 'zh' ? cities[index].cityZh : cities[index].city;
  });
}

function setMapLanguage(language) {
  mapLanguage = language;
  const englishActive = language === 'en';
  $('mapEnglish').classList.toggle('active', englishActive);
  $('mapChinese').classList.toggle('active', !englishActive);
  $('mapEnglish').setAttribute('aria-pressed', englishActive);
  $('mapChinese').setAttribute('aria-pressed', !englishActive);
  refreshMapLabels();
}

async function chooseCity(index, shouldSpeak = false) {
  selectedIndex = Number(index);
  const place = cities[selectedIndex];
  select.value = selectedIndex;
  document.querySelectorAll('.country-card').forEach((card, i) => card.classList.toggle('active', i === selectedIndex));
  document.querySelectorAll('.map-pin').forEach((pin, i) => pin.classList.toggle('active', i === selectedIndex));
  refreshMapLabels();
  $('flag').textContent = place.flag;
  $('cityName').textContent = place.city;
  $('countryName').textContent = `${place.country} · ${Math.abs(place.lat).toFixed(1)}° ${place.lat >= 0 ? 'N' : 'S'}`;
  $('distance').textContent = selectedIndex === 1 ? 'You are here!' : `From Taiwan: ${distanceFromTaiwan(place).toLocaleString()} km`;
  $('temperature').textContent = '--°C';
  $('weatherLabel').textContent = 'Checking the weather…';
  $('weatherNote').textContent = 'Loading today’s live forecast…';
  try {
    const params = new URLSearchParams({ latitude: place.lat, longitude: place.lon, current: 'temperature_2m,weather_code', daily: 'temperature_2m_max,temperature_2m_min', timezone: 'auto', forecast_days: 1 });
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
    if (!response.ok) throw new Error('Forecast unavailable');
    const data = await response.json();
    latestWeather = { temp: Math.round(data.current.temperature_2m), min: Math.round(data.daily.temperature_2m_min[0]), max: Math.round(data.daily.temperature_2m_max[0]), code: data.current.weather_code };
    const [icon, label] = weatherCodes[latestWeather.code] || ['🌤️', 'Changeable'];
    $('weatherIcon').textContent = icon;
    $('temperature').textContent = `${latestWeather.temp}°C`;
    $('weatherLabel').textContent = `${label} & ${temperatureFeeling(latestWeather.temp)}`;
    $('practiceSentence').textContent = weatherSentence(place, label, latestWeather.temp);
    $('range').textContent = `Low ${latestWeather.min}°C / High ${latestWeather.max}°C`;
    $('localTime').textContent = `Local time: ${new Date().toLocaleTimeString('en-GB', { timeZone: data.timezone, hour: '2-digit', minute: '2-digit' })}`;
    $('weatherNote').textContent = `Live forecast · Updated ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } catch (error) {
    latestWeather = { temp: 22, min: 18, max: 26, code: 2 };
    $('weatherIcon').textContent = '⛅';
    $('temperature').textContent = '22°C';
    $('weatherLabel').textContent = 'Partly cloudy & warm';
    $('practiceSentence').textContent = weatherSentence(place, 'Partly cloudy', 22);
    $('range').textContent = 'Low 18°C / High 26°C';
    $('localTime').textContent = 'Local time unavailable';
    $('weatherNote').textContent = 'Using a practice forecast while offline.';
  }
  if (shouldSpeak) speakWeather();
}

function idealItems() {
  const result = new Set(['camera']);
  if (latestWeather.temp >= 24) { result.add('tshirt'); result.add('hat'); result.add('bottle'); }
  if (latestWeather.temp < 18) { result.add('coat'); result.add('scarf'); }
  if ([51,53,55,61,63,65,80,81,82,95,96,99].includes(latestWeather.code)) { result.add('umbrella'); result.add('boots'); }
  return result;
}

function openPacking() {
  selectedPack.clear();
  $('packResult').textContent = '';
  $('flyButton').textContent = 'Check my bag';
  $('packCity').textContent = cities[selectedIndex].city.toUpperCase();
  $('packingGrid').innerHTML = '';
  packingItems.forEach(item => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'pack-item';
    button.innerHTML = `<span>${item.icon}</span>${item.label}`;
    button.addEventListener('click', () => { selectedPack.has(item.id) ? selectedPack.delete(item.id) : selectedPack.add(item.id); button.classList.toggle('selected'); });
    $('packingGrid').appendChild(button);
  });
  setStep(2);
  $('packDialog').showModal();
}

function checkBag() {
  const ideal = idealItems();
  const good = [...ideal].filter(x => selectedPack.has(x)).length;
  if (good >= Math.min(3, ideal.size)) {
    const place = cities[selectedIndex];
    visited.add(place.city);
    localStorage.setItem('little-world-visited', JSON.stringify([...visited]));
    $('packResult').textContent = `Great packing! ✈ You’re ready to fly to ${place.city}.`;
    $('flyButton').textContent = 'Adventure complete!';
    updatePassport();
    setStep(3);
    setTimeout(() => { $('packDialog').close(); flyToDestination(); }, 650);
  } else {
    $('packResult').textContent = `Almost! Look at the temperature and weather, then add something useful.`;
  }
}

function flyToDestination() {
  setMapZoom(1);
  const origin = mapPosition(cities[1]);
  const destination = mapPosition(cities[selectedIndex]);
  const plane = $('flightPlane');
  const route = $('flightRoute');
  const curveLift = Math.max(10, Math.abs(destination.x - origin.x) * .16);
  const midX = (origin.x + destination.x) / 2;
  const midY = Math.max(7, Math.min(origin.y, destination.y) - curveLift);
  $('routePath').setAttribute('d', `M ${origin.x * 10} ${origin.y * 5.6} Q ${midX * 10} ${midY * 5.6} ${destination.x * 10} ${destination.y * 5.6}`);
  route.classList.add('flying');
  plane.classList.add('flying');
  plane.style.left = `${origin.x}%`;
  plane.style.top = mapTopCss(origin.y);
  $('mapStage').scrollIntoView({ behavior: 'smooth', block: 'center' });
  const animation = plane.animate([
    { left: `${origin.x}%`, top: mapTopCss(origin.y), transform: 'translate(-50%,-50%) rotate(-12deg)' },
    { left: `${midX}%`, top: mapTopCss(midY), transform: 'translate(-50%,-50%) rotate(-2deg)' },
    { left: `${destination.x}%`, top: mapTopCss(destination.y), transform: 'translate(-50%,-50%) rotate(10deg)' }
  ], { duration: selectedIndex === 1 ? 1400 : 4200, easing: 'cubic-bezier(.45,.05,.25,1)', fill: 'forwards' });
  animation.onfinish = () => {
    plane.classList.remove('flying');
    route.classList.remove('flying');
    const place = cities[selectedIndex];
    $('arrivalBanner').textContent = `${place.flag} Welcome to ${place.city}!`;
    $('arrivalBanner').classList.add('show');
    speakWeather(true);
    setTimeout(() => $('arrivalBanner').classList.remove('show'), 4200);
  };
}

function setStep(number) { document.querySelectorAll('.step').forEach((step, i) => step.classList.toggle('active', i + 1 <= number)); }
function updatePassport() {
  $('passportCount').textContent = `${visited.size} / 18`;
  $('passportGrid').innerHTML = cities.map(place => `<div class="stamp ${visited.has(place.city) ? 'visited' : ''}">${place.flag}<br><strong>${place.city}</strong></div>`).join('');
}
function preferredVoice(place) {
  const voices = speechSynthesis.getVoices();
  const preferUS = ['the USA', 'Canada'].includes(place.country);
  const locale = preferUS ? 'en-US' : 'en-GB';
  const premiumNames = preferUS
    ? ['Samantha', 'Ava', 'Aria', 'Jenny', 'Google US English']
    : ['Serena', 'Sonia', 'Libby', 'Daniel', 'Google UK English Female'];
  return premiumNames.map(name => voices.find(v => v.name.includes(name) && v.lang.startsWith(locale))).find(Boolean)
    || voices.find(v => v.lang.startsWith(locale))
    || voices.find(v => v.lang.startsWith('en'));
}
function speakWeather(force = false) {
  if ((!soundOn && !force) || !('speechSynthesis' in window)) return;
  const place = cities[selectedIndex];
  const label = weatherCodes[latestWeather.code]?.[1] || 'changeable';
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(weatherSentence(place, label, latestWeather.temp));
  utterance.voice = preferredVoice(place);
  utterance.lang = utterance.voice?.lang || 'en-GB';
  utterance.rate = .82;
  utterance.pitch = 1.02;
  speechSynthesis.speak(utterance);
}

select.addEventListener('change', e => chooseCity(e.target.value, true));
$('surpriseButton').addEventListener('click', () => { let next; do next = Math.floor(Math.random() * cities.length); while (next === selectedIndex); chooseCity(next, true); });
$('packButton').addEventListener('click', openPacking);
$('flyButton').addEventListener('click', checkBag);
$('listenButton').addEventListener('click', speakWeather);
$('soundButton').addEventListener('click', () => { soundOn = !soundOn; $('soundButton').textContent = soundOn ? '♫ Sound on' : '♫ Sound off'; $('soundButton').setAttribute('aria-pressed', soundOn); });
$('passportButton').addEventListener('click', () => { updatePassport(); $('passportDialog').showModal(); });
$('packDialog').addEventListener('close', () => setStep(visited.has(cities[selectedIndex].city) ? 3 : 1));
$('zoomIn').addEventListener('click', () => setMapZoom(mapZoom + .25));
$('zoomOut').addEventListener('click', () => setMapZoom(mapZoom - .25));
$('zoomReset').addEventListener('click', () => setMapZoom(1));
$('mapEnglish').addEventListener('click', () => setMapLanguage('en'));
$('mapChinese').addEventListener('click', () => setMapLanguage('zh'));
$('mapCanvas').addEventListener('pointerdown', event => {
  if (mapZoom === 1 || event.target.closest('button')) return;
  dragStart = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, panX: mapPan.x, panY: mapPan.y };
  $('mapCanvas').setPointerCapture(event.pointerId);
  $('mapCanvas').classList.add('dragging');
});
$('mapCanvas').addEventListener('pointermove', event => {
  if (!dragStart || dragStart.pointerId !== event.pointerId) return;
  mapPan.x = dragStart.panX + event.clientX - dragStart.x;
  mapPan.y = dragStart.panY + event.clientY - dragStart.y;
  applyMapTransform();
});
function endMapDrag(event) {
  if (!dragStart || dragStart.pointerId !== event.pointerId) return;
  dragStart = null;
  $('mapCanvas').classList.remove('dragging');
}
$('mapCanvas').addEventListener('pointerup', endMapDrag);
$('mapCanvas').addEventListener('pointercancel', endMapDrag);

buildDestinationControls();
setMapLanguage('en');
updatePassport();
chooseCity(selectedIndex);
