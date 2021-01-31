"use strict";
const tribes = { 1: 'Рим', 2: 'Немец', 3: 'Галл' }
const recourses = { 1: 'wood', 2: 'clay', 3: 'iron', 4: 'crop' }
const moveTypes = {
  3: 'attack',
  4: 'reyd',
  5: "support",
  7: 'trade',
  9: "support_back",
  10: 'settle',
  20: 'adventure',
  33: 'trade_back',
  36: 'heal'
}

const usersContainer = document.getElementById('users')
const usersForm = document.getElementById('usersForm')
const timers = new Map()
const createTimer = ({ actionId, timeLeft, actionName, userId }) => {
  const timerBlock = document.createElement('span')
  timerBlock.className = `timer-${actionName}`
  timerBlock.title = actionName
  timerBlock.setAttribute('data-action_id', actionId)
  timerBlock.setAttribute('data-user_id', userId)
  timerBlock.onclick = (e) => app.send('triggerAction', {
    actionId: e.target.getAttribute('data-action_id'),
    userId: e.target.getAttribute('data-user_id'),
  })
  timers.set(actionId, { timerBlock, value: timeLeft })
  return timerBlock
}

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
          <span class="timers"></span>
        </div>
        <div class="villages"></div>
        <div class="error"></div>`
      usersContainer.appendChild(userContainer)
      userContainer.getElementsByClassName('timers')[0].append(...user.actions.map(createTimer))
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

  send(action, data) { this.ws.send(JSON.stringify({ action, data })) },

  /** @callback */
  init({ initialData: { users } }) {
    users.map(user => this.users[user.userId] = user)
    setInterval(() => timers
      .forEach(timer => timer.timerBlock.innerHTML = timer.value--)
      , 1000)
  },

  updateUserForm(userId) {
    const list = document.querySelectorAll('[type="text"]')
    list.forEach(input => input.value = this.users[userId][input.name])
    const button = document.querySelector('[type="button"]')
    button.value = 'save'
    button.onclick = e =>
      this.send('updateUser', Object.fromEntries(new FormData(e.target.closest('form'))))
  },

  /** @callback */
  deleteUser({ userId }) {
    delete this.users[userId]
  },

  /** @callback */
  updateUser(data) {
    this.users[data.userId] = data
  },

  /** @callback */
  addUser(data) {
    this.users[data.userId] = data
  },

  /** @callback */
  updateUserData(action) {
    const userBlock = document.getElementById(`user-${action.userId}`)
    if (action.error) {
      return userBlock.getElementsByClassName('error')[0].innerHTML = error
    }
    const villagesBlock = userBlock.getElementsByClassName('villages')[0]
    villagesBlock.innerHTML = action.lastResponse.villages.map(village => this.renderVillage(village)).join('')
    userBlock.appendChild(villagesBlock)

    const infoBlock = userBlock.getElementsByClassName('general-info')[0]
    infoBlock.innerHTML = `<b class="name">${action.lastResponse.name}(${action.lastResponse.kingdomTag}) ${tribes[action.lastResponse.tribeId]}</b> 
      <i class="unit_gold general-sprite-img"></i> ${action.lastResponse.gold}
      <i class="unit_silver general-sprite-img"></i> ${action.lastResponse.silver}
      <i class="unit_population general-sprite-img"></i>: ${action.lastResponse.population}`

    const heroBlock = userBlock.getElementsByClassName('hero')[0]
    heroBlock.innerHTML = `${this.renderHero(action.lastResponse.hero)}`
  },

  sendUpdateHeroProduction(userId, resourceId) {
    this.send('updateHeroProduction', { userId, resourceId })
  },

  /** @callback */
  updateHeroProduction(data) {
    // console.log(data)
  },

  renderHero(data) {
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

  renderVillage(village) {
    const movements = village.troopsMoving.map(({ data }) => `<div class="movement">
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

  renderResources(village, resourceId) {
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

  updateUserAttacks(data) {
    console.log(data)
  }
}
app.ws.onmessage = ({ data }) => {
  const parsed = JSON.parse(data)
  if (app[parsed.actionName]) {
    if (parsed.actionId) {
      const timer = timers.get(parsed.actionId) || createTimer(parsed)
      timer.value = parsed.timeLeft
    }
    app[parsed.actionName](parsed)
  }
}