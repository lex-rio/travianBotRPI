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
          <i :class="`unit ${tribes[village.tribeId]} unitType${i}`"></i>{{troop.amount}}
        </label>
      </div>
    </div>
    <span class="movements-block"></span>
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
import { tribes, recourses } from "./../../constants";
export default {
  name: 'Village',
  props: {
    village: Object
  },
  data() {
    return { tribes, recourses }
  },
  computed: {
    army: function() { return this.village.troopsStationary[0].data.units }
  }
}
</script>
