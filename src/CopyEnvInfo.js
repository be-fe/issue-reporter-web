/**
 * @file CopyEnvInfo
 * @author imcuttle <moyuyc95@gmail.com>
 * @date 2018/11/6
 *
 */
import * as React from 'react'
import * as PropTypes from 'prop-types'
import { notify } from 'react-notify-toast'
import { defaults } from 'react-notify-toast/bin/defaults'
import { createPortal } from 'react-dom'
import copy from 'copy-text-to-clipboard'
import template from 'lodash.template'
import i18n from '@rcp/hoc.i18n'
import AwaitEventEmitter from 'await-event-emitter'

import getEnvInfo from './env-info'

const createNotifyContainer = () => {
  let container = document.getElementById(defaults.wrapperId)
  if (!container) {
    container = document.createElement('div')
    container.setAttribute('id', defaults.wrapperId)
    document.body.appendChild(container)
  }
  return () => {
    container.parentElement && container.parentElement.removeChild(container)
  }
}

class CopyEnvInfo extends React.Component {
  static propTypes = {
    templateString: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    shouldCopy: PropTypes.bool,
    envInfo: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.shape({
        $openUrl: PropTypes.string,
        url: PropTypes.string,
        browser: PropTypes.string,
        browserVersion: PropTypes.string,
        os: PropTypes.string
      })
    ]),
    onAfterText: PropTypes.func,
    transformEnv: PropTypes.func,
    openUrlDelayMsWhenCopied: PropTypes.number
  }

  static defaultProps = {
    shouldCopy: true,
    templateString: [
      '**Environments:**',
      '- URL: ${url}',
      '- OS: ${os}',
      '- Browser: ${browser} ${browserVersion}',
      '${ error ? "- Error: `" + error + "`" : "" }'
    ].join('\n'),
    openUrlDelayMsWhenCopied: 1000
  }

  componentDidMount() {
    window.addEventListener('error', this.handleError)
  }

  componentWillUnmount() {
    window.removeEventListener('error', this.handleError)
  }

  handleError = error => {
    this.error = error
  }

  error = null
  envInfo = {}
  hooks = new AwaitEventEmitter()

  assignEnvInfo(data) {
    Object.assign(this.envInfo, data)
  }

  setEnvInfo(data) {
    this.envInfo = data
  }

  getEnvInfo() {
    const { envInfo } = this.props
    return Object.assign(
      getEnvInfo(),
      {
        error: this.error ? this.error.message : this.error
      },
      this.envInfo,
      typeof envInfo === 'function' ? envInfo() : envInfo
    )
  }

  notify = (msg, type) => {
    const remove = createNotifyContainer()
    const ms = 2000
    notify.show(
      msg,
      'custom',
      ms,
      {
        error: { background: '#dd494f', text: '#FFFFFF' },
        success: { background: '#40da7c', text: '#FFFFFF' }
      }[type]
    )
    if (this._t) {
      clearTimeout(this._t)
    }
    this._t = setTimeout(() => {
      remove && remove()
      delete this._t
    }, ms + defaults.animationDuration)
  }

  async getEnv() {
    const env = this.getEnvInfo()
    await this.hooks.emit('env', env)
    this.props.transformEnv && this.props.transformEnv(env)
    return env
  }

  getText(env) {
    let templateString = this.props.templateString
    if (typeof this.props.templateString === 'function') {
      templateString = this.props.templateString()
    }
    return template(templateString)(env)
  }

  copyValue = async () => {
    const { templateString, shouldCopy } = this.props

    if (!templateString) {
      return this.notify(this.i('copy.null.template'), 'error')
    }

    const env = await this.getEnv()
    const text = this.getText(env)

    const data = { text, env }
    this.hooks.emitSync('text', data)

    this.props.onAfterText && this.props.onAfterText(data.text, env)

    const lazyOpen = () => {
      env.$openUrl &&
        setTimeout(() => {
          window.open(env.$openUrl)
        }, this.props.openUrlDelayMsWhenCopied)
    }

    if (shouldCopy) {
      const isSuccess = copy(data.text)
      if (isSuccess) {
        this.notify(this.i('copy.success'), 'success')
      } else {
        this.notify(this.i('copy.fail'), 'error')
      }
      if (isSuccess) {
        lazyOpen()
      }

      return isSuccess
    }

    if (env.$openUrl) {
      window.open(env.$openUrl)
    }
  }

  render() {
    return (
      <div className="copy-env-info-btn">
        <button className="copy-env-info-button-small copy-env-info-button-danger" onClick={this.copyValue}>
          {this.i('issue.report')}
        </button>
      </div>
    )
  }
}

const I18nCopyEnvInfo = i18n({
  'en-US': {
    'copy.null.template': 'Template is not existed',
    'copy.fail': 'Copy Failed',
    'copy.success': 'Copied',
    'issue.report': 'Report Bug'
  },
  'zh-CN': {
    'copy.null.template': '不存在需要复制的文本模板',
    'copy.fail': '复制失败',
    'copy.success': '复制成功',
    'issue.report': '发现 Bug'
  }
})(CopyEnvInfo)

I18nCopyEnvInfo.i18n.setLanguage('en-US')

export default I18nCopyEnvInfo
