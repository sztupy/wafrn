import { DataTypes } from 'sequelize'
import { Migration } from '../migrate.js'

export const up: Migration = async (params) => {
  const queryInterface = params.context
  await queryInterface.addColumn('blocks', 'reason', {
    type: DataTypes.STRING,
    allowNull: true
  })

  await queryInterface.addColumn('mutes', 'reason', {
    type: DataTypes.STRING,
    allowNull: true
  })
}
export const down: Migration = async (params) => {
  const queryInterface = params.context
  await queryInterface.removeColumn('blocks', 'reason')
  await queryInterface.removeColumn('mutes', 'reason')
}
