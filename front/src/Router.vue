<template>
  <div>
    <App v-show="CurrentComponent.name === 'App'"></App>
    <Monitor v-show="CurrentComponent.name === 'Monitor'"></Monitor>
  </div>
</template>

<script>
import App from './App.vue'
import Monitor from './monitor.vue'
import ApiClient from "./apiClient";
import time from "./time"

const NotFoundComponent = { template: '<p>Page not found</p>' }
const routes = {
  '/': Monitor,
  '/villages': App
}

export default {
  name: "Router",
  data: () => ({
    api: new ApiClient(),
    timelib: time,
    currentRoute: window.location.pathname
  }),

  computed: {
    CurrentComponent() {
      return routes[this.currentRoute] || NotFoundComponent
    }
  },

  created () {
    window.onpopstate = e => {
      try {
        document.querySelector('#topnav a.active').classList.remove("active")
      } catch (e) {console.log(e)}
      document.querySelector(`#topnav a#${e.state}`).classList.add("active")
      this.currentRoute = window.location.pathname
    }
  },

  components: {
    App, Monitor
  },

  provide: function () {
    return {
      api: this.api,
      timelib: this.timelib
    }
  }
};
</script>
