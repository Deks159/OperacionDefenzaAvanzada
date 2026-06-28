# Adivinador de Secuencia de Colores

Página web simple para guardar una secuencia de colores en una misión de juego.

## Qué hace

- Permite elegir entre Verde, Azul, Rojo y Amarillo.
- Permite configurar la cantidad de colores/aciertos de la misión.
- La cantidad puede ser de 1 a 15.
- Si el color es correcto, lo guarda en la secuencia.
- Si el color es incorrecto, lo descarta solo para el paso actual.
- Muestra la secuencia correcta que debes repetir en el juego.
- Guarda el progreso en el navegador con `localStorage`.
- Funciona como página estática, ideal para GitHub Pages.

## Cómo usar

1. Abre `index.html`.
2. Configura la cantidad de colores de la misión.
3. Elige un color y pruébalo en el juego.
4. Marca si fue correcto o incorrecto.
5. Si fallaste, repite la secuencia guardada y prueba otro color disponible.
6. Completa la cantidad configurada.

## Subir a GitHub Pages

1. Crea un repositorio en GitHub.
2. Sube estos archivos:
   - `index.html`
   - `style.css`
   - `script.js`
3. En GitHub entra a:
   `Settings > Pages`
4. En `Branch`, selecciona `main` y `/root`.
5. Guarda y espera a que GitHub genere la URL.

## Cambiar el máximo

Por defecto el máximo es 15. Si quieres cambiarlo, abre `script.js` y modifica:

```js
const MAX_STEPS = 15;
```
