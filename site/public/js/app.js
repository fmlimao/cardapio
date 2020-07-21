if (typeof VueClient === 'undefined') {
    VueClient = {};
}

var App = new Vue({
    el: '#AppVue',
    data: {
        tenant: {
            name: 'Teste aqui',
        //     slug: '',
        //     whatsapp: '',
        //     opened: '',
        //     opened: false,
        //     businessHours: [],
        },
        products: {
            all: [],
            filterString: '',
            filtered: [],
        },
        categories: {
            all: [],
            filtered: [],
        },
        cart: {
            items: [
        //         {
        //             product: 'Produto 1',
        //             price: 9.95,
        //             amount: 2,
        //             total: 19.90,
        //         },
        //         {
        //             product: 'Produto 2',
        //             price: 5.50,
        //             amount: 3,
        //             total: 16.50,
        //         },
            ],
            total: 0,
        //     comments: '',
        //     client: {
        //         name: '',
        //         phone: '',
        //         cep: '',
        //         address: '',
        //         number: '',
        //         complement: '',
        //         neighborhood: '',
        //         city: '',
        //         state: '',
        //         reference: '',
        //     },
        //     payment: {
        //         type: '1',
        //         diff: '0',
        //         value: '',
        //     },
        },
    },
    mixins: [VueClient],
    watch: {
        'products.filterString': function (filterString) {
            App.filterProducts(filterString);
        },
        // 'cart.items.*.amount': function (amount) {
        //     console.log('amount', amount);
        // },
    },
    methods: {

        init: function () {
            App.getTenantData();
            App.getTenantProducts();
            App.generateProductsByCategory();
        },

        getTenantData: function () {
            App.tenant.name = db.name;
            App.tenant.slug = db.slug;
            App.tenant.whatsapp = db.whatsapp;
            App.tenant.orderHost = db.order_host;
            App.tenant.opened = db.opened;
            App.tenant.businessHours = db.business_hours;
        },

        getTenantProducts: function () {
            App.products.all = db.products;
            App.products.filtered = db.products;
        },

        filterProducts: function (filterString) {
            filterString = filterString.trim();

            if (!filterString) {
                App.products.filtered = App.products.all;
            } else {
                var filterArray = filterString.split(' ').map(function (item) {
                    return removeAccents(item.trim());
                }).filter(function (item) {
                    return item.trim();
                });

                var newList = App.products.all.reduce(function (a, c) {
                    var productName = removeAccents(c.product.trim());
                    var productDescription = c.description ? removeAccents(c.description) : '';
                    var productCategory = removeAccents(c.category);

                    var searchs = [];
                    for (var i in filterArray) {
                        var filter = filterArray[i];
                        var searchName = productName.search(eval(`/${filter}/gi`));
                        var searchDescription = productDescription.search(eval(`/${filter}/gi`));
                        var searchCategory = productCategory.search(eval(`/${filter}/gi`));
                        searchs.push(searchName !== -1 || searchDescription !== -1 || searchCategory !== -1);
                    }

                    searchs = searchs.filter(function (item) {
                        return item;
                    });

                    if (searchs.length == filterArray.length) {
                        a.push(c);
                    }

                    return a;
                }, []);

                App.products.filtered = newList;
            }

            App.generateProductsByCategory();
        },

        generateProductsByCategory: function (filter) {
            if (typeof filter === 'undefined') {
                App.generateProductsByCategory('all');
                App.generateProductsByCategory('filtered');
            } else {
                var categories = App.products[filter].reduce(function (a, c) {
                    if (typeof a[`cat_${c.category_id}`] === 'undefined') {
                        a[`cat_${c.category_id}`] = {
                            name: c.category,
                            products: [],
                        };
                    }

                    a[`cat_${c.category_id}`].products.push(c);

                    return a;
                }, {});

                App.categories[filter] = categories;
            }
        },

        checkProductInCart: function (product) {
            var productIndex = null;

            for (var i in App.cart.items) {
                if (App.cart.items[i].product_id == product.product_id) {
                    productIndex = i;
                }
            }

            return productIndex;
        },

        addToCart: function (product, amount) {
            var productIndex = App.checkProductInCart(product);

            amount = Number(amount);
            if (isNaN(amount)) amount = 0;
            amount = Math.floor(amount);

            if (!productIndex) {
                if (amount) {
                    App.cart.items.push({
                        product_id: product.product_id,
                        product: product.product,
                        price: product.price,
                        amount: amount,
                        total: amount * product.price,
                    });
                }
            } else {
                var newAmount = Number(App.cart.items[productIndex].amount) + Number(amount);
                if (newAmount) {
                    App.cart.items[productIndex].amount = newAmount;
                }
            }

            App.calcCart();
        },

        calcCart: function () {
            var cartTotal = 0;

            for (var i in App.cart.items) {
                var price = App.cart.items[i].price;
                var amount = App.cart.items[i].amount;

                var total = price * amount;
                total = Number(total.toFixed(2));

                App.cart.items[i].total = total;
                cartTotal += total
                cartTotal = Number(cartTotal.toFixed(2));
            }

            App.cart.total = cartTotal;
        },

        // searchCep: function () {
        //     App.cart.client.cep = App.cart.client.cep.replace(/\D+/g, '');

        //     if (App.cart.client.cep.length === 8) {
        //         // App.page.disabled = true;
        //         axios.get(`http://viacep.com.br/ws/${App.cart.client.cep}/json/`).then(function (response) {
        //             App.cart.client.address = response.data.logradouro;
        //             App.cart.client.neighborhood = response.data.bairro;
        //             App.cart.client.city = response.data.localidade;
        //             App.cart.client.state = response.data.uf;

        //             // App.page.disabled = false;
        //         });
        //     } else {
        //         alert('Informe o cep.');
        //     }
        // },

    },
});

$(document).ready(function () {
    App.init();

    // App.products.filterString = 'salada';

});

