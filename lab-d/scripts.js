const API_KEY = '5e6e39eadac45737bc22c7a652498b1f';
const CURRENT_WEATHER_API = 'https://api.openweathermap.org/data/2.5/weather';
const FORECAST_API = 'https://api.openweathermap.org/data/2.5/forecast';

const cityInput = document.getElementById('cityInput');
const weatherBtn = document.getElementById('weatherBtn');
const errorMsg = document.getElementById('errorMsg');
const currentWeatherDiv = document.getElementById('currentWeather');
const currentWeatherContent = document.getElementById('currentWeatherContent');
const forecastDiv = document.getElementById('forecast');
const forecastContent = document.getElementById('forecastContent');

// Obsługa Enter w polu tekstowym
cityInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    fetchWeather();
  }
});

// Obsługa kliknięcia przycisku
weatherBtn.addEventListener('click', fetchWeather);

function showError(message) {
  errorMsg.textContent = message;
  errorMsg.classList.add('show');
}

function hideError() {
  errorMsg.classList.remove('show');
  errorMsg.textContent = '';
}

function setLoading(isLoading) {
  weatherBtn.disabled = isLoading;
  weatherBtn.classList.toggle('loading', isLoading);
  weatherBtn.textContent = isLoading ? 'Ładowanie...' : 'Pogoda';
}

function formatDate(timestamp) {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('pl-PL', {
    weekday: 'short',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

function formatTime(timestamp) {
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString('pl-PL', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

// XMLHttpRequest - Current Weather API
function fetchCurrentWeather(city) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const url = `${CURRENT_WEATHER_API}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=pl`;

    xhr.open('GET', url, true);

    xhr.onload = function() {
      if (xhr.status === 200) {
        try {
          const data = JSON.parse(xhr.responseText);
          console.log(' Odpowiedź Current Weather API (XMLHttpRequest):', data);
          resolve(data);
        } catch (e) {
          reject(new Error('Błąd parsowania danych pogody bieżącej'));
        }
      } else if (xhr.status === 404) {
        reject(new Error('Miasto nie znalezione'));
      } else {
        reject(new Error(`Błąd: ${xhr.status}`));
      }
    };

    xhr.onerror = function() {
      reject(new Error('Błąd połączenia z API pogody bieżącej'));
    };

    xhr.send();
  });
}

// Fetch API - 5 Day Forecast
function fetchForecastWeather(city) {
  const url = `${FORECAST_API}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=pl`;

  return fetch(url)
    .then(response => {
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Miasto nie znalezione');
        }
        throw new Error(`Błąd: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('Odpowiedź Forecast API (Fetch API):', data);
      return data;
    })
    .catch(error => {
      throw new Error(`Błąd pobierania prognozy: ${error.message}`);
    });
}

function displayCurrentWeather(data) {
  const temp = Math.round(data.main.temp);
  const feelsLike = Math.round(data.main.feels_like);
  const humidity = data.main.humidity;
  const pressure = data.main.pressure;
  const windSpeed = data.wind.speed;
  const description = data.weather[0].description;
  const cityName = data.name;
  const country = data.sys.country;

  currentWeatherContent.innerHTML = `
    <div class="weather-info-row">
      <div class="weather-info-item">
        <div class="weather-info-label">Miasto</div>
        <div class="weather-info-value">${cityName}, ${country}</div>
      </div>
      <div class="weather-info-item">
        <div class="weather-info-label">Temperatura</div>
        <div class="weather-info-value">${temp}°C</div>
      </div>
    </div>
    <div class="weather-info-row">
      <div class="weather-info-item">
        <div class="weather-info-label">Odczuwalna temperatura</div>
        <div class="weather-info-value">${feelsLike}°C</div>
      </div>
      <div class="weather-info-item">
        <div class="weather-info-label">Opis</div>
        <div class="weather-info-value">${description}</div>
      </div>
    </div>
    <div class="weather-info-row">
      <div class="weather-info-item">
        <div class="weather-info-label">Wilgotność</div>
        <div class="weather-info-value">${humidity}%</div>
      </div>
      <div class="weather-info-item">
        <div class="weather-info-label">Ciśnienie</div>
        <div class="weather-info-value">${pressure} hPa</div>
      </div>
    </div>
    <div class="weather-info-row">
      <div class="weather-info-item">
        <div class="weather-info-label">Prędkość wiatru</div>
        <div class="weather-info-value">${windSpeed} m/s</div>
      </div>
    </div>
  `;

  currentWeatherDiv.style.display = 'block';
}

function displayForecast(data) {
  if (!data.list || data.list.length === 0) {
    forecastContent.innerHTML = '<div class="empty-state">Brak danych prognozy</div>';
    forecastDiv.style.display = 'block';
    return;
  }

  // Konsolidacja prognoz - jedno na dzień (średnia z 8 pomiarów dziennie)
  const dailyForecasts = {};

  data.list.forEach(item => {
    const date = formatDate(item.dt);
    if (!dailyForecasts[date]) {
      dailyForecasts[date] = {
        dt: item.dt,
        temps: [],
        descriptions: new Set(),
        humidity: [],
        description: item.weather[0].description,
        wind_speed: item.wind.speed
      };
    }
    dailyForecasts[date].temps.push(item.main.temp);
    dailyForecasts[date].descriptions.add(item.weather[0].description);
    dailyForecasts[date].humidity.push(item.main.humidity);
  });

  let html = '';

  Object.keys(dailyForecasts).slice(0, 5).forEach(date => {
    const forecast = dailyForecasts[date];
    const avgTemp = Math.round(forecast.temps.reduce((a, b) => a + b, 0) / forecast.temps.length);
    const avgHumidity = Math.round(forecast.humidity.reduce((a, b) => a + b, 0) / forecast.humidity.length);
    const descriptions = Array.from(forecast.descriptions).join(', ');
    const time = formatTime(forecast.dt);

    html += `
      <div class="forecast-item">
        <div class="forecast-date">${date}</div>
        <div class="forecast-time">${time}</div>
        <div class="forecast-temp">${avgTemp}°C</div>
        <div class="forecast-desc">${forecast.description}</div>
        <div class="forecast-details">
          💨 ${forecast.wind_speed} m/s<br>
          💧 ${avgHumidity}%
        </div>
      </div>
    `;
  });

  forecastContent.innerHTML = html;
  forecastDiv.style.display = 'block';
}

async function fetchWeather() {
  const city = cityInput.value.trim();

  if (!city) {
    showError('Proszę wprowadzić nazwę miasta');
    return;
  }

  hideError();
  setLoading(true);
  currentWeatherDiv.style.display = 'none';
  forecastDiv.style.display = 'none';

  try {
    // Pobieranie pogody bieżącej (XMLHttpRequest)
    const currentData = await fetchCurrentWeather(city);
    displayCurrentWeather(currentData);

    // Pobieranie prognozy (Fetch API)
    const forecastData = await fetchForecastWeather(city);
    displayForecast(forecastData);

  } catch (error) {
    showError(error.message);
    currentWeatherDiv.style.display = 'none';
    forecastDiv.style.display = 'none';
  } finally {
    setLoading(false);
  }
}

console.debug("Aplikacja pogodowa załadowana!");
