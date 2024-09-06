let getCurrentDisplay = '';
let dotUsed = false;
let lastInputOperator = false;
let numberPressed = false;
let initialMinusUsed = false;
let resultDisplayed = false;
let lastResult = null;  // Store the last result

function updateScreen(value) {
    // If result is already displayed, clear on next valid input
    if (resultDisplayed) {
        if (isInvalidResult(getCurrentDisplay)) {
            clearDisplay();
            getCurrentDisplay += value;
            resultDisplayed = false;
            dotUsed = value === '.';  // Set dotUsed if the dot is pressed
            numberPressed = isDigit(value);
        } else if (isDigit(value) || value === '.') {
            clearDisplay();
            getCurrentDisplay += value;
            resultDisplayed = false;
            dotUsed = value === '.';  // Set dotUsed if the dot is pressed
            numberPressed = true;
        } else if (['+', '-', '*', '%', '/'].includes(value)) {
            resultDisplayed = false;
            getCurrentDisplay = lastResult;  // Retain previous result
            getCurrentDisplay += value;
            lastInputOperator = true;
            dotUsed = false;  // Reset dot usage after an operator
        }
    } else {
        // Handle initial state where only "-" is allowed first
        if (!numberPressed) {
            if (value === '-' && !initialMinusUsed) {
                // Allow initial minus and show it
                getCurrentDisplay += value;
                initialMinusUsed = true;
            } else if (['+', '*', '/', '%'].includes(value) && initialMinusUsed) {
                // Clear screen if another operator is pressed after initial minus
                clearDisplay();
            } else if (isDigit(value)) {
                numberPressed = true;
                getCurrentDisplay += value;
            } else if (value === '.' && !dotUsed) {
                getCurrentDisplay += value;
                dotUsed = true;
                numberPressed = true;
            }
        } else {
            // Normal operations after a number is pressed
            if (isDigit(value)) {
                getCurrentDisplay += value;
                lastInputOperator = false;
            } else if (value === '.' && !dotUsed) {
                getCurrentDisplay += value;
                dotUsed = true;
            } else if (['+', '-', '*', '%', '/'].includes(value)) {
                if (!lastInputOperator) {
                    getCurrentDisplay += value;
                } else {
                    // Replace the last operator if another operator is pressed
                    getCurrentDisplay = getCurrentDisplay.slice(0, -1) + value;
                }
                lastInputOperator = true;
                dotUsed = false;  // Reset dot usage after an operator
            }
        }
    }

    const displayElement = document.getElementById('display');
    displayElement.value = getCurrentDisplay;
    displayElement.scrollLeft = displayElement.scrollWidth;  // Scroll to the end
}

function clearDisplay() {
    getCurrentDisplay = '';
    dotUsed = false;
    lastInputOperator = false;
    numberPressed = false;
    initialMinusUsed = false;  // Reset initial minus state
    resultDisplayed = false;
    document.getElementById('display').value = getCurrentDisplay;
}

function performCalculation() {
    try {
        let tokens = tokenize(getCurrentDisplay);
        tokens = handlePrecedence(tokens, ['*', '%', '/']);
        let result = handlePrecedence(tokens, ['+', '-'])[0];

        // Handle division by 0
        if (getCurrentDisplay.includes('0/0')) {
            result = "Can't divide by zero";  // Display error message
        } else if (isNaN(result) || !isFinite(result)) {
            result = 'NaN';  // Display NaN for invalid results
        } else {
            // Limit decimal places to 3 if the result has a decimal point
            if (result.toString().includes('.')) {
                result = parseFloat(result.toFixed(3));
            }
        }

        getCurrentDisplay = result.toString();
        lastResult = getCurrentDisplay;
        document.getElementById('display').value = getCurrentDisplay;
        dotUsed = getCurrentDisplay.includes('.');
        lastInputOperator = false;
        numberPressed = true;
        resultDisplayed = true;  // Flag indicating result is displayed
    } catch (error) {
        document.getElementById('display').value = 'NaN';  // Display NaN for any error
        getCurrentDisplay = '';
    }
}

function tokenize(input) {
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

            // Handle negative numbers
            if (char === '-' && (previousChar === null || !isDigit(previousChar))) {
                currentNumber = '-';
            } else {
                tokens.push(char);
            }
        }
        previousChar = char;
    }

    if (currentNumber) {
        tokens.push(parseFloat(currentNumber));
    }

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
        case '+':
            return num1 + num2;
        case '-':
            return num1 - num2;
        case '*':
            return num1 * num2;
        case '/':
            return num1 / num2;
        case '%':
            return num1 % num2;
        default:
            return num2;
    }
}

function isDigit(char) {
    return /\d/.test(char);
}

function isInvalidResult(result) {
    return result === 'NaN' || result === "Can't divide by zero" || result === 'Error';
}

// Keyboard input handling
document.getElementById('display').addEventListener('keydown', function(e) {
    const key = e.key;
    const validKeys = '0123456789+-*/%=.';

    if (key === 'Backspace') {
        e.preventDefault();
        if (getCurrentDisplay.length > 0) {
            const lastChar = getCurrentDisplay.slice(-1);
            if (lastChar === '.') dotUsed = false;
            if (['+', '-', '*', '%', '/'].includes(lastChar)) lastInputOperator = false;
            if (lastChar === '-') initialMinusUsed = false;

            getCurrentDisplay = getCurrentDisplay.slice(0, -1);
            document.getElementById('display').value = getCurrentDisplay;

            if (getCurrentDisplay === '') {
                numberPressed = false;
                lastInputOperator = false;
                dotUsed = false;
                initialMinusUsed = false;
            }
        }
    } else if (validKeys.includes(key)) {
        e.preventDefault();
        updateScreen(key);
    } else if (key === 'Enter') {
        e.preventDefault();
        performCalculation();
    }
});

document.getElementById('clear').addEventListener('click', clearDisplay);
document.getElementById('equals').addEventListener('click', performCalculation);
