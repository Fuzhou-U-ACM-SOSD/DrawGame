import Vue from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";
import store from "./store";

Vue.config.productionTip = false;

import VueFluent from "vfluentdesign";
import "vfluentdesign/lib/index.css";

Vue.use(VueFluent);

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
