import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
  constructor(productId) {
    this.productId = productId;
    this.defaultData = {
      title: '',
      description: '',
      subcategory: '',
      price: 0,
      quantity: 0,
      discount: 0,
      status: 0,
      images: []
    };

    this.subElements = {};
    this.productsUrl = new URL('api/rest/products', BACKEND_URL);
    this.categoriesUrl = new URL('api/rest/categories', BACKEND_URL);
  }

  async loadCategories() {
    const url = new URL(this.categoriesUrl.toString());
    url.searchParams.set('_sort', 'weight');
    url.searchParams.set('_refs', 'subcategory');
    return await fetchJson(url);
  }

  async loadProduct(id) {
    const url = new URL(this.productsUrl.toString());
    url.searchParams.set('id', id);
    return await fetchJson(url);
  }

  onSubmit = (event) => {
    event.preventDefault();
    this.save();
  }

  async save() {
    const [method, eventType] = this.productId ? ['PATCH', 'product-updated'] : ['PUT', 'product-saved'];

    const response = await fetchJson(this.productsUrl, {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(this.getProductData())
    });

    this.element.dispatchEvent(new CustomEvent(eventType, {
      detail: {
        response: response
      }
    }));
  }

  initEventListeners() {
    this.subElements.productForm.elements.uploadImage.addEventListener('click', this.uploadImage);
    this.subElements.productForm.addEventListener('submit', this.onSubmit);
  }

  async render() {
    const div = document.createElement('div');
    div.innerHTML = this.getProductForm;
    this.element = div.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    const promises = [
      this.loadCategories(),
      this.productId ? this.loadProduct(this.productId) : Promise.resolve([this.defaultData])
    ];

    try {
      const [categories, products] = await Promise.all(promises);
      const [product] = products;

      this.setProductData(product);

      this.subElements.productForm.elements.subcategory.innerHTML = this.getCategories(categories);
      this.subElements.imageListContainer.innerHTML = this.getProductImages(product.images);

    } catch (error) {
      console.error(error.message);
    }

    this.initEventListeners();

    return this.element;
  }

  getProductForm() {
    return `
        <div class="product-form">
            <form data-element="productForm" class="form-grid">
                <div class="form-group form-group__half_left">
                    <fieldset>
                        <label class="form-label">Название товара</label>
                        <input required="" type="text" name="title" id="title" class="form-control" placeholder="Название товара">
                    </fieldset>
                </div>
                <div class="form-group form-group__wide">
                    <label class="form-label">Описание</label>
                    <textarea required="" class="form-control" name="description" id="description" data-element="productDescription" placeholder="Описание товара"></textarea>
                </div>
                <div class="form-group form-group__wide" data-element="sortable-list-container">
                    <label class="form-label">Фото</label>
                    <div data-element="imageListContainer"></div>
                    <button type="button" name="uploadImage" class="button-primary-outline fit-content"><span>Загрузить</span></button>
                </div>
                <div class="form-group form-group__half_left">
                    <label class="form-label">Категория</label>
                    <select class="form-control" name="subcategory" id="subcategory"></select>
                </div>
                <div class="form-group form-group__half_left form-group__two-col">
                    <fieldset>
                        <label class="form-label">Цена ($)</label>
                        <input required="" type="number" name="price" id="price" class="form-control" placeholder="100">
                    </fieldset>
                    <fieldset>
                        <label class="form-label">Скидка ($)</label>
                        <input required="" type="number" name="discount" id="discount" class="form-control" placeholder="0">
                    </fieldset>
                </div>
                <div class="form-group form-group__part-half">
                    <label class="form-label">Количество</label>
                    <input required="" type="number" class="form-control" name="quantity" id="quantity" placeholder="1">
                </div>
                <div class="form-group form-group__part-half">
                    <label class="form-label">Статус</label>
                    <select class="form-control" name="status" id="status">
                        <option value="1">Активен</option>
                        <option value="0">Неактивен</option>
                    </select>
                </div>
                <div class="form-buttons">
                    <button type="submit" name="save" class="button-primary-outline">
                        Сохранить товар
                    </button>
                </div>
            </form>
        </div>
    `;
  }

  getCategories(data) {
    const categories = [];

    data.forEach(category => {
      category.subcategories.forEach(subCategory => {
        categories.push({
          id: subCategory.id,
          text: category.title + ' > ' + subCategory.title
        });
      });
    });

    return categories.map(({id, text}) => {
      return `
        <option value="${id}">${escapeHtml(text)}</option>
      `;
    }).join('');
  }

  getProductImages(data) {
    return `
        <ul class="sortable-list" data-element="imageList">
            ${data.map(image => this.getProductImage(image)).join('')}
        </ul>
    `;
  }

  getProductImage({url, source}) {
    return `
        <li class="products-edit__imagelist-item sortable-list__item" style="">
            <input type="hidden" name="url" value="${url}">
            <input type="hidden" name="source" value="${source}">
            <span>
                <img src="icon-grab.svg" data-grab-handle="" alt="grab">
                <img class="sortable-table__cell-img" alt="Image" src="${url}"><span>${source}</span>
            </span>
            <button type="button">
                <img src="icon-trash.svg" data-delete-handle="" alt="delete">
            </button>
        </li>
    `;
  }

  getSubElements(parent) {
    const result = {};

    for (const subElement of parent.querySelectorAll('[data-element]')) {
      result[subElement.dataset.element] = subElement;
    }
    return result;
  }

  uploadImage = () => {
    let fileInput = document.getElementById('imageUpload');

    if (!fileInput) {
      fileInput = document.createElement('input');
      fileInput.id = 'imageUpload';
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.hidden = true;
      fileInput.addEventListener('change', this.onChange);
      document.body.append(fileInput);
    }

    fileInput.click();
  }

  onChange = (event) => {
    const [file] = event.target.files;

    if (!file) {
      return;
    }

    const uploadImage = this.subElements.productForm.elements.uploadImage;

    uploadImage.classList.add('is-loading');
    uploadImage.disabled = true;

    const formData = new FormData();
    formData.append('image', file);

    fetchJson('https://api.imgur.com/3/image', {
      method: 'POST',
      headers: {
        Authorization: `Client-ID ${IMGUR_CLIENT_ID}`
      },
      body: formData,
      referrer: ''
    })
      .then(response => {
        this.imageList.push({url: response.data.link, source: file.name});
        this.subElements.imageListContainer.innerHTML = this.getProductImages(this.imageList);
      })
      .catch(error => console.error(error.message))
      .finally(() => {
        uploadImage.classList.remove("is-loading");
        uploadImage.disabled = false;
      });
  }

  getProductData() {
    const elements = this.subElements.productForm.elements;

    const product = {
      title: elements.title.value,
      description: elements.description.value,
      subcategory: elements.subcategory.value,
      price: Number(elements.price.value),
      quantity: Number(elements.quantity.value),
      discount: Number(elements.discount.value),
      status: Number(elements.status.value),
      images: this.imageList
    };

    if (this.productId) {
      product.id = this.productId;
    }

    return product;
  }

  setProductData(product) {
    const elements = this.subElements.productForm.elements;

    elements.title.value = product.title;
    elements.description.value = product.description;
    elements.subcategory.value = product.subcategory;
    elements.price.value = product.price;
    elements.quantity.value = product.quantity;
    elements.discount.value = product.discount;
    elements.status.value = product.status;

    this.imageList = product.images;
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