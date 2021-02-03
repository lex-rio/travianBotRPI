"use strict";
const tribes = { 1: 'roman', 2: 'herm', 3: 'gaul' }
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
  36: 'heal',
  50: 'trade'
}

const usersContainer = document.getElementById('users')
const usersForm = document.getElementById('usersForm')
const timers = new Map()
const createTimer = ({ actionId, timeLeft, actionName, userId }) => {
  const timerWrapper = document.createElement('span')
  timerWrapper.className = `timer timer-${actionName}`
  timerWrapper.title = actionName
  const timerBlock = document.createElement('span')
  
  timerBlock.onclick = () =>
    app.send('triggerAction', { actionId, userId })
  
  const pause = document.createElement('span')
  pause.className = 'pause'
  pause.innerHTML = timeLeft ? '⏸' : '▶'
  pause.onclick = () =>
    app.send('toggleAction', { state: timeLeft ? 'running' : 'paused', actionId, userId })

  timers.set(actionId, { state: timeLeft ? 'running' : 'paused',timerBlock, value: timeLeft })
  timerWrapper.append(timerBlock, pause)
  
  return timerWrapper
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

  renderHero(data) {
    return `Hero: (level: ${data.level} HP: ${Math.round(data.health)} +${data.resBonusPoints * 60 + 240} 
            <select onchange="app.sendUpdateHeroProduction(${data.playerId}, this.value)">
              ${Object.entries(recourses).map(([resourceId, resource]) => `
                <option ${data.resBonusType == resourceId ? 'selected' : ''} value="${resourceId}">${resource}</option>
              `)}
            </select> 
            <i onclick="${data.adventurePoints} > 0 && app.send('startAdventure', {userId: ${data.playerId}})" 
               class="movement-icon movement-adventure adventure ${data.adventurePoints > 0 || 'disabled'}">)`
  },

  time(timestamp) {
    return new Date(+timestamp * 1000).toLocaleTimeString(undefined, { hour12: false })
  },

  toggleGroup(el) {
    const h = +el.getAttribute('data-height')
    el.setAttribute('data-height', h ? 0 : 1)
    el.style = `height: ${h ? '0px' : 'auto'}`
  },
  
  renderVillage(village) {
    return `<div class="village">
      <div class="village-header">
        <b class="vill-name">${village.name}(${village.population})</b>
        <div class="army">${this.renderArmy(village.troopsStationary[0].data.units, village.villageId, village.tribeId)}</div>
      </div>
      <span class="movements-block">${this.renderMovements(village.troopsMoving, village.villageId)}</span>
      <span class="resources-block">${Object.keys(village.storage).map(resourceId => this.renderResources(village, resourceId)).join('')}</span>
      <span class="building-queue">${this.renderBuildingQueue(village.buildingQueue.queues, village.buildings)}</span>
    </div>`
  },

  renderBuildingQueue(queues, buildings) {
    const slots = Object.values(queues).map(([slot]) => {
      if (!slot) return '<span class="building"></span>'
      console.log(slot)
      const building = buildings.find(({ data }) => data.locationId === slot.locationId)
      console.log(building.data)
      return `<span title="${this.time(slot.finished)}" class="building buildingType${slot.buildingType}"><div class="levelBubble">${building.data.lvl-0+1}</div></span>
              `
    })
    return slots.join('')
  },

  renderArmy(units, villageId, tribeId = 1) {
    return Object.entries(units).map(
      ([unitTypeId, amount]) =>
        `<label>
          <input type="checkbox" name="chousenTroops[${villageId}][${unitTypeId}]">
          <i class="unit ${tribes[tribeId]} unitType${unitTypeId}"></i>${amount}
        </label>`
      ).join('')
  },

  renderMovements(troopsMoving, villageId) {
    if (!troopsMoving) {
      return ''
    }    
    const movementGroups = troopsMoving.reduce((acc, { data }) => {
      if (data.movement) {
        const key = `${data.movement.movementType}.${+(villageId === data.movement.villageIdTarget)}.${+(data.capacity > 3000)}`
        if (!acc[key]) {
          acc[key] = []
        }
        acc[key].push(data)
      } else {
        console.log('error', villageId, data)
      }
      return acc
    }, {})
    const movements = Object.values(movementGroups).map(movements => {
      return movements.length > 1 ? `
        <div class="movement-group">
          <div class="movement-group-header" onclick="app.toggleGroup(this.parentNode.getElementsByClassName('movements-list')[0])">
            <i class="movement-icon movement-${moveTypes[movements[0].movement.movementType]} ${movements[0].movement.villageIdTarget === villageId ? 'incoming' : 'outgoing'}"></i>
            ${movements.length}
          </div> 
          <div class="movements-list" style="height: 0px" data-height="0">
            ${movements.map(mv => this.renderMovement(mv, villageId)).join('')}
          </div>
        </div>
      ` : movements.map(mv => this.renderMovement(mv, villageId)).join('')
    })
    return movements.join('')
  },

  renderMovement(data, villageId) {
    const visible = data.units && Object.values(data.units).some(unit => unit > -1)
    const units = visible
      ? Object.entries(data.units)
        .filter(([_, canSee]) => canSee !== 0)
        .map(([unitId, canSee]) => `${canSee > 0 ? canSee : '?'}
          <i title="${tribes[data.tribeId] + unitId}" class="unit ${tribes[data.tribeId]} unitType${unitId}"></i>`)
      : ''

    return `<div class="movement">
      <i class="movement-icon movement-${moveTypes[data.movement.movementType]} ${data.movement.villageIdTarget === villageId ? 'incoming' : 'outgoing'}"></i> 
      ${units}
      ${data.playerName}(${data.villageName}) 
      ${+Object.values(data.movement.resources).join('') ? Object.values(data.movement.resources).join('|') : ''}
      ${this.time(data.movement.timeFinish)}
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
}
app.ws.onmessage = ({ data }) => {
  const parsed = JSON.parse(data)
  if (app[parsed.actionName]) {
    if (parsed.actionId) {
      const timer = timers.get(parsed.actionId) || createTimer(parsed)
      if (!timer) {
        console.log(parsed)
      }
      timer.value = parsed.timeLeft
    }
    app[parsed.actionName](parsed)
  }
}