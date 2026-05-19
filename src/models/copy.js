import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Copy = sequelize.define('Copy', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  status: {
    type: DataTypes.ENUM('AVAILABLE', 'BORROWED', 'MAINTENANCE', 'LOST', 'RESERVED'),
    defaultValue: 'AVAILABLE',
    allowNull: false,
  },
  bookId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

export default Copy;
