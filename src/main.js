import Vue from 'vue'
import './plugins/axios'
import App from './App.vue'
import store from './store'
import vuetify from './plugins/vuetify'
import { VueMaskDirective } from "v-mask";

Vue.directive("mask", VueMaskDirective);
Vue.config.productionTip = false
Vue.prototype.$event_bus = new Vue ();

if((window.location.href.indexOf('localhost') + 1)) {
  window.serverUrl = 'http://www.localhost:8080/https://devb24.abcgrooming.ru/'
}
else if (window.location.href.indexOf('devb24.abcgrooming.ru') + 1) {
  window.serverUrl  = 'https://devb24.abcgrooming.ru/';
}
else if (window.location.href.indexOf('b24.abcgrooming.ru') + 1)  {
  Vue.prototype.$production = true;
  window.serverUrl  = 'https://b24.abcgrooming.ru/';
}
else {
  console.log('Ошибка расположения!')
}

new Vue({
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
