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
      <Hero v-if="userData.hero" :hero="userData.hero"></Hero>
      <a href="#" v-if="!isWatcher" @click="api.send('setUserOnWatch', user.userId)">Make Watcher</a>
      <span class="timers">
        <span @click="api.send('triggerAction', { actionId: action.actionId, userId: user.userId })" 
          v-for="(action, i) in user.actions" 
          :key="i"
          :class="`timer timer-${action.actionName}`">
          {{action.timeLeft}}
        </span>
      </span>
      <span class="notifications">
        <a v-for="notification in userData.notifications" :key="notification.data.type" 
          :class="`notification clickable movement_${notifications[notification.data.type] || notification.data.type}_medium_flat_black`"></a>
      </span>
    </div>
    <div class="villages">
      <Village v-for="(village, i) in userData.villages" :village="village" :farmLists="userData.farmLists" :key="i"></Village>
    </div>
    <div class="error"></div>
  </div>
</template>

<script>
import { tribes, notifications } from "./../../constants";
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
    return { tribes, notifications };
  },
  computed: {
    userData: function () {
      return Object.values(this.user.actions)[0].lastResponse;
    },
    isWatcher: function () {
      return !!Object.values(this.user.actions).find(({actionName}) => actionName === 'getKingdomVillageAttacks')
    }
  },
  components: {
    Hero, Village
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
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
.notifications {
  float: right;
}
.notification {
  display: inline-block;
}
</style>
