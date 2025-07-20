import * as d3 from './d3.v6.min.js';
const width = 900;
const height = 400;
const radius = Math.min(width, height) / 2 - 30;

async function drawPieChart(field = 'Platform', donut = false) {
    const data = await d3.json('./data/SpentSocialMedia.json');
    if (!data || data.length === 0) return;

    // Count values for selected field
    const counts = {};
    data.forEach(d => {
        counts[d[field]] = (counts[d[field]] || 0) + 1;
    });

    const processedData = Object.entries(counts).map(([key, value]) => ({ key, value }));
    const total = d3.sum(processedData, d => d.value);

    const pieData = d3.pie().value(d => d.value)(processedData);

    const color = d3.scaleOrdinal(d3.schemeTableau10);

    const svg = d3.select('#piechart .chart-area').html('')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .style('max-width', '100%');

    const chartGroup = svg.append('g')
        .attr('transform', `translate(${width / 2 - 100}, ${height / 2})`);

    const arcGenerator = d3.arc()
        .innerRadius(donut ? radius * 0.6 : 0)
        .outerRadius(radius);

    // Draw slices
    chartGroup.selectAll('path')
        .data(pieData)
        .enter()
        .append('path')
        .attr('d', arcGenerator)
        .attr('fill', d => color(d.data.key))
        .attr('stroke', 'white')
        .style('stroke-width', '2px');

    // Labels on slices
    chartGroup.selectAll('text')
        .data(pieData)
        .enter()
        .append('text')
        .attr('transform', d => `translate(${arcGenerator.centroid(d)})`)
        .attr('text-anchor', 'middle')
        .style('fill', 'white')
        .style('font-size', '12px')
        .text(d => `${d.data.key} (${((d.data.value / total) * 100).toFixed(1)}%)`);

    // Draw legend
    const legend = svg.append('g')
        .attr('transform', `translate(30, ${height - (processedData.length * 25 + 20)})`);

    processedData.forEach((d, i) => {
        const row = legend.append('g').attr('transform', `translate(0, ${i * 25})`);

        row.append('rect')
            .attr('width', 15)
            .attr('height', 15)
            .attr('fill', color(d.key));

        row.append('text')
            .attr('x', 20)
            .attr('y', 12)
            .style('font-size', '14px')
            .text(`${d.key}: ${d.value}`);
    });
}

function setupControls() {
    const container = d3.select('#piechart')
        .insert('div', ':first-child')
        .attr('class', 'filter-container')
        .style('margin-bottom', '15px');

    container.append('label').text('Choose a field: ');

    const fields = ['Platform', 'Content_Type', 'Region'];
    const dropdown = container.append('select');

    dropdown.selectAll('option')
        .data(fields)
        .enter()
        .append('option')
        .text(d => d);

    container.append('label')
        .style('margin-left', '20px')
        .html(`<input type="checkbox" id="donutToggle"> Donut Mode`);

    const updateChart = () => {
        const selectedField = dropdown.property('value');
        const donutMode = d3.select('#donutToggle').property('checked');
        drawPieChart(selectedField, donutMode);
    };

    dropdown.on('change', updateChart);
    d3.select('#donutToggle').on('change', updateChart);
}

setupControls();
drawPieChart();
