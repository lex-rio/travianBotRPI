<template>
  <div>
    <div class="user-head">
      <a href="#" @click="api.setCurrentUser(user)"><i class="action_edit action"></i></a>
      <a href="#" @click="api.deleteUser(user)"><i class="action_delete action"></i></a>
      <span class="general-info">
        <b class="name">
          {{ userData.name }} ({{userData.kingdomTag}}) {{ tribes[userData.tribeId] }}
        </b>
        <i class="unit_gold general-sprite-img"></i>
        {{ userData.gold }}
        <i class="unit_silver general-sprite-img"></i>
        {{ userData.silver }}
        <i class="unit_population general-sprite-img"></i>:
        {{ userData.population }}
      </span>
      <Hero :hero="userData.hero"></Hero>
      <span class="timers">
        <span @click="api.send('triggerAction', { actionId: action.actionId, userId: user.userId })" 
          v-for="(action, i) in user.actions" 
          :key="i"
          :class="`timer timer-${action.actionName}`">
          {{action.timeLeft}}
        </span>
      </span>
    </div>
    <div class="villages">
      <Village v-for="(village, i) in userData.villages" :village="village" :key="i"></Village>
    </div>
    <div class="error"></div>
  </div>
</template>

<script>
import { tribes } from "./../../constants";
import Hero from "./Hero.vue";
import Village from "./Village.vue";
export default {
  name: "User",
  inject: ['api', 'timer'],
  props: {
    user: Object,
  },
  created() {
    this.timer.subscribe(() => Object.values(this.user.actions).forEach(action => action.timeLeft--))
  },
  data() {
    return { tribes };
  },
  computed: {
    userData: function () {
      return Object.values(this.user.actions)[0].lastResponse;
    }
  },
  components: {
    Hero, Village
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.action {
  display: inline-block;
  background-image: url(https://cdn.traviantools.net/game/0.98/layout/images/sprites/general.png);
  width: 16px;
  height: 16px;
}
.action_edit {
  background-position: -425px -160px;
}
.action_delete {
  background-position: -457px -194px;
  width: 11px;
  height: 11px;
}
.user-head {
  background-color: aquamarine;
}
</style>
