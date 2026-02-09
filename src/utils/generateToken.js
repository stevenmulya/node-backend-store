import jwt from 'jsonwebtoken';

const generateToken = (id, level) => {
    return jwt.sign({ id, level }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

export default generateToken;