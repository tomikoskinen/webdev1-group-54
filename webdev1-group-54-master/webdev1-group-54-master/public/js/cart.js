const productsContainer = "cart-container";
const template = document.querySelector('#cart-item-template');
const notificationContainer = "notifications-container";

const exists = (product, selectedProducts) => {
    let e =  selectedProducts.findIndex(s => s.id === product._id)
    if(e < 0) {
        return false;
    } else {
        return [true, sessionStorage.getItem(product._id)];
    }
};

const getCartContents = (idsAndValues) => {
    getJSON('/api/products').then(response => response.json())
        .then(data => {
            let contents = [];
            data.map(product => {
                let isSelected = exists(product, idsAndValues)
                if(isSelected[0]) {
                    let tempItem = {
                        ...product,
                        count: isSelected[1]
                    }
                    contents.push(tempItem)
                }
            })
            renderCart(contents)
        }).catch(err => {
            console.log('error: ', err);
        })
}

const renderCart = (content) => {
    content.map(product => {
        const clone = template.content.cloneNode(true);
        const div = clone.querySelector('.item-row');
        const name = div.querySelector('.product-name');
        const amount = div.querySelector('.product-amount');
        const price = div.querySelector('.product-price');

        const buttons = div.getElementsByClassName('cart-minus-plus-button');
        Object.keys(buttons).map((key, index) => {
            let action = buttons[key].innerHTML.trim()
            if(action === '-') {
                action = 'minus';
            } else {
                action = 'plus';
            }
            buttons[key].setAttribute('id', `${action}-${product._id}`);
            buttons[key].addEventListener('click', (e) => {
                addOrRemoveFromCart(e.target.id, action);
            });    
        });

        div.setAttribute('id', `product-${product._id}`);
        name.setAttribute('id', `name-${product._id}`);
        name.innerHTML = product.name;
        amount.setAttribute('id', `amount-${product._id}`);
        amount.innerHTML = product.count + 'x';
        price.setAttribute('id', `price-${product._id}`);
        price.innerHTML = product.price;
        
        document.querySelector(`#${productsContainer}`).appendChild(clone);
        
    });
    document.getElementById('place-order-button').addEventListener(('click'), () => {
        placeOrder();
    });
};

const addOrRemoveFromCart = (id, action) => {
    if(action === 'minus') {
        decreaseProductCount(id.split('-')[1]);
    } else if(action === 'plus') {
        increaseProductCount(id.split('-')[1]);
    } else {
        console.log('unknown action');
    }
};

const increaseProductCount = (id) => {
    let value = parseInt(sessionStorage.getItem(id));
    value += 1;
    sessionStorage.setItem(id, value);
    let countElement = document.getElementById(`amount-${id}`);
    countElement.innerHTML = value +'x';
};

const decreaseProductCount = (id) => {

    let value = parseInt(sessionStorage.getItem(id));
    value -= 1;

    if(value > 0) {
        sessionStorage.setItem(id, value);
        let countElement = document.getElementById(`amount-${id}`);
        countElement.innerHTML = value+'x';
    } else {
        //remove element
        sessionStorage.removeItem(id);
        const productDiv = `product-${id}`;
        removeElement(productsContainer, productDiv);
    }
};

const placeOrder = () => {
    createNotification(`Succesfully created an order!`, notificationContainer, true);
    
    clearCart();
};

const clearCart = () => {
    Object.keys(sessionStorage).map(key => {
        let productDiv = `product-${key}`;
        removeElement(productsContainer, productDiv);
    });
    
    sessionStorage.clear();
};

const parseSessionStorage = () => {
    let productIds = [];
    if(sessionStorage.length > 0) {
        productIds = Object.keys(sessionStorage).map(key => {
            return {
                id: key,
                count: parseInt(sessionStorage.getItem(key))
            }
        })
    }

    getCartContents(productIds);
};

parseSessionStorage();
