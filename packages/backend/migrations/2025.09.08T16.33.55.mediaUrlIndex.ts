import { DataTypes } from 'sequelize'
import { Migration } from '../migrate.js'

export const up: Migration = async (params) => {
  const queryInterface = params.context
  await queryInterface.sequelize.query(`CREATE INDEX "mediaUrlIndex" ON "medias" USING gin ("url" gin_trgm_ops);`)
}
export const down: Migration = async (params) => {
  const queryInterface = params.context
  await queryInterface.sequelize.query(`DROP INDEX "mediaUrlIndex"`)
}
