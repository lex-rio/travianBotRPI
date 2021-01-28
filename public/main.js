"use strict";
const tribes = {1:'Рим',2:'Немец',3:'Галл'}
const recourses = {1:'wood',2:'clay',3:'iron', 4:'crop'}

const usersContainer = document.getElementById('users')
const usersForm = document.getElementById('usersForm')
const app = {

  users: new Proxy({}, {
    set: (target, prop, user) => {
      target[prop] = user
      
      const userContainer = document.getElementById(`user-${user.userId}`) || document.createElement('div')
      userContainer.setAttribute('id', `user-${user.userId}`)
      userContainer.innerHTML = `<div class="user-head">
          <span class="general-info"></span>
          <a href="#" onclick="app.updateUserForm(${user.userId})">🖉</a>
          <a href="#" onclick="app.send('deleteUser', {userId: ${user.userId}})">✘</a>
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
  },

  renderVillage (village) {
    // console.log(village.buildingQueue)
    // const slot1 = village.buildingQueue.queues[1].pop() || {}
    // const slot2 = village.buildingQueue.queues[4].pop() || {}
    // ${slot1.buildingType}<br>
    // ${slot2.buildingType}<br>
    return `<div id="village-${village.villageId}">
      <i class="unitSmall gaul unitType4 troops-sprite-img"></i>
      <span class="vill-name">${village.name}(${village.population}) -</span>
      ${Object.keys(village.storage).map(resourseId => this.renderResourses(village, resourseId)).join('')}
    </div>`
  },

  renderResourses (village, resourseId) {
    return `<div class="resourse">
              <div>
                ${Math.floor(village.storage[resourseId])}/${village.storageCapacity[resourseId]}
                <i class="unit_${recourses[resourseId]} general-sprite-img"></i>
              </div>
              <progress
                value="${Math.floor(village.storage[resourseId])}" 
                max="${village.storageCapacity[resourseId]}"></progress>
              <br>
              +${village.production[resourseId]}
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
    app[action](error, dataset)
  } catch (e) {
    console.log(e.message)
  }
  
}