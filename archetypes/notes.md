---
title: '{{ replace .Name "-" " " | title }}'
tags:
  - NOTE-TAG
categories: NOTE-CATEGORY
date: '{{ now.Format "2006-01-02T15:04:05+08:00" }}'  # 关键：添加T和时区（+08:00表示北京时间）
update: '{{ now.Format "2006-01-02T15:04:05+08:00" }}'  # 关键：添加T和时区（+08:00表示北京时间）
---

