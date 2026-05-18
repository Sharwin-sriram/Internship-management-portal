const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Interview extends Model {}

  Interview.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      applicationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'application_id',
        references: {
          model: 'applications',
          key: 'id',
        },
      },
    },
    {
      sequelize,
      modelName: 'Interview',
      tableName: 'interviews',
      timestamps: true,
    }
  );

  return Interview;
};
