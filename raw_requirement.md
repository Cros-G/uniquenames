我现在要开发一个帮助人们起名字的 AI 工具站。


# 第一部分：Generation
## 用户旅程
工具提供的是「用户想要generation一些名字作为灵感和建议」的体验。
（1）用户来到页面，首先在页面左侧输入框中输入自己的 context
（2）点击确认后，页面右侧区域的状态显示“正在思考中”，自上往下，依次是：
    a. 首先是 AI 对这个需求的分析
    b. 然后是 AI 本次的起名策略
    c. 再接下来是最核心的区域：每个名字是一张卡片，卡片上的关键信息一开始是盖住的。卡片随着 AI 的输出，一张一张生成。
（3）当卡片生成完毕后，最后有一个“AI 挑选中”的状态，AI 挑选完之后，用户有两种选择：一张张点开卡片（这时候被点击卡片上的信息从盖住变得清晰）；或者用户可以点击“吹一阵风”，然后所有卡片上的信息都变得清晰。
（4）所有的卡片的信息都变得清晰之后，在卡片下方展开 AI 的挑选名字，该名字对应的卡片的边框闪光并加粗，在卡片下方给出 AI 挑选它的理由。

## 开发要点
1. 你结合这个工具的业务背景，给出适合使用的技术框架以及视觉偏好（颜色主题、组件风格等）

# 第二部分：Narrow down
我称之为Narrow Down。它是个有单独URL后缀的页面。
1. 该页面的定位：该页面是在想要起名的用户，他的任务是想从一大堆名字中挑选一个时，可以使用这个工具。
2. 该页面的用户旅程及页面大致结构：用户在页面左侧的一个不那么宽的区域，有一个输入框来输入他的context。然后，右侧分为上下两部分。上部分高度小一些，主要用来展示 AI 的工作状态；下部分则是 AI 成果的主要展示区。AI 的成果是一堆姓名卡片，AI 的工作就是从 context 中抽取出其中需要被挑选的名字，然后写在卡片上（literally写，所以最好有一个手写卡片的动效），然后开始分析它们，并在卡片上同步分析状态。最终，会对这些姓名有个排名，体现在页面上就是对卡片在洗牌之后建立了排序。
3. 详细来说，AI 做了这么几件事，分别调用了这些提示词（我都放在提示词库里了）
（1）【AI 状态：Tracting names...】AI 先从输入框的 user_input 里把名字全部抽取出来（调用list_names 提示词），此时我们应当有个程序判断是否超过了n个名字（n可以在管理后台设置，我们先暂定5个），超过了，则用户的输入框下方要提醒“名字数量超过限制”【动效展示：输入框边框有电流一直在经过，像用魔法在处理输入框里的内容一样】
（2）【AI 状态：Context analyzing...】当名字数量没超限制时，AI 可以开始分析了。它会先调用 isolate 提示词，输入 user_input，获得 context_analysis，并获得每个名字的 numbering、certainty 和 attachment。这一步的目的是分析上下文，并区隔出名字，方便进一步分析。
【动效展示：卡片区生成一张一张卡片，卡片上被一支笔写上名字】
（3）【AI 状态：Doing research...】上一步之后，我们获得了总体上的context_analysis，以及每个名字的numbering、certainty 和 attachment这些变量。然后，我们对这些名字并行地调用 information 提示词，输入每个名字的numbering、certainty 和 attachment，输入context analysis和原始的user input，然后输出一系列信息，成为这些名字自己的 name_information 变量
【动效展示：卡片上显示分析xxx中...随着information的更新而更新xxx】
（4）【AI 状态：Deciding...】等所有名字都并行地获得了 name_information 之后，我们将这些name_information全部都拼起来，加上 context_analysis，调用 decide 提示词，获得一个 ranking_list（一个json数组，包含每个名字的numbering, name, ranking, reason_of_ranking）。
【动效展示：卡片被打乱，像是在洗牌，最终ranking结束，卡片叠在一起，但不能点击】
（5）【AI 状态：Crafting...】这一步，我们结合一些信息，对每个名字生成独有的故事。并行地调用 story 提示词，对每个名字，输入它的 name_information，它的 ranking 信息（包括ranking, reason_of_ranking），以及 context_analysis，获得这个名字专属的 story_title和story。
【动效展示：每张卡片的边框都在电流通过，像是在铭刻一些东西在卡片上。生成结束后，卡片还是叠在一起，但是hover之后可以抽出来，正面是 Name, story_title 和 story 内容，背面是它的 name_information】
