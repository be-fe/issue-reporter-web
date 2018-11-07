/**
 * @file standalone
 * @author imcuttle <moyuyc95@gmail.com>
 * @date 2018/11/7
 *
 */

const Reporter = require('./src/')
const pizza = require('react-pizza')

module.exports = pizza(Reporter)
