export default class ColumnChart {
    constructor({
        data = [],
        label = "",
        link = "",
        value = 0,
        formatHeading = (value) => value
      } ={}){
        this.data = data;
        this.label = label;
        this.link = link;
        this.value = formatHeading(value);
        this.chartHeight = 50;

        this.renderElement() 
    }

    renderElement() {
        const div = document.createElement('div');
        const bodyElements = this.getBodyElements();
        div.innerHTML =
            `<div class="dashboard__chart_${this.label}  ${this.data.length > 0 ? "" : "column-chart_loading"}">
                <div class="column-chart " style="--chart-height: ${this.chartHeight}">
                    <div class="column-chart__title">
                        Total ${this.label}
                        <a href="${this.link}" class="column-chart__link">View all</a>
                    </div>
                    <div class="column-chart__container">
                        <div data-element="header" class="column-chart__header">${this.value}</div>
                        <div data-element="body" class="column-chart__chart">
                                ${bodyElements}
                        </div>
                    </div>
                </div>
            </div>;`

      this.element = div.firstElementChild;
    }

    update(data) {
        this.data = data;
        this.renderElement()
    }

    getBodyElements() {
        if (this.data.length > 0) {
            const maxValue = Math.max(...this.data);
            const scale = this.chartHeight / maxValue;
            const bodyElements = this.data.map(elementValue => {
                const precent = (elementValue / maxValue * 100).toFixed(0);
                return `<div style="--value: ${Math.floor(elementValue * scale)}" data-tooltip="${precent}%"></div>`
            });
            return bodyElements.join("");
        }
        return "";

        

    }

    remove() {
        this.element.remove();
    }

    destroy() {
        this.remove();
    }
}
