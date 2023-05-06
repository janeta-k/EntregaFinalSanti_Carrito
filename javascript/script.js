class ProductoController {
    constructor() {
        this.listaProductos = [];
        this.contenedor_productos = document.getElementById("contenedor_productos");
    }

    mostrarEnDOM() {
        this.listaProductos.forEach(producto => {
            this.contenedor_productos.innerHTML += `
            <div class="card" style="width: 18rem;">
                <img src="${producto.img}" class="card-img-top" alt="${producto.nombre}">
                <div class="card-body">
                    <h5 class="card-title">${producto.nombre}</h5>
                    <p class="card-text">$${producto.precio}</p>
                    <a href="#" onclick="agregarAlCarrito(${producto.id})" class="btn btn-primary">Agregar al Carro</a>
                </div>
            </div>`;
        });

    }
}

class CarritoController {
    constructor() {
        this.listaCarrito = [];
        this.contenedor_carrito = document.getElementById("contenedor_carrito");
        this.calculo_total = document.getElementById("total");
    }

    guardarEnStorage() {
        let listaCarritoJSON = JSON.stringify(this.listaCarrito);
        localStorage.setItem("listaCarrito", listaCarritoJSON);
    }

    verificarExistenciaEnStorage() {
        this.listaCarrito = JSON.parse(localStorage.getItem("listaCarrito")) || [];

        if (this.listaCarrito.length > 0) {
            this.mostrarEnDom();
        }
    }

    limpiarCarritoEnStorage() {
        localStorage.removeItem("listaCarrito");
    }

    agregar(producto) {
        this.listaCarrito.push(producto);
    }

    limpiar() {
        this.contenedor_carrito.innerHTML = "";
        this.calculo_total.innerHTML = "";
    }

    mostrarEnDom() {
        this.limpiar();

        this.listaCarrito.forEach(producto => {
            this.contenedor_carrito.innerHTML += `
        <div class="card mb-1 p-0" style="max-width: 100%;">
            <div class="row g-0">
              <div class="col-md-4">
                <img src="${producto.img}" class="img-fluid rounded-center" alt="${producto.nombre}">
              </div>
              <div class="col-md-8">
                <div class="card-body">
                  <h5 class="card-title">${producto.nombre}</h5>
                  <p class="card-text mb-1"><strong>Cantidad:</strong> ${producto.cantidad}</p>
                  <p class="card-text mb-2"><strong>Precio:</strong> $${producto.precio}</p>
                  <div class="btn-group" role="group" aria-label="Basic example">
                  <a href="#" onclick="disminuirCantidad(${producto.id})" class="card-button btn btn-secondary">-</a>
                  <a href="#" onclick="incrementarCantidad(${producto.id})" class="card-button btn btn-success">+</a>
                  <a href="#" onclick="quitarProducto(${producto.id})" class="card-button btn btn-danger">x</a>
              </div>
                </div>
              </div>
            </div>
        </div>`;
        });

        this.mostrarTotalEnDom();
    }

    precioTotal() {
        let sumatoria_total = 0;

        for (let i = 0; i < this.listaCarrito.length; i++) {
            sumatoria_total += this.listaCarrito[i].precio * this.listaCarrito[i].cantidad;
        }

        return sumatoria_total;
    }

    mostrarTotalEnDom() {
        this.calculo_total.innerHTML = this.precioTotal();
    }
}

const controladorProductos = new ProductoController();
controladorProductos.mostrarEnDOM();

//Promesa de productos.json
const getProductos = async () => {
    try {
        const respuesta = await fetch('../json/productos.json');
        const jsonProductos = await respuesta.json();

        controladorProductos.listaProductos = jsonProductos.tecnologia;
        controladorProductos.mostrarEnDOM();
    } catch (error) {
        console.log(error.message);
    }
}
getProductos();

const controladorCarrito = new CarritoController();
controladorCarrito.verificarExistenciaEnStorage();

//Función que llama a 3 métodos de CarritoController
function mostrarCarrito() {
    controladorCarrito.mostrarEnDom();
    controladorCarrito.precioTotal();
    controladorCarrito.guardarEnStorage();
}

//Funciones del carrito
function agregarAlCarrito(id) {
    let producto = controladorProductos.listaProductos.find(producto => producto.id == id);
    console.log(producto);
    let productoCarrito = controladorCarrito.listaCarrito.find(producto => producto.id == id);
    console.log(productoCarrito);

    let booleano = controladorCarrito.listaCarrito.some(producto => producto.id == id);

    if (booleano) {
        productoCarrito.cantidad++;
        mostrarCarrito();
    } else {
        controladorCarrito.agregar(producto);
        mostrarCarrito();
    }
    Toastify({
        text: "Se agregó al carrito",
        duration: 1500,
        destination: "https://github.com/apvarun/toastify-js",
        newWindow: true,
        gravity: "bottom", // `top` or `bottom`
        position: "right", // `left`, `center` or `right`
        stopOnFocus: true, // Prevents dismissing of toast on hover
        style: {
            background: "linear-gradient(to right, #00b09b, #96c93d)",
        },
        onClick: function () { } // Callback after click
    }).showToast();

}


function incrementarCantidad(id) {
    let producto = controladorCarrito.listaCarrito.find(producto => producto.id == id);

    producto.cantidad++;
    mostrarCarrito();
}

function disminuirCantidad(id) {
    let producto = controladorCarrito.listaCarrito.find(producto => producto.id == id);

    producto.cantidad--;

    if (producto.cantidad == 0) {
        quitarProducto(id);
    }

    mostrarCarrito();
}

function quitarProducto(id) {

    let producto = controladorCarrito.listaCarrito.find(producto => producto.id == id);
    producto.cantidad = 1;

    let indice = controladorCarrito.listaCarrito.findIndex(producto => producto.id == id);
    controladorCarrito.listaCarrito.splice(indice, 1);

    mostrarCarrito();
}

function pagar() {
    Swal.fire({
        title: '¿Estás seguro de realizar la compra?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        cancelButtonText: 'Cancelar',
        confirmButtonText: 'Sí, quiero pagar!'
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire(
                'Deleted!',
                'Your file has been deleted.',
                'success'
            );
            controladorCarrito.limpiar();
            controladorCarrito.limpiarCarritoEnStorage();

            controladorCarrito.listaCarrito = [];
            controladorCarrito.calculo_total.innerHTML = "<span>0</span>";

            Swal.fire({
                position: 'bottom-end',
                icon: 'success',
                title: 'Su compra se realizó exitosamente :)',
                showConfirmButton: false,
                timer: 2500
            });
        }
    });

}

