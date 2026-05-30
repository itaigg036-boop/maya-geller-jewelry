(function () {
  const catalog = window.MAISON_LIORA_CATALOG;
  if (!catalog) return;

  const params = new URLSearchParams(window.location.search);
  const whatsappBase = `https://wa.me/${catalog.whatsapp}`;

  function productBySlug(slug) {
    return catalog.products.find((product) => product.slug === slug) || catalog.products[0];
  }

  function productsByCollection(collection) {
    return catalog.products.filter((product) => product.collection === collection);
  }

  function whatsappHref(product) {
    const text = `היי, אשמח לקבל פרטים על ${product.name}`;
    return `${whatsappBase}?text=${encodeURIComponent(text)}`;
  }

  function productCard(product) {
    return `
      <article class="product-card reveal">
        <a href="product.html?product=${product.slug}" class="product-image" aria-label="מעבר לעמוד ${product.name}">
          <img src="${product.images[0]}" alt="${product.name}" loading="lazy" />
        </a>
        <div class="product-card__body">
          <p class="product-meta">${product.material}</p>
          <h3>${product.name}</h3>
          <p>${product.short}</p>
          <strong>${product.price}</strong>
          <a class="button button--small magnetic" href="product.html?product=${product.slug}">פרטים נוספים</a>
        </div>
      </article>
    `;
  }

  function renderCollectionPage() {
    const shell = document.querySelector("[data-collection-page]");
    if (!shell) return;

    const collectionKey = params.get("collection") || "engagement";
    const collection = catalog.collections[collectionKey] || catalog.collections.engagement;
    const products = productsByCollection(collectionKey);

    document.title = `Maya Geller Jewelry | ${collection.title}`;
    shell.querySelector("[data-collection-kicker]").textContent = collection.kicker;
    shell.querySelector("[data-collection-title]").textContent = collection.title;
    shell.querySelector("[data-collection-description]").textContent = collection.description;
    shell.querySelector("[data-collection-image]").src = collection.heroImage;
    shell.querySelector("[data-collection-image]").alt = collection.title;
    shell.querySelector("[data-collection-count]").textContent = `${products.length} פריטים בקולקציה`;
    shell.querySelector("[data-collection-products]").innerHTML = products.map(productCard).join("");
  }

  function renderProductPage() {
    const shell = document.querySelector("[data-product-page]");
    if (!shell) return;

    const product = productBySlug(params.get("product"));
    const collection = catalog.collections[product.collection];
    const related = catalog.products
      .filter((item) => item.collection === product.collection && item.slug !== product.slug)
      .slice(0, 3);

    document.title = `Maya Geller Jewelry | ${product.name}`;
    shell.querySelector("[data-product-kicker]").textContent = product.kicker;
    shell.querySelectorAll("[data-product-name]").forEach((item) => {
      item.textContent = product.name;
    });
    shell.querySelector("[data-product-description]").textContent = product.description;
    shell.querySelector("[data-product-price]").textContent = product.price;
    shell.querySelector("[data-product-collection]").textContent = collection.title;
    shell.querySelector("[data-product-collection]").href = `collection.html?collection=${product.collection}`;
    document.querySelectorAll("[data-product-whatsapp]").forEach((link) => {
      link.href = whatsappHref(product);
    });
    shell.querySelector("[data-product-main-image]").src = product.images[0];
    shell.querySelector("[data-product-main-image]").alt = product.name;
    shell.querySelector("[data-product-materials]").innerHTML = product.materials
      .map((item) => `<li><span>${item}</span><strong>כלול</strong></li>`)
      .join("");
    shell.querySelector("[data-product-variations]").innerHTML = product.variations
      .map((item) => `<span>${item}</span>`)
      .join("");
    shell.querySelector("[data-product-thumbs]").innerHTML = product.images
      .map(
        (image, index) => `
          <button class="gallery-thumb ${index === 0 ? "is-active" : ""}" type="button">
            <img src="${image}" alt="${product.name} - תמונה ${index + 1}" />
          </button>
        `
      )
      .join("");
    shell.querySelector("[data-related-products]").innerHTML = related.map(productCard).join("");
  }

  function hydrateHomeProductLinks() {
    document.querySelectorAll("[data-product-link]").forEach((link) => {
      const product = productBySlug(link.dataset.productLink);
      link.href = `product.html?product=${product.slug}`;
    });

    document.querySelectorAll("[data-product-whatsapp-link]").forEach((link) => {
      const product = productBySlug(link.dataset.productWhatsappLink);
      link.href = whatsappHref(product);
    });
  }

  renderCollectionPage();
  renderProductPage();
  hydrateHomeProductLinks();
})();
