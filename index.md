---
layout: default
title: Indie-script
---

# Тестовая страница

Простой текст для проверки отображения.
<ul>
  {% for pg in site.pages %}
    <li>{{ pg.path }} - {{ pg.title }}</li>
  {% endfor %}
</ul>