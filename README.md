## wiki

---

- 帮助爬取wiki文档并生成mock数据

## how to use

---

1. ctrl+shift+P(linux,windows)/cmd+shift+P(mac) 选择 wiki:config

2. 配置用于登录wiki的username、password,以及wiki网址mainUrl，行如：https://xxxx.xxxx.com

3. ctrl+shift+P(linux,windows)/cmd+shift+P(mac) 选择 wiki:parse

4. 输入包含接口的页面id，形如：21281103

5. 选择要生成的文件


## other config (非必填)

1. mockPath(mock数据路径，默认为：src/test/mock)
2. ftlPre(wiki中定义的ftl文件前缀，默认为：src/main/webapp/WEB-INF/tmpl)
3. tddPre(tdd文件路径，默认为：src/test/tdd)
    
