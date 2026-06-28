# Adivinador de Secuencia de Colores

Página web simple para guardar una secuencia de 10 colores en una misión de juego.

## Qué hace

- Permite elegir entre Verde, Azul, Rojo y Amarillo.
- Si el color es correcto, lo guarda en la secuencia.
- Si el color es incorrecto, lo descarta solo para el paso actual.
- Muestra la secuencia correcta que debes repetir en el juego.
- Guarda el progreso en el navegador con `localStorage`.
- Funciona como página estática, ideal para GitHub Pages.

## Cómo usar

1. Abre `index.html`.
2. Elige un color y pruébalo en el juego.
3. Marca si fue correcto o incorrecto.
4. Si fallaste, repite la secuencia guardada y prueba otro color disponible.
5. Completa 10 aciertos.

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
