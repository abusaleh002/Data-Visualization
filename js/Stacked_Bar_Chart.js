// Assuming <script src="https://d3js.org/d3.v6.min.js"> is already loaded in HTML
async function drawStackedBarChart() {
  const data = await d3.json('./data/BlackFriday.json');

  const filteredData = data.filter(d => d.Age && d.Gender && d.Purchase);

  const ageGenderMap = {};
  filteredData.forEach(d => {
    const age = d.Age;
    const gender = d.Gender;
    const purchase = +d.Purchase;

    if (!ageGenderMap[age]) {
      ageGenderMap[age] = { Male: 0, Female: 0 };
    }

    if (gender === 'M') ageGenderMap[age].Male += purchase;
    else if (gender === 'F') ageGenderMap[age].Female += purchase;
  });

  const formattedData = Object.entries(ageGenderMap).map(([age, values]) => ({
    Age: age,
    Male: values.Male,
    Female: values.Female
  }));

  const keys = ["Male", "Female"];
  const svgWidth = 680;
  const svgHeight = 600;
  const margin = { top: 60, right: 90, bottom: 60, left: 80 };

  const width = svgWidth - margin.left - margin.right;
  const height = svgHeight - margin.top - margin.bottom;

  d3.select('#stackedbar .chart-area').html(''); // Clear old chart if any

  const svg = d3.select("#stackedbar .chart-area")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight)
    .style("font-family", "Segoe UI, sans-serif");

  const chart = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleBand()
    .domain(formattedData.map(d => d.Age))
    .range([0, width])
    .padding(0.3);

  const y = d3.scaleLinear()
    .domain([0, d3.max(formattedData, d => d.Male + d.Female)]).nice()
    .range([height, 0]);

  const color = d3.scaleOrdinal()
    .domain(keys)
    .range(["#3498db", "#e67e22"]);

  const stack = d3.stack().keys(keys);
  const series = stack(formattedData);

  chart.selectAll("g.layer")
    .data(series)
    .enter()
    .append("g")
    .classed("layer", true)
    .attr("fill", d => color(d.key))
    .selectAll("rect")
    .data(d => d)
    .enter()
    .append("rect")
    .attr("x", d => x(d.data.Age))
    .attr("y", d => y(d[1]))
    .attr("height", d => y(d[0]) - y(d[1]))
    .attr("width", x.bandwidth())
    .attr("rx", 4)
    .attr("ry", 4);

  chart.append("g")
    .call(d3.axisLeft(y).ticks(6).tickFormat(d3.format(",.0f")))
    .selectAll("text").style("font-size", "12px");

  chart.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll("text").style("font-size", "12px");

  // Axis labels
  chart.append("text")
    .attr("x", width / 2)
    .attr("y", height + 40)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .style("font-weight", "bold")
    .text("Age Group");

  chart.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -60)
    .attr("x", -height / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .style("font-weight", "bold")
    .text("Total Purchase ($)");

  chart.append("text")
    .attr("x", width / 2)
    .attr("y", -25)
    .attr("text-anchor", "middle")
    .style("font-size", "18px")
    .style("font-weight", "bold")
    .style("fill", "#2c3e50")
    .text("Total Purchase by Age & Gender");

  // Legend
  const legend = svg.append("g")
    .attr("transform", `translate(${width + margin.left + 20}, ${margin.top})`);

  keys.forEach((key, i) => {
    const row = legend.append("g").attr("transform", `translate(0, ${i * 25})`);

    row.append("rect")
      .attr("width", 16)
      .attr("height", 16)
      .attr("fill", color(key))
      .attr("rx", 3)
      .attr("ry", 3);

    row.append("text")
      .attr("x", 22)
      .attr("y", 12)
      .attr("text-anchor", "start")
      .style("font-size", "13px")
      .text(key);
  });
}

drawStackedBarChart();
