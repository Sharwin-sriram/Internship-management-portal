const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Student extends Model {}

  Student.init(
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
      modelName: 'Student',
      tableName: 'students',
      timestamps: false,
    }
  );

  return Student;
};
