## wiki

---

- 帮助爬取wiki文档并生成mock数据

## how to use

---

原pareseWiki用户可跳过配置(1、2)直接使用

---


1. 右键 / ctrl+shift+P(linux,windows)/cmd+shift+P(mac) 选择 wiki:config

2. 配置用于登录wiki的userName、passWord,以及wiki网址pageUrl，行如：https://xxxx.xxxx.com

3. 右键 / ctrl+shift+P(linux,windows)/cmd+shift+P(mac) 选择 wiki:parse

4. 输入包含接口的页面id，形如：21281103

5. 选择要生成的文件


## other config (非必填)

1. mockPath(mock数据路径，默认为：src/test/mock)
2. ftlPre(wiki中定义的ftl文件前缀，默认为：src/main/webapp/WEB-INF/tmpl)
3. tddPre(tdd文件路径，默认为：src/test/mock/tdd)
    

##update

###0.1.6: 

1. 增加配置文件中密码非明文处理
2. 现在可以在任意界面右键使用了

###0.1.8

1.增加批量添加操作
