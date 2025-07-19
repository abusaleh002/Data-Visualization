import * as d3 from 'd3';

const width = 900;
const height = 400;
const radius = Math.min(width, height) / 2 - 30;

async function drawPieChart(field = 'Platform', donut = false) {
    const data = await d3.json('./data/SpentSocialMedia.json');

    const counts = {};
    data.forEach(d => {
        counts[d[field]] = (counts[d[field]] || 0) + 1;
    });

    const pieData = d3.pie().value(d => d.value)(
        Object.entries(counts).map(([key, value]) => ({ key, value }))
    );

    const color = d3.scaleOrdinal(d3.schemeTableau10);

    const svg = d3.select('#piechart .chart-area').html('')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .style('max-width', '100%');

    // ✅ Centered pie chart
    const chartGroup = svg.append('g')
        .attr('transform', `translate(${width / 2 - 100}, ${height / 2})`);

    const arcGenerator = d3.arc()
        .innerRadius(donut ? radius * 0.6 : 0)
        .outerRadius(radius);

    chartGroup.selectAll('path')
        .data(pieData)
        .enter()
        .append('path')
        .attr('d', arcGenerator)
        .attr('fill', d => color(d.data.key))
        .attr('stroke', 'white')
        .style('stroke-width', '2px');

    chartGroup.selectAll('text')
        .data(pieData)
        .enter()
        .append('text')
        .attr('transform', d => `translate(${arcGenerator.centroid(d)})`)
        .attr('text-anchor', 'middle')
        .style('fill', 'white')
        .style('font-size', '12px')
        .text(d =>
            `${d.data.key} (${((d.data.value / d3.sum(pieData, d => d.data.value)) * 100).toFixed(1)}%)`
        );

    // ✅ Legend moved to bottom-left
    const legend = svg.append('g')
        .attr('transform', `translate(30, ${height - (Object.keys(counts).length * 25 + 20)})`);

    Object.entries(counts).forEach(([key, value], i) => {
        const row = legend.append('g')
            .attr('transform', `translate(0, ${i * 25})`);

        row.append('rect')
            .attr('width', 15)
            .attr('height', 15)
            .attr('fill', color(key));

        row.append('text')
            .attr('x', 20)
            .attr('y', 12)
            .style('font-size', '14px')
            .text(`${key}: ${value}`);
    });
}

function setupControls() {
    const container = d3.select('#piechart')
        .insert('div', ':first-child')
        .style('margin-bottom', '15px');

    container.append('label').text('Choose a field: ');

    const fields = ['Platform', 'Content_Type', 'Region'];
    const dropdown = container.append('select');

    dropdown.selectAll('option').data(fields).enter().append('option').text(d => d);

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
