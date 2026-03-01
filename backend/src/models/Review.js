const { DataTypes, UUIDV4 } = require('sequelize');
const sequelize = require('../config/database').sequelize;

const Review = sequelize.define(
  'Review',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    bookId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    helpful: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    timestamps: true,
    tableName: 'reviews',
  }
);

// Associations
Review.associate = (models) => {
  Review.belongsTo(models.User, { foreignKey: 'userId' });
  Review.belongsTo(models.Book, { foreignKey: 'bookId' });
};

module.exports = Review;
