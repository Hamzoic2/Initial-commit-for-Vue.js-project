import { createRouter, createWebHistory } from 'vue-router';
import App from '../App.vue';
import FullWeatherDetail from '../components/FullWeatherDetail.vue';

const routes = [
  { path: '/', component: App },
  { path: '/details', component: FullWeatherDetail, props: route => ({ query: route.query }) }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;