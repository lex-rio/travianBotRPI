<template>
  <div class="village">
    <div class="village-header">
      <!-- <select v-model="selectedListId">
        <option v-for="({ listId, listName }, i) in farmLists" :value="listId" :key="i">{{listName}}</option>
      </select> -->
      <!-- <a href="#" @click="api.send('addAction', { userId: village.playerId, type: 2, params: {listIds: [selectedListId], villageId: village.villageId} })">addFarm</a> -->
      <b class="village-name">
        {{village.name}}({{village.population}})
        <a>({{village.coordinates.x}}|{{village.coordinates.y}})</a>
        Distance: <span class="distance">{{distance}}</span>
      </b>
      <div class="army">
        <label v-for="(troop, i) in army" :key="i">
          <input type="checkbox" :name="`chousenTroops[${i}]`">
          <i :class="`unit ${tribes[village.tribeId]} unitType${i}`"></i>{{troop}}
        </label>
      </div>
    </div>
    <span class="movements-block">
      <div class="movement-group" v-for="(group, i) in troopsMovingGroup" :key="i">
        <details :open="group.data.length < 6">
          <summary class="movement-group-header">
            <i :class="`movement-icon movement-${moveTypes[group.data[0].movement.movementType] || group.data[0].movement.movementType} ${group.type}`"></i>
            {{group.data.length}}
          </summary>
          <div class="movement" v-for="(data, i) in group.data" :key="i">
            <i :class="`movement-icon movement-${moveTypes[data.movement.movementType] || data.movement.movementType} ${group.type}`"></i>
            <template v-for="(amount, unitId) in data.units">
              <span v-if="amount>0" :key="unitId">
                {{amount}}<i :title="tribes[data.tribeId] + unitId" :class="`unit ${tribes[data.tribeId]} unitType${unitId}`"></i>
              </span>
            </template>
            {{data.playerName}} ({{data.villageName}})
            {{+Object.values(data.movement.resources).join('') ? Object.values(data.movement.resources).join('|') : ''}}
            {{timelib.timeLeft(data.movement.timeFinish)}}
          </div>
        </details>
      </div>
    </span>
    <span class="resources-block">
      <div class="resource" v-for="(resource, i) in village.storage" :key="i">
        <div>
          {{Math.floor(resource)}}/{{village.storageCapacity[i]}}
          <i :class="`unit_${recourses[i]} general-sprite-img`"></i>
        </div>
        <progress :value="Math.floor(resource)" :max="village.storageCapacity[i]"></progress>
        <br>
        +{{village.production[i]}}
      </div>
    </span>
    <BuildingQueue :queue="buildingQueue" :buildings="village.buildings"></BuildingQueue>
  </div>
</template>

<script>
import { tribes, recourses, moveTypes } from "./../../constants";
import BuildingQueue from './BuildingQueue'
export default {
  name: 'Village',
  inject: ['api', 'timelib'],
  props: {
    village: Object,
    farmLists: Object
  },
  data() {
    return {
      tribes,
      recourses,
      moveTypes,
      movingGroup: {},
      countDounTimers: [],
      selectedListId: null
    }
  },
  methods: {
    openCustomQueue: function(e) {
      console.log(e)
    }
  },
  computed: {
    army: function() { return this.village.troopsStationary ? this.village.troopsStationary[0].data.units : [] },
    troopsMovingGroup: function() {
      return this.village.troopsMoving && this.village.troopsMoving.reduce((acc, { data }) => {
        if (data.movement) {
          const key = `${data.movement.movementType}.${+(this.village.villageId === data.movement.villageIdTarget)}.${+(data.capacity > 3000)}`
          if (!acc[key]) {
            acc[key] = {
              data: [],
              type: this.village.villageId === data.movement.villageIdTarget ? 'incoming' : 'outgoing'
            }
          }
          acc[key].data.push(data)
        } else {
          console.log('error', this.village.villageId, data)
        }
        return acc
      }, {})
    },
    distance: function() { return Math.round(Math.sqrt(
      Math.pow(this.village.coordinates.x - this.api.coordinates.x, 2) + Math.pow(this.village.coordinates.y - this.api.coordinates.y, 2)
    ))},
    buildingQueue: function() { 
      return this.village.buildingQueue ? Object.values(this.village.buildingQueue.queues) : []
    }
  },
  components: { BuildingQueue },
}
</script>

<style>
details>summary~* {
  margin-left: 20px;
}
summary {
  cursor: pointer;
}
.openQueue {
  cursor: pointer;
  line-height: 78px;
}
.building {
  position: relative;
}
.buildingProgress{
  width: 100%;
  position: absolute;
  top: -5px;
}
</style>