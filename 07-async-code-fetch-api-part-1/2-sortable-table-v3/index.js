import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
    constructor(headerConfig, { isSortLocally, data = [], sorted = {}, url, size = 30 } = {}) {
      this.headerConfig = headerConfig;
      this.data = Array.isArray(data) ? data : data.data;
      this.templates = {
          default: data => `<div class="sortable-table__cell">${data}</div>`
      };
      this.activeCols = [];
      this.sorted = sorted;
      this.subElements = {};
      this.url = url;
      this.loadedRows = 0;
      this.size = size;
      this.allDataLoaded = false;
      this.blockLoading = false;
      this.isSortLocally = isSortLocally;
      this.render();
      if (this.sorted.id) {
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
      window.addEventListener('scroll', this.onScrollLoad);
  }

  async initializeTableRows() {
      if (this.data.length) {
          this.subElements.body.innerHTML = this.getRowsTable();
          return;
      }
      const newData = await this.fetchRowsData({
          sort: this.sorted.id,
          order: this.sorted.order,
          start: this.loadedRows,
          end: this.loadedRows + this.size
      });

      if (!newData || !newData.length) {
          this.showEmptyPlaceholder();
          return;
      }
      this.data = newData;
      this.loadedRows += this.data.length;
      this.subElements.body.innerHTML = this.getRowsTable();
  }

  async fetchRowsData({
      embed = 'subcategory.category',
      sort = '',
      order = '',
      start = 0,
      end = this.size
  } = {}) {
      this.blockLoading = true;
      const url = new URL(this.url, BACKEND_URL);
      url.searchParams.set('_embed', embed);
      url.searchParams.set('_sort', sort);
      url.searchParams.set('_order', order);
      url.searchParams.set('_start', start);
      url.searchParams.set('_end', end);
      const rowsData = await fetchJson(url);
      this.blockLoading = false;
      return rowsData;
  }

  getRowsTable() {
      return this.data.map((rowData = {}) => {
          return `
              <a href="/products/${rowData.id || '#'}" class="sortable-table__row">
                  ${this.activeCols.map((col) => this.getCellTemplate(col)(rowData[col])).join('')}
              </a>
          `;
      }).join('');
  }

  getHeaderTable() {
		return this.headerConfig.map(({ id, title, sortable = false, template }) => {
			this.activeCols.push(id);
			if (template) { this.templates[id] = template; }
			return `
					<div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}">
							<span>${title}</span>
							<span data-element="arrow" class="sortable-table__sort-arrow">
									<span class="sort-arrow"></span>
							</span>
					</div>
			`;
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

  showLoading() {
      this.subElements.loading.style.display = 'block';
  }

  hideLoading() {
      this.subElements.loading.style.display = 'none';
  }

  showEmptyPlaceholder() {
      this.subElements.emptyPlaceholder.style.display = 'block';
  }

  updateHeaderCells(colId, order) {
      this.subElements.header.querySelectorAll('.sortable-table__cell[data-sortable]').forEach((headerCell) => {
          headerCell.dataset.order = (headerCell.dataset.id === colId) ? order : '';
      });
  }

  sort(id, order = 'desc') {
      if (this.isSortLocally) {
          this.sortOnClient(id, order);
      } else {
          this.sortOnServer(id, order);
      }
      this.updateHeaderCells(id, order);
      this.subElements.body.innerHTML = this.getRowsTable();
  }

  sortOnClient (id, order = 'desc') {
      const column = this.headerConfig.find(column => column.id === id);
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
              return direction * a[id].localeCompare(b[id], ['ru', 'en']);
          } else if (column.sortType === 'number') {
              return direction * (a[id] - b[id]);
          } else {
              return direction * (a[id] - b[id]);
          }
      });
  }

  async sortOnServer (id, order) {
      this.showLoading();
      const data = await this.fetchRowsData({
          sort: id,
          order: order,
          start: 0,
          end: this.loadedRows
      });
      if (!data || !data.length) {
          this.hideLoading();
          this.showEmptyPlaceholder();
          return;
      }
      this.data = data;
      this.subElements.body.innerHTML = this.getRowsTable();
      this.hideLoading();
  }

  defaultSort() {
      if (this.sorted.id) {
          this.sortOnClient(this.sorted.id, this.sorted.order);
          this.updateHeaderCells(this.sorted.id, this.sorted.order);
          this.subElements.body.innerHTML = this.getRowsTable();
      }
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

  onScrollLoad = async (e) => {
      const { bottom: tableBottom } = this.subElements.body.getBoundingClientRect();
      const threshold = 100;
      if (this.allDataLoaded || this.blockLoading) {
          return;
      }
      if (tableBottom - window.innerHeight > threshold) {
          return;
      }
      this.showLoading();
      const data = await this.fetchRowsData({
          sort: this.sorted.id,
          order: this.sorted.order,
          start: this.loadedRows,
          end: this.loadedRows + this.size
      });
      if (!data || !data.length) {
          this.allDataLoaded = true;
          this.isSortLocally = true;
          this.hideLoading();
          this.showEmptyPlaceholder();
          return;
      }
      this.loadedRows += data.length;
      this.data = [...this.data, ...data];
      this.subElements.body.innerHTML = this.getRowsTable();
      this.hideLoading();
  }

  defaultSort() {
      if (this.sorted.id) {
          this.sortOnClient(this.sorted.id, this.sorted.order);
          this.updateHeaderCells(this.sorted.id, this.sorted.order);
          this.subElements.body.innerHTML = this.getRowsTable();
      }
  }

  remove() {
      if (this.element) {
          this.element.remove();
      }
  }

  destroy() {
      this.remove();
      this.subElements = {};
      this.element = null;
      this.activeCols = null;
      this.templates = null;
      this.sorted = null;
      this.data = null;
  }

  async render() {
      const div = document.createElement('div');
      div.innerHTML =  `
          <div data-element="productsContainer" class="products-list__container">
              <div class="sortable-table">
                  <div data-element="header" class="sortable-table__header sortable-table__row">
                      ${this.getHeaderTable()}
                  </div>
                  <div data-element="body" class="sortable-table__body">
                  </div>
                  <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
                  <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
                      <div>
                          <p>No products satisfies your filter criteria</p>
                          <button type="button" class="button-primary-outline">Reset all filters</button>
                      </div>
                  </div>
              </div>
              <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
              <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
                  <div>
                      <p>No products satisfies your filter criteria</p>
                      <button type="button" class="button-primary-outline">Reset all filters</button>
                  </div>
              </div>
          </div>
      `
      this.element = div.firstElementChild;
      this.subElements = this.getSubElements();
      this.initEventListeners();
      await this.initializeTableRows();
  }
}
