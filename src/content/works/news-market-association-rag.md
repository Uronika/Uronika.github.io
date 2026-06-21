---
title: "新闻舆情与行情异动 RAG"
summary: "检索真实新闻与行情窗口，以图谱增强 RAG 生成可追溯的关联解释，并通过风险守卫限制投资建议与因果断言。"
category: "development"
tags: ["FastAPI", "图谱增强 RAG", "DeepSeek", "金融数据分析", "风险守卫"]
cover: "/images/works/news-market-association-rag-cover.webp"
coverAlt: "新闻证据卡片、行情曲线与关系图谱连接在风险边界内的抽象可视化"
coverCaption: "原创概念封面：以新闻证据、行情异动窗口、关系图谱和风险守卫概括系统的关联解释流程。"
year: "2026"
status: "课程原型 · 可运行"
role: "系统设计与全栈实现"
featured: true
featuredOrder: 1
detailMode: "case-study"
repository:
  name: "news-market-association-rag"
  url: "https://github.com/Uronika/news-market-association-rag"
gallery: []
---

## 项目定位

面向信息系统设计课程的解释型 RAG 原型。系统回答“近期新闻与企业、行业及行情异动可能存在何种关联”，只提供可追溯的关联解释，不输出交易建议、目标价或确定因果。

## 核心流程

将自然语言问题解析为企业、行业、时间窗口和检索任务；从 Yahoo Finance、GDELT 等新闻源与 Yahoo Finance Chart、Stooq 等行情源获取证据，再结合行情异动窗口、主题和来源完成过滤与重排。新闻证据、行情摘要、图谱摘要、行业映射和评价指标随后进入 DeepSeek 或受控模板的生成上下文。

## 工程实现

后端以 FastAPI 提供分析、异步进度、结果查询、企业搜索与策略接口，前端集中呈现报告式回答、行情总分表、新闻词云、事件线、关系图谱、检索轨迹和引用证据。PostgreSQL 作为可选持久化层，Pytest 覆盖行情分析、数据源适配、风险守卫与 API 行为。

## 风险边界

所有回答的 `claim_level` 固定为 `association_only`。风险守卫会改写投资建议、价格预测和确定因果表达；外部数据不可用时，系统显式返回数据缺失原因，不使用模拟内容冒充真实证据。
