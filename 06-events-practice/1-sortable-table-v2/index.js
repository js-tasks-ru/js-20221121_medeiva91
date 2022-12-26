export default class SortableTable {
  constructor(headerConfig, { data = [], sorted = {} } = {}) {
      this.headerConfig = headerConfig;
      this.isSortLocally = true;
      this.data = data;
      this.templates = {
          default: data => `<div class="sortable-table__cell">${data}</div>`
      };
      this.activeCols = [];
      this.defaultSorting = sorted;
      this.subElements = {};
      this.render();
      if (this.defaultSorting.id) {
          this.defaultSort();
      }
      this.initEventListeners();
  }

  getCellTemplate(id) {
      return this.templates[id] ? this.templates[id] : this.templates.default;
  }

  initEventListeners() {
      if (!this.subElements.header) {
          return;
      }
      this.subElements.header.addEventListener('pointerdown', this.onHeaderClick);
  }

  getHeaderTable() {
    return `    
      <div data-element="header" class="sortable-table__header sortable-table__row">
          ${this.headerConfig.map(item => this.getHeaderRow(item)).join('')}
      </div>`
  }

  getHeaderRow({ id, title, sortable = false, template }) {
    this.activeCols.push(id);
    if (template) { 
      this.templates[id] = template; 
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

  getRowsTable() {
    return this.data.map((dataItem = {}) => {
        return `
            <a href="/products/${dataItem.id || '#'}" class="sortable-table__row">
              ${this.activeCols.map((col) => this.getCellTemplate(col)(dataItem[col])).join('')}
            </a>
        `;
    }).join('');
}

  getBodyTable() {
    return `<div data-element="body" class="sortable-table__body">
              ${this.data.map(item => this.getRowsTable(item)).join('')}
            </div>`
  }

  getSubElements() {
      const result = {};
      const elements = this.element.querySelectorAll('[data-element]');

      for (const subElement of elements) {
          result[subElement.dataset.element] = subElement;
      }
      return result;
  }

  updateHeader(field, order) {
      this.subElements.header.querySelectorAll('.sortable-table__cell[data-sortable]').forEach((headerCell) => {
          headerCell.dataset.order = (headerCell.dataset.id === field) ? order : '';
      });
  }

  sort(field, order = 'desc') {
      if (this.isSortLocally) {
          this.sortTableData(field, order);
      }
      this.updateHeader(field, order)
      this.subElements.body.innerHTML = this.getBodyTable();
  }

  onHeaderClick = (e) => {
      const col = e.target.closest('[data-sortable=true]');
      if (!col) {
          return;
      }
      const revertedOrder = {
          'asc': 'desc',
          'desc': 'asc'
      };
      this.sort(col.dataset.id, revertedOrder[col.dataset.order]);
  }

  sortTableData(field, order = 'desc') {
      const column = this.headerConfig.find(column => column.id === field);
      if (!column.sortable) {
          return;
      }
      const directions = {
          asc: 1,
          desc: -1
      };
      const direction = directions[order];
      this.data.sort((a, b) => {
          if (column.sortType === 'string') {
              return direction * a[field].localeCompare(b[field], ['ru', 'en']);
          } else if (column.sortType === 'number') {
              return direction * (a[field] - b[field]);
          } else {
              return direction * (a[field] - b[field]);
          }
      });
  }
  
  defaultSort() {
      if (this.defaultSorting.id) {
          this.sortTableData(this.defaultSorting.id, this.defaultSorting.order);
          this.updateHeader(this.defaultSorting.id, this.defaultSorting.order);
          this.subElements.body.innerHTML = this.getBodyTable();
      }
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
      this.activeCols = null;
      this.templates = null;
      this.defaultSorting = null;
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
}
