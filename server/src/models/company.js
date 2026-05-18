const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Company extends Model {}

  Company.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        field: 'user_id',
        references: {
          model: 'users',
          key: 'id',
        },
      },
    },
    {
      sequelize,
      modelName: 'Company',
      tableName: 'companies',
      timestamps: false,
    }
  );

  return Company;
};
