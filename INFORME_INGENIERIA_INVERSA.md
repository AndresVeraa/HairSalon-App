# Informe de ingeniería inversa

## Simulador AFD de la válvula de control del tanque El Pórtico

**Proyecto:** HairSalon-App  
**Archivo ejecutable:** [`index.html`](./index.html)  
**Fecha:** 8 de octubre de 2026  
**Estado:** entregable funcional y autocontenido

## 1. Prompt y superagente empleado

### Prompt de generación

Se solicitó una aplicación web interactiva en un único archivo HTML5, con JavaScript vanilla y Tailwind CSS vía CDN, para simular el autómata finito determinista (AFD) de la válvula automática de entrada al tanque de distribución de agua potable de la Planta El Pórtico.

El prompt especificó:

- El modelo formal `M = (Q, Σ, δ, X0, F)`.
- Los estados `X0` a `X4`, con `X4` como estado final de emergencia.
- Los seis símbolos de entrada: `cmd_abrir`, `fin_apertura`, `cmd_cerrar`, `fin_cierre`, `falla_alarma` y `reset`.
- La dinámica hidráulica de un tanque de 8.000 m³.
- Un grafo SVG, controles manuales y automáticos, registro de auditoría y tabla de transiciones.
- Una arquitectura desacoplada en módulos Modelo, Controlador y Vista.

### Superagente

El software fue generado y verificado mediante un asistente de IA usando **Copilot SDK en VS Code**, con revisión posterior de la lógica de estados, el grafo SVG y las interacciones en navegador.

## 2. Formalización del autómata

El autómata se define como:

```text
M = (Q, Σ, δ, X0, F)
```

### Conjunto de estados

```text
Q = {X0, X1, X2, X3, X4}
```

| Estado | Interpretación operacional |
|---|---|
| `X0` | Válvula cerrada; reposo seguro después de alcanzar nivel alto. |
| `X1` | Estado formal no representado visualmente; la interfaz opera directamente entre cerrada y abierta. |
| `X2` | Válvula totalmente abierta; entrada activa y llenado. |
| `X3` | Estado formal no representado visualmente; la interfaz opera directamente entre cerrada y abierta. |
| `X4` | Bloqueo de emergencia/falla; parada segura y estado de aceptación. |

### Alfabeto de entrada

```text
Σ = {
  cmd_abrir,
  fin_apertura,
  cmd_cerrar,
  fin_cierre,
  falla_alarma,
  reset
}
```

### Estado inicial y estado final

```text
X0 = estado inicial
F = {X4}
```

### Función de transición

La implementación usa un diccionario JavaScript equivalente a una tabla dispersa. La interfaz operativa simplificada no muestra ni anima `X1` y `X3`: abrir cambia directamente a `X2` y cerrar cambia directamente a `X0`. Las transiciones formales originales se conservan como referencia académica.

| Estado actual | `cmd_abrir` | `fin_apertura` | `cmd_cerrar` | `fin_cierre` | `falla_alarma` | `reset` |
|---|---|---|---|---|---|---|
| `X0` | `X1` | — | — | — | `X4` | — |
| `X1` | — | `X2` | — | — | `X4` | — |
| `X2` | — | — | `X3` | — | `X4` | — |
| `X3` | — | — | — | `X0` | `X4` | — |
| `X4` | `X4` | `X4` | `X4` | `X4` | `X4` | `X0` |

Las transiciones principales de operación son:

```text
δ(X0, cmd_abrir)     = X1
δ(X1, fin_apertura)  = X2
δ(X2, cmd_cerrar)    = X3
δ(X3, fin_cierre)    = X0
δ(Xi, falla_alarma)  = X4  para i ∈ {X0, X1, X2, X3, X4}
δ(X4, reset)         = X0
δ(X4, e)             = X4  para e ∈ {cmd_abrir, fin_apertura, cmd_cerrar, fin_cierre, falla_alarma}
```

## 3. Ingeniería inversa de la arquitectura

Todo el sistema está contenido en [`index.html`](./index.html), sin módulos externos de aplicación. Tailwind CSS se carga desde CDN y el comportamiento se implementa con JavaScript vanilla.

### 3.1 Capa Modelo

El módulo `Model` contiene:

- El diccionario `states`, con la descripción y el estado visual de cada estado.
- El arreglo `events`, que representa `Σ`.
- El diccionario `transitions`, que representa `δ`.
- La función `next(state, event)`, que consulta la transición habilitada.

Este módulo no manipula el DOM ni controla el reloj hidráulico.

### 3.2 Capa Controlador

El módulo `Controller` mantiene el estado mutable del proceso:

- `state`: estado actual del AFD.
- `level`: nivel del tanque en porcentaje.
- `outlet`: apertura de la válvula manual de salida.
- `mode`: modo `manual` o `auto`.
- `eventCount` y `logEntries`: trazabilidad de eventos.

La función `dispatch(event, source)` aplica una transición, genera el registro de auditoría y notifica a la Vista.

La válvula es estática en sus posiciones, pero el nivel del tanque sí se actualiza continuamente mediante un ciclo hidráulico:

- La válvula solo puede estar cerrada (`X0`) o abierta (`X2`).
- Las acciones de apertura y cierre son instantáneas.
- No se muestran posiciones intermedias ni se ejecutan animaciones de la válvula.
- Con `X2`, el nivel del tanque sube; con `X0`, el consumo de salida hace que baje.
- El nivel se actualiza cada 100 ms mediante `setInterval`.
- `X4` es un estado de bloqueo enclavado: cualquier evento distinto de `reset` mantiene el sistema en `X4`.
- Solo `reset`, después de despejar y verificar la alarma, permite volver a `X0`.

### 3.3 Capa Vista

El módulo `View` traduce el estado del controlador a la interfaz:

- Resalta el nodo SVG activo.
- Resalta `X4` con estilo de falla y doble círculo.
- Actualiza el nivel de agua y el volumen calculado.
- Muestra el estado de la válvula de entrada.
- Actualiza el log de auditoría.
- Resalta la celda de transición habilitada.
- Actualiza el indicador de modo manual/automático.

Las acciones **Abrir completamente** y **Cerrar completamente** cambian directamente entre las dos posiciones operativas:

```text
Abrir:  X0 → X2
Cerrar: X2 → X0
```

La interfaz muestra únicamente los comandos operativos `cmd_abrir`, `cmd_cerrar`, `falla_alarma` y `reset`; los eventos de fin de carrera quedan fuera de la operación visible para evitar estados intermedios.

## 4. Enlace funcional y despliegue

### Ejecución local

El archivo puede abrirse directamente:

```text
index.html
```

También puede ejecutarse mediante Vite:

```bash
npm install
npm run dev
```

La compilación verificada es:

```bash
npm run build
```

### GitHub Pages

Repositorio público asociado:

<https://github.com/AndresVeraa/HairSalon-App>

Para publicar el simulador:

1. Subir `index.html` y este informe a la rama principal del repositorio.
2. Entrar en **Settings → Pages**.
3. En **Build and deployment**, seleccionar **Deploy from a branch**.
4. Seleccionar la rama principal y la carpeta `/root`.
5. Guardar y esperar la publicación.

La URL prevista para el sitio es:

<https://andresveraa.github.io/HairSalon-App/>

La disponibilidad efectiva del enlace depende de que el propietario active GitHub Pages en la configuración del repositorio. El enlace local y el repositorio fuente ya están preparados para esa publicación.
