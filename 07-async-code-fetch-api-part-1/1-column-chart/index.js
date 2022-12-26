import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {
    chartHeight = 50;
    constructor({
        url = '',
        range = {},
        label = '',
        data = null,
        formatHeading = data => data,
        ...props
    } = {}) {
        this.subElements = {};
        this.url = url;
        this.range = range;
        this.label = label;
        this.data = data;
        this.formatHeading = formatHeading;
        this.props = props;
        this.render();
    }

    getTemplate() {
        return `
            <div class="column-chart column-chart_loading" style="--chart-height: ${this.chartHeight}">
                <div class="column-chart__title">
                    Total ${this.label}
                    ${this.getViewAllLink()}
                </div>
                <div class="column-chart__container">
                    <div data-element="header" class="column-chart__header">
                    </div>
                    <div data-element="body" class="column-chart__chart">
                    </div>
                </div>
            </div>
        `;
    }

    getViewAllLink() {
        return this.props.link ? `<a href="${this.props.link}" class="column-chart__link">View all</a>` : '';
    }

    getBodyElements() {
        const maxValue = Math.max(...Object.values(this.data));
        const scale = this.chartHeight / maxValue;
        return Object.entries(this.data).map(([key, val] = entry) => {
            const value = Math.floor(val * scale);
            const percent = (value / maxValue * 100).toFixed(1);
            return `<div style="--value: ${value}" data-tooltip="${percent}%"></div>`;
        }).join('');
    }

    destroy() {
        this.remove();
        this.element = null;
        this.subElements = {};
    }

    remove() {
        if (this.element) {
            this.element.remove();
        }
    }

    showSkeleton() {
        if (!this.element) { return; }
        this.element.classList.add('column-chart_loading');
    }

    removeSkeleton() {
        if (!this.element) { return; }
        this.element.classList.remove('column-chart_loading');
    }

    async getChartData() {
        // If chart data was passed to constructor
        if (this.data) {
            this.drawChart(this.data);
            return;
        }
        this.update(this.range.from, this.range.to);
    }

    async update(dateFrom, dateTo) {
        const data = await this.fetchChartData(dateFrom, dateTo);
        this.drawChart(data);
        // I don't think return is useful here, but tests don't pass without it;
        return data;
    }

    async fetchChartData(dateFrom, dateTo) {
        const url = new URL(`api/dashboard/${this.label}`, BACKEND_URL);
        url.searchParams.set('from', dateFrom.toISOString());
        url.searchParams.set('to', dateTo.toISOString());
        return await fetchJson(url);
    }

    drawChart = (data) => {
        this.showSkeleton();
        if (!data) { return; }
        const chartHeader = Object.values(data).reduce((acc, current) => acc + current, 0);
        this.data = data;
        this.chartBars = Object.values(data);
        this.subElements.header.innerHTML = this.formatHeading(chartHeader);
        this.subElements.body.innerHTML = this.getBodyElements();
        this.removeSkeleton();
    }

    render() {
        this.getChartData().then(this.drawChart);
        const element = document.createElement('div');
        element.innerHTML = this.getTemplate();
        element.querySelectorAll('[data-element]').forEach(element => this.subElements[element.dataset.element] = element);
        this.element = element.firstElementChild;
        this.drawChart(this.data);
    }
}
