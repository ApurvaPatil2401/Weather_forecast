document.addEventListener("DOMContentLoaded", () => {
    const citySelect = document.getElementById("city");
    const resultsDiv = document.getElementById("results");
  
    citySelect.addEventListener("change", async () => {
      const selectedOption = citySelect.value;
  
      // Parse selected coordinates
      const { lat, lon } = JSON.parse(selectedOption);
  
      // Fetch weather data from 7timer API
      try {
        const response = await fetch(
          `https://www.7timer.info/bin/api.pl?lon=${lon}&lat=${lat}&product=civil&output=json`
        );
  
        if (!response.ok) throw new Error("Failed to fetch weather data");
  
        const data = await response.json();
  
        // Display weather data in cards
        displayWeatherCards(data.dataseries);
      } catch (error) {
        resultsDiv.innerHTML = `<p class="text-red-500">Error: ${error.message}</p>`;
      }
    });
  
    function displayWeatherCards(dataSeries) {
      // Map 7timer weather to custom icons & labels
      const weatherIcons = {
        clear: "☀️", 
        pcloudy: "🌤", 
        cloudy: "☁️", 
        rain: "🌧", 
        snow: "❄️",
        ts: "⛈️",
      };
  
      resultsDiv.innerHTML = ""; // Clear previous results
  
      const uniqueDays = new Set(); // To track displayed days
      const dailyData = [];
  
      // Filter to get unique days only
      dataSeries.forEach((entry) => {
        const forecastDate = new Date();
        forecastDate.setHours(forecastDate.getHours() + entry.timepoint);
  
        const dayKey = forecastDate.toISOString().split("T")[0]; // Get date in 'YYYY-MM-DD'
  
        if (!uniqueDays.has(dayKey)) {
          uniqueDays.add(dayKey);
          dailyData.push({ date: forecastDate, weather: entry.weather, temp: entry.temp2m });
        }
      });
  
      // Limit to 5-6 days
      dailyData.slice(0, 7).forEach(({ date, weather, temp }) => {
        const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
        const dateStr = date.toLocaleDateString("en-US", { day: "numeric", month: "short" });
  
        console.log("Weather condition:", weather);
        const cleanedWeather = cleanWeatherCondition(weather);
  
        // Create a card for each day
        const cardHTML = `
          <div class="bg-blue-900 text-white rounded-lg p-4 shadow-lg text-center">
            <h3 class="text-lg font-bold text-yellow-400">${dayName} ${dateStr}</h3>
            
            <p class="uppercase text-lg font-bold">${formatWeather(weather)}</p>
            <p class="mt-2">H: ${temp}°C</p>
            <p>L: ${temp - 2}°C</p>
          </div>
        `;
        resultsDiv.insertAdjacentHTML("beforeend", cardHTML);
      });
    }

    function cleanWeatherCondition(weather) {
        // Remove "night" from the weather string
        return weather.replace(/night/g, " ").trim().toLowerCase();
      }
  
    function formatWeather(weather) {
      const weatherMap = {
        clear: "Clear Sky",
        pcloudy: "Partly Cloudy",
        cloudy: "Cloudy",
        rain: "Light Rain",
        snow: "Snowy",
        ts: "Thunderstorm",
      };
  
      return weatherMap[weather.replace(/night/g||/day/g, " ").trim().toLowerCase()] || weather;
    }
  });
  