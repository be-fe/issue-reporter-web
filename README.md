# issue-reporter-web

[![Build status](https://img.shields.io/travis/be-fe/issue-reporter-web/master.svg?style=flat-square)](https://travis-ci.org/be-fe/issue-reporter-web)
[![Test coverage](https://img.shields.io/codecov/c/github/be-fe/issue-reporter-web.svg?style=flat-square)](https://codecov.io/github/be-fe/issue-reporter-web?branch=master)
[![NPM version](https://img.shields.io/npm/v/issue-reporter-web.svg?style=flat-square)](https://www.npmjs.com/package/issue-reporter-web)
[![NPM Downloads](https://img.shields.io/npm/dm/issue-reporter-web.svg?style=flat-square&maxAge=43200)](https://www.npmjs.com/package/issue-reporter-web)
[![Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://prettier.io/)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg?style=flat-square)](https://conventionalcommits.org)

> The issue reporter integrated with ui.

![](https://i.loli.net/2018/11/08/5be30de897e96.png)

[Live Demo](http://eux.baidu.com/issue-reporter-web/)

## Installation

```bash
npm install issue-reporter-web
# or use yarn
yarn add issue-reporter-web
```

## 使用

### React 组件

```javascript
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import * as IssueReporterWeb from 'issue-reporter-web'

import 'issue-reporter-web/lib/style.less'
// 或者 import 'issue-reporter-web/lib/style.css'

ReactDOM.render(<IssueReporterWeb />, window.root)
```

### 独立环境使用

使用 [preact](https://github.com/developit/preact) + [react-pizza](https://github.com/imcuttle/react-pizza) 打包

```javascript
import * as issueReporterRender from 'issue-reporter-web/standalone'
// standalone 样式相比于上面组件样式，多了固定定位在页面右下角
import 'issue-reporter-web/standalone.less'
// import 'issue-reporter-web/standalone.css'

const reporter = issueReporterRender('#root', {
  /* ...props */
})

reporter.setProps({
  // ...
})

// 更多 standalone 用法请查看 react-pizza https://github.com/imcuttle/react-pizza
```

#### 使用 CDN 加载

```html
<body>
<div id="root"></div>
<script>
  (function () {
    var s = document.createElement('script');
    s.src = '//unpkg.com/issue-reporter-web@0';
    s.async = 'async';
    s.defer = 'defer';
    s.onload = function () {
      if (window.IssueReporterWeb) {
        window.IssueReporterWeb('#root')
      }
    }

    var lk = document.createElement('link');
    lk.rel = 'stylesheet';
    lk.href = '//unpkg.com/issue-reporter-web@0/dist/style.css';

    (document.head || document.getElementsByTagName('head')[0]).appendChild(s);
    (document.head || document.getElementsByTagName('head')[0]).appendChild(lk);
  })()
</script>
</body>
```

## API

### `Props`

React 组件的 Props

#### `templateString`

报告文本的模板字符串

- Type: `string | () => string`
- Default:

  ```javascript
  ;[
    '**Environments:**',
    '- URL: ${url}',
    '- OS: ${os}',
    '- Browser: ${browser} ${browserVersion}',
    '${ error ? "- Error: `" + error + "`" : "" }'
  ].join('\n')
  ```

#### `envInfo`

用于 [`templateString`](#templatestring) 的参数，其中的 `os / browser / browserVersion / url` 会根据浏览器信息预设值。

**特殊的**, 如果设置了 `$openUrl`，则会调用 `window.open` 打开其链接

- Type: `{$openUrl?: string} | () => object`
- Example

  ```
  {
    $openUrl: 'https://example.com'
  }
  ```

#### `shouldCopy`

是否复制最终的报告文本

- Type: `boolean`
- Default: `true`

#### `openUrlDelayMsWhenCopied`

当复制成功时，打开 url 的延迟毫秒

- Type: `number`
- Default: `1000`

#### `transformEnv`

在整合了数据后，触发 `transformEnv` 方法，一般用来转换 `envInfo`

- Example
  ```
  env => Object.assign(env, { name: 'imcuttle' })
  ```

#### `onAfterText`

当根据 [`envInfo`](#envinfo) 和 [`templateString`](#templatestring) 生成了文本后，触发该方法。

可以使用该方法，来设置 `$openUrl`

- Type: `(text: string, envInfo: object) => void 0`

- Example

  ```javascript
  ;(text, env) => {
    Object.assign(env, {
      $openUrl: 'http://example.com/new/issue?body=' + encodeURIComponent(text)
    })
  }
  ```

#### `language`

使用 [@rcp/hoc.i18n](https://github.com/imcuttle/rcp) 做组件国际化

- Type: `'en-us'|'zh-cn'`
- Default: `'en-us'`

#### `locale`

运行外部设置国际化字典

- Type: `{}`
- Example:
  ```
  {
    'copy.null.template': '不存在需要复制的文本模板',
    'copy.fail': '复制失败',
    'copy.success': '复制成功',
    'issue.report': '发现 Bug'
  }
  ```

### `Methods`

#### `assignEnvInfo(data: object)`

赋值给 `envInfo`，与 `props.envInfo` 的区别是，其优先级较低。

- Example
  ```javascript
  reporterRef.assignEnvInfo({ name: 'imcuttle' })
  ```

#### `setEnvInfo(data: object)`

重置 `envInfo`

- Example
  ```javascript
  reporterRef.setEnvInfo({ name: 'imcuttle' })
  ```

#### `notify(msg: string, type: 'error' | 'success')`

展示提示框

#### `copyValue(): Promise<any>`

复制文本，点击按钮也是触发该方法

### `hooks`

为了方便外部扩展，提供了钩子，使用如下

```javascript
reporterRef.hooks.once('text', ({ text, env }) => {
  // ...
})
```

以下钩子，触发的时间顺序排列

#### `env`

在获取完整环境变量后触发

- `env` (`{}`): 环境变量集合

#### `text`

在生成报告文本后触发

- `data` (`{}`)

  - `data.text` (`string`) - 生成的报告文本
  - `data.env` (`{}`) - 当前的环境变量

## Contributing

- Fork it!
- Create your new branch:  
  `git checkout -b feature-new` or `git checkout -b fix-which-bug`
- Start your magic work now
- Make sure npm test passes
- Commit your changes:  
  `git commit -am 'feat: some description (close #123)'` or `git commit -am 'fix: some description (fix #123)'`
- Push to the branch: `git push`
- Submit a pull request :)

## Authors

This library is written and maintained by be-fe, <a href="mailto:moyuyc95@gmail.com">moyuyc95@gmail.com</a>.

## License

MIT
