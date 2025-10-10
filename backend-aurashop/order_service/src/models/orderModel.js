const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { notEmpty: { msg: 'userId tidak boleh kosong' } },
  },
  items: {
    type: DataTypes.JSON,
    allowNull: false,
    validate: {
      isArray(value) {
        if (!Array.isArray(value)) {
          throw new Error('items harus berupa array');
        }
      },
    },
  },
  totalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: { min: 0 },
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending',
    validate: {
      isIn: {
        args: [['pending', 'paid', 'shipped', 'completed', 'cancelled']],
        msg: 'Status tidak valid',
      },
    },
  },
}, {
  tableName: 'orders',
  timestamps: true,
  paranoid: true,
  underscored: true,
});

module.exports = Order;
