## 规则
1. 递归向上删除空节点，只递归一层block

2. 光标绘制逻辑：(光标绘制和vnode无关,特殊需求的位点绘制应该通过控制range来实现)
   - 文本节点:
     - 0: 文本节点前面（解决逃逸问题）
     - 其他: 文本节点内部,和range描述一致,offset=1,绘制在第offset个字符之后

   -  br节点: 绘制在br前面

   - 非文本:
     - 0:节点前面
     - 其他:节点后面

3. vnode.length是主观的长度,是能直观反馈在UI上面的节点或者字符长度,用来撑开空块的virtual节点是会被忽略的，底层计算需要区分;绝对长度可用vnode.childrens.length
4. 输入插入逻辑

    - 光标在文本之间直接插入
    - 光标在非文本和文本之间插入到其后面的文本
    - 光标在文本和非文本之间插入到其前面的文本
    - 光标在非文本和非文本之间则在他们之间插入文本节点内容再插入文字