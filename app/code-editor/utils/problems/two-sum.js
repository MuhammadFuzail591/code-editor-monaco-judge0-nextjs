export const twoSumProblem = {
  
  mdxData: 'two-sum',
  
  defaultCode: `
function add(a, b) {
  //Your code here
  
}
  `,

  solutionCode: `
  function add(a, b) {
    //Your code here
    return a + b
  }`,

  language: "63",

  testCases: [
    { input: '1 2', expectedOutput: '3' },
    { input: '5 7', expectedOutput: '12' },
    { input: '0 0', expectedOutput: '0' },
    { input: '1 -1', expectedOutput: '0' }
  ],
  generateTestCode: userCode => {
    return `
         ${userCode} \n\n
          const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

readline.on('line', (line) => {
    const [a, b] = line.split(' ').map(Number);
    console.log(add(a, b));
    readline.close();
});
         
      `
  }
}
