const usersContainer = document.getElementById('users')
const usersForm = document.getElementById('usersForm')
const app = {
  ws: new WebSocket('ws://localhost:8082'),
  send: function(data) {
    this.ws.send(JSON.stringify(data))
  },
  init: function ({initialData, schemas}) {
    this.renderUsers(initialData.users)
    usersForm.innerHTML = this.generateForm(schemas.user, 'User')
  },
  renderUsers: function (users) {
    usersContainer.innerHTML = users.map(({userName, userId}) => `<div id="user-${userId}">
      ${userName} 
      <a href="#" onclick="app.deleteUser(${userId})">✘</a>
      <div class="villages"></div>
    </div>`).join('')
  },
  generateForm: (schema, entity) => {
    return '<form>' + 
      schema.map(({name}) => `<input type="text" name="${name}" placeholder="${name}">`).join('') +
      `<input type="button" value="add" onclick="app.add${entity}(Object.fromEntries(new FormData(this.closest(\'form\'))))">` +
    '<form>'
  },
  addUser: function(user) {
    this.send({action: 'addUser', data: user})
  },
  deleteUser: function(id) {
    this.send({action: 'deleteUser', data: {id}})
  },
  updateUser: (data) => {
    const userBlock = document.getElementById(`user-${data.playerId}`)
    const villagesBlock = userBlock.getElementsByClassName('villages')[0]
    villagesBlock.innerHTML = data.villages.map(village => `<div id="village-${village.villageId}">
      ${village.name} - <span><progress value="${village.storage[1]}" max="${village.storageCapacity[1]}"></progress></span>
      <span><progress value="${village.storage[2]}" max="${village.storageCapacity[2]}"></progress></span>
      <span><progress value="${village.storage[3]}" max="${village.storageCapacity[3]}"></progress></span>
      <span><progress value="${village.storage[4]}" max="${village.storageCapacity[4]}"></progress></span>
    <div>`).join('')
    userBlock.appendChild(villagesBlock)
  }
}
app.ws.onmessage = ({data}) => {
  const {action, dataset} = JSON.parse(data)
  app[action](dataset)
}
const addUser = user => app.send({action: 'addUser', data: user})