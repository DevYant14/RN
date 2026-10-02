// le pongo la clase js al html para que el css sepa que el javascript esta funcionando
document.documentElement.classList.add("js");

document.addEventListener("DOMContentLoaded", function () {

    // menu del celular
    var botonMenu = document.getElementById("botonMenu");
    var menu = document.getElementById("menuPrincipal");

    botonMenu.addEventListener("click", function () {
        var abierto = menu.classList.toggle("abierto");
        botonMenu.setAttribute("aria-expanded", String(abierto));
    });

    // si hago clic en un enlace cierro el menu
    menu.querySelectorAll("a").forEach(function (enlace) {
        enlace.addEventListener("click", function () {
            menu.classList.remove("abierto");
            botonMenu.setAttribute("aria-expanded", "false");
        });
    });

    // titulo animado, separo las palabras para que salgan una por una
    document.querySelectorAll("[data-texto-animado]").forEach(function (titulo) {
        var palabras = titulo.textContent.trim().split(/\s+/);
        titulo.textContent = "";
        titulo.setAttribute("aria-label", palabras.join(" "));

        palabras.forEach(function (texto, i) {
            var span = document.createElement("span");
            span.className = "palabra";
            span.style.setProperty("--i", i);
            span.setAttribute("aria-hidden", "true");
            span.textContent = texto;
            titulo.appendChild(span);
            // el espacio entre palabras
            titulo.appendChild(document.createTextNode(" "));
        });
    });

    // la cinta de megatendencias, copio el contenido para que no se corte al repetirse
    var pista = document.getElementById("cintaPista");
    if (pista) {
        var copia = pista.cloneNode(true);
        Array.prototype.slice.call(copia.children).forEach(function (hijo) {
            hijo.setAttribute("aria-hidden", "true");
            pista.appendChild(hijo);
        });
    }

    // luz que sigue al mouse dentro de las tarjetas
    document.querySelectorAll(".tarjeta").forEach(function (tarjeta) {
        tarjeta.addEventListener("mousemove", function (e) {
            var caja = tarjeta.getBoundingClientRect();
            tarjeta.style.setProperty("--x", (e.clientX - caja.left) + "px");
            tarjeta.style.setProperty("--y", (e.clientY - caja.top) + "px");
        });
    });

    // contador que sube hasta el numero cuando se ve en pantalla
    function animarContador(elemento) {
        var meta = parseFloat(elemento.getAttribute("data-valor"));
        var decimales = parseInt(elemento.getAttribute("data-decimales") || "0", 10);
        var duracion = 1600;
        var inicio = null;

        function paso(tiempo) {
            if (inicio === null) {
                inicio = tiempo;
            }
            var avance = Math.min((tiempo - inicio) / duracion, 1);
            // esto hace que al final vaya mas despacio
            var suave = 1 - Math.pow(1 - avance, 3);
            var valor = meta * suave;
            elemento.textContent = valor.toLocaleString("es-EC", {
                minimumFractionDigits: decimales,
                maximumFractionDigits: decimales
            });
            if (avance < 1) {
                requestAnimationFrame(paso);
            }
        }

        requestAnimationFrame(paso);
    }

    // mostrar las cosas cuando aparecen al hacer scroll
    var revelables = document.querySelectorAll(".revelar");

    if ("IntersectionObserver" in window) {
        var observador = new IntersectionObserver(function (entradas) {
            entradas.forEach(function (entrada) {
                if (!entrada.isIntersecting) {
                    return;
                }
                entrada.target.classList.add("visible");
                entrada.target.querySelectorAll(".contador").forEach(animarContador);
                observador.unobserve(entrada.target);
            });
        }, { threshold: 0.15 });

        revelables.forEach(function (el) {
            observador.observe(el);
        });
    } else {
        // si el navegador es viejo muestro todo de una vez
        revelables.forEach(function (el) {
            el.classList.add("visible");
            el.querySelectorAll(".contador").forEach(function (c) {
                c.textContent = c.getAttribute("data-valor");
            });
        });
    }

    // pestañas de los dos futuros
    var contenedorPestanias = document.getElementById("pestanias");
    var indicador = document.getElementById("indicador");
    var pestanias = Array.prototype.slice.call(document.querySelectorAll(".pestania"));
    var paneles = {
        favorable: document.getElementById("panel-favorable"),
        desfavorable: document.getElementById("panel-desfavorable")
    };

    // pongo el indicador debajo de la pestaña activa
    function moverIndicador() {
        var activa = document.querySelector('.pestania[aria-selected="true"]');
        if (!activa) {
            return;
        }
        indicador.style.width = activa.offsetWidth + "px";
        indicador.style.transform = "translateX(" + activa.offsetLeft + "px)";
    }

    function elegirFuturo(pestania) {
        var futuro = pestania.getAttribute("data-futuro");

        pestanias.forEach(function (p) {
            p.setAttribute("aria-selected", "false");
            p.setAttribute("tabindex", "-1");
        });
        paneles.favorable.hidden = true;
        paneles.desfavorable.hidden = true;

        pestania.setAttribute("aria-selected", "true");
        pestania.setAttribute("tabindex", "0");
        paneles[futuro].hidden = false;
        contenedorPestanias.setAttribute("data-activa", futuro);

        moverIndicador();
    }

    pestanias.forEach(function (pestania, i) {
        pestania.addEventListener("click", function () {
            elegirFuturo(pestania);
        });

        // con las flechas del teclado tambien se cambia
        pestania.addEventListener("keydown", function (e) {
            var siguiente = null;
            if (e.key === "ArrowRight") {
                siguiente = pestanias[(i + 1) % pestanias.length];
            } else if (e.key === "ArrowLeft") {
                siguiente = pestanias[(i - 1 + pestanias.length) % pestanias.length];
            }
            if (siguiente) {
                e.preventDefault();
                elegirFuturo(siguiente);
                siguiente.focus();
            }
        });
    });

    moverIndicador();
    window.addEventListener("resize", moverIndicador);
    // por si la fuente tarda en cargar y cambia el tamaño de los botones
    window.addEventListener("load", moverIndicador);

    // decisiones, aqui guardo lo que pasa con cada opcion
    // tipo buena nos acerca al futuro favorable y tipo mala al desfavorable
    var consecuencias = {
        1: {
            a: {
                tipo: "buena",
                texto: "Tu app funciona aunque se vaya el internet o la luz, gasta pocos datos y corre en celulares viejos. Más gente de la provincia puede usarla y se genera menos basura electrónica. El costo es que te toma más tiempo mantener la versión ligera."
            },
            b: {
                tipo: "mala",
                texto: "Tu app se ve moderna pero deja afuera a quienes no tienen buena conexión ni equipos nuevos, sobre todo en zonas rurales. Muchos usuarios cambian de celular y aumenta la basura electrónica. La brecha digital entre lo urbano y lo rural se hace más grande."
            }
        },
        2: {
            a: {
                tipo: "buena",
                texto: "La cooperativa atiende más rápido y las personas que hablan kichwa siguen siendo parte del servicio, con apoyo en su idioma. Tardas más en el diseño, pero la tecnología ayuda a la comunidad en lugar de reemplazarla."
            },
            b: {
                tipo: "mala",
                texto: "La atención se automatiza muy rápido, pero algunas personas pierden su trabajo y los clientes que hablan kichwa ya no son atendidos bien. Se pierde la confianza en la cooperativa y la desigualdad crece."
            }
        }
    };

    var elecciones = {};
    var botonesOpcion = document.querySelectorAll(".opcion");
    var resultado = document.getElementById("resultado");

    botonesOpcion.forEach(function (boton) {
        boton.addEventListener("click", function () {
            var numero = boton.getAttribute("data-decision");
            var eleccion = boton.getAttribute("data-eleccion");

            elecciones[numero] = eleccion;

            // dejo marcada solo la opcion que elegi en esa decision
            document.querySelectorAll('.opcion[data-decision="' + numero + '"]').forEach(function (op) {
                op.setAttribute("aria-pressed", "false");
            });
            boton.setAttribute("aria-pressed", "true");

            mostrarConsecuencia(numero, eleccion);
            revisarResultado();
        });
    });

    function mostrarConsecuencia(numero, eleccion) {
        var datos = consecuencias[numero][eleccion];
        var caja = document.getElementById("consecuencia" + numero);

        caja.className = "consecuencia consecuencia--visible consecuencia--" + datos.tipo;
        caja.innerHTML = "<strong>Consecuencia visible</strong>" + datos.texto;
    }

    // cuando ya respondi las dos muestro el resultado
    function revisarResultado() {
        if (!elecciones[1] || !elecciones[2]) {
            return;
        }

        var buenas = 0;
        if (consecuencias[1][elecciones[1]].tipo === "buena") {
            buenas++;
        }
        if (consecuencias[2][elecciones[2]].tipo === "buena") {
            buenas++;
        }

        var titulo = document.getElementById("resultadoTitulo");
        var texto = document.getElementById("resultadoTexto");

        if (buenas === 2) {
            titulo.textContent = "Tus decisiones te acercan al futuro favorable";
            texto.textContent = "Pensaste en la energía, en los equipos viejos y en las personas. Así se construye el escenario deseable, que no llega solo sino con decisiones.";
        } else if (buenas === 1) {
            titulo.textContent = "Tu camino queda en el escenario tendencial";
            texto.textContent = "Una decisión ayudó y la otra dejó a alguien afuera. Si las tendencias actuales siguen igual, el Ecuador de 2050 se parece más a este punto medio.";
        } else {
            titulo.textContent = "Tus decisiones te acercan al futuro desfavorable";
            texto.textContent = "Ignoraste el costo energético y a las personas que la tecnología puede dejar atrás. Es un futuro plausible, pero todavía se puede evitar si cambiamos de decisión.";
        }

        resultado.hidden = false;
    }

    // boton para volver a decidir
    document.getElementById("botonReiniciar").addEventListener("click", function () {
        elecciones = {};

        botonesOpcion.forEach(function (op) {
            op.setAttribute("aria-pressed", "false");
        });

        [1, 2].forEach(function (n) {
            var caja = document.getElementById("consecuencia" + n);
            caja.className = "consecuencia";
            caja.innerHTML = "";
        });

        resultado.hidden = true;
        document.getElementById("decisiones").scrollIntoView();
    });

    // capturas, cuando subo una imagen la muestro en su espacio
    document.querySelectorAll(".captura__entrada").forEach(function (entrada) {
        entrada.addEventListener("change", function () {
            var archivo = entrada.files[0];
            if (!archivo) {
                return;
            }

            var imagen = document.getElementById(entrada.getAttribute("data-destino"));
            var texto = imagen.parentNode.querySelector(".captura__texto");

            imagen.src = URL.createObjectURL(archivo);
            imagen.hidden = false;
            texto.hidden = true;
        });
    });

});
