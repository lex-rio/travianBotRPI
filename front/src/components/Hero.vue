<template>
  <span class="hero">
    Hero: (level: {{hero.level}} HP: {{Math.round(hero.health)}} +{{hero.resBonusPoints * 60 + 240}}
    <select @change="updateProduction" >
      <option v-for="(recourse, i) in recourses" :value="i" :key="i">{{recourse}}</option>
    </select>
    <i @click="startAdventure" 
      :class="`movement-icon movement-adventure ${!hero.isMoving && hero.adventurePoints > 0 || 'disabled'}`"></i>)
  </span>
</template>

<script>
import { recourses } from './../../constants'

export default {
  name: 'Hero',
  inject: ['api'],
  props: {
    hero: Object
  },
  data() {
    return { recourses }
  },
  methods: {
    updateProduction: function(e) {
      this.api.updateHeroProduction({userId: this.hero.playerId, resourceId: e.target.value })
    },
    startAdventure: function() {
      if (!this.hero.isMoving && this.hero.adventurePoints > 0) {
        console.log('startAdventure')
        //app.send('startAdventure', {userId: this.hero.playerId})
      }
    }
  }
}
</script>

<style scoped>
.movement-icon {
  display: inline-block;
  background-image: url(https://cdn.traviantools.net/game/0.98/layout/images/sprites/movement.png);
  width: 16px;
  height: 16px
}

.movement-adventure {
  cursor: pointer;
  background-position: -283px -180px;
}
</style>
