<template>
  <div>
    <div class="users">
      <User v-for="user in users" :key="user.userId" :user="user"></User>
    </div>
    <form>
      <input type="hidden" name="userId" id="userId">
      <input type="text" name="session" id="sessionId" placeholder="session">
      <span id="userName"></span>
      <button type="button" onclick="app.send('saveUser', Object.fromEntries(new FormData(this.closest('form'))))">save</button>
    </form>
  </div>
</template>

<script>
import User from './components/User.vue'

export default {
  name: 'App',
  mounted() {
    const ws = new WebSocket(`ws://${window.location.hostname}:8082`)
    ws.onmessage = ({ data }) => {
      const parsed = JSON.parse(data)
      if (this[parsed.actionName]) {
        this[parsed.actionName](parsed)
      }
    }
  },
  methods: {
    init: function ({ users }) {
      this.usersData = users
    }
  },
  data() {
    return { usersData: [] }
  },
  computed: {
    users () {
      return this.usersData
    }
  },
  components: {
    User
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>
