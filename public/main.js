"use strict";
const tribes = {1:'Рим',2:'Немец',3:'Галл'}
const recourses = {1:'wood',2:'clay',3:'iron', 4:'crop'}
const moveTypes = {3: 'attack', 4: 'reyd', 5: "support", 7: 'trade', 9: "support_back", 10: 'settle', 20: 'adventure', 33: 'trade_back', 36: 'heal'}

const usersContainer = document.getElementById('users')
const usersForm = document.getElementById('usersForm')
const app = {

  users: new Proxy({}, {
    set: (target, prop, user) => {
      target[prop] = user
      
      const userContainer = document.getElementById(`user-${user.userId}`) || document.createElement('div')
      userContainer.setAttribute('id', `user-${user.userId}`)
      userContainer.innerHTML = `<div class="user-head">
          <a href="#" onclick="app.updateUserForm(${user.userId})"><i class="action_edit general-sprite-img"></i></a>
          <a href="#" onclick="app.send('deleteUser', {userId: ${user.userId}})"><i class="action_delete general-sprite-img"></i></a>
          <span class="general-info"></span>
          <span class="hero"></span>
        </div>
        <div class="villages"></div>
        <div class="error"></div>`
      usersContainer.appendChild(userContainer)
      return true
    },
    deleteProperty: (target, prop) => {
      delete target[prop]
      const userBlock = document.getElementById(`user-${prop}`)
      userBlock.parentNode.removeChild(userBlock)
      return true
    }
  }),

  ws: new WebSocket(`ws://${window.location.hostname}:8082`),

  send (action, data) {this.ws.send(JSON.stringify({action, data}))},

  init (error, {initialData, types}) {
    console.log(types)
    initialData.users.map(user => this.users[user.userId] = user)
  },

  updateUserForm (userId) {
    const list = document.querySelectorAll('[type="text"]')
    list.forEach(input => input.value = this.users[userId][input.name])
    const button = document.querySelector('[type="button"]')
    button.value = 'save'
    button.onclick = e =>
      this.send( 'updateUser', Object.fromEntries(new FormData(e.target.closest('form'))) )
  },

  deleteUser (error, {userId}) {
    delete this.users[userId]
  },

  updateUser (error, data) {
    this.users[data.userId] = data
  },

  addUser (error, data) {
    this.users[data.userId] = data
  },

  updateUserData (error, data) {
    const userBlock = document.getElementById(`user-${data.userId}`)
    if (error) {
      return userBlock.getElementsByClassName('error')[0].innerHTML = error
    }
    const villagesBlock = userBlock.getElementsByClassName('villages')[0]
    villagesBlock.innerHTML = data.villages.map(village => this.renderVillage(village)).join('')
    userBlock.appendChild(villagesBlock)
    
    const infoBlock = userBlock.getElementsByClassName('general-info')[0]
    infoBlock.innerHTML = `<b class="name">${data.name}(${data.kingdomTag}) ${tribes[data.tribeId]}</b> 
      <i class="unit_gold general-sprite-img"></i> ${data.gold}
      <i class="unit_silver general-sprite-img"></i> ${data.silver}
      <i class="unit_population general-sprite-img"></i>: ${data.population}`
    
      const heroBlock = userBlock.getElementsByClassName('hero')[0]
      heroBlock.innerHTML = `${this.renderHero(data.hero)}`
  },

  sendUpdateHeroProduction (userId, resourceId) {
    this.send( 'updateHeroProduction', {userId, resourceId} )
  },
  
  updateHeroProduction (error, data) {
    // console.log(data)
  },

  renderHero (data) {
    console.log(data.resBonusType)
    return `Hero: (level: ${data.level} HP: ${Math.round(data.health)} +${data.resBonusPoints * 60 + 240} <select onchange="app.sendUpdateHeroProduction(${data.playerId}, this.value)">
              ${Object.entries(recourses).map(([resourceId, resource]) => `
                <option ${data.resBonusType == resourceId ? 'selected' : ''} value="${resourceId}">${resource}</option>
              `)}
            </select>)`
  },

  time(timestamp) {
    return new Date(timestamp * 1000).toLocaleTimeString(undefined, { hour12: false })
  },

  renderVillage (village) {
    const movements = village.troopsMoving.map(({data}) => `<div class="movement">
      <i class="movement-icon movement-${moveTypes[data.movement.movementType]} ${data.movement.villageIdTarget === village.villageId ? 'incoming' : 'outgoing'}"></i> 
      ${data.playerName}(${data.villageName}) 
      ${+Object.values(data.movement.resources).join('') ? Object.values(data.movement.resources).join('|') : ''}
      ${this.time(data.movement.timeFinish)}
    </div>`)
    console.log(village.troopsMoving)
    // const slot1 = village.buildingQueue.queues[1].pop() || {}
    // const slot2 = village.buildingQueue.queues[4].pop() || {}
    // ${slot1.buildingType}<br>
    // ${slot2.buildingType}<br>
    return `<div id="village-${village.villageId}">
      <div class="vill-name">${village.name}(${village.population})</div>
      <span class="movements-block">${movements.join('')}</span>
      <!--<i class="unitSmall gaul unitType4 troops-sprite-img"></i>-->
      
      <span class="resources-block">${Object.keys(village.storage).map(resourceId => this.renderResources(village, resourceId)).join('')}</span>
    </div>`
  },

  renderResources (village, resourceId) {
    return `<div class="resource">
              <div>
                ${Math.floor(village.storage[resourceId])}/${village.storageCapacity[resourceId]}
                <i class="unit_${recourses[resourceId]} general-sprite-img"></i>
              </div>
              <progress
                value="${Math.floor(village.storage[resourceId])}" 
                max="${village.storageCapacity[resourceId]}"></progress>
              <br>
              +${village.production[resourceId]}
            </div>`
  },

  updateUserAttacks (data) {
    console.log(data)
  }
}
app.ws.onmessage = ({data}) => {
  try {
    const {action, dataset, error} = JSON.parse(data)
    console.log(action)
    if (app[action]) {
      app[action](error, dataset)
    }
  } catch (e) {
    console.log(e.message)
  }
  
}