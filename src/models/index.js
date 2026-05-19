import Book from './book.js';
import Category from './category.js';
import User from './user.js';
import Author from './author.js';
import Copy from './copy.js';
import Reservation from './reservation.js';

Book.belongsTo(Category, { foreignKey: 'categoryId' });
Category.hasMany(Book, { foreignKey: 'categoryId' });

Book.belongsTo(Author, { foreignKey: 'authorId' });
Author.hasMany(Book, { foreignKey: 'authorId' });

Book.hasMany(Copy, { foreignKey: 'bookId' });
Copy.belongsTo(Book, { foreignKey: 'bookId' });

Copy.hasMany(Reservation, { foreignKey: 'copyId' });
Reservation.belongsTo(Copy, { foreignKey: 'copyId' });

User.hasMany(Reservation, { foreignKey: 'userId' });
Reservation.belongsTo(User, { foreignKey: 'userId' });

export { Book, Category, User, Author, Copy, Reservation };
