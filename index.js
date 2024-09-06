
let getCurrentDisplay = '';
let dotUsed = false;
let lastInputOperator = false;
let numberPressed = false;
let initialMinusUsed = false;
let resultDisplayed = false;
let lastResult = null;  // Store the last result

function updateScreen(value) {
    if (resultDisplayed) {
        handleResultDisplayedState(value);
    } else {
        handleNormalState(value);
    }

    updateDisplay();
    updateEqualsButtonState();
}

function handleResultDisplayedState(value) {
    if (isInvalidResult(getCurrentDisplay)) {
        resetDisplay(value);
    } else if (isDigit(value) || value === '.') {
        clearDisplay();
        getCurrentDisplay = value;
        resetFlags(value);
    } else if (isOperator(value)) {
        resetFlags();
        getCurrentDisplay = lastResult + value;
        lastInputOperator = true;
    }
}

function handleNormalState(value) {
    if (!numberPressed) {
        handleInitialState(value);
    } else {
        handlePostNumberState(value);
    }
}

function handleInitialState(value) {
    if (value === '-' && !initialMinusUsed) {
        getCurrentDisplay += value;
        initialMinusUsed = true;
    } else if (isOperator(value) && initialMinusUsed) {
        clearDisplay();
    } else if (isDigit(value) || (value === '.' && !dotUsed)) {
        getCurrentDisplay += value;
        numberPressed = true;
        dotUsed = value === '.';
    }
}

function handlePostNumberState(value) {
    if (isDigit(value) || (value === '.' && !dotUsed)) {
        getCurrentDisplay += value;
        dotUsed = value === '.';
        lastInputOperator = false;
    } else if (isOperator(value)) {
        handleOperatorInput(value);
    }
}

function handleOperatorInput(value) {
    if (!lastInputOperator) {
        getCurrentDisplay += value;
    } else {
        replaceLastOperator(value);
    }
    lastInputOperator = true;
    dotUsed = false;
}

function replaceLastOperator(value) {
    getCurrentDisplay = getCurrentDisplay.slice(0, -1) + value;
}

function resetFlags(value = '') {
    resultDisplayed = false;
    dotUsed = value === '.';
    numberPressed = isDigit(value);
}

function performCalculation() {
    try {
        if (isOperator(getCurrentDisplay.slice(-1)) || getCurrentDisplay === '.' || getCurrentDisplay === '') {
            return;
        }

        let tokens = generateTokens(getCurrentDisplay);
        tokens = handlePrecedence(tokens, ['*', '%', '/']);
        let result = handlePrecedence(tokens, ['+', '-'])[0];

        result = validateResult(result);
        updateAfterCalculation(result);
    } catch (error) {
        handleCalculationError();
    }
}

function validateResult(result) {
    if (getCurrentDisplay.includes('0/0')  ) {
        return "Can't divide by zero";
    } else if (isNaN(result) || !isFinite(result)) {
        return 'Format Error';
    } else if (result.toString().includes('.')) {
        return parseFloat(result.toFixed(3));
    }
    return result;
}

function updateAfterCalculation(result) {
    getCurrentDisplay = result.toString();
    lastResult = getCurrentDisplay;
    resetFlags();
    numberPressed = true;
    resultDisplayed = true;
    updateDisplay();
}

function handleCalculationError() {
    getCurrentDisplay = '';
    document.getElementById('display').value = 'NaN';
}

function generateTokens(input) {
    let tokens = [];
    let currentNumber = '';
    let previousChar = null;

    for (let i = 0; i < input.length; i++) {
        let char = input[i];

        if (isDigit(char) || char === '.') {
            currentNumber += char;
        } else {
            if (currentNumber) {
                tokens.push(parseFloat(currentNumber));
                currentNumber = '';
            }

            if (char === '-' && (previousChar === null || !isDigit(previousChar))) {
                currentNumber = '-';
            } else {
                tokens.push(char);
            }
        }
        previousChar = char;
    }

    if (currentNumber) tokens.push(parseFloat(currentNumber));

    return tokens;
}

function handlePrecedence(tokens, operators) {
    let newTokens = [];
    let i = 0;

    while (i < tokens.length) {
        let token = tokens[i];

        if (typeof token === 'number') {
            newTokens.push(token);
        } else if (operators.includes(token)) {
            let num1 = newTokens.pop();
            let num2 = tokens[++i];
            newTokens.push(operate(num1, num2, token));
        } else {
            newTokens.push(token);
        }
        i++;
    }

    return newTokens;
}

function operate(num1, num2, operation) {
    switch (operation) {
        case '+': return num1 + num2;
        case '-': return num1 - num2;
        case '*': return num1 * num2;
        case '/': return num1 / num2;
        case '%': return num1 % num2;
        default: return num2;
    }
}

function isDigit(char) {
    return /\d/.test(char);
}

function isOperator(char) {
    return ['+', '-', '*', '%', '/'].includes(char);
}

function isInvalidResult(result) {
    return ['NaN', "Can't divide by zero", 'Format Error'].includes(result);
}

function clearDisplay() {
    getCurrentDisplay = '';
    dotUsed = false;
    lastInputOperator = false;
    numberPressed = false;
    initialMinusUsed = false;
    resultDisplayed = false;
    updateDisplay();
    updateEqualsButtonState();
}

function updateDisplay() {
    const displayElement = document.getElementById('display');
    displayElement.value = getCurrentDisplay;
    displayElement.scrollLeft = displayElement.scrollWidth;  // Scroll to the end
}

function updateEqualsButtonState() {
    const equalsButton = document.getElementById('equals');
    equalsButton.disabled = getCurrentDisplay === '' || !numberPressed;
}

function resetDisplay(value) {
    clearDisplay();
    getCurrentDisplay += value;
    resetFlags(value);
}

// Keyboard input handling
document.getElementById('display').addEventListener('keydown', function (e) {
    const key = e.key;
    const validKeys = '0123456789+-*/%=.';

    if (/^[a-zA-Z]$/.test(key)) {
        e.preventDefault();
        return;
    }

    if (key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
    } else if (validKeys.includes(key)) {
        e.preventDefault();
        updateScreen(key);
    } else if (key === 'Enter') {
        e.preventDefault();
        performCalculation();
    }
});

function handleBackspace() {
    if (getCurrentDisplay.length > 0) {
        const lastChar = getCurrentDisplay.slice(-1);
        if (lastChar === '.') dotUsed = false;
        if (isOperator(lastChar)) lastInputOperator = false;
        if (lastChar === '-') initialMinusUsed = false;

        getCurrentDisplay = getCurrentDisplay.slice(0, -1);
        updateDisplay();

        if (getCurrentDisplay === '') {
            clearDisplay();
        }
    }
}

document.getElementById('clear').addEventListener('click', clearDisplay);
document.getElementById('equals').addEventListener('click', () => {
    if (!document.getElementById('equals').disabled) {
        performCalculation();
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', updateEqualsButtonState);
document.getElementById('display').addEventListener('input', updateEqualsButtonState);


