
/**
 * Evaluates mathematical expressions from text
 * Handles basic arithmetic operations and some common mathematical functions
 */
export function evalMathExpression(text: string): number | null {
  // Remove all spaces and convert to lowercase for easier parsing
  const cleanedText = text.toLowerCase().replace(/\s+/g, '');
  
  // Check if the text contains mathematical operators or is a direct calculation request
  const mathOperators = /[\+\-\*\/\^\(\)]/;
  const mathKeywords = /(calculate|compute|solve|what is|evaluate|result of|math|equation|expression|sum of|difference of|product of|quotient of|factorial)/;
  
  if (!mathOperators.test(cleanedText) && !mathKeywords.test(text.toLowerCase())) {
    return null;
  }
  
  // Extract potential mathematical expressions
  let expression = '';
  
  // Try to extract expressions between "calculate" and punctuation
  const calculationMatch = text.match(/(?:calculate|compute|solve|what is|evaluate|result of)\s+([\d\+\-\*\/\^\(\)\s\.]+)/i);
  if (calculationMatch && calculationMatch[1]) {
    expression = calculationMatch[1].trim();
  } else {
    // Extract any sequence that looks like a mathematical expression
    const expressionMatch = text.match(/([\d\+\-\*\/\^\(\)\s\.]+)/);
    if (expressionMatch && expressionMatch[1]) {
      expression = expressionMatch[1].trim();
    }
  }
  
  if (!expression) {
    return null;
  }
  
  // Clean the expression by removing non-math characters
  expression = expression.replace(/[^0-9\+\-\*\/\^\(\)\.\s]/g, '');
  
  try {
    // Replace ^ with ** for exponentiation
    expression = expression.replace(/\^/g, '**');
    
    // Evaluate the expression
    // Note: This uses eval which is generally not recommended for security reasons,
    // but it's acceptable for a controlled mathematical expression evaluation
    // eslint-disable-next-line no-eval
    const result = eval(expression);
    
    // Make sure the result is a number
    if (typeof result !== 'number' || isNaN(result) || !isFinite(result)) {
      return null;
    }
    
    return result;
  } catch (error) {
    console.error("Error evaluating math expression:", error);
    return null;
  }
}

/**
 * Checks if a string appears to be a mathematical question
 */
export function isMathQuestion(text: string): boolean {
  const mathPatterns = [
    /calculate/i,
    /compute/i,
    /solve/i,
    /what is .* \+/i,
    /what is .* \-/i,
    /what is .* \*/i,
    /what is .* \//i,
    /what is .* \^/i,
    /what is .* plus/i,
    /what is .* minus/i,
    /what is .* times/i,
    /what is .* divided by/i,
    /what is .* squared/i,
    /what is .* cubed/i,
    /evaluate/i,
    /result of/i,
    /\d+\s*[\+\-\*\/\^]\s*\d+/,
    /square root of/i,
    /factorial of/i,
    /log of/i,
    /sin of/i,
    /cos of/i,
    /tan of/i,
  ];
  
  return mathPatterns.some(pattern => pattern.test(text));
}

/**
 * Returns the factorial of a number
 */
export function factorial(n: number): number {
  if (n < 0) return NaN;
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}
