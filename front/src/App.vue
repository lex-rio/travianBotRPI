<template>
  <div>
    <input type="text" :value="`(${api.coordinates.x}|${api.coordinates.y})`">
    <div class="users">
      <User v-for="[userId, user] in users" :key="userId" :user="user"></User>
    </div>
    <form>
      <input type="hidden" v-model="api.currentUser.userId" />
      <input
        type="text"
        v-model="api.currentUser.session"
        placeholder="session"
      />
      <span id="userName"></span>
      <button type="button" @click="api.saveUser(api.currentUser)">save</button>
    </form>
  </div>
</template>

<script>
import User from "./components/User.vue";
import ApiClient from "./apiClient";
import Timer from "./Timer";

export default {
  name: "App",
  data() {
    return {
      users: new Map(),
      api: new ApiClient(),
      timer: new Timer()
    };
  },
  created() {
    this.api.registerCallbacks({
      init: ({ users }) =>
        users.forEach((user) =>
          this.users.set(+user.userId, user)
        ),
      updateUserData: (userdata) => {
        const user = this.users.get(+userdata.userId)
        user.actions[userdata.actionId] = userdata
      },
      saveUser: ({ actions }) => this.users.set(+actions[0].userId, actions[0]),
      // deleteUser: ({ actions }) => this.users.set(+actions[0].userId, actions[0]),
    });
  },
  provide: function () {
    return {
      api: this.api,
      timer: this.timer
    };
  },
  // computed: {
  //   users() {
  //     return this.users;
  //   },
  // },
  components: {
    User
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>
