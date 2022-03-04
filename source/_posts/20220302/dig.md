朱莉娅·埃文斯
关于
会谈
项目
推特
GITHUB
收藏夹 杂志 RSS
如何查找域的权威域名服务器
• 域名系统•

这是关于如何找到您的域的权威名称服务器的非常快速的“操作方法”帖子。

我写这篇文章是因为如果您进行了 DNS 更新但它不起作用，则有 2 个选项：

您的权威域名服务器没有正确的记录
您的权威域名服务器确实有正确的记录，但是缓存了旧记录，您需要等待缓存过期
为了能够判断发生了哪一个（您需要进行更改，还是只需要等待？），您需要能够找到您的域的权威名称服务器并查询它以查看它有哪些记录。

但是当我查看“如何找到域的权威名称服务器”以查看那里有什么建议时，我发现提到了很多不同的方法，其中一些可能会给你错误的答案。

因此，让我们通过一种方法来查找您的域的权威名称服务器，它可以保证始终为您提供正确的答案。我还将解释为什么其他一些方法并不总是准确的。

首先，一种简单但不太准确的方法
如果您在过去一周左右绝对没有更新您的权威 DNS 服务器，那么找到它的一个非常简单的方法是运行dig +short ns DOMAIN

$ dig +short ns jvns.ca
art.ns.cloudflare.com.
roxy.ns.cloudflare.com.
在这种情况下，我们得到了正确的答案。伟大的！

但是如果您在最近几天更新了您的权威 DNS 服务器（可能是因为您刚刚注册了域！），那可能会给您一个不准确的答案。所以这里有一个稍微复杂一点的方法，它保证总是给你正确的答案。

第 1 步：查询根域名服务器
jvns.ca在此示例中，我们将查找权威名称服务器。

无论我们要查找什么域，我们都需要从根名称服务器开始。h.root-servers.net是13 个 DNS 根域名服务器之一，dig @h.root-servers.net意思是“将查询发送到h.root-servers.net”。

$ dig @h.root-servers.net jvns.ca
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 42165
;; flags: qr rd; QUERY: 1, ANSWER: 0, AUTHORITY: 4, ADDITIONAL: 9
;; WARNING: recursion requested but not available

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 1232
;; QUESTION SECTION:
;jvns.ca.			IN	A

;; AUTHORITY SECTION: <------------ this is the section we're interested in
ca.			172800	IN	NS	c.ca-servers.ca. <------- we'll use this record
ca.			172800	IN	NS	j.ca-servers.ca.
ca.			172800	IN	NS	x.ca-servers.ca.
ca.			172800	IN	NS	any.ca-servers.ca.

;; ADDITIONAL SECTION:
c.ca-servers.ca.	172800	IN	A	185.159.196.2
j.ca-servers.ca.	172800	IN	A	198.182.167.1
x.ca-servers.ca.	172800	IN	A	199.253.250.68
any.ca-servers.ca.	172800	IN	A	199.4.144.2
c.ca-servers.ca.	172800	IN	AAAA	2620:10a:8053::2
j.ca-servers.ca.	172800	IN	AAAA	2001:500:83::1
x.ca-servers.ca.	172800	IN	AAAA	2620:10a:80ba::68
any.ca-servers.ca.	172800	IN	AAAA	2001:500:a7::2

;; Query time: 96 msec
;; SERVER: 198.97.190.53#53(198.97.190.53)
;; WHEN: Tue Jan 11 08:30:57 EST 2022
;; MSG SIZE  rcvd: 289
我们正在寻找的答案是“AUTHORITY SECTION”中的这一行：

ca.			172800	IN	NS	c.ca-servers.ca.
您选择本节中的哪一行并不重要，您可以使用其中任何一行。我刚选了第一个。

这告诉我们需要在第 2 步中与之通信的服务器：c.ca-servers.ca.

第 2 步：查询 .ca 域名服务器
现在我们运行dig @c.ca-servers.ca jvns.ca

$ dig @c.ca-servers.ca jvns.ca
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 24920
;; flags: qr rd; QUERY: 1, ANSWER: 0, AUTHORITY: 2, ADDITIONAL: 1
;; WARNING: recursion requested but not available

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 1232
;; QUESTION SECTION:
;jvns.ca.			IN	A

;; AUTHORITY SECTION: <------------ this is the section we're interested in
jvns.ca.		86400	IN	NS	art.ns.cloudflare.com. <---- we'll use this record
jvns.ca.		86400	IN	NS	roxy.ns.cloudflare.com.

;; Query time: 26 msec
;; SERVER: 185.159.196.2#53(185.159.196.2)
;; WHEN: Tue Jan 11 08:32:44 EST 2022
;; MSG SIZE  rcvd: 90
与上次相同：我们正在寻找的答案是“AUTHORITY SECTION”中的这一行：

jvns.ca.		86400	IN	NS	art.ns.cloudflare.com.
同样，您选择本节中的哪一行并不重要，您可以使用其中任何一行。我刚选了第一个。

成功！我们知道权威的域名服务器！
的权威名称服务器jvns.ca是art.ns.cloudflare.com.. 现在，您现在可以art.ns.cloudflare.com.直接查询以查看它有哪些 DNS 记录jvns.ca。

$ dig @art.ns.cloudflare.com. jvns.ca
jvns.ca.		292	IN	A	172.64.80.1
很好，它奏效了。

这正是您进行 DNS 查询时在幕后发生的事情
我喜欢这种方法的原因是它模仿了当您进行 DNS 查询时在幕后发生的事情。当 Google 的 DNS 解析器8.8.8.8.查找 时jvns.ca，它查询以获取jvns.ca权威名称服务器的服务器是 c.ca-servers.net（或其他选项之一，如j.ca-servers.ca.or x.ca-servers.ca.）

因为此方法使用与真正的 DNS 查询完全相同的信息源，所以保证您每次都能得到正确的答案。

通常在实践中我会跳过第 1 步，因为我记得.ca 域的答案是c.ca-servers.net，所以我可以直接跳到第 2 步。

这在您更新名称服务器时很有用
当我用我的域名注册商更新我的域名服务器时，他们实际上并没有立即更新权威的域名服务器。这需要一段时间，也许一个小时。所以我喜欢通过这些步骤来检查我的注册商是否真的更新了我的权威域名服务器。

获取域的权威名称服务器的其他方法
这里有一些其他方法可以获得域的权威名称服务器，以及为什么我不推荐它们作为主要方法。

挖掘+跟踪 jvns.ca

这完全一样，所以它总是会给你正确的答案，但是输出有点令人困惑，所以我有点犹豫推荐它。

挖掘 ns jvns.ca

这通常会给你正确的答案，但有两个原因可能是错误的：

你可能会得到一个旧的缓存记录
您获得的 NS 记录与我们执行本文中描述的方法时不同。在此示例中，不会从 获取 NS 记录，而是c.ca-servers.net会dig ns jvns.ca为您提供来自 的 NS 记录art.ns.cloudflare.com。在实践中，通常这些是完全相同的东西，但在一些奇怪的边缘情况下，它们可能不是。
挖 soa jvns.ca

您还可以在 SOA 记录中找到名称服务器！

$ dig SOA jvns.ca
jvns.ca.   3600    IN    SOA    art.ns.cloudflare.com. dns.cloudflare.com. 2267173366 10000 2400 604800 3600
^^^^^^^^^^^^^^^^^^^^^
here it is
这通常会给出正确的答案，有两个原因可能是错误的，类似于 NS 记录：

此响应来自您的权威名称服务器。因此，如果您正在更新您的域名服务器，您可能会得到错误的答案，因为您的 DNS 解析器将请求发送到旧的域名服务器。
您的权威名称服务器可能会返回由于某种原因没有正确名称服务器的 SOA 记录
谁是 jvns.ca

这通常会给你正确的答案，但它可能是一个旧的缓存版本。

这是这个例子在我的机器上的样子：（它给了我们正确的答案）

$ whois jvns.ca | grep 'Name Server'
Name Server: art.ns.cloudflare.com
Name Server: roxy.ns.cloudflare.com
就这样！
我希望这可以帮助你们中的一些人调试 DNS 问题！

想要这个博客的每周摘要吗？
电子邮件地址
订阅
为什么要运行自己的 DNS 服务器？
DNS 破坏的一些方法
档案
© 朱莉娅·埃文斯。
如果你喜欢这个，你可能会喜欢Ulia Ea，或者更严重的是，我喜欢的博客列表。
你可能也喜欢Recurse Center，我最喜欢的编程社区（我的帖子）
