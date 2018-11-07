/**
 * @file example
 * @author imcuttle <moyuyc95@gmail.com>
 * @date 2018/11/7
 *
 */

const reporterRender = require('./standalone')
require('./src/style.less')

const newGitHubIssue = require('new-github-issue-url')

const reporter = reporterRender(window.root, { shouldCopy: true })

reporter.setProps({
  onAfterText(text, env) {
    Object.assign(env, {
      $openUrl: newGitHubIssue({
        title: 'Bug: emmm',
        user: 'be-fe',
        repo: 'issue-reporter-web',
        body: "\n\n\n---\nI'm a human. Please be nice.\n\n" + text
      })
    })
  }
})

// Way 2:
// reporter.call('hooks.on', [
//   'text', ({ env, text }) => {
//     Object.assign(env, {
//       $openUrl: newGitHubIssue({
//         title: 'Bug: emmm',
//         user: 'be-fe',
//         repo: 'issue-reporter-web',
//         body: '\n\n\n---\nI\'m a human. Please be nice.\n\n' + text
//       })
//     })
//   }
// ])

// Make latest mistake
throw new Error('Make mistake')
