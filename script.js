
const weatherForm = document.getElementById("weatherForm");
const cityInput = document.getElementById("cityInput");
const statusMessage = document.getElementById("status");
const weatherResult = document.getElementById("weatherResult");

const weatherCodes = {
  0: ["Clear sky", "☀️"],
  1: ["Mainly clear", "🌤️"],
  2: ["Partly cloudy", "⛅"],
  3: ["Overcast", "☁️"],
  45: ["Foggy", "🌫️"],
  48: ["Depositing rime fog", "🌫️"],
  51: ["Light drizzle", "🌦️"],
  53: ["Moderate drizzle", "🌦️"],
  55: ["Dense drizzle", "🌧️"],
  61: ["Slight rain", "🌦️"],
  63: ["Moderate rain", "🌧️"],
  65: ["Heavy rain", "🌧️"],
  71: ["Slight snowfall", "🌨️"],
  73: ["Moderate snowfall", "🌨️"],
  75: ["Heavy snowfall", "❄️"],
  80: ["Rain showers", "🌦️"],
  81: ["Moderate rain showers", "🌧️"],
  82: ["Violent rain showers", "⛈️"],
  95: ["Thunderstorm", "⛈️"],
  96: ["Thunderstorm with hail", "⛈️"],
  99: ["Thunderstorm with heavy hail", "⛈️"]
};

weatherForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const city = cityInput.value.trim();

  if (!city) {
    statusMessage.textContent = "Please enter a city name.";
    return;
  }

  statusMessage.textContent = "Fetching weather information...";
  weatherResult.hidden = true;

  try {
    // Step 1: Find the city's coordinates.
    const geoURL =
      "https://geocoding-api.open-meteo.com/v1/search" +
      "?name=" + encodeURIComponent(city) +
      "&count=1&language=en&format=json";

    const geoResponse = await fetch(geoURL);

    if (!geoResponse.ok) {
      throw new Error("Could not search for this city.");
    }

    const geoData = await geoResponse.json();
    const place = geoData.results?.[0];

    if (!place) {
      throw new Error("City not found. Check the spelling and try again.");
    }

    // Step 2: Get weather using latitude and longitude.
    const params = new URLSearchParams({
      latitude: place.latitude,
      longitude: place.longitude,
      current: [
        "temperature_2m",
        "relative_humidity_2m",
        "apparent_temperature",
        "weather_code",
        "wind_speed_10m"
      ].join(","),
      timezone: "auto"
    });

    const weatherResponse = await fetch(
      "https://api.open-meteo.com/v1/forecast?" + params
    );

    if (!weatherResponse.ok) {
      throw new Error("Weather data is temporarily unavailable.");
    }

    const weatherData = await weatherResponse.json();
    const current = weatherData.current;

    if (!current) {
      throw new Error("No current weather data was returned.");
    }

    const [description, icon] =
      weatherCodes[current.weather_code] || ["Unknown conditions", "🌡️"];

    // Step 3: Display the actual returned values.
    document.getElementById("cityName").textContent =
      [place.name, place.admin1, place.country]
        .filter(Boolean)
        .join(", ");

    document.getElementById("weatherDescription").textContent = description;
    document.getElementById("weatherIcon").textContent = icon;

    document.getElementById("temperature").textContent =
      Math.round(current.temperature_2m);

    document.getElementById("humidity").textContent =
      current.relative_humidity_2m + "%";

    document.getElementById("windSpeed").textContent =
      current.wind_speed_10m + " km/h";

    document.getElementById("feelsLike").textContent =
      Math.round(current.apparent_temperature) + "°C";

    weatherResult.hidden = false;
    statusMessage.textContent =
      "Weather updated. Local time zone: " + weatherData.timezone + ".";

  } catch (error) {
    statusMessage.textContent =
      error.message || "Something went wrong. Please try again.";
  }
});