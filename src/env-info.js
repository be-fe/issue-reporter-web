/**
 * @file env-info
 * @author imcuttle <moyuyc95@gmail.com>
 * @date 2018/11/6
 *
 */
import { detect } from 'detect-browser'

// 包括
//  url / 浏览器（版本，类型） / 系统
module.exports = function() {
  const data = detect() || {}
  return {
    url: location.href,
    os: data.os || '',
    browser: data.name || '',
    browserVersion: data.version || ''
  }
}
