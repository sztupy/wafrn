import { DataTypes } from 'sequelize'
import { Migration } from '../migrate.js'

export const up: Migration = async (params) => {
  const queryInterface = params.context
  await queryInterface.sequelize.query('DROP INDEX IF EXISTS "mediaUrlIndex"')
  await queryInterface.sequelize.query('CREATE INDEX CONCURRENTLY "mediaUrlIndex" ON "medias" (md5("url"));')
}
export const down: Migration = async (params) => {
  const queryInterface = params.context
  await queryInterface.sequelize.query(`DROP INDEX "mediaUrlIndex"`)
}
