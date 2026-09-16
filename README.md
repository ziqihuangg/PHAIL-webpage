# PHAIL-webpage

A static research dashboard for mapping physical AI tasks, evaluation metrics, models, and benchmarks.

Open `index.html` directly or serve the folder with a local static server.

## Data Source

The Tasks page loads its structured evaluation ledger from [tasks-data-new.js](tasks-data-new.js). Keep page rendering and data maintenance separate: add or correct tasks, models, benchmarks, tracks, scores, resource fields, and citations in that file. [tasks-app.js](tasks-app.js) owns filtering, verification labels, recommendations, and benchmark ranking.

## Local Preview

- [Home](http://127.0.0.1:4173/)
- [Tasks](http://127.0.0.1:4173/tasks.html)
- [Metrics](http://127.0.0.1:4173/metrics.html)
- [Models](http://127.0.0.1:4173/models.html)
- [Benchmarks](http://127.0.0.1:4173/benchmarks.html)
- [About](http://127.0.0.1:4173/about.html)
