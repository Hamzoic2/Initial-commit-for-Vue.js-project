<template>
  <div class="weather-display">
    <div v-if="loading" class="loading">
      Loading...
    </div>
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    <div v-else-if="weatherData" class="weather-info">
      <h2>{{ weatherData.name }}, {{ weatherData.sys.country }}</h2>
      <div class="temperature">
        {{ Math.round(weatherData.main.temp) }}°C
      </div>
      <div class="weather-description">
        <img 
          :src="`http://openweathermap.org/img/w/${weatherData.weather[0].icon}.png`" 
          :alt="weatherData.weather[0].description"
        >
        <p>{{ weatherData.weather[0].description }}</p>
      </div>
      <div class="weather-details">
        <p>Humidity: {{ weatherData.main.humidity }}%</p>
        <p>Wind Speed: {{ weatherData.wind.speed }} m/s</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WeatherDisplay',
  props: {
    weatherData: Object,
    loading: Boolean,
    error: String
  }
}
</script>

<style scoped>
.weather-display {
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 10px;
  padding: 20px;
  margin-top: 20px;
}

.loading, .error {
  padding: 20px;
  font-size: 1.2em;
}

.error {
  color: red;
}

.weather-info {
  text-align: center;
}

.temperature {
  font-size: 3em;
  margin: 20px 0;
}

.weather-description {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.weather-details {
  margin-top: 20px;
}

.weather-details p {
  margin: 5px 0;
}
</style> 