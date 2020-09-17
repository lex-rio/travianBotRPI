"use strict";

const usersContainer = document.getElementById('users')
const usersForm = document.getElementById('usersForm')
const app = {

  ws: new WebSocket(`ws://${window.location.hostname}:8082`),

  send (action, data) {this.ws.send(JSON.stringify({action, data}))},

  init ({initialData, schemas}) {
    initialData.users.map(this.addUser)
    usersForm.innerHTML = this.generateForm(schemas.user, 'User')
  },

  addUser ({userName, userId}) {
    const userContainer = document.createElement('div')
    userContainer.setAttribute('id', `user-${userId}`)
    userContainer.innerHTML = `${userName} <a href="#" onclick="app.send('deleteUser', {userId: ${userId}})">✘</a><div class="villages"></div>`
    usersContainer.appendChild(userContainer)
  },

  generateForm (schema, entity) {
    return '<form>' + 
      schema.map(({name}) => `<input type="text" name="${name}" placeholder="${name}">`).join('') +
      `<input type="button" value="add" onclick="app.send('add${entity}', Object.fromEntries(new FormData(this.closest(\'form\'))))">` +
    '<form>'
  },

  deleteUser ({userId}) {
    const userBlock = document.getElementById(`user-${userId}`)
    userBlock.parentNode.removeChild(userBlock)
  },

  updateUser (data) {
    const userBlock = document.getElementById(`user-${data.playerId}`)
    const villagesBlock = userBlock.getElementsByClassName('villages')[0]
    villagesBlock.innerHTML = data.villages.map(village => `<div id="village-${village.villageId}">
      ${village.name} - ${[1,2,3,4].map(resourseId => this.renderResourses(village, resourseId)).join('')}
    </div>`).join('')
    userBlock.appendChild(villagesBlock)
  },

  renderResourses (village, resourseId) {
    return `<div class="resourse">
              <progress 
                title="${Math.floor(village.storage[resourseId])}/${village.storageCapacity[resourseId]}" 
                value="${Math.floor(village.storage[resourseId])}" 
                max="${village.storageCapacity[resourseId]}"></progress>
              <br>
              ${village.production[resourseId]}
            </div>`
  },

  updateUserAttacks (data) {
    console.log(data)
  }
}
app.ws.onmessage = ({data}) => {
  const {action, dataset} = JSON.parse(data)
  app[action](dataset)
}