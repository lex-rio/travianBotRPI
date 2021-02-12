<template>
  <div class="village">
    <div class="village-header">
      <b class="village-name">
        {{village.name}}({{village.population}})
        <a>({{village.coordinates.x}}|{{village.coordinates.y}})</a>
        Distance: <span class="distance"></span>
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
        <div class="movement-group-header" @click="group.opened = !group.opened">
          <i :class="`movement-icon movement-${moveTypes[group.data[0].movement.movementType] || group.data[0].movement.movementType} ${group.type}`"></i>
            {{group.data.length}}
        </div> 
        <div class="movements-list" :style="`height: ${group.data.length === 1 || group.opened ? 'auto': '0px'}`">
          <div class="movement" v-for="(data, i) in group.data" :key="i">
            <i :class="`movement-icon movement-${moveTypes[data.movement.movementType] || data.movement.movementType} ${group.type}`"></i>
            <span v-for="(amount, unitId) in data.units" :key="unitId">
              {{amount}}
              <i :title="tribes[data.tribeId] + unitId" :class="`unit ${tribes[data.tribeId]} unitType${unitId}`"></i>
            </span>
            {{data.playerName}} ({{data.villageName}})
            {{+Object.values(data.movement.resources).join('') ? Object.values(data.movement.resources).join('|') : ''}}
            {{time(data.movement.timeFinish)}}
          </div>
        </div>
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
    <span class="building-queue"></span>
  </div>
</template>

<script>
//{ "troopId": "641275", "tribeId": "1", "playerId": "2288", "playerName": "кокос", "villageId": "536559644", "villageName": "0путь", "villageIdLocation": "536559644", "villageNameLocation": "", "playerIdLocation": "2288", "playerNameLocation": "", "filter": "", "villageIdSupply": "536559644", "status": "transit", "units": { "2": "67" }, "supplyTroops": "67", "capacity": 1340, "movement": { "troopId": "641275", "villageIdStart": "536363019", "villageIdTarget": "536559644", "playerIdTarget": "-1", "coordinateID": 0, "timeStart": "1613137003", "timeFinish": "1613143492", "movementType": "9", "resources": { "1": 0, "2": 0, "3": 0, "4": 0 }, "treasures": "0", "spyTarget": "0", "catapultTarget1": "0", "catapultTarget2": "0", "merchants": "0" } }
import { tribes, recourses, moveTypes } from "./../../constants";
export default {
  name: 'Village',
  props: {
    village: Object
  },
  mounted() {
    console.log(this.village.troopsMoving)
    this.movingGroup = this.village.troopsMoving.reduce((acc, { data }) => {
      if (data.movement) {
        const key = `${data.movement.movementType}.${+(this.village.villageId === data.movement.villageIdTarget)}.${+(data.capacity > 3000)}`
        if (!acc[key]) {
          acc[key] = {
            data: [],
            opened: false,
            type: this.village.villageId === data.movement.villageIdTarget ? 'incoming' : 'outgonig'
          }
        }
        acc[key].data.push(data)
      } else {
        console.log('error', this.village.villageId, data)
      }
      return acc
    }, {})
    console.log(this.movingGroup)
  },
  data() {
    return { tribes, recourses, moveTypes, movingGroup: {} }
  },
  methods: {
    time: function(timestamp) {
      return new Date(+timestamp * 1000).toLocaleTimeString(undefined, { hour12: false })
    }
  },
  computed: {
    army: function() { return this.village.troopsStationary[0].data.units },
    troopsMovingGroup: function() { return this.movingGroup }
  }
}
</script>
