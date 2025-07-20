import * as d3 from 'd3';

const width = 600, height = 400;
const margin = { top: 30, right: 130, bottom: 60, left: 60 };

// Draw Scatterplot
async function drawScatterplot(selectedGender = 'All') {
    const data = await d3.json('./data/Sleep_health_and_lifestyle_dataset.json');

    const filteredData = selectedGender === 'All'
        ? data
        : data.filter(d => d.Gender === selectedGender);

    const svg = d3.select('#scatterplot .chart-area').html('')
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    const color = d3.scaleOrdinal()
        .domain(['Male', 'Female'])
        .range(['#1f77b4', '#ff7f0e']);

    const x = d3.scaleLinear()
        .domain(d3.extent(filteredData, d => +d.Age)).nice()
        .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
        .domain(d3.extent(filteredData, d => +d['Stress Level'])).nice()
        .range([height - margin.bottom, margin.top]);

    svg.selectAll('circle')
        .data(filteredData)
        .enter()
        .append('circle')
        .attr('cx', d => x(+d.Age))
        .attr('cy', d => y(+d['Stress Level']))
        .attr('r', 7)
        .attr('fill', d => color(d.Gender))
        .attr('opacity', 0.75);

    // X Axis
    svg.append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x));

    // Y Axis
    svg.append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));

    // X Label
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', height - 15)
        .attr('text-anchor', 'middle')
        .style('font-weight', 'bold')
        .text('Age');

    // Y Label
    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', 15)
        .attr('text-anchor', 'middle')
        .style('font-weight', 'bold')
        .text('Stress Level');

    // Legend
    const legend = svg.append('g')
        .attr('transform', `translate(${width - margin.right + 20},${margin.top})`);

    ['Male', 'Female'].forEach((gender, i) => {
        const row = legend.append('g').attr('transform', `translate(0,${i * 20})`);
        row.append('rect')
            .attr('width', 15)
            .attr('height', 15)
            .attr('fill', color(gender));
        row.append('text')
            .attr('x', 20)
            .attr('y', 12)
            .text(gender);
    });
}

// Setup Dropdown to Filter by Gender
async function setupGenderDropdown() {
    const container = d3.select('#scatterplot')
        .insert('div', ':first-child')
        .attr('class', 'filter-container')
        .style('margin-bottom', '10px');

    container.append('label').text('Filter by Gender: ');

    const dropdown = container.append('select');

    dropdown.selectAll('option')
        .data(['All', 'Male', 'Female'])
        .enter()
        .append('option')
        .text(d => d);

    dropdown.on('change', function () {
        drawScatterplot(this.value);
    });
}

// Initialize
setupGenderDropdown();
drawScatterplot();
