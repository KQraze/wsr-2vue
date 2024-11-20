const MATRIX_CELL_INSTANCE = {
    opened: true,
    hasBomb: false,
    hasFlag: false,
    countBombOut: 0,
}

const ROW_COUNT = 8;
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
        >
            <template v-if="opened">
                <span v-if="hasBomb">&ast;</span>
                <span v-else-if="hasFlag">&para;</span>
                <span v-else-if="countBombOut">{{ countBombOut }}</span>
            </template>
        </td>
    `,
    methods: {
        clickHandler(e) {
            console.log(e)
        }
    }
})

const app = new Vue({
    el: '#app',
    template: `
        <section class="sapper">
            <h1>Сапёр</h1>
            <table class="gameplay">
                <tr v-for="row in matrix">
                    <sapper-cell v-for="cell in row" v-bind="cell" />
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
        initField() {
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
        }
    },
    created() {
        this.initField();
        // todo генерация по первому нажатию на ячейку
        this.generateBombs();
        this.calculateBombOut();

        oncontextmenu = (e) => {
            e.preventDefault();
        }
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

    for (let i = currI - 1; i < currI + 2; i++) {
        for (let j = currJ - 1; j < currJ + 2; j++) {
            if (i >= 0 && j >= 0 && i < ROW_COUNT && j < ROW_COUNT && array[i][j].hasBomb) count++;
        }
    }

    return count;
}