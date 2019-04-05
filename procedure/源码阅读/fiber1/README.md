# 啥是fiber?

&emsp;&emsp;react16中最重要的更新之一就是底层重新更改了架构，采用了一种叫做fiber的架构。
<br>&emsp;&emsp;那么什么是fiber，什么又是fiber架构呢？
<br>&emsp;&emsp;以下只是个人理解
<br>
&emsp;&emsp;首先，fiber是啥，是一种数据结构，在js中说白了就是一种对象。我们在之前已经有了vdom，那么为什么已经有了vdom却还要有这种数据结构呢？<br>
&emsp;&emsp;其实吧，我们都知道，vdom是一种对真实dom的映射，我们通过js可以很轻松操作对象({})这种数据类型，来简化真实dom。<br>
&emsp;&emsp;那么既然vdom是对真实dom的一种简化的映射，所以vdom的属性肯定不如真实dom的属性多，也就表示有一些真实dom能做到的事情，vdom是做不到的，更何况！有一些连真实dom都做不到的事情，那么vdom就更加做不到了！<br>
&emsp;&emsp;也就是说，我们通过vdom能做到的事情是有限的，但是react团队想做一些比较硬气比较有趣的事情，显然光通过vdom是做不到的，于是便创造了fiber这种数据结构，react团队赋予fiber这种数据结构很多的属性，通过这些属性就能做到很多vdom做不到的事情，这就是fiber~<br>
&emsp;&emsp;那么什么是fiber架构呢~我们知道了有fiber这种数据结构了，那么接下来的事情就是我们应该怎么去应用这种数据结构。如果光有数据结构而没有让它动起来的方法的话，那么fiber就只是个普通对象没有任何意思。所以react团队设计了一种能够让fiber这种对象跑起来的算法，通过这种新的算法，普通的对象就能做到一些牛逼的事情了，这种算法我理解就是架构。<br>
&emsp;&emsp;所以！fiber数据结构 + 新的算法 = fiber架构！<br><br><br>

&emsp;[下一篇: fiber数据结构](../fiber2)<br>