import { DataTypes } from 'sequelize'
import { Migration } from '../migrate.js'

export const up: Migration = async (params) => {
  const queryInterface = params.context
  await queryInterface.sequelize.query(`CREATE EXTENSION IF NOT EXISTS btree_gin`)
  await queryInterface.sequelize.query(`CREATE INDEX "tags_created_at" ON "postTags" ("createdAt" DESC);`)
}
export const down: Migration = async (params) => {
  const queryInterface = params.context
  await queryInterface.sequelize.query(`DROP INDEX "tags_created_at"`)
}
