# NetPractice Academy — Curso, tutorial y práctica de NetPractice para 42

<p align="center">
  <strong>Aprende IPv4, subnetting, máscaras CIDR y routing antes de resolver NetPractice.</strong><br>
  Una web local, visual y progresiva para estudiantes de 42 que empiezan desde cero.
</p>

<p align="center">
  <a href="README.md">Français</a> ·
  <a href="README_EN.md">English</a> ·
  <a href="README_ES.md"><strong>Español</strong></a>
</p>

## ¿Qué es NetPractice Academy?

**NetPractice** es un proyecto de redes de 42 centrado en direccionamiento IPv4, máscaras de subred, subnetting y routing. NetPractice Academy es un **tutorial interactivo de NetPractice para principiantes** que explica el razonamiento detrás de cada campo.

La idea no es memorizar respuestas, sino aprender a calcular rangos de red, detectar subredes que se solapan, elegir una gateway, leer una tabla de routing y comprobar el camino de ida y vuelta de un paquete.

> Esta es una herramienta comunitaria de aprendizaje. No es oficial, no está afiliada a 42 y no sustituye el subject ni los recursos oficiales de NetPractice.

## Funcionalidades

### Curso de redes para principiantes

Los módulos explican:

- hosts, switches, routers y paquetes;
- direcciones IPv4 y representación de 32 bits;
- máscaras de subred y notación **CIDR**;
- máscaras de `/24` a `/30`;
- dirección de red y broadcast;
- rangos de hosts utilizables;
- cómo saber si dos máquinas están en la misma subred;
- solapamiento de subredes;
- gateway por defecto;
- tablas de routing, next hop y `0.0.0.0/0`;
- un método repetible para resolver ejercicios de estilo NetPractice.

### Laboratorio visual de subnetting

El laboratorio convierte los cálculos en representaciones visuales:

- **¿Dónde cae esta IP?** — posición de una IPv4 dentro de su subred;
- **Máscara binaria** — bits de red frente a bits de host;
- **Solapamiento de subredes** — muestra el rango compartido exacto;
- **Dividir un /24** — bloques visuales de `/24` a `/30`;
- **¿Misma red?** — comparación gráfica de dos hosts;
- **Máscara más específica** — qué máscaras funcionan y cuál es óptima;
- **Ruta de un paquete** — camino de ida y vuelta pasando por gateways;
- **Referencia rápida** — CIDR y máscara decimal completa.

| CIDR | Máscara decimal | Tamaño de bloque | Hosts utilizables* |
|---|---|---:|---:|
| `/24` | `255.255.255.0` | 256 | 254 |
| `/25` | `255.255.255.128` | 128 | 126 |
| `/26` | `255.255.255.192` | 64 | 62 |
| `/27` | `255.255.255.224` | 32 | 30 |
| `/28` | `255.255.255.240` | 16 | 14 |
| `/29` | `255.255.255.248` | 8 | 6 |
| `/30` | `255.255.255.252` | 4 | 2 |

\*Usando el modelo IPv4 clásico empleado normalmente en este tipo de ejercicios.

### 21 ejercicios interactivos

La práctica se organiza en tres grupos:

- **Bases** — IPv4, máscaras, misma LAN y gateways;
- **NetPractice** — rutas estáticas, ruta por defecto, Internet, VLSM y solapamientos;
- **Complejo / Boss** — varios routers, varias LAN, enlaces de tránsito, agregación de rutas, VLSM denso y routing de ida/vuelta.

El validador diferencia entre:

```text
✅ Configuración válida — respuesta esperada
⚠️ Configuración funcional — respuesta distinta de la esperada
```

Esto es importante porque varias configuraciones pueden funcionar técnicamente aunque una de ellas sea la respuesta más precisa o eficiente.

Puedes escribir las máscaras como:

```text
/25
```

o como:

```text
255.255.255.128
```

## Idiomas

La web está disponible en:

- francés;
- inglés;
- español.

Usa el selector **FR / EN / ES** de la barra superior. La elección se guarda localmente en `localStorage`.

## Ejecutar en local

Requisitos:

- `make`;
- Python 3;
- un navegador moderno.

No hacen falta npm, frameworks JavaScript, Docker ni servicios externos.

```bash
make
```

El servidor se inicia y **abre automáticamente NetPractice Academy en el navegador predeterminado**.

Primero intenta `http://localhost:49242`. Si ese puerto está ocupado, el launcher selecciona automáticamente el siguiente puerto libre, abre la URL correcta y también la muestra en el terminal.

Puerto inicial personalizado:

```bash
make PORT=8000
```

Para iniciar el servidor **sin abrir automáticamente el navegador**:

```bash
make AUTO_OPEN=0
```

Ejecutar comprobaciones:

```bash
make check
```

## Recorrido recomendado

1. Lee el **Curso** en orden.
2. Usa el **Laboratorio** cuando una idea sea demasiado abstracta.
3. Prueba varias máscaras para comprender los rangos.
4. Completa los ejercicios de **Bases**.
5. Continúa con los escenarios **NetPractice**.
6. Termina con **Complejo / Boss**.
7. Si falla una ruta, sigue siempre el paquete en ambos sentidos.

## Ejemplo rápido de solapamiento

```text
Red A: 192.168.1.0/25
→ 192.168.1.0 a 192.168.1.127

Red B: 192.168.1.64/26
→ 192.168.1.64 a 192.168.1.127
```

El rango `.64` a `.127` pertenece a las dos redes, por lo que se solapan.

Una disposición válida sería:

```text
Red A: 192.168.1.0/25
→ .0 a .127

Red B: 192.168.1.128/26
→ .128 a .191
```

El visualizador incluido permite modificar estos valores y ver el conflicto directamente.

## Estructura

```text
.
├── Makefile
├── README.md
├── README_EN.md
├── README_ES.md
├── index.html
├── assets/
│   ├── css/style.css
│   └── js/
│       ├── network.js
│       ├── courses.js
│       ├── levels.js
│       ├── i18n.js
│       └── app.js
├── tools/serve.py
└── tests/smoke_test.py
```

Todo funciona localmente en el navegador.

## Preguntas frecuentes

### ¿Es un solucionario de los niveles oficiales de NetPractice?

No. Es un entorno de aprendizaje de los conceptos de red y de los patrones de resolución necesarios para NetPractice. El objetivo es comprender, no memorizar una lista de respuestas oficiales.

### ¿Cómo sé si dos IP están en la misma subred?

Aplica la misma máscara a ambas direcciones y compara su **dirección de red**. Si la dirección de red resultante es la misma, pertenecen a la misma subred para esa máscara.

### ¿Por qué `/25` puede funcionar si se espera `/26`?

Una subred más grande también puede contener los dos hosts. `/26` puede ser la red válida más específica, mientras que `/25` funciona pero reserva más direcciones. El entrenador explica explícitamente esta diferencia.

### ¿Por qué hay que comprobar el camino de vuelta?

Llegar al destino es solo la mitad de la comunicación. El lado remoto también necesita una ruta válida para volver al origen.

## Visibilidad en GitHub

Descripción sugerida del repositorio:

> Interactive NetPractice 42 tutorial: IPv4, subnetting, CIDR, routing, visual labs and 21 practice exercises for beginners.

Topics recomendados:

```text
42
42-school
netpractice
netpractice-42
ipv4
subnetting
cidr
networking
routing
subnet-mask
computer-networks
network-learning
```

Coinciden con búsquedas habituales como **NetPractice 42 tutorial**, **curso NetPractice**, **aprender subnetting**, **calculadora CIDR**, **máscara IPv4**, **tabla de routing** y **default gateway**.

## Contribuir

Se agradecen correcciones pedagógicas, nuevos visualizadores y nuevos escenarios. Mantén tres principios:

1. explicar antes de revelar la respuesta;
2. usar una representación visual cuando ayude a entender;
3. aceptar configuraciones técnicamente válidas y explicar cuándo otra respuesta es más precisa.

## Otros idiomas

- [README français](README.md)
- [English README](README_EN.md)
- [README en español](README_ES.md)

---

**Palabras clave:** NetPractice 42, tutorial NetPractice, curso NetPractice, IPv4, subnetting, CIDR, máscara de subred, gateway, routing, tabla de routing, VLSM, solapamiento de subredes, redes, 42 school.
