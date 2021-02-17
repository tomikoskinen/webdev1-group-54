const url = '/api/products';
const productsContainer = "products-container";
const template = document.querySelector('#product-template');
const notificationContainer = "notifications-container";

const getProducts = () => {
    getJSON(url).then(response => response.json())
            .then(data => {
                parseProductData(data);
            }).catch(err => {
                console.log('error: ', err);
            })
}

getProducts();

const parseProductData = (data) => {
    data.map(product => {
        const clone = template.content.cloneNode(true);
        const div = clone.querySelector('.item-row');
        const name = div.querySelector('.product-name');
        const description = div.querySelector('.product-description');
        const price = div.querySelector('.product-price');

        const addButton = div.querySelector('.add-button');
        addButton.setAttribute('id', `add-to-cart-${product._id}`);
        addButton.addEventListener('click', (e) => {
            addProductToCart(e.target.id);
        });

        div.setAttribute('id', `product-${product._id}`);
        name.setAttribute('id', `name-${product._id}`);
        name.innerHTML = product.name;
        description.setAttribute('id', `description-${product._id}`);
        description.innerHTML = product.description;
        price.setAttribute('id', `price-${product._id}`);
        price.innerHTML = product.price;
        
        document.querySelector(`#${productsContainer}`).appendChild(clone);
        
    });

};

const addProductToCart = (id) => {

    let productId = id.split('-')[3];

    let productName = document.getElementById(`name-${productId}`).innerHTML
    //store into sessionstorage as key-value pairs
    //productid = key, value=count
    //first check if storage contains value for the productid
    //if yes, update value
    //if no, create with value =1
    if(sessionStorage.getItem(productId) === null) {
        sessionStorage.setItem(productId, 1);
    } else {
        let value = parseInt(sessionStorage.getItem(productId));
        value += 1;
        sessionStorage.setItem(productId, value);
    }
    
    createNotification(`Added ${productName} to cart!`, notificationContainer, true);
};