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
    usersContainer.innerHTML = users.map(({userName, id}) => `<div>${userName} <a href="#" onclick="app.deleteUser(${id})">✘</a></div>`).join('')
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
  }
}
app.ws.onmessage = ({data}) => {
  const {action, dataset} = JSON.parse(data)
  app[action](dataset)
}
const addUser = user => app.send({action: 'addUser', data: user})