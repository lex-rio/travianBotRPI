"use strict";

const usersContainer = document.getElementById('users')
const usersForm = document.getElementById('usersForm')
const app = {

  users: new Proxy({}, {
    set: (target, prop, user) => {
      target[prop] = user
      
      const userContainer = document.getElementById(`user-${user.userId}`) || document.createElement('div')
      userContainer.setAttribute('id', `user-${user.userId}`)
      userContainer.innerHTML = `<b class="name">${user.userName}</b>
        <a href="#" onclick="app.updateUserForm(${user.userId})">🖉</a>
        <a href="#" onclick="app.send('deleteUser', {userId: ${user.userId}})">✘</a>
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

  init (error, {initialData, schemas, types}) {
    console.log(types)
    initialData.users.map(user => {console.log(user); this.users[user.userId] = user})
    usersForm.innerHTML = this.generateForm(schemas.user, 'User')
  },

  updateUserForm (userId) {
    const list = document.querySelectorAll('[type="text"]')
    list.forEach(input => input.value = this.users[userId][input.name])
    const button = document.querySelector('[type="button"]')
    button.value = 'save'
    button.onclick = e =>
      this.send( 'updateUser', Object.fromEntries(new FormData(e.target.closest('form'))) )
  },

  generateForm (schema, entity) {
    return '<form>' + 
      schema.map(({name}) => `<label>${name}<input type="text" name="${name}" placeholder="${name}"></label>`).join('') +
      `<input type="button" value="add" onclick="app.send('add${entity}', Object.fromEntries(new FormData(this.closest(\'form\'))))">` +
    '<form>'
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

  updateUserData (error, {userId, name, villages}) {
    const userBlock = document.getElementById(`user-${userId}`)
    if (error) {
      return userBlock.getElementsByClassName('error')[0].innerHTML = error
    }
    if (name) {
      userBlock.getElementsByClassName('name')[0].innerHTML = name
    }
    const villagesBlock = userBlock.getElementsByClassName('villages')[0]
    villagesBlock.innerHTML = villages.map(village => `<div id="village-${village.villageId}">
      ${village.name}(${village.population}) - ${[1,2,3,4].map(resourseId => this.renderResourses(village, resourseId)).join('')}
    </div>`).join('')
    userBlock.appendChild(villagesBlock)
  },

  renderResourses (village, resourseId) {
    return `<div class="resourse">
              <div>${Math.floor(village.storage[resourseId])}/${village.storageCapacity[resourseId]}</div>
              <progress 
                title="${Math.floor(village.storage[resourseId])}/${village.storageCapacity[resourseId]}" 
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