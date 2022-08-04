"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const authService = require('./auth.service');
const logger = require('../../services/logger.service');
async function login(req, res) {
    const { username, password } = req.body;
    try {
        const user = await authService.login(username, password);
        const loginToken = authService.getLoginToken(user);
        logger.info('User login: ', user);
        res.cookie('loginToken', loginToken);
        res.json(user);
    }
    catch (err) {
        logger.error('Failed to Login ' + err);
        res.status(401).send({ err: 'Failed to Login' });
    }
}
async function signup(req, res) {
    try {
        const { username, password, fullname, avatar = 'https://www.pphfoundation.ca/wp-content/uploads/2018/05/default-avatar-600x600.png', } = req.body;
        // Never log passwords
        // logger.debug(fullname + ', ' + username + ', ' + password)
        const account = await authService.signup(username, password, fullname, avatar);
        logger.debug(`auth.route - new account created: ` + JSON.stringify(account));
        const user = await authService.login(username, password);
        const loginToken = authService.getLoginToken(user);
        logger.info('User login: ', user);
        res.cookie('loginToken', loginToken);
        res.json(user);
    }
    catch (err) {
        logger.error('Failed to signup ' + err);
        res.status(500).send({ err: 'Failed to signup' });
    }
}
async function logout(req, res) {
    try {
        res.clearCookie('loginToken');
        res.send({ msg: 'Logged out successfully' });
    }
    catch (err) {
        res.status(500).send({ err: 'Failed to logout' });
    }
}
module.exports = {
    login,
    signup,
    logout,
};
//# sourceMappingURL=auth.controller.js.map