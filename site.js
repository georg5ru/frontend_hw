const filter = document.querySelector('.catalog-filter');

if (filter) {
  const toggle = filter.querySelector('.catalog-filter__toggle');
  const form = filter.querySelector('.catalog-filter__panel');
  const range = filter.querySelector('.catalog-filter__range');
  const [minInput, maxInput] = range.querySelectorAll('input[type="range"]');
  const [minOutput, maxOutput] = filter.querySelectorAll('.catalog-filter__range-values output');
  const sort = document.querySelector('#catalog-sort');
  const grid = document.querySelector('.catalog-page .product-grid');
  const emptyState = document.querySelector('.catalog-page__empty');
  const products = [...grid.querySelectorAll('.product-card')];
  const productOrder = new Map(products.map((product, index) => [product, index]));
  const formatPrice = new Intl.NumberFormat('ru-RU');

  const updateRange = (changedInput) => {
    let minValue = Number(minInput.value);
    let maxValue = Number(maxInput.value);

    if (minValue > maxValue) {
      if (changedInput === minInput) {
        maxInput.value = String(minValue);
        maxValue = minValue;
      } else {
        minInput.value = String(maxValue);
        minValue = maxValue;
      }
    }

    const rangeMaximum = Number(maxInput.max);
    range.style.setProperty('--from', `${(minValue / rangeMaximum) * 100}%`);
    range.style.setProperty('--to', `${(maxValue / rangeMaximum) * 100}%`);
    minOutput.value = formatPrice.format(minValue);
    maxOutput.value = formatPrice.format(maxValue);
  };

  const sortProducts = () => {
    const direction = sort.value;
    const sortedProducts = [...products].sort((first, second) => {
      if (direction === 'price-asc') {
        return Number(first.dataset.price) - Number(second.dataset.price);
      }

      if (direction === 'price-desc') {
        return Number(second.dataset.price) - Number(first.dataset.price);
      }

      return productOrder.get(first) - productOrder.get(second);
    });

    grid.append(...sortedProducts);
  };

  const applyFilters = () => {
    const selectedRooms = new Set(
      [...form.querySelectorAll('input[name="room"]:checked')].map((input) => input.value),
    );
    const selectedColors = new Set(
      [...form.querySelectorAll('input[name="color"]:checked')].map((input) => input.value),
    );
    const delivery = form.querySelector('input[name="delivery"]:checked').value;
    const minPrice = Number(minInput.value);
    const maxPrice = Number(maxInput.value);
    let visibleProducts = 0;

    for (const product of products) {
      const productRooms = product.dataset.rooms.split(' ');
      const productColors = product.dataset.colors.split(' ');
      const matches =
        Number(product.dataset.price) >= minPrice &&
        Number(product.dataset.price) <= maxPrice &&
        (selectedRooms.size === 0 || productRooms.some((room) => selectedRooms.has(room))) &&
        (selectedColors.size === 0 || productColors.some((color) => selectedColors.has(color))) &&
        (delivery === 'any' || product.dataset.delivery === delivery);

      product.hidden = !matches;
      visibleProducts += Number(matches);
    }

    emptyState.hidden = visibleProducts > 0;
  };

  toggle.addEventListener('click', () => {
    const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!isExpanded));
    form.hidden = isExpanded;
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    sortProducts();
    applyFilters();
    form.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.focus();
  });

  sort.addEventListener('change', sortProducts);
  minInput.addEventListener('input', () => updateRange(minInput));
  maxInput.addEventListener('input', () => updateRange(maxInput));

  document.addEventListener('click', (event) => {
    if (!filter.contains(event.target) && !form.hidden) {
      form.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !form.hidden) {
      form.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
      toggle.focus();
    }
  });

  updateRange();
}
