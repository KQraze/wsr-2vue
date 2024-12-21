const MATRIX_CELL_INSTANCE = {
    opened: false,
    hasBomb: false,
    hasFlag: false,
    countBombOut: 0,
}

const ROW_COUNT = 12;
const CELL_COUNT = ROW_COUNT ** 2;
const BOMB_COUNT = 10;

Vue.component('sapper-cell', {
    props: {
        opened: Boolean,
        hasBomb: Boolean,
        hasFlag: Boolean,
        countBombOut: Number,
    },
    data() {
        return {
            keysPressed: {
                mouseLeft: false,
                mouseRight: false
            }
        }
    },
    template: `
        <td 
            class="sapper-cell"
            :class="{ '_closed': !opened }"
            @click="clickHandler"
        >
            <span v-if="hasFlag">&para;</span>
            <template v-if="opened">
                <span v-if="hasBomb">&ast;</span>
                <span v-else-if="countBombOut">{{ countBombOut }}</span>
            </template>
        </td>
    `,
    methods: {
        clickHandler(e) {
            this.$emit('cell-clicked')
        }
    }
})

const app = new Vue({
    el: '#app',
    template: `
        <section class="sapper">
            <h1>Сапёр</h1>
            <table class="gameplay">
                <tr v-for="(row, currI) in matrix">
                    <sapper-cell 
                        v-for="(cell, currJ) in row" 
                        v-bind="cell" 
                        @cell-clicked="openCells(currI, currJ, matrix)"
                    />
                </tr>
            </table>
        </section>
    `,
    data() {
        return {
            matrix: []
        }
    },
    methods: {
        createFields() {
            for (let i = 0; i < ROW_COUNT; i++) this.matrix.push([]);
            this.matrix.map((row) => {
                for (let i = 0; i < ROW_COUNT; i++) row.push({ ...MATRIX_CELL_INSTANCE });
                return row;
            })
        },
        generateBombs() {
            const bombs = generateIndexBombs();

            this.matrix.map((row, rowIndex) => row.map((cell, cellIndex) => {
                if (bombs.includes((rowIndex * ROW_COUNT) + cellIndex)) cell.hasBomb = true
            }))
        },
        calculateBombOut() {
            for (let i = 0; i < ROW_COUNT; i++) {
                for (let j = 0; j < ROW_COUNT; j++) {
                    this.matrix[i][j].countBombOut = checkBombOut(i, j, this.matrix)
                }
            }
        },
        openCells(currI, currJ, array) {
            const openCell = (i, j, fromClick = false) => {
                if (!array[i][j].hasBomb) {
                    array[i][j].opened = true;
                }

                return array[i][j].countBombOut;
            }
            let countOut = openCell(currI, currJ, true);
            if (!countOut) checkCellsOut(currI, currJ, array, openCell)

        }
    },
    created() {
        this.createFields();
        // todo генерация по первому нажатию на ячейку
        this.generateBombs();
        this.calculateBombOut();

    }
})

function getRandom(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function generateIndexBombs() {
    let bombs = [];

    const generateBomb = () => {
        let bomb = getRandom(0, CELL_COUNT);
        if (bombs.includes(bomb)) return generateBomb();

        return bomb;
    }

    for (let i = 0; i < BOMB_COUNT; i++) {
        bombs.push(generateBomb())
    }

    return bombs;
}

function checkBombOut(currI, currJ, array) {
    let count = 0;

    checkCellsOut(currI, currJ, array, (i, j) => array[i][j].hasBomb ? count++ : null)

    return count;
}

function checkCellsOut(currI, currJ, array, callbackFn) {
    for (let i = currI - 1; i < currI + 2; i++) {
        for (let j = currJ - 1; j < currJ + 2; j++) {
            if (i >= 0 && j >= 0 && i < ROW_COUNT && j < ROW_COUNT) callbackFn(i, j);
        }
    }
}