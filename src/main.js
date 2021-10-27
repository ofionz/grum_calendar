import Vue from 'vue'
import './plugins/axios'
import App from './App.vue'
import store from './store'
import vuetify from './plugins/vuetify'
import '/node_modules/@syncfusion/ej2-base/styles/material.css';
import '/node_modules/@syncfusion/ej2-buttons/styles/material.css';
import '/node_modules/@syncfusion/ej2-calendars/styles/material.css';
import '/node_modules/@syncfusion/ej2-dropdowns/styles/material.css';
import '/node_modules/@syncfusion/ej2-inputs/styles/material.css';
import '/node_modules/@syncfusion/ej2-navigations/styles/material.css';
import '/node_modules/@syncfusion/ej2-popups/styles/material.css';
import '/node_modules/@syncfusion/ej2-vue-schedule/styles/material.css';

Vue.config.productionTip = false

new Vue({
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
