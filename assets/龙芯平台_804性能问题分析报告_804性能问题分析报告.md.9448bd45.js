import{_ as e,o as t,c as o,C as r,J as s,E as n,a as i,V as _,H as h}from"./chunks/framework.0e456aa4.js";const l="/assets/图片1.9340a3fc.png",c="/assets/图片2.72155051.png",p="/assets/图片3.e139d10f.png",d="/assets/图片4.73b3356d.png",m="/assets/图片5.e7de2aa1.png",T=JSON.parse('{"title":"","description":"","frontmatter":{},"headers":[],"relativePath":"龙芯平台/804性能问题分析报告/804性能问题分析报告.md","filePath":"龙芯平台/804性能问题分析报告/804性能问题分析报告.md"}'),u={name:"龙芯平台/804性能问题分析报告/804性能问题分析报告.md"},b={align:"center"},q=_('<h2 id="_1-时间" tabindex="-1">1.时间 <a class="header-anchor" href="#_1-时间" aria-label="Permalink to &quot;1.时间&quot;">​</a></h2><p>2023 年 4 月 27 日</p><h2 id="_2-项目" tabindex="-1">2.项目 <a class="header-anchor" href="#_2-项目" aria-label="Permalink to &quot;2.项目&quot;">​</a></h2><p>804 所龙芯 XXX 项目</p><h2 id="_3-应用场景" tabindex="-1">3.应用场景 <a class="header-anchor" href="#_3-应用场景" aria-label="Permalink to &quot;3.应用场景&quot;">​</a></h2><p><img src="'+l+'" alt="1"></p><p>设备 A 将网络数据发送给道系统，道系统收到 A 发送过来的数据之后，在规定的发送周期内（62.5ms）将数据进行解析处理，并且发送给设备 B，B 设备中应用解析数据，并显示。</p><h2 id="_4-问题现象" tabindex="-1">4.问题现象 <a class="header-anchor" href="#_4-问题现象" aria-label="Permalink to &quot;4.问题现象&quot;">​</a></h2><p>当设备 A 发送的数据量增加到某个值时，设备 B 数据显示不全，经过软件方确认，显示不全的原因是在道系统下运行的应用在规定周期内（62.5ms）没有将数据处理完毕，造成数据处理时序错误，导致显示不完整。</p><p>设备 B 数据显示不全的原因是因为道系统发送过来的数据不正确，从软件负责人处了解到，在应用中，如果道系统收到网络数据后，在规定的时间周期内，没有把接收到的数据解析完毕的话，当下一个周期到来时，将会造成数据的混乱与丢失，随着发送周期的递增，错误也随之增加。</p><p>添加时间戳发现，在道系统中负责接收解析数据的任务在规定的周期内不能将数据发送给设备 B（处理时间大于 62.5ms），以至于下一个发送周期到来的时候，上一次数据还没有处理完毕，造成设备 B 接收数据缺失，显示不全。通过查看应用代码得知，应用中进行数据解析的主要操作是一些浮点运算，即浮点运算耗时较长。</p><p>在应用中可以发现，使用的浮点运算涉及到的数学库函数有 sqrt,fabs,atan 三种，并且应用中使用了大量的循环嵌套语句。因此耗时长的有两个因素，一是使用大量的循环语句，二是执行数学库函数执行时间长。</p><h2 id="_5-解决方案" tabindex="-1">5.解决方案 <a class="header-anchor" href="#_5-解决方案" aria-label="Permalink to &quot;5.解决方案&quot;">​</a></h2><h3 id="_5-1-优化方案" tabindex="-1">5.1 优化方案 <a class="header-anchor" href="#_5-1-优化方案" aria-label="Permalink to &quot;5.1 优化方案&quot;">​</a></h3><p>根据问题分析可以看出，性能优化的方案主要分为两个部分，第一，操作系统优化数学库函数，减少数学库函数执行所消耗的时间；第二，应用方面，减少循环语句所消耗的时间。</p><p>首先，操作系统层面。如果在应用中涉及到数学计算时，可以对一些数学库函数进行优化。一般在内核库中对于数学库函数提供了两种实现方法，一种 C 实现，一种汇编实现。数学库中的函数默认调用的是使用 C 实现的接口，想要提高计算的速度，提升性能，可以修改数学函数的调用，直接调用汇编实现的接口。</p><p>其次，应用方面。gcc 提供了一些标准的优化方案，可以通过使用不同的编译参数来开启相关功能，对于一些使用循环嵌套比较多的情况下，可以使用 gcc 参数中的（-O2）选项来开启二级优化功能，使得在编译过程中，由 gcc 编译器自动优化应用，可以显著减少应用执行过程中所需时间。</p><h3 id="_5-2-优化后效果" tabindex="-1">5.2 优化后效果 <a class="header-anchor" href="#_5-2-优化后效果" aria-label="Permalink to &quot;5.2 优化后效果&quot;">​</a></h3><p>下面从系统优化与应用优化来展开测试，测试结果为任务处理一次数据所需要的时间：</p><blockquote><p>注：测试输出信息中，最后一列即为执行一次数据处理所需要的时间，单位：ms</p></blockquote><h4 id="_5-2-1-系统不加优化-应用也不加优化" tabindex="-1">5.2.1 系统不加优化，应用也不加优化 <a class="header-anchor" href="#_5-2-1-系统不加优化-应用也不加优化" aria-label="Permalink to &quot;5.2.1 系统不加优化，应用也不加优化&quot;">​</a></h4><p><img src="'+c+'" alt="2"></p><h4 id="_5-2-2-系统优化-应用不加优化" tabindex="-1">5.2.2 系统优化，应用不加优化 <a class="header-anchor" href="#_5-2-2-系统优化-应用不加优化" aria-label="Permalink to &quot;5.2.2 系统优化，应用不加优化&quot;">​</a></h4><p><img src="'+p+'" alt="3"></p><h4 id="_5-2-3-系统不优化-应用优化-o2" tabindex="-1">5.2.3 系统不优化，应用优化（-O2） <a class="header-anchor" href="#_5-2-3-系统不优化-应用优化-o2" aria-label="Permalink to &quot;5.2.3 系统不优化，应用优化（-O2）&quot;">​</a></h4><p><img src="'+d+'" alt="4"></p><h4 id="_5-2-4-系统优化-应用优化-o2" tabindex="-1">5.2.4 系统优化，应用优化（-O2） <a class="header-anchor" href="#_5-2-4-系统优化-应用优化-o2" aria-label="Permalink to &quot;5.2.4 系统优化，应用优化（-O2）&quot;">​</a></h4><p><img src="'+m+'" alt="5"></p><h2 id="_6-结论" tabindex="-1">6.结论 <a class="header-anchor" href="#_6-结论" aria-label="Permalink to &quot;6.结论&quot;">​</a></h2><p>通过优化后的测试结果可以得到，在系统优化与应用双重优化的情况下，性能能够达到 58ms 左右，能满足指标（时间小于 62.5ms），但是从通过软件负责人了解到，他们的需求是在满足指标的同时，应该还需要留有一定的余量（30%左右）。由此看来，目前还不能满足性能指标。</p><h2 id="_7-建议" tabindex="-1">7.建议 <a class="header-anchor" href="#_7-建议" aria-label="Permalink to &quot;7.建议&quot;">​</a></h2><p>因为此次使用的 CPU 型号为龙芯 3A3000，因此关于内核部分数学库函数的优化方案是龙芯技术人员提供的。目前对于用到的三个数学库函数 sqrt,fabs,atan，因为应用中需要使用双精度的浮点类型，而标准的 MIPS 数学库只提供了单精度的汇编实现接口，对于双精度的实现需要龙芯提供技术支持，此次龙芯只提供了 sqrt,fabs 的汇编实现，而对于 atan 的实现，龙芯技术人员评估修改可能会有风险，因此此次优化并未修改。修改 atan 应该还能提升一点性能，但是还是不足以满足指标需求。</p><p>所以，硬件方面，建议可以直接联系龙芯，咨询继续优化可行性。对于应用方面，看能否优化应用程序，减少循环使用次数。</p>',33);function f(P,x,k,g,B,C){const a=h("font");return t(),o("div",null,[r("div",b,[s(a,{size:"8"},{default:n(()=>[i("804 性能问题分析报告")]),_:1})]),q])}const V=e(u,[["render",f]]);export{T as __pageData,V as default};
