// Each book gets 1-4 copies, all AVAILABLE
const COPIES_PER_BOOK = {
  1: 4, 2: 3, 3: 3, 4: 3, 5: 2,
  6: 2, 7: 2, 8: 2, 9: 2, 10: 2,
  11: 2, 12: 2, 13: 2, 14: 2, 15: 2,
  16: 2, 17: 1, 18: 1, 19: 1, 20: 1,
  21: 1, 22: 1, 23: 1, 24: 1, 25: 1,
  26: 1, 27: 1, 28: 1, 29: 1, 30: 1,
  31: 1, 32: 1, 33: 1, 34: 1, 35: 1,
  36: 1, 37: 1,
};

const COPIES = [];
let codeNum = 1;

for (let bookId = 1; bookId <= 37; bookId++) {
  const count = COPIES_PER_BOOK[bookId] || 1;
  for (let i = 0; i < count; i++) {
    COPIES.push({
      code: `BC-${String(codeNum).padStart(3, '0')}`,
      bookId,
      status: 'AVAILABLE',
    });
    codeNum++;
  }
}

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert('Copies',
      COPIES.map((c) => ({
        ...c,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
    );
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('Copies', null, {});
    await queryInterface.sequelize.query('ALTER TABLE Copies AUTO_INCREMENT = 1');
  },
};
