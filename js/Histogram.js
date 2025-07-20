import * as d3 from 'd3';

const width = 600,
      height = 400,
      margin = { top: 30, right: 30, bottom: 60, left: 60 };

async function drawGroupedHistogram(selectedOccupation = 'All Occupations') {
    const data = await d3.json('./data/Sleep_health_and_lifestyle_dataset.json');

    const filteredData = selectedOccupation === 'All Occupations'
        ? data
        : data.filter(d => d.Occupation === selectedOccupation);

    const genders = ['Male', 'Female'];
    const color = d3.scaleOrdinal().domain(genders).range(['#1f77b4', '#ff7f0e']);

    const binsGenerator = d3.histogram()
        .domain([5.5, 9]) // Slightly extended to include edge data
        .thresholds(d3.range(5.5, 9.1, 0.3)) // ~12 bins
        .value(d => +d['Sleep Duration']);

    const binsByGender = genders.map(gender => ({
        gender,
        bins: binsGenerator(filteredData.filter(d => d.Gender === gender))
    }));

    const xLabels = binsByGender[0].bins.map(d => d.x0.toFixed(1));

    const x0 = d3.scaleBand()
        .domain(xLabels)
        .range([margin.left, width - margin.right])
        .paddingInner(0.1);

    const x1 = d3.scaleBand()
        .domain(genders)
        .range([0, x0.bandwidth()])
        .padding(0.05);

    const y = d3.scaleLinear()
        .domain([0, d3.max(binsByGender.flatMap(g => g.bins), d => d.length)]).nice()
        .range([height - margin.bottom, margin.top]);

    const svg = d3.select('#histogram .chart-area').html('')
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    const groups = svg.selectAll('g.layer')
        .data(binsByGender[0].bins)
        .enter().append('g')
        .attr('transform', d => `translate(${x0(d.x0.toFixed(1))},0)`);

    groups.selectAll('rect')
        .data((d, i) => binsByGender.map(g => ({ gender: g.gender, bin: g.bins[i] })))
        .enter().append('rect')
        .attr('x', d => x1(d.gender))
        .attr('y', d => y(d.bin.length))
        .attr('width', x1.bandwidth())
        .attr('height', d => y(0) - y(d.bin.length))
        .attr('fill', d => color(d.gender));

    // X-axis
    svg.append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x0))
        .append('text')
        .attr('x', width / 2)
        .attr('y', 40)
        .attr('fill', 'black')
        .attr('text-anchor', 'middle')
        .style('font-weight', 'bold')
        .text('Sleep Duration (hours)');

    // Y-axis
    svg.append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y))
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', -45)
        .attr('fill', 'black')
        .attr('text-anchor', 'middle')
        .style('font-weight', 'bold')
        .text('Number of People');

    // Legend
    const legend = svg.append('g')
        .attr('transform', `translate(${width - margin.right - 100},${margin.top})`);

    genders.forEach((gender, i) => {
        const legendRow = legend.append('g').attr('transform', `translate(0,${i * 20})`);
        legendRow.append('rect')
            .attr('width', 12).attr('height', 12)
            .attr('fill', color(gender));
        legendRow.append('text')
            .attr('x', 18).attr('y', 10)
            .attr('text-anchor', 'start')
            .text(gender);
    });
}

async function setupOccupationDropdown() {
    const data = await d3.json('./data/Sleep_health_and_lifestyle_dataset.json');
    const occupations = ['All Occupations', ...new Set(data.map(d => d.Occupation))];

    const container = d3.select('#histogram')
        .insert('div', ':first-child')
        .attr('class', 'filter-container')
        .style('margin-bottom', '10px');

    container.append('label').text('Filter by Occupation: ');

    const dropdown = container.append('select');

    dropdown.selectAll('option')
        .data(occupations).enter().append('option').text(d => d);

    dropdown.on('change', function () {
        drawGroupedHistogram(this.value);
    });
}

setupOccupationDropdown();
drawGroupedHistogram();
