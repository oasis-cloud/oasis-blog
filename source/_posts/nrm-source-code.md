---
title: 源码分析——nrm
categories: Programming
tags: [JavaScript, Node.js]
---

> 首先要明确的是，源码分析的入手点是软件而不是源代码。软件（ Software ）是一个宽泛的概念，包括应用程序、工具箱和框架等等。软件可以说是由代码组成的，那么我们强调入手点是软件而不是源代码的原因是什么呢？
> 
> 源码分析从源代码入手，就容易落入具体实现的窠臼当中；而代码构成的软件整体，有其被创造的背景、要解决的问题、演进过程中面临的困难和决策，以及最终所为用户认知的形态。源码分析从软件整体入手，才能够脱离技术人员对技术本身的痴迷的影响，从务实的角度讲解代码要解决什么问题、代码如何解决问题的以及代码为什么要这么解决问题。——《https://cloud.tencent.com/developer/news/704548》

nrm 是一款发布到 npm 的软件，其目的是简化 npm 源的管理。为什么要管理 npm 源呢？npm 的官方源速度较慢，国内的淘宝提供了完整的镜像。有些公司可能会搭建自己的私有源，在开发过程中有些共享软件包只能切换到私有源进行下载安装。

一个可以发布到 npm 上的软件，其根目录下必然有 package.json 文件，并且 nrm 是基于 node.js 开发的 cli 软件，所以 [package.json](https://docs.npmjs.com/cli/v8/configuring-npm/package-json#main) 文件中的 `bin` 字段指定了 nrm 程序的入口文件： `"bin": "./cli.js"`。

`cli.js` 中通过 `require('commander')` 实现了 nrm 的各种命令，例如： `nrm ls`、`nrm use`、`nrm add` 等，本文主要分析 `nrm ls`以及 `nrm add`。

`nrm ls` 命令对应的源码如下：

```js
program
  .command('ls')
  .description('List all the registries')
  .action(actions.onList);
```
`actions.onList`方法内部会查找当前使用的源，查询所有可用的源（包含用户添加的源)，之后美化格式进行输出。再这个方法里重点要看的是如何查询所有可用源，通过源码可以看出，nrm 将用户添加的源存放在用户目录下的 `.nrmrc` 文件。nrm 同时提供了一组 npm 源，存放在 nrm 目录下的 `registries.json` 中。

```js
async function getRegistries() {
  // 获取用户自定义源
  const customRegistries = await readFile(NRMRC);
  // 合并用户自定义源和 nrm 提供的源
  return Object.assign({}, REGISTRIES, customRegistries);
}
```

通过上面的步骤，已经知到源信息的存储方式————存在信息到 `HOME/.nrmrc` 中，信息的格式应该是什么样的呢？`readFile`源码中引入了 `ini` 模块，通过 `ini.parse` 对文件内容进行了解析。
```js
const fs = require('fs');
const ini = require('ini');
const chalk = require('chalk');
const process = require('./process');
```
nrm 为什么要引入 `ini` 模块？`ini`是 ndoe.js 内置模块还是 npm 包？通过 node.js 文档为发现 `ini` 相关信息，查看 package.json 文件中，发现 `ini` 是一个 npm 包。

在 npmjs.com 上搜索 [`ini`](https://www.npmjs.com/package/ini)，可查看 `ini` 的简介。[`ini`](https://github.com/npm/ini) 是 [ini 格式](https://en.wikipedia.org/wiki/INI_file)的解析器、序列化器。 到此可知 nrm 的源管理是采用 ini 格式的文件进行增删改查的，这一格式和 npmrc 的格式一致，通过一致的数据格式，可以省略不必要的格式转化，降低开发成本，提高用户认识的一致性。


## 其他信息
npmrc 文件控制`源`，npmrc 文件格式为 `ini`，npmrc 有四个存储位置，四个相关文件是：
- 每个项目的配置文件（/path/to/my/project/.npmrc）
- 每个用户的配置文件 (~/.npmrc)
- 全局配置文件 ($PREFIX/etc/npmrc)
- npm 内置配置文件 (/path/to/npm/npmrc)

ini covert to json
[https://www.site24x7.com/tools/ini-to-json.html](https://www.site24x7.com/tools/ini-to-json.html)



