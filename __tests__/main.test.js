/**
 * @file main
 * @author imcuttle
 * @date 2018/4/4
 */
const issueReporterRender = require('../standalone')
const copy = require('copy-text-to-clipboard')

const { dispatchErrorEvent } = require('./helper')
jest.mock('copy-text-to-clipboard')

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

function click(selector) {
  const node = document.querySelector(selector)
  node && node.click()
}

describe('issueReporterWeb', function() {
  beforeEach(() => {
    Object.defineProperty(navigator, 'userAgent', {
      value:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36'
    })
  })
  beforeEach(() => {
    document.body.innerHTML = '<div id="root"></div>'
  })

  it('issueReporter renders well', function() {
    issueReporterRender('#root')
    expect(document.body.innerHTML).toMatchInlineSnapshot(
      `"<div id=\\"root\\"><div class=\\"copy-env-info-btn\\"><button class=\\"copy-env-info-button-small copy-env-info-button-danger\\">Report Bug</button></div></div>"`
    )
  })

  it('issueReporter click copy', async function() {
    copy.setImpl(() => true)
    copy.mockClear()
    issueReporterRender('#root')
    click('.copy-env-info-btn button')
    await delay()
    expect(document.querySelector('#notification-wrapper').textContent).toBe('Copied')
    expect(copy).lastCalledWith(
      '**Environments**:\n' + '- URL: http://localhost/\n' + '- OS: Mac OS\n' + '- Browser: chrome 70.0.3538\n'
    )
  })

  it('issueReporter click copy failed', async function() {
    copy.setImpl(() => false)
    copy.mockClear()
    expect(copy).toBeCalledTimes(0)
    issueReporterRender('#root')
    click('.copy-env-info-btn button')
    await delay()
    expect(document.querySelector('#notification-wrapper').textContent).toBe('Copy Failed')
    expect(copy).toBeCalledTimes(1)
  })

  it('issueReporter pass templateString', async function() {
    const issue = issueReporterRender('#root', { templateString: '${error}' })
    expect(issue.call('error', 0)).toMatchInlineSnapshot(`null`)
    dispatchErrorEvent(new Error('abc error'))

    click('.copy-env-info-btn button')
    await delay()

    const error = issue.call('error', 0)
    expect(error.message).toMatchInlineSnapshot(`"abc error"`)
    expect(copy).lastCalledWith('abc error')
  })

  it('pass `envInfo`', async function() {
    const issue = issueReporterRender('#root', {
      templateString: '${browser} ${lala} ${bala}',
      envInfo: () => ({ browser: 'br' })
    })
    issue.call('assignEnvInfo', [{ lala: 'lll' }])
    issue.call('hooks.on', [
      'env',
      env => {
        Object.assign(env, {
          bala: 'baba'
        })
      }
    ])

    expect(await issue.call('getText', [await issue.call('getEnv', 0)], 0)).toMatchInlineSnapshot(`"br lll baba"`)

    issue.call('hooks.on', [
      'env',
      env => {
        Object.assign(env, {
          bala: 'abc'
        })
      }
    ])
    expect(await issue.call('getText', [await issue.call('getEnv', 0)], 0)).toMatchInlineSnapshot(`"br lll abc"`)
  })
})
