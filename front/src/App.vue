<template>
  <div>
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

export default {
  name: "App",
  data() {
    return {
      usersData: new Map(),
      api: new ApiClient(),
    };
  },
  created() {
    this.api.registerCallbacks({
      init: ({ users }) =>
        users.forEach((user) =>
          this.usersData.set(+user.userId, user.actions[0])
        ),
      // saveUser: (data) => console.log(data),
      updateUserData: (user) => this.usersData.set(+user.userId, user),
      saveUser: ({ actions }) => this.usersData.set(+actions[0].userId, actions[0]),
      // deleteUser: ({ actions }) => this.usersData.set(+actions[0].userId, actions[0]),
    });
  },
  provide: function () {
    return {
      api: this.api,
      currentUser: this.currentUser,
    };
  },
  computed: {
    users() {
      return this.usersData;
    },
  },
  components: {
    User,
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
