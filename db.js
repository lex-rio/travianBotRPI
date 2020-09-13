const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite', console.error)

const addRowToTable = (table, data) => {
  return new Promise((resolve, reject) => {
    const keys = Object.keys(data)
    db.run(
      `INSERT INTO ${table} (${keys.join(',')}) VALUES (${'?,'.repeat(keys.length).slice(0,-1)})`,
      Object.values(data),
      function (err) {
        err ? reject(err) : resolve({...data, ...{id: this.lastID}})
      }
    )
  })
}
const deleteFromTable = (table, condition) => {
  return new Promise((resolve, reject) => {
    const keys = Object.keys(condition)
    db.run(
      `DELETE FROM ${table} WHERE ${Object.keys(condition).map(key => key + ' = ?').join(',')}`,
      Object.values(condition),
      err => err ? reject(err) : resolve(condition)
    )
  })
}
const getOneFromTable = (table, condition) => {
  return new Promise((resolve, reject) => {
    const keys = Object.keys(condition)
    db.get(
      `SELECT *  FROM ${table} WHERE ${Object.keys(condition).map(key => key + ' = ?').join(',')}`,
      Object.values(condition),
      (err, data) => err ? reject(err) : resolve(data)
    )
  })
}

module.exports = {addRowToTable, deleteFromTable, getOneFromTable, db}