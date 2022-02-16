---
title: 源码分析-through2
categories: Programming
tags: [JavaScript, Node.js]
---

[//]: # (https://sites.ualberta.ca/~jhoover/325/CourseNotes/section/Streams.htm)

[//]: # (https://docs.racket-lang.org/reference/streams.html)

[//]: # (https://palant.info/2022/02/08/writing-my-own-build-system-coupling-gulp-concepts-with-modern-javascript/)

[//]: # (https://github.com/substack/stream-handbook)

[//]: # (https://nodejs.org/en/docs/guides/backpressuring-in-streams/)

[//]: # (https://medium.com/swlh/using-streams-efficiently-in-nodejs-3ef0d9df7a0e)

[//]: # (https://blog.insiderattack.net/nodejs-streams-in-practice-980b3cdf4511)

[//]: # ()
[//]: # (linux 系统中的流)

[//]: # ()
[//]: # (Node.js 中的流)

[//]: # ()
[//]: # (可读流、可写流、双工流、转换流)

[//]: # ()
[//]: # (转换流什么时候使用？)

[//]: # ()
[//]: # (流的限制、流的读取规则指定)

[//]: # ()
[//]: # (流与生成器)

[//]: # (如何简化流的使用？)
[//]: # (流和消息队列)

Node.js 提供了处理流数据的接口——流（stream），可以使用 `stream` 模块。在 Node.js 中有四种类型的流： `writable`、`readable`、`duplex`、`transform`。这四种流只对`字符串`和`buffer`进行操作。
