/**
 * @file copy-text-to-clipboard
 * @author imcuttle <moyuyc95@gmail.com>
 * @date 2018/11/7
 *
 */

let impl = () => true

module.exports = Object.assign(jest.fn(() => impl()), {
  setImpl: im => {
    impl = im
  }
})
