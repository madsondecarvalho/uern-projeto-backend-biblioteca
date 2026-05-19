import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Reservation = sequelize.define('Reservation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  copyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'PICKED_UP', 'CANCELLED', 'EXPIRED'),
    defaultValue: 'PENDING',
    allowNull: false,
  },
  reservedAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  pickedUpAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  returnedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
});

export default Reservation;
