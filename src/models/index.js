import Book from './book.js';
import Category from './category.js';
import User from './user.js';
import Author from './author.js';

Book.belongsTo(Category, { foreignKey: 'categoryId' });
Category.hasMany(Book, { foreignKey: 'categoryId' });

Book.belongsTo(Author, { foreignKey: 'authorId' });
Author.hasMany(Book, { foreignKey: 'authorId' });

export { Book, Category, User, Author };
