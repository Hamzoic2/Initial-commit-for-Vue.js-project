<template>
  <div class="search-container">
    <form @submit.prevent="handleSubmit">
      <input 
        type="text" 
        v-model="location" 
        placeholder="Enter city name"
        class="search-input"
      >
      <button type="submit" class="search-button">Search</button>
    </form>
  </div>
</template>

<script>
export default {
  name: 'WeatherSearch',
  data() {
    return {
      location: ''
    }
  },
  methods: {
    handleSubmit() {
      if (this.location.trim()) {
        this.$emit('location-submitted', this.location);
        this.location = '';
      }
    }
  }
}
</script>

<style scoped>
.search-container {
  margin-bottom: 30px;
}

.search-input {
  padding: 10px;
  width: 200px;
  border: none;
  border-radius: 4px;
  margin-right: 10px;
}

.search-button {
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.search-button:hover {
  background-color: #45a049;
}
</style> 