import { Button, SliderElement, TextInput } from "./components/UILib.js";
import { MazeController2D, MazeController3D } from "./mazeController.js";
//This is all Function calling
let mazeController;
const settingsTab2DElement = document.getElementById("settingsTab2D");
const settingsTab3DElement = document.getElementById("settingsTab3D");
const settingsButton = new Button("settings");
const gridSizeSlider = new SliderElement("gridSize");
const numberChecker = (text) => {
    if (!(/^\d+$/.test(text))) {
        return false;
    }
    const number = parseInt(text);
    if (number < 1) {
        return false;
    }
    if (number > 15) {
        return false;
    }
    return true;
};
const dimensionalInput0 = new TextInput("dimensionSelector0", numberChecker);
const dimensionalInput1 = new TextInput("dimensionSelector1", numberChecker);
const dimensionalInput2 = new TextInput("dimensionSelector2", numberChecker);
dimensionalInput0.textValue = "15";
dimensionalInput1.textValue = "5";
dimensionalInput2.textValue = "15";
if (!settingsTab2DElement || !settingsTab3DElement) {
    throw new Error("Bruh moment");
}
const dimensionButton = document.getElementById("dimensionSelector");
if (!dimensionButton) {
    throw new Error("Bruh moment");
}
;
dimensionButton.addEventListener('click', () => {
    if (dimensionButton.innerHTML === "3D") {
        settingsButton.removeEventListener();
        dimensionButton.innerHTML = "2D";
        if (mazeController) {
            mazeController.remove();
        }
        mazeController = new MazeController3D("mazeWrapper");
        settingsButton.setEventListener(() => {
            const expandedState = settingsTab3DElement.getAttribute("expanded");
            if (expandedState === "true") {
                settingsTab3DElement.setAttribute("expanded", "false");
                settingsButton.interactiveElement.setAttribute("expanded", "false");
            }
            else {
                settingsTab3DElement.setAttribute("expanded", "true");
                settingsButton.interactiveElement.setAttribute("expanded", "true");
            }
        });
        mazeControllerSettings3D(mazeController, [dimensionalInput0, dimensionalInput1, dimensionalInput2]);
    }
    else {
        settingsButton.removeEventListener();
        dimensionButton.innerHTML = "3D";
        if (mazeController) {
            mazeController.remove();
        }
        mazeController = new MazeController2D("mazeWrapper");
        settingsButton.setEventListener(() => {
            const expandedState = settingsTab2DElement.getAttribute("expanded");
            if (expandedState === "true") {
                settingsTab2DElement.setAttribute("expanded", "false");
                settingsButton.interactiveElement.setAttribute("expanded", "false");
            }
            else {
                settingsTab2DElement.setAttribute("expanded", "true");
                settingsButton.interactiveElement.setAttribute("expanded", "true");
            }
        });
        mazeControllerSettings2D(mazeController, gridSizeSlider);
    }
});
dimensionButton.dispatchEvent(new Event('click'));
function mazeControllerSettings2D(mazeController, sliderElement) {
    mazeController.changeGridSize(sliderElement.getValue());
    sliderElement.setEventListener(() => {
        mazeController.changeGridSize(sliderElement.getValue());
    });
}
function mazeControllerSettings3D(mazeController, dimensionalInput) {
    mazeController.mazeModel.generateNewMaze('Empty Maze', [parseInt(dimensionalInput[0].currentValue), parseInt(dimensionalInput[1].currentValue), parseInt(dimensionalInput[2].currentValue)]);
    dimensionalInput.forEach((element) => {
        element.callbackFn = () => {
            const newValue = [parseInt(dimensionalInput[0].currentValue), parseInt(dimensionalInput[1].currentValue), parseInt(dimensionalInput[2].currentValue)];
            mazeController.mazeModel.generateNewMaze('Empty Maze', newValue.map((value) => value % 2 === 0 ? value + 1 : value));
        };
    });
}
