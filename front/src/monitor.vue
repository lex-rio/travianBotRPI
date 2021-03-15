<template>
  <div>
    <details v-for="(villagesAttacks, kingdom) in kingdomAttacks" :key="kingdom" open>
      <summary>{{kingdom}}</summary>
      <details v-for="(villageAttacks, playerName) in villagesAttacks" :key="playerName" open>
        <summary>{{playerName}}</summary>
        <details v-for="({villageId, attacks}, i) in villageAttacks" :key="i" open>
          <summary>
            {{villages[villageId].name}}
            <a>({{villages[villageId].coordinates.x}}|{{villages[villageId].coordinates.y}})</a>
          </summary>
          <div v-for="(attack, i) in attacks" :key="i">
            <b>{{moveTypes[attack.data.movementType]}}</b>&nbsp;
            <span>finish: <b>{{ time(attack.data.timeFinish * 1000) }}</b></span>
            <span v-if="peeckedByKingdom[kingdom][attack.name] !== '?'">
              start: <b>{{ time(peeckedByKingdom[kingdom][attack.name] - 180000) }} - {{ time(peeckedByKingdom[kingdom][attack.name]) }}</b>
              time: <b>{{ time1(attack.data.timeFinish * 1000 - peeckedByKingdom[kingdom][attack.name]) }} + (0-3)minutes</b>
            </span>
          </div>
        </details>
      </details>
    </details>
  </div>
</template>

<script>
import { moveTypes } from "./../constants";
export default {
  name: "Monitor",
  inject: ["api"],
  data() {
    return {
      moveTypes,
      kingdomAttacks: {},
      villages: {},
      peeckedByKingdom: {}
    };
  },
  created() {
    this.api.registerCallbacks({
      getKingdomVillageAttacks: ({ lastResponse: {attacks, peecked, villages, kingdom} }) => {
        Object.entries(villages).forEach(([villageId, villageData]) => this.villages[villageId] = villageData)
        this.peeckedByKingdom[kingdom] = peecked
        if (attacks) {
          this.kingdomAttacks[kingdom] = attacks.reduce((userAttacks, {name, data}) => {
            const villageId = name.split(':').pop()
            if (!userAttacks[villages[villageId].playerName]) {
              userAttacks[villages[villageId].playerName] = []
            }
            userAttacks[villages[villageId].playerName].push({villageId, attacks: data.cache})
            return userAttacks
          }, {})
        }
      }
    });
  },
  methods: {
    time: function (timestamp) {
      return new Date(+timestamp).toLocaleTimeString(undefined, {hour12: false});
    },
    time1: function (timestamp) {
      return new Date(timestamp).toISOString().substr(11, 8);
    }
  },
};
</script>
<style>
  details>summary~* {
    margin-left: 20px;
  }
  summary {
    cursor: pointer;
  }
</style>
