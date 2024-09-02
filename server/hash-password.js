const bcrypt = require('bcrypt');

const plainPassword = 'test0';  // プレーンテキストパスワード
bcrypt.hash(plainPassword, 10, (err, hashedPassword) => {
    if (err) {
        console.error('Error hashing password:', err);
    } else {
        console.log('Hashed password:', hashedPassword);
    }
});