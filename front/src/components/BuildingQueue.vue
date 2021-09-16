<template>
  <span class="building-queue">
    <template v-for="([slot], i) in queue" >
      <span v-if="slot" :key="i"
        :class="`building buildingMini buildingType${slot.buildingType} queueType${slot.queueType} ${+slot.paid && 'paid'}`"
        :title="estimate" @mouseover="estimate = timelib.timeLeft(slot.finished)">
        <div class="levelBubble">{{building(slot.locationId).data.lvl - 0 + 1}}</div>
        <progress v-if="slot.timeStart > 0" :value="currentTime - slot.timeStart" :max="slot.finished - slot.timeStart" class="buildingProgress"></progress>
      </span>
      <span v-else class="building" :key="i+'2'"></span>
    </template>
    <span class="building" @click="openCustomQueue"><div class="openQueue" >(123)</div></span>
  </span>
</template>

<script>

export default {
  name: 'BuildingQueue',
  inject: ['timelib'],
  props: {
    queue: Array,
    buildings: {}
  },
  data() {
    return {
      currentTime: Math.trunc((new Date()).getTime() / 1000),
      estimate: ''
    }
  },
  methods: {
    building: function(locationId) {
      return this.buildings.find(({ data }) => data.locationId === locationId)
    },
  }
}
</script>
