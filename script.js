/**
 * SkyCast - Modern Weather Dashboard logic
 * Using Open-Meteo API (Free, no API key required)
 */

const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const weatherContent = document.getElementById('weatherContent');
const loader = document.getElementById('loader');
const errorMessage = document.getElementById('errorMessage');

// Elements to update
const cityNameEl = document.getElementById('cityName');
const countryNameEl = document.getElementById('countryName');
const temperatureEl = document.getElementById('temperature');
const weatherDescEl = document.getElementById('weatherDesc');
const humidityEl = document.getElementById('humidity');
const windSpeedEl = document.getElementById('windSpeed');
const precipitationEl = document.getElementById('precipitation');

/**
 * Fetch coordinates for a city name using Geocoding API
 */
async function getCoordinates(city) {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Geocoding service failed');
        
        const data = await response.json();
        if (!data.results || data.results.length === 0) {
            throw new Error('City not found');
        }
        
        return data.results[0];
    } catch (error) {
        throw error;
    }
}

/**
 * Fetch weather data based on latitude and longitude
 */
async function getWeatherData(lat, lon) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation,weather_code`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Weather service failed');
        
        const data = await response.json();
        return data;
    } catch (error) {
        throw error;
    }
}

/**
 * Map Weather Codes to descriptions
 * Based on WMO Weather interpretation codes (WW)
 */
function getWeatherDescription(code) {
    const mapping = {
        0: 'Clear sky',
        1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
        45: 'Fog', 48: 'Depositing rime fog',
        51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle',
        61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
        71: 'Slight snow', 73: 'Moderate snow', 75: 'Heavy snow',
        77: 'Snow grains',
        80: 'Slight rain showers', 81: 'Moderate rain showers', 82: 'Violent rain showers',
        85: 'Slight snow showers', 86: 'Heavy snow showers',
        95: 'Thunderstorm', 96: 'Thunderstorm with slight hail', 99: 'Thunderstorm with heavy hail'
    };
    return mapping[code] || 'Unknown';
}

/**
 * Main function to handle weather search
 */
async function handleSearch() {
    const city = cityInput.value.trim();
    if (!city) return;

    // Reset UI
    weatherContent.classList.add('hidden');
    errorMessage.classList.add('hidden');
    loader.classList.remove('hidden');

    try {
        // Step 1: Get city coordinates and info
        const cityInfo = await getCoordinates(city);
        
        // Step 2: Get weather data using coordinates
        const weatherData = await getWeatherData(cityInfo.latitude, cityInfo.longitude);
        
        // Step 3: Parse and render data
        renderWeather(cityInfo, weatherData);
        
    } catch (error) {
        console.error(error);
        errorMessage.textContent = error.message === 'City not found' 
            ? `City "${city}" not found. Please check spelling.` 
            : "An error occurred while fetching weather data.";
        errorMessage.classList.remove('hidden');
    } finally {
        loader.classList.add('hidden');
    }
}

/**
 * Render weather data to DOM
 */
function renderWeather(cityInfo, weather) {
    const current = weather.current;
    
    // Header info
    cityNameEl.textContent = cityInfo.name;
    countryNameEl.textContent = `${cityInfo.admin1 || ''}${cityInfo.admin1 ? ', ' : ''}${cityInfo.country || ''}`;
    
    // Main stats
    temperatureEl.textContent = Math.round(current.temperature_2m);
    weatherDescEl.textContent = getWeatherDescription(current.weather_code);
    
    // Grid stats
    humidityEl.textContent = `${current.relative_humidity_2m}%`;
    windSpeedEl.textContent = `${current.wind_speed_10m} km/h`;
    precipitationEl.textContent = `${current.precipitation} mm`;

    // Show content
    weatherContent.classList.remove('hidden');
}

// Event Listeners
searchBtn.addEventListener('click', handleSearch);
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
});

// Initial search for a default city
window.addEventListener('DOMContentLoaded', () => {
    cityInput.value = 'New Delhi'; // Default city
    handleSearch();
});
