<template>
  <div class="app">
    <weather-search @location-submitted="fetchWeatherData" />
    <div v-if="!selectedLocation" class="container">
      <header>
        <h1>Weather</h1>
        <div class="profile-icon">👤</div>
      </header>

      <div class="search-container">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input 
            type="text" 
            placeholder="Search for a city or airport"
            v-model="searchQuery"
            @input="debounceSearch"
          >
          <div class="loading-indicator" v-if="loading">Loading...</div>
        </div>

        <!-- Search Results -->
        <div class="search-suggestions" v-if="searchSuggestions.length > 0">
          <div 
            v-for="suggestion in searchSuggestions" 
            :key="suggestion.id"
            class="suggestion-item"
            @click="handleLocationClick(suggestion)"
          >
            <div class="suggestion-info">
              <p class="suggestion-name">{{ suggestion.name }}, {{ suggestion.country }}</p>
              <p class="suggestion-desc">{{ suggestion.state || suggestion.country }}</p>
            </div>
            <div class="suggestion-temp">
              {{ Math.round(suggestion.temp) }}°C
            </div>
          </div>
        </div>

        <!-- Error Message -->
        <div class="error-message" v-if="error">
          {{ error }}
        </div>
      </div>

      <!-- Location Cards -->
      <div class="location-cards">
        <div 
          v-for="location in savedLocations" 
          :key="location.id"
          class="location-card"
          :class="{ 
            'primary': location.isMyLocation || location.name === 'London' || location.name === 'Milan',
            'dark': location.name === 'Seongnam-si'
          }"
          @click="handleLocationClick(location)"
        >
          <div class="location-info">
            <div v-if="location.isMyLocation" class="location-label">My Location</div>
            <div class="location-name">{{ location.name }}</div>
            <div class="weather-desc">{{ location.weather }}</div>
          </div>
          <div class="temperature-info">
            <div class="current-temp">{{ location.temp }}°</div>
            <div class="high-low">H:{{ location.high }}° L:{{ location.low }}°</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Detail View -->
    <weather-detail
      v-else
      :weather-data="selectedLocationData"
      :location="selectedLocation.name"
      :forecast-data="forecastData"
      @back="selectedLocation = null"
    />
  </div>
</template>

<script>
import axios from 'axios';
import WeatherDetail from './components/WeatherDetail.vue';
import WeatherSearch from './components/WeatherSearch.vue';

export default {
  name: 'App',
  components: {
    WeatherDetail,
    WeatherSearch
  },
  data() {
    return {
      searchQuery: '',
      searchSuggestions: [],
      loading: false,
      error: null,
      apiKey: 'b456677c964bf24b9932113b9ac335a9',
      debounceTimeout: null,
      selectedLocation: null,
      selectedLocationData: null,
      forecastData: null,
      savedLocations: [
        {
          id: 1,
          name: 'Bangsar South',
          isMyLocation: true,
          weather: 'Moderate Rain',
          temp: 24,
          high: 30,
          low: 25
        },
        {
          id: 2,
          name: 'Seongnam-si',
          time: '7:30 PM',
          weather: 'Partly Cloudy',
          temp: 21,
          high: 29,
          low: 15
        },
        {
          id: 3,
          name: 'London',
          time: '10:30 AM',
          weather: 'Not as cold tomorrow, with a high of 16°',
          temp: 9,
          high: 16,
          low: -4
        },
        {
          id: 4,
          name: 'Milan',
          time: '11:30 AM',
          weather: 'Not as cold tomorrow, with a high of 20°',
          temp: 12,
          high: 20,
          low: 0
        }
      ]
    }
  },
  methods: {
    // Debounce search to prevent too many API calls
    debounceSearch() {
      if (this.debounceTimeout) clearTimeout(this.debounceTimeout);
      this.debounceTimeout = setTimeout(() => {
        this.handleSearchInput();
      }, 500);
    },

    async handleSearchInput() {
      if (this.searchQuery.length < 3) {
        this.searchSuggestions = [];
        this.error = null;
        return;
      }

      this.loading = true;
      this.error = null;

      try {
        // First, get the coordinates for the searched city
        const geoResponse = await axios.get(
          `https://api.openweathermap.org/geo/1.0/direct?q=${this.searchQuery}&limit=5&appid=${this.apiKey}`
        );

        if (geoResponse.data.length === 0) {
          this.error = 'No locations found. Please try another search.';
          this.searchSuggestions = [];
          return;
        }

        // Get weather for each location
        const suggestionsWithWeather = await Promise.all(
          geoResponse.data.map(async (location) => {
            try {
              const weatherResponse = await axios.get(
                `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&units=metric&appid=${this.apiKey}`
              );

              return {
                id: `${location.lat}-${location.lon}`,
                name: location.name,
                state: location.state,
                country: location.country,
                lat: location.lat,
                lon: location.lon,
                temp: weatherResponse.data.main.temp,
                weather: weatherResponse.data.weather[0].description,
                high: Math.round(weatherResponse.data.main.temp_max),
                low: Math.round(weatherResponse.data.main.temp_min)
              };
            } catch (error) {
              console.error('Error fetching weather:', error);
              return null;
            }
          })
        );

        this.searchSuggestions = suggestionsWithWeather.filter(suggestion => suggestion !== null);
      } catch (error) {
        this.error = 'Error searching for locations. Please try again.';
        console.error('Error:', error);
      } finally {
        this.loading = false;
      }
    },

    async handleLocationClick(location) {
      this.loading = true;
      this.error = null;

      try {
        const weatherResponse = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&units=metric&appid=${this.apiKey}`
        );

        const forecastResponse = await axios.get(
          `https://api.openweathermap.org/data/2.5/onecall?lat=${location.lat}&lon=${location.lon}&units=metric&exclude=minutely,alerts&appid=${this.apiKey}`
        );

        this.$router.push({
          path: '/details',
          query: {
            weatherData: JSON.stringify(weatherResponse.data),
            forecastData: JSON.stringify(forecastResponse.data),
            location: `${location.name}, ${location.country}`
          }
        });
      } catch (error) {
        this.error = 'Error fetching weather details. Please try again.';
        console.error('Error:', error);
      } finally {
        this.loading = false;
      }
    },

    async fetchWeatherData(location) {
      try {
        const geoResponse = await axios.get(
          `https://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=1&appid=${this.apiKey}`
        );

        console.log('Geo Response:', geoResponse.data);

        if (geoResponse.data.length === 0) {
          this.error = 'No locations found. Please try another search.';
          return;
        }

        const { lat, lon } = geoResponse.data[0];
        const weatherResponse = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${this.apiKey}`
        );

        console.log('Weather Response:', weatherResponse.data);

        const forecastResponse = await axios.get(
          `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=metric&exclude=minutely,alerts&appid=${this.apiKey}`
        );

        console.log('Forecast Response:', forecastResponse.data);

        this.$router.push({
          path: '/details',
          query: {
            weatherData: JSON.stringify(weatherResponse.data),
            forecastData: JSON.stringify(forecastResponse.data),
            location: `${geoResponse.data[0].name}, ${geoResponse.data[0].country}`
          }
        });
      } catch (error) {
        this.error = `Error fetching weather details: ${error.message}`;
        console.error('Error:', error);
      }
    }
  }
}
</script>

<style>
.app {
  min-height: 100vh;
  background: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

.container {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

header h1 {
  font-size: 32px;
  font-weight: bold;
  margin: 0;
}

.profile-icon {
  font-size: 24px;
}

.search-container {
  position: relative;
  margin-bottom: 20px;
}

.search-box {
  background: #e8e8e8;
  border-radius: 10px;
  padding: 8px 16px;
  display: flex;
  align-items: center;
}

.search-icon {
  margin-right: 10px;
  color: #666;
}

.search-box input {
  border: none;
  background: transparent;
  width: 100%;
  padding: 8px 0;
  font-size: 16px;
  outline: none;
}

.location-cards {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.location-card {
  background: #1e56a8;
  border-radius: 15px;
  padding: 20px;
  color: white;
  display: flex;
  justify-content: space-between;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.location-card:hover {
  transform: scale(1.02);
}

.location-card.primary {
  background: #1e56a8;
}

.location-card.dark {
  background: #2c3e50;
}

.location-info {
  flex: 1;
}

.location-label {
  font-size: 14px;
  margin-bottom: 5px;
}

.location-name {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 5px;
}

.weather-desc {
  font-size: 16px;
  opacity: 0.8;
}

.temperature-info {
  text-align: right;
  min-width: 100px;
}

.current-temp {
  font-size: 48px;
  font-weight: bold;
  margin-bottom: 5px;
}

.high-low {
  font-size: 14px;
  opacity: 0.8;
}

.search-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border-radius: 10px;
  margin-top: 5px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  max-height: 300px;
  overflow-y: auto;
  z-index: 1000;
}

.suggestion-item {
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  border-bottom: 1px solid #eee;
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-item:hover {
  background-color: #f5f5f5;
}

.suggestion-info {
  flex: 1;
}

.suggestion-name {
  font-size: 16px;
  margin: 0;
  color: #333;
}

.suggestion-desc {
  font-size: 14px;
  margin: 4px 0 0;
  color: #666;
}

.suggestion-temp {
  font-size: 16px;
  color: #333;
  margin-left: 15px;
}

/* Add these new styles for loading and error states */
.search-box {
  position: relative;
}

.loading-indicator {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
}

.error-message {
  color: red;
  margin-top: 5px;
  font-size: 14px;
}
</style>