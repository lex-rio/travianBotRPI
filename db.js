const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite', console.error)

const add = (table, data = []) =>
  Promise.all(data.map(row =>
    new Promise((resolve, reject) => {
      const keys = Object.keys(row)
      db.run(
        `INSERT INTO ${table} (${keys.join(',')}) VALUES (${'?,'.repeat(keys.length).slice(0,-1)})`,
        Object.values(row),
        function(err) {
          const cond = {}
          cond[table.slice(0, -1) + 'Id'] = this.lastID
          err ? reject(err) : getOne(table, cond).then(resolve).catch(reject)
        }
      )
    })
  ))

const remove = (table, condition) =>
  new Promise((resolve, reject) => {
    db.run(
      `DELETE FROM ${table} WHERE ${Object.keys(condition).map(key => key + ' = ?').join(',')}`,
      Object.values(condition),
      err => err ? reject(err) : resolve(condition)
    )
  })

const getOne = (table, condition) =>
  new Promise((resolve, reject) => {
    db.get(
      `SELECT * FROM ${table} WHERE ${Object.keys(condition).map(key => key + ' = ?').join(' AND ')}`,
      Object.values(condition),
      (err, data) => err ? reject(err) : resolve(data)
    )
  })

const update = (table, condition, data) =>
  new Promise((resolve, reject) => {
    const set = Object.keys(data)
    db.get(
      `UPDATE ${table} SET ${Object.keys(data).map(key => key + ' = ?').join(',')} WHERE ${Object.keys(condition).map(key => key + ' = ?').join(' AND ')}`,
      [...Object.values(data), ...Object.values(condition)],
      (err, data) => err ? reject(err) : resolve(data)
    )
  })

module.exports = {add, remove, getOne, update, db}