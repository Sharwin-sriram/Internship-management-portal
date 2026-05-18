const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Application extends Model {}

  Application.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      studentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'student_id',
        references: {
          model: 'students',
          key: 'user_id',
        },
      },
      internshipId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'internship_id',
        references: {
          model: 'internships',
          key: 'id',
        },
      },
    },
    {
      sequelize,
      modelName: 'Application',
      tableName: 'applications',
      timestamps: true,
    }
  );

  return Application;
};
