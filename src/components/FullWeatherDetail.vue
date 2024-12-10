<template>
  <div class="full-weather-detail">
    <div class="header">
      <button class="back-btn" @click="$emit('back')">&lt;</button>
      <span class="location">{{ location }}</span>
    </div>

    <div class="date">{{ currentDate }}</div>

    <div class="current-weather">
      <div class="weather-icon">
        <img :src="getWeatherIcon(weatherData?.weather[0].icon)" alt="weather icon">
      </div>
      <div class="temperature">{{ Math.round(weatherData?.main?.temp) }}°C</div>
      <div class="condition">{{ weatherData?.weather[0].description }}</div>
      <div class="last-update">Last Update {{ lastUpdateTime }}</div>
    </div>

    <div class="forecast-container">
      <div class="forecast-section">
        <h3>Hourly Forecast</h3>
        <div class="hourly-forecast">
          <div class="forecast-item" v-for="hour in hourlyForecast" :key="hour.dt">
            <div class="time">{{ formatTime(hour.dt) }}</div>
            <img :src="getWeatherIcon(hour.weather[0].icon)" alt="weather icon" class="forecast-icon">
            <div class="temp">{{ Math.round(hour.temp) }}°</div>
          </div>
        </div>
      </div>

      <div class="forecast-section">
        <h3>Weekly Forecast</h3>
        <div class="weekly-forecast">
          <div class="weekly-item" v-for="day in dailyForecast" :key="day.dt">
            <div class="day-info">
              <span class="day">{{ formatDay(day.dt) }}</span>
              <span class="condition">{{ day.weather[0].main }}</span>
            </div>
            <img :src="getWeatherIcon(day.weather[0].icon)" alt="weather icon" class="forecast-icon">
            <span class="temp">{{ Math.round(day.temp.day) }}°C</span>
            <span class="arrow">›</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FullWeatherDetail',
  props: {
    weatherData: Object,
    location: String,
    forecastData: Object
  },
  data() {
    return {
      localWeatherData: null,
      localForecastData: null,
      localLocation: ''
    };
  },
  created() {
    const query = this.$route.query;
    this.localWeatherData = JSON.parse(query.weatherData);
    this.localForecastData = JSON.parse(query.forecastData);
    this.localLocation = query.location;
  },
  computed: {
    currentDate() {
      return new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    },
    lastUpdateTime() {
      return new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    },
    hourlyForecast() {
      return this.localForecastData?.hourly?.slice(0, 4) || [];
    },
    dailyForecast() {
      return this.localForecastData?.daily?.slice(0, 7) || [];
    }
  },
  methods: {
    getWeatherIcon(iconCode) {
      return `http://openweathermap.org/img/wn/${iconCode}@2x.png`;
    },
    formatTime(timestamp) {
      return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    },
    formatDay(timestamp) {
      return new Date(timestamp * 1000).toLocaleDateString('en-US', {
        weekday: 'long'
      });
    }
  }
}
</script>

<style scoped>
.full-weather-detail {
  min-height: 100vh;
  background: #4169E1;
  color: white;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.back-btn {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 5px;
}

.location {
  font-size: 18px;
}

.date {
  text-align: center;
  margin-bottom: 30px;
}

.current-weather {
  text-align: center;
  margin-bottom: 40px;
}

.weather-icon img {
  width: 100px;
  height: 100px;
}

.temperature {
  font-size: 48px;
  margin: 10px 0;
}

.condition {
  font-size: 20px;
  margin: 10px 0;
}

.last-update {
  font-size: 14px;
  opacity: 0.8;
}

.forecast-container {
  background: white;
  border-radius: 25px 25px 0 0;
  padding: 20px;
  margin: 0 -20px;
}

.forecast-section {
  margin-bottom: 30px;
}

.forecast-section h3 {
  color: #333;
  margin-bottom: 15px;
}

.hourly-forecast {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
}

.forecast-item {
  text-align: center;
  color: #333;
}

.forecast-icon {
  width: 40px;
  height: 40px;
}

.weekly-forecast {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.weekly-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #333;
  padding: 10px 0;
}

.day-info {
  display: flex;
  flex-direction: column;
  min-width: 120px;
}

.day {
  font-weight: bold;
}

.condition {
  font-size: 14px;
  opacity: 0.8;
}

.arrow {
  color: #666;
  font-size: 20px;
}
</style>
