import { DataTypes } from 'sequelize'
import { Migration } from '../migrate.js'

export const up: Migration = async (params) => {
  const queryInterface = params.context
  await queryInterface.sequelize.query(`CREATE EXTENSION IF NOT EXISTS btree_gin`)
  await queryInterface.sequelize.query(
    `CREATE INDEX "tags_index_createdAt_desc" ON "postTags" USING gin ("createdAt", "tagName" gin_trgm_ops);`
  )
}
export const down: Migration = async (params) => {
  const queryInterface = params.context
  await queryInterface.sequelize.query(`DROP INDEX "tags_index_createdAt_desc"`)
}
