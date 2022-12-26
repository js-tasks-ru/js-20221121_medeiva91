export default class SortableTable {
  constructor(headerConfig = [], data = []) {
    this.headerConfig = headerConfig;
    this.data = data;
    this.cols = [];
    this.templates = {
        default: data => `<div class="sortable-table__cell">${data}</div>`
    };
    this.sortTypes = {};
    this.render();
  }

  render() {
    const div = document.createElement("div");
    div.innerHTML = `
      <div data-element="productsContainer" class="products-list__container">
        <div class="sortable-table">
          ${this.getHeaderTable()}
          ${this.getBodyTable()}
          <div data-element="loading" class="loading-line sortable-table__loading-line"></div>

          <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
            <div>
              <p>No products satisfies your filter criteria</p>
              <button type="button" class="button-primary-outline">Reset all filters</button>
            </div>
          </div>
        </div>
      </div>`;

    this.element = div.firstElementChild;
    this.subElements = this.getSubElements();
    
  }

  getHeaderTable() {
    return `    
      <div data-element="header" class="sortable-table__header sortable-table__row">
          ${this.headerConfig.map(item => this.getHeaderRow(item)).join('')}
      </div>`
  }

  getHeaderRow({ id, title, sortable = false, sortType = '', ...props }) {
    this.cols.push(id);
    if (sortable) {
        this.sortTypes[id] = sortType;
    }
    if (props.template) {
        this.templates[id] = props.template;
    }
    return `
        <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}">
            <span>${title}</span>
            <span data-element="arrow" class="sortable-table__sort-arrow">
                <span class="sort-arrow"></span>
            </span>
        </div>
    `;
}
  
  getBodyTable() {
    return `<div data-element="body" class="sortable-table__body">
              ${this.data.map(item => this.getRowsTable(item)).join('')}
            </div>`
  }

  getRowsTable() {
        return this.data.map((dataItem = {}) => {
            return `
                <a href="/products/${dataItem.id || '#'}" class="sortable-table__row">
                    ${this.getTemplate(dataItem)}
                </a>
            `;
        }).join('');
  }

  getTemplate(data){
    return this.cols.map(id => {
        return this.templates[id] ? this.templates[id](data[id]) : this.templates.default(data[id]);
    }).join('');
  }

  getSubElements() {
    const result = {};
    const elements = this.element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
        result[subElement.dataset.element] = subElement;
    }
    return result;
  }

  sort(field, order) {
    if (!this.sortTypes[field]) {
        return;
    }
    const directions = {
        asc: 1,
        desc: -1
    };
    const direction = directions[order];
    const sortType = this.sortTypes[field];
    this.data.sort((a, b) => {
        if (sortType === 'string') {
            return direction * a[field].localeCompare(b[field], ['ru', 'en']);
        } else if (sortType === 'number') {
            return direction * (a[field] - b[field]);
        } else {
            return direction * (a[field] - b[field]);
        }
    });
    this.subElements.header.querySelectorAll('.sortable-table__cell[data-sortable]').forEach((headerCell) => {
      headerCell.dataset.order = (headerCell.dataset.id === field) ? order : '';
    });    
    this.subElements.body.innerHTML = this.getRowsTable();
  }

  remove() {
    if (this.element) {
        this.element.remove();
      }
  }

  destroy() {
      this.remove();
      this.element = null;
      this.subElements = {};
  }
}

