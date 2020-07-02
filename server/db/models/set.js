const Sequelize = require('sequelize')
const db = require('../db')

const Set = db.define('set', {
  weight: {
    type: Sequelize.INTEGER
  },
  reps: {
    type: Sequelize.INTEGER,
    defaultValue: 1
  }
})

module.exports = Set