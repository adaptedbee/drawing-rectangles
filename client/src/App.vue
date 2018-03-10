<template>
  <div id='app'>
    <div id="container">
      <v-stage
        ref="stage"
        :config="configKonva">
        <v-layer
          ref="backgroundLayer"
          @mousedown="mouseDownOnContent">
          <v-rect ref="background" :config="configBackground"></v-rect>
        </v-layer>
        <v-layer
          ref="backLayer"
          @mousedown="mouseDownOnFigure"
          @dragend="dragEndFigure">
          <v-rect v-for="rectangle in rectangles" :key="rectangle.id" :config="rectangle"></v-rect>
        </v-layer>
        <v-layer
          ref="frontLayer"
          @mousedown="startDrawing"
          @mousemove="drawing"
          @mouseup="stopDrawing"
          @mouseout="stopDrawing"></v-layer>
      </v-stage>
    </div>

    <div class="buttons">
      <button
        class="delete-button delete-button--hidden"
        ref="deleteButton"
        v-on:click="deleteFigure">Delete</button>
    </div>
  </div>
</template>

<script>
import RectanglesService from '@/services/RectanglesService';

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function getRandomColor() {
  const r = randomInt(0, 255);
  const g = randomInt(0, 255);
  const b = randomInt(0, 255);
  return `rgb(${r}, ${g}, ${b})`;
}

const width = window.innerWidth;
const height = window.innerHeight;
const DEFAULT_OPACITY = 0.6;
let vm = {};

export default {
  name: 'App',
  data() {
    return {
      rectangles: [],
      configKonva: {
        container: 'container',
        width: width,
        height: height
      },
      configBackground: {
        x: 0,
        y: 0,
        width: width,
        height: height,
        fill: 'white'
      },
      state: {
        isDrawing: false,
        startPosition: null,
        width: 0,
        height: 0,
        color: 'rgb(0, 0, 0)',
        canvas: null,
        selectedFigureId: null,
        figureClickedFlag: false
      }
    }
  },
  methods: {
    startDrawing() {
      const stage = vm.$refs.stage.getStage();
      const state = vm.$data.state;
      const ctxFront = vm.$data.state.canvas.getContext('2d');

      state.isDrawing = true;
      state.startPosition = stage.getPointerPosition();

      state.color = getRandomColor();
      ctxFront.fillStyle = state.color;
    },
    drawing() {
      const stage = vm.$refs.stage.getStage();
      const state = vm.$data.state;
      const ctxFront = vm.$data.state.canvas.getContext('2d');
      const frontLayer = vm.$refs.frontLayer.getStage();

      if (!state.isDrawing) {
        return;
      }
      let currentPosition = stage.getPointerPosition();

      ctxFront.clearRect(0, 0, stage.getWidth(), stage.getHeight());
      state.width = currentPosition.x - state.startPosition.x;
      state.height = currentPosition.y - state.startPosition.y;
      ctxFront.fillRect(state.startPosition.x, state.startPosition.y, state.width, state.height);
      frontLayer.draw();
    },
    stopDrawing() {
      const stage = vm.$refs.stage.getStage();
      const state = vm.$data.state;
      const rectangles = vm.$data.rectangles;
      const ctxFront = vm.$data.state.canvas.getContext('2d');
      const frontLayer = vm.$refs.frontLayer.getStage();

      state.isDrawing = false;
      if (state.width === 0 || state.height === 0) {
        return;
      }

      const newRect = {
        x: state.startPosition.x,
        y: state.startPosition.y,
        width: state.width,
        height: state.height,
        fill: state.color,
        draggable: true,
        opacity: DEFAULT_OPACITY
      };
      RectanglesService.addNewRectangle(newRect)
        .then((response) => {
          let newRectangle = response.data.rectangle;
          if (newRectangle) {
            newRectangle.id = newRectangle._id;
            rectangles.push(newRectangle);
            console.log('Прямоугольник успешно добавлен');
          } else {
            console.log('Ошибка добавления прямоугольника');
          }
        });
      ctxFront.clearRect(0, 0, stage.getWidth(), stage.getHeight());
      state.width = 0;
      state.height = 0;
      frontLayer.hide();
    },
    mouseDownOnFigure(element) {
      const figure = element.getStage();
      const stage = vm.$refs.stage.getStage();
      const state = vm.$data.state;
      const deleteButton = vm.$refs.deleteButton;

      if (state.selectedFigureId !== figure.attrs._id) {
        if (state.selectedFigureId !== null) {
          const figureClicked = stage.findOne(`#${state.selectedFigureId}`);
          figureClicked.opacity(DEFAULT_OPACITY);
        }

        vm.$data.state.selectedFigureId = figure.attrs._id;
        figure.opacity(1);
        deleteButton.classList.remove('delete-button--hidden');
      } else {
        vm.$data.state.selectedFigureId = null;
        figure.opacity(DEFAULT_OPACITY);
        deleteButton.classList.add('delete-button--hidden');
      }
      vm.$data.state.figureClickedFlag = true;
    },
    mouseDownOnContent() {
      const state = vm.$data.state;
      const frontLayer = vm.$refs.frontLayer.getStage();

      if (state.figureClickedFlag) {
        state.figureClickedFlag = null;
        return;
      }
      frontLayer.show();
      frontLayer.draw();
      this.startDrawing();
    },
    updateRectangle(id, x, y) {
      RectanglesService.updateRectangle({id, x, y})
        .then((response) => {
          if (response.data.success) {
            console.log('Прямоугольник успешно обновлён');
          } else {
            console.log('Ошибка обновления прямоугольника');
          }
        });
    },
    dragEndFigure(element) {
      const figure = element.getStage();
      const state = vm.$data.state;
      const deleteButton = vm.$refs.deleteButton;

      this.updateRectangle(figure.attrs._id, figure.attrs.x, figure.attrs.y);
      figure.opacity(DEFAULT_OPACITY);
      state.selectedFigureId = null;
      deleteButton.classList.add('delete-button--hidden');
    },
    deleteFigure() {
      const stage = vm.$refs.stage.getStage();
      const backLayer = vm.$refs.backLayer.getStage();
      const state = vm.$data.state;
      const deleteButton = vm.$refs.deleteButton;

      const figureClicked = stage.findOne(`#${state.selectedFigureId}`);
      figureClicked.destroy();
      backLayer.draw();
      RectanglesService.deleteRectangle(state.selectedFigureId)
        .then((response) => {
          if (response.data.success) {
            console.log('Прямоугольник успешно удалён');
          } else {
            console.log('Ошибка удаления прямугольника');
          }
        });
      state.selectedFigureId = null;
      deleteButton.classList.add('delete-button--hidden');
    }
  },
  mounted() {
    vm = this;
    const stage = vm.$refs.stage.getStage();
    const frontLayer = vm.$refs.frontLayer.getStage();

    RectanglesService.fetchRectangles()
      .then((response) => {
        let rectanglesArray = response.data.rectangles;
        if (rectanglesArray) {
          rectanglesArray.forEach((rectangle) => {
            rectangle.id = rectangle._id;
          });
          vm.$data.rectangles = rectanglesArray;
        } else {
          console.log('Ошибка получения прямоугольников');
        }
      });

    vm.$data.state.canvas = document.createElement('canvas');
    vm.$data.state.canvas.width = stage.width();
    vm.$data.state.canvas.height = stage.height();
    const image = new Konva.Image({
      image: vm.$data.state.canvas,
      x: 0,
      y: 0
    });
    frontLayer.add(image);
    frontLayer.draw();
    frontLayer.hide();
  }
}
</script>

<style>
body {
  margin: 0;
  padding: 0;
  overflow: hidden;
}
#container {
  width: 100%;
  height: 100%;
  z-index: 10;
}
.buttons {
  position: absolute;
  left: 10px;
  top: 10px;
}
.delete-button--hidden {
  display: none;
}
</style>
