<template>
  <span class="hero">
    Hero: (level: {{hero.level}} HP: {{Math.round(hero.health)}} +{{hero.resBonusPoints * 60 + 240}}
    <select @change="updateProduction" v-model="selectedResource">
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
    return {
      selectedResource: this.hero.resBonusType,
      recourses
    }
  },
  methods: {
    updateProduction: function(e) {
      this.api.updateHeroProduction({userId: this.hero.playerId, resourceId: e.target.value })
    },
    startAdventure: function() {
      if (!this.hero.isMoving && this.hero.adventurePoints > 0) {
        this.api.send('startAdventure', {userId: this.hero.playerId})
      }
    }
  }
}
</script>

<style scoped>
</style>
