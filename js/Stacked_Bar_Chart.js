<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Stacked Bar Chart</title>
  <link rel="stylesheet" href="./css/style.css" />
</head>
<body>
  <header class="dashboard-header">
    <h1>Black Friday Data Visualization</h1>
    <h2>Stacked Bar Chart: Total Purchase by Age & Gender</h2>
    <nav>
      <a href="index.html">← Back to Dashboard</a>
      <a href="scatterplot.html">Scatter Plot</a>
      <a href="Histogram.html">Histogram</a>
      <a href="Pie_Chart.html">Pie Chart</a>
    </nav>
  </header>

  <main class="chart-container">
    <div class="chart-area" id="stackedbar"></div>
  </main>

  <footer class="dashboard-footer">
    <p>Chart by Abu Saleh</p>
  </footer>

  <!-- ✅ Scripts in correct order -->
  <script src="./js/d3.v6.min.js"></script>
  <script src="./js/Stacked_Bar_Chart.js"></script>
</body>
</html>
