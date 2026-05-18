const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Document extends Model {}

  Document.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      ownerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'owner_id',
        references: {
          model: 'users',
          key: 'id',
        },
      },
    },
    {
      sequelize,
      modelName: 'Document',
      tableName: 'documents',
      timestamps: true,
    }
  );

  return Document;
};
