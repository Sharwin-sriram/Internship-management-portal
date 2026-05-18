const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Internship extends Model {}

  Internship.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      companyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'company_id',
        references: {
          model: 'companies',
          key: 'user_id',
        },
      },
    },
    {
      sequelize,
      modelName: 'Internship',
      tableName: 'internships',
      timestamps: true,
    }
  );

  return Internship;
};
