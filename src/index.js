require("dotenv").config();
const db = require("./db");

const questionsRoutes = require("./routes/questionsRoutes");
const catRoutes = require("./routes/categoriesRoutes");
const express = require("express");
const app = express();

app.use(express.json());
app.use(express.static("public"));

app.use("/categories", catRoutes);
app.use("/questions", questionsRoutes);



app.post("/admin/login", (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ success: false, message: "no password provided" });
  }

  if (password === process.env.ADMIN_PASSWORD) {
    return res.json({ success: true });
  }

  return res.status(401).json({ success: false, message: "❌ wrong password po" });
});




console.log("Ooops error haha wews");

app.listen(3000, () => {
  console.log("kupal");
});

// async function testQuery() {
//   try {
//     await client.connect();

//     console.log("Connected succesfully nigga!");

//     //test query
//     const res = await client.query("SELECT NOW()");
//     console.log("server time:", res.rows[0].now);

//     const all = await client.query("SELECT * FROM questions");

//     console.log(all.rows);
//   } catch (err) {
//     if (err.code == 23514) console.log("assigning wrong value");
//     else if (err.code == 42601) console.log("syntax error");
//     else if (err.code == 23502)
//       console.log(" dapat lahat na variable may value, check mo ulit hihi");
//     else console.log(bobo, err);
//   } finally {
//     await client.end();
//   }
// }

// testQuery();

// function isValidEquation(equation) {
//   let operators = [
//     { symbol: "*", isFound: false },
//     { symbol: "/", isFound: false },
//     { symbol: "-", isFound: false },
//     { symbol: "+", isFound: false },
//   ];

//   for (let operator of operators) {
//     for (let i = 0; i < equation.length; i++) {
//       let c = equation[i];

//       if (c == operator.symbol) {
//         let firstnum = "";
//         let secondnum = "";
//         let answer;
//         let countspace1 = "";
//         let countspace2 = "";
//         let store = "";

//         //find firsnum
//         for (let j = i - 1; j >= 0; j--) {
//           console.log(equation[j]);
//           if (!isNaN(Number(equation[j]))) {
//             firstnum = equation[j] + firstnum;
//             if (
//               (isNaN(Number(equation[j - 1])) || equation[j - 1] == " ") &&
//               equation[j - 1] != "-"
//             )
//               break;
//           } else if (equation[j] == " ") {
//             countspace1 += "";
//           } else if (equation[j] == "+") {
//             store = "+";
//             continue;
//           } else return false;
//         }

//         //find secondnum
//         for (let j = i + 1; j < equation.length; j++) {
//           console.log(equation[j]);
//           if (!isNaN(Number(equation[j])) || equation[j] == "-") {
//             secondnum += equation[j];
//             if (isNaN(Number(equation[j + 1])) || equation[j + 1] == " ") break;
//           } else if (equation[j] == " ") {
//             countspace2 += " ";
//           } else return false;
//         }

//         switch (operator.symbol) {
//           case "*":
//             answer = Number(firstnum) * Number(secondnum);
//             break;
//           case "/":
//             answer = Number(firstnum) / Number(secondnum);
//             break;
//           case "-":
//             answer = Number(firstnum) - Number(secondnum);
//             break;
//           case "+":
//             answer = Number(firstnum) + Number(secondnum);
//             break;
//         }

//         let str =
//           firstnum +
//           store +
//           countspace1 +
//           operator.symbol +
//           countspace2 +
//           secondnum;

//         console.log("equation :", equation);
//         console.log("replace str :", str, " by ", answer);
//         console.log(
//           firstnum + operator.symbol + secondnum + "=" + answer + "\n",
//         );
//         equation = equation.replace(str, String(answer));
//         console.log("equation :", equation);
//         // loop until all same operator are found
//         i = 0;
//       }
//     }
//   }

//   for (let i = 0; i < equation.length; i++) {
//     if (equation[i] == "=") {
//       let first = "";
//       let second = "";

//       //find firsnum
//       for (let j = i - 1; j >= 0; j--) {
//         if (equation[j] == " ") {
//           continue;
//         } else if (!isNaN(Number(equation[j]))) {
//           first = equation[j] + first;
//           if (isNaN(Number(equation[j - 1])) || equation[j - 1] == " ") break;
//         }
//       }

//       //find secondnum
//       for (let j = i + 1; j < equation.length; j++) {
//         if (equation[j] == " ") {
//           continue;
//         } else if (!isNaN(Number(equation[j]))) {
//           second += equation[j];
//           if (isNaN(Number(equation[j + 1])) || equation[j + 1] == " ") break;
//         }
//       }

//       console.log(first);
//       console.log(second);
//       if (first == second) {
//         return true;
//       }
//     }
//   }

//   return false;
// }

// function isPrime(num) {
//   if (num == 1 || num == 2) return true;
//   else {
//     for (let i = 2; i < num; i++) {
//       if (num % i == 0) return false;
//     }
//     return true;
//   }
// }
// let is = isPrime(99);

// console.log(is);

// function palindromeLocator(str) {
//   let strlen = str.length;
//   let strCpy = "";

//   for (let i = strlen - 1; i >= 0; i--) {
//     strCpy += str[i];
//   }
//   console.log(strCpy);
//   if (strCpy == str) {
//     let remainder = strlen % 2;
//     let index = strlen / 2;

//     if (remainder == 0) {
//       let middleChar = str[index - 1] + str[index];
//       return middleChar;
//     }
//     if (remainder == 1) {
//       let middleChar = str[index];
//       console.log(remainder);
//       console.log(middleChar);
//       return middleChar;
//     }
//   } else return "none";

//   return str;
// }

// function largestOfAll(arr) {
//   let largestNumArr = [];

//   for (let i = 0; i < arr.length; i++) {
//     let c = arr[i];
//     let largest = c[0];

//     for (let j = 0; j < c.length; j++) {
//       if (c[j] > largest) {
//         largest = c[j];
//       }
//     }

//     largestNumArr.push(largest);
//   }

//   return largestNumArr;
// }

// const neww = largestOfAll([
//   [4, 5, 1, 3],
//   [13, 27, 18, 26],
//   [32, 35, 37, 39],
//   [1000, 1001, 857, 1],
// ]);

// console.log(neww);
